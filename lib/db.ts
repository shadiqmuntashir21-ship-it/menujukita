import { neon } from "@neondatabase/serverless";

type QuerySpec={text:string;params:any[]};
type TransactionOptions={isolationLevel?:string};
const DEFAULT_BRIDGE="https://br-bitter-waterfall-b5jea6qo-dbbridge.compute.c-7.us-east-2.aws.neon.tech/";

function bridgeUrl(){return process.env.DB_BRIDGE_URL||DEFAULT_BRIDGE}
function normalize(value:any):any{
  if(value===undefined)throw new Error("Undefined values are not allowed");
  if(value instanceof Date)return value.toISOString();
  if(typeof value==="bigint")return value.toString();
  if(value instanceof Uint8Array)return{__type:"bytes",base64:Buffer.from(value).toString("base64")};
  if(Array.isArray(value))return value.map(normalize);
  if(value&&typeof value==="object")return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,normalize(v)]));
  return value;
}
function spec(strings:TemplateStringsArray,values:any[]):QuerySpec{
  let text="";
  for(let i=0;i<strings.length;i++){
    text+=strings[i];
    if(i<values.length)text+="$"+(i+1);
  }
  return{text,params:values.map(normalize)};
}
async function callBridge(queries:QuerySpec[],mode:"query"|"transaction"="query",options?:TransactionOptions){
  const token=process.env.VERCEL_OIDC_TOKEN;
  if(!token)throw new Error("VERCEL_OIDC_TOKEN tidak tersedia untuk DB bridge");
  const res=await fetch(bridgeUrl(),{
    method:"POST",
    headers:{"content-type":"application/json","authorization":`Bearer ${token}`},
    body:JSON.stringify({mode,queries,isolationLevel:options?.isolationLevel}),
    cache:"no-store"
  });
  const data=await res.json().catch(()=>({})) as any;
  if(!res.ok||!data?.ok){
    const err:any=new Error(data?.message||data?.error||`DB bridge error ${res.status}`);
    if(data?.code)err.code=data.code;
    throw err;
  }
  return data.results as any[][];
}
class BridgeQuery implements PromiseLike<any[]>{
  __bridge:QuerySpec;
  constructor(q:QuerySpec){this.__bridge=q}
  then<TResult1=any[],TResult2=never>(onfulfilled?:((value:any[])=>TResult1|PromiseLike<TResult1>)|null,onrejected?:((reason:any)=>TResult2|PromiseLike<TResult2>)|null){
    return callBridge([this.__bridge]).then(x=>x[0]).then(onfulfilled as any,onrejected as any);
  }
  catch(onrejected:any){return callBridge([this.__bridge]).then(x=>x[0]).catch(onrejected)}
  finally(onfinally:any){return callBridge([this.__bridge]).then(x=>x[0]).finally(onfinally)}
}
function bridgeDb(){
  const tag:any=(strings:TemplateStringsArray,...values:any[])=>new BridgeQuery(spec(strings,values));
  tag.transaction=async(queries:any[],options?:TransactionOptions)=>{
    const specs=queries.map(q=>{
      if(!(q instanceof BridgeQuery))throw new Error("Transaction hanya menerima query DB bridge");
      return q.__bridge;
    });
    return callBridge(specs,"transaction",options);
  };
  return tag;
}
export function sql(){
  if(process.env.VERCEL==="1")return bridgeDb();
  if(!process.env.DATABASE_URL)throw new Error("DATABASE_URL belum dikonfigurasi");
  return neon(process.env.DATABASE_URL);
}
