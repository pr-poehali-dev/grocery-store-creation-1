import { getSettings, setSettings, getActiveProviderConfig } from "./store";
import { extractSearchCommand, searchWeb, formatResultsForLlm } from "./search";

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export function extractHtml(text: string): string | null {
  const fenced = text.match(/```(?:html)?\s*([\s\S]*?)```/i);
  if (fenced) return fenced[1].trim();
  const lower = text.toLowerCase();
  if (lower.includes("<!doctype") || lower.includes("<html")) return text.trim();
  return null;
}

async function callLlmOnce(history: ChatMessage[]): Promise<string> {
  const s = getSettings();
  const cfg = getActiveProviderConfig(s);
  const { provider, apiKey, baseUrl, model } = cfg;
  const { temperature, systemPrompt } = s.ai;

  if (!apiKey) throw new Error(`Не задан API-ключ для ${provider}. Откройте «Мозг → ИИ» и введите ключ.`);
  if (!baseUrl) throw new Error(`Не задан Base URL для ${provider}. Откройте «Мозг → ИИ».`);

  const base = baseUrl.replace(/\/+$/, "");
  const isAnthropic = provider === "Claude";
  const url = isAnthropic ? `${base}/messages` : `${base}/chat/completions`;

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (isAnthropic) {
    headers["x-api-key"] = apiKey;
    headers["anthropic-version"] = "2023-06-01";
    headers["anthropic-dangerous-direct-browser-access"] = "true";
  } else {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }

  const messages: ChatMessage[] = isAnthropic ? history : [{ role: "system", content: systemPrompt }, ...history];

  const body: Record<string, unknown> = isAnthropic
    ? { model, max_tokens: 4096, temperature: parseFloat(temperature) || 0.7, system: systemPrompt, messages: history }
    : { model, temperature: parseFloat(temperature) || 0.7, messages, stream: false };

  const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) });
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Ошибка ${provider} ${res.status}: ${errText.slice(0, 200) || res.statusText}`);
  }
  const data = await res.json();
  if (isAnthropic) return data?.content?.[0]?.text || "";
  return data?.choices?.[0]?.message?.content || "";
}

export type ChatProgress = { stage: "thinking" | "searching" | "writing"; note?: string };

export async function chat(
  history: ChatMessage[],
  onDelta?: (delta: string) => void,
  onProgress?: (p: ChatProgress) => void,
): Promise<string> {
  const s = getSettings();
  const maxHops = s.ai.search.enabled && s.ai.search.autoMode ? 2 : 0;

  let working: ChatMessage[] = [...history];
  let hop = 0;
   
  while (true) {
    onProgress?.({ stage: "thinking" });
    const text = await callLlmOnce(working);

    const searchQ = maxHops > 0 ? extractSearchCommand(text) : null;
    if (searchQ && hop < maxHops) {
      onProgress?.({ stage: "searching", note: searchQ });
      let toolMsg = "";
      try {
        const { engine, results } = await searchWeb(searchQ, 5);
        toolMsg = formatResultsForLlm(searchQ, engine, results);
      } catch (e) {
        toolMsg = `[Поиск "${searchQ}"] — ошибка: ${e instanceof Error ? e.message : "сеть"}. Отвечай по своим знаниям.`;
      }
      working = [
        ...working,
        { role: "assistant", content: text },
        { role: "user", content: toolMsg + "\n\nИспользуй найденную информацию, продолжай отвечать пользователю обычным форматом. Больше команд SEARCH: не вызывай." },
      ];
      hop += 1;
      continue;
    }

    onProgress?.({ stage: "writing" });
    if (onDelta) onDelta(text);
    setSettings((cur) => ({ ...cur, tokens: Math.max(0, cur.tokens - 1) }));
    return text;
  }
}
