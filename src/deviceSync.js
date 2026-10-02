const CHANNEL_NAME="avero-pos-device";
const DEVICE_KEY="avero_device_id";
const defaultDevice={id:"hp-elitepos-10-1",name:'HP ElitePOS 10.1"',resolution:"1280x800",ratio:"16:10",status:"online"};

export function getDevice(){try{return JSON.parse(localStorage.getItem(DEVICE_KEY))||defaultDevice}catch{return defaultDevice}}
export function publishPOSState(state){localStorage.setItem("avero_pos_state",JSON.stringify({...state,updatedAt:Date.now()}));try{const channel=new BroadcastChannel(CHANNEL_NAME);channel.postMessage({...state,updatedAt:Date.now()});channel.close()}catch{}}
export function subscribePOSState(handler){let channel;const onStorage=e=>{if(e.key==="avero_pos_state"&&e.newValue){try{handler(JSON.parse(e.newValue))}catch{}}};window.addEventListener("storage",onStorage);try{channel=new BroadcastChannel(CHANNEL_NAME);channel.onmessage=e=>handler(e.data)}catch{};return()=>{window.removeEventListener("storage",onStorage);channel?.close()}}
export function setDeviceStatus(status){const d={...getDevice(),status};localStorage.setItem(DEVICE_KEY,JSON.stringify(d));return d}
