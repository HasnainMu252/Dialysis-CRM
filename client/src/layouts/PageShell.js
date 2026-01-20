import Navbar from "../components/ui/Navbar";

export default function PageShell({ children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />   {/* ✅ NAVBAR HERE */}
      <main className="mx-auto max-w-7xl p-4">
        {children}
      </main>
    </div>
  );
}
