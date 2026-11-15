const GLB_MAGIC = 0x46546c67;
const JSON_CHUNK = 0x4e4f534a;

type GltfJson = { nodes?: { name?: string }[]; meshes?: { name?: string }[] };

// Reads the JSON chunk of a binary glTF (header 12 bytes, then chunk length, chunk type and payload)
export function readGlbJson(bytes: Uint8Array): GltfJson {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (bytes.byteLength < 20 || view.getUint32(0, true) !== GLB_MAGIC) throw new Error("Not a GLB file");
  const chunkLength = view.getUint32(12, true);
  if (view.getUint32(16, true) !== JSON_CHUNK) throw new Error("GLB is missing its JSON chunk");
  return JSON.parse(new TextDecoder().decode(bytes.subarray(20, 20 + chunkLength))) as GltfJson;
}

export function readGlbObjectNames(bytes: Uint8Array): string[] {
  const json = readGlbJson(bytes);
  const names = [...(json.nodes ?? []), ...(json.meshes ?? [])].map((item) => item.name ?? "");
  return [...new Set(names.filter(Boolean))];
}
