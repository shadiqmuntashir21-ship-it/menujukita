export default function Loading(){
  return <div className="app-loading-shell">
    <aside className="loading-sidebar"><div className="loading-block brand-skeleton"/>{Array.from({length:8}).map((_,i)=><div className="loading-block menu-skeleton" key={i}/>)}</aside>
    <main className="loading-main">
      <div className="loading-block title-skeleton"/>
      <div className="loading-block hero-skeleton"/>
      <div className="loading-grid">{Array.from({length:4}).map((_,i)=><div className="loading-block card-skeleton" key={i}/>)}</div>
      <div className="loading-content"><div className="loading-block panel-skeleton"/><div className="loading-block panel-skeleton"/></div>
    </main>
  </div>;
}
