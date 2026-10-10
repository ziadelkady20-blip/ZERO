"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import "./admin.css";

type Order = { id:string; code:string; customerName:string; phone:string; total:number; status:string; governorate:string; city:string };
type Product = { id:string; nameEn:string; nameAr:string; price:number; active:boolean; variants:{id:string;size:string;color:string;stock:number}[] };
type Rate = { id:string; governorate:string; city:string; price:number; active:boolean };

export default function AdminPage() {
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [signedIn,setSignedIn]=useState(false);
  const [orders,setOrders]=useState<Order[]>([]);
  const [products,setProducts]=useState<Product[]>([]);
  const [rates,setRates]=useState<Rate[]>([]);
  const [tab,setTab]=useState("orders");
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);
  async function api(path:string, init?:RequestInit) {
    const response=await fetch(path,{...init,headers:{"Content-Type":"application/json",...(init?.headers||{})}});
    const data=await response.json().catch(()=>({}));
    if(!response.ok) throw new Error(data.error||"Request failed");
    return data;
  }
  async function load() {
    setBusy(true);setError("");
    try {
      const [o,p,s]=await Promise.all([api("/api/admin/orders"),api("/api/admin/products"),api("/api/admin/shipping")]);
      setOrders(o.orders);setProducts(p.products);setRates(s.rates);setSignedIn(true);
    } catch(e) { setSignedIn(false);setError(e instanceof Error?e.message:"Could not load admin data"); }
    finally {setBusy(false);}
  }
  useEffect(()=>{void load();},[]);
  async function signIn(event:React.FormEvent<HTMLFormElement>) {
    event.preventDefault();setBusy(true);setError("");
    try { await api("/api/admin/login",{method:"POST",body:JSON.stringify({email,password})});setPassword("");await load(); }
    catch(e) {setError(e instanceof Error?e.message:"Sign in failed");setBusy(false);}
  }
  async function changeStatus(code:string,status:string) {
    try {await api("/api/admin/orders",{method:"PATCH",body:JSON.stringify({code,status})});await load();}
    catch(e) {setError(e instanceof Error?e.message:"Update failed");}
  }
  async function signOut() {await api("/api/admin/logout",{method:"POST"}).catch(()=>{});setSignedIn(false);}
  if(!signedIn) return <main className="admin-login-shell"><form className="admin-login-card" onSubmit={signIn}><Link className="admin-monogram" href="/">ZERO<span>.</span></Link><p className="admin-kicker">SECURE ADMIN ACCESS</p><h1>Store control.</h1><p className="admin-muted">Sign in to review orders, products, inventory, and delivery rates.</p>{error&&<p className="admin-alert error">{error}</p>}<label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="username"/></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required autoComplete="current-password"/></label><button className="admin-primary" disabled={busy}>{busy?"PLEASE WAIT":"SIGN IN"}</button><small>Set ADMIN_EMAIL, ADMIN_PASSWORD, and AUTH_SECRET in your deployment environment.</small></form></main>;
  return <main className="admin-shell"><aside className="admin-sidebar"><Link href="/" className="admin-monogram">ZERO<span>.</span></Link><p className="admin-sidebar-caption">STORE MANAGEMENT</p><a className="admin-nav" href="/admin/setup">+ Add products / setup</a><button className={tab==="orders"?"admin-nav active":"admin-nav"} onClick={()=>setTab("orders")}>Orders <span>{orders.length}</span></button><button className={tab==="products"?"admin-nav active":"admin-nav"} onClick={()=>setTab("products")}>Products <span>{products.length}</span></button><button className={tab==="shipping"?"admin-nav active":"admin-nav"} onClick={()=>setTab("shipping")}>Shipping</button><button className="admin-nav" onClick={signOut}>Sign out</button></aside><section className="admin-main"><header className="admin-topbar"><div><p className="admin-kicker">ZERO CLOTHING / CONTROL CENTER</p><h1>{tab==="orders"?"Orders":tab==="products"?"Products & inventory":"Shipping rates"}</h1></div><button className="admin-secondary" onClick={()=>void load()} disabled={busy}>Refresh</button></header>{error&&<p className="admin-alert error">{error}</p>}<div className="admin-stats"><div><span>ORDERS</span><strong>{orders.length}</strong></div><div><span>PRODUCTS</span><strong>{products.length}</strong></div><div><span>SHIPPING ZONES</span><strong>{rates.length}</strong></div><div><span>PAYMENT</span><strong>COD</strong></div></div>{tab==="orders"&&<section className="admin-panel"><h2>Recent orders</h2><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>ORDER</th><th>CUSTOMER</th><th>AREA</th><th>TOTAL</th><th>STATUS</th></tr></thead><tbody>{orders.map(o=><tr key={o.id}><td>{o.code}</td><td>{o.customerName}<small>{o.phone}</small></td><td>{o.governorate}<small>{o.city}</small></td><td>{o.total} EGP</td><td><select value={o.status} onChange={e=>void changeStatus(o.code,e.target.value)}>{["PENDING","CONFIRMED","PREPARING","SHIPPED","DELIVERED","CANCELLED"].map(s=><option key={s}>{s}</option>)}</select></td></tr>)}{orders.length===0&&<tr><td colSpan={5} className="admin-empty">No orders have arrived yet.</td></tr>}</tbody></table></div></section>}{tab==="products"&&<section className="admin-panel"><h2>Products and stock</h2><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>PRODUCT</th><th>PRICE</th><th>SIZE / COLOR STOCK</th></tr></thead><tbody>{products.map(p=><tr key={p.id}><td>{p.nameEn}<small>{p.nameAr}</small></td><td>{p.price} EGP</td><td>{p.variants.map(v=><small key={v.id}>{v.size} / {v.color}: {v.stock}</small>)}</td></tr>)}{products.length===0&&<tr><td colSpan={3} className="admin-empty">No products are in the database.</td></tr>}</tbody></table></div></section>}{tab==="shipping"&&<section className="admin-panel"><h2>Delivery rates</h2><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>GOVERNORATE</th><th>CITY / AREA</th><th>PRICE</th></tr></thead><tbody>{rates.map(r=><tr key={r.id}><td>{r.governorate}</td><td>{r.city}</td><td>{r.price} EGP</td></tr>)}{rates.length===0&&<tr><td colSpan={3} className="admin-empty">Configure delivery rates through /api/admin/shipping.</td></tr>}</tbody></table></div></section>}</section></main>;
}
