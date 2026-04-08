"use client";

import { useReducer, useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GameCard from "@/components/GameCard";
import { ChevronRight, ChevronLeft, Calendar as CalendarIcon, Users, Clock, Info, ShieldCheck, Gamepad2, AlertCircle, Loader2 } from "lucide-react";

// --- TYPES ---
type Step = 1 | 2 | 3 | 4 | 5 | 6;
type GameKey = "laser-tag" | "gel-blasters";

interface WizardState {
  step: Step;
  game: GameKey | null;
  duration: 30 | 60;
  date: string | null;
  time: string | null;
  playerCount: number;
  contact: {
    name: string;
    phone: string;
    email: string;
  };
  policyAccepted: boolean;
  sessionId: string;
}

type Action =
  | { type: "SET_STEP"; payload: Step }
  | { type: "SET_GAME"; payload: { game: GameKey, duration: 30 | 60 } }
  | { type: "SET_DATE_TIME"; payload: { date: string, time: string | null } }
  | { type: "SET_PLAYERS"; payload: number }
  | { type: "SET_CONTACT"; payload: { name: string, phone: string, email: string } }
  | { type: "SET_POLICY"; payload: boolean }
  | { type: "RESET" };

// --- REDUCER ---
const initialState: WizardState = {
  step: 1,
  game: null,
  duration: 30,
  date: null,
  time: null,
  playerCount: 1,
  contact: { name: "", phone: "", email: "" },
  policyAccepted: false,
  sessionId: typeof window !== "undefined" ? Math.random().toString(36).substring(7) : ""
};

function reducer(state: WizardState, action: Action): WizardState {
  switch (action.type) {
    case "SET_STEP": return { ...state, step: action.payload };
    case "SET_GAME": return { ...state, game: action.payload.game, duration: action.payload.duration };
    case "SET_DATE_TIME": return { ...state, date: action.payload.date, time: action.payload.time };
    case "SET_PLAYERS": return { ...state, playerCount: action.payload };
    case "SET_CONTACT": return { ...state, contact: action.payload };
    case "SET_POLICY": return { ...state, policyAccepted: action.payload };
    case "RESET": return initialState;
    default: return state;
  }
}

// --- CONSTANTS ---
const PRICES = {
  "laser-tag": { 30: 150, 60: 300 },
  "gel-blasters": { 30: 100, 60: 0 }
};

export default function ReservePage() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [lang, setLang] = useState<"en" | "ar">("en");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slots, setSlots] = useState<any[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAr = lang === "ar";

  // --- PERSISTENCE ---
  useEffect(() => {
    const saved = sessionStorage.getItem("wa_wizard");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.game) dispatch({ type: "SET_GAME", payload: { game: parsed.game, duration: parsed.duration } });
      if (parsed.date) dispatch({ type: "SET_DATE_TIME", payload: { date: parsed.date, time: parsed.time } });
      if (parsed.playerCount) dispatch({ type: "SET_PLAYERS", payload: parsed.playerCount });
    }
  }, []);

  useEffect(() => {
    const { contact, ...safeData } = state;
    sessionStorage.setItem("wa_wizard", JSON.stringify(safeData));
  }, [state]);

  // --- INITIAL PARAMS ---
  useEffect(() => {
    const gameParam = searchParams.get("game") as GameKey;
    const durationParam = parseInt(searchParams.get("duration") || "30") as 30 | 60;
    if (gameParam && (gameParam === "laser-tag" || gameParam === "gel-blasters")) {
      dispatch({ type: "SET_GAME", payload: { game: gameParam, duration: durationParam } });
    }
  }, [searchParams]);

  // --- API CALLS ---
  const fetchSlots = async (dateStr: string) => {
    if (!state.game) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/slots?game=${state.game.replace('-','_').toUpperCase()}&date=${dateStr}&duration=${state.duration}`);
      const data = await res.json();
      setSlots(data);
    } catch {
      setError("Failed to load slots");
    } finally {
      setIsLoading(false);
    }
  };

  const finalizeBooking = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. LOCK
      const lockRes = await fetch("/api/reservations/lock", {
        method: "POST",
        body: JSON.stringify({
          game: state.game?.replace('-','_').toUpperCase(),
          date: state.date,
          time: state.time,
          duration: state.duration,
          playerCount: state.playerCount,
          sessionId: state.sessionId
        })
      });
      const lockData = await lockRes.json();
      if (!lockRes.ok) throw new Error(lockData.error || "lock_failed");

      // 2. RESERVE
      const res = await fetch("/api/reservations", {
        method: "POST",
        body: JSON.stringify({
          lockId: lockData.lockId,
          clientName: state.contact.name,
          clientPhone: state.contact.phone,
          clientEmail: state.contact.email,
          policyAccepted: true,
          sessionId: state.sessionId,
          captchaToken: "hc_placeholder" // TODO: Integration with real hCaptcha
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "reservation_failed");

      sessionStorage.removeItem("wa_wizard");
      router.push(`/reservations/${data.reservationCode}`);
    } catch (e: any) {
      setError(e.message);
      setIsLoading(false);
    }
  };

  const toggleLang = () => {
    const next = lang === "en" ? "ar" : "en";
    setLang(next);
    document.documentElement.lang = next;
    document.documentElement.dir = next === "ar" ? "rtl" : "ltr";
  };

  // --- CALCULATIONS ---
  const totalPrice = state.game ? PRICES[state.game][state.duration] * state.playerCount : 0;

  // --- RENDER HELPERS ---
  const renderStepHeader = () => {
    const labels = [
      { en: "Select Game", ar: "اختر اللعبة" },
      { en: "Date & Time", ar: "التاريخ والوقت" },
      { en: "Players", ar: "عدد اللاعبين" },
      { en: "Contact", ar: "تفاصيل الاتصال" },
      { en: "Review", ar: "مراجعة وحجز" },
      { en: "Processing", ar: "جاري المعالجة" }
    ];
    return (
      <div className="mb-12">
        <div className="flex justify-between items-center mb-2">
          <span className="font-heading text-[10px] tracking-[0.2em] text-[var(--accent-primary)] uppercase">
            {isAr ? `خطوة ${state.step} من 6` : `Step ${state.step} of 6`}
          </span>
          <span className="font-heading text-[10px] tracking-[0.2em] text-white/40 uppercase">
             {labels[state.step - 1][lang]}
          </span>
        </div>
        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[var(--accent-primary)] transition-all duration-500 shadow-[0_0_10px_var(--accent-primary)]" 
            style={{ width: `${(state.step / 6) * 100}%` }}
          />
        </div>
      </div>
    );
  };

  const renderNavButtons = (isValid: boolean = true) => (
    <div className="flex gap-4 mt-12">
      {state.step > 1 && state.step < 6 && (
        <button 
          onClick={() => dispatch({ type: "SET_STEP", payload: (state.step - 1) as Step })}
          className="flex-1 py-4 border border-white/10 rounded-full font-heading text-xs tracking-widest hover:bg-white/5 transition-all flex items-center justify-center gap-2"
        >
           <ChevronLeft size={16} className={isAr ? "rotate-180" : ""} />
           {isAr ? "رجوع" : "BACK"}
        </button>
      )}
      {state.step < 5 ? (
        <button 
          disabled={!isValid || isLoading}
          onClick={() => dispatch({ type: "SET_STEP", payload: (state.step + 1) as Step })}
          className="btn-green flex-1 !py-4 flex items-center justify-center gap-2 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed"
        >
           {isAr ? "متابعة" : "CONTINUE"}
           <ChevronRight size={16} className={isAr ? "rotate-180" : ""} />
        </button>
      ) : state.step === 5 ? (
        <button 
          disabled={!state.policyAccepted || isLoading}
          onClick={finalizeBooking}
          className="btn-red flex-1 !py-4 flex items-center justify-center gap-2 disabled:opacity-30"
        >
           {isLoading ? <Loader2 className="animate-spin" /> : (isAr ? "تأكيد الحجز" : "CONFIRM RESERVATION")}
        </button>
      ) : null}
    </div>
  );

  return (
    <div className={`min-h-screen ${isAr ? 'font-[var(--font-cairo)]' : ''}`}>
      <Navbar lang={lang} toggleLang={toggleLang} />
      
      <main className="pt-32 pb-24 px-6 max-w-4xl mx-auto">
        {renderStepHeader()}

        {/* ERROR BOX */}
        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4 text-red-500 text-sm">
            <AlertCircle size={20} />
            <p>{error === "slot_full" ? (isAr ? "هذا الموعد محجوز بالكامل. يرجى اختيار موعد آخر." : "Slot full. Please pick another time.") : error}</p>
          </div>
        )}

        {/* STEP 1: GAME */}
        {state.step === 1 && (
          <div className="space-y-12 reveal active">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div 
                className={`cursor-pointer transition-all ${state.game === 'laser-tag' ? 'ring-2 ring-[var(--accent-primary)]' : ''}`}
                onClick={() => dispatch({ type: "SET_GAME", payload: { game: 'laser-tag', duration: state.duration } })}
              >
                <GameCard 
                  title={{ en: "Laser Tag", ar: "ليزر تاج" }}
                  desc={{ en: "Infrared combat experience", ar: "تجربة قتال بالأشعة" }}
                  accent="#39FF14"
                  id="01"
                  lang={lang}
                />
              </div>
              <div 
                className={`cursor-pointer transition-all ${state.game === 'gel-blasters' ? 'ring-2 ring-[var(--accent-secondary)]' : ''}`}
                onClick={() => dispatch({ type: "SET_GAME", payload: { game: 'gel-blasters', duration: 30 } })}
              >
                <GameCard 
                   title={{ en: "Gel Blasters", ar: "جل بلاسترز" }}
                   desc={{ en: "Water-based pellet battle", ar: "قتال بكرات الجل" }}
                   accent="#FF6B00"
                   id="02"
                   lang={lang}
                />
              </div>
            </div>

            {state.game === 'laser-tag' && (
              <div className="flex flex-col items-center gap-4">
                <span className="section-label">{isAr ? "اختر مدة الجلسة" : "CHOOSE DURATION"}</span>
                <div className="flex gap-4">
                  {[30, 60].map(d => (
                    <button 
                      key={d}
                      onClick={() => dispatch({ type: "SET_GAME", payload: { game: 'laser-tag', duration: d as 30 | 60 } })}
                      className={`px-8 py-3 rounded-xl border transition-all font-heading text-xs tracking-widest ${state.duration === d ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]' : 'border-white/10 text-white/40'}`}
                    >
                      {d} MIN
                    </button>
                  ))}
                </div>
              </div>
            )}
            {renderNavButtons(!!state.game)}
          </div>
        )}

        {/* STEP 2: DATE & TIME */}
        {state.step === 2 && (
          <div className="space-y-12 reveal active">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Simplified Calendar Placeholder */}
                <div className="bg-[var(--bg-card)] p-8 rounded-[2rem] border border-white/5">
                   <h3 className="font-heading text-xs tracking-widest text-white/40 mb-8 uppercase flex items-center gap-3">
                     <CalendarIcon size={14} />
                     {isAr ? "اختر التاريخ" : "PICK A DATE"}
                   </h3>
                   <div className="grid grid-cols-7 gap-2 mb-4">
                      {["S","M","T","W","T","F","S"].map(d => <span key={d} className="text-[10px] text-white/20 text-center font-bold">{d}</span>)}
                   </div>
                   <input 
                      type="date" 
                      className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-[var(--accent-primary)] outline-none" 
                      min={new Date().toISOString().split('T')[0]}
                      max={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                      onChange={(e) => {
                        dispatch({ type: "SET_DATE_TIME", payload: { date: e.target.value, time: null } });
                        fetchSlots(e.target.value);
                      }}
                      value={state.date || ""}
                   />
                </div>

                {/* Time Slots */}
                <div className="min-h-[300px]">
                   <h3 className="font-heading text-xs tracking-widest text-white/40 mb-8 uppercase flex items-center gap-3">
                     <Clock size={14} />
                     {isAr ? "المواعيد المتاحة" : "AVAILABLE TIMES"}
                   </h3>
                   {isLoading ? (
                     <div className="grid grid-cols-2 gap-4 animate-pulse">
                        {[1,2,3,4,5,6].map(i => <div key={i} className="h-16 bg-white/5 rounded-xl" />)}
                     </div>
                   ) : slots.length > 0 ? (
                     <div className="grid grid-cols-2 gap-4">
                        {slots.map((s, i) => (
                           <button 
                             key={i}
                             disabled={!s.isAvailable}
                             onClick={() => dispatch({ type: "SET_DATE_TIME", payload: { date: state.date!, time: s.time } })}
                             className={`p-4 rounded-xl border text-center transition-all group ${state.time === s.time ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10' : 'border-white/5 bg-white/5 hover:border-white/20'} ${!s.isAvailable ? 'opacity-20 grayscale pointer-events-none' : ''}`}
                           >
                              <div className={`font-heading text-lg ${state.time === s.time ? 'text-[var(--accent-primary)]' : 'text-white'}`}>{s.time}</div>
                              <div className="text-[9px] uppercase tracking-widest text-white/40">{s.remainingCapacity}/6 {isAr ? "متاح" : "AVAILABLE"}</div>
                           </button>
                        ))}
                     </div>
                   ) : (
                     <p className="text-white/20 text-sm py-12 text-center uppercase tracking-widest">{isAr ? "يرجى اختيار تاريخ أولاً" : "SELECT A DATE FIRST"}</p>
                   )}
                </div>
             </div>
             {renderNavButtons(!!state.time)}
          </div>
        )}

        {/* STEP 3: PLAYERS */}
        {state.step === 3 && (
          <div className="space-y-12 text-center reveal active">
             <div className="flex flex-col items-center gap-8">
                <span className="section-label">{isAr ? "عدد المحاربين" : "HOW MANY WARRIORS?"}</span>
                <div className="flex items-center gap-12 bg-[var(--bg-card)] p-4 rounded-full border border-white/5">
                   <button 
                    onClick={() => dispatch({ type: "SET_PLAYERS", payload: Math.max(1, state.playerCount - 1) })}
                    className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-2xl flex items-center justify-center"
                   >-</button>
                   <span className="font-heading text-5xl w-12">{state.playerCount}</span>
                   <button 
                    onClick={() => dispatch({ type: "SET_PLAYERS", payload: Math.min(6, state.playerCount + 1) })}
                    className="w-12 h-12 rounded-full bg-white/10 hover:bg-[var(--accent-primary)] hover:text-black transition-all text-2xl flex items-center justify-center"
                   >+</button>
                </div>

                <div className="p-8 rounded-[2rem] bg-white/5 border border-white/5 w-full max-w-sm">
                   <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-2 truncate">
                     {state.game?.replace('-',' ')} · {state.duration} MIN session
                   </div>
                   <div className="font-heading text-4xl text-[var(--accent-primary)] mb-4 shadow-glow">
                     {totalPrice} EGP
                   </div>
                   <p className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)]">Total for {state.playerCount} players</p>
                </div>

                <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 flex items-start gap-4 text-left max-w-sm">
                   <Info size={18} className="text-amber-500 shrink-0 mt-1" />
                   <p className="text-[11px] text-amber-500/80 font-medium">
                     {isAr 
                       ? "لا يشمل تذكرة الدخول: 30 جنيه (أيام عادية) · 50 جنيه (إجازات ومهرجانات)" 
                       : "Does not include park entrance: 30 EGP/person (normal days) · 50 EGP/person (holidays)"}
                   </p>
                </div>
             </div>
             {renderNavButtons(true)}
          </div>
        )}

        {/* STEP 4: CONTACT */}
        {state.step === 4 && (
          <div className="space-y-8 reveal active">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                   <label className="text-[10px] uppercase tracking-widest text-white/40 ml-4">{isAr ? "الاسم بالكامل" : "FULL NAME"}</label>
                   <input 
                    type="text"
                    required
                    placeholder="Enter name"
                    autoComplete="name"
                    className="w-full bg-[var(--bg-card)] border border-white/10 rounded-full px-6 py-4 focus:border-[var(--accent-primary)] outline-none"
                    value={state.contact.name}
                    onChange={(e) => dispatch({ type: "SET_CONTACT", payload: { ...state.contact, name: e.target.value } })}
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] uppercase tracking-widest text-white/40 ml-4">{isAr ? "رقم الموبايل" : "PHONE NUMBER"}</label>
                   <input 
                    type="tel"
                    required
                    placeholder="01X XXXX XXXX"
                    autoComplete="tel"
                    className="w-full bg-[var(--bg-card)] border border-white/10 rounded-full px-6 py-4 focus:border-[var(--accent-primary)] outline-none"
                    value={state.contact.phone}
                    onChange={(e) => dispatch({ type: "SET_CONTACT", payload: { ...state.contact, phone: e.target.value } })}
                   />
                </div>
                <div className="md:col-span-2 space-y-2">
                   <label className="text-[10px] uppercase tracking-widest text-white/40 ml-4">{isAr ? "البريد الإلكتروني" : "EMAIL ADDRESS"}</label>
                   <input 
                    type="email"
                    required
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="w-full bg-[var(--bg-card)] border border-white/10 rounded-full px-6 py-4 focus:border-[var(--accent-primary)] outline-none"
                    value={state.contact.email}
                    onChange={(e) => dispatch({ type: "SET_CONTACT", payload: { ...state.contact, email: e.target.value } })}
                   />
                </div>
             </div>

             <div className="mt-8 border-t border-white/5 pt-8 flex flex-col items-center">
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl text-center w-full max-w-sm">
                   <span className="text-[10px] uppercase tracking-widest text-white/40">Security Check</span>
                   <div className="h-16 flex items-center justify-center">[hCaptcha Widget Placeholder]</div>
                </div>
             </div>
             {renderNavButtons(!!(state.contact.name && state.contact.phone && state.contact.email))}
          </div>
        )}

        {/* STEP 5: REVIEW */}
        {state.step === 5 && (
          <div className="space-y-12 reveal active">
             {/* Part A: Policy */}
             <div className="p-8 rounded-[2rem] border-2 border-amber-500/20 bg-amber-500/5 space-y-6">
                <div className="flex items-center gap-4 text-amber-500">
                   <ShieldCheck size={24} />
                   <h3 className="font-heading text-sm uppercase tracking-widest">{isAr ? "سياسة الإلغاء" : "CANCELLATION POLICY"}</h3>
                </div>
                <p className="text-sm leading-relaxed text-amber-500/80">
                   {isAr 
                    ? "يمكن الإلغاء حتى 6 ساعات قبل موعد الجلسة. بعد ذلك لا يمكن الإلغاء أو إعادة الجدولة. بالتأكيد، توافق على هذه الشروط." 
                    : "Cancellations are accepted up to 6 hours before your session. After that, your slot cannot be cancelled or rescheduled. By confirming, you agree to these terms."}
                </p>
                <label className="flex items-center gap-4 cursor-pointer group">
                   <div 
                    onClick={() => dispatch({ type: "SET_POLICY", payload: !state.policyAccepted })}
                    className={`w-6 h-6 rounded border-2 transition-all flex items-center justify-center ${state.policyAccepted ? 'bg-amber-500 border-amber-500' : 'border-white/20 group-hover:border-amber-500/50'}`}
                   >
                     {state.policyAccepted && <ChevronRight size={16} className="text-black" />}
                   </div>
                   <span className="text-xs uppercase tracking-widest text-white/60">{isAr ? "أفهم وأوافق" : "I understand and agree"}</span>
                </label>
             </div>

             {/* Part B: Summary */}
             {state.policyAccepted && (
               <div className="bg-[var(--bg-card)] p-8 rounded-[2rem] border border-white/5 space-y-8 reveal active">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-8 pb-8 border-b border-white/5">
                     <div>
                        <span className="text-[10px] text-white/20 block mb-1 uppercase tracking-widest">Game</span>
                        <div className="font-heading text-xs uppercase tracking-tighter text-[var(--accent-primary)]">{state.game?.replace('-',' ')}</div>
                     </div>
                     <div>
                        <span className="text-[10px] text-white/20 block mb-1 uppercase tracking-widest">Mission Time</span>
                        <div className="font-heading text-xs uppercase tracking-tighter">{state.date} @ {state.time}</div>
                     </div>
                     <div>
                        <span className="text-[10px] text-white/20 block mb-1 uppercase tracking-widest">Unit Size</span>
                        <div className="font-heading text-xs uppercase tracking-tighter">{state.playerCount} Players</div>
                     </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-2">
                        <span className="text-[10px] text-white/20 block mb-1 uppercase tracking-widest">Primary Contact</span>
                        <div className="text-sm">{state.contact.name}</div>
                        <div className="text-sm font-mono text-white/40">{state.contact.phone.replace(/(\d{3})\d+(\d{3})/, "$1****$2")}</div>
                     </div>
                     <div className="text-right flex flex-col justify-end">
                        <div className="text-[10px] text-white/20 uppercase tracking-widest">Reservation Total</div>
                        <div className="font-heading text-3xl text-[var(--accent-primary)]">{totalPrice} EGP</div>
                        <div className="text-[9px] text-amber-500 uppercase tracking-widest font-bold mt-2">Excl. Park Entry ({state.playerCount * 30}-{state.playerCount * 50} EGP)</div>
                     </div>
                  </div>
               </div>
             )}
             {renderNavButtons(state.policyAccepted)}
          </div>
        )}
      </main>

      <Footer lang={lang} toggleLang={toggleLang} />

      {/* MOBILE BOTTOM BUTTON (Sticky) */}
      <div className="md:hidden fixed bottom-0 left-0 w-full p-4 bg-black/80 backdrop-blur-xl border-t border-white/10 z-50">
         {state.step < 5 ? (
           <button 
            disabled={isLoading}
            onClick={() => dispatch({ type: "SET_STEP", payload: (state.step + 1) as Step })}
            className="btn-green w-full !py-4 block text-center min-h-[44px]"
           >
             {isAr ? "متابعة الخطوة التالية" : "CONTINUE TO NEXT STEP"}
           </button>
         ) : (
           <button 
            disabled={!state.policyAccepted || isLoading}
            onClick={finalizeBooking}
            className="btn-red w-full !py-4 block text-center min-h-[44px]"
           >
             {isLoading ? <Loader2 className="animate-spin mx-auto" /> : (isAr ? "تأكيد المهمة الآن" : "CONFIRM MISSION NOW")}
           </button>
         )}
      </div>
    </div>
  );
}
