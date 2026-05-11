import { useState } from "react";
import Icon from "@/components/ui/icon";
import { toast } from "sonner";

const HERO_IMG = "https://cdn.poehali.dev/projects/5f88b64f-b745-4b46-b3ef-4e3ff3a00764/files/51cb0979-3fe7-40f1-98c1-84f183a566b0.jpg";
const STORE_IMG = "https://cdn.poehali.dev/projects/5f88b64f-b745-4b46-b3ef-4e3ff3a00764/files/82e9bcf1-fa07-49f8-be7d-18f4a4de998d.jpg";

const CATEGORIES = [
  { name: "Овощи", icon: "Carrot", desc: "С грядки от местных фермеров", color: "bg-fresh-leaf/20 text-fresh-olive" },
  { name: "Фрукты", icon: "Apple", desc: "Сезонные и спелые", color: "bg-fresh-terra/15 text-fresh-terra" },
  { name: "Зелень", icon: "Leaf", desc: "Срезана этим утром", color: "bg-fresh-grass/15 text-fresh-olive" },
  { name: "Молочное", icon: "Milk", desc: "От частных хозяйств", color: "bg-fresh-sand/30 text-fresh-ink" },
  { name: "Хлеб", icon: "Wheat", desc: "Печём каждый день", color: "bg-fresh-terra/15 text-fresh-terra" },
  { name: "Мясо и рыба", icon: "Fish", desc: "Охлаждённое, без заморозки", color: "bg-fresh-berry/15 text-fresh-berry" },
];

const PRODUCTS = [
  { name: "Помидоры черри", weight: "500 г", price: 320, badge: "Хит" },
  { name: "Антоновка", weight: "1 кг", price: 180, badge: null },
  { name: "Базилик зелёный", weight: "пучок", price: 90, badge: "Свежий" },
  { name: "Творог фермерский", weight: "350 г", price: 240, badge: null },
  { name: "Хлеб на закваске", weight: "500 г", price: 210, badge: "Новинка" },
  { name: "Сёмга охлаждённая", weight: "300 г", price: 690, badge: null },
];

const FEATURES = [
  { icon: "Truck", title: "Доставка за 90 минут", desc: "По городу — бесплатно от 1500 ₽" },
  { icon: "Sprout", title: "Только фермерское", desc: "Работаем напрямую с 32 хозяйствами" },
  { icon: "ShieldCheck", title: "Гарантия свежести", desc: "Не понравилось — вернём деньги" },
  { icon: "Clock", title: "Открыто 8:00–22:00", desc: "Без выходных и перерывов" },
];

export default function Index() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <Hero />
      <Categories />
      <About />
      <Bestsellers />
      <Delivery />
      <Contacts />
      <Footer />
    </div>
  );
}

// ─── Header ─────────────────────────────────────────────────────────────────
function Header({ menuOpen, setMenuOpen }: { menuOpen: boolean; setMenuOpen: (v: boolean) => void }) {
  const links = [
    { href: "#categories", label: "Ассортимент" },
    { href: "#about", label: "О нас" },
    { href: "#delivery", label: "Доставка" },
    { href: "#contacts", label: "Контакты" },
  ];
  return (
    <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-xl border-b border-border">
      <div className="max-w-6xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full bg-fresh-olive flex items-center justify-center">
            <Icon name="Leaf" size={18} className="text-fresh-cream" />
          </div>
          <div className="leading-tight">
            <div className="font-heading text-2xl text-fresh-ink">Фрэшь</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground -mt-0.5">фермерские продукты</div>
          </div>
        </a>

        <nav className="hidden md:flex items-center gap-7">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-foreground hover:text-fresh-olive transition relative group">
              {l.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-fresh-olive transition-all group-hover:w-full" />
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a href="tel:+74950000000" className="hidden md:flex items-center gap-2 text-sm font-medium text-foreground hover:text-fresh-olive transition">
            <Icon name="Phone" size={14} />
            +7 (495) 000-00-00
          </a>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden w-10 h-10 rounded-full bg-fresh-beige flex items-center justify-center"
          >
            <Icon name={menuOpen ? "X" : "Menu"} size={18} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-border bg-background animate-fade-up">
          <div className="px-5 py-4 space-y-2">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="block py-2 text-base"
              >
                {l.label}
              </a>
            ))}
            <a href="tel:+74950000000" className="block py-2 text-base text-fresh-olive font-medium">
              +7 (495) 000-00-00
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

