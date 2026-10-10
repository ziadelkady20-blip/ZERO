"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowDownUp, ArrowRight, Box, ClipboardList, ExternalLink, LogOut, PackagePlus, RefreshCw, Search, Settings2, Truck } from "lucide-react";
import "./admin.css";

type OrderItem = { id:string; productNameEn:string; productNameAr:string; size:string; color:string; quantity:number; unitPrice:number; lineTotal:number };
type Order = { id:string; code:string; customerName:string; phone:string; email?:string|null; address:string; notes?:string|null; createdAt:string; subtotal:number; shippingCost:number; total:number; status:string; governorate:string; city:string; items:OrderItem[] };
type Product = { id:string; slug:string; nameEn:string; nameAr:string; price:number; active:boolean; featured:boolean; variants:{id:string;size:string;color:string;stock:number}[] };
type Rate = { id:string; governorate:string; city:string; price:number; active:boolean };
type Category = { id:string; nameEn:string; nameAr:string; slug:string };
const STATUSES=["PENDING","CONFIRMED","PREPARING","SHIPPED","DELIVERED","CANCELLED"];
const STATUS_LABEL:Record<string,string>={PENDING:"Pending",CONFIRMED:"Confirmed",PREPARING:"Preparing",SHIPPED:"Shipped",DELIVERED:"Delivered",CANCELLED:"Cancelled"};
const money=(value:number)=>new Intl.NumberFormat("en-EG",{maximumFractionDigits:0}).format(value)+" EGP";

