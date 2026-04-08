"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Check, Clipboard, Calendar as CalendarIcon, Download, Info, AlertCircle, Loader2 } from "lucide-react";

export default function ConfirmationPage({ params }: { params: { code: string } }) {
  const [res, setRes] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [lang, setLang] = useState<"en" | "ar">("en");
  const isAr = lang === "ar";

  useEffect(() => {
    fetch(`/api/reservations/${params.code}`)
      .then(r => r.json())
      .then(data => {
        if (!data.error) setRes(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.code]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(params.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadICS = () => {
    if (!res) return;
    const start = new Date(res.sessionDate);
    const [h, m] = res.sessionTime.split(':').map(Number);
    start.setHours(h, m, 0, 0);
    const end = new Date(start.getTime() + res.duration * 60000);

    const formatDate = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, "");
    
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "BEGIN:VEVENT",
      `SUMMARY:Warriors Arena — ${res.game}`,
      `DTSTART:${formatDate(start)}`,
      `DTEND:${formatDate(end)}`,
      "LOCATION:Warriors Arena, Heliopolis, Cairo",
      `DESCRIPTION:Reservation ${res.reservationCode}. Bring this code. Pay on arrival.`,
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `WarriorsArena_${res.reservationCode}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleLang = () => setLang(l => (l === "en" ? "ar" : "en"));

  if (loading) return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
      <Loader2 className="animate-spin text-[var(--accent-primary)]" size={48} />
    </div>
  );

  if (!res) return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center p-6 text-center">
      <AlertCircle size={64} className="text-red-500 mb-6" />
      <h1 className="font-heading text-2xl mb-4 italic uppercase">RESERVATION NOT FOUND</h1>
      <p className="text-white/40 mb-8 max-w-md">We couldn't locate mission records for this code. Please check your email for the correct link.</p>
      <a href="/" className="btn-green">BACK TO BASE</a>
    </div>
  );

  return (
    <div className={`min-h-screen ${isAr ? 'font-[var(--font-cairo)]' : ''}`}>
      <Navbar lang={lang} toggleLang={toggleLang} />
      
      <main className="pt-40 pb-24 px-6 max-w-2xl mx-auto flex flex-col items-center">
        {/* CHECKMARK ANIMATION */}
        <div className="w-20 h-20 rounded-full bg-[var(--accent-primary)]/10 border-2 border-[var(--accent-primary)] flex items-center justify-center mb-8 relative">
           <div className="absolute inset-0 rounded-full border-2 border-[var(--accent-primary)] animate-ping opacity-20"></div>
           <Check size={40} className="text-[var(--accent-primary)]" />
        </div>

        <h1 className="font-heading text-4xl mb-4 italic text-center">
          {isAr ? "تم الحجز بنجاح!" : "BOOKING CONFIRMED!" }
        </h1>
        <p className="text-white/40 mb-12 uppercase tracking-widest text-[10px]">{isAr ? "استعد للقتال. مهمتك جاهزة." : "Prepare for combat. Your mission is set."}</p>

        {/* CODE CARD */}
        <div className="w-full bg-[var(--bg-card)] rounded-[2rem] border border-white/5 p-8 text-center space-y-6 reveal active shadow-glow">
           <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">YOUR MISSION CODE</span>
           <div className="flex items-center justify-center gap-4">
              <span className="font-heading text-5xl md:text-6xl text-[var(--accent-primary)] truncate">{res.reservationCode}</span>
              <button 
                onClick={copyToClipboard}
                className="p-3 rounded-full bg-white/5 hover:bg-white/10 transition-all text-white/60"
              >
                {copied ? <Check size={20} className="text-[var(--accent-primary)]" /> : <Clipboard size={20} />}
              </button>
           </div>
        </div>

        {/* DETAILS CARD */}
        <div className="w-full mt-8 bg-[var(--bg-card)] rounded-[2rem] border border-white/5 overflow-hidden reveal active" style={{ transitionDelay: '0.2s' }}>
           <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-8 text-sm">
                 <div>
                    <span className="text-[10px] text-white/20 block mb-1 uppercase tracking-widest">Game</span>
                    <div className="font-heading text-[var(--accent-primary)]">{res.game}</div>
                 </div>
                 <div>
                    <span className="text-[10px] text-white/20 block mb-1 uppercase tracking-widest">Unit Size</span>
                    <div className="font-heading">{res.playerCount} Warriors</div>
                 </div>
                 <div>
                    <span className="text-[10px] text-white/20 block mb-1 uppercase tracking-widest">Date</span>
                    <div className="font-heading">{res.sessionDate.split('T')[0]}</div>
                 </div>
                 <div>
                    <span className="text-[10px] text-white/20 block mb-1 uppercase tracking-widest">Time</span>
                    <div className="font-heading">{res.sessionTime}</div>
                 </div>
              </div>
           </div>
           
           <div className="p-4 bg-amber-500/5 border-t border-amber-500/20 flex gap-4 text-[11px] text-amber-500/80">
              <Info size={16} className="shrink-0" />
              <p>{isAr ? "يرجى العلم بأن تذاكر دخول الحديقة غير مشمولة في سعر الحجز." : "Please note that park entrance tickets are not included in the booking price."}</p>
           </div>
        </div>

        {/* ACTIONS */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 reveal active" style={{ transitionDelay: '0.4s' }}>
           <button 
             onClick={downloadICS}
             className="w-full py-4 border border-white/10 rounded-full font-heading text-[10px] tracking-widest hover:bg-white/5 transition-all text-white/60 flex items-center justify-center gap-3"
           >
              <CalendarIcon size={14} />
              {isAr ? "إضافة للتقويم" : "ADD TO CALENDAR"}
           </button>
           <a 
             href={`/api/receipt/${res.reservationCode}`}
             className="w-full py-4 border border-white/10 rounded-full font-heading text-[10px] tracking-widest hover:bg-white/5 transition-all text-white/60 flex items-center justify-center gap-3"
           >
              <Download size={14} />
              {isAr ? "تحميل الإيصال" : "DOWNLOAD RECEIPT"}
           </a>
        </div>

        <Link href="/" className="mt-12 text-[10px] text-white/20 uppercase tracking-widest hover:text-[var(--accent-primary)] transition-all">
          {isAr ? "العودة للرئيسية" : "RETURN TO MISSION CONTROL"}
        </Link>
      </main>

      <Footer lang={lang} toggleLang={toggleLang} />

      <style jsx>{`
        .shadow-glow {
          box-shadow: 0 0 30px rgba(57, 255, 20, 0.05);
        }
      `}</style>
    </div>
  );
}
