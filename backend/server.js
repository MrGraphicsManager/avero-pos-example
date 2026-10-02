const http=require('http');
const crypto=require('crypto');
const PORT=process.env.PORT||8080;
const clients=new Map();

function send(res,status,data){res.writeHead(status,{'Content-Type':'application/json','Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type'});res.end(JSON.stringify(data));}
function broadcast(deviceId,state){const group=clients.get(deviceId)||new Set();for(const res of group){res.write('data: '+JSON.stringify(state)+'\n\n')}}

const server=http.createServer((req,res)=>{
 if(req.method==='OPTIONS'){res.writeHead(204,{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type'});return res.end();}
 const url=new URL(req.url,'http://localhost:'+PORT);
 if(url.pathname==='/health')return send(res,200,{ok:true,service:'avero-device-sync'});
 if(url.pathname==='/device/stream'&&req.method==='GET'){
   const deviceId=url.searchParams.get('device')||'hp-elitepos-10-1';
   res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache','Connection':'keep-alive','Access-Control-Allow-Origin':'*'});
   res.write(': connected\n\n');
   if(!clients.has(deviceId))clients.set(deviceId,new Set());
   clients.get(deviceId).add(res);
   req.on('close',()=>clients.get(deviceId)?.delete(res));
   return;
 }
 if(url.pathname==='/device/state'&&req.method==='POST'){
   let body='';req.on('data',c=>body+=c);req.on('end',()=>{try{const state=JSON.parse(body);if(!state.deviceId)return send(res,400,{error:'deviceId required'});broadcast(state.deviceId,{...state,serverUpdatedAt:Date.now(),eventId:crypto.randomUUID()});send(res,200,{ok:true})}catch{send(res,400,{error:'invalid json'})}});
   return;
 }
 send(res,404,{error:'not found'});
});
server.listen(PORT,()=>console.log('Avero device sync listening on '+PORT));