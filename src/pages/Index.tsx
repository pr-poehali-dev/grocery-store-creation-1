import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";

// ─── Data ────────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: "all", label: "Всё", emoji: "🛒" },
  { id: "veggies", label: "Овощи", emoji: "🥦" },
  { id: "fruits", label: "Фрукты", emoji: "🍓" },
  { id: "dairy", label: "Молочное", emoji: "🥛" },
  { id: "meat", label: "Мясо", emoji: "🥩" },
  { id: "bakery", label: "Выпечка", emoji: "🍞" },
  { id: "drinks", label: "Напитки", emoji: "🧃" },
];

const PRODUCTS = [
  { id: 1, name: "Авокадо Хасс", price: 129, unit: "шт", category: "fruits", badge: "Хит", tags: ["органик", "витамин E"], emoji: "🥑" },
  { id: 2, name: "Томаты черри", price: 189, unit: "500г", category: "veggies", badge: "Новинка", tags: ["сладкие", "без нитратов"], emoji: "🍅" },
  { id: 3, name: "Клубника садовая", price: 249, unit: "500г", category: "fruits", badge: "Сезон", tags: ["сладкая", "без хим."], emoji: "🍓" },
  { id: 4, name: "Молоко 3,2%", price: 89, unit: "1л", category: "dairy", badge: null, tags: ["фермерское", "без добавок"], emoji: "🥛" },
  { id: 5, name: "Брокколи", price: 149, unit: "шт", category: "veggies", badge: null, tags: ["витамины", "кальций"], emoji: "🥦" },
  { id: 6, name: "Яблоки Гала", price: 99, unit: "1кг", category: "fruits", badge: "Акция", tags: ["хрустящие", "сладкие"], emoji: "🍎" },
  { id: 7, name: "Куриное филе", price: 359, unit: "1кг", category: "meat", badge: "Фреш", tags: ["охлаждённое", "без антибиотиков"], emoji: "🍗" },
  { id: 8, name: "Хлеб Бородинский", price: 69, unit: "450г", category: "bakery", badge: null, tags: ["заварной", "без дрожжей"], emoji: "🍞" },
  { id: 9, name: "Сок яблочный", price: 129, unit: "1л", category: "drinks", badge: null, tags: ["прямой отжим", "без сахара"], emoji: "🧃" },
  { id: 10, name: "Творог 5%", price: 119, unit: "300г", category: "dairy", badge: "Хит", tags: ["фермерский", "зернистый"], emoji: "🧀" },
  { id: 11, name: "Шпинат свежий", price: 89, unit: "150г", category: "veggies", badge: null, tags: ["железо", "витамин K"], emoji: "🌿" },
  { id: 12, name: "Бананы", price: 79, unit: "1кг", category: "fruits", badge: null, tags: ["спелые", "из Эквадора"], emoji: "🍌" },
];

