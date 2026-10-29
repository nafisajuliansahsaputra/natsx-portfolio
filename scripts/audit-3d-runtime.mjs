import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";

const root = process.cwd();
const sources = JSON.parse(await readFile(join(root, "config/scene-model-sources.json"), "utf8"));
const manifest = JSON.parse(await readFile(join(root, "src/data/scene-models.json"), "utf8"));
const optimizedBuild = process.argv.includes("--vercel") && process.env.VERCEL === "1";

// Generous ceilings relative to verified October 2026 production output.
// These are not quality targets. A later asset update that exceeds a ceiling
// should be consciously reviewed rather than silently increasing page weight.
const maximumByModel = {
  "attendance/imac": 1024 * 1024,
  "attendance/scanner": Math.ceil(3.3 * 1024 * 1024),
  "attendance/badge": 256 * 1024,
  "bast/macbook": Math.ceil(6.5 * 1024 * 1024),
  "bast/printer": 512 * 1024,
  "spall/phone": Math.ceil(3.2 * 1024 * 1024),
};
const maximumTotalBytes = 14 * 1024 * 1024;

function checkGlb(bytes, description) {
  if (bytes.length < 20 || bytes.toString("ascii", 0, 4) !== "glTF" ||
      bytes.readUInt32LE(4) !== 2 || bytes.readUInt32LE(8) !== bytes.length) {
    throw new Error("Invalid GLB header: " + description);
  }
  const jsonLength = bytes.readUInt32LE(12);
  if (jsonLength < 2 || jsonLength > bytes.length - 20 ||
      bytes.readUInt32LE(16) !== 0x4e4f534a) {
    throw new Error("Invalid GLB JSON chunk: " + description);
  }
  const json = JSON.parse(bytes.subarray(20, 20 + jsonLength).toString("utf8"));
  if (json.asset?.version !== "2.0" || !Array.isArray(json.scenes) ||
      !json.scenes.length || !Array.isArray(json.meshes) || !json.meshes.length) {
    throw new Error("GLB missing renderable scenes or meshes: " + description);
  }
  return { scenes: json.scenes.length, meshes: json.meshes.length };
}

if (!Array.isArray(sources) || sources.length !== 6) {
  throw new Error("Expected exactly six 3D model sources");
}
const seen = new Set();
let totalSource = 0;
let totalRuntime = 0;

for (const entry of sources) {
  const key = entry.group + "/" + entry.name;
  if (!(key in maximumByModel) || seen.has(key) ||
      !/^[a-z0-9-]+$/.test(entry.group) ||
      !/^[a-z0-9-]+$/.test(entry.name) ||
      !/^[a-z0-9-]+$/.test(entry.stem)) {
    throw new Error("Unknown, unsafe, or repeated model: " + key);
  }
  seen.add(key);

  const sourcePath = resolve(root, entry.source);
  const source = await readFile(sourcePath);
  checkGlb(source, "source " + entry.source);
  totalSource += source.length;

  const runtimeUrl = manifest[entry.group]?.[entry.name]?.runtime;
  if (typeof runtimeUrl !== "string" ||
      !/^\/runtime-models\/[a-z0-9-]+\/[a-z0-9-]+\.[a-f0-9]{12}\.glb$/.test(runtimeUrl) ||
      !runtimeUrl.startsWith("/runtime-models/" + entry.group + "/" + entry.stem + ".")) {
    throw new Error("Invalid versioned model URL: " + key);
  }
  const path = join(root, "public", ...runtimeUrl.slice(1).split("/"));
  const bytes = await readFile(path);
  checkGlb(bytes, "runtime " + runtimeUrl);
  const shortHash = createHash("sha256").update(bytes).digest("hex").slice(0, 12);
  if (!runtimeUrl.endsWith("." + shortHash + ".glb")) {
    throw new Error("Runtime file does not match checksum in URL: " + runtimeUrl);
  }

  if (optimizedBuild && bytes.length > maximumByModel[key]) {
    throw new Error("Runtime GLB exceeds reviewed budget: " + key + " bytes=" +
      bytes.length + " max=" + maximumByModel[key]);
  }
  totalRuntime += bytes.length;
  console.log("[3D audit] " + key + ": " + (bytes.length / 1048576).toFixed(2) +
    " MB, hash verified, renderable GLB");
}
if (seen.size !== Object.keys(maximumByModel).length) {
  throw new Error("Missing scene-model budget entry");
}
if (optimizedBuild && totalRuntime > maximumTotalBytes) {
  throw new Error("Total GLB runtime budget exceeded: " + totalRuntime);
}
console.log("[3D audit] PASS sources=" + sources.length + " sourceMiB=" +
  (totalSource / 1048576).toFixed(2) + " runtimeMiB=" +
  (totalRuntime / 1048576).toFixed(2) +
  " productionBudgetEnforced=" + optimizedBuild);
