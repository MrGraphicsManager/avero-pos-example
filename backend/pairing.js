const crypto=require("crypto");
const {MongoClient}=require("mongodb");
const pending=new Map();
const memoryPaired=new Map();
let collection=null;

async function init(){
 if(!process.env.MONGO_URL)return;
 const client=new MongoClient(process.env.MONGO_URL);
 await client.connect();
 const db=client.db(process.env.MONGO_DB||"avero");
 collection=db.collection("paired_devices");
 await collection.createIndex({deviceId:1},{unique:true});
}
function normalize(code){return String(code||"").trim().toUpperCase().replace(/[^A-Z0-9-]/g,"").slice(0,32)}
function createPairingCode(){return crypto.randomBytes(3).toString("hex").toUpperCase().slice(0,6)}
function createPairing(){const code=createPairingCode(),ownerToken=crypto.randomBytes(32).toString("hex");pending.set(code,{createdAt:Date.now(),ownerToken});return {code,ownerToken}}
async function pair(code,device){
 const key=normalize(code),request=pending.get(key);
 if(!request||Date.now()-request.createdAt>10*60*1000)return null;
 pending.delete(key);
 const record={deviceId:device||"display-"+crypto.randomUUID(),pairedAt:Date.now(),token:crypto.randomBytes(32).toString("hex"),ownerToken:request.ownerToken};
 if(collection)await collection.updateOne({deviceId:record.deviceId},{$set:record},{upsert:true});
 memoryPaired.set(record.deviceId,record);
 return record;
}
async function getDevice(deviceId){
 if(memoryPaired.has(deviceId))return memoryPaired.get(deviceId);
 if(collection){const record=await collection.findOne({deviceId});if(record){memoryPaired.set(deviceId,record);return record}}
 return null;
}
async function authorize(deviceId,token){const record=await getDevice(deviceId);if(!record||!token)return false;const a=Buffer.from(String(token)),b=Buffer.from(String(record.token)),c=Buffer.from(String(record.ownerToken||""));return (a.length===b.length&&crypto.timingSafeEqual(a,b))||(a.length===c.length&&crypto.timingSafeEqual(a,c));}

init().catch(err=>console.error("MongoDB init failed:",err.message));
setInterval(()=>{const now=Date.now();for(const [code,v] of pending)if(now-v.createdAt>10*60*1000)pending.delete(code)},60*1000).unref();
module.exports={normalize,createPairing,createPairingCode,pair,getDevice,authorize};