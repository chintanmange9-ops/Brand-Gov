import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BrandGuard AI",
  description: "Intelligent brand-governance platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-6 h-14 flex items-center gap-6">
            <a href="/" className="flex items-center gap-2 font-semibold text-slate-900">
              <span className="inline-block w-7 h-7 rounded-lg bg-blue-600 text-white text-sm font-bold flex items-center justify-center">B</span>
              BrandGuard AI
            </a>
            <nav className="flex items-center gap-1 text-sm">
              {[
                ["/dashboard", "Dashboard"],
                ["/brand-kit", "Brand Kit"],
                ["/content/new", "New Content"],
                ["/review", "Review Queue"],
                ["/insights", "Insights"],
              ].map(([href, label]) => (
                <a key={href} href={href} className="px-3 py-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition">{label}</a>
              ))}
            </nav>
            <span className="ml-auto text-xs text-slate-400 hidden md:block">AI-assisted · human approval required</span>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
