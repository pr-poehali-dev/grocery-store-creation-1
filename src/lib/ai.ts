import { getSettings, setSettings } from "./store";

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export function extractHtml(text: string): string | null {
  const fenced = text.match(/```(?:html)?\s*([\s\S]*?)```/i);
  if (fenced) return fenced[1].trim();
  const lower = text.toLowerCase();
  if (lower.includes("<!doctype") || lower.includes("<html")) return text.trim();
  return null;
}

export async function chat(
  history: ChatMessage[],
  onDelta?: (delta: string) => void
): Promise<string> {
  const s = getSettings();
  const { provider, apiKey, baseUrl, model, temperature, proxyUrl, systemPrompt } = s.ai;

  if (!apiKey) {
    throw new Error("Не задан API-ключ. Откройте вкладку «Ядро → ИИ-движок» и введите ключ.");
  }

  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    ...history,
  ];

  const base = (proxyUrl || baseUrl).replace(/\/+$/, "");

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

  const body: Record<string, unknown> = isAnthropic
    ? {
        model,
        max_tokens: 4096,
        temperature: parseFloat(temperature) || 0.7,
        system: systemPrompt,
        messages: history,
      }
    : {
        model,
        temperature: parseFloat(temperature) || 0.7,
        messages,
        stream: false,
      };

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Ошибка ${res.status}: ${errText.slice(0, 200) || res.statusText}`);
  }

  const data = await res.json();
  let text = "";
  if (isAnthropic) {
    text = data?.content?.[0]?.text || "";
  } else {
    text = data?.choices?.[0]?.message?.content || "";
  }

  if (onDelta) onDelta(text);

  setSettings((cur) => ({ ...cur, tokens: Math.max(0, cur.tokens - 1) }));

  return text;
}