// ─── Hero ───────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-5 md:px-8 pt-12 md:pt-20 pb-14 md:pb-24 grid lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-14 items-center">
        <div className="relative z-10 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-fresh-leaf/25 border border-fresh-olive/30 text-fresh-olive text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-fresh-olive animate-pulse-dot" />
            Сегодня привезли свежие огурцы и зелень
          </div>

          <h1 className="font-heading text-5xl md:text-7xl text-fresh-ink leading-[1.05] mb-5">
            Свежесть<br />
            <span className="text-fresh-olive italic">прямо с грядки</span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-md mb-8 leading-relaxed">
            Фермерские овощи, фрукты, хлеб и молочное. Доставим за 90 минут — пока ваш чай ещё горячий.
          </p>

          <div className="flex flex-wrap gap-3">
            <a
              href="#categories"
              className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-fresh-olive text-fresh-cream text-sm font-medium hover:bg-fresh-ink transition shadow-lg shadow-fresh-olive/20"
            >
              <Icon name="ShoppingBasket" size={16} />
              Смотреть ассортимент
            </a>
            <a
              href="#delivery"
              className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-card border border-border text-sm font-medium hover:border-fresh-olive transition"
            >
              <Icon name="Truck" size={16} />
              Условия доставки
            </a>
          </div>

          <div className="mt-10 flex items-center gap-8 flex-wrap">
            <Stat n="32" label="фермерских хозяйства" />
            <Stat n="90′" label="средняя доставка" />
            <Stat n="4.9" label="оценка в Яндексе" />
          </div>
        </div>

        <div className="relative animate-fade-up" style={{ animationDelay: "120ms" }}>
          <div className="relative rounded-[2rem] overflow-hidden border border-border shadow-2xl shadow-fresh-olive/10 aspect-[4/5]">
            <img src={HERO_IMG} alt="Свежие продукты" className="w-full h-full object-cover" />
          </div>
          <div className="absolute -bottom-5 -left-5 hidden md:block bg-card border border-border rounded-2xl p-4 shadow-xl max-w-[230px]">
            <div className="flex items-center gap-2 mb-1.5">
              <Icon name="Sprout" size={14} className="text-fresh-olive" />
              <div className="text-xs font-medium">Сегодня в наличии</div>
            </div>
            <div className="text-2xl font-heading">137 позиций</div>
            <div className="text-[11px] text-muted-foreground mt-1">обновлено в 06:30</div>
          </div>
          <div className="absolute -top-4 -right-4 hidden md:flex w-24 h-24 rounded-full bg-fresh-terra/90 text-white items-center justify-center text-center text-xs font-medium leading-tight rotate-[-12deg]">
            доставка<br />бесплатно<br />от 1500₽
          </div>
        </div>
      </div>

      {/* decorative leaves */}
      <Icon name="Leaf" size={120} className="absolute top-10 right-0 text-fresh-leaf/15 -rotate-45 hidden lg:block" />
      <Icon name="Apple" size={90} className="absolute bottom-10 left-5 text-fresh-terra/10 hidden lg:block" />
    </section>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <div className="font-heading text-3xl text-fresh-ink">{n}</div>
      <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
    </div>
  );
}

