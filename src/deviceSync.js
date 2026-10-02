const CHANNEL_NAME="avero-pos-device";
const DEVICE_KEY="avero_device_id";
const API_KEY="avero_sync_api";\nconst TOKEN_KEY="avero_sync_token";
const defaultDevice={id:"hp-elitepos-10-1",name:'HP ElitePOS 10.1"',resolution:"1280x800",ratio:"16:10",status:"online"};

export function getDevice(){try{return JSON.parse(localStorage.getItem(DEVICE_KEY))||defaultDevice}catch{return defaultDevice}}
export function getSyncUrl(){return localStorage.getItem(API_KEY)||""}\nexport function getSyncToken(){return localStorage.getItem(TOKEN_KEY)||""}\nexport function setSyncToken(token){if(token)localStorage.setItem(TOKEN_KEY,token);else localStorage.removeItem(TOKEN_KEY)}
export function setSyncUrl(url){if(url)localStorage.setItem(API_KEY,url.replace(/\/$/,""));else localStorage.removeItem(API_KEY)}
export function publishPOSState(state){
 const payload={...state,updatedAt:Date.now()};
 localStorage.setItem("avero_pos_state",JSON.stringify(payload));
 try{const channel=new BroadcastChannel(CHANNEL_NAME);channel.postMessage(payload);channel.close()}catch{}
 const base=getSyncUrl();
 if(base)fetch(base+"/device/state",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+getSyncToken()},body:JSON.stringify(payload)}).catch(()=>{});
}
export function subscribePOSState(handler){
 let channel;
 const onStorage=e=>{if(e.key==="avero_pos_state"&&e.newValue){try{handler(JSON.parse(e.newValue))}catch{}}};
 window.addEventListener("storage",onStorage);
 try{channel=new BroadcastChannel(CHANNEL_NAME);channel.onmessage=e=>handler(e.data)}catch{}
 let source;
 const base=getSyncUrl();
 const device=getDevice();
 if(base){source=new EventSource(base+"/device/stream?device="+encodeURIComponent(device.id)+"&token="+encodeURIComponent(getSyncToken()));source.onmessage=e=>{try{handler(JSON.parse(e.data))}catch{}}}
 return()=>{window.removeEventListener("storage",onStorage);channel?.close();source?.close()};
}
export function setDeviceStatus(status){const d={...getDevice(),status};localStorage.setItem(DEVICE_KEY,JSON.stringify(d));return d}
export function pairDevice(code){const id="hp-elitepos-"+String(code).trim().toLowerCase().replace(/[^a-z0-9-]/g,"");const d={...getDevice(),id,status:"online"};localStorage.setItem(DEVICE_KEY,JSON.stringify(d));return d}
