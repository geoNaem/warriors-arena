"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import HeroCanvas from "@/components/HeroCanvas";
import GameCard from "@/components/GameCard";
import PricingCard from "@/components/PricingCard";
import Footer from "@/components/Footer";
import { ChevronDown } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [lang, setLang] = useState<"en" | "ar">("en");

  const toggleLang = () => {
    const nextLang = lang === "en" ? "ar" : "en";
    setLang(nextLang);
    document.documentElement.lang = nextLang;
    document.documentElement.dir = nextLang === "ar" ? "rtl" : "ltr";
  };

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px"
    });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [lang]); // Re-observe if language changes and elements re-render

  const t = {
    hero: {
      label: { en: "HELIOPOLIS · CAIRO · OPENS 6PM DAILY", ar: "هيليوبوليس · القاهرة · يفتح 6 مساءً يومياً" },
      title1: { en: "WARRIORS", ar: "المحاربين" },
      title2: { en: "ARENA", ar: "الساحة" },
      subtext: { en: "Laser Tag · Gel Blasters · Real Combat. Real Fun.", ar: "ليزر تاج · جل بلاسترز · قتال حقيقي. متعة حقيقية." },
      cta: { en: "BOOK YOUR SLOT", ar: "احجز وقتك الآن" },
      secondary: { en: "Watch how it works ↓", ar: "شاهد كيف يعمل ↓" }
    },
    games: {
      label: { en: "AVAILABLE GAMES", ar: "الألعاب المتاحة" }
    }
  };
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "AmusementPark",
    "name": "Warriors Arena",
    "description": "Laser Tag and Gel Blasters gaming playground in Heliopolis, Cairo",
    "address": { 
      "@type": "PostalAddress", 
      "addressLocality": "Heliopolis", 
      "addressRegion": "Cairo", 
      "addressCountry": "EG" 
    },
    "openingHours": "Mo-Su 18:00-21:00",
    "priceRange": "100-300 EGP",
    "image": "https://warriors-arena.com/og-image.jpg"
  };

  const isAr = lang === "ar";

  return (
    <div className={`min-h-screen ${isAr ? 'font-[var(--font-cairo)]' : ''}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Navbar lang={lang} toggleLang={toggleLang} />
      
      {/* SECTION 1 — HERO */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <HeroCanvas />
        
        <div className="relative z-10 w-full max-w-7xl px-6 pt-20 text-center">
          <span className="block font-heading text-[10px] md:text-xs tracking-[0.3em] text-[var(--accent-primary)] mb-6 animate-pulse">
            {t.hero.label[lang]}
          </span>
          
          <h1 className="font-heading font-[900] text-7xl md:text-[120px] leading-[0.85] uppercase tracking-tighter mb-4">
            <span className="text-white block">{t.hero.title1[lang]}</span>
            <span className="text-[var(--accent-primary)] block drop-shadow-[0_0_15px_rgba(57,255,20,0.3)]">
              {t.hero.title2[lang]}
            </span>
          </h1>

          <p className="max-w-xl mx-auto text-[var(--text-secondary)] text-sm md:text-lg mb-10 leading-relaxed font-medium">
            {t.hero.subtext[lang]}
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <button className="btn-red w-full md:w-auto text-sm">
              {t.hero.cta[lang]}
            </button>
            <a href="#games" className="text-xs uppercase tracking-widest font-bold border-b border-white/20 pb-1 hover:border-[var(--accent-primary)] transition-colors">
              {t.hero.secondary[lang]}
            </a>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce opacity-40">
           <ChevronDown size={32} strokeWidth={1} />
        </div>
      </section>

      {/* SECTION 2 — GAMES */}
      <section id="games" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="mb-16 reveal">
          <span className="section-label">{t.games.label[lang]}</span>
          <h2 className="text-4xl md:text-5xl font-heading font-black uppercase text-white">
            {isAr ? "اختر سلاحك" : "CHOOSE YOUR WEAPON"}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <GameCard 
            label="GAME 01"
            accent="#39FF14"
            href="/games/laser-tag"
            lang={lang}
            title={{ en: "LASER TAG", ar: "ليزر تاج" }}
            description={{ 
              en: "High-intensity infrared combat. Tag your enemies before they tag you. Choose your session and dominate the arena.",
              ar: "قتال بالأشعة تحت الحمراء عالي الكثافة. العب ضد خصومك قبل أن يلعبوا ضدك."
            }}
            sessions={["30 MIN", "60 MIN"]}
            maxPlayers="UP TO 6 PLAYERS"
          />

          <GameCard 
            label="GAME 02"
            accent="#FF6B00"
            href="/games/gel-blasters"
            lang={lang}
            title={{ en: "GEL BLASTERS", ar: "جل بلاسترز" }}
            description={{ 
              en: "Load up. Lock in. Fire gel pellets in fast-paced team battles across our dedicated combat zone.",
              ar: "جهز سلاحك. استهدف خصمك. أطلق كرات الجل في معارك سريعة."
            }}
            sessions={["30 MIN ONLY"]}
            maxPlayers="UP TO 6 PLAYERS"
          />
        </div>
      </section>

      {/* SECTION 3 — PRICING */}
      <section className="py-24 px-6 bg-[var(--bg-secondary)]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 reveal">
            <span className="section-label mx-auto">{isAr ? "الأسعار" : "PRICING"}</span>
            <h2 className="text-4xl md:text-5xl font-heading font-black uppercase text-white mb-4">
              {isAr ? "بسيط. واضح. بدون مفاجآت." : "Simple. Clear. No Surprises."}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 mb-16">
            <PricingCard 
              label="LASER TAG"
              duration={isAr ? "30 دقيقة" : "30 MINUTES"}
              price="150 EGP"
              players={isAr ? "1–6 لاعبين" : "1–6 players"}
              accent="var(--accent-primary)"
              lang={lang}
            />
            <PricingCard 
              label="LASER TAG"
              duration={isAr ? "60 دقيقة" : "60 MINUTES"}
              price="300 EGP"
              players={isAr ? "1–6 لاعبين" : "1–6 players"}
              accent="var(--accent-primary)"
              featured={true}
              lang={lang}
            />
            <PricingCard 
              label="GEL BLASTERS"
              duration={isAr ? "30 دقيقة" : "30 MINUTES"}
              price="100 EGP"
              players={isAr ? "1–6 لاعبين" : "1–6 players"}
              accent="var(--accent-secondary)"
              lang={lang}
            />
          </div>

          <div className="max-w-3xl mx-auto p-6 bg-black rounded-2xl border-l-4 border-amber-500 flex items-start gap-4 reveal">
            <span className="text-2xl mt-1">⚠</span>
            <p className="text-sm md:text-base text-amber-500 font-medium">
              {isAr 
                ? "رسوم الحجز لا تشمل تذاكر دخول المنتزه. الدخول بـ 30 جنيه للشخص في الأيام العادية و50 جنيه في الإجازات والمهرجانات."
                : "Reservation fees do not include park entrance tickets. Entrance is 30 EGP per person on regular days and 50 EGP per person on holidays and festivals."
              }
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 4 — BOOK NOW CTA */}
      <section className="relative py-32 px-6 overflow-hidden">
        {/* CSS Grid Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ backgroundImage: `linear-gradient(var(--accent-primary) 0.5px, transparent 0.5px), linear-gradient(90deg, var(--accent-primary) 0.5px, transparent 0.5px)`, backgroundSize: '40px 40px' }} />
        
        <div className="relative z-10 max-w-4xl mx-auto text-center reveal">
          <h2 className="text-5xl md:text-7xl font-heading font-black uppercase text-white mb-8 tracking-tighter">
            {isAr ? "مستعد تدخل الساحة؟" : "Ready to Enter the Arena?"}
          </h2>
          <p className="text-[var(--text-secondary)] text-lg mb-12 max-w-2xl mx-auto">
            {isAr 
              ? "الأماكن محدودة. 6 لاعبين كحد أقصى للجلسة. يمكن الإلغاء حتى 6 ساعات قبل موعدك."
              : "Slots are limited. 6 players max per session. Cancel up to 6 hours before your slot."
            }
          </p>
          <div className="flex flex-col items-center gap-8">
            <button className="btn-red !px-12 !py-5 text-lg">
              {isAr ? "احجز الآن" : "BOOK YOUR SLOT NOW"}
            </button>
            <div className="px-6 py-2 bg-white/5 border border-white/10 rounded-full font-mono text-[10px] tracking-widest text-white/60 uppercase">
              OPEN DAILY · 6PM – 9PM · HELIOPOLIS, CAIRO
            </div>
          </div>
        </div>
      </section>

      <Footer lang={lang} toggleLang={toggleLang} />

      {/* MOBILE STICKY CTA */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-black/80 backdrop-blur-xl border-t border-white/10 md:hidden z-50">
        <Link href="/reserve" className="btn-red w-full !py-4 block text-center">
          {isAr ? "احجز الآن" : "BOOK YOUR SLOT NOW"}
        </Link>
      </div>
    </div>
  );
}
