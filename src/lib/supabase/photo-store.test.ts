import { describe, expect, it } from "vitest";
import { createFakeSupabase } from "./fake-client";
import { downloadPlanImage, downloadProgressPhoto, uploadPlanImages, uploadProgressPhoto } from "./photo-store";

const blob = new Blob(["jpeg"], { type: "image/jpeg" });

describe("Supabase photo store", () => {
  it("stores plan sheets per level with their size and reads them back", async () => {
    const { client, db } = createFakeSupabase();
    await uploadPlanImages(client, [{ projectId: "p", level: 1, blob, width: 800, height: 600 }]);
    expect([...db.files.keys()]).toEqual(["user-1/plans/p/1"]);
    const image = await downloadPlanImage(client, "p", 1);
    expect(image).toMatchObject({ projectId: "p", level: 1, width: 800, height: 600 });
    expect(await downloadPlanImage(client, "p", 2)).toBeUndefined();
  });

  it("keeps site photos in the owner's folder only", async () => {
    const { client, db } = createFakeSupabase();
    expect(await downloadProgressPhoto(client, "e1")).toBeUndefined();
    await uploadProgressPhoto(client, "e1", blob);
    expect(await downloadProgressPhoto(client, "e1")).toBe(blob);
    db.signIn();
    expect(await downloadProgressPhoto(client, "e1")).toBeUndefined();
  });
});
