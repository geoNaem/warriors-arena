"use client";

import Link from "next/link";
import { Instagram, MapPin, Phone as WhatsappIcon } from "lucide-react";

export default function Footer({ lang, toggleLang }: { lang: "en" | "ar", toggleLang: () => void }) {
  const isAr = lang === "ar";
  
  const t = {
    tagline: { en: "Enter the Arena. Dominate the Game.", ar: "ادخل الساحة. سيطر على اللعبة." },
    links: { en: "Quick Links", ar: "روابط سريعة" },
    contact: { en: "Contact Us", ar: "اتصل بنا" },
    legal: { en: "© 2026 Warriors Arena. All rights reserved.", ar: "© 2026 Warriors Arena. جميع الحقوق محفوظة." }
  };

  return (
    <footer className="bg-[#080808] border-t border-[var(--accent-primary)]/20 pt-20 pb-10 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 mb-20 text-center md:text-left">
        {/* Col 1 */}
        <div className={isAr ? "md:text-right" : ""}>
          <Link href="/" className="font-heading font-black text-2xl tracking-tighter text-[var(--accent-primary)] mb-4 block">
            WARRIORS<span className="text-white">ARENA</span>
          </Link>
          <p className="text-[var(--text-secondary)] text-sm mb-6 max-w-xs mx-auto md:mx-0">
            {t.tagline[lang]}
            <br />
            Heliopolis, Cairo, Egypt
          </p>
          <div className="flex items-center gap-2 justify-center md:justify-start">
             <div className="w-2 h-2 rounded-full bg-[var(--accent-primary)] animate-pulse" />
             <span className="font-mono text-[10px] tracking-widest text-white/40 uppercase">System Operational</span>
          </div>
        </div>

        {/* Col 2 */}
        <div className={isAr ? "md:text-right" : ""}>
          <h4 className="font-heading font-bold text-sm uppercase tracking-widest text-white mb-6 underline decoration-[var(--accent-primary)] decoration-2 underline-offset-8">
            {t.links[lang]}
          </h4>
          <ul className="space-y-4 text-sm text-[var(--text-secondary)]">
            <li><Link href="/" className="hover:text-[var(--accent-primary)] transition-colors">Home</Link></li>
            <li><Link href="/games/laser-tag" className="hover:text-[var(--accent-primary)] transition-colors">Laser Tag</Link></li>
            <li><Link href="/games/gel-blasters" className="hover:text-[var(--accent-primary)] transition-colors">Gel Blasters</Link></li>
            <li><Link href="#" className="opacity-30 cursor-default text-[10px]">Admin</Link></li>
          </ul>
        </div>

        {/* Col 3 */}
        <div className={isAr ? "md:text-right" : ""}>
          <h4 className="font-heading font-bold text-sm uppercase tracking-widest text-white mb-6 underline decoration-[var(--accent-primary)] decoration-2 underline-offset-8">
            {t.contact[lang]}
          </h4>
          <div className="flex flex-col gap-4 text-sm items-center md:items-start">
            <a 
              href="https://wa.me/20123456789?text=I%20want%20to%20book%20a%20session" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-[var(--accent-primary)] hover:translate-x-1 transition-transform"
            >
              <WhatsappIcon size={18} />
              <span>WhatsApp Us</span>
            </a>
            <a 
              href="https://instagram.com/warriors_arenaa" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 hover:text-[var(--accent-primary)] transition-colors"
            >
              <Instagram size={18} />
              <span>@warriors_arenaa</span>
            </a>
            <a 
              href="https://maps.google.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 hover:text-[var(--accent-primary)] transition-colors"
            >
              <MapPin size={18} />
              <span>Heliopolis, Cairo</span>
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] text-white/40 uppercase tracking-widest">
        <span>{t.legal[lang]}</span>
        <button onClick={toggleLang} className="hover:text-white transition-colors">
          {lang === 'en' ? 'Switch to Arabic' : 'التحويل للإنجليزية'}
        </button>
      </div>
    </footer>
  );
}
