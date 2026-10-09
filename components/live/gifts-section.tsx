import {Gift,BookOpen,Plus} from "lucide-react";
import CurrencyInput from "@/components/currency-input";
import {saveWeddingGift,deleteWeddingGift} from "@/app/app/companion-actions";
import {money} from "@/components/live/shared";
import ConfirmSubmit from "@/components/confirm-submit";
export default function GiftsSection({gifts}:{gifts:any[]}){
 const plan=gifts.reduce((sum,g)=>sum+Number(g.estimated_amount)*Number(g.quantity),0);
 const actual=gifts.filter(g=>g.purchased).reduce((sum,g)=>sum+Number(g.actual_amount)*Number(g.quantity),0);
 return <section className="module-stack" id="gifts">
  <header className="module-editorial-head"><div><span className="micro-label">SESERAHAN & KEBUTUHAN</span><h2 className="serif">Siapkan satu per satu.</h2><p>Catat barang, jumlah, harga, toko dan status pembelian. Isi berdasarkan kebutuhan keluarga, bukan daftar wajib.</p></div><Gift size={27}/></header>
  <details className="composer-card"><summary><span><BookOpen size={17}/> Panduan membuat daftar seserahan</span><small>Apa yang benar-benar diperlukan?</small></summary><div style={{padding:16,lineHeight:1.7}}><p>Tradisi dan kebutuhan setiap pasangan berbeda. Diskusikan barang yang diperlukan terlebih dahulu, tentukan perkiraan harga dan PIC. Tandai pembelian setelah barang benar-benar tersedia.</p><p>Estimasi barang tidak otomatis mengurangi saldo kas. Catat pembayaran yang benar-benar terjadi di Keuangan agar tidak dihitung dua kali.</p></div></details>
  <div className="guest-overview"><div><small>Total item</small><b>{gifts.length}</b></div><div><small>Sudah dibeli</small><b>{gifts.filter(x=>x.purchased).length}</b></div><div><small>Estimasi</small><b>{money(plan)}</b></div><div><small>Harga dibeli</small><b>{money(actual)}</b></div></div>
  <details className="composer-card"><summary><span><Plus size={18}/> Tambah barang</span><small>Rincikan kebutuhan bersama</small></summary><GiftForm/></details>
  <div className="studio-list">{gifts.length?gifts.map(g=><details className="studio-item" key={g.id}>
   <summary><div className="item-main"><b>{g.name}</b><span>{g.quantity} buah · {g.store||"Toko belum ditentukan"}</span></div><span className={"status-dot status-"+(g.purchased?"done":"todo")}>{g.purchased?"Sudah dibeli":"Direncanakan"}</span></summary>
   <div className="item-editor"><GiftForm row={g}/><form action={deleteWeddingGift} className="danger-zone"><input type="hidden" name="id" value={g.id}/><ConfirmSubmit message="Hapus barang? Riwayat keuangan terpisah tidak berubah.">Hapus barang</ConfirmSubmit></form></div>
  </details>):<div className="calm-empty actionable"><b>Belum ada barang seserahan.</b><span>Mulai dari kebutuhan yang sudah disepakati bersama.</span></div>}</div>
 </section>;
}
function GiftForm({row}:{row?:any}){
 return <form action={saveWeddingGift} className="editor-form">{row&&<input type="hidden" name="id" value={row.id}/>}
 <label className="field span-2"><span>Nama barang</span><input className="input" name="name" required maxLength={160} defaultValue={row?.name||""} placeholder="Contoh: perlengkapan ibadah"/></label>
 <label className="field"><span>Jumlah barang</span><input className="input" type="number" name="quantity" min="1" max="1000" defaultValue={row?.quantity||1}/></label>
 <label className="field"><span>Toko / penjual</span><input className="input" name="store" defaultValue={row?.store||""}/></label>
 <label className="field"><span>Estimasi satuan</span><CurrencyInput name="estimated_amount" defaultValue={Number(row?.estimated_amount||0)}/></label>
 <label className="field"><span>Harga aktual satuan</span><CurrencyInput name="actual_amount" defaultValue={Number(row?.actual_amount||0)}/></label>
 <label className="field span-2"><span>Status barang</span><select className="input" name="purchased" defaultValue={row?.purchased?"yes":"no"}><option value="no">Belum dibeli</option><option value="yes">Sudah dibeli</option></select></label>
 <label className="field span-2"><span>Catatan</span><textarea className="input" name="notes" maxLength={500} defaultValue={row?.notes||""}/></label>
 <button className="btn btn-primary span-2">{row?"Simpan perubahan":"Tambah barang"}</button>
 </form>
}
