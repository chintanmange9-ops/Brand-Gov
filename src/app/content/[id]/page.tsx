"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Suspense } from "react";

export default function Page() {
  return <Suspense fallback={<p className="p-6">Loading...</p>}><ContentDetail /></Suspense>;
}

const SEV: Record<string,string> = { critical: "bg-red-100 text-red-700", major: "bg-orange-100 text-orange-700", minor: "bg-amber-100 text-amber-700", suggestion: "bg-blue-100 text-blue-700" };

function ContentDetail() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<any>(null);
  const [me, setMe] = useState<any>(null);
  const [comment, setComment] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    const [c, m] = await Promise.all([
      fetch(`/api/content/${id}`).then(r=>r.json()),
      fetch("/api/auth/me").then(r=>r.json()),
    ]);
    setItem(c.item); setMe(m.user);
  }
  useEffect(() => { load(); }, [id]);

  async function submit() { setLoading(true); await fetch(`/api/content/${id}/submit`, { method: "POST" }); setLoading(false); load(); }
  async function review(decision: string) {
    await fetch(`/api/content/${id}/review`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ decision, comment: reviewComment }) });
    load();
  }
  async function publish() { await fetch(`/api/content/${id}/publish`, { method: "POST" }); load(); }
  async function addComment() {
    if (!comment.trim()) return;
    await fetch(`/api/content/${id}/comment`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: comment }) });
    setComment(""); load();
  }
  async function issueAction(issueId: string, status: string, reason?: string) {
    await fetch(`/api/content/${id}/issue/${issueId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status, dismissReason: reason }) });
    load();
  }
  async function saveBody() {
    await fetch(`/api/content/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body: item.body }) });
    load();
  }

  if (!item) return <div className="card p-8 text-center text-slate-500">Loading...</div>;
  const canReview = me && ["reviewer","manager","admin","steward"].includes(me.role);
  const canPublish = me && ["manager","admin","steward"].includes(me.role);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-bold tracking-tight">{item.title}</h1>
        <span className="badge bg-slate-100 text-slate-700 capitalize">{item.status.replace("_"," ")}</span>
        {item.status === "draft" && <button onClick={submit} disabled={loading} className="btn-primary">{loading?"Reviewing...":"Run AI Review"}</button>}
        {item.status === "approved" && canPublish && <button onClick={publish} className="btn-primary bg-emerald-600 hover:bg-emerald-700">Publish</button>}
      </div>
      <p className="text-sm text-slate-500">By {item.creator?.name} · {item.type}</p>

      <section className="card p-5 space-y-3">
        <h2 className="font-semibold">Content</h2>
        <textarea className="input h-40 font-mono text-sm" value={item.body || ""} onChange={e=>setItem({...item, body: e.target.value})} />
        {["draft","changes_requested","rejected"].includes(item.status) && <button onClick={saveBody} className="btn-secondary text-sm">Save revision</button>}
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">Findings ({item.issues?.length ?? 0})</h2>
        {(!item.issues || item.issues.length === 0) && <div className="card p-6 text-center text-slate-500 text-sm">No findings yet. Run AI Review.</div>}
        <div className="space-y-3">
          {item.issues?.map((iss: any) => (
            <div key={iss.id} className="card p-4 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`badge ${SEV[iss.severity] || "bg-slate-100 text-slate-700"}`}>{iss.severity}</span>
                <span className="text-xs text-slate-500 capitalize">{iss.category}</span>
                {iss.location && <span className="text-xs text-slate-400">· {iss.location}</span>}
                <span className="ml-auto text-xs text-slate-400">{iss.status}</span>
              </div>
              {iss.flaggedText && <p className="text-sm italic text-slate-700 bg-slate-50 rounded p-2">"{iss.flaggedText}"</p>}
              <p className="text-sm text-slate-800">{iss.explanation}</p>
              {iss.sourceRef && <p className="text-xs text-slate-500">Source: {iss.sourceRef}</p>}
              {iss.suggestedFix && <div className="text-sm bg-emerald-50 text-emerald-800 rounded p-2"><span className="font-medium">Suggested:</span> {iss.suggestedFix}</div>}
              {iss.confidence != null && <p className="text-xs text-slate-400">Confidence: {(iss.confidence*100).toFixed(0)}%</p>}
              {iss.status === "open" && (
                <div className="flex gap-2 pt-1">
                  <button onClick={()=>issueAction(iss.id,"resolved")} className="btn-primary text-xs px-3 py-1">Accept</button>
                  <button onClick={()=>{const r=prompt("Reason?"); if(r!==null) issueAction(iss.id,"dismissed",r);}} className="btn-secondary text-xs px-3 py-1">Dismiss</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {canReview && (
        <section className="card p-5 space-y-3">
          <h2 className="font-semibold">Review Decision</h2>
          <textarea className="input h-20 text-sm" placeholder="Comment (optional)" value={reviewComment} onChange={e=>setReviewComment(e.target.value)} />
          <div className="flex gap-2">
            <button onClick={()=>review("approve")} className="btn-primary bg-emerald-600 hover:bg-emerald-700 text-sm">Approve</button>
            <button onClick={()=>review("request_changes")} className="btn-primary bg-amber-600 hover:bg-amber-700 text-sm">Request Changes</button>
            <button onClick={()=>review("reject")} className="btn-primary bg-red-600 hover:bg-red-700 text-sm">Reject</button>
          </div>
        </section>
      )}

      <section className="card p-5 space-y-3">
        <h2 className="font-semibold">Comments</h2>
        <div className="space-y-1">
          {item.comments?.map((c:any)=><p key={c.id} className="text-sm"><span className="font-medium text-slate-700">{c.author?.name}:</span> <span className="text-slate-600">{c.text}</span></p>)}
        </div>
        <div className="flex gap-2">
          <input className="input text-sm" value={comment} onChange={e=>setComment(e.target.value)} placeholder="Add a comment" />
          <button onClick={addComment} className="btn-primary text-sm">Post</button>
        </div>
      </section>

      {item.revisions?.length > 0 && (
        <section className="card p-5 space-y-2">
          <h2 className="font-semibold">Revision History</h2>
          {item.revisions.map((r:any)=><p key={r.id} className="text-xs text-slate-500">v{r.version} — {new Date(r.createdAt).toLocaleString()}</p>)}
        </section>
      )}
    </div>
  );
}
