import { getSettings } from "./store";

export type MediaIntent = "image" | "video" | "audio" | "image-edit" | null;

const IMAGE_WORDS = ["картинк", "фото", "изображен", "нарисуй", "арт", "обложк", "иллюстр"];
const VIDEO_WORDS = ["видео", "ролик", "клип", "анимац", "movie", "видосик"];
const AUDIO_WORDS = ["музык", "песн", "трек", "мелоди", "поздравлен", "саундтрек", "бит ", "бит,"];

export function detectIntent(text: string, hasUpload: boolean): MediaIntent {
  const t = text.toLowerCase();
  if (hasUpload) return "image-edit";
  if (AUDIO_WORDS.some((w) => t.includes(w))) return "audio";
  if (VIDEO_WORDS.some((w) => t.includes(w))) return "video";
  if (IMAGE_WORDS.some((w) => t.includes(w))) return "image";
  return null;
}

function buildUrl(base: string, path: string, proxyHint?: string): string {
  const b = (proxyHint || base).replace(/\/+$/, "");
  return `${b}${path.startsWith("/") ? path : "/" + path}`;
}

// ─── ИЗОБРАЖЕНИЕ ──────────────────────────────────────────────────────────────
export async function generateImage(prompt: string, init?: { image?: string }): Promise<string> {
  const s = getSettings().ai;
  if (!s.imageApiKey) {
    throw new Error("Не задан Image API Key. Откройте «Мозг → Движок».");
  }

  const base = s.imageBaseUrl.replace(/\/+$/, "");
  const isReplicate = base.includes("replicate");
  const isOpenAI = base.includes("openai.com");

  if (isOpenAI) {
    const res = await fetch(`${base}/images/generations`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${s.imageApiKey}` },
      body: JSON.stringify({ model: s.imageModel || "gpt-image-1", prompt, size: "1024x1024", n: 1 }),
    });
    if (!res.ok) throw new Error(`Image API ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const data = await res.json();
    const item = data?.data?.[0];
    if (item?.url) return item.url;
    if (item?.b64_json) return `data:image/png;base64,${item.b64_json}`;
    throw new Error("Пустой ответ от Image API");
  }

  if (isReplicate) {
    const create = await fetch(`${base}/predictions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${s.imageApiKey}`,
        Prefer: "wait",
      },
      body: JSON.stringify({
        model: s.imageModel || "black-forest-labs/flux-schnell",
        input: { prompt, ...(init?.image ? { image: init.image } : {}) },
      }),
    });
    if (!create.ok) throw new Error(`Image API ${create.status}: ${(await create.text()).slice(0, 200)}`);
    const data = await create.json();
    const out = Array.isArray(data?.output) ? data.output[0] : data?.output;
    if (typeof out === "string") return out;
    throw new Error("Пустой ответ от Image API");
  }

  // Универсальный шлюз
  const res = await fetch(buildUrl(base, "/images/generate"), {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${s.imageApiKey}` },
    body: JSON.stringify({ prompt, model: s.imageModel, image: init?.image }),
  });
  if (!res.ok) throw new Error(`Image API ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  return data?.url || data?.image_url || data?.output?.[0] || "";
}

// ─── ВИДЕО ────────────────────────────────────────────────────────────────────
export async function generateVideo(prompt: string): Promise<string> {
  const s = getSettings().ai;
  if (!s.mediaApiKey) throw new Error("Не задан Video/Audio API Key. Откройте «Мозг → Движок».");

  const base = s.mediaBaseUrl.replace(/\/+$/, "");
  const isReplicate = base.includes("replicate");

  if (isReplicate) {
    const res = await fetch(`${base}/predictions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${s.mediaApiKey}`, Prefer: "wait" },
      body: JSON.stringify({ model: s.videoModel || "luma/ray-flash-2", input: { prompt } }),
    });
    if (!res.ok) throw new Error(`Video API ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const data = await res.json();
    const out = Array.isArray(data?.output) ? data.output[0] : data?.output;
    if (typeof out === "string") return out;
    throw new Error("Видео ещё рендерится — попробуйте позже");
  }

  const res = await fetch(buildUrl(base, "/videos/generate"), {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${s.mediaApiKey}` },
    body: JSON.stringify({ prompt, model: s.videoModel }),
  });
  if (!res.ok) throw new Error(`Video API ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  return data?.url || data?.video_url || data?.output?.[0] || "";
}

// ─── АУДИО ────────────────────────────────────────────────────────────────────
export async function generateAudio(prompt: string): Promise<string> {
  const s = getSettings().ai;
  if (!s.mediaApiKey) throw new Error("Не задан Video/Audio API Key. Откройте «Мозг → Движок».");

  const base = s.mediaBaseUrl.replace(/\/+$/, "");
  const isReplicate = base.includes("replicate");

  if (isReplicate) {
    const res = await fetch(`${base}/predictions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${s.mediaApiKey}`, Prefer: "wait" },
      body: JSON.stringify({ model: s.audioModel || "suno/bark", input: { prompt } }),
    });
    if (!res.ok) throw new Error(`Audio API ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const data = await res.json();
    const out = Array.isArray(data?.output) ? data.output[0] : data?.output;
    if (typeof out === "string") return out;
    throw new Error("Музыка ещё генерируется — попробуйте позже");
  }

  const res = await fetch(buildUrl(base, "/audio/generate"), {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${s.mediaApiKey}` },
    body: JSON.stringify({ prompt, model: s.audioModel }),
  });
  if (!res.ok) throw new Error(`Audio API ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  return data?.url || data?.audio_url || data?.output?.[0] || "";
}

export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}
