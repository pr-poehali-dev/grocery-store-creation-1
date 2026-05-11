import JSZip from "jszip";
import { saveAs } from "file-saver";

export type ProjectFiles = Record<string, string>;

const KEY = "muravey_project_files_v1";

export function loadFiles(): ProjectFiles {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveFiles(files: ProjectFiles) {
  localStorage.setItem(KEY, JSON.stringify(files));
}

export async function importZip(file: File): Promise<ProjectFiles> {
  const zip = await JSZip.loadAsync(file);
  const out: ProjectFiles = {};
  const entries = Object.values(zip.files);
  for (const entry of entries) {
    if (entry.dir) continue;
    if (entry.name.startsWith("__MACOSX")) continue;
    const ext = entry.name.split(".").pop()?.toLowerCase() || "";
    const textExt = ["html", "htm", "css", "js", "ts", "tsx", "jsx", "json", "md", "txt", "svg", "xml", "yml", "yaml"];
    if (textExt.includes(ext)) {
      out[entry.name] = await entry.async("string");
    }
  }
  saveFiles(out);
  return out;
}

export async function exportZip(files: ProjectFiles, name = "muravey-project.zip") {
  const zip = new JSZip();
  for (const [path, content] of Object.entries(files)) {
    zip.file(path, content);
  }
  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, name);
}

export function findIndexHtml(files: ProjectFiles): string | null {
  const keys = Object.keys(files);
  const exact = keys.find((k) => k.toLowerCase().endsWith("index.html"));
  if (exact) return files[exact];
  const anyHtml = keys.find((k) => k.toLowerCase().endsWith(".html"));
  return anyHtml ? files[anyHtml] : null;
}

export function filesContextForAi(files: ProjectFiles, maxChars = 12000): string {
  const entries = Object.entries(files);
  if (entries.length === 0) return "";
  let out = "В проект уже загружены файлы. Используй их как контекст:\n\n";
  for (const [path, content] of entries) {
    const chunk = `--- ${path} ---\n${content.slice(0, 4000)}\n\n`;
    if (out.length + chunk.length > maxChars) {
      out += `... (ещё ${entries.length} файлов опущено)\n`;
      break;
    }
    out += chunk;
  }
  return out;
}
