import JSZip from "jszip";
import { saveAs } from "file-saver";

export type ProjectFiles = Record<string, string>;

const KEY = "muravey_project_files_v1";
const META_KEY = "muravey_project_meta_v1";

export type ProjectSource = "zip" | "generated" | "self-edit" | "empty";
export type ProjectMeta = { source: ProjectSource; name: string; ts: number };

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

export function loadMeta(): ProjectMeta {
  try {
    const raw = localStorage.getItem(META_KEY);
    if (raw) return JSON.parse(raw);
  } catch {/* ignore */}
  return { source: "empty", name: "", ts: 0 };
}

export function saveMeta(meta: ProjectMeta) {
  localStorage.setItem(META_KEY, JSON.stringify(meta));
}

export function clearProject() {
  localStorage.removeItem(KEY);
  localStorage.removeItem(META_KEY);
  window.dispatchEvent(new Event("muravey:project-updated"));
}

const TEXT_EXT = ["html", "htm", "css", "js", "ts", "tsx", "jsx", "json", "md", "txt", "svg", "xml", "yml", "yaml", "mjs", "cjs", "vue", "py", "env", "gitignore", "lock"];

export async function importZip(file: File): Promise<ProjectFiles> {
  const zip = await JSZip.loadAsync(file);
  const out: ProjectFiles = {};
  const entries = Object.values(zip.files);
  for (const entry of entries) {
    if (entry.dir) continue;
    if (entry.name.startsWith("__MACOSX")) continue;
    if (entry.name.includes("/.DS_Store")) continue;
    // strip top-level wrapper folder if archive contains exactly one
    const path = entry.name;
    const ext = path.split(".").pop()?.toLowerCase() || "";
    if (!TEXT_EXT.includes(ext)) continue;
    out[path] = await entry.async("string");
  }
  // remove common single top-level folder prefix
  const normalized = stripCommonPrefix(out);
  saveFiles(normalized);
  saveMeta({ source: "zip", name: file.name.replace(/\.zip$/i, ""), ts: Date.now() });
  return normalized;
}

function stripCommonPrefix(files: ProjectFiles): ProjectFiles {
  const keys = Object.keys(files);
  if (keys.length === 0) return files;
  const firsts = new Set(keys.map((k) => k.split("/")[0]));
  if (firsts.size !== 1) return files;
  const prefix = [...firsts][0] + "/";
  if (!keys.every((k) => k.startsWith(prefix))) return files;
  const out: ProjectFiles = {};
  for (const k of keys) out[k.slice(prefix.length)] = files[k];
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
  // приоритет: корневой index.html → public/index.html → любой html
  const preferred = ["index.html", "public/index.html", "src/index.html"];
  for (const p of preferred) {
    const k = keys.find((x) => x.toLowerCase() === p);
    if (k) return files[k];
  }
  const anyHtml = keys.find((k) => k.toLowerCase().endsWith(".html"));
  return anyHtml ? files[anyHtml] : null;
}

export function findFile(files: ProjectFiles, ...names: string[]): { path: string; content: string } | null {
  const keys = Object.keys(files);
  for (const n of names) {
    const exact = keys.find((k) => k.toLowerCase() === n.toLowerCase());
    if (exact) return { path: exact, content: files[exact] };
  }
  for (const n of names) {
    const ends = keys.find((k) => k.toLowerCase().endsWith("/" + n.toLowerCase()));
    if (ends) return { path: ends, content: files[ends] };
  }
  return null;
}

// Полный список файлов в виде плоского дерева для контекста ИИ
export function flatTreeList(files: ProjectFiles): string {
  const keys = Object.keys(files).sort();
  if (keys.length === 0) return "(пусто)";
  return keys.map((k) => `  ${k}  (${files[k].length} b)`).join("\n");
}

export function filesContextForAi(files: ProjectFiles, maxChars = 14000): string {
  const entries = Object.entries(files);
  if (entries.length === 0) return "";
  let out = `В проект уже загружены ${entries.length} файлов. Структура:\n${flatTreeList(files)}\n\nСодержимое ключевых файлов:\n\n`;
  // приоритезируем index.html, App.tsx, package.json, *.tsx/jsx/css
  const priority = entries.sort(([a], [b]) => {
    const score = (k: string) => {
      const l = k.toLowerCase();
      if (l.endsWith("index.html")) return 0;
      if (l.endsWith("app.tsx") || l.endsWith("app.jsx")) return 1;
      if (l.endsWith("main.tsx") || l.endsWith("main.jsx")) return 2;
      if (l.endsWith("package.json")) return 3;
      if (l.endsWith(".tsx") || l.endsWith(".jsx")) return 4;
      if (l.endsWith(".css")) return 5;
      if (l.endsWith(".html")) return 6;
      return 9;
    };
    return score(a) - score(b);
  });
  for (const [path, content] of priority) {
    const chunk = `--- ${path} ---\n${content.slice(0, 4000)}\n\n`;
    if (out.length + chunk.length > maxChars) {
      out += `... (остальные файлы опущены, всего ${entries.length})\n`;
      break;
    }
    out += chunk;
  }
  return out;
}

