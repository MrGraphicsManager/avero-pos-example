const http=require("http");
const crypto=require("crypto");
const {createPairing,pair,getDevice,authorize}=require("./pairing");
const PORT=process.env.PORT||8080;
const clients=new Map();
function send(res,status,data){res.writeHead(status,{"Content-Type":"application/json","Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"Content-Type,Authorization"});res.end(JSON.stringify(data))}
function readBody(req,done){let body="";req.on("data",c=>body+=c);req.on("end",()=>{try{done(JSON.parse(body||"{}"))}catch{done(null)}})}
function tokenFrom(req,body){return req.headers.authorization?.replace(/^Bearer\s+/i,"")||body?.token}
async function broadcast(deviceId,state){const group=clients.get(deviceId)||new Set();for(const res of group)res.write("data: "+JSON.stringify(state)+"\n\n")}
const server=http.createServer(async(req,res)=>{
 if(req.method==="OPTIONS"){res.writeHead(204,{"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"Content-Type,Authorization"});return res.end()}
 const url=new URL(req.url,"http://localhost:"+PORT);
 if(url.pathname==="/health")return send(res,200,{ok:true,service:"avero-device-sync"});
 if(url.pathname==="/pairing/create"&&req.method==="POST")return send(res,200,{ok:true,code:createPairing()});
 if(url.pathname==="/pairing/claim"&&req.method==="POST")return readBody(req,async body=>{if(!body)return send(res,400,{error:"invalid json"});try{const record=await pair(body.code,body.deviceId);return record?send(res,200,{ok:true,deviceId:record.deviceId,token:record.token,pairedAt:record.pairedAt}):send(res,404,{error:"invalid or expired pairing code"})}catch(e){send(res,500,{error:"pairing service unavailable"})}});
 if(url.pathname==="/device/stream"&&req.method==="GET"){
   const deviceId=url.searchParams.get("device")||"hp-elitepos-10-1",token=url.searchParams.get("token")||"";
   if(!await authorize(deviceId,token))return send(res,403,{error:"device not authorized"});
   res.writeHead(200,{"Content-Type":"text/event-stream","Cache-Control":"no-cache","Connection":"keep-alive","Access-Control-Allow-Origin":"*"});res.write(": connected\n\n");if(!clients.has(deviceId))clients.set(deviceId,new Set());clients.get(deviceId).add(res);req.on("close",()=>clients.get(deviceId)?.delete(res));return;
 }
 if(url.pathname==="/device/state"&&req.method==="POST")return readBody(req,async state=>{if(!state?.deviceId)return send(res,400,{error:"deviceId required"});if(!await authorize(state.deviceId,tokenFrom(req,state)))return send(res,403,{error:"device not authorized"});await broadcast(state.deviceId,{...state,serverUpdatedAt:Date.now(),eventId:crypto.randomUUID()});send(res,200,{ok:true})});
 send(res,404,{error:"not found"});
});
server.listen(PORT,()=>console.log("Avero device sync listening on "+PORT));