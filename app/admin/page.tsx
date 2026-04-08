import { auth } from "@/auth";
import { db } from "@/lib/db";
import { 
  Users, 
  Target, 
  Flame, 
  Activity, 
  Clock,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

async function getDashboardData() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const bookings = await db.reservation.findMany({
    where: {
      sessionDate: { gte: today, lt: tomorrow },
      status: { in: ["CONFIRMED", "COMPLETED"] }
    }
  });

  const stats = {
    total: bookings.length,
    players: bookings.reduce((acc, b) => acc + b.playerCount, 0),
    laserTag: bookings.filter(b => b.game === "LASER_TAG").length,
    gelBlasters: bookings.filter(b => b.game === "GEL_BLASTERS").length,
  };

  const recent = await db.reservation.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
  });

  return { stats, recent };
}

export default async function AdminDashboard() {
  const session = await auth();
  const { stats, recent } = await getDashboardData();

  const cards = [
    { label: "Bookings Today", value: stats.total, icon: Activity, color: "var(--accent-primary)" },
    { label: "Players Expected", value: stats.players, icon: Users, color: "#FFF" },
    { label: "Laser Tag Units", value: stats.laserTag, icon: Target, color: "var(--accent-primary)" },
    { label: "Gel Blasters Units", value: stats.gelBlasters, icon: Flame, color: "var(--accent-secondary)" },
  ];

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-heading text-4xl italic uppercase">Operational Dashboard</h1>
          <p className="text-white/40 text-sm mt-1 uppercase tracking-widest">Real-time arena metrics for today</p>
        </div>
        <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl px-6 py-3">
          <Clock size={16} className="text-[var(--accent-primary)]" />
          <span className="text-xs font-heading">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </header>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <div key={i} className="bg-[var(--bg-card)] p-8 rounded-[2rem] border border-white/5 space-y-4">
            <div className="flex justify-between items-start">
               <span className="text-[10px] uppercase tracking-widest text-white/40">{card.label}</span>
               <card.icon size={20} style={{ color: card.color }} />
            </div>
            <div className="font-heading text-5xl">{card.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* RECENT BOOKINGS */}
        <div className="lg:col-span-2 space-y-6">
           <div className="flex justify-between items-center">
              <h2 className="font-heading text-lg uppercase">Recent Activity</h2>
              <Link href="/admin/bookings" className="text-[10px] uppercase tracking-widest text-[var(--accent-primary)] flex items-center gap-2 hover:translate-x-1 transition-transform">
                View all <ArrowRight size={14} />
              </Link>
           </div>
           
           <div className="overflow-hidden rounded-[2rem] border border-white/5 bg-[var(--bg-card)]">
              <table className="w-full text-left text-sm">
                 <thead className="bg-white/5 text-[10px] uppercase tracking-widest text-white/40">
                    <tr>
                       <th className="px-6 py-4">Code</th>
                       <th className="px-6 py-4">Game</th>
                       <th className="px-6 py-4">Capacity</th>
                       <th className="px-6 py-4">Status</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                    {recent.map((r) => (
                       <tr key={r.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 font-heading text-[var(--accent-primary)]">{r.reservationCode}</td>
                          <td className="px-6 py-4 text-xs font-medium">{r.game === "LASER_TAG" ? "Laser Tag" : "Gel Blasters"}</td>
                          <td className="px-6 py-4 text-white/60">{r.playerCount} px</td>
                          <td className="px-6 py-4">
                             <div className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full inline-block ${
                                r.status === "CONFIRMED" ? "bg-green-500/20 text-green-500 border border-green-500/20" :
                                r.status === "CANCELLED" ? "bg-red-500/20 text-red-500 border border-red-500/20" :
                                "bg-white/10 text-white/40 border border-white/10"
                             }`}>
                                {r.status}
                             </div>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>

        {/* TIMELINE SIMULATOR (Side Card) */}
        <div className="space-y-6">
           <h2 className="font-heading text-lg uppercase">Arena Timeline</h2>
           <div className="bg-[var(--bg-card)] rounded-[2rem] border border-white/5 p-8 space-y-6">
              {["18:00", "18:30", "19:00", "19:30", "20:00", "20:30"].map((time, i) => (
                 <div key={i} className="flex items-center gap-4">
                    <span className="text-[10px] font-mono text-white/20 w-12">{time}</span>
                    <div className="flex-grow h-6 bg-white/5 rounded-full overflow-hidden flex">
                       <div className="h-full bg-[var(--accent-primary)]/40 w-[60%] border-r border-black/20" />
                       <div className="h-full bg-[var(--accent-secondary)]/40 w-[20%]" />
                    </div>
                 </div>
              ))}
              <div className="pt-4 flex gap-4 text-[9px] uppercase tracking-widest text-white/20">
                 <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[var(--accent-primary)]/40" /> Laser Tag</div>
                 <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[var(--accent-secondary)]/40" /> Gel Blasters</div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
