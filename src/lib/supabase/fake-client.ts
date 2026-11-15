import type { SupabaseClient } from "@supabase/supabase-js";
import { SHARED_PROJECT_RPC } from "./config";

// Test double of the few PostgREST, Auth and Storage calls the app makes; it enforces the same owner-only rules as the SQL policies
type Row = Record<string, unknown>;
type Result = { data: unknown; error: { message: string } | null };
type Action = { kind: "select" } | { kind: "update"; patch: Row } | { kind: "upsert"; row: Row } | { kind: "delete" };

export class FakeDb {
  userId: string | undefined;
  tables = new Map<string, Row[]>();
  files = new Map<string, Blob>();
  private users = 0;

  rows(table: string): Row[] {
    if (!this.tables.has(table)) this.tables.set(table, []);
    return this.tables.get(table) ?? [];
  }

  signIn(): string {
    this.users += 1;
    this.userId = `user-${this.users}`;
    return this.userId;
  }
}

const keyOf = (table: string) => (table === "photos" ? "path" : "id");
const denied = (): Result => ({ data: null, error: { message: "new row violates row-level security policy" } });
function omit(row: Row, ...keys: string[]): Row {
  return Object.fromEntries(Object.entries(row).filter(([key]) => !keys.includes(key)));
}

const withoutOwner = (row: Row) => omit(row, "owner_id");

class FakeQuery implements PromiseLike<Result> {
  private filters: [string, unknown][] = [];
  private sort?: { column: string; ascending: boolean };
  private single = false;

  constructor(private db: FakeDb, private table: string, private action: Action) {}

  select() {
    return this;
  }
  eq(column: string, value: unknown) {
    this.filters.push([column, value]);
    return this;
  }
  order(column: string, options?: { ascending?: boolean }) {
    this.sort = { column, ascending: options?.ascending ?? true };
    return this;
  }
  maybeSingle() {
    this.single = true;
    return this;
  }
  then<A = Result, B = never>(onFulfilled?: ((value: Result) => A | PromiseLike<A>) | null, onRejected?: ((reason: unknown) => B | PromiseLike<B>) | null): PromiseLike<A | B> {
    return Promise.resolve(this.run()).then(onFulfilled, onRejected);
  }

  private visible(): Row[] {
    const own = this.db.rows(this.table).filter((row) => row.owner_id === this.db.userId);
    return own.filter((row) => this.filters.every(([column, value]) => row[column] === value));
  }

  private run(): Result {
    if (this.action.kind === "select") return this.read();
    if (!this.db.userId) return denied();
    if (this.action.kind === "upsert") return this.upsert(this.action.row);
    const targets = this.visible();
    const all = this.db.rows(this.table);
    if (this.action.kind === "delete") this.db.tables.set(this.table, all.filter((row) => !targets.includes(row)));
    else for (const row of targets) Object.assign(row, this.action.patch);
    return { data: null, error: null };
  }

  private read(): Result {
    const rows = this.visible().map(withoutOwner);
    const sort = this.sort;
    if (sort) rows.sort((a, b) => String(a[sort.column]).localeCompare(String(b[sort.column])) * (sort.ascending ? 1 : -1));
    return { data: this.single ? (rows[0] ?? null) : rows, error: null };
  }

  private upsert(row: Row): Result {
    const key = keyOf(this.table);
    const existing = this.db.rows(this.table).find((item) => item[key] === row[key]);
    if (existing && existing.owner_id !== this.db.userId) return denied();
    if (existing) Object.assign(existing, row);
    else this.db.rows(this.table).push({ share_token: null, ...row, owner_id: this.db.userId });
    return { data: null, error: null };
  }
}

function sharedProject(db: FakeDb, token: unknown): unknown {
  const project = db.rows("projects").find((row) => row.share_token === token);
  if (!project) return null;
  const progress = db
    .rows("progress_entries")
    .filter((row) => row.project_id === project.id && row.owner_id === project.owner_id && row.approved)
    .sort((a, b) => String(b.recorded_at).localeCompare(String(a.recorded_at)));
  const photo = db.rows("photos").find((row) => row.kind === "progress" && progress.some((entry) => entry.id === row.entry_id));
  return { project: omit(project, "owner_id", "share_token"), progress: progress.map(withoutOwner), photo_path: photo?.path ?? null };
}

function fakeStorage(db: FakeDb) {
  return {
    from: () => ({
      upload: async (path: string, blob: Blob) => (db.userId && path.startsWith(`${db.userId}/`) ? (db.files.set(path, blob), { data: { path }, error: null }) : denied()),
      download: async (path: string) => (db.userId && path.startsWith(`${db.userId}/`) && db.files.has(path) ? { data: db.files.get(path), error: null } : { data: null, error: { message: "Object not found" } }),
      createSignedUrl: async (path: string) => ({ data: { signedUrl: `https://storage.test/${path}?token=signed` }, error: null }),
    }),
  };
}

export function createFakeSupabase(): { client: SupabaseClient; db: FakeDb } {
  const db = new FakeDb();
  const session = () => (db.userId ? { user: { id: db.userId, is_anonymous: true } } : null);
  const fake = {
    auth: {
      getSession: async () => ({ data: { session: session() }, error: null }),
      signInAnonymously: async () => ({ data: { user: { id: db.signIn() } }, error: null }),
    },
    from: (table: string) => ({
      select: () => new FakeQuery(db, table, { kind: "select" }),
      update: (patch: Row) => new FakeQuery(db, table, { kind: "update", patch }),
      upsert: (row: Row) => new FakeQuery(db, table, { kind: "upsert", row }),
      delete: () => new FakeQuery(db, table, { kind: "delete" }),
    }),
    rpc: async (name: string, args: { token: string }) => (name === SHARED_PROJECT_RPC ? { data: sharedProject(db, args.token), error: null } : { data: null, error: { message: "unknown function" } }),
    storage: fakeStorage(db),
  };
  return { client: fake as unknown as SupabaseClient, db };
}
