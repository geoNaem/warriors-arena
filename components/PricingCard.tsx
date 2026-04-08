"use client";

import Link from "next/link";

interface PricingCardProps {
  label: string;
  duration: string;
  price: string;
  players: string;
  featured?: boolean;
  accent: string;
  lang: "en" | "ar";
}

export default function PricingCard({
  label,
  duration,
  price,
  players,
  featured,
  accent,
  lang,
  href = "/reserve"
}: PricingCardProps & { href?: string }) {
  const isAr = lang === "ar";
  
  return (
    <Link 
      href={href}
      className={`relative flex flex-col p-8 rounded-[2rem] border transition-all duration-300 min-h-[400px] cursor-pointer group hover:scale-[1.02] active:scale-[0.98] ${
        featured 
          ? "bg-black md:scale-105 z-10 border-[var(--accent-primary)] shadow-[0_0_50px_rgba(57,255,20,0.15)] order-1 md:order-none" 
          : "bg-[var(--bg-card)] border-white/5 order-2 md:order-none"
      }`}
    >
      {featured && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-[var(--accent-primary)] text-black text-[10px] font-black uppercase tracking-widest rounded-full">
          {isAr ? "أفضل قيمة" : "BEST VALUE"}
        </div>
      )}

      <div className="mb-8">
        <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider bg-white/5 border border-white/10`} style={{ color: accent, borderColor: `${accent}33` }}>
          {label}
        </span>
      </div>

      <div className="mb-2 text-2xl font-heading font-black uppercase tracking-tighter">
        {duration}
      </div>

      <div className="mb-0 text-5xl font-heading font-black" style={{ color: accent }}>
        {price}
      </div>
      <div className="text-[10px] text-[var(--text-secondary)] uppercase tracking-widest mb-8">
        {isAr ? "للشخص" : "per person"}
      </div>

      <div className="mt-6 pt-8 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm font-medium text-[var(--text-secondary)]">
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accent }} />
          {players}
        </div>
        <ArrowRight size={20} className="text-white/20 group-hover:text-white transition-colors" />
      </div>
    </Link>
  );
}

function ArrowRight({ size, className }: { size: number, className: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
    </svg>
  );
}
