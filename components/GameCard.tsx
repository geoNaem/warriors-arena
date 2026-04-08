import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface GameCardProps {
  label: string;
  title: { en: string; ar: string };
  description: { en: string; ar: string };
  sessions?: string[];
  maxPlayers?: string;
  accent: string;
  href?: string;
  lang: "en" | "ar";
}

export default function GameCard({
  label,
  title,
  description,
  sessions,
  maxPlayers,
  accent,
  href,
  lang
}: GameCardProps) {
  const isAr = lang === "ar";
  
  const content = (
    <div className="game-card group flex flex-col h-full bg-[var(--bg-card)] rounded-[2rem] border border-white/5 overflow-hidden transition-all hover:border-white/20">
      <div className="relative aspect-video bg-gradient-to-br from-black to-[#222] overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center opacity-20 transform group-hover:scale-110 transition-transform duration-700">
           <div className="w-24 h-24 border-2 rounded-full flex items-center justify-center" style={{ borderColor: accent }}>
             <div className="w-12 h-12 rounded-full animate-pulse" style={{ backgroundColor: accent }} />
           </div>
        </div>
        <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-black/80 backdrop-blur-md rounded-full border border-white/10">
          <span className="font-mono text-[10px] tracking-widest text-white/60">{label}</span>
        </div>
      </div>

      <div className="p-8 flex flex-col flex-grow">
        <h3 className="text-3xl font-black mb-4 uppercase tracking-tighter" style={{ color: accent }}>
          {isAr ? title.ar : title.en}
        </h3>
        
        <p className="text-[var(--text-secondary)] mb-6 text-sm leading-relaxed flex-grow">
          {isAr ? description.ar : description.en}
        </p>

        {(sessions || maxPlayers) && (
          <div className="flex flex-wrap gap-2 mb-8">
            {sessions?.map((s, i) => (
              <span 
                key={i} 
                className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider 
                           ${i === 0 ? 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20' : 
                                      'bg-[var(--accent-secondary)]/10 text-[var(--accent-secondary)] border border-[var(--accent-secondary)]/20'}`}
              >
                {s}
              </span>
            ))}
            {maxPlayers && (
              <span className="text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider bg-white/5 border border-white/10 text-white/40">
                {maxPlayers}
              </span>
            )}
          </div>
        )}

        {href && (
          <div 
            className="inline-flex items-center gap-2 font-bold uppercase tracking-widest text-[10px] group-hover:translate-x-2 transition-transform duration-300"
            style={{ color: accent }}
          >
            {isAr ? "استكشف" : "EXPLORE"} <ArrowRight size={14} className={isAr ? "rotate-180" : ""} />
          </div>
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
