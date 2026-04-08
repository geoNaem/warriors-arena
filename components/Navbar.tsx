"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Globe, Menu, X } from "lucide-react";

export default function Navbar({ lang, toggleLang }: { lang: "en" | "ar", toggleLang: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const t = {
    en: {
      home: "Home",
      laserTag: "Laser Tag",
      gelBlasters: "Gel Blasters",
      reserve: "Book Now",
    },
    ar: {
      home: "الرئيسية",
      laserTag: "ليزر تاج",
      gelBlasters: "جل بلاسترز",
      reserve: "احجز الآن",
    }
  };

  return (
    <nav 
      className={`navbar-pill flex items-center gap-8 backdrop-blur-md z-[100] ${
        scrolled ? "bg-black/60 border-white/10" : "bg-transparent border-transparent"
      }`}
    >
      <Link href="/" className="font-heading font-black text-xl tracking-tighter text-[var(--accent-primary)]">
        WARRIORS<span className="text-white">ARENA</span>
      </Link>

      <div className="hidden md:flex items-center gap-6 text-sm font-medium uppercase tracking-wider">
        <Link href="/" className="hover:text-[var(--accent-primary)] transition-colors">{t[lang].home}</Link>
        <Link href="/games/laser-tag" className="hover:text-[var(--accent-primary)] transition-colors">{t[lang].laserTag}</Link>
        <Link href="/games/gel-blasters" className="hover:text-[var(--accent-primary)] transition-colors">{t[lang].gelBlasters}</Link>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={toggleLang}
          className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 hover:border-[var(--accent-primary)] transition-colors text-xs uppercase"
        >
          <Globe size={14} className={lang === 'ar' ? 'order-2' : ''} />
          <span>{lang === 'en' ? 'AR' : 'EN'}</span>
        </button>
        <Link href="/reserve" className="hidden md:block btn-red !px-6 !py-2 text-xs">
          {t[lang].reserve}
        </Link>
        
        <button 
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 text-white hover:text-[var(--accent-primary)] transition-colors"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 bg-black/95 backdrop-blur-xl z-[90] transition-all duration-500 md:hidden ${menuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full pointer-events-none'}`}>
        <div className="flex flex-col items-center justify-center h-full gap-8 text-2xl font-heading font-black uppercase">
          <Link href="/" onClick={() => setMenuOpen(false)} className="hover:text-[var(--accent-primary)] transition-colors">{t[lang].home}</Link>
          <Link href="/games/laser-tag" onClick={() => setMenuOpen(false)} className="hover:text-[var(--accent-primary)] transition-colors">{t[lang].laserTag}</Link>
          <Link href="/games/gel-blasters" onClick={() => setMenuOpen(false)} className="hover:text-[var(--accent-primary)] transition-colors">{t[lang].gelBlasters}</Link>
          
          <button 
            onClick={() => { toggleLang(); setMenuOpen(false); }}
            className="flex items-center gap-4 px-6 py-2 rounded-full border border-white/10 text-lg"
          >
            <Globe size={20} />
            <span>{lang === 'en' ? 'ARABIC' : 'ENGLISH'}</span>
          </button>
          
          <Link href="/reserve" onClick={() => setMenuOpen(false)} className="btn-red !px-12 !py-4 text-lg">
            {t[lang].reserve}
          </Link>
        </div>
      </div>
    </nav>
  );
}
