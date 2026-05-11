import { useState } from "react";
import Icon from "@/components/ui/icon";

type Tab = "chat" | "core" | "projects";
type CoreTab = "ai" | "github" | "payments" | "system";
type Device = "desktop" | "mobile";
type Msg = { role: "user" | "ai"; text: string };

const TEMPLATES = [
  { id: 1, title: "Магазин продуктов", desc: "Онлайн-магазин с корзиной", emoji: "🛒", tag: "Электронная коммерция", color: "purple" },
  { id: 2, title: "Портфолио", desc: "Минималистичное портфолио", emoji: "🎨", tag: "Личное", color: "orange" },
  { id: 3, title: "SaaS Лендинг", desc: "Посадочная страница для стартапа", emoji: "🚀", tag: "Маркетинг", color: "purple" },
  { id: 4, title: "Блог-журнал", desc: "Редакторский блог со статьями", emoji: "📰", tag: "Контент", color: "orange" },
  { id: 5, title: "Запись на услуги", desc: "Бронирование и календарь", emoji: "📅", tag: "Сервис", color: "purple" },
  { id: 6, title: "Ресторан", desc: "Сайт ресторана с меню", emoji: "🍝", tag: "Еда и напитки", color: "orange" },
];

export default function Index() {
  const [tab, setTab] = useState<Tab>("chat");

  return (
    <div className="min-h-screen bg-background text-foreground grid-bg">
      <TopBar />
      <main className="pb-24">
        {tab === "chat" && <ChatTab />}
        {tab === "core" && <CoreTab />}
        {tab === "projects" && <ProjectsTab onUse={() => setTab("chat")} />}
      </main>
      <BottomNav tab={tab} setTab={setTab} />
    </div>
  );
}