type CartItem = { product: typeof PRODUCTS[0]; qty: number };
type Page = "home" | "catalog" | "about" | "delivery" | "contacts" | "cart" | "profile";

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Index() {
  const [page, setPage] = useState<Page>("home");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notification, setNotification] = useState("");

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + i.product.price * i.qty, 0);

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((p) => {
      const matchCat = activeCategory === "all" || p.category === activeCategory;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }, [search, activeCategory]);

  function addToCart(product: typeof PRODUCTS[0]) {
    setCart((prev) => {
      const ex = prev.find((i) => i.product.id === product.id);
      if (ex) return prev.map((i) => i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { product, qty: 1 }];
    });
    setNotification(`${product.emoji} ${product.name} добавлен в корзину`);
    setTimeout(() => setNotification(""), 2500);
  }

  function changeQty(id: number, delta: number) {
    setCart((prev) =>
      prev
        .map((i) => i.product.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i)
        .filter((i) => i.qty > 0)
    );
  }

  function navigate(p: Page) {
    setPage(p);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const NAV_ITEMS: { id: Page; label: string }[] = [
    { id: "home", label: "Главная" },
    { id: "catalog", label: "Каталог" },
    { id: "about", label: "О магазине" },
    { id: "delivery", label: "Доставка" },
    { id: "contacts", label: "Контакты" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* Toast notification */}
      {notification && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-slide-right pointer-events-none">
          <div className="glass neon-border rounded-full px-5 py-3 text-sm font-medium text-lime-400 whitespace-nowrap shadow-2xl">
            {notification}
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <button onClick={() => navigate("home")} className="flex items-center gap-0.5 shrink-0">
            <span className="text-2xl font-heading font-black neon-text tracking-tight">Fresh</span>
            <span className="text-2xl font-heading font-black text-foreground tracking-tight">Mart</span>
          </button>

          {/* Desktop search */}
          <div className="hidden md:flex flex-1 max-w-md relative">
            <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); if (page !== "catalog") setPage("catalog"); }}
              placeholder="Поиск по названию и характеристикам..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-secondary border border-white/8 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-lime-400 transition-all"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-all">
                <Icon name="X" size={14} />
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("profile")}
              className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl glass hover:border-white/20 transition-all text-sm text-muted-foreground hover:text-foreground"
            >
              <Icon name="User" size={16} />
              <span>Профиль</span>
            </button>
            <button
              onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-2 px-4 py-2 rounded-xl btn-neon text-sm"
            >
              <Icon name="ShoppingCart" size={16} />
              <span className="hidden sm:inline font-semibold">Корзина</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-orange-400 text-white text-[10px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 glass rounded-xl"
            >
              <Icon name={mobileMenuOpen ? "X" : "Menu"} size={20} />
            </button>
          </div>
        </div>

        {/* Desktop nav links */}
        <div className="hidden md:block border-t border-white/5">
          <div className="max-w-7xl mx-auto px-4 flex gap-1 py-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  page === item.id
                    ? "bg-lime-400/10 text-lime-400"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/5 px-4 py-3 flex flex-col gap-2 animate-fade-in">
            <div className="relative">
              <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage("catalog"); }}
                placeholder="Поиск..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-secondary border border-white/8 text-sm focus:outline-none"
              />
            </div>
            {[...NAV_ITEMS, { id: "profile" as Page, label: "Профиль" }].map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`px-4 py-3 rounded-xl text-sm font-medium text-left transition-all ${
                  page === item.id
                    ? "bg-lime-400/10 text-lime-400"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Page content */}
      <main>
        {page === "home" && (
          <HomePage onCatalog={() => navigate("catalog")} onAddToCart={addToCart} />
        )}
        {page === "catalog" && (
          <CatalogPage
            search={search}
            setSearch={setSearch}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            filteredProducts={filteredProducts}
            onAddToCart={addToCart}
            cart={cart}
          />
        )}
        {page === "about" && <AboutPage />}
        {page === "delivery" && <DeliveryPage />}
        {page === "contacts" && <ContactsPage />}
        {page === "cart" && <CartPageView cart={cart} cartTotal={cartTotal} onChangeQty={changeQty} />}
        {page === "profile" && <ProfilePage />}
      </main>

      {/* Cart Drawer */}
      {cartOpen && (
        <CartDrawer
          cart={cart}
          total={cartTotal}
          onClose={() => setCartOpen(false)}
          onChangeQty={changeQty}
          onCheckout={() => { setCartOpen(false); navigate("cart"); }}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-white/5 mt-20 py-10 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-2xl font-heading font-black">
            <span className="neon-text">Fresh</span><span>Mart</span>
          </div>
          <p className="text-muted-foreground text-sm">© 2024 FreshMart — свежие продукты с доставкой</p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>+7 (800) 123-45-67</span>
            <span>info@freshmart.ru</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── Home Page ────────────────────────────────────────────────────────────────

function HomePage({
  onCatalog,
  onAddToCart,
}: {
  onCatalog: () => void;
  onAddToCart: (p: typeof PRODUCTS[0]) => void;
}) {
  const featured = PRODUCTS.filter((p) => p.badge);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://cdn.poehali.dev/projects/5f88b64f-b745-4b46-b3ef-4e3ff3a00764/files/0fc665e4-ce5e-4e27-b765-45db76656dc4.jpg"
            alt="свежие продукты"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-24 md:py-36">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-lime-400/10 border border-lime-400/20 text-lime-400 text-xs font-semibold mb-6 animate-fade-in-up">
              <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse inline-block" />
              Доставка за 2 часа по городу
            </div>
            <h1 className="font-heading text-4xl md:text-6xl font-black leading-[1.1] mb-6 animate-fade-in-up delay-100">
              Свежие продукты<br />
              <span className="neon-text">прямо к двери</span>
            </h1>
            <p className="text-muted-foreground text-lg mb-8 animate-fade-in-up delay-200">
              Фермерские овощи, фрукты и молочные продукты. Без консервантов — только натуральное.
            </p>
            <div className="flex flex-wrap gap-3 animate-fade-in-up delay-300">
              <button onClick={onCatalog} className="btn-neon px-8 py-3.5 rounded-xl font-heading font-bold text-base">
                Перейти в каталог
              </button>
              <button className="px-8 py-3.5 rounded-xl glass border border-white/10 font-semibold hover:border-white/25 transition-all">
                Узнать подробнее
              </button>
            </div>

            <div className="flex gap-8 mt-12 animate-fade-in-up delay-400">
              {[["500+", "товаров"], ["2 ч", "доставка"], ["4.9★", "рейтинг"]].map(([val, label]) => (
                <div key={label}>
                  <div className="font-heading text-2xl font-black neon-text">{val}</div>
                  <div className="text-muted-foreground text-sm">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Category quick-links */}
      <section className="py-8 border-y border-white/5 overflow-x-auto scrollbar-hide">
        <div className="flex gap-3 px-4 max-w-7xl mx-auto w-max md:w-full md:justify-center">
          {CATEGORIES.filter((c) => c.id !== "all").map((cat, i) => (
            <button
              key={cat.id}
              onClick={onCatalog}
              className="flex flex-col items-center gap-1.5 px-5 py-3 rounded-2xl glass border border-white/8 hover:border-lime-400/30 hover:bg-lime-400/5 transition-all animate-fade-in-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <span className="text-2xl">{cat.emoji}</span>
              <span className="text-xs font-medium text-muted-foreground">{cat.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-heading text-3xl font-black mb-1">Хиты продаж</h2>
            <p className="text-muted-foreground">Самые популярные позиции этой недели</p>
          </div>
          <button
            onClick={onCatalog}
            className="text-lime-400 text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all"
          >
            Все товары <Icon name="ArrowRight" size={14} />
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {featured.map((p, i) => (
            <ProductCard key={p.id} product={p} onAdd={onAddToCart} delay={i * 80} />
          ))}
        </div>
      </section>

      {/* Promo banner */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="relative rounded-3xl overflow-hidden glass neon-border p-8 md:p-12">
          <div className="absolute inset-0 bg-gradient-to-br from-lime-400/5 to-cyan-400/5 pointer-events-none" />
          <div className="relative flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <div className="text-4xl mb-3">🎁</div>
              <h3 className="font-heading text-2xl md:text-3xl font-black mb-2">
                Бесплатная доставка<br />от 1500 рублей
              </h3>
              <p className="text-muted-foreground mb-6">Оформите заказ сейчас и получите свежие продукты через 2 часа</p>
              <button onClick={onCatalog} className="btn-neon px-6 py-3 rounded-xl font-bold">
                Заказать сейчас
              </button>
            </div>
            <img
              src="https://cdn.poehali.dev/projects/5f88b64f-b745-4b46-b3ef-4e3ff3a00764/files/052e0f24-ed46-4cc1-aac0-ea0c271b3a8c.jpg"
              alt="ассортимент"
              className="w-full md:w-80 h-48 object-cover rounded-2xl opacity-80"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── Catalog Page ─────────────────────────────────────────────────────────────

function CatalogPage({
  search,
  setSearch,
  activeCategory,
  setActiveCategory,
  filteredProducts,
  onAddToCart,
  cart,
}: {
  search: string;
  setSearch: (s: string) => void;
  activeCategory: string;
  setActiveCategory: (c: string) => void;
  filteredProducts: typeof PRODUCTS;
  onAddToCart: (p: typeof PRODUCTS[0]) => void;
  cart: CartItem[];
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-end justify-between mb-2 animate-fade-in-up">
        <h1 className="font-heading text-3xl font-black">Каталог</h1>
        <span className="text-muted-foreground text-sm">
          {filteredProducts.length} {filteredProducts.length === 1 ? "товар" : filteredProducts.length < 5 ? "товара" : "товаров"}
        </span>
      </div>

      {/* Mobile search */}
      <div className="md:hidden mb-6 relative animate-fade-in-up delay-100">
        <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск по названию и характеристикам..."
          className="w-full pl-9 pr-4 py-3 rounded-xl bg-secondary border border-white/8 text-sm focus:outline-none focus:border-lime-400 transition-all placeholder:text-muted-foreground"
        />
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3 mb-8 animate-fade-in-up delay-200">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeCategory === cat.id
                ? "bg-lime-400 text-[#0e1410] font-bold shadow-lg shadow-lime-400/20"
                : "glass border border-white/8 text-muted-foreground hover:text-foreground hover:border-white/20"
            }`}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Products grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground animate-fade-in-up">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-xl font-semibold mb-2">Ничего не найдено</p>
          <p className="text-sm">Попробуйте другой запрос или категорию</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((p, i) => (
            <ProductCard key={p.id} product={p} onAdd={onAddToCart} delay={i * 40} cart={cart} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────

const BADGE_COLORS: Record<string, string> = {
  "Хит": "bg-orange-400/20 text-orange-400 border-orange-400/30",
  "Новинка": "bg-cyan-400/20 text-cyan-400 border-cyan-400/30",
  "Сезон": "bg-lime-400/20 text-lime-400 border-lime-400/30",
  "Акция": "bg-red-400/20 text-red-400 border-red-400/30",
  "Фреш": "bg-blue-400/20 text-blue-400 border-blue-400/30",
};

function ProductCard({
  product,
  onAdd,
  delay = 0,
  cart,
}: {
  product: typeof PRODUCTS[0];
  onAdd: (p: typeof PRODUCTS[0]) => void;
  delay?: number;
  cart?: CartItem[];
}) {
  const inCart = cart?.find((i) => i.product.id === product.id);

  return (
    <div
      className="glass border border-white/8 rounded-2xl overflow-hidden card-hover animate-fade-in-up flex flex-col"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Emoji image area */}
      <div className="h-32 bg-gradient-to-br from-secondary to-muted flex items-center justify-center relative">
        <span className="text-6xl select-none">{product.emoji}</span>
        {product.badge && (
          <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold border ${BADGE_COLORS[product.badge] ?? ""}`}>
            {product.badge}
          </span>
        )}
        {inCart && (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-lime-400/20 text-lime-400 border border-lime-400/30">
            ✓ {inCart.qty} шт
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-2 flex-1">
        <h3 className="font-semibold text-sm leading-tight">{product.name}</h3>
        <div className="flex flex-wrap gap-1">
          {product.tags.slice(0, 2).map((t) => (
            <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{t}</span>
          ))}
        </div>
        <div className="flex items-end justify-between mt-auto pt-1">
          <div>
            <span className="font-heading font-black text-lg">{product.price}₽</span>
            <span className="text-muted-foreground text-xs ml-1">/ {product.unit}</span>
          </div>
          <button
            onClick={() => onAdd(product)}
            className="w-8 h-8 rounded-xl btn-neon flex items-center justify-center shrink-0"
            title="Добавить в корзину"
          >
            <Icon name="Plus" size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Cart Drawer ──────────────────────────────────────────────────────────────

function CartDrawer({
  cart,
  total,
  onClose,
  onChangeQty,
  onCheckout,
}: {
  cart: CartItem[];
  total: number;
  onClose: () => void;
  onChangeQty: (id: number, delta: number) => void;
  onCheckout: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md z-50 flex flex-col bg-card border-l border-white/8 animate-slide-in-right">
        <div className="flex items-center justify-between p-5 border-b border-white/8">
          <h2 className="font-heading text-xl font-black">Корзина</h2>
          <button onClick={onClose} className="p-2 glass rounded-xl hover:border-white/20 transition-all">
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {cart.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <div className="text-5xl mb-4">🛒</div>
              <p className="font-semibold text-lg">Корзина пуста</p>
              <p className="text-sm mt-1">Добавьте что-нибудь из каталога</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.product.id} className="glass border border-white/8 rounded-xl p-3 flex items-center gap-3">
                <span className="text-3xl select-none">{item.product.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{item.product.name}</p>
                  <p className="text-muted-foreground text-xs">{item.product.price}₽ / {item.product.unit}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onChangeQty(item.product.id, -1)}
                    className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center hover:bg-muted transition-all"
                  >
                    <Icon name="Minus" size={12} />
                  </button>
                  <span className="w-5 text-center font-bold text-sm">{item.qty}</span>
                  <button
                    onClick={() => onChangeQty(item.product.id, +1)}
                    className="w-7 h-7 rounded-lg btn-neon flex items-center justify-center"
                  >
                    <Icon name="Plus" size={12} />
                  </button>
                </div>
                <span className="font-heading font-black text-sm w-16 text-right">{item.product.price * item.qty}₽</span>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-5 border-t border-white/8">
            <div className="flex justify-between items-center mb-3">
              <span className="text-muted-foreground">Итого:</span>
              <span className="font-heading text-2xl font-black neon-text">{total}₽</span>
            </div>
            {total < 1500 && (
              <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1.5">
                <Icon name="Info" size={12} />
                До бесплатной доставки: {1500 - total}₽
              </p>
            )}
            <button onClick={onCheckout} className="w-full btn-neon py-4 rounded-xl font-heading font-bold text-base">
              Оформить заказ →
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Cart Page ────────────────────────────────────────────────────────────────

function CartPageView({
  cart,
  cartTotal,
  onChangeQty,
}: {
  cart: CartItem[];
  cartTotal: number;
  onChangeQty: (id: number, delta: number) => void;
}) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="font-heading text-3xl font-black mb-8 animate-fade-in-up">Корзина</h1>
      {cart.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <div className="text-6xl mb-4">🛒</div>
          <p className="text-xl font-semibold">Ваша корзина пуста</p>
        </div>
      ) : (
        <div className="space-y-3">
          {cart.map((item, i) => (
            <div
              key={item.product.id}
              className="glass border border-white/8 rounded-2xl p-4 flex items-center gap-4 animate-fade-in-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <span className="text-4xl select-none">{item.product.emoji}</span>
              <div className="flex-1">
                <p className="font-semibold">{item.product.name}</p>
                <p className="text-muted-foreground text-sm">{item.product.price}₽ / {item.product.unit}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onChangeQty(item.product.id, -1)}
                  className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center hover:bg-muted transition-all"
                >
                  <Icon name="Minus" size={14} />
                </button>
                <span className="w-6 text-center font-bold">{item.qty}</span>
                <button
                  onClick={() => onChangeQty(item.product.id, +1)}
                  className="w-8 h-8 rounded-xl btn-neon flex items-center justify-center"
                >
                  <Icon name="Plus" size={14} />
                </button>
              </div>
              <span className="font-heading font-black text-lg w-20 text-right">{item.product.price * item.qty}₽</span>
            </div>
          ))}

          <div className="glass neon-border rounded-2xl p-6 mt-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-muted-foreground text-lg">Итого:</span>
              <span className="font-heading text-3xl font-black neon-text">{cartTotal}₽</span>
            </div>
            {cartTotal < 1500 && (
              <p className="text-sm text-muted-foreground mb-4">
                До бесплатной доставки осталось {1500 - cartTotal}₽
              </p>
            )}
            <button className="w-full btn-neon py-4 rounded-xl font-heading font-bold text-lg">
              Оформить заказ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── About Page ───────────────────────────────────────────────────────────────

function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="font-heading text-4xl font-black mb-3 animate-fade-in-up">О магазине</h1>
      <p className="text-muted-foreground text-xl mb-12 animate-fade-in-up delay-100">Мы доставляем только свежее и натуральное</p>

      <div className="grid md:grid-cols-3 gap-6 mb-16">
        {[
          { emoji: "🌱", title: "Фермерские продукты", text: "Работаем напрямую с фермерами Подмосковья. Никаких посредников — только честная цена." },
          { emoji: "⚡", title: "Быстрая доставка", text: "Доставляем за 2 часа. Ваши продукты никогда не теряют свежесть в дороге." },
          { emoji: "💯", title: "Гарантия качества", text: "Каждая партия проходит контроль. Не понравилось — вернём деньги без вопросов." },
        ].map((item, i) => (
          <div
            key={i}
            className={`glass border border-white/8 rounded-2xl p-6 card-hover animate-fade-in-up delay-${(i + 1) * 100}`}
          >
            <div className="text-4xl mb-4">{item.emoji}</div>
            <h3 className="font-heading font-bold text-lg mb-2">{item.title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{item.text}</p>
          </div>
        ))}
      </div>

      <div className="glass neon-border rounded-3xl p-8 text-center animate-fade-in-up delay-400">
        <p className="font-heading text-2xl font-black mb-3">С нами с 2019 года</p>
        <p className="text-muted-foreground mb-8">Более 50 000 довольных клиентов в Москве и Подмосковье</p>
        <div className="grid grid-cols-3 gap-6">
          {[["50 000+", "клиентов"], ["500+", "товаров"], ["4.9 / 5", "средний рейтинг"]].map(([v, l]) => (
            <div key={l}>
              <div className="font-heading text-3xl font-black neon-text">{v}</div>
              <div className="text-muted-foreground text-sm mt-1">{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Delivery Page ────────────────────────────────────────────────────────────

function DeliveryPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="font-heading text-4xl font-black mb-3 animate-fade-in-up">Доставка</h1>
      <p className="text-muted-foreground text-xl mb-12 animate-fade-in-up delay-100">Быстро и бережно — прямо к вашей двери</p>

      <div className="space-y-4">
        {[
          { icon: "Clock", title: "Время доставки", text: "2 часа с момента оформления заказа. Работаем ежедневно с 8:00 до 22:00.", highlight: "2 часа" },
          { icon: "MapPin", title: "Зона доставки", text: "Вся Москва и Московская область до 30 км от МКАД.", highlight: "Москва + МО" },
          { icon: "Package", title: "Бесплатная доставка", text: "При заказе от 1500 рублей — доставка бесплатно. При меньшей сумме — 199₽.", highlight: "от 1500₽" },
          { icon: "Thermometer", title: "Сохранение свежести", text: "Используем термосумки и охлаждающие элементы. Продукты доедут свежими в любую жару.", highlight: "Термоупаковка" },
        ].map((item, i) => (
          <div
            key={i}
            className={`glass border border-white/8 rounded-2xl p-5 flex gap-4 card-hover animate-fade-in-up delay-${(i + 1) * 100}`}
          >
            <div className="w-12 h-12 rounded-xl bg-lime-400/10 border border-lime-400/20 flex items-center justify-center shrink-0">
              <Icon name={item.icon} fallback="Circle" size={20} className="text-lime-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                <h3 className="font-semibold">{item.title}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-lime-400/10 text-lime-400 border border-lime-400/20 font-semibold">
                  {item.highlight}
                </span>
              </div>
              <p className="text-muted-foreground text-sm">{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Contacts Page ────────────────────────────────────────────────────────────

function ContactsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="font-heading text-4xl font-black mb-3 animate-fade-in-up">Контакты</h1>
      <p className="text-muted-foreground text-xl mb-12 animate-fade-in-up delay-100">Мы на связи — напишите или позвоните</p>

      <div className="grid md:grid-cols-2 gap-4 mb-10">
        {[
          { icon: "Phone", label: "Телефон", value: "+7 (800) 123-45-67", sub: "Бесплатно, ежедневно 8–22" },
          { icon: "Mail", label: "Email", value: "info@freshmart.ru", sub: "Ответим в течение часа" },
          { icon: "MapPin", label: "Адрес", value: "Москва, ул. Свежая, 1", sub: "Офис и пункт выдачи" },
          { icon: "MessageCircle", label: "Telegram", value: "@freshmart_bot", sub: "Отвечаем за 5 минут" },
        ].map((item, i) => (
          <div
            key={i}
            className={`glass border border-white/8 rounded-2xl p-5 flex gap-4 card-hover animate-fade-in-up delay-${(i + 1) * 100}`}
          >
            <div className="w-12 h-12 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center shrink-0">
              <Icon name={item.icon} fallback="Circle" size={20} className="text-cyan-400" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs mb-0.5">{item.label}</p>
              <p className="font-semibold">{item.value}</p>
              <p className="text-muted-foreground text-xs mt-0.5">{item.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="glass neon-border rounded-2xl p-6 animate-fade-in-up delay-500">
        <h3 className="font-heading font-bold text-lg mb-4">Напишите нам</h3>
        <div className="space-y-3">
          <input
            placeholder="Ваше имя"
            className="w-full px-4 py-3 rounded-xl bg-secondary border border-white/8 text-sm focus:outline-none focus:border-lime-400 transition-all placeholder:text-muted-foreground"
          />
          <input
            placeholder="Email или телефон"
            className="w-full px-4 py-3 rounded-xl bg-secondary border border-white/8 text-sm focus:outline-none focus:border-lime-400 transition-all placeholder:text-muted-foreground"
          />
          <textarea
            placeholder="Ваш вопрос или пожелание..."
            rows={4}
            className="w-full px-4 py-3 rounded-xl bg-secondary border border-white/8 text-sm focus:outline-none focus:border-lime-400 transition-all placeholder:text-muted-foreground resize-none"
          />
          <button className="btn-neon w-full py-3 rounded-xl font-bold">
            Отправить сообщение
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Profile Page ─────────────────────────────────────────────────────────────

function ProfilePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="font-heading text-4xl font-black mb-8 animate-fade-in-up">Личный кабинет</h1>

      <div className="glass neon-border rounded-3xl p-8 mb-6 flex items-center gap-6 animate-fade-in-up delay-100">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-lime-400/30 to-cyan-400/30 flex items-center justify-center text-4xl border border-lime-400/20 select-none">
          👤
        </div>
        <div className="flex-1">
          <h2 className="font-heading text-2xl font-black">Гость</h2>
          <p className="text-muted-foreground">Войдите, чтобы видеть историю заказов</p>
        </div>
        <button className="btn-neon px-6 py-3 rounded-xl font-bold shrink-0">Войти</button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {[
          { icon: "ShoppingBag", title: "Мои заказы", text: "История заказов и статус доставки" },
          { icon: "Heart", title: "Избранное", text: "Сохранённые товары и списки" },
          { icon: "MapPin", title: "Адреса доставки", text: "Управление адресами доставки" },
          { icon: "Settings", title: "Настройки", text: "Уведомления и данные профиля" },
        ].map((item, i) => (
          <button
            key={i}
            className={`glass border border-white/8 rounded-2xl p-5 flex items-center gap-4 card-hover text-left animate-fade-in-up delay-${(i + 1) * 100}`}
          >
            <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center shrink-0">
              <Icon name={item.icon} fallback="Circle" size={20} className="text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold text-sm">{item.title}</p>
              <p className="text-muted-foreground text-xs mt-0.5">{item.text}</p>
            </div>
            <Icon name="ChevronRight" size={16} className="ml-auto text-muted-foreground" />
          </button>
        ))}
      </div>
    </div>
  );
}