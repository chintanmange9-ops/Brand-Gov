"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Dashboard() {
  const [items, setItems] = useState<any[]>([]);
  const [me, setMe] = useState<any>(null);
  useEffect(() => {
    fetch("/api/auth/me").then(r=>r.json()).then(d=>setMe(d.user));
    fetch("/api/content").then(r=>r.json()).then(d=>setItems(d.items||[]));
  }, []);
  const statusColor: Record<string,string> = { draft:"bg-slate-100 text-slate-700", submitted:"bg-blue-100 text-blue-700", in_review:"bg-amber-100 text-amber-700", changes_requested:"bg-orange-100 text-orange-700", approved:"bg-emerald-100 text-emerald-700", rejected:"bg-red-100 text-red-700", published:"bg-green-100 text-green-700" };
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          {me && <p className="text-slate-500 text-sm mt-1">Signed in as {me.name} · <span className="capitalize">{me.role}</span></p>}
        </div>
        <div className="flex gap-2">
          <Link href="/content/new" className="btn-primary">+ New Content</Link>
          <Link href="/brand-kit" className="btn-secondary">Brand Kit</Link>
        </div>
      </div>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr><th className="p-3 text-left font-medium">Title</th><th className="p-3 text-left font-medium">Type</th><th className="p-3 text-left font-medium">Status</th><th className="p-3 text-left font-medium">Issues</th><th className="p-3"></th></tr>
          </thead>
          <tbody>
            {items.map((it:any) => (
              <tr key={it.id} className="border-t border-slate-100 hover:bg-slate-50/50">
                <td className="p-3 font-medium">{it.title}</td>
                <td className="p-3 text-slate-500 capitalize">{it.type}</td>
                <td className="p-3"><span className={`badge ${statusColor[it.status]||"bg-slate-100"}`}>{it.status.replace("_"," ")}</span></td>
                <td className="p-3">{it._count?.issues ?? 0}</td>
                <td className="p-3 text-right"><Link href={`/content/${it.id}`} className="text-blue-600 font-medium hover:underline">Open →</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && <p className="text-slate-500 p-6 text-center">No content yet. Create your first draft.</p>}
      </div>
    </div>
  );
}