// ─── Top Bar ──────────────────────────────────────────────────────────────────
function TopBar() {
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
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse-dot" />
            <span className="font-mono text-muted-foreground">Claude Sonnet 4.6</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary border border-border">
            <Icon name="Coins" size={12} className="text-orange-500" />
            <span className="font-mono font-medium">12 480</span>
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
    { id: "core", label: "Ядро", icon: "Cpu" },
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
                active
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
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
function ChatTab() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "ai", text: "Привет. Я Муравей 2.0 — твой ИИ-разработчик. Опиши сайт, который нужно создать. Я начну писать код прямо в превью справа." },
  ]);
  const [input, setInput] = useState("");
  const [device, setDevice] = useState<Device>("desktop");

  function send() {
    if (!input.trim()) return;
    setMessages((m) => [...m, { role: "user", text: input }]);
    setTimeout(() => {
      setMessages((m) => [...m, { role: "ai", text: "Принял. Генерирую структуру компонентов и стили. Превью обновится через мгновение." }]);
    }, 600);
    setInput("");
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 pt-6 animate-fade-up">
      <div className="grid lg:grid-cols-[40%_60%] gap-4 h-[calc(100vh-180px)]">

        {/* CHAT LEFT */}
        <div className="bg-card border border-border rounded-2xl flex flex-col overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="Sparkles" size={14} className="text-purple-500" />
              <h2 className="font-heading uppercase tracking-wider text-sm">Рабочее пространство ИИ</h2>
            </div>
            <button className="text-xs text-muted-foreground hover:text-foreground transition">
              <Icon name="RotateCcw" size={14} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-4 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-fade-up`}>
                <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-foreground text-background rounded-br-md"
                    : "bg-secondary text-foreground rounded-bl-md border border-border"
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
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
              />
              <div className="flex items-center justify-between mt-1.5">
                <div className="flex gap-1">
                  <button className="w-7 h-7 rounded-lg hover:bg-background flex items-center justify-center text-muted-foreground hover:text-foreground transition">
                    <Icon name="Paperclip" size={14} />
                  </button>
                  <button className="w-7 h-7 rounded-lg hover:bg-background flex items-center justify-center text-muted-foreground hover:text-foreground transition">
                    <Icon name="Mic" size={14} />
                  </button>
                  <button className="w-7 h-7 rounded-lg hover:bg-background flex items-center justify-center text-muted-foreground hover:text-foreground transition">
                    <Icon name="Image" size={14} />
                  </button>
                </div>
                <button
                  onClick={send}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-orange-500 text-black text-xs font-bold hover:opacity-90 transition"
                >
                  <Icon name="Send" size={12} />
                  Создать сайт
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
                muravey.app/проекты/без-названия-2
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex p-0.5 rounded-lg bg-secondary border border-border">
                <button
                  onClick={() => setDevice("desktop")}
                  className={`px-2 py-1 rounded-md transition ${device === "desktop" ? "bg-foreground text-background" : "text-muted-foreground"}`}
                >
                  <Icon name="Monitor" size={13} />
                </button>
                <button
                  onClick={() => setDevice("mobile")}
                  className={`px-2 py-1 rounded-md transition ${device === "mobile" ? "bg-foreground text-background" : "text-muted-foreground"}`}
                >
                  <Icon name="Smartphone" size={13} />
                </button>
              </div>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary border border-border text-xs font-medium hover:bg-foreground hover:text-background transition">
                <Icon name="ExternalLink" size={12} />
                Открыть сайт
              </button>
            </div>
          </div>

          <div className="flex-1 bg-secondary/30 flex items-center justify-center p-4 overflow-hidden">
            <div className={`bg-background border border-border rounded-xl h-full transition-all duration-500 ${
              device === "mobile" ? "w-[380px] max-w-full" : "w-full"
            } flex flex-col items-center justify-center text-center p-8 relative overflow-hidden`}>
              <div className="absolute inset-0 grid-bg opacity-40" />
              <div className="relative z-10 max-w-md">
                <div className="text-5xl mb-4">🐜</div>
                <h3 className="font-heading text-3xl mb-2 text-gradient">Готов к работе</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Напишите запрос в чат слева. Ваш сайт появится здесь в реальном времени.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {["Лендинг", "Магазин", "Портфолио", "Блог"].map((s) => (
                    <button key={s} className="px-3 py-1.5 rounded-full bg-secondary border border-border text-xs hover:border-purple-500/50 hover:text-foreground text-muted-foreground transition">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
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
    { id: "ai", label: "ИИ-движок", icon: "Brain" },
    { id: "github", label: "GitHub", icon: "Github" },
    { id: "payments", label: "Платежи", icon: "CreditCard" },
    { id: "system", label: "Система", icon: "Settings" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 pt-6 animate-fade-up">
      <div className="mb-6">
        <div className="font-mono text-xs text-muted-foreground mb-1">/ админ / ядро</div>
        <h1 className="font-heading text-4xl">Панель ядра</h1>
        <p className="text-muted-foreground text-sm mt-1">Настройки движка, интеграций и системы</p>
      </div>

      {/* Sub tabs */}
      <div className="flex gap-1 p-1 bg-card border border-border rounded-xl mb-6 overflow-x-auto scrollbar-hide">
        {subTabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setSub(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              sub === t.id
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
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
  const [provider, setProvider] = useState("Claude");
  const providers = ["DeepSeek", "Claude", "OpenAI"];
  const models = ["Claude Sonnet 4.6", "Claude 4.5", "DeepSeek Coder", "GPT-4o"];

  return (
    <div className="space-y-4 animate-fade-up">
      <Card title="Провайдер и модель" accent="purple">
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Провайдер">
            <div className="flex gap-1.5">
              {providers.map((p) => (
                <button
                  key={p}
                  onClick={() => setProvider(p)}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium border transition ${
                    provider === p
                      ? "bg-purple-500/10 border-purple-500/50 text-purple-400"
                      : "bg-secondary border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Модель">
            <select className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:border-purple-500/50 focus:outline-none">
              {models.map((m) => <option key={m}>{m}</option>)}
            </select>
          </Field>
        </div>
      </Card>

      <Card title="Доступы к API" accent="orange">
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="API-ключ">
            <Input placeholder="sk-ant-..." type="password" mono />
          </Field>
          <Field label="Базовый URL">
            <Input placeholder="https://api.anthropic.com/v1" mono />
          </Field>
          <Field label="Прокси URL" hint="Для обхода ограничений">
            <Input placeholder="https://proxy.muravey.app" mono />
          </Field>
          <Field label="Температура">
            <Input placeholder="0.7" mono />
          </Field>
        </div>
      </Card>

      <Card title="Системный промпт" accent="purple">
        <textarea
          rows={8}
          defaultValue={`Ты профессиональный веб-дизайнер платформы Муравей 2.0.\nЭкспертиза: React, Tailwind CSS, современные паттерны UI/UX.\nВсегда создавай продакшен-код с доступностью.\nПо умолчанию следуй минималистичной эстетике Linear/Vercel.`}
          className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-sm font-mono leading-relaxed focus:border-purple-500/50 focus:outline-none resize-none"
        />
      </Card>

      <div className="flex justify-end gap-2">
        <button className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-secondary transition">Проверить подключение</button>
        <button className="px-5 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-orange-500 text-black text-sm font-bold hover:opacity-90 transition">Сохранить настройки</button>
      </div>
    </div>
  );
}

function GitHubPanel() {
  return (
    <div className="space-y-4 animate-fade-up">
      <Card title="Репозиторий" accent="purple">
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Токен GitHub">
            <Input placeholder="ghp_..." type="password" mono />
          </Field>
          <Field label="Путь к репозиторию">
            <Input placeholder="пользователь/репо" mono />
          </Field>
          <Field label="Адрес сайта">
            <Input placeholder="https://мой-сайт.ru" mono />
          </Field>
          <Field label="Ветка">
            <Input placeholder="main" mono />
          </Field>
        </div>
      </Card>

      <Card title="ZIP-движок" accent="orange" badge="Только админ">
        <p className="text-xs text-muted-foreground mb-4">Импорт и экспорт проекта одним архивом. Файлы распаковываются в память браузера и попадают в контекст ИИ.</p>
        <div className="grid md:grid-cols-2 gap-3">
          <button className="group flex items-center gap-3 p-4 rounded-xl border border-dashed border-border hover:border-orange-500/50 hover:bg-orange-500/5 transition text-left">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center group-hover:scale-105 transition">
              <Icon name="Upload" size={16} className="text-orange-500" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm">Загрузить .zip</div>
              <div className="text-xs text-muted-foreground font-mono">→ распаковать в контекст ИИ</div>
            </div>
          </button>
          <button className="group flex items-center gap-3 p-4 rounded-xl border border-dashed border-border hover:border-purple-500/50 hover:bg-purple-500/5 transition text-left">
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
  return (
    <div className="space-y-4 animate-fade-up">
      <Card title="Интеграция Т-Банк" accent="orange">
        <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-orange-500/5 border border-orange-500/20">
          <div className="w-9 h-9 rounded-lg bg-orange-500 flex items-center justify-center text-black font-bold">Т</div>
          <div>
            <div className="font-medium text-sm">Т-Банк Бизнес</div>
            <div className="text-xs text-muted-foreground">Эквайринг и СБП</div>
          </div>
          <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">Активно</span>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Ключ терминала">
            <Input placeholder="1234567890DEMO" mono />
          </Field>
          <Field label="Пароль">
            <Input placeholder="••••••••••" type="password" mono />
          </Field>
        </div>
      </Card>

      <Card title="СБП — Быстрые платежи" accent="purple">
        <div className="grid md:grid-cols-[200px_1fr] gap-6 items-start">
          <div className="aspect-square rounded-xl border border-border bg-secondary p-4 flex items-center justify-center">
            <div className="grid grid-cols-8 gap-0.5 w-full h-full">
              {Array.from({ length: 64 }).map((_, i) => (
                <div key={i} className={`rounded-[1px] ${Math.random() > 0.5 ? "bg-foreground" : "bg-transparent"}`} />
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <div className="text-xs text-muted-foreground font-mono mb-1">QR · Пополнение токенов</div>
              <div className="font-heading text-3xl">990 ₽ → 5 000 токенов</div>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-2 rounded-lg bg-secondary border border-border text-xs hover:bg-foreground hover:text-background transition">Обновить QR</button>
              <button className="px-3 py-2 rounded-lg bg-secondary border border-border text-xs hover:bg-foreground hover:text-background transition">Копировать ссылку</button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function SystemPanel() {
  const [selfEdit, setSelfEdit] = useState(false);
  const [publicAi, setPublicAi] = useState(true);

  return (
    <div className="space-y-4 animate-fade-up">
      <Card title="Переключатели" accent="purple">
        <div className="space-y-3">
          <Toggle
            label="Режим самообновления"
            hint="Платформа может редактировать саму себя"
            on={selfEdit}
            setOn={setSelfEdit}
            color="purple"
          />
          <Toggle
            label="Открытый доступ к ИИ"
            hint="Публичный доступ к API ассистента"
            on={publicAi}
            setOn={setPublicAi}
            color="orange"
          />
        </div>
      </Card>

      <Card title="Опасная зона" accent="orange">
        <div className="flex items-center justify-between gap-4 p-3 rounded-lg border border-red-500/20 bg-red-500/5">
          <div>
            <div className="font-medium text-sm">Сброс баланса</div>
            <div className="text-xs text-muted-foreground">Сбросить счётчик токенов всех пользователей</div>
          </div>
          <button className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium hover:bg-red-500/20 transition">
            Сбросить
          </button>
        </div>
      </Card>
    </div>
  );
}

// ─── Projects Tab ─────────────────────────────────────────────────────────────
function ProjectsTab({ onUse }: { onUse: () => void }) {
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
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-orange-500 text-black text-sm font-bold hover:opacity-90 transition">
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
              t.color === "purple"
                ? "bg-gradient-to-br from-purple-500/20 via-background to-background"
                : "bg-gradient-to-br from-orange-500/20 via-background to-background"
            }`}>
              <div className="absolute inset-0 grid-bg opacity-50" />
              <div className="absolute inset-0 flex items-center justify-center text-7xl group-hover:scale-110 transition-transform duration-500">
                {t.emoji}
              </div>
              <span className={`absolute top-3 left-3 text-[10px] px-2 py-1 rounded-full font-mono font-medium uppercase tracking-wider ${
                t.color === "purple"
                  ? "bg-purple-500/15 text-purple-400 border border-purple-500/30"
                  : "bg-orange-500/15 text-orange-400 border border-orange-500/30"
              }`}>
                {t.tag}
              </span>
            </div>
            <div className="p-5">
              <h3 className="font-heading text-xl mb-1">{t.title}</h3>
              <p className="text-muted-foreground text-xs mb-4">{t.desc}</p>
              <div className="flex gap-2">
                <button
                  onClick={onUse}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-foreground text-background text-xs font-medium hover:opacity-90 transition"
                >
                  <Icon name="Wand2" size={12} />
                  Использовать шаблон
                </button>
                <button className="px-3 py-2 rounded-lg border border-border text-xs hover:bg-secondary transition">
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

function Input({ placeholder, type = "text", mono }: { placeholder?: string; type?: string; mono?: boolean }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
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