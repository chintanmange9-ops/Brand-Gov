export default function Home() {
  return (
    <div className="py-20 text-center space-y-6">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">Intelligent brand governance</div>
      <h1 className="text-5xl font-bold tracking-tight text-slate-900">BrandGuard AI</h1>
      <p className="text-slate-600 max-w-2xl mx-auto text-lg">
        Review content before publication against approved guidelines, facts, terminology and assets.
        AI proposes, humans decide.
      </p>
      <div className="flex gap-3 justify-center">
        <a href="/login" className="btn-primary">Login</a>
        <a href="/register" className="btn-secondary">Register</a>
      </div>
      <p className="text-xs text-slate-400 mt-8">AI-assisted review · all findings advisory · human approval required</p>
    </div>
  );
}
