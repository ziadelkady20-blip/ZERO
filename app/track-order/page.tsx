"use client";

import "./track.css";
import { useState, type FormEvent } from "react";
import Link from "next/link";

type TrackedOrderItem = {
  productNameEn: string;
  productNameAr: string;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  components?: {
    product: { nameEn: string; nameAr: string };
    variant: { size: string; color: string };
    quantity: number;
  }[];
};

type TrackedOrder = {
  code: string;
  status: string;
  createdAt: string;
  subtotal: number;
  discountAmount: number;
  couponCode?: string | null;
  shippingCost: number;
  total: number;
  items: TrackedOrderItem[];
};

const steps = [
  { status: "PENDING", en: "Received", ar: "تم استلام الطلب", noteEn: "Your order has reached ZERO.", noteAr: "طلبك وصلنا بنجاح." },
  { status: "CONFIRMED", en: "Confirmed", ar: "تم تأكيد الطلب", noteEn: "The order details have been confirmed.", noteAr: "تمت مراجعة بيانات طلبك وتأكيده." },
  { status: "PREPARING", en: "Preparing", ar: "جاري التجهيز", noteEn: "Your items are being prepared.", noteAr: "يتم تجهيز القطع الخاصة بطلبك." },
  { status: "SHIPPED", en: "On the way", ar: "خرج للتوصيل", noteEn: "Your order is on its way to you.", noteAr: "طلبك في الطريق إليك." },
  { status: "DELIVERED", en: "Delivered", ar: "تم التوصيل", noteEn: "Your order has been delivered.", noteAr: "تم تسليم طلبك." },
];

const statusLabels: Record<string, { en: string; ar: string }> = {
  PENDING: { en: "Order received", ar: "تم استلام الطلب" },
  CONFIRMED: { en: "Confirmed", ar: "تم تأكيد الطلب" },
  PREPARING: { en: "Being prepared", ar: "جاري تجهيز الطلب" },
  SHIPPED: { en: "On the way", ar: "الطلب في الطريق" },
  DELIVERED: { en: "Delivered", ar: "تم التوصيل" },
  CANCELLED: { en: "Cancelled", ar: "تم إلغاء الطلب" },
};

function money(value: number, ar: boolean) {
  return `${value.toLocaleString(ar ? "ar-EG" : "en-EG")} ${ar ? "جنيه" : "EGP"}`;
}

