"use client";
import { useEffect, useState } from "react";

export default function BrandKit() {
  const [guidelines, setGuidelines] = useState<any[]>([]);
  const [facts, setFacts] = useState<any[]>([]);
  const [terms, setTerms] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [me, setMe] = useState<any>(null);
  const [g, setG] = useState({ title: "", category: "tone", content: "" });
  const [f, setF] = useState({ statement: "", source: "" });
  const [t, setT] = useState({ term: "", preferred: "", avoid: "", note: "" });
  const [a, setA] = useState({ name: "", type: "image", url: "", metadata: "" });

  async function load() {
    const [g, f, t, a, m] = await Promise.all([
      fetch("/api/brand/guidelines").then(r=>r.json()),
      fetch("/api/brand/facts").then(r=>r.json()),
      fetch("/api/brand/terms").then(r=>r.json()),
      fetch("/api/brand/assets").then(r=>r.json()),
      fetch("/api/auth/me").then(r=>r.json()),
    ]);
    setGuidelines(g.items||[]); setFacts(f.items||[]); setTerms(t.items||[]); setAssets(a.items||[]); setMe(m.user);
  }
  useEffect(() => { load(); }, []);

  const canEdit = me && ["steward","admin"].includes(me.role);

  async function add(path: string, body: any, reset: () => void) {
    await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    reset(); load();
  }

  const Section = ({ title, children }: any) => (
    <section className="card p-5 space-y-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );

  const readOnlyNotice = (
    <p className="text-xs text-slate-500 bg-slate-50 border border-slate-100 rounded-lg p-2">
      Read-only — only Brand Stewards and Admins can edit the brand kit.
    </p>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Brand Kit</h1>
        <p className="text-slate-500 text-sm mt-1">The single source of truth for your brand.</p>
      </div>

      {!canEdit && (
        <div className="card p-3">{readOnlyNotice}</div>
      )}

      <Section title="Guidelines">
        {canEdit && (<>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <input className="input" placeholder="Title" value={g.title} onChange={e=>setG({...g,title:e.target.value})} />
          <select className="input" value={g.category} onChange={e=>setG({...g,category:e.target.value})}>
            {["tone","terminology","messaging","visual","accessibility","claims"].map(c=><option key={c}>{c}</option>)}
          </select>
        </div>
        <textarea className="input h-24" placeholder="Content" value={g.content} onChange={e=>setG({...g,content:e.target.value})} />
        <button className="btn-primary text-sm" onClick={()=>add("/api/brand/guidelines", g, ()=>setG({title:"",category:"tone",content:""}))}>Add Guideline</button>
        </>)}
        <div className="space-y-2 mt-2">
          {guidelines.map((x:any)=>(
            <div key={x.id} className="border border-slate-100 rounded-lg p-3 bg-slate-50/50">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">{x.title}</span>
                <span className="badge bg-blue-100 text-blue-700">{x.category}</span>
              </div>
              <p className="text-sm text-slate-600">{x.content}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Approved Facts">
        {canEdit && (<>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <input className="input" placeholder="Statement" value={f.statement} onChange={e=>setF({...f,statement:e.target.value})} />
          <input className="input" placeholder="Source" value={f.source} onChange={e=>setF({...f,source:e.target.value})} />
        </div>
        <button className="btn-primary text-sm" onClick={()=>add("/api/brand/facts", f, ()=>setF({statement:"",source:""}))}>Add Fact</button>
        </>)}
        <ul className="text-sm divide-y divide-slate-100">
          {facts.map((x:any)=><li key={x.id} className="py-2"><span>{x.statement}</span> <span className="text-slate-400">({x.source})</span></li>)}
        </ul>
      </Section>

      <Section title="Terminology">
        {canEdit && (<>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <input className="input" placeholder="Term" value={t.term} onChange={e=>setT({...t,term:e.target.value})} />
          <input className="input" placeholder="Preferred" value={t.preferred} onChange={e=>setT({...t,preferred:e.target.value})} />
          <input className="input" placeholder="Avoid" value={t.avoid} onChange={e=>setT({...t,avoid:e.target.value})} />
          <input className="input" placeholder="Note" value={t.note} onChange={e=>setT({...t,note:e.target.value})} />
        </div>
        <button className="btn-primary text-sm" onClick={()=>add("/api/brand/terms", t, ()=>setT({term:"",preferred:"",avoid:"",note:""}))}>Add Term</button>
        </>)}
        <ul className="text-sm divide-y divide-slate-100">
          {terms.map((x:any)=><li key={x.id} className="py-2"><b>{x.term}</b> → {x.preferred} {x.avoid && <span className="text-slate-400">(avoid: {x.avoid})</span>} {x.note && <span className="text-slate-500">— {x.note}</span>}</li>)}
        </ul>
      </Section>

      <Section title="Assets">
        {canEdit && (<>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <input className="input" placeholder="Name" value={a.name} onChange={e=>setA({...a,name:e.target.value})} />
          <select className="input" value={a.type} onChange={e=>setA({...a,type:e.target.value})}>
            <option>image</option><option>logo</option><option>template</option><option>document</option>
          </select>
          <input className="input" placeholder="URL" value={a.url} onChange={e=>setA({...a,url:e.target.value})} />
          <input className="input" placeholder="Metadata (alt, dims)" value={a.metadata} onChange={e=>setA({...a,metadata:e.target.value})} />
        </div>
        <button className="btn-primary text-sm" onClick={()=>add("/api/brand/assets", a, ()=>setA({name:"",type:"image",url:"",metadata:""}))}>Add Asset</button>
        </>)}
        <ul className="text-sm divide-y divide-slate-100">
          {assets.map((x:any)=><li key={x.id} className="py-2"><b>{x.name}</b> <span className="badge bg-slate-100 text-slate-600">{x.type}</span> {x.url} {x.metadata && <span className="text-slate-500">— {x.metadata}</span>}</li>)}
        </ul>
      </Section>
    </div>
  );
}