// ── Virtual Mounting: построение HTML-превью из произвольного проекта ────────
// Если есть готовый index.html — берём его и инжектим зависимости (Tailwind/React CDN, import-map для пакетов).
// Если основной точкой входа является App.tsx/App.jsx — обёртываем в шаблон с Babel Standalone.
const KNOWN_DEPS: Record<string, string> = {
  react: "https://esm.sh/react@18",
  "react-dom": "https://esm.sh/react-dom@18",
  "react-dom/client": "https://esm.sh/react-dom@18/client",
  "react-router-dom": "https://esm.sh/react-router-dom@6",
  "lucide-react": "https://esm.sh/lucide-react@0.460.0",
  clsx: "https://esm.sh/clsx@2",
  sonner: "https://esm.sh/sonner@1",
};

function parsePackageDeps(pkgJson: string): string[] {
  try {
    const p = JSON.parse(pkgJson);
    return Object.keys({ ...(p.dependencies || {}), ...(p.devDependencies || {}) });
  } catch {
    return [];
  }
}

function buildImportMap(deps: string[]): string {
  const map: Record<string, string> = {};
  for (const d of deps) if (KNOWN_DEPS[d]) map[d] = KNOWN_DEPS[d];
  // base react/react-dom всегда нужны
  if (!map["react"]) map["react"] = KNOWN_DEPS.react;
  if (!map["react-dom"]) map["react-dom"] = KNOWN_DEPS["react-dom"];
  if (!map["react-dom/client"]) map["react-dom/client"] = KNOWN_DEPS["react-dom/client"];
  // неизвестные → esm.sh fallback
  for (const d of deps) if (!map[d]) map[d] = `https://esm.sh/${d}`;
  return `<script type="importmap">${JSON.stringify({ imports: map })}</script>`;
}

const CDN_INJECTOR = `
<!-- Muravey Virtual Mount CDN -->
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://unpkg.com/@babel/standalone@7.24.0/babel.min.js"></script>
<script>
  window.__MURAVEY_LOG__ = function(level, msg){
    try{ parent.postMessage({ type:'muravey:log', level: level, msg: String(msg) }, '*'); }catch(e){}
  };
  window.addEventListener('error', function(e){ window.__MURAVEY_LOG__('error', (e.message||'') + ' @ ' + (e.filename||'')+ ':' + (e.lineno||'')); });
  window.addEventListener('unhandledrejection', function(e){ window.__MURAVEY_LOG__('error', 'Promise: ' + (e.reason && e.reason.message || e.reason)); });
  (function(){
    var orig = console.error;
    console.error = function(){ window.__MURAVEY_LOG__('error', Array.from(arguments).join(' ')); orig.apply(console, arguments); };
    var w = console.warn;
    console.warn = function(){ window.__MURAVEY_LOG__('warn', Array.from(arguments).join(' ')); w.apply(console, arguments); };
    var l = console.log;
    console.log = function(){ window.__MURAVEY_LOG__('log', Array.from(arguments).join(' ')); l.apply(console, arguments); };
  })();
</script>
`.trim();

