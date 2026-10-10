"use client";

const ZERO_MODEL_IMAGE = "https://raw.githubusercontent.com/ziadelkady20-blip/ZERO/main/hero%20zero.png";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  Check,
  ChevronDown,
  Heart,
  Menu,
  Search,
  ShoppingBag,
  X,
} from "lucide-react";

type Locale = "en" | "ar";
type Product = {
  id: number;
  slug: string;
  name: string;
  category: string;
  price: number;
  badge?: string;
  image: string;
  imageAlt: string;
};

const products: Product[] = [];

const copy = {
  en: {
    announcement: "ZERO MENSWEAR — EVERYDAY ESSENTIALS, REDEFINED",
    shop: "Shop",
    compression: "Compression",
    tees: "T-Shirts",
    ourStandard: "Our Standard",
    search: "Search",
    bag: "Bag",
    heroEyebrow: "ZERO MENSWEAR · DESIGNED FOR EVERY DAY",
    heroTitleA: "DISCIPLINE",
    heroTitleB: "IN EVERY",
    heroTitleC: "DETAIL.",
    heroDescription: "Considered essentials. Timeless silhouettes. Made to move naturally between every part of your day.",
    shopCollection: "SHOP THE COLLECTION",
    categoriesEyebrow: "THE MEN’S WARDROBE",
    categoriesTitle: "Built for his everyday.",
    categoriesDescription: "Two essentials to start with: clean everyday T-shirts and close-fit ZERO compression built for movement.",
    categoryTee: "T-SHIRTS",
    categoryCompression: "COMPRESSION",
    categoryHoodie: "HOODIES",
    categoryPants: "PANTS",
    categoryAccessories: "MEN’S ACCESSORIES",
    categoryExplore: "EXPLORE",
    bestsellerEyebrow: "THE ZERO EDIT",
    explore: "EXPLORE THE DROP",
    collectionEyebrow: "THE STARTING LINE",
    collectionTitle: "Menswear. No excess.",
    collectionDescription: "Versatile menswear essentials. Refined fits. Pieces that work with your style, wherever the day takes you.",
    all: "All products",
    add: "Add to bag",
    added: "Added",
    egp: "EGP",
    viewAll: "VIEW ALL PRODUCTS",
    manifestoEyebrow: "LESS, BUT BETTER.",
    manifestoTitle: "His style. His standard.",
    manifestoBody: "ZERO is menswear built around thoughtful design, versatile essentials, and lasting comfort. A considered wardrobe for the way you live now—and whatever comes next.",
    manifestoCta: "OUR STANDARD",
    footerLine: "Considered menswear. Your everyday standard.",
    quickLinks: "QUICK LINKS",
    support: "SUPPORT",
    shipping: "Shipping & delivery",
    returns: "Exchange & returns",
    contact: "Contact",
    newsletter: "THE ZERO LIST",
    newsletterText: "Drop updates. No noise.",
    emailPlaceholder: "Your email address",
    join: "JOIN",
    rights: "© 2026 ZERO CLOTHING. ALL RIGHTS RESERVED.",
    cartTitle: "Your bag",
    emptyBag: "Your bag is empty.",
    subtotal: "Subtotal",
    checkoutNote: "Cash on Delivery available at checkout.",
    continue: "CONTINUE SHOPPING",
    language: "العربية",
    searchPlaceholder: "Search products…",
    noResults: "No products found.",
  },
  ar: {
    announcement: "ZERO للملابس الرجالي — أساسيات يومك بمعايير مختلفة",
    shop: "تسوّق",
    compression: "كومبريشن",
    tees: "تيشيرتات",
    ourStandard: "معاييرنا",
    search: "بحث",
    bag: "السلة",
    heroEyebrow: "ZERO للملابس الرجالي · مصممة لكل يوم",
    heroTitleA: "التفاصيل",
    heroTitleB: "تصنع",
    heroTitleC: "الفرق.",
    heroDescription: "قطع أساسية بتصميم مدروس وقصّات مريحة، تناسب يومك وتكمل معاك في كل وقت.",
    shopCollection: "تسوّق المجموعة",
    categoriesEyebrow: "دولابك، بمعايير ZERO",
    categoriesTitle: "ستايل رجالي لكل يوم.",
    categoriesDescription: "هنبدأ بفئتين أساسيتين: تيشيرتات يومية بتصميم نظيف، وكومبريشن ZERO بقَصّة مظبوطة للحركة.",
    categoryTee: "تيشيرتات",
    categoryCompression: "كومبريشن",
    categoryHoodie: "هوديز",
    categoryPants: "بناطيل",
    categoryAccessories: "إكسسوارات رجالي",
    categoryExplore: "اكتشف",
    bestsellerEyebrow: "اختيارات ZERO",
    explore: "اكتشف المجموعة",
    collectionEyebrow: "خط البداية",
    collectionTitle: "ملابس رجالي من غير تكلف.",
    collectionDescription: "قطع رجالي أساسية بتفاصيل متقنة وقصّات متعددة الاستخدام، تناسب أسلوبك في أي وقت.",
    all: "كل المنتجات",
    add: "أضف للسلة",
    added: "اتضاف",
    egp: "جنيه",
    viewAll: "عرض كل المنتجات",
    manifestoEyebrow: "الأقل، لكن الأفضل.",
    manifestoTitle: "ستايلك. معاييرك.",
    manifestoBody: "ZERO للملابس الرجالي، مبنية على التصميم المدروس والقطع الأساسية متعددة الاستخدام والراحة اللي تكمل معاك. دولاب يناسب حياتك دلوقتي وكل اللي جاي.",
    manifestoCta: "معاييرنا",
    footerLine: "ملابس رجالي بتفاصيل مدروسة. معاييرك اليومية.",
    quickLinks: "روابط سريعة",
    support: "المساعدة",
    shipping: "الشحن والتوصيل",
    returns: "الاستبدال والاسترجاع",
    contact: "تواصل معنا",
    newsletter: "قائمة ZERO",
    newsletterText: "آخر الإصدارات، من غير دوشة.",
    emailPlaceholder: "بريدك الإلكتروني",
    join: "اشترك",
    rights: "© 2026 ZERO CLOTHING. جميع الحقوق محفوظة.",
    cartTitle: "سلة مشترياتك",
    emptyBag: "السلة لسه فاضية.",
    subtotal: "الإجمالي الفرعي",
    checkoutNote: "الدفع عند الاستلام متاح عند إتمام الطلب.",
    continue: "كمّل تسوّق",
    language: "English",
    searchPlaceholder: "ابحث عن منتج…",
    noResults: "مفيش منتجات مطابقة.",
  },
};

