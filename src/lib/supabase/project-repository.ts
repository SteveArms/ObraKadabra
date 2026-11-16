import type { SupabaseClient } from "@supabase/supabase-js";
import { getDemoProject, getSharedDemo, isDemoId } from "@/lib/projects/demos";
import { ProjectNotFoundError, ReadOnlyProjectError, type ProjectRepository } from "@/lib/projects/repository";
import { createShareToken } from "@/lib/projects/share-token";
import { ProgressEntrySchema } from "@/schemas/progress";
import { ProjectSchema } from "@/schemas/project";
import { PROGRESS_TABLE, PROJECTS_TABLE } from "./config";
import { PROGRESS_COLUMNS, PROJECT_COLUMNS, progressToRow, projectToRow, rowsTo, rowToProgress, rowToProject } from "./rows";
import { currentUser, ensureUserId } from "./session";
import { fetchSharedProject } from "./shared";

function check(error: unknown): void {
  if (error) throw error;
}

function supabaseSharing(client: SupabaseClient): Pick<ProjectRepository, "share" | "getShared"> {
  return {
    async share(projectId) {
      if (isDemoId(projectId)) return projectId;
      await ensureUserId(client);
      const { data, error } = await client.from(PROJECTS_TABLE).select("share_token").eq("id", projectId).maybeSingle();
      check(error);
      if (!data) throw new ProjectNotFoundError(projectId);
      if (typeof data.share_token === "string") return data.share_token;
      const token = createShareToken();
      check((await client.from(PROJECTS_TABLE).update({ share_token: token }).eq("id", projectId)).error);
      return token;
    },
    async getShared(token) {
      return getSharedDemo(token) ?? fetchSharedProject(client, token);
    },
  };
}

function supabaseProgress(client: SupabaseClient, signedIn: () => Promise<boolean>): Pick<ProjectRepository, "listProgress" | "saveProgress"> {
  return {
    async listProgress(projectId) {
      if (!(await signedIn())) return [];
      const { data, error } = await client.from(PROGRESS_TABLE).select(PROGRESS_COLUMNS).eq("project_id", projectId).order("recorded_at", { ascending: false });
      check(error);
      return rowsTo(data, rowToProgress);
    },
    async saveProgress(entry) {
      const valid = ProgressEntrySchema.parse(entry);
      await ensureUserId(client);
      check((await client.from(PROGRESS_TABLE).upsert(progressToRow(valid))).error);
      return valid;
    },
  };
}

// Row level security limits every query to the signed-in owner; without a session there is simply nothing to read yet
export function createSupabaseProjectRepository(client: SupabaseClient): ProjectRepository {
  const signedIn = async () => Boolean(await currentUser(client));
  return {
    async list() {
      if (!(await signedIn())) return [];
      const { data, error } = await client.from(PROJECTS_TABLE).select(PROJECT_COLUMNS).order("updated_at", { ascending: false });
      check(error);
      return rowsTo(data, rowToProject);
    },
    async get(id) {
      const demo = getDemoProject(id);
      if (demo || !(await signedIn())) return demo;
      const { data, error } = await client.from(PROJECTS_TABLE).select(PROJECT_COLUMNS).eq("id", id).maybeSingle();
      check(error);
      return data ? rowToProject(data) : undefined;
    },
    async save(project) {
      if (isDemoId(project.id)) throw new ReadOnlyProjectError(project.id);
      const valid = ProjectSchema.parse(project);
      await ensureUserId(client);
      check((await client.from(PROJECTS_TABLE).upsert(projectToRow(valid))).error);
      return valid;
    },
    async remove(id) {
      if (isDemoId(id)) throw new ReadOnlyProjectError(id);
      if (await signedIn()) check((await client.from(PROJECTS_TABLE).delete().eq("id", id)).error);
    },
    ...supabaseProgress(client, signedIn),
    ...supabaseSharing(client),
  };
}
