"use client";

import { useState, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { ScanLine, Search, UserCheck, Calendar, Clock, Target, AlertCircle, Loader2, Users } from "lucide-react";

export default function AdminCheckIn() {
  const [code, setCode] = useState("");
  const [res, setRes] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    if (!scanning) return;

    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    scanner.render(
      (decodedText) => {
        handleSearch(decodedText);
        scanner.clear();
        setScanning(false);
      },
      (err) => {}
    );

    return () => {
      scanner.clear().catch(e => console.error("Scanner clear fail", e));
    };
  }, [scanning]);

  const handleSearch = async (lookupCode: string) => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(`/api/reservations/${lookupCode}`);
      const data = await resp.json();
      if (!resp.ok) throw new Error("Reservation not found");
      setRes(data);
    } catch (e: any) {
      setError(e.message);
      setRes(null);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCheckIn = async () => {
    setLoading(true);
    try {
      // API call to update status to COMPLETED and mark checkedInAt
      // (Mocked for now)
      setRes({ ...res, status: "COMPLETED" });
      setScanning(true); // Restart scanning
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-12 pb-12">
      <header>
        <h1 className="font-heading text-4xl italic uppercase">Gate Entry Check-In</h1>
        <p className="text-white/40 text-sm mt-1 uppercase tracking-widest">Scan PDF receipt or enter code manually</p>
      </header>

      {/* SCANNER SECTION */}
      <div className="bg-[var(--bg-card)] rounded-[2rem] border border-white/5 p-8 space-y-8">
        {scanning ? (
           <div id="reader" className="overflow-hidden rounded-2xl border border-white/10" />
        ) : (
           <button 
            onClick={() => { setScanning(true); setRes(null); }}
            className="w-full py-12 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center gap-4 hover:border-[var(--accent-primary)]/50 transition-all text-white/20"
           >
             <ScanLine size={48} />
             <span className="text-[10px] uppercase tracking-widest">TAP TO RESTART SCANNER</span>
           </button>
        )}

        <div className="flex gap-4">
           <input 
            type="text"
            placeholder="Manual Mission Code"
            className="flex-grow bg-black/50 border border-white/10 rounded-full px-6 py-4 outline-none focus:border-[var(--accent-primary)] font-heading text-xs tracking-widest text-[var(--accent-primary)]"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
           />
           <button 
             onClick={() => handleSearch(code)}
             disabled={loading}
             className="bg-white/5 hover:bg-white/10 w-16 h-14 rounded-full flex items-center justify-center transition-all disabled:opacity-30"
           >
             {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
           </button>
        </div>
      </div>

      {/* RESULT SECTION */}
      {res && (
        <div className="bg-[var(--bg-card)] rounded-[2rem] border-2 border-[var(--accent-primary)]/20 p-8 space-y-8 reveal active shadow-glow">
           <div className="flex justify-between items-start">
              <div>
                 <span className="text-[10px] uppercase tracking-widest text-white/40">Warrior Info</span>
                 <h2 className="text-2xl font-heading text-[var(--accent-primary)]">{res.clientName}</h2>
              </div>
              <div className={`text-[10px] uppercase font-bold px-3 py-1 rounded-full ${res.status === 'COMPLETED' ? 'bg-white/10 text-white/40' : 'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)]'}`}>
                 {res.status}
              </div>
           </div>

           <div className="grid grid-cols-2 gap-8 text-xs">
              <div className="flex items-center gap-3">
                 <Target className="text-white/20" size={16} />
                 <span>{res.game}</span>
              </div>
              <div className="flex items-center gap-3">
                 <Users className="text-white/20" size={16} />
                 <span>{res.playerCount} Players</span>
              </div>
              <div className="flex items-center gap-3">
                 <Calendar className="text-white/20" size={16} />
                 <span>{String(res.sessionDate).split('T')[0]}</span>
              </div>
              <div className="flex items-center gap-3">
                 <Clock className="text-white/20" size={16} />
                 <span>{res.sessionTime}</span>
              </div>
           </div>

           {res.status !== 'COMPLETED' && (
             <button 
              onClick={handleConfirmCheckIn}
              disabled={loading}
              className="btn-green w-full !py-4 flex items-center justify-center gap-3"
             >
                <UserCheck size={20} />
                CONFIRM DEPLOYMENT
             </button>
           )}
        </div>
      )}

      {error && (
        <div className="p-8 rounded-[2rem] bg-red-500/5 border border-red-500/20 text-red-500 flex flex-col items-center gap-4 text-center">
           <AlertCircle size={32} />
           <p className="font-heading text-sm uppercase">{error}</p>
        </div>
      )}

      <style jsx>{`
        .shadow-glow { box-shadow: 0 0 40px rgba(57, 255, 20, 0.1); }
      `}</style>
    </div>
  );
}