export default function TrackOrderPage() {
  const [code, setCode] = useState("");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [locale, setLocale] = useState<"en" | "ar">("en");
  const [lastChecked, setLastChecked] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const ar = locale === "ar";

  async function lookup() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ code, phone }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not find this order.");
      setOrder(data.order);
      setLastChecked(new Date().toISOString());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Tracking is temporarily unavailable.");
    } finally {
      setBusy(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void lookup();
  }

  async function copyCode() {
    if (!order) return;
    try {
      await navigator.clipboard.writeText(order.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError(ar ? "تعذر نسخ رقم الطلب." : "Could not copy the order number.");
    }
  }

  const activeStep = order ? steps.findIndex(step => step.status === order.status) : -1;
  const status = order ? statusLabels[order.status] || statusLabels.PENDING : null;

  return (
    <main className="track-shell" dir={ar ? "rtl" : "ltr"}>
      <header className="track-header">
        <Link href="/" className="track-logo">ZERO<span>.</span></Link>
        <nav className="track-header-actions">
          <Link href="/shop">{ar ? "العودة للتسوق" : "BACK TO SHOP"}</Link>
          <button type="button" onClick={() => setLocale(ar ? "en" : "ar")}>{ar ? "English" : "العربية"}</button>
        </nav>
      </header>

      <section className="track-content">
        <p className="track-eyebrow">{ar ? "ZERO CLOTHING / متابعة الطلب" : "ZERO CLOTHING / ORDER LOOKUP"}</p>
        <h1>{ar ? "تابع طلبك خطوة بخطوة." : "Your order, step by step."}</h1>
        <p className="track-intro">
          {ar
            ? "اكتب كود الطلب ورقم الموبايل المستخدم وقت الشراء لمشاهدة آخر تحديث وتفاصيل الفاتورة."
            : "Enter your order number and checkout phone to see its latest status and a full order summary."}
        </p>

        <form className="track-form" onSubmit={submit}>
          <label>
            <span>{ar ? "كود الطلب" : "ORDER NUMBER"}</span>
            <input value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="ZERO-A1B2C3D4" autoComplete="off" required />
          </label>
          <label>
            <span>{ar ? "رقم الموبايل" : "CHECKOUT PHONE"}</span>
            <input type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder={ar ? "01xxxxxxxxx" : "Your checkout phone number"} required />
          </label>
          <button type="submit" disabled={busy}>
            {busy ? (ar ? "جاري البحث..." : "CHECKING...") : (ar ? "اعرض حالة الطلب" : "TRACK ORDER")}
            <span aria-hidden="true">↗</span>
          </button>
        </form>

        {error && <p className="track-error" role="alert">{error}</p>}

        {order && status && (
          <section className="track-result" aria-live="polite">
            <div className="track-result-head">
              <div>
                <small>{ar ? "رقم الطلب" : "ORDER NUMBER"}</small>
                <h2>{order.code}</h2>
                <p>{ar ? "تاريخ الطلب" : "PLACED ON"} · {new Date(order.createdAt).toLocaleDateString(ar ? "ar-EG" : "en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
              </div>
              <div className="track-head-actions">
                <span className={`track-status-badge ${order.status.toLowerCase()}`}>{ar ? status.ar : status.en}</span>
                <button type="button" className="track-copy" onClick={() => void copyCode()}>{copied ? (ar ? "تم النسخ" : "COPIED") : (ar ? "نسخ الرقم" : "COPY NUMBER")}</button>
              </div>
            </div>

            {order.status === "CANCELLED" ? (
              <div className="track-cancelled">
                <strong>{ar ? "تم إلغاء هذا الطلب" : "This order was cancelled"}</strong>
                <p>{ar ? "لو محتاج مساعدة بخصوص الإلغاء، تواصل مع فريق ZERO." : "Contact ZERO if you need help with this cancellation."}</p>
              </div>
            ) : (
              <div className="track-progress-wrap">
                <div className="track-progress-heading">
                  <div>
                    <small>{ar ? "الحالة الحالية" : "CURRENT STATUS"}</small>
                    <h3>{ar ? status.ar : status.en}</h3>
                  </div>
                  <button type="button" onClick={() => void lookup()} disabled={busy}>{busy ? "…" : (ar ? "تحديث الحالة ↻" : "REFRESH STATUS ↻")}</button>
                </div>
                <ol className="track-progress">
                  {steps.map((step, index) => {
                    const complete = index < activeStep;
                    const current = index === activeStep;
                    return (
                      <li key={step.status} className={complete ? "complete" : current ? "current" : ""}>
                        <span className="track-step-marker">{complete ? "✓" : index + 1}</span>
                        <div>
                          <strong>{ar ? step.ar : step.en}</strong>
                          {current && <p>{ar ? step.noteAr : step.noteEn}</p>}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>
            )}

            <div className="track-details-grid">
              <section className="track-items-panel">
                <div className="track-panel-title">
                  <div><small>{ar ? "ملخص المشتريات" : "ORDER CONTENTS"}</small><h3>{ar ? "القطع المطلوبة" : "Your items"}</h3></div>
                  <span>{order.items.length} {ar ? "بنود" : "ITEMS"}</span>
                </div>
                <div className="track-items-list">
                  {order.items.map((item, index) => (
                    <article className="track-item" key={`${order.code}-${index}`}>
                      <div className="track-item-copy">
                        <h4>{ar ? item.productNameAr : item.productNameEn}</h4>
                        {item.size && <p>{ar ? "المقاس" : "SIZE"}: {item.size} · {ar ? "اللون" : "COLOR"}: {item.color}</p>}
                        <small>{ar ? "الكمية" : "QTY"}: {item.quantity} × {money(item.unitPrice, ar)}</small>
                        {item.components && item.components.length > 0 && (
                          <ul className="track-bundle-components">
                            {item.components.map((component, componentIndex) => (
                              <li key={componentIndex}>
                                {ar ? component.product.nameAr : component.product.nameEn} — {component.variant.size} / {component.variant.color} × {component.quantity}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <strong>{money(item.lineTotal, ar)}</strong>
                    </article>
                  ))}
                </div>
              </section>

              <aside className="track-summary-panel">
                <small>{ar ? "ملخص الدفع" : "PAYMENT SUMMARY"}</small>
                <h3>{ar ? "إجمالي الطلب" : "Order total"}</h3>
                <div><span>{ar ? "قيمة المنتجات" : "Subtotal"}</span><strong>{money(order.subtotal, ar)}</strong></div>
                {order.discountAmount > 0 && <div><span>{ar ? "الخصم" : "Discount"}{order.couponCode ? ` · ${order.couponCode}` : ""}</span><strong>−{money(order.discountAmount, ar)}</strong></div>}
                <div><span>{ar ? "الشحن" : "Delivery"}</span><strong>{money(order.shippingCost, ar)}</strong></div>
                <div className="track-grand-total"><span>{ar ? "الإجمالي النهائي" : "TOTAL PAID ON DELIVERY"}</span><strong>{money(order.total, ar)}</strong></div>
                <p>{ar ? "طريقة الدفع: الدفع عند الاستلام" : "Payment method: Cash on delivery"}</p>
              </aside>
            </div>

            {lastChecked && <p className="track-last-checked">{ar ? "آخر تحديث لهذه الصفحة" : "LAST CHECKED"} · {new Date(lastChecked).toLocaleTimeString(ar ? "ar-EG" : "en-GB", { hour: "2-digit", minute: "2-digit" })}</p>}
          </section>
        )}
      </section>
      <footer className="track-footer"><span>ZERO<span>.</span></span><small>{ar ? "مصمم للحركة. مصنوع للاستمرار." : "BUILT FOR MOVEMENT. MADE TO LAST."}</small></footer>
    </main>
  );
}
