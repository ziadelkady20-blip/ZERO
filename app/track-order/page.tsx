"use client";
import "./track.css";
import { FormEvent, useState } from "react";
import Link from "next/link";

type TrackedOrder = {
 code: string;
 status: string;
 createdAt: string;
 subtotal:number;
 discountAmount:number;
 couponCode?:string|null;
 shippingCost:number;
 total: number;
 items: { productNameEn: string; productNameAr: string; size: string; color: string; quantity: number }[];
};
const steps = ["PENDING","CONFIRMED","PREPARING","SHIPPED","DELIVERED"];
const labels: Record<string,{en:string;ar:string}> = {
 PENDING:{en:"Order received",ar:"تم استلام الطلب"},
 CONFIRMED:{en:"Confirmed",ar:"تم تأكيد الطلب"},
 PREPARING:{en:"Preparing",ar:"جاري تجهيز الطلب"},
 SHIPPED:{en:"On the way",ar:"الطلب في الطريق"},
 DELIVERED:{en:"Delivered",ar:"تم التوصيل"},
 CANCELLED:{en:"Cancelled",ar:"تم إلغاء الطلب"}
};
export default function TrackOrderPage(){
 const [code,setCode]=useState("");
 const [phone,setPhone]=useState("");
 const [order,setOrder]=useState<TrackedOrder|null>(null);
 const [error,setError]=useState("");
 const [busy,setBusy]=useState(false);
 const [locale,setLocale]=useState<"en"|"ar">("en");
 const ar=locale==="ar";
 async function submit(event:FormEvent){
  event.preventDefault();setBusy(true);setError("");setOrder(null);
  try{
   const response=await fetch("/api/orders/track",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({code,phone})});
   const data=await response.json();
   if(!response.ok)throw new Error(data.error||"Could not find this order.");
   setOrder(data.order);
  }catch(e){setError(e instanceof Error?e.message:"Tracking is temporarily unavailable.");}
  finally{setBusy(false);}
 }
 return <main className="track-shell" dir={ar?"rtl":"ltr"}>
  <header className="track-header"><Link href="/" className="track-logo">ZERO<span>.</span></Link><button onClick={()=>setLocale(ar?"en":"ar")}>{ar?"English":"العربية"}</button></header>
  <section className="track-content"><p className="track-eyebrow">{ar?"ZERO CLOTHING / متابعة الطلب":"ZERO CLOTHING / ORDER LOOKUP"}</p><h1>{ar?"طلبك فين؟":"Where’s your order?"}</h1><p className="track-intro">{ar?"اكتب كود الطلب ورقم الموبايل المستخدم وقت الشراء علشان تتابع حالته.":"Enter your order code and the phone number used at checkout to see the latest status."}</p>
  <form className="track-form" onSubmit={submit}><label>{ar?"كود الطلب":"Order code"}<input value={code} onChange={e=>setCode(e.target.value.toUpperCase())} placeholder="ZERO-A1B2C3D4" required /></label><label>{ar?"رقم الموبايل":"Phone number"}<input type="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder={ar?"01xxxxxxxxx":"Your checkout phone number"} required /></label><button disabled={busy}>{busy?(ar?"جاري البحث…":"CHECKING…"):(ar?"تابع الطلب":"TRACK ORDER")} <span>↗</span></button></form>
  {error&&<p className="track-error">{error}</p>}
  {order&&<section className="track-result"><div className="track-result-head"><div><small>{ar?"رقم الطلب":"ORDER NUMBER"}</small><h2>{order.code}</h2></div><span className={"track-status "+order.status.toLowerCase()}>{labels[order.status]?.[locale]||order.status}</span></div><p className="track-date">{ar?"تاريخ الطلب":"Placed on"} {new Date(order.createdAt).toLocaleString(ar?"ar-EG":"en-EG")}</p>{order.status==="CANCELLED"?<p className="track-cancelled">{labels.CANCELLED[locale]}</p>:<div className="track-steps">{steps.map((step,index)=><div key={step} className={"track-step "+(steps.indexOf(order.status)>=index?"complete":"")}><span>{steps.indexOf(order.status)>=index?"✓":String(index+1).padStart(2,"0")}</span><p>{labels[step][locale]}</p></div>)}</div>}<div className="track-items"><h3>{ar?"ملخص الطلب":"ORDER SUMMARY"}</h3>{order.items.map((item,index)=><div className="track-item" key={index}><span>{ar?item.productNameAr:item.productNameEn} · {item.size} / {item.color} × {item.quantity}</span></div>)}<div className="track-total"><span>{ar?"المنتجات":"PRODUCTS"}</span><span>{order.subtotal.toLocaleString(ar?"ar-EG":"en-EG")} {ar?"جنيه":"EGP"}</span></div>{order.discountAmount>0&&<div className="track-total track-discount"><span>{ar?"الخصم":"PROMO DISCOUNT"} ({order.couponCode})</span><span>−{order.discountAmount.toLocaleString(ar?"ar-EG":"en-EG")} {ar?"جنيه":"EGP"}</span></div>}<div className="track-total"><span>{ar?"الشحن":"DELIVERY"}</span><span>{order.shippingCost.toLocaleString(ar?"ar-EG":"en-EG")} {ar?"جنيه":"EGP"}</span></div><div className="track-total"><strong>{ar?"الإجمالي":"TOTAL"}</strong><strong>{order.total.toLocaleString(ar?"ar-EG":"en-EG")} {ar?"جنيه":"EGP"}</strong></div></div></section>}
  <Link className="track-back" href="/">{ar?"العودة للمتجر":"BACK TO STORE"} ↗</Link></section>
  <footer className="track-footer">ZERO CLOTHING · PERFORMANCE WEAR</footer>
 </main>;
}