export default function AdminPage() {
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [signedIn,setSignedIn]=useState(false);
  const [orders,setOrders]=useState<Order[]>([]);
  const [products,setProducts]=useState<Product[]>([]);
  const [rates,setRates]=useState<Rate[]>([]);
  const [categories,setCategories]=useState<Category[]>([]);
  const [tab,setTab]=useState<"orders"|"products"|"shipping"|"categories">("orders");
  const [error,setError]=useState("");
  const [notice,setNotice]=useState("");
  const [busy,setBusy]=useState(false);
  const [query,setQuery]=useState("");
  const [statusFilter,setStatusFilter]=useState("ALL");
  const [shippingDrafts,setShippingDrafts]=useState<Record<string,{price:string;active:boolean}>>({});
  const [expandedOrder,setExpandedOrder]=useState<string|null>(null);

  async function api(path:string,init?:RequestInit) {
    const response=await fetch(path,{...init,cache:"no-store",headers:{"Content-Type":"application/json",...(init?.headers||{})}});
    const data=await response.json().catch(()=>({}));
    if(!response.ok) throw new Error(data.error||"Request failed");
    return data;
  }
  async function load(showSpinner=true) {
    if(showSpinner)setBusy(true);
    setError("");
    try {
      const [o,p,s]=await Promise.all([api("/api/admin/orders"),api("/api/admin/products"),api("/api/admin/shipping")]);
      setOrders(o.orders||[]);setProducts(p.products||[]);setCategories(p.categories||[]);setRates(s.rates||[]);
      const drafts:Record<string,{price:string;active:boolean}>={};
      (s.rates||[]).forEach((r:Rate)=>drafts[r.id]={price:String(r.price),active:r.active});
      setShippingDrafts(drafts);setSignedIn(true);
    } catch(e) {
      const message=e instanceof Error?e.message:"Could not load admin data";
      if(message==="Unauthorized.")setSignedIn(false);else setError(message);
    } finally {if(showSpinner)setBusy(false);}
  }
  useEffect(()=>{void load();},[]);
  async function signIn(event:React.FormEvent<HTMLFormElement>) {
    event.preventDefault();setBusy(true);setError("");
    try {await api("/api/admin/login",{method:"POST",body:JSON.stringify({email,password})});setPassword("");const next=new URLSearchParams(window.location.search).get("next");if(next&&next.startsWith("/admin/")){window.location.assign(next);return;}await load();}
    catch(e){setError(e instanceof Error?e.message:"Sign in failed");setBusy(false);}
  }
  async function changeStatus(code:string,status:string) {
    setBusy(true);setError("");setNotice("");
    try {await api("/api/admin/orders",{method:"PATCH",body:JSON.stringify({code,status})});setNotice("Order status updated.");await load(false);}
    catch(e){setError(e instanceof Error?e.message:"Update failed");}
    finally{setBusy(false);}
  }
  async function saveRate(rate:Rate) {
    const draft=shippingDrafts[rate.id];if(!draft)return;
    setBusy(true);setError("");setNotice("");
    try {await api("/api/admin/shipping",{method:"POST",body:JSON.stringify({governorate:rate.governorate,city:rate.city,price:Number(draft.price),active:draft.active})});setNotice("Delivery rate saved. Checkout will use the updated rate.");await load(false);}
    catch(e){setError(e instanceof Error?e.message:"Could not save delivery rate");}
    finally{setBusy(false);}
  }
  async function signOut(){await api("/api/admin/logout",{method:"POST"}).catch(()=>{});setSignedIn(false);}
  const filteredOrders=useMemo(()=>orders.filter(o=>{
    const q=query.trim().toLowerCase();
    const matchesQuery=!q||[o.code,o.customerName,o.phone,o.governorate,o.city,...(o.items||[]).map(i=>`${i.productNameEn} ${i.productNameAr} ${i.size} ${i.color}`)].join(" ").toLowerCase().includes(q);
    return matchesQuery&&(statusFilter==="ALL"||o.status===statusFilter);
  }),[orders,query,statusFilter]);
  const lowStock=products.reduce((n,p)=>n+p.variants.filter(v=>v.stock>0&&v.stock<=3).length,0);
  const outOfStock=products.reduce((n,p)=>n+p.variants.filter(v=>v.stock===0).length,0);
  if(!signedIn) return <main className="admin-login-shell"><form className="admin-login-card" onSubmit={signIn}><Link className="admin-monogram" href="/">ZERO<span>.</span></Link><p className="admin-kicker">SECURE ADMIN ACCESS</p><h1>Store control.</h1><p className="admin-muted">One place to manage orders, products, inventory and delivery rates.</p>{error&&<p className="admin-alert error" role="alert">{error}</p>}<label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="username"/></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required autoComplete="current-password"/></label><button className="admin-primary" disabled={busy}>{busy?"PLEASE WAIT":"SIGN IN"} <ArrowRight size={15}/></button><small>Admin credentials are configured securely in Vercel environment variables.</small></form></main>;
  return <main className="admin-shell">
    <aside className="admin-sidebar">
      <Link href="/" className="admin-monogram">ZERO<span>.</span></Link>
      <p className="admin-sidebar-caption">STORE MANAGEMENT</p>
      <button className={tab==="orders"?"admin-nav active":"admin-nav"} onClick={()=>setTab("orders")}><ClipboardList size={16}/> Orders <span>{orders.filter(o=>o.status==="PENDING").length||0}</span></button>
      <button className={tab==="products"?"admin-nav active":"admin-nav"} onClick={()=>setTab("products")}><Box size={16}/> Products & stock <span>{products.length}</span></button>
      <button className={tab==="shipping"?"admin-nav active":"admin-nav"} onClick={()=>setTab("shipping")}><Truck size={16}/> Delivery rates <span>{rates.length}</span></button>
      <button className={tab==="categories"?"admin-nav active":"admin-nav"} onClick={()=>setTab("categories")}><Settings2 size={16}/> Categories <span>{categories.length}</span></button>
      <div className="admin-sidebar-bottom">
        <Link href="/admin/setup"><PackagePlus size={15}/> Add product / setup <ArrowRight size={13}/></Link>
        <Link href="/admin/products"><ArrowDownUp size={15}/> Full product editor <ArrowRight size={13}/></Link>
        <Link href="/"><ExternalLink size={15}/> View storefront <ArrowRight size={13}/></Link>
        <button onClick={()=>void signOut()}><LogOut size={15}/> Sign out</button>
        <span>ZERO CLOTHING · CONTROL CENTER</span>
      </div>
    </aside>
    <section className="admin-main">
      <header className="admin-topbar"><div><p className="admin-kicker">ZERO CLOTHING / CONTROL CENTER</p><h1>{tab==="orders"?"Orders":tab==="products"?"Products & inventory":tab==="shipping"?"Delivery rates":"Categories"}</h1><p className="admin-page-subtitle">Changes are saved to the store database and used by the live storefront.</p></div><button className="admin-secondary" onClick={()=>void load()} disabled={busy}><RefreshCw size={14} className={busy?"admin-spin":""}/> Refresh data</button></header>
      {error&&<p className="admin-alert error" role="alert">{error}</p>}{notice&&<p className="admin-alert success" role="status">{notice}</p>}
      <div className="admin-stats">
        <button onClick={()=>{setTab("orders");setStatusFilter("ALL");}}><span>TOTAL ORDERS</span><strong>{orders.length}</strong><small>Latest 200 orders</small></button>
        <button onClick={()=>setTab("products")}><span>LIVE PRODUCTS</span><strong>{products.filter(p=>p.active).length}<small> / {products.length} total</small></strong><small>{lowStock} low-stock variants · {outOfStock} sold out</small></button>
        <button onClick={()=>setTab("shipping")}><span>ACTIVE DELIVERY ZONES</span><strong>{rates.filter(r=>r.active).length}</strong><small>Shipping options at checkout</small></button>
        <div><span>PAYMENT METHOD</span><strong>COD</strong><small>Cash on delivery only</small></div>
      </div>
      {tab==="orders"&&<section className="admin-panel">
        <div className="admin-panel-heading"><div><h2>Order management</h2><p>Search by order code, customer, phone, area or item. Update a status to track fulfilment.</p></div><span className="admin-result-count">{filteredOrders.length} orders</span></div>
        <div className="admin-toolbar"><label className="admin-search"><Search size={16}/><input aria-label="Search orders" placeholder="Search order, customer, phone…" value={query} onChange={e=>setQuery(e.target.value)}/></label><select aria-label="Filter order status" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}><option value="ALL">All statuses</option>{STATUSES.map(s=><option key={s} value={s}>{STATUS_LABEL[s]}</option>)}</select></div>
        <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>ORDER / ITEMS</th><th>CUSTOMER</th><th>DELIVERY</th><th>TOTAL</th><th>STATUS</th><th>DETAILS</th></tr></thead><tbody>
          {filteredOrders.map(o=><tr key={o.id}><td><strong>{o.code}</strong><small>{new Date(o.createdAt).toLocaleString("en-EG",{dateStyle:"medium",timeStyle:"short"})}</small><div className="admin-order-items">{(o.items||[]).map((item,i)=><small key={item.id||i}>{item.productNameEn} · {item.color} / {item.size} × {item.quantity}</small>)}</div></td><td><strong>{o.customerName}</strong><small>{o.phone}</small>{o.email&&<small>{o.email}</small>}</td><td>{o.governorate}<small>{o.city}</small><small>{o.address}</small></td><td><strong>{money(o.total)}</strong><small>Items {money(o.subtotal)} + delivery {money(o.shippingCost)}</small></td><td><select className={"admin-status-select status-"+o.status.toLowerCase()} aria-label={"Status for "+o.code} value={o.status} disabled={busy||o.status==="CANCELLED"} onChange={e=>void changeStatus(o.code,e.target.value)}>{STATUSES.map(s=><option key={s} value={s}>{STATUS_LABEL[s]}</option>)}</select>{o.status==="CANCELLED"&&<small>Cancelled orders are locked.</small>}</td><td><button className="admin-text-button" onClick={()=>setExpandedOrder(expandedOrder===o.id?null:o.id)}>{expandedOrder===o.id?"Hide":"View"} <ArrowRight size={13}/></button>{expandedOrder===o.id&&<div className="admin-order-detail"><strong>Order notes</strong><p>{o.notes||"No notes"}</p><strong>Items</strong>{o.items.map(item=><p key={item.id}>{item.productNameEn} / {item.productNameAr}<br/>{item.color} · {item.size} · Qty {item.quantity}<br/>{money(item.lineTotal)}</p>)}</div>}</td></tr>)}
          {filteredOrders.length===0&&<tr><td colSpan={6} className="admin-empty">{orders.length?"No orders match your search.":"No orders yet. New cash-on-delivery orders will appear here."}</td></tr>}
        </tbody></table></div>
      </section>}
      {tab==="products"&&<section className="admin-panel"><div className="admin-panel-heading"><div><h2>Product catalog</h2><p>Published products are visible in the store. Prices, photos, variants and stock come from the database.</p></div><div className="admin-actions"><Link className="admin-secondary" href="/admin/products">Edit products</Link><Link className="admin-primary" href="/admin/setup">+ Add product</Link></div></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>PRODUCT</th><th>PRICE</th><th>VISIBILITY</th><th>VARIANTS / STOCK</th><th>ACTION</th></tr></thead><tbody>{products.map(p=><tr key={p.id}><td><strong>{p.nameEn}</strong><small>{p.nameAr}</small><small>/{p.slug}</small></td><td>{money(p.price)}</td><td><span className={p.active?"admin-pill active":"admin-pill"}>{p.active?"Published":"Hidden"}</span>{p.featured&&<small>Featured</small>}</td><td>{p.variants.length} combinations<small>{p.variants.reduce((n,v)=>n+v.stock,0)} pieces in stock</small></td><td><Link className="admin-text-button" href="/admin/products">Edit <ArrowRight size={13}/></Link><small><Link href={"/product/"+p.slug} target="_blank">View product ↗</Link></small></td></tr>)}{products.length===0&&<tr><td colSpan={5} className="admin-empty">No products yet. Add the first product with its photos, sizes, colors and stock.<p><Link className="admin-primary" href="/admin/setup">Add first product</Link></p></td></tr>}</tbody></table></div></section>}
      {tab==="shipping"&&<section className="admin-panel"><div className="admin-panel-heading"><div><h2>Delivery rates</h2><p>Edit a price or deactivate an area. Checkout immediately uses active rates only.</p></div><Link className="admin-primary" href="/admin/setup">+ Add delivery area</Link></div><div className="admin-table-wrap"><table className="admin-table admin-shipping-table"><thead><tr><th>GOVERNORATE</th><th>CITY / AREA</th><th>DELIVERY PRICE (EGP)</th><th>ACTIVE AT CHECKOUT</th><th>ACTION</th></tr></thead><tbody>{rates.map(r=><tr key={r.id}><td>{r.governorate}</td><td>{r.city}</td><td><input className="admin-inline-input" type="number" min="0" step="1" aria-label={"Delivery price for "+r.city} value={shippingDrafts[r.id]?.price??String(r.price)} onChange={e=>setShippingDrafts(old=>({...old,[r.id]:{...old[r.id],price:e.target.value}}))}/></td><td><label className="admin-toggle"><input type="checkbox" checked={shippingDrafts[r.id]?.active??r.active} onChange={e=>setShippingDrafts(old=>({...old,[r.id]:{...old[r.id],active:e.target.checked}}))}/><span>{(shippingDrafts[r.id]?.active??r.active)?"Active":"Inactive"}</span></label></td><td><button className="admin-secondary" disabled={busy||!shippingDrafts[r.id]||!Number.isInteger(Number(shippingDrafts[r.id].price))||Number(shippingDrafts[r.id].price)<0} onClick={()=>void saveRate(r)}>Save rate</button></td></tr>)}{rates.length===0&&<tr><td colSpan={5} className="admin-empty">No delivery zones yet. Add governorate and city/area to enable checkout.</td></tr>}</tbody></table></div></section>}
      {tab==="categories"&&<section className="admin-panel"><div className="admin-panel-heading"><div><h2>Store categories</h2><p>Categories are retained when products are removed. Choose a category while creating or editing a product.</p></div><Link className="admin-primary" href="/admin/setup">+ Add category</Link></div><div className="admin-category-grid">{categories.map(c=><article key={c.id} className="admin-category-card"><span className="admin-category-slug">{c.slug}</span><h3>{c.nameEn}</h3><p dir="rtl">{c.nameAr}</p><small>{products.filter(p=>p.active).length===0?"No live products yet":"Categories are linked to the product catalog"}</small></article>)}{categories.length===0&&<p className="admin-empty">No categories have been created yet.</p>}</div></section>}
      <footer className="admin-footer"><span>ZERO CLOTHING · STORE OPERATIONS</span><span>PRODUCTS, INVENTORY & SHIPPING ARE DATABASE-DRIVEN</span></footer>
    </section>
  </main>;
}
