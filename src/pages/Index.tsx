import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { useSettings, type Settings } from "@/lib/store";
import { chat, extractHtml, type ChatMessage } from "@/lib/ai";
import { importZip, exportZip, findIndexHtml, loadFiles, saveFiles, filesContextForAi, type ProjectFiles } from "@/lib/files";
import { commitToGitHub } from "@/lib/github";
import { toast } from "sonner";
import { AntTyping } from "@/components/AntTyping";
import { BackgroundAnt } from "@/components/BackgroundAnt";

type Tab = "chat" | "core" | "projects";
type CoreTab = "ai" | "github" | "payments" | "system";
type Device = "desktop" | "mobile";
type Msg = { role: "user" | "ai"; text: string };

const TEMPLATES = [
  { id: 1, title: "Магазин продуктов", desc: "Онлайн-магазин с корзиной", emoji: "🛒", tag: "Электронная коммерция", color: "purple", prompt: "Сделай красивый магазин продуктов с карточками товаров, корзиной и итоговой суммой." },
  { id: 2, title: "Портфолио", desc: "Минималистичное портфолио", emoji: "🎨", tag: "Личное", color: "orange", prompt: "Создай минималистичное портфолио дизайнера с шапкой, проектами в сетке и контактами." },
  { id: 3, title: "SaaS Лендинг", desc: "Посадочная страница для стартапа", emoji: "🚀", tag: "Маркетинг", color: "purple", prompt: "Создай SaaS-лендинг с hero, фичами в 3 колонки, тарифами и формой подписки." },
  { id: 4, title: "Блог-журнал", desc: "Редакторский блог со статьями", emoji: "📰", tag: "Контент", color: "orange", prompt: "Сделай блог-журнал с крупным заголовком, обложкой статьи и сеткой превью записей." },
  { id: 5, title: "Запись на услуги", desc: "Бронирование и календарь", emoji: "📅", tag: "Сервис", color: "purple", prompt: "Создай страницу записи на услуги с выбором даты, времени и формой контактов." },
  { id: 6, title: "Ресторан", desc: "Сайт ресторана с меню", emoji: "🍝", tag: "Еда и напитки", color: "orange", prompt: "Создай сайт ресторана: hero с фото, разделы меню по категориям, бронирование столика." },
];

export default function Index() {
  const [tab, setTab] = useState<Tab>("chat");
  const [presetPrompt, setPresetPrompt] = useState("");

  return (
    <div className="min-h-screen bg-background text-foreground grid-bg relative">
      <BackgroundAnt />
      <div className="relative z-10">
        <TopBar />
        <main className="pb-24">
          {tab === "chat" && <ChatTab presetPrompt={presetPrompt} clearPreset={() => setPresetPrompt("")} />}
          {tab === "core" && <CoreTab />}
          {tab === "projects" && (
            <ProjectsTab onUse={(p) => { setPresetPrompt(p); setTab("chat"); }} />
          )}
        </main>
        <BottomNav tab={tab} setTab={setTab} />
      </div>
    </div>
  );
}

// ─── Top Bar ──────────────────────────────────────────────────────────────────
function TopBar() {
  const [s] = useSettings();
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-orange-500 flex items-center justify-center font-heading font-bold text-sm text-black">
            М
          </div>
          <div className="leading-tight">
            <div className="font-heading text-base tracking-wider uppercase">Муравей</div>
            <div className="text-[10px] text-muted-foreground font-mono -mt-0.5">v2.0 · БЕТА</div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary border border-border">
            <span className={`w-1.5 h-1.5 rounded-full ${s.ai.apiKey ? "bg-green-500" : "bg-muted-foreground"} animate-pulse-dot`} />
            <span className="font-mono text-muted-foreground">{s.ai.provider} · {s.ai.model}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary border border-border">
            <Icon name="Coins" size={12} className="text-orange-500" />
            <span className="font-mono font-medium">{s.tokens.toLocaleString("ru-RU")}</span>
            <span className="text-muted-foreground">токенов</span>
          </div>
          <button className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-orange-500 flex items-center justify-center text-xs font-bold text-black">
            AK
          </button>
        </div>

        <button className="md:hidden w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-orange-500 flex items-center justify-center text-xs font-bold text-black">
          AK
        </button>
      </div>
    </header>
  );
}

