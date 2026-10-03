const http=require("http");
const crypto=require("crypto");
const {createPairing,pair,getDevice,authorizeDevice,authorizeOwner,saveState,getState}=require("./pairing");
const PORT=process.env.PORT||8080;
const clients=new Map();
const MAX_BODY=256*1024;
function headers(){return{"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"Content-Type,Authorization","Access-Control-Allow-Methods":"GET,POST,OPTIONS"}}
function send(res,status,data){res.writeHead(status,{"Content-Type":"application/json",...headers()});res.end(JSON.stringify(data))}
function readBody(req,done){
 let body="",size=0,closed=false;
 req.on("data",chunk=>{size+=chunk.length;if(size>MAX_BODY&&!closed){closed=true;resSafe(req);done(null)}else if(!closed)body+=chunk});
 req.on("end",()=>{if(closed)return;try{done(JSON.parse(body||"{}"))}catch{done(null)}});
}
function resSafe(req){try{req.destroy()}catch{}}
function tokenFrom(req,body){return req.headers.authorization?.replace(/^Bearer\s+/i,"")||body?.token}
async function broadcast(deviceId,state){const group=clients.get(deviceId)||new Set();for(const res of group)res.write("data: "+JSON.stringify(state)+"\n\n")}
const server=http.createServer(async(req,res)=>{
 if(req.method==="OPTIONS"){res.writeHead(204,headers());return res.end()}
 const url=new URL(req.url,"http://localhost:"+PORT);
 if(url.pathname==="/health")return send(res,200,{ok:true,service:"avero-device-sync"});
 if(url.pathname==="/pairing/create"&&req.method==="POST")return send(res,200,{ok:true,...createPairing()});
 if(url.pathname==="/pairing/claim"&&req.method==="POST")return readBody(req,async body=>{
   if(!body)return send(res,400,{error:"invalid json"});
   try{const record=await pair(body.code,body.deviceId);return record?send(res,200,{ok:true,deviceId:record.deviceId,token:record.token,pairedAt:record.pairedAt}):send(res,404,{error:"invalid or expired pairing code"})}
   catch(e){send(res,500,{error:"pairing service unavailable"})}
 });
 if(url.pathname==="/device/stream"&&req.method==="GET"){
   const deviceId=url.searchParams.get("device")||"",token=url.searchParams.get("token")||"";
   if(!deviceId||!await authorizeDevice(deviceId,token))return send(res,403,{error:"device not authorized"});
   res.writeHead(200,{"Content-Type":"text/event-stream","Cache-Control":"no-cache","Connection":"keep-alive",...headers()});
   res.write(": connected\n\n");
   const latest=await getState(deviceId);if(latest)res.write("data: "+JSON.stringify(latest)+"\n\n");
   if(!clients.has(deviceId))clients.set(deviceId,new Set());clients.get(deviceId).add(res);
   const heartbeat=setInterval(()=>{try{res.write(": keepalive\n\n")}catch{}},25000);
   req.on("close",()=>{clearInterval(heartbeat);clients.get(deviceId)?.delete(res);if(!clients.get(deviceId)?.size)clients.delete(deviceId)});
   return;
 }
 if(url.pathname==="/device/state"&&req.method==="POST")return readBody(req,async state=>{
   if(!state?.deviceId)return send(res,400,{error:"deviceId required"});
   if(!await authorizeOwner(state.deviceId,tokenFrom(req,state)))return send(res,403,{error:"merchant not authorized"});
   const next={...state,serverUpdatedAt:Date.now(),eventId:crypto.randomUUID()};
   await saveState(state.deviceId,next);
   await broadcast(state.deviceId,next);
   send(res,200,{ok:true,eventId:next.eventId});
 });
 send(res,404,{error:"not found"});
});
server.listen(PORT,()=>console.log("Avero device sync listening on "+PORT));