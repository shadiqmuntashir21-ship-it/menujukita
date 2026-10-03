import postgres from './postgres/src/index.js';
import { createPublicKey, verify as cryptoVerify } from 'node:crypto';

const EXPECTED={
  issuer:'https://oidc.vercel.com/shadiq',
  audience:'https://vercel.com/shadiq',
  subject:'owner:shadiq:project:menujukita-da4n:environment:production',
  owner:'shadiq',
  ownerId:'team_NqCu4LxDlACYU9oaLwwMqGO6',
  project:'menujukita-da4n',
  projectId:'prj_ozb4CSrWCVsRIFAqA39uQi4UbGqS',
  environment:'production'
};
const db=postgres(process.env.DATABASE_URL,{max:5,idle_timeout:20,connect_timeout:10,prepare:false});
let jwksCache=null,jwksAt=0;
const json=(x,status=200)=>Response.json(x,{status,headers:{'cache-control':'no-store'}});

function decodeJson(part){return JSON.parse(Buffer.from(part,'base64url').toString('utf8'))}
async function jwks(){
  if(jwksCache&&Date.now()-jwksAt<3600000)return jwksCache;
  const res=await fetch('https://oidc.vercel.com/.well-known/jwks',{cache:'no-store'});
  if(!res.ok)throw new Error('oidc_jwks_unavailable');
  jwksCache=await res.json();jwksAt=Date.now();return jwksCache;
}
async function verifyOidc(token){
  const parts=String(token||'').split('.');
  if(parts.length!==3)throw new Error('oidc_malformed');
  const header=decodeJson(parts[0]),payload=decodeJson(parts[1]);
  if(header.alg!=='RS256'||!header.kid)throw new Error('oidc_algorithm');
  const set=await jwks(),jwk=Array.isArray(set.keys)?set.keys.find(k=>k.kid===header.kid):null;
  if(!jwk)throw new Error('oidc_key');
  const key=createPublicKey({key:jwk,format:'jwk'});
  const valid=cryptoVerify('RSA-SHA256',Buffer.from(parts[0]+'.'+parts[1]),key,Buffer.from(parts[2],'base64url'));
  if(!valid)throw new Error('oidc_signature');
  const now=Math.floor(Date.now()/1000),aud=Array.isArray(payload.aud)?payload.aud:[payload.aud];
  if(payload.iss!==EXPECTED.issuer||!aud.includes(EXPECTED.audience)||payload.sub!==EXPECTED.subject)throw new Error('oidc_identity');
  if(payload.owner!==EXPECTED.owner||payload.owner_id!==EXPECTED.ownerId||payload.project!==EXPECTED.project||payload.project_id!==EXPECTED.projectId||payload.environment!==EXPECTED.environment)throw new Error('oidc_scope');
  if(!payload.exp||Number(payload.exp)<=now-30)throw new Error('oidc_expired');
  const nbf=payload.nbf??payload.nfb;
  if(nbf&&Number(nbf)>now+30)throw new Error('oidc_not_yet_valid');
  return payload;
}
async function run(client,q){
  if(!q||typeof q.text!=='string'||q.text.length===0||q.text.length>150000||!Array.isArray(q.params)||q.params.length>2000)throw new Error('invalid_query');
  return await client.unsafe(q.text,q.params);
}

export default{async fetch(request){
  const url=new URL(request.url);
  if(request.method==='GET'&&(url.pathname==='/'||url.pathname==='/health')){
    try{
      const x=await db.unsafe('select 1 as ok');
      return json({ok:Number(x[0]?.ok)===1,database:true,oidc:true});
    }catch(e){
      console.error('dbbridge_health',e instanceof Error?e.message:String(e));
      return json({ok:false,database:false,oidc:true},503);
    }
  }
  if(request.method!=='POST')return json({error:'method_not_allowed'},405);
  const len=Number(request.headers.get('content-length')||0);
  if(len>2500000)return json({error:'payload_too_large'},413);
  const auth=request.headers.get('authorization')||'';
  if(!auth.startsWith('Bearer '))return json({error:'unauthorized'},401);
  try{await verifyOidc(auth.slice(7))}
  catch(e){console.error('dbbridge_auth',e instanceof Error?e.message:String(e));return json({error:'unauthorized'},401)}
  const body=await request.json().catch(()=>null),queries=body?.queries;
  if(!Array.isArray(queries)||queries.length<1||queries.length>1200)return json({error:'invalid_queries'},400);
  try{
    let results;
    if(body?.mode==='transaction'){
      const work=async tx=>{const out=[];for(const q of queries)out.push(await run(tx,q));return out};
      results=body?.isolationLevel==='Serializable'
        ? await db.begin('isolation level serializable',work)
        : await db.begin(work);
    }else{
      results=[];for(const q of queries)results.push(await run(db,q));
    }
    return json({ok:true,results});
  }catch(e){
    console.error('dbbridge_query',e instanceof Error?e.message:String(e));
    return json({error:'database_query_failed',code:e?.code||null,message:e instanceof Error?e.message.slice(0,300):'query_failed'},400);
  }
}};