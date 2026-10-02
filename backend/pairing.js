const crypto=require("crypto");
const pending=new Map();
const paired=new Map();

function normalize(code){return String(code||"").trim().toUpperCase().replace(/[^A-Z0-9-]/g,"").slice(0,32)}
function createPairingCode(){return crypto.randomBytes(3).toString("hex").toUpperCase().slice(0,6)}

function createPairing(){const code=createPairingCode();pending.set(code,{createdAt:Date.now()});return code}
function pair(code,device){const key=normalize(code);const request=pending.get(key);if(!request)return null;pending.delete(key);const record={deviceId:device||"display-"+crypto.randomUUID(),pairedAt:Date.now()};paired.set(record.deviceId,record);return record}
function isPaired(deviceId){return paired.has(deviceId)}
function cleanup(){const now=Date.now();for(const [code,v] of pending){if(now-v.createdAt>10*60*1000)pending.delete(code)}}
setInterval(cleanup,60*1000).unref();

module.exports={normalize,createPairingCode,createPairing,pair,isPaired};