// inline-bundle: собираем все локальные .js/.jsx/.tsx как blob: модули и подменяем import-пути
function buildLocalModuleMap(files: ProjectFiles, deps: string[]): { blobMap: Record<string, string>; importMap: string } {
  const codeFiles = Object.entries(files).filter(([k]) => /\.(jsx?|tsx?|mjs)$/i.test(k));
  // готовим placeholder URL для каждого локального файла
  const placeholders: Record<string, string> = {};
  for (const [path] of codeFiles) {
    placeholders[path] = "blob:placeholder/" + path;
  }
  const blobMap: Record<string, string> = {};
  for (const [path, raw] of codeFiles) {
    let code = raw;
    // транспиляция через Babel Standalone (поддержит JSX/TS)
    try {
       
      const Babel = (window as unknown as { Babel?: { transform: (code: string, opts: unknown) => { code: string } } }).Babel;
      if (Babel) {
        code = Babel.transform(raw, { presets: ["typescript", "react"], filename: path }).code;
      }
    } catch {/* оставим как есть */}
    // переписываем относительные импорты
    code = code.replace(/from\s+["']([^"']+)["']/g, (m, src) => {
      if (src.startsWith(".") || src.startsWith("/")) {
        // ищем файл по относительному пути
        const resolved = resolveImport(path, src, files);
        if (resolved && placeholders[resolved]) return `from "${placeholders[resolved]}"`;
      }
      return m;
    });
    const blob = new Blob([code], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    blobMap[placeholders[path]] = url;
  }
  // import-map для известных deps
  const imports: Record<string, string> = {};
  for (const d of deps) imports[d] = KNOWN_DEPS[d] || `https://esm.sh/${d}`;
  imports["react"] = KNOWN_DEPS.react;
  imports["react-dom"] = KNOWN_DEPS["react-dom"];
  imports["react-dom/client"] = KNOWN_DEPS["react-dom/client"];
  // подменяем placeholders на blob: URL
  for (const ph in blobMap) imports[ph] = blobMap[ph];
  const importMap = `<script type="importmap">${JSON.stringify({ imports })}</script>`;
  return { blobMap, importMap };
}

function resolveImport(fromFile: string, spec: string, files: ProjectFiles): string | null {
  const fromDir = fromFile.split("/").slice(0, -1).join("/");
  const candidates = [
    `${fromDir}/${spec}`,
    `${fromDir}/${spec}.tsx`,
    `${fromDir}/${spec}.ts`,
    `${fromDir}/${spec}.jsx`,
    `${fromDir}/${spec}.js`,
    `${fromDir}/${spec}/index.tsx`,
    `${fromDir}/${spec}/index.ts`,
    `${fromDir}/${spec}/index.jsx`,
    `${fromDir}/${spec}/index.js`,
  ].map((p) => p.replace(/\/+/g, "/").replace(/^\//, ""));
  for (const c of candidates) if (files[c]) return c;
  return null;
}

export function buildVirtualPreview(files: ProjectFiles): string {
  const indexHtml = findIndexHtml(files);
  const pkgFile = findFile(files, "package.json");
  const deps = pkgFile ? parsePackageDeps(pkgFile.content) : [];

  // Сценарий 1: есть готовый index.html — просто инжектим CDN-логгер + import-map
  if (indexHtml) {
    let html = indexHtml;
    const cssFiles = Object.entries(files).filter(([k]) => k.endsWith(".css"));
    let cssInline = "";
    for (const [, css] of cssFiles) cssInline += `<style>${css}</style>\n`;

    const hasReactRoot = /id=["']root["']/.test(html) || /\.(tsx|jsx)/.test(JSON.stringify(Object.keys(files)));
    let mountScript = "";
    if (hasReactRoot) {
      const { importMap } = buildLocalModuleMap(files, deps);
      // главная точка входа
      const entry = findFile(files, "src/main.tsx", "src/main.jsx", "main.tsx", "main.jsx", "src/index.tsx", "index.tsx");
      if (entry) {
        const entryPh = "blob:placeholder/" + entry.path;
        mountScript = `${importMap}\n<script type="module" src="${entryPh}"></script>`;
      }
    }

    const headInject = `${CDN_INJECTOR}\n${cssInline}\n${mountScript}`;
    if (html.includes("</head>")) html = html.replace("</head>", `${headInject}\n</head>`);
    else html = `<!doctype html><html><head>${headInject}</head><body>${html}</body></html>`;
    return html;
  }

  // Сценарий 2: чистый React-проект без index.html — собираем шаблон
  const appFile = findFile(files, "src/App.tsx", "src/App.jsx", "App.tsx", "App.jsx");
  if (appFile) {
    const { importMap } = buildLocalModuleMap(files, deps);
    const appPh = "blob:placeholder/" + appFile.path;
    return `<!doctype html><html><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
${CDN_INJECTOR}
${importMap}
</head><body>
<div id="root"></div>
<script type="module">
  import React from 'react';
  import { createRoot } from 'react-dom/client';
  import App from '${appPh}';
  createRoot(document.getElementById('root')).render(React.createElement(App));
</script>
</body></html>`;
  }

  // Сценарий 3: ничего не нашли
  return "";
}