export default function HomePage() {
  const [locale, setLocale] = useState<Locale>("en");
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState<Record<number, number>>({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [addedProduct, setAddedProduct] = useState<number | null>(null);
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch("/api/products").then((response) => response.json()).then((data) => {
      if (!Array.isArray(data.products)) return;
      setCatalogProducts(data.products.map((item: { id: string; slug: string; nameEn: string; nameAr: string; price: number; category?: { slug?: string; nameEn?: string }; images?: { url: string; alt?: string }[]; featured?: boolean }, index: number) => ({
        id: index + 1, slug: item.slug, name: locale === "ar" ? item.nameAr : item.nameEn,
        category: (item.category?.slug || item.category?.nameEn || "").toLowerCase().includes("compression") ? "Compression" : "T-Shirts",
        price: item.price, badge: item.featured ? "FEATURED" : undefined, image: item.images?.[0]?.url || ZERO_MODEL_IMAGE,
        imageAlt: item.images?.[0]?.alt || (locale === "ar" ? "موديل رجالي بملابس ZERO الرياضية" : "Male model wearing ZERO performance wear"),
      })));
    }).catch(() => {});
  }, [locale]);

  const t = copy[locale];
  const isArabic = locale === "ar";
  const cartCount = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  const subtotal = catalogProducts.reduce((sum, product) => sum + product.price * (cart[product.id] || 0), 0);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return catalogProducts.filter((product) => {
      const categoryMatches = activeCategory === "All" || product.category === activeCategory;
      const searchMatches = !normalizedQuery || product.name.toLowerCase().includes(normalizedQuery) || product.category.toLowerCase().includes(normalizedQuery);
      return categoryMatches && searchMatches;
    });
  }, [activeCategory, query, catalogProducts]);

  function addToCart(productId: number) {
    setCart((current) => ({ ...current, [productId]: (current[productId] || 0) + 1 }));
    setAddedProduct(productId);
    window.setTimeout(() => setAddedProduct((current) => current === productId ? null : current), 1200);
  }

  function updateQuantity(productId: number, change: number) {
    setCart((current) => {
      const nextQuantity = (current[productId] || 0) + change;
      const next = { ...current };
      if (nextQuantity <= 0) delete next[productId];
      else next[productId] = nextQuantity;
      return next;
    });
  }

  return (
    <main className={isArabic ? "site-shell rtl" : "site-shell"} dir={isArabic ? "rtl" : "ltr"}>
      <div className="announcement-bar">
        <span>{t.announcement}</span>
      </div>

      <header className="site-header">
        <button className="icon-button mobile-menu-trigger" aria-label="Open menu" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <a className="brand-lockup" href="#" aria-label="ZERO CLOTHING home">
          <img className="brand-logo-image" src="https://raw.githubusercontent.com/ziadelkady20-blip/ZERO/main/IMG_0832.PNG" alt="ZERO CLOTHING official logo" />
        </a>

        <nav className={mobileMenuOpen ? "main-nav is-open" : "main-nav"} aria-label="Main navigation">
          <a href="/shop" onClick={() => setMobileMenuOpen(false)}>{t.shop}</a>
          <a href="#collection" onClick={() => { setActiveCategory("Compression"); setMobileMenuOpen(false); }}>{t.compression}</a>
          <a href="#collection" onClick={() => { setActiveCategory("T-Shirts"); setMobileMenuOpen(false); }}>{t.tees}</a>
          <a href="#standard" onClick={() => setMobileMenuOpen(false)}>{t.ourStandard}</a>
        </nav>

        <div className="header-actions">
          <button className="text-action language-toggle" onClick={() => setLocale(isArabic ? "en" : "ar")} aria-label="Switch language">
            {t.language}
          </button>
          <button className="icon-button" aria-label={t.search} onClick={() => setSearchOpen(!searchOpen)}>
            <Search size={19} strokeWidth={1.7} />
          </button>
          <button className="bag-button" aria-label={t.bag} onClick={() => setCartOpen(true)}>
            <ShoppingBag size={19} strokeWidth={1.7} />
            <span>{t.bag}</span>
            <span className="bag-count">{cartCount}</span>
          </button>
        </div>
      </header>

      {searchOpen && (
        <div className="search-panel">
          <Search size={18} />
          <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.searchPlaceholder} aria-label={t.searchPlaceholder} />
          {query && <button className="icon-button small" onClick={() => setQuery("")} aria-label="Clear search"><X size={16} /></button>}
          <button className="icon-button small" onClick={() => setSearchOpen(false)} aria-label="Close search"><X size={18} /></button>
        </div>
      )}

      <section className="hero-section">
        <div className="hero-image" role="img" aria-label="Minimal monochrome clothing editorial" />
        <div className="hero-shade" />
        <div className="hero-floating-products">
          <div className="hero-model-frame"><img src={ZERO_MODEL_IMAGE} alt="Male model wearing a white ZERO compression shirt" /></div>
          <div className="hero-orbit hero-orbit-one" /><div className="hero-orbit hero-orbit-two" />
          <div className="hero-product-caption"><span>ZERO / 001</span><span>MEN’S EVERYDAY TEE</span></div>
        </div>
        <div className="hero-content">
          <p className="eyebrow"><span className="eyebrow-line" />{t.heroEyebrow}</p>
          <h1>{t.heroTitleA}<br /><span>{t.heroTitleB}</span> <em>{t.heroTitleC}</em></h1>
          <p className="hero-description">{t.heroDescription}</p>
          <a className="button button-light" href="/shop">
            {t.shopCollection}<ArrowRight size={17} />
          </a>
          <div className="hero-index"><span>01</span><span className="index-rule" /><span>04</span></div>
        </div>
        <div className="hero-vertical-note">ZERO / EVERYDAY COLLECTION</div>
        <div className="hero-bottom-note"><span>MADE FOR EVERYDAY</span><ArrowDownRight size={18} /></div>
      </section>

      <section className="ticker" aria-label="Brand statement">
        <div className="ticker-track">
          {Array.from({ length: 4 }).map((_, index) => (
            <span key={index}>MADE FOR EVERY DAY <b>✳</b> DETAILS MATTER <b>✳</b> ZERO COMPROMISE <b>✳</b></span>
          ))}
        </div>
      </section>

      <section className="category-section section-pad" aria-labelledby="category-title">
        <div className="category-heading">
          <div><p className="eyebrow dark-eyebrow"><span className="eyebrow-line" />{t.categoriesEyebrow}</p><h2 id="category-title">{t.categoriesTitle}</h2><p>{t.categoriesDescription}</p></div>
          <span className="category-count">01 — 02</span>
        </div>
        <div className="category-grid">
          <a href="#collection" className="category-card category-card-tee" onClick={() => setActiveCategory("T-Shirts")}><img src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1100&q=90" alt="Male model wearing a clean everyday T-shirt" /><span className="category-index">01 / EVERYDAY ESSENTIALS</span><span className="category-title">{t.categoryTee}</span><span className="category-arrow"><ArrowDownRight size={18}/></span></a>
          <a href="#collection" className="category-card category-card-compression" onClick={() => setActiveCategory("Compression")}><img src={ZERO_MODEL_IMAGE} alt="Male model wearing a white ZERO compression shirt" /><span className="category-index">02 / PERFORMANCE FIT</span><span className="category-title">{t.categoryCompression}</span><span className="category-arrow"><ArrowDownRight size={18}/></span></a>
        </div>   </section>

      <section className="collection-section section-pad" id="collection">
        <div className="section-heading">
          <div>
            <p className="eyebrow dark-eyebrow"><span className="eyebrow-line" />{t.bestsellerEyebrow} · {t.collectionEyebrow}</p>
            <h2>{t.collectionTitle}</h2>
            <p className="section-description">{t.collectionDescription}</p>
          </div>
          <a className="underlined-link desktop-view-all" href="/shop">{t.viewAll}<ArrowRight size={16} /></a>
        </div>

        <div className="collection-toolbar">
          <div className="filter-list" aria-label="Filter products">
            {[
              { value: "All", label: t.all },
              { value: "Compression", label: t.compression },
              { value: "T-Shirts", label: t.tees },
            ].map((filter) => (
              <button key={filter.value} className={activeCategory === filter.value ? "filter-chip active" : "filter-chip"} onClick={() => setActiveCategory(filter.value)}>
                {filter.label}
              </button>
            ))}
          </div>
          <span className="product-count">{String(filteredProducts.length).padStart(2, "0")} PRODUCTS</span>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="product-grid">
            {filteredProducts.map((product, index) => (
              <article className="product-card" key={product.id}>
                <div className="product-image-wrap">
                  <img src={product.image} alt={product.imageAlt} className="product-image" loading={index > 1 ? "lazy" : "eager"} />
                  {product.badge && <span className="product-badge">{product.badge}</span>}
                  <button className="wishlist-button" aria-label={"Save " + product.name}><Heart size={18} strokeWidth={1.6} /></button>
                  <a className="quick-add" href={`/product/${product.slug}`}>
                    {isArabic ? "عرض المنتج" : "VIEW PRODUCT"}<ArrowRight size={15} />
                  </a>
                </div>
                <div className="product-info">
                  <div>
                    <p className="product-category">{isArabic ? (product.category === "Compression" ? "كومبريشن" : "تيشيرتات") : product.category}</p>
                    <h3><a className="product-name-link" href={`/product/${product.slug}`}>{isArabic ? ({
                      1: "تيشيرت كومبريشن كور",
                      2: "تيشيرت التدريب الأساسي",
                      3: "تيشيرت أداء بأكمام طويلة",
                      4: "تيشيرت أوفر سايز يومي",
                    } as Record<number, string>)[product.id] || product.name : product.name}</a></h3>
                  </div>
                  <p className="product-price">{product.price.toLocaleString(isArabic ? "ar-EG" : "en-EG")} <span>{t.egp}</span></p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-results">{t.noResults}</div>
        )}
        <a className="underlined-link mobile-view-all" href="/shop">{t.viewAll}<ArrowRight size={16} /></a>
      </section>

      <section className="manifesto-section" id="standard">
        <div className="manifesto-image"><img src={ZERO_MODEL_IMAGE} alt="Male model wearing a white ZERO compression shirt" loading="lazy" /></div>
        <div className="manifesto-content">
          <p className="eyebrow"><span className="eyebrow-line" />{t.manifestoEyebrow}</p>
          <h2>{t.manifestoTitle}</h2>
          <p>{t.manifestoBody}</p>
          <a href="#collection" className="button button-outline">{t.manifestoCta}<ArrowRight size={17} /></a>
          <span className="manifesto-mark">Z.</span>
        </div>
      </section>

      <section className="benefits-row">
        <div><span className="benefit-number">01</span><div><strong>DESIGNED TO MOVE</strong><p>Comfort for every day.</p></div></div>
        <div><span className="benefit-number">02</span><div><strong>LESS, BUT BETTER</strong><p>Essentials without the noise.</p></div></div>
        <div><span className="benefit-number">03</span><div><strong>MADE TO LAST</strong><p>Essentials you reach for.</p></div></div>
      </section>

      <footer className="site-footer">
        <div className="footer-top">
          <div className="footer-brand">
            <a className="brand-lockup footer-lockup" href="#">
              <img className="brand-logo-image" src="https://raw.githubusercontent.com/ziadelkady20-blip/ZERO/main/IMG_0832.PNG" alt="ZERO CLOTHING official logo" />
            </a>
            <p>{t.footerLine}</p>
          </div>
          <div className="footer-links"><h3>{t.quickLinks}</h3><a href="#collection">{t.shop}</a><a href="#standard">{t.ourStandard}</a><a href="#collection">{t.compression}</a><a href="#collection">{t.tees}</a></div>
          <div className="footer-links"><h3>{t.support}</h3><a href="/track-order">{isArabic ? "تتبع طلبك" : "Track your order"}</a><a href="#shipping">{t.shipping}</a><a href="#returns">{t.returns}</a><a href="mailto:hello@zeroclothing.example">{t.contact}</a></div>
          <div className="footer-newsletter"><h3>{t.newsletter}</h3><p>{t.newsletterText}</p><form onSubmit={(event) => event.preventDefault()} className="newsletter-form"><input type="email" placeholder={t.emailPlaceholder} aria-label={t.emailPlaceholder} /><button type="submit">{t.join}<ArrowRight size={15} /></button></form></div>
        </div>
        <div className="footer-bottom"><span>{t.rights}</span><span>CAIRO, EGYPT · ZERO STANDARD</span></div>
      </footer>

      {cartOpen && (
        <div className="overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setCartOpen(false); }}>
          <aside className="cart-drawer" aria-label={t.cartTitle}>
            <div className="drawer-header"><h2>{t.cartTitle}<span> ({cartCount})</span></h2><button className="icon-button" onClick={() => setCartOpen(false)} aria-label="Close cart"><X size={20} /></button></div>
            {cartCount === 0 ? (
              <div className="empty-cart"><ShoppingBag size={30} strokeWidth={1.2} /><p>{t.emptyBag}</p><button className="button button-dark" onClick={() => setCartOpen(false)}>{t.continue}</button></div>
            ) : (
              <>
                <div className="cart-items">
                  {products.filter((product) => cart[product.id]).map((product) => (
                    <div className="cart-item" key={product.id}>
                      <img src={product.image} alt={product.imageAlt} />
                      <div className="cart-item-details"><h3>{product.name}</h3><p>{product.price.toLocaleString(isArabic ? "ar-EG" : "en-EG")} {t.egp}</p><div className="quantity-control"><button onClick={() => updateQuantity(product.id, -1)} aria-label="Decrease quantity">−</button><span>{cart[product.id]}</span><button onClick={() => updateQuantity(product.id, 1)} aria-label="Increase quantity">+</button></div></div>
                      <button className="remove-item" onClick={() => setCart((current) => { const next = { ...current }; delete next[product.id]; return next; })} aria-label="Remove item"><X size={16} /></button>
                    </div>
                  ))}
                </div>
                <div className="cart-summary"><div><span>{t.subtotal}</span><strong>{subtotal.toLocaleString(isArabic ? "ar-EG" : "en-EG")} {t.egp}</strong></div><p>{t.checkoutNote}</p><button className="button button-dark checkout-disabled" disabled>CHECKOUT — COMING NEXT</button></div>
              </>
            )}
          </aside>
        </div>
      )}
    </main>
  );
}
