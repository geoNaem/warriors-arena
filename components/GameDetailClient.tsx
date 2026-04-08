"use client";

import { useEffect, useState } from "react";
import { gamesData } from "@/app/games/data";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PricingCard from "@/components/PricingCard";
import { CheckCircle2, Shield, Info } from "lucide-react";
import Link from "next/link";

export default function GameDetailClient({ slug }: { slug: string }) {
  const [lang, setLang] = useState<"en" | "ar">("en");
  const game = gamesData[slug as keyof typeof gamesData];

  const toggleLang = () => {
    const nextLang = lang === "en" ? "ar" : "en";
    setLang(nextLang);
    document.documentElement.lang = nextLang;
    document.documentElement.dir = nextLang === "ar" ? "rtl" : "ltr";
  };

  const isAr = lang === "ar";

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [lang]);

  if (!game) return <div>Game not found</div>;

  return (
    <div className={`min-h-screen ${isAr ? 'font-[var(--font-cairo)]' : ''}`}>
      <Navbar lang={lang} toggleLang={toggleLang} />

      {/* SECTION 1 — GAME HERO */}
      <section className="relative h-[60vh] flex flex-col justify-end px-6 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-[1]" />
        
        <div className="absolute inset-0 bg-neutral-900 group aspect-video">
           <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--accent-primary)_0%,_transparent_70%)]" style={{"--accent-primary": game.accent} as React.CSSProperties} />
        </div>

        <div className="relative z-[2] max-w-7xl mx-auto w-full">
           <nav className="flex gap-2 text-[10px] uppercase tracking-widest text-white/40 mb-4" aria-label="breadcrumb">
             <Link href="/" className="hover:text-white transition-colors">Home</Link>
             <span>/</span>
             <Link href="#games" className="hover:text-white transition-colors">Games</Link>
             <span>/</span>
             <span className="text-[var(--accent-primary)]" style={{ color: game.accent }}>{isAr ? game.title.ar : game.title.en}</span>
           </nav>

           <div className="flex items-center gap-4 mb-2">
              <span className="font-mono text-sm tracking-widest text-white/40">GAME {game.id}</span>
              <div className="h-[1px] w-12" style={{ backgroundColor: game.accent }} />
           </div>

           <h1 className="text-4xl md:text-7xl font-heading font-black uppercase mb-4 tracking-tighter" style={{ color: game.accent }}>
             {isAr ? game.title.ar : game.title.en}
           </h1>
           <p className="text-lg md:text-xl text-white/80 font-medium">
             {isAr ? game.tagline.ar : game.tagline.en}
           </p>
        </div>
      </section>

      {/* SECTION 2 — GAME INFO */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-16 items-start">
          <div className="space-y-20">
            <div className="reveal">
              <h2 className="section-label">{isAr ? "عن اللعبة" : "ABOUT THE GAME"}</h2>
              <p className="text-xl leading-relaxed text-[var(--text-secondary)]">
                {isAr ? game.description.ar : game.description.en}
              </p>
            </div>

            <div className="reveal">
              <h2 className="section-label">{isAr ? "كيف تعمل" : "HOW IT WORKS"}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                {game.howItWorks.map((step, i) => (
                  <div key={i} className="flex gap-6 p-6 rounded-2xl bg-white/5 border border-white/5">
                    <span className="stat-number opacity-20 !text-3xl">{i + 1}</span>
                    <p className="font-heading font-bold uppercase tracking-tight text-white/80 self-center">
                      {isAr ? step.ar : step.en}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="reveal">
              <h2 className="section-label">{isAr ? "القواعد" : "RULES"}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                {game.rules.map((rule, i) => (
                  <div key={i} className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
                    <Shield size={18} className="text-[var(--accent-primary)] shrink-0" style={{ color: game.accent }} />
                    <span>{isAr ? rule.ar : rule.en}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:sticky lg:top-32 p-8 rounded-[2rem] bg-[var(--bg-card)] border border-white/5 reveal">
            <h3 className="font-heading font-bold text-sm uppercase tracking-widest text-white mb-8 border-b border-white/5 pb-4">
              {isAr ? "احجز الآن" : "START YOUR MISSION"}
            </h3>

            <div className="space-y-6 mb-10">
               {game.sessions.map((session, i) => (
                 <label key={i} className="flex items-center justify-between p-4 rounded-xl border border-white/10 cursor-pointer hover:border-[var(--accent-primary)] transition-all group" style={{ "--accent-hover": game.accent } as React.CSSProperties}>
                   <div className="flex items-center gap-3">
                     <div className="w-5 h-5 rounded-full border-2 border-white/20 flex items-center justify-center p-1 group-hover:border-[var(--accent-primary)]">
                       {i === 0 && <div className="w-full h-full rounded-full" style={{ backgroundColor: game.accent }} />}
                     </div>
                     <span className="font-heading text-sm uppercase tracking-tighter">{session.name}</span>
                   </div>
                   <span className="font-heading font-bold" style={{ color: game.accent }}>{session.price}</span>
                   <input type="radio" name="session" defaultChecked={i === 0} className="hidden" />
                 </label>
               ))}
            </div>

            <div className="space-y-4 mb-8 text-[11px] uppercase tracking-[0.2em] font-bold text-white/40">
               <div className="flex items-center gap-3">
                 <CheckCircle2 size={14} style={{ color: game.accent }} />
                 1–6 players per session
               </div>
               <div className="flex items-center gap-3">
                 <CheckCircle2 size={14} style={{ color: game.accent }} />
                 Open daily 6PM–9PM
               </div>
               <div className="flex items-start gap-3 text-amber-500/80">
                 <Info size={14} className="shrink-0" />
                 {isAr ? "إلغاء مجاني حتى 6 ساعات قبل موعدك" : "Free cancellation up to 6 hours before your slot"}
               </div>
            </div>

            <button className="btn-red w-full !py-4">
              {isAr ? "احجز هذه اللعبة" : "BOOK THIS GAME"}
            </button>
          </div>
        </div>
      </section>

      {/* PRICING SUMMARY */}
      <section className="py-24 px-6 bg-[var(--bg-secondary)] border-y border-white/5">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-grow">
               <PricingCard 
                 label={isAr ? game.title.ar : game.title.en}
                 duration={game.sessions[0].name}
                 price={game.sessions[0].price}
                 players={isAr ? "1–6 لاعبين" : "1–6 players"}
                 accent={game.accent}
                 lang={lang}
               />
            </div>
            <div className="max-w-md p-8 rounded-2xl bg-black border-l-4 border-amber-500 min-h-[120px]">
               <p className="text-sm text-amber-500 font-medium leading-relaxed">
                  {isAr 
                    ? "⚠ رسوم الحجز لا تشمل تذاكر دخول المنتزه. الدخول بـ 30 جنيه للشخص في الأيام العادية و50 جنيه في الإجازات والمهرجانات."
                    : "⚠ Reservation fees do not include park entrance tickets. Entrance is 30 EGP per person on regular days and 50 EGP per person on holidays and festivals."
                  }
               </p>
            </div>
         </div>
      </section>

      <Footer lang={lang} toggleLang={toggleLang} />

      {/* MOBILE STICKY CTA */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-black/80 backdrop-blur-xl border-t border-white/10 md:hidden z-50">
        <Link href="/reserve" className="btn-red w-full !py-4 block text-center min-h-[44px]">
          {isAr ? "احجز هذه اللعبة" : "BOOK THIS GAME NOW"}
        </Link>
      </div>
    </div>
  );
}
