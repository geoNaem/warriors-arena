"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ShieldAlert, Loader2, Lock } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid credentials. Access denied.");
      } else {
        router.push("/admin");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-[var(--bg-card)] rounded-[2rem] border border-white/5 p-12 shadow-glow">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[var(--accent-primary)]/10 flex items-center justify-center mb-6 border border-[var(--accent-primary)]/20">
            <Lock className="text-[var(--accent-primary)]" size={32} />
          </div>
          <h1 className="font-heading text-2xl italic flex items-center gap-2">
            WARRIORS <span className="text-[var(--accent-primary)]">ARENA</span>
          </h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/20 mt-2 font-heading">Command Center Login</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-white/40 ml-4">Authorized Email</label>
            <input 
              type="email"
              required
              className="w-full bg-black/50 border border-white/10 rounded-full px-6 py-4 focus:border-[var(--accent-primary)] outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-white/40 ml-4">Access Code</label>
            <input 
              type="password"
              required
              className="w-full bg-black/50 border border-white/10 rounded-full px-6 py-4 focus:border-[var(--accent-primary)] outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center gap-3">
              <ShieldAlert size={16} />
              {error}
            </div>
          )}

          <button 
            disabled={loading}
            className="btn-green w-full !py-4 flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "AUTHORIZE ACCESS"}
          </button>
        </form>
      </div>
      
      <style jsx>{`
        .shadow-glow { box-shadow: 0 0 50px rgba(57, 255, 20, 0.05); }
      `}</style>
    </div>
  );
}
