import React,{useEffect,useState} from "react";
import {Check,WifiOff} from "lucide-react";
import {getDevice,subscribePOSState} from "./deviceSync";

const initial={screen:"order",displayOn:true,orderNo:"1048",items:[],subtotal:0,tax:0,total:0};
export default function CustomerDisplay(){
 const [state,setState]=useState(()=>{try{return JSON.parse(localStorage.getItem("avero_pos_state"))||initial}catch{return initial}});
 const [connected,setConnected]=useState(true);
 const device=getDevice();
 useEffect(()=>subscribePOSState(next=>{setState(next);setConnected(true)}),[]);
 if(!state.displayOn)return <div className="kiosk dark"><div className="kiosk-off"><WifiOff/><h1>Display Offline</h1><p>Waiting for the merchant terminal.</p></div></div>;
 return <div className="kiosk">{state.screen==="payment"?<Payment state={state} device={device}/>:state.screen==="success"?<Success state={state}/>:<Order state={state}/>}<div className={"connection "+(connected?"online":"offline")}><i/>{connected?"Connected":"Waiting for POS"}</div></div>;
}
function Order({state}){return <div className="kiosk-order"><header><b>A</b><strong>AVERO</strong><span>TABLE 04</span></header><main><small>YOUR ORDER</small>{state.items.length?state.items.map(i=><div className="krow" key={i.id}><span>{i.name} × {i.qty}</span><b>₹{i.price*i.qty}</b></div>):<div className="kwait">Your order will appear here.</div>}<div className="ksummary"><div><span>Subtotal</span><b>₹{state.subtotal}</b></div><div><span>GST</span><b>₹{state.tax}</b></div><div className="ktotal"><span>Total</span><b>₹{state.total}</b></div></div><div className="knotice">Please wait for payment</div></main><footer>Thank you for choosing us.</footer></div>}
function Payment({state}){return <div className="kpayment"><div className="kbrand">A AVERO</div><small>PAYMENT DUE</small><strong>₹{state.total}</strong><div className="kqr">{Array.from({length:81}).map((_,i)=><i className={(i%4===0||i%9===0||i%13===0)?"dark":""} key={i}/>)}</div><h2>Scan to pay</h2><p>UPI • ORDER #{state.orderNo}</p></div>}
function Success({state}){return <div className="ksuccess"><div className="check"><Check/></div><div className="kbrand">A AVERO</div><h1>Payment successful</h1><strong>₹{state.total}</strong><p>Thank you. Your order is confirmed.</p></div>}