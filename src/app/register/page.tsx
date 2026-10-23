"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [err, setErr] = useState("");
  const router = useRouter();
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password, name }) });
    if (res.ok) router.push("/dashboard");
    else setErr((await res.json()).error || "Register failed");
  }
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="card w-full max-w-md p-8 space-y-5">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold">Create account</h1>
          <p className="text-sm text-slate-500">Join your organisation's brand governance</p>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <input className="input" placeholder="Full name" value={name} onChange={e=>setName(e.target.value)} required />
          <input className="input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
          <input className="input" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required />
          {err && <p className="text-red-600 text-sm">{err}</p>}
          <button className="btn-primary w-full">Create account</button>
        </form>
        <p className="text-sm text-center text-slate-500">Have an account? <a href="/login" className="text-blue-600 font-medium">Sign in</a></p>
      </div>
    </div>
  );
}
