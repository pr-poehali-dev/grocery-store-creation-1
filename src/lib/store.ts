import { useState, useEffect, useCallback } from "react";

const KEY = "muravey_settings_v1";

export type Settings = {
  ai: {
    provider: "DeepSeek" | "Claude" | "OpenAI";
    model: string;
    apiKey: string;
    baseUrl: string;
    proxyUrl: string;
    temperature: string;
    systemPrompt: string;
    imageApiKey: string;
    imageBaseUrl: string;
    imageModel: string;
    mediaApiKey: string;
    mediaBaseUrl: string;
    videoModel: string;
    audioModel: string;
  };
  github: {
    token: string;
    repo: string;
    siteUrl: string;
    branch: string;
    proxy: string;
  };
  payments: {
    terminalKey: string;
    password: string;
  };
  system: {
    selfEdit: boolean;
    publicAi: boolean;
  };
  supabase: {
    url: string;
    anonKey: string;
    serviceKey: string;
  };
  appKeys: Record<string, string>;
  tokens: number;
};

export const DEFAULT_SETTINGS: Settings = {
  ai: {
    provider: "DeepSeek",
    model: "deepseek-chat",
    apiKey: "",
    baseUrl: "https://api.deepseek.com/v1",
    proxyUrl: "",
    temperature: "0.7",
    systemPrompt:
      "Ты — IDE-агент Муравей 2.0. РЕЖИМ: технический, без приветствий и преамбулы. Формат ответа: сначала строка с атомарными шагами через ' · ' (например: '🔨 Создание схемы БД · 🎨 Tailwind тема · 🚀 Деплой'), затем один блок HTML-кода (с инлайн CSS и JS в index.html). Если пользователь упоминает БД/авторизацию — встрой @supabase/supabase-js через CDN и используй SUPABASE_URL и SUPABASE_ANON_KEY как переменные. Минимализм в духе Linear/Vercel. Никакой воды.",
    imageApiKey: "",
    imageBaseUrl: "https://api.replicate.com/v1",
    imageModel: "black-forest-labs/flux-schnell",
    mediaApiKey: "",
    mediaBaseUrl: "https://api.replicate.com/v1",
    videoModel: "luma/ray-flash-2",
    audioModel: "suno/bark",
  },
  github: { token: "", repo: "", siteUrl: "", branch: "main", proxy: "" },
  payments: { terminalKey: "", password: "" },
  system: { selfEdit: false, publicAi: true },
  supabase: { url: "", anonKey: "", serviceKey: "" },
  appKeys: {},
  tokens: 12480,
};

function load(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      ai: { ...DEFAULT_SETTINGS.ai, ...(parsed.ai || {}) },
      github: { ...DEFAULT_SETTINGS.github, ...(parsed.github || {}) },
      payments: { ...DEFAULT_SETTINGS.payments, ...(parsed.payments || {}) },
      system: { ...DEFAULT_SETTINGS.system, ...(parsed.system || {}) },
      supabase: { ...DEFAULT_SETTINGS.supabase, ...(parsed.supabase || {}) },
      appKeys: { ...DEFAULT_SETTINGS.appKeys, ...(parsed.appKeys || {}) },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

const listeners = new Set<() => void>();
let state: Settings = load();

export function getSettings(): Settings {
  return state;
}

export function setSettings(patch: Partial<Settings> | ((s: Settings) => Settings)) {
  const next = typeof patch === "function" ? patch(state) : { ...state, ...patch };
  state = next;
  localStorage.setItem(KEY, JSON.stringify(state));
  listeners.forEach((l) => l());
}

export function useSettings() {
  const [, force] = useState(0);
  useEffect(() => {
    const fn = () => force((n) => n + 1);
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  }, []);
  const update = useCallback((patch: Partial<Settings> | ((s: Settings) => Settings)) => {
    setSettings(patch);
  }, []);
  return [state, update] as const;
}