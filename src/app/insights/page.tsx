"use client";
import { useEffect, useState } from "react";

export default function Insights() {
  const [data, setData] = useState<any>(null);
  useEffect(() => { fetch("/api/insights").then(r=>r.json()).then(setData); }, []);
  if (!data) return <div className="card p-8 text-center text-slate-500">Loading...</div>;
  const Stat = ({label,value}:{label:string;value:any}) => (
    <div className="card p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  );
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Governance Insights</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Stat label="Content items" value={data.contents} />
        <Stat label="Published" value={data.published} />
        <Stat label="Total issues" value={data.totalIssues} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-5">
          <h2 className="font-semibold mb-3">Issues by category</h2>
          <div className="space-y-2">
            {Object.entries(data.byCategory||{}).map(([k,v]:any)=>(
              <div key={k} className="flex items-center justify-between text-sm">
                <span className="capitalize text-slate-700">{k}</span>
                <span className="font-medium">{v}</span>
              </div>
            ))}
            {Object.keys(data.byCategory||{}).length===0 && <p className="text-slate-400 text-sm">No data yet.</p>}
          </div>
        </div>
        <div className="card p-5">
          <h2 className="font-semibold mb-3">Issues by severity</h2>
          <div className="space-y-2">
            {Object.entries(data.bySeverity||{}).map(([k,v]:any)=>(
              <div key={k} className="flex items-center justify-between text-sm">
                <span className="capitalize text-slate-700">{k}</span>
                <span className="font-medium">{v}</span>
              </div>
            ))}
            {Object.keys(data.bySeverity||{}).length===0 && <p className="text-slate-400 text-sm">No data yet.</p>}
          </div>
        </div>
      </div>
      <p className="text-xs text-slate-400">Recurring issues and unclear guidelines surface here over time.</p>
    </div>
  );
}