// ─── Categories ─────────────────────────────────────────────────────────────
function Categories() {
  return (
    <section id="categories" className="bg-fresh-beige/40 border-y border-border">
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-24">
        <SectionTitle eyebrow="Ассортимент" title="Шесть категорий, всё своё" />

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
          {CATEGORIES.map((c, i) => (
            <div
              key={c.name}
              className="group bg-card rounded-2xl p-5 md:p-6 border border-border hover:border-fresh-olive transition-all animate-fade-up cursor-pointer"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className={`w-12 h-12 rounded-full ${c.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon name={c.icon} fallback="Leaf" size={20} />
              </div>
              <div className="font-heading text-xl md:text-2xl text-fresh-ink mb-1">{c.name}</div>
              <div className="text-sm text-muted-foreground">{c.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── About ──────────────────────────────────────────────────────────────────
function About() {
  return (
    <section id="about" className="py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-5 md:px-8 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div className="relative order-2 lg:order-1 animate-fade-up">
          <div className="rounded-[2rem] overflow-hidden border border-border aspect-[4/3]">
            <img src={STORE_IMG} alt="Интерьер магазина" className="w-full h-full object-cover" />
          </div>
          <div className="absolute -bottom-5 right-5 bg-fresh-olive text-fresh-cream rounded-2xl px-5 py-4 shadow-xl">
            <div className="font-heading text-3xl leading-none">с 2019</div>
            <div className="text-[10px] uppercase tracking-widest mt-1 opacity-80">кормим город</div>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <SectionTitle eyebrow="О нас" title={"Маленький магазин\nс большим вкусом"} align="left" />
          <div className="space-y-4 text-base text-muted-foreground leading-relaxed">
            <p>
              «Фрэшь» — это семейный магазин на углу, куда соседи приходят за тёплым хлебом, спелыми яблоками и творогом, который ещё помнит коровник.
            </p>
            <p>
              Мы работаем напрямую с 32 фермерскими хозяйствами Подмосковья и Калуги. Без посредников, без долгого хранения — продукты едут с поля прямо к нам ночью, а утром уже на полке.
            </p>
            <p>
              Заходите познакомиться или заказывайте онлайн — привезём за 90 минут.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-fresh-beige flex-shrink-0 flex items-center justify-center">
                  <Icon name={f.icon} fallback="Check" size={16} className="text-fresh-olive" />
                </div>
                <div>
                  <div className="font-medium text-sm">{f.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Bestsellers ────────────────────────────────────────────────────────────
function Bestsellers() {
  return (
    <section className="bg-fresh-beige/30 border-y border-border py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        <SectionTitle eyebrow="Хиты недели" title="Что чаще всего берут" />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {PRODUCTS.map((p, i) => (
            <div
              key={p.name}
              className="bg-card rounded-2xl border border-border p-5 hover:shadow-xl hover:-translate-y-1 transition-all animate-fade-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="aspect-square rounded-xl bg-fresh-beige/60 mb-4 flex items-center justify-center relative overflow-hidden">
                <Icon name={["Cherry", "Apple", "Leaf", "Milk", "Wheat", "Fish"][i] || "Leaf"} fallback="Leaf" size={64} className="text-fresh-olive/60" />
                {p.badge && (
                  <span className="absolute top-3 left-3 text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-fresh-terra text-white font-medium">
                    {p.badge}
                  </span>
                )}
              </div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-heading text-lg leading-tight">{p.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{p.weight}</div>
                </div>
                <div className="text-right">
                  <div className="font-heading text-xl text-fresh-ink">{p.price} ₽</div>
                </div>
              </div>
              <button
                onClick={() => toast.success(`«${p.name}» — оформите заказ по телефону`)}
                className="w-full mt-4 py-2.5 rounded-full bg-fresh-beige hover:bg-fresh-olive hover:text-fresh-cream text-sm font-medium transition flex items-center justify-center gap-2"
              >
                <Icon name="Plus" size={14} />
                В заказ
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Delivery ───────────────────────────────────────────────────────────────
function Delivery() {
  const steps = [
    { n: "01", title: "Звонок или сообщение", desc: "Скажите, что нужно — соберём с утра, как для себя" },
    { n: "02", title: "Подтверждение", desc: "Уточним детали, сумму и удобное время" },
    { n: "03", title: "Доставка 90 минут", desc: "Привезём бесплатно от 1500 ₽ по городу" },
    { n: "04", title: "Не понравилось?", desc: "Вернём деньги или заменим без вопросов" },
  ];
  return (
    <section id="delivery" className="py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        <SectionTitle eyebrow="Доставка" title="Как мы работаем" />

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {steps.map((s, i) => (
            <div key={s.n} className="bg-card border border-border rounded-2xl p-6 animate-fade-up" style={{ animationDelay: `${i * 70}ms` }}>
              <div className="font-mono text-xs text-fresh-olive mb-3">{s.n}</div>
              <div className="font-heading text-xl mb-2 leading-tight">{s.title}</div>
              <div className="text-sm text-muted-foreground leading-relaxed">{s.desc}</div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-fresh-olive text-fresh-cream rounded-3xl p-8 md:p-12 grid md:grid-cols-[1.3fr_1fr] gap-8 items-center">
          <div>
            <div className="text-xs uppercase tracking-widest opacity-70 mb-2">Зона доставки</div>
            <h3 className="font-heading text-3xl md:text-4xl mb-3">Весь город и пригород в радиусе 25 км</h3>
            <p className="text-fresh-cream/80 max-w-md leading-relaxed">
              Принимаем заказы с 8:00 до 21:00. Самовывоз — бесплатно в любое время работы магазина.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <a href="tel:+74950000000" className="flex items-center justify-between px-5 py-4 rounded-2xl bg-fresh-cream text-fresh-ink hover:bg-white transition">
              <span className="flex items-center gap-3">
                <Icon name="Phone" size={18} />
                <span className="font-medium">+7 (495) 000-00-00</span>
              </span>
              <Icon name="ArrowUpRight" size={16} />
            </a>
            <a href="https://wa.me/74950000000" className="flex items-center justify-between px-5 py-4 rounded-2xl bg-fresh-cream/15 hover:bg-fresh-cream/25 transition border border-fresh-cream/20">
              <span className="flex items-center gap-3">
                <Icon name="MessageCircle" size={18} />
                <span className="font-medium">Написать в WhatsApp</span>
              </span>
              <Icon name="ArrowUpRight" size={16} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Contacts ───────────────────────────────────────────────────────────────
function Contacts() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [text, setText] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !phone) return toast.error("Заполните имя и телефон");
    toast.success("Заявка отправлена! Перезвоним в течение 15 минут");
    setName(""); setPhone(""); setText("");
  }

  return (
    <section id="contacts" className="bg-fresh-beige/40 border-t border-border py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-5 md:px-8 grid lg:grid-cols-[1fr_1.1fr] gap-10 lg:gap-16">
        <div>
          <SectionTitle eyebrow="Контакты" title="Заходите или позвоните" align="left" />

          <div className="space-y-5">
            <ContactRow icon="MapPin" title="Адрес" lines={["г. Москва, ул. Зелёная, 12", "первый этаж со двора"]} />
            <ContactRow icon="Phone" title="Телефон" lines={["+7 (495) 000-00-00", "ежедневно 8:00–22:00"]} />
            <ContactRow icon="Mail" title="Почта" lines={["hello@fresh-shop.ru"]} />
            <ContactRow icon="Instagram" title="Соцсети" lines={["@fresh_shop"]} />
          </div>

          <div className="mt-8 rounded-2xl overflow-hidden border border-border aspect-[16/9] bg-fresh-beige/60 flex items-center justify-center">
            <div className="text-center">
              <Icon name="Map" size={36} className="text-fresh-olive mx-auto mb-2" />
              <div className="text-sm text-muted-foreground">здесь будет карта</div>
            </div>
          </div>
        </div>

        <form onSubmit={submit} className="bg-card rounded-3xl border border-border p-7 md:p-9">
          <div className="font-heading text-3xl mb-2">Оставьте заявку</div>
          <p className="text-sm text-muted-foreground mb-6">Перезвоним в течение 15 минут и поможем собрать заказ</p>

          <div className="space-y-4">
            <Input label="Как к вам обращаться" value={name} onChange={setName} placeholder="Ваше имя" />
            <Input label="Телефон" value={phone} onChange={setPhone} placeholder="+7 (___) ___-__-__" type="tel" />
            <Field label="Комментарий">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={4}
                placeholder="Что нужно собрать?"
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:border-fresh-olive focus:outline-none resize-none"
              />
            </Field>
          </div>

          <button
            type="submit"
            className="w-full mt-6 py-3.5 rounded-full bg-fresh-olive text-fresh-cream font-medium hover:bg-fresh-ink transition flex items-center justify-center gap-2"
          >
            <Icon name="Send" size={16} />
            Отправить заявку
          </button>
          <p className="text-[11px] text-muted-foreground text-center mt-4 leading-relaxed">
            Нажимая кнопку, вы соглашаетесь с обработкой персональных данных
          </p>
        </form>
      </div>
    </section>
  );
}

function ContactRow({ icon, title, lines }: { icon: string; title: string; lines: string[] }) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-11 h-11 rounded-full bg-card border border-border flex-shrink-0 flex items-center justify-center">
        <Icon name={icon} fallback="Circle" size={16} className="text-fresh-olive" />
      </div>
      <div>
        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">{title}</div>
        {lines.map((l, i) => (
          <div key={i} className={i === 0 ? "font-medium" : "text-sm text-muted-foreground"}>{l}</div>
        ))}
      </div>
    </div>
  );
}

function Input({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <Field label={label}>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:border-fresh-olive focus:outline-none"
      />
    </Field>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1.5">{label}</div>
      {children}
    </label>
  );
}

// ─── Footer ─────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-fresh-ink text-fresh-cream py-12">
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        <div className="grid md:grid-cols-[1.3fr_1fr_1fr] gap-8 mb-10">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-full bg-fresh-cream text-fresh-olive flex items-center justify-center">
                <Icon name="Leaf" size={18} />
              </div>
              <div className="font-heading text-2xl">Фрэшь</div>
            </div>
            <p className="text-sm text-fresh-cream/60 leading-relaxed max-w-sm">
              Маленький фермерский магазин с большим вкусом. С 2019 года кормим город свежим.
            </p>
          </div>

          <div>
            <div className="text-xs uppercase tracking-widest text-fresh-cream/60 mb-3">Меню</div>
            <ul className="space-y-1.5 text-sm">
              <li><a href="#categories" className="hover:text-white transition">Ассортимент</a></li>
              <li><a href="#about" className="hover:text-white transition">О нас</a></li>
              <li><a href="#delivery" className="hover:text-white transition">Доставка</a></li>
              <li><a href="#contacts" className="hover:text-white transition">Контакты</a></li>
            </ul>
          </div>

          <div>
            <div className="text-xs uppercase tracking-widest text-fresh-cream/60 mb-3">Связаться</div>
            <ul className="space-y-1.5 text-sm">
              <li><a href="tel:+74950000000" className="hover:text-white transition">+7 (495) 000-00-00</a></li>
              <li><a href="mailto:hello@fresh-shop.ru" className="hover:text-white transition">hello@fresh-shop.ru</a></li>
              <li className="text-fresh-cream/60">ул. Зелёная, 12</li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-fresh-cream/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 text-xs text-fresh-cream/50">
          <div>© 2025 «Фрэшь». Все права защищены</div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition">Политика конфиденциальности</a>
            <a href="#" className="hover:text-white transition">Договор оферты</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Section Title ──────────────────────────────────────────────────────────
function SectionTitle({ eyebrow, title, align = "center" }: { eyebrow: string; title: string; align?: "left" | "center" }) {
  return (
    <div className={`mb-10 md:mb-14 ${align === "center" ? "text-center" : ""}`}>
      <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-fresh-olive mb-3">
        <span className="w-6 h-px bg-fresh-olive" />
        {eyebrow}
        <span className="w-6 h-px bg-fresh-olive" />
      </div>
      <h2 className="font-heading text-4xl md:text-5xl text-fresh-ink leading-tight whitespace-pre-line">
        {title}
      </h2>
    </div>
  );
}
