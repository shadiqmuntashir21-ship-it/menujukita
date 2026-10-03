import { switchWorkspace } from "@/app/app/workspace-actions";

export default function WorkspaceSwitcher({items,activeId}:{items:any[];activeId:string}){
  if(items.length<=1)return null;
  return <form action={switchWorkspace} className="workspace-switcher">
    <select className="input compact" name="wedding_id" defaultValue={activeId}>
      {items.map(w=><option key={w.id} value={w.id}>{w.couple_one_name} & {w.couple_two_name} · {w.role}</option>)}
    </select>
    <button className="btn btn-sm">Pindah</button>
  </form>
}
