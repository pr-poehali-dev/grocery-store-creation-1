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
      "Ты профессиональный веб-разработчик платформы Муравей 2.0. Создаёшь современные сайты на чистом HTML/CSS/JS. ВАЖНО: отвечай ТОЛЬКО одним блоком HTML-кода (с инлайн CSS и JS внутри одного файла index.html). Никаких пояснений вне кода. Дизайн — минималистичный, в духе Linear/Vercel.",
  },
  github: { token: "", repo: "", siteUrl: "", branch: "main", proxy: "" },
  payments: { terminalKey: "", password: "" },
  system: { selfEdit: false, publicAi: true },
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