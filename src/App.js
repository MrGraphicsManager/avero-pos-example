import React, {useMemo, useState} from "react";
import {BarChart3, Bell, Check, Coffee, CreditCard, LayoutDashboard, MonitorSmartphone, Plus, Receipt, Settings2, ShoppingBag, Table2, Trash2, UtensilsCrossed, Wifi} from "lucide-react";

const MENU=[
{id:"espresso",name:"Espresso",price:120,category:"Coffee"},
{id:"cappuccino",name:"Cappuccino",price:180,category:"Coffee"},
{id:"latte",name:"Cafe Latte",price:210,category:"Coffee"},
{id:"sandwich",name:"Veg Sandwich",price:220,category:"Food"},
{id:"fries",name:"French Fries",price:140,category:"Sides"},
{id:"brownie",name:"Chocolate Brownie",price:160,category:"Dessert"}];

function App(){
const [items,setItems]=useState([{...MENU[1],qty:1},{...MENU[3],qty:1}]);
const [screen,setScreen]=useState("order");
const [displayOn,setDisplayOn]=useState(true);
const [category,setCategory]=useState("All");
const [orderNo,setOrderNo]=useState("1048");
const subtotal=useMemo(()=>items.reduce((s,i)=>s+i.price*i.qty,0),[items]);
const tax=Math.round(subtotal*.05), total=subtotal+tax;
const cats=["All",...new Set(MENU.map(x=>x.category))];
const filtered=category==="All"?MENU:MENU.filter(x=>x.category===category);
const add=p=>setItems(cur=>{const f=cur.find(x=>x.id===p.id);return f?cur.map(x=>x.id===p.id?{...x,qty:x.qty+1}:x):[...cur,{...p,qty:1}]});
const qty=(id,d)=>setItems(cur=>cur.map(x=>x.id===id?{...x,qty:x.qty+d}:x).filter(x=>x.qty>0));
const pay=()=>{setScreen("payment");setDisplayOn(true)};
const paid=()=>{setScreen("success");setOrderNo(String(Number(orderNo)+1));};
const reset=()=>{setItems([]);setScreen("order")};
return <div className="shell">
<header><div className="brand"><b> A </b>AVERO <small>POS EXAMPLE</small></div><div className="tools"><span><Wifi size={14}/> Connected</span><Bell size={17}/><i>M</i></div></header>
<div className="layout"><aside>
<div className="label">MERCHANT</div>
<div className="nav active"><LayoutDashboard/>Overview</div><div className="nav"><ShoppingBag/>Orders</div><div className="nav"><Table2/>Tables</div><div className="nav"><Receipt/>Billing</div><div className="nav"><BarChart3/>Reports</div>
<div className="label device">DEVICES</div><div className="nav"><MonitorSmartphone/>Customer Display <em/></div>
<div className="nav bottom"><Settings2/>Settings</div>
</aside>
<main><div className="head"><div><small>CAFE • COUNTER 01</small><h1>New Order</h1><p>Create an order and see the customer display update.</p></div><button className="display-toggle" onClick={()=>setDisplayOn(x=>!x)}><MonitorSmartphone/> {displayOn?"Display On":"Display Off"}</button></div>
<div className="grid">
<section className="card menu"><div className="panelhead"><div><h2>Menu</h2><p>Tap an item to add it.</p></div><div className="tabs">{cats.map(c=><button className={category===c?"sel":""} onClick={()=>setCategory(c)} key={c}>{c}</button>)}</div></div>
<div className="menugrid">{filtered.map(p=><button className="product" onClick={()=>add(p)} key={p.id}><span>{p.category==="Coffee"?<Coffee/>:<UtensilsCrossed/>}</span><strong>{p.name}</strong><small>₹{p.price}</small><b><Plus size={13}/></b></button>)}</div></section>
<section className="card order"><div className="panelhead"><div><h2>Current Order</h2><p>Table 04 • Dine-in</p></div><label>ORDER #{orderNo}</label></div>
<div className="rows">{items.length?items.map(i=><div className="row" key={i.id}><div><strong>{i.name}</strong><small>₹{i.price} each</small></div><div className="qty"><button onClick={()=>qty(i.id,-1)}><Trash2 size={13}/></button><span>{i.qty}</span><button onClick={()=>qty(i.id,1)}><Plus size={13}/></button></div><b>₹{i.price*i.qty}</b></div>):<div className="empty">Add items from the menu.</div>}</div>
<div className="summary"><div><span>Subtotal</span><b>₹{subtotal}</b></div><div><span>GST (5%)</span><b>₹{tax}</b></div><div className="total"><span>Total</span><b>₹{total}</b></div></div>
<div className="actions"><button onClick={()=>setDisplayOn(true)} disabled={!items.length}><MonitorSmartphone/> Update Display</button><button className="primary" onClick={pay} disabled={!items.length}><CreditCard/> Take Payment</button></div>
</section></div>
<section className="live"><div className="livehead"><div><small>LIVE DEVICE PREVIEW</small><h2>Customer display</h2><p>Live view of the connected customer-facing hardware.</p></div><span><i/> HP ElitePOS 10.1&quot; • Online</span></div>
<div className="device">{displayOn?<Display screen={screen} items={items} subtotal={subtotal} tax={tax} total={total} orderNo={orderNo} onPay={paid} onReset={reset}/>:<div className="off"><MonitorSmartphone/><h3>Customer display is off</h3><button className="primary" onClick={()=>setDisplayOn(true)}>Turn Display On</button></div>}</div></section>
</main></div></div>
}

function Display({screen,items,subtotal,tax,total,orderNo,onPay,onReset}){
if(screen==="payment") return <div className="customer payment"><div className="customerbrand">A AVERO</div><div className="paymentbody"><small>PAYMENT DUE</small><strong>₹{total}</strong><div className="fakeqr">{Array.from({length:49}).map((_,i)=><i className={(i%3===0||i%7===0)?"dark":""} key={i}/>)}</div><h3>Scan to pay</h3><p>UPI • TABLE 04 • ORDER #{orderNo}</p><button className="paynow" onClick={onPay}>Simulate Payment</button></div></div>;
if(screen==="success") return <div className="customer success"><div className="successmark"><Check/></div><div className="customerbrand">A AVERO</div><h2>Payment successful</h2><strong>₹{total}</strong><p>Order #{orderNo} confirmed.</p><button className="paynow light" onClick={onReset}>New Order</button></div>;
return <div className="customer orderdisplay"><div className="customerhead"><div className="customerbrand">A AVERO</div><span>TABLE 04</span></div><div className="ordercontent"><small>YOUR ORDER</small>{items.length?items.map(i=><div className="drow" key={i.id}><span>{i.name} × {i.qty}</span><b>₹{i.price*i.qty}</b></div>):<div className="waiting">Waiting for order…</div>}<div className="dsummary"><div><span>Subtotal</span><b>₹{subtotal}</b></div><div><span>GST</span><b>₹{tax}</b></div><div className="dtotal"><span>Total</span><b>₹{total}</b></div></div><div className="waitingbtn">Waiting for cashier</div></div><footer>Thank you for choosing us.</footer></div>;
}
export default App;