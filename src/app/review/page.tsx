"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function ReviewQueue() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    fetch("/api/content").then(r=>r.json()).then(d => setItems((d.items||[]).filter((i:any)=>["submitted","in_review","changes_requested"].includes(i.status))));
  }, []);
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Review Queue</h1>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr><th className="p-3 text-left font-medium">Title</th><th className="p-3 text-left font-medium">Status</th><th className="p-3 text-left font-medium">Issues</th><th className="p-3"></th></tr>
          </thead>
          <tbody>
            {items.map((it:any)=>(
              <tr key={it.id} className="border-t border-slate-100 hover:bg-slate-50/50">
                <td className="p-3 font-medium">{it.title}</td>
                <td className="p-3"><span className="badge bg-amber-100 text-amber-700">{it.status.replace("_"," ")}</span></td>
                <td className="p-3">{it._count?.issues ?? 0}</td>
                <td className="p-3 text-right"><Link href={`/content/${it.id}`} className="text-blue-600 font-medium hover:underline">Open →</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length===0 && <p className="text-slate-500 p-6 text-center">No items pending review.</p>}
      </div>
    </div>
  );
}
