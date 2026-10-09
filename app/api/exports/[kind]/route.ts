import {requireWorkspace} from "@/lib/workspace";
const format=(v:any)=>v instanceof Date?v.toISOString().slice(0,10):v===null||v===undefined?"":String(v);
const safe=(v:any)=>{
 const raw=format(v).replace(/\r?\n/g," ").trim();
 const guarded=/^[=+@\-\t\r]/.test(raw)?"'"+raw:raw;
 return '"'+guarded.replace(/"/g,'""')+'"';
};
function csv(headers:string[],rows:any[][]){return "\uFEFF"+headers.map(safe).join(",")+"\r\n"+rows.map(row=>row.map(safe).join(",")).join("\r\n")}
export async function GET(_req:Request,{params}:{params:Promise<{kind:string}>}){
 const{kind}=await params,{db,wedding}=await requireWorkspace();
 const id=String(wedding.id);
 let headers:string[]=[];
 let rows:any[][]=[];
 if(kind==="tamu"){
  headers=["Nama","Kelompok","Pihak","Telepon","Estimasi Orang","Status RSVP","Orang Hadir","Catatan"];
  const data=await db`SELECT g.name,p.group_name,p.side,g.phone,g.expected_pax,g.rsvp_status,g.actual_pax,g.notes
    FROM guests g LEFT JOIN guest_parties p ON p.id=g.party_id WHERE g.wedding_id=${id} ORDER BY p.group_name,g.name LIMIT 1600`;
  rows=data.map((g:any)=>[g.name,g.group_name,g.side,g.phone,g.expected_pax,g.rsvp_status,g.actual_pax,g.notes]);
 }else if(kind==="checklist"){
  headers=["Tugas","Kategori","Prioritas","Status","Tenggat","Keterangan"];
  const data=await db`SELECT title,category,priority,status,due_date,description FROM tasks WHERE wedding_id=${id} ORDER BY due_date NULLS LAST,title LIMIT 1000`;
  rows=data.map((x:any)=>[x.title,x.category,x.priority,x.status,x.due_date,x.description]);
 }else if(kind==="vendor"){
  headers=["Nama Vendor","Kategori","Status","Penawaran","Harga Disepakati","PIC","WhatsApp","Catatan"];
  const data=await db`SELECT name,category,status,quoted_price,agreed_price,pic_name,whatsapp,notes FROM vendors WHERE wedding_id=${id} ORDER BY category,name LIMIT 500`;
  rows=data.map((x:any)=>[x.name,x.category,x.status,x.quoted_price,x.agreed_price,x.pic_name,x.whatsapp,x.notes]);
 }else if(kind==="keuangan"){
  headers=["Tanggal","Jenis","Penyetor / Pihak","Jumlah Rupiah","Catatan"];
  const data=await db`SELECT happened_on,kind,contributor,amount,note FROM wedding_cash_entries
    WHERE wedding_id=${id} AND voided_at IS NULL ORDER BY happened_on DESC,created_at DESC LIMIT 3000`;
  rows=data.map((x:any)=>[x.happened_on,x.kind,x.contributor,x.amount,x.note]);
 }else if(kind==="seserahan"){
  headers=["Barang","Jumlah","Harga Estimasi Satuan","Harga Aktual Satuan","Status","Toko","Catatan"];
  const data=await db`SELECT name,quantity,estimated_amount,actual_amount,purchased,store,notes FROM wedding_gifts WHERE wedding_id=${id} ORDER BY created_at LIMIT 250`;
  rows=data.map((x:any)=>[x.name,x.quantity,x.estimated_amount,x.actual_amount,x.purchased?"Sudah dibeli":"Belum dibeli",x.store,x.notes]);
 }else if(kind==="rundown"){
  headers=["Mulai","Selesai","Kegiatan","Lokasi","Status","PIC","Vendor","Catatan"];
  const data=await db`SELECT r.starts_at,r.ends_at,r.activity,r.location,r.status,m.display_name pic,v.name vendor,r.notes FROM rundown_items r
    LEFT JOIN wedding_members m ON m.id=r.pic_member_id
    LEFT JOIN vendors v ON v.id=r.vendor_id WHERE r.wedding_id=${id} ORDER BY r.starts_at LIMIT 500`;
  rows=data.map((x:any)=>[x.starts_at,x.ends_at,x.activity,x.location,x.status,x.pic,x.vendor,x.notes]);
 }else{
  return new Response("Jenis laporan tidak tersedia.",{status:404,headers:{"Content-Type":"text/plain; charset=utf-8"}});
 }
 const body=csv(headers,rows);
 return new Response(body,{headers:{"Content-Type":"text/csv; charset=utf-8","Content-Disposition":'attachment; filename="menujukita-'+kind+'.csv"',"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"}});
}