// ─── Bottom Nav ───────────────────────────────────────────────────────────────
function BottomNav({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  const items: { id: Tab; label: string; icon: string }[] = [
    { id: "chat", label: "Чат", icon: "MessageSquare" },
    { id: "core", label: "Мозг", icon: "Brain" },
    { id: "projects", label: "Проекты", icon: "LayoutGrid" },
  ];

  return (
    <nav className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-1 p-1.5 rounded-full bg-card/90 backdrop-blur-xl border border-border shadow-2xl">
        {items.map((item) => {
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`relative flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                active ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <Icon name={item.icon} fallback="Circle" size={15} />
              <span className="font-heading uppercase tracking-wider text-xs">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// ─── Chat Tab ─────────────────────────────────────────────────────────────────
function ChatTab({ presetPrompt, clearPreset }: { presetPrompt: string; clearPreset: () => void }) {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "ai", text: "Привет! Я Муравей 2.0. Опиши сайт — я сразу сгенерирую HTML и покажу его в превью. Перед запуском проверь ключ во вкладке «Мозг → Движок»." },
  ]);
  const [input, setInput] = useState("");
  const [device, setDevice] = useState<Device>("desktop");
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [files, setFilesState] = useState<ProjectFiles>(() => loadFiles());

  useEffect(() => {
    const idx = findIndexHtml(files);
    if (idx) setPreviewHtml(idx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (presetPrompt) {
      setInput(presetPrompt);
      clearPreset();
    }
  }, [presetPrompt, clearPreset]);

  useEffect(() => {
    const fn = () => {
      const f = loadFiles();
      setFilesState(f);
      const idx = findIndexHtml(f);
      if (idx) setPreviewHtml(idx);
    };
    window.addEventListener("muravey:project-updated", fn);
    return () => window.removeEventListener("muravey:project-updated", fn);
  }, []);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;

    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setBusy(true);

    const ctx = filesContextForAi(files);
    const history: ChatMessage[] = [];
    if (ctx) history.push({ role: "user", content: ctx });
    const prior = messages.filter((_, i) => i > 0);
    for (const m of prior) history.push({ role: m.role === "user" ? "user" : "assistant", content: m.text });
    history.push({ role: "user", content: text });

    try {
      const reply = await chat(history);
      const html = extractHtml(reply);
      if (html) {
        setPreviewHtml(html);
        const nextFiles = { ...files, "index.html": html };
        setFilesState(nextFiles);
        saveFiles(nextFiles);
        setMessages((m) => [...m, { role: "ai", text: "Готово. Сайт обновлён в превью справа и сохранён в проект." }]);
      } else {
        setMessages((m) => [...m, { role: "ai", text: reply }]);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Неизвестная ошибка";
      toast.error(msg);
      setMessages((m) => [...m, { role: "ai", text: `Ошибка: ${msg}` }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 pt-6 animate-fade-up">
      <div className="grid lg:grid-cols-[40%_60%] gap-4 h-[calc(100vh-180px)]">
        {/* CHAT LEFT */}
        <div className="bg-card border border-border rounded-2xl flex flex-col overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="Sparkles" size={14} className="text-purple-500" />
              <h2 className="font-heading uppercase tracking-wider text-sm">Рабочее пространство</h2>
            </div>
            <button
              onClick={() => setMessages([{ role: "ai", text: "Чат очищен. Опиши новый сайт." }])}
              className="text-xs text-muted-foreground hover:text-foreground transition"
              title="Очистить чат"
            >
              <Icon name="RotateCcw" size={14} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-4 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-fade-up`}>
                <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
                  m.role === "user"
                    ? "bg-foreground text-background rounded-br-md"
                    : "bg-secondary text-foreground rounded-bl-md border border-border"
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {busy && (
              <div className="flex justify-start animate-fade-up">
                <div className="bg-secondary text-muted-foreground border border-border rounded-2xl rounded-bl-md px-4 py-3 text-sm flex items-center gap-3">
                  <AntTyping size={48} />
                  <div className="flex flex-col">
                    <span className="font-heading text-xs uppercase tracking-wider text-foreground">Муравей печатает</span>
                    <span className="text-[11px] font-mono text-muted-foreground">
                      компилирует код<span className="animate-cursor">_</span>
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-border p-3">
            <div className="bg-secondary border border-border rounded-xl p-2.5 focus-within:border-purple-500/50 transition-all">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder="Опишите ваш сайт... поддерживается разметка"
                rows={2}
                className="w-full bg-transparent text-sm placeholder:text-muted-foreground resize-none focus:outline-none"
                disabled={busy}
              />
              <div className="flex items-center justify-between mt-1.5">
                <div className="flex gap-1">
                  <button className="w-7 h-7 rounded-lg hover:bg-background flex items-center justify-center text-muted-foreground hover:text-foreground transition" title="Прикрепить">
                    <Icon name="Paperclip" size={14} />
                  </button>
                  <button className="w-7 h-7 rounded-lg hover:bg-background flex items-center justify-center text-muted-foreground hover:text-foreground transition" title="Голос">
                    <Icon name="Mic" size={14} />
                  </button>
                  <button className="w-7 h-7 rounded-lg hover:bg-background flex items-center justify-center text-muted-foreground hover:text-foreground transition" title="Картинка">
                    <Icon name="Image" size={14} />
                  </button>
                </div>
                <button
                  onClick={send}
                  disabled={busy || !input.trim()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-orange-500 text-black text-xs font-bold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Icon name="Send" size={12} />
                  За работу
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* PREVIEW RIGHT */}
        <div className="bg-card border border-border rounded-2xl flex flex-col overflow-hidden">
          <div className="px-5 py-3 border-b border-border flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
              </div>
              <div className="ml-3 flex-1 min-w-0 font-mono text-xs text-muted-foreground truncate">
                muravey.app/проекты/{previewHtml ? "активный" : "новый"}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex p-0.5 rounded-lg bg-secondary border border-border">
                <button onClick={() => setDevice("desktop")} className={`px-2 py-1 rounded-md transition ${device === "desktop" ? "bg-foreground text-background" : "text-muted-foreground"}`}>
                  <Icon name="Monitor" size={13} />
                </button>
                <button onClick={() => setDevice("mobile")} className={`px-2 py-1 rounded-md transition ${device === "mobile" ? "bg-foreground text-background" : "text-muted-foreground"}`}>
                  <Icon name="Smartphone" size={13} />
                </button>
              </div>
              <button
                onClick={() => {
                  if (!previewHtml) return toast.error("Сайт пока пустой");
                  const w = window.open();
                  if (w) { w.document.write(previewHtml); w.document.close(); }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary border border-border text-xs font-medium hover:bg-foreground hover:text-background transition"
              >
                <Icon name="ExternalLink" size={12} />
                Открыть сайт
              </button>
            </div>
          </div>

          <div className="flex-1 bg-secondary/30 flex items-center justify-center p-4 overflow-hidden">
            <div className={`bg-background border border-border rounded-xl h-full transition-all duration-500 ${
              device === "mobile" ? "w-[380px] max-w-full" : "w-full"
            } overflow-hidden relative`}>
              {previewHtml ? (
                <>
                  <iframe
                    title="превью"
                    srcDoc={previewHtml}
                    sandbox="allow-scripts allow-forms"
                    className="w-full h-full border-0 bg-white"
                  />
                  {busy && (
                    <div className="absolute inset-0 bg-background/85 backdrop-blur-sm flex flex-col items-center justify-center animate-fade-up">
                      <AntTyping size={140} />
                      <div className="mt-6 text-center">
                        <h3 className="font-heading text-2xl text-gradient mb-1">Муравей за работой</h3>
                        <p className="text-sm font-mono text-muted-foreground">
                          печатает код<span className="animate-cursor">|</span>
                        </p>
                      </div>
                    </div>
                  )}
                </>
              ) : busy ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-center p-8 relative">
                  <div className="absolute inset-0 grid-bg opacity-40" />
                  <div className="relative z-10">
                    <AntTyping size={160} />
                    <h3 className="font-heading text-3xl text-gradient mt-6 mb-1">Муравей за работой</h3>
                    <p className="text-sm font-mono text-muted-foreground">
                      печатает ваш сайт<span className="animate-cursor">|</span>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-center p-8 relative">
                  <div className="absolute inset-0 grid-bg opacity-40" />
                  <div className="relative z-10 max-w-md">
                    <div className="mb-4 flex justify-center"><AntTyping size={110} /></div>
                    <h3 className="font-heading text-3xl mb-2 text-gradient">Готов к работе</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      Напишите запрос в чат слева. Ваш сайт появится здесь в реальном времени.
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {["Лендинг", "Магазин", "Портфолио", "Блог"].map((s) => (
                        <button
                          key={s}
                          onClick={() => setInput(`Сделай красивый ${s.toLowerCase()} с современным дизайном`)}
                          className="px-3 py-1.5 rounded-full bg-secondary border border-border text-xs hover:border-purple-500/50 hover:text-foreground text-muted-foreground transition"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Core Tab ─────────────────────────────────────────────────────────────────
function CoreTab() {
  const [sub, setSub] = useState<CoreTab>("ai");

  const subTabs: { id: CoreTab; label: string; icon: string }[] = [
    { id: "ai", label: "Движок", icon: "Brain" },
    { id: "github", label: "GitHub", icon: "Github" },
    { id: "payments", label: "Платежи", icon: "CreditCard" },
    { id: "system", label: "Система", icon: "Settings" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 pt-6 animate-fade-up">
      <div className="mb-6">
        <div className="font-mono text-xs text-muted-foreground mb-1">/ админ / мозг</div>
        <h1 className="font-heading text-4xl">Панель мозга</h1>
        <p className="text-muted-foreground text-sm mt-1">Настройки движка, интеграций и системы</p>
      </div>

      <div className="flex gap-1 p-1 bg-card border border-border rounded-xl mb-6 overflow-x-auto scrollbar-hide">
        {subTabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setSub(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              sub === t.id ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            <Icon name={t.icon} fallback="Circle" size={14} />
            <span className="font-heading uppercase tracking-wider text-xs">{t.label}</span>
          </button>
        ))}
      </div>

      {sub === "ai" && <AIPanel />}
      {sub === "github" && <GitHubPanel />}
      {sub === "payments" && <PaymentsPanel />}
      {sub === "system" && <SystemPanel />}
    </div>
  );
}

function AIPanel() {
  const [s, set] = useSettings();
  const providers: Settings["ai"]["provider"][] = ["DeepSeek", "Claude", "OpenAI"];
  const modelsByProvider: Record<Settings["ai"]["provider"], string[]> = {
    DeepSeek: ["deepseek-chat", "deepseek-coder", "deepseek-reasoner"],
    Claude: ["claude-sonnet-4-5", "claude-opus-4-1", "claude-3-5-haiku-latest"],
    OpenAI: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo"],
  };
  const baseByProvider: Record<Settings["ai"]["provider"], string> = {
    DeepSeek: "https://api.deepseek.com/v1",
    Claude: "https://api.anthropic.com/v1",
    OpenAI: "https://api.openai.com/v1",
  };

  function pickProvider(p: Settings["ai"]["provider"]) {
    set((cur) => ({
      ...cur,
      ai: { ...cur.ai, provider: p, model: modelsByProvider[p][0], baseUrl: baseByProvider[p] },
    }));
  }

  async function testConnection() {
    try {
      toast.loading("Проверяем подключение...", { id: "test" });
      await chat([{ role: "user", content: "Скажи коротко: «Подключение работает»." }]);
      toast.success("Подключение работает", { id: "test" });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Не удалось", { id: "test" });
    }
  }

  return (
    <div className="space-y-4 animate-fade-up">
      <Card title="Провайдер и модель" accent="purple">
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Провайдер">
            <div className="flex gap-1.5">
              {providers.map((p) => (
                <button
                  key={p}
                  onClick={() => pickProvider(p)}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium border transition ${
                    s.ai.provider === p ? "bg-purple-500/10 border-purple-500/50 text-purple-400" : "bg-secondary border-border text-muted-foreground hover:text-foreground"
                  }`}
                >{p}</button>
              ))}
            </div>
          </Field>
          <Field label="Модель">
            <select
              value={s.ai.model}
              onChange={(e) => set((c) => ({ ...c, ai: { ...c.ai, model: e.target.value } }))}
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:border-purple-500/50 focus:outline-none"
            >
              {modelsByProvider[s.ai.provider].map((m) => <option key={m}>{m}</option>)}
            </select>
          </Field>
        </div>
      </Card>

      <Card title="Доступы к API" accent="orange">
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="API-ключ">
            <Input value={s.ai.apiKey} onChange={(v) => set((c) => ({ ...c, ai: { ...c.ai, apiKey: v } }))} placeholder="sk-..." type="password" mono />
          </Field>
          <Field label="Базовый URL">
            <Input value={s.ai.baseUrl} onChange={(v) => set((c) => ({ ...c, ai: { ...c.ai, baseUrl: v } }))} placeholder="https://api.deepseek.com/v1" mono />
          </Field>
          <Field label="Прокси URL" hint="Если задан — используется вместо базового">
            <Input value={s.ai.proxyUrl} onChange={(v) => set((c) => ({ ...c, ai: { ...c.ai, proxyUrl: v } }))} placeholder="https://proxy.muravey.app" mono />
          </Field>
          <Field label="Температура">
            <Input value={s.ai.temperature} onChange={(v) => set((c) => ({ ...c, ai: { ...c.ai, temperature: v } }))} placeholder="0.7" mono />
          </Field>
        </div>
      </Card>

      <Card title="Системный промпт" accent="purple">
        <textarea
          rows={8}
          value={s.ai.systemPrompt}
          onChange={(e) => set((c) => ({ ...c, ai: { ...c.ai, systemPrompt: e.target.value } }))}
          className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-sm font-mono leading-relaxed focus:border-purple-500/50 focus:outline-none resize-none"
        />
      </Card>

      <div className="flex justify-end gap-2">
        <button onClick={testConnection} className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-secondary transition">Проверить подключение</button>
        <button onClick={() => toast.success("Настройки сохранены")} className="px-5 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-orange-500 text-black text-sm font-bold hover:opacity-90 transition">Сохранить настройки</button>
      </div>
    </div>
  );
}

function GitHubPanel() {
  const [s, set] = useSettings();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function onZipUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      toast.loading("Распаковываем архив...", { id: "zip" });
      const files = await importZip(file);
      const count = Object.keys(files).length;
      toast.success(`Загружено файлов: ${count}. Превью обновлено.`, { id: "zip" });
      window.dispatchEvent(new Event("muravey:project-updated"));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Ошибка распаковки", { id: "zip" });
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function onZipDownload() {
    const files = loadFiles();
    if (Object.keys(files).length === 0) {
      toast.error("Проект пуст. Сгенерируйте сайт в чате.");
      return;
    }
    await exportZip(files);
    toast.success("Архив скачан");
  }

  async function onCommit() {
    const files = loadFiles();
    if (Object.keys(files).length === 0) return toast.error("Проект пуст");
    setBusy(true);
    try {
      toast.loading("Отправляем в GitHub...", { id: "gh" });
      const sha = await commitToGitHub(files);
      toast.success(`Коммит создан: ${sha.slice(0, 7)}`, { id: "gh" });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Ошибка коммита", { id: "gh" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4 animate-fade-up">
      <Card title="Репозиторий" accent="purple">
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Токен GitHub">
            <Input value={s.github.token} onChange={(v) => set((c) => ({ ...c, github: { ...c.github, token: v } }))} placeholder="ghp_..." type="password" mono />
          </Field>
          <Field label="Путь к репозиторию">
            <Input value={s.github.repo} onChange={(v) => set((c) => ({ ...c, github: { ...c.github, repo: v } }))} placeholder="пользователь/репо" mono />
          </Field>
          <Field label="Адрес сайта">
            <Input value={s.github.siteUrl} onChange={(v) => set((c) => ({ ...c, github: { ...c.github, siteUrl: v } }))} placeholder="https://мой-сайт.ru" mono />
          </Field>
          <Field label="Ветка">
            <Input value={s.github.branch} onChange={(v) => set((c) => ({ ...c, github: { ...c.github, branch: v } }))} placeholder="main" mono />
          </Field>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={onCommit}
            disabled={busy}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-orange-500 text-black text-sm font-bold hover:opacity-90 transition disabled:opacity-50"
          >
            <Icon name="GitCommit" size={14} />
            В GitHub
          </button>
        </div>
      </Card>

      <Card title="ZIP-движок" accent="orange" badge="Только админ">
        <p className="text-xs text-muted-foreground mb-4">Импорт и экспорт проекта одним архивом. Файлы распаковываются в память браузера и попадают в контекст ИИ.</p>
        <input ref={fileRef} type="file" accept=".zip" className="hidden" onChange={onZipUpload} />
        <div className="grid md:grid-cols-2 gap-3">
          <button onClick={() => fileRef.current?.click()} className="group flex items-center gap-3 p-4 rounded-xl border border-dashed border-border hover:border-orange-500/50 hover:bg-orange-500/5 transition text-left">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center group-hover:scale-105 transition">
              <Icon name="Upload" size={16} className="text-orange-500" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm">Загрузить .zip</div>
              <div className="text-xs text-muted-foreground font-mono">→ распаковать в контекст ИИ</div>
            </div>
          </button>
          <button onClick={onZipDownload} className="group flex items-center gap-3 p-4 rounded-xl border border-dashed border-border hover:border-purple-500/50 hover:bg-purple-500/5 transition text-left">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center group-hover:scale-105 transition">
              <Icon name="Download" size={16} className="text-purple-500" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm">Скачать .zip</div>
              <div className="text-xs text-muted-foreground font-mono">→ выгрузить текущую сборку</div>
            </div>
          </button>
        </div>
      </Card>
    </div>
  );
}

function PaymentsPanel() {
  const [s, set] = useSettings();

  return (
    <div className="space-y-4 animate-fade-up">
      <Card title="Интеграция Т-Банк" accent="orange">
        <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-orange-500/5 border border-orange-500/20">
          <div className="w-9 h-9 rounded-lg bg-orange-500 flex items-center justify-center text-black font-bold">Т</div>
          <div>
            <div className="font-medium text-sm">Т-Банк Бизнес</div>
            <div className="text-xs text-muted-foreground">Эквайринг и СБП</div>
          </div>
          <span className={`ml-auto text-xs px-2 py-0.5 rounded-full border ${
            s.payments.terminalKey ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-muted text-muted-foreground border-border"
          }`}>{s.payments.terminalKey ? "Активно" : "Не настроено"}</span>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Ключ терминала">
            <Input value={s.payments.terminalKey} onChange={(v) => set((c) => ({ ...c, payments: { ...c.payments, terminalKey: v } }))} placeholder="1234567890DEMO" mono />
          </Field>
          <Field label="Пароль">
            <Input value={s.payments.password} onChange={(v) => set((c) => ({ ...c, payments: { ...c.payments, password: v } }))} placeholder="••••••••••" type="password" mono />
          </Field>
        </div>
        <div className="mt-4 flex justify-end">
          <button onClick={() => toast.success("Данные платёжной системы сохранены")} className="px-4 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 transition">
            Сохранить
          </button>
        </div>
      </Card>

      <Card title="СБП — Быстрые платежи" accent="purple">
        <div className="grid md:grid-cols-[200px_1fr] gap-6 items-start">
          <div className="aspect-square rounded-xl border border-border bg-secondary p-4 flex items-center justify-center">
            <div className="grid grid-cols-8 gap-0.5 w-full h-full">
              {Array.from({ length: 64 }).map((_, i) => (
                <div key={i} className={`rounded-[1px] ${(i * 37) % 5 < 3 ? "bg-foreground" : "bg-transparent"}`} />
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <div className="text-xs text-muted-foreground font-mono mb-1">QR · Пополнение токенов</div>
              <div className="font-heading text-3xl">990 ₽ → 5 000 токенов</div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { set((c) => ({ ...c, tokens: c.tokens + 5000 })); toast.success("Зачислено 5 000 токенов"); }}
                className="px-3 py-2 rounded-lg bg-secondary border border-border text-xs hover:bg-foreground hover:text-background transition"
              >Симулировать оплату</button>
              <button
                onClick={() => { navigator.clipboard.writeText("https://qr.nspk.ru/demo-muravey"); toast.success("Ссылка скопирована"); }}
                className="px-3 py-2 rounded-lg bg-secondary border border-border text-xs hover:bg-foreground hover:text-background transition"
              >Копировать ссылку</button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function SystemPanel() {
  const [s, set] = useSettings();

  return (
    <div className="space-y-4 animate-fade-up">
      <Card title="Переключатели" accent="purple">
        <div className="space-y-3">
          <Toggle
            label="Режим самообновления"
            hint="Платформа может редактировать саму себя"
            on={s.system.selfEdit}
            setOn={(v) => set((c) => ({ ...c, system: { ...c.system, selfEdit: v } }))}
            color="purple"
          />
          <Toggle
            label="Открытый доступ к ИИ"
            hint="Публичный доступ к API ассистента"
            on={s.system.publicAi}
            setOn={(v) => set((c) => ({ ...c, system: { ...c.system, publicAi: v } }))}
            color="orange"
          />
        </div>
      </Card>

      <Card title="Опасная зона" accent="orange">
        <div className="flex items-center justify-between gap-4 p-3 rounded-lg border border-red-500/20 bg-red-500/5">
          <div>
            <div className="font-medium text-sm">Сброс баланса</div>
            <div className="text-xs text-muted-foreground">Сбросить счётчик токенов до 0</div>
          </div>
          <button
            onClick={() => { set((c) => ({ ...c, tokens: 0 })); toast.success("Баланс обнулён"); }}
            className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium hover:bg-red-500/20 transition"
          >Сбросить</button>
        </div>
      </Card>
    </div>
  );
}

// ─── Projects Tab ─────────────────────────────────────────────────────────────
function ProjectsTab({ onUse }: { onUse: (prompt: string) => void }) {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 pt-6 animate-fade-up">
      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div>
          <div className="font-mono text-xs text-muted-foreground mb-1">/ проекты / шаблоны</div>
          <h1 className="font-heading text-4xl">Шаблоны</h1>
          <p className="text-muted-foreground text-sm mt-1">Готовые шаблоны для быстрого старта</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary border border-border text-sm hover:bg-foreground hover:text-background transition">
            <Icon name="Filter" size={13} />
            Фильтры
          </button>
          <button
            onClick={() => onUse("")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-orange-500 text-black text-sm font-bold hover:opacity-90 transition"
          >
            <Icon name="Plus" size={13} />
            Новый проект
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TEMPLATES.map((t, i) => (
          <div
            key={t.id}
            className="group relative bg-card border border-border rounded-2xl overflow-hidden hover:border-foreground/30 transition-all animate-slide-up"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className={`h-40 relative overflow-hidden ${
              t.color === "purple" ? "bg-gradient-to-br from-purple-500/20 via-background to-background" : "bg-gradient-to-br from-orange-500/20 via-background to-background"
            }`}>
              <div className="absolute inset-0 grid-bg opacity-50" />
              <div className="absolute inset-0 flex items-center justify-center text-7xl group-hover:scale-110 transition-transform duration-500">
                {t.emoji}
              </div>
              <span className={`absolute top-3 left-3 text-[10px] px-2 py-1 rounded-full font-mono font-medium uppercase tracking-wider ${
                t.color === "purple" ? "bg-purple-500/15 text-purple-400 border border-purple-500/30" : "bg-orange-500/15 text-orange-400 border border-orange-500/30"
              }`}>
                {t.tag}
              </span>
            </div>
            <div className="p-5">
              <h3 className="font-heading text-xl mb-1">{t.title}</h3>
              <p className="text-muted-foreground text-xs mb-4">{t.desc}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => onUse(t.prompt)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-foreground text-background text-xs font-medium hover:opacity-90 transition"
                >
                  <Icon name="Wand2" size={12} />
                  Использовать шаблон
                </button>
                <button className="px-3 py-2 rounded-lg border border-border text-xs hover:bg-secondary transition" title="Предпросмотр">
                  <Icon name="Eye" size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Shared mini-components ───────────────────────────────────────────────────
function Card({ title, children, accent = "purple", badge }: {
  title: string;
  children: React.ReactNode;
  accent?: "purple" | "orange";
  badge?: string;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={`w-1 h-4 rounded-full ${accent === "purple" ? "bg-purple-500" : "bg-orange-500"}`} />
          <h3 className="font-heading uppercase tracking-wider text-sm">{title}</h3>
        </div>
        {badge && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 font-mono uppercase">
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <div className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider mb-1.5">{label}</div>
      {children}
      {hint && <div className="text-[11px] text-muted-foreground mt-1">{hint}</div>}
    </label>
  );
}

function Input({ placeholder, type = "text", mono, value, onChange }: {
  placeholder?: string;
  type?: string;
  mono?: boolean;
  value?: string;
  onChange?: (v: string) => void;
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value ?? ""}
      onChange={(e) => onChange?.(e.target.value)}
      className={`w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus:border-purple-500/50 focus:outline-none transition ${mono ? "font-mono" : ""}`}
    />
  );
}

function Toggle({ label, hint, on, setOn, color }: {
  label: string;
  hint?: string;
  on: boolean;
  setOn: (v: boolean) => void;
  color: "purple" | "orange";
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div>
        <div className="font-medium text-sm">{label}</div>
        {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
      </div>
      <button
        onClick={() => setOn(!on)}
        className={`relative w-11 h-6 rounded-full transition-colors ${
          on ? (color === "purple" ? "bg-purple-500" : "bg-orange-500") : "bg-secondary border border-border"
        }`}
      >
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-background transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
      </button>
    </div>
  );
}