"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewContent() {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("text");
  const [body, setBody] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData();
    form.append("title", title);
    form.append("type", type);
    form.append("body", body);
    if (file) form.append("file", file);
    const res = await fetch("/api/content", { method: "POST", body: form });
    const data = await res.json();
    setLoading(false);
    if (res.ok) router.push(`/content/${data.item.id}`);
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight mb-1">New Content</h1>
      <p className="text-slate-500 text-sm mb-6">Create a draft to review against your brand kit.</p>
      <form onSubmit={submit} className="card p-6 space-y-4">
        <input className="input" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} required />
        <select className="input" value={type} onChange={e=>setType(e.target.value)}>
          <option value="text">Text</option>
          <option value="document">Document (PDF/DOCX)</option>
          <option value="image">Image</option>
        </select>
        <textarea className="input h-48" placeholder="Paste text content (or upload a file below)" value={body} onChange={e=>setBody(e.target.value)} />
        <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center">
          <input type="file" onChange={e=>setFile(e.target.files?.[0] || null)} className="text-sm" />
          <p className="text-xs text-slate-400 mt-1">Optional: attach a PDF, DOCX or image</p>
        </div>
        <button disabled={loading} className="btn-primary">
          {loading ? "Creating..." : "Create Draft"}
        </button>
      </form>
    </div>
  );
}
