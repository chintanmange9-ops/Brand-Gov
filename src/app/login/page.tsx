"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const router = useRouter();
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    if (res.ok) router.push("/dashboard");
    else setErr((await res.json()).error || "Login failed");
  }
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="card w-full max-w-md p-8 space-y-5">
        <div className="text-center space-y-1">
          <div className="inline-block w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center mx-auto">B</div>
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-sm text-slate-500">Sign in to your BrandGuard account</p>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <input className="input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="input" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
          {err && <p className="text-red-600 text-sm">{err}</p>}
          <button className="btn-primary w-full">Sign in</button>
        </form>
        <p className="text-sm text-center text-slate-500">No account? <a href="/register" className="text-blue-600 font-medium">Create one</a></p>
      </div>
    </div>
  );
}
