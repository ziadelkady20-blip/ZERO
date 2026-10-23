"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type Variant = { id: string; size: string; color: string; stock: number; sku: string };
type Product = {
  id: string; slug: string; nameEn: string; nameAr: string; descriptionEn: string; descriptionAr: string;
  price: number; compareAtPrice?: number | null; active: boolean; category: { nameEn: string; nameAr: string; slug: string };
  images: { url: string; alt: string; position: number }[]; variants: Variant[];
};
type CartItem = { variantId: string; productId: string; nameEn: string; nameAr: string; image: string; size: string; color: string; price: number; quantity: number; stock: number };
const CART_KEY = "zero-cart-v1";

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [locale, setLocale] = useState<"en" | "ar">("en");
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [notice, setNotice] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const ar = locale === "ar";

  useEffect(() => {
    fetch("/api/products").then(r => r.json()).then(data => {
      const found = (data.products || []).find((p: Product) => p.slug === params.slug);
      if (found) {
        setProduct(found);
        setSelectedImage(0);
        const firstAvailable = found.variants.find((v: Variant) => v.stock > 0) || found.variants[0];
        if (firstAvailable) { setSize(firstAvailable.size); setColor(firstAvailable.color); }
      }
    }).catch(() => setNotice("Could not load this product. Please try again."))
      .finally(() => setLoading(false));
  }, [params.slug]);

  const sizes = useMemo(() => Array.from(new Set((product?.variants || []).map(v => v.size))), [product]);
  const colors = useMemo(() => Array.from(new Set((product?.variants || []).filter(v => v.size === size).map(v => v.color))), [product, size]);
  const variant = product?.variants.find(v => v.size === size && v.color === color);
  const image = product?.images[selectedImage]?.url || product?.images[0]?.url || "";
  const title = product ? (ar ? product.nameAr : product.nameEn) : "";
  const description = product ? (ar ? product.descriptionAr : product.descriptionEn) : "";

  function addToBag() {
    if (!product || !variant || variant.stock < 1) {
      setNotice(ar ? "اختار لون ومقاس متاحين الأول." : "Choose an available size and color first.");
      return;
    }
    try {
      const current = JSON.parse(localStorage.getItem(CART_KEY) || "{}") as Record<string, CartItem>;
      const existing = current[variant.id];
      if ((existing?.quantity || 0) + quantity > variant.stock) {
        setNotice(ar ? "الكمية المطلوبة أكبر من المتاح للمقاس واللون دول." : "Requested quantity exceeds stock for this size and color.");
        return;
      }
      current[variant.id] = existing
        ? { ...existing, quantity: existing.quantity + quantity, stock: variant.stock }
        : { variantId: variant.id, productId: product.id, nameEn: product.nameEn, nameAr: product.nameAr, image, size: variant.size, color: variant.color, price: product.price, quantity, stock: variant.stock };
      localStorage.setItem(CART_KEY, JSON.stringify(current));
      router.push("/shop?cart=updated");
    } catch {
      setNotice(ar ? "حصلت مشكلة في إضافة المنتج للسلة." : "Could not add this item to your bag.");
    }
  }

  return <main className="zero-detail" dir={ar ? "rtl" : "ltr"}>
    <header className="zero-detail-header">
      <Link href="/" className="zero-detail-logo">ZERO<span>.</span></Link>
      <nav><Link href="/shop">{ar ? "كل المنتجات" : "ALL PRODUCTS"}</Link><Link href="/track-order">{ar ? "تتبع الطلب" : "TRACK ORDER"}</Link><button onClick={() => setLocale(ar ? "en" : "ar")}>{ar ? "English" : "العربية"}</button></nav>
    </header>
    <div className="zero-detail-breadcrumb"><Link href="/">{ar ? "الرئيسية" : "HOME"}</Link><span>/</span><Link href="/shop">{ar ? "المتجر" : "SHOP"}</Link><span>/</span><span>{product?.category?.nameEn || "ZERO"}</span></div>
    {loading ? <div className="zero-detail-state">{ar ? "جاري تحميل المنتج…" : "LOADING PRODUCT…"}</div> : !product ? <section className="zero-detail-state"><p className="zero-detail-eyebrow">ZERO / PRODUCT</p><h1>{ar ? "المنتج مش موجود في المخزون لسه." : "This product isn't in the catalog yet."}</h1><p>{ar ? "لما تضيف المنتج من لوحة الإدارة بالصور والمقاسات والألوان، هتظهر صفحته هنا." : "Once this product is added from the admin dashboard with its images, sizes, and colors, its detail page will appear here."}</p><Link className="zero-detail-button" href="/shop">{ar ? "ارجع للمتجر" : "BACK TO SHOP"} ↗</Link></section> : <section className="zero-detail-layout">
      <div className="zero-detail-gallery-wrap">
      <div className="zero-detail-gallery">
        {image ? <img key={image} className="zero-detail-main-image" src={image} alt={product.images[selectedImage]?.alt || title} onError={(event) => { event.currentTarget.style.display = "none"; }} /> : <div className="zero-detail-image-fallback">ZERO<span>.</span><small>{ar ? "أضف صورة المنتج من لوحة الإدارة" : "ADD PRODUCT IMAGE IN ADMIN"}</small></div>}
        <span className="zero-detail-image-tag">ZERO / PERFORMANCE ESSENTIALS</span>
      </div>
      {product.images.length > 1 && <div className="zero-detail-thumbnails" aria-label={ar ? "صور المنتج" : "Product images"}>{product.images.map((item,index)=><button type="button" key={item.url+index} className={selectedImage===index?"active":""} onClick={()=>setSelectedImage(index)} aria-label={ar?`عرض الصورة ${index+1}`:`Show image ${index+1}`}><img src={item.url} alt={item.alt||`${title} ${index+1}`}/></button>)}</div>}
      </div>
      <div className="zero-detail-info">
        <p className="zero-detail-eyebrow">{product.category?.nameEn || "ZERO CLOTHING"} / MEN’S COLLECTION</p>
        <h1>{title}</h1>
        <p className="zero-detail-price">{product.compareAtPrice && product.compareAtPrice > product.price && <del>{product.compareAtPrice.toLocaleString(ar ? "ar-EG" : "en-EG")} </del>}{product.price.toLocaleString(ar ? "ar-EG" : "en-EG")} <span>{ar ? "جنيه" : "EGP"}</span></p>
        <p className="zero-detail-description">{description || (ar ? "تصميم رياضي بقصة دقيقة، مناسب للحركة واللبس اليومي." : "A clean athletic fit designed for movement and everyday wear.")}</p>
        <div className="zero-detail-rule" />
        {product.sizeChartUrl && <section className="zero-size-chart"><h2>{ar ? "جدول المقاسات" : "SIZE CHART"}</h2><button type="button" className="zero-size-chart-image-button" onClick={() => window.open(product.sizeChartUrl!, "_blank", "noopener,noreferrer")} aria-label={ar ? "عرض جدول المقاسات بحجم كامل" : "Open full size chart"}><img src={product.sizeChartUrl} alt={ar ? "جدول مقاسات المنتج" : "Product size chart"} loading="lazy"/></button></section>}
        <div className="zero-detail-option-head"><label>{ar ? "المقاس" : "SIZE"}</label><span>{size || (ar ? "اختار المقاس" : "SELECT SIZE")}</span></div>
        <div className="zero-detail-size-grid">{sizes.map(s => {
          const hasStock = product.variants.some(v => v.size === s && v.stock > 0);
          return <button key={s} className={size === s ? "selected" : ""} disabled={!hasStock} onClick={() => { setSize(s); const nextColor = product.variants.find(v => v.size === s && v.stock > 0)?.color || product.variants.find(v => v.size === s)?.color || ""; setColor(nextColor); setQuantity(1); }}>{s}</button>;
        })}</div>
        <div className="zero-detail-option-head"><label>{ar ? "اللون" : "COLOR"}</label><span>{color || (ar ? "اختار اللون" : "SELECT COLOR")}</span></div>
        <div className="zero-detail-colors">{colors.map(c => {
          const available = product.variants.some(v => v.size === size && v.color === c && v.stock > 0);
          return <button key={c} className={color === c ? "selected" : ""} disabled={!available} onClick={() => { setColor(c); setQuantity(1); }}><span className={"zero-color-swatch " + c.toLowerCase().replace(/[^a-z0-9]+/g, "-")} />{c}{!available && <small> · {ar ? "نفد" : "SOLD OUT"}</small>}</button>;
        })}</div>
        <div className="zero-detail-stock">{variant && variant.stock > 0 ? <><span className="zero-stock-dot" />{ar ? "متاح" : "IN STOCK"} · {variant.stock} {ar ? "قطعة" : "LEFT"}</> : <span className="zero-sold-out">{ar ? "المقاس واللون غير متاحين" : "THIS COMBINATION IS SOLD OUT"}</span>}</div>
        <div className="zero-detail-buy-row"><div className="zero-detail-quantity"><button disabled={quantity <= 1} onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button><span>{quantity}</span><button disabled={!variant || quantity >= variant.stock} onClick={() => setQuantity(q => q + 1)}>+</button></div><button className="zero-detail-button" disabled={!variant || variant.stock < 1} onClick={addToBag}>{ar ? "أضف للسلة" : "ADD TO BAG"} <span>↗</span></button></div>
        {notice && <p className="zero-detail-notice">{notice}</p>}
        <div className="zero-detail-perks"><p><span>01</span>{ar ? "الدفع عند الاستلام" : "CASH ON DELIVERY"}</p><p><span>02</span>{ar ? "المقاس واللون بيتأكدوا في الطلب" : "YOUR SIZE & COLOR ARE SAVED WITH THE ORDER"}</p></div>
      </div>
    </section>}
    <footer className="zero-detail-footer">ZERO CLOTHING <span>MEN’S PERFORMANCE WEAR · CAIRO, EGYPT</span></footer>
  </main>;
}
