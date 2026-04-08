import { auth } from "@/auth";
import { db } from "@/lib/db";
import { decryptField } from "@/lib/crypto";
import { 
  Filter, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  Trash2,
  CheckCircle2
} from "lucide-react";

async function getBookings(page = 1, query = "", status = "") {
  const skip = (page - 1) * 20;
  
  const where: any = {
    AND: [
      query ? {
        OR: [
          { reservationCode: { contains: query, mode: 'insensitive' } },
          { clientName: { contains: query, mode: 'insensitive' } }
        ]
      } : {},
      status ? { status } : {}
    ]
  };

  const [bookings, total] = await Promise.all([
    db.reservation.findMany({
      where,
      skip,
      take: 20,
      orderBy: { createdAt: 'desc' }
    }),
    db.reservation.count({ where })
  ]);

  return { bookings, total, totalPages: Math.ceil(total / 20) };
}

export default async function BookingsPage({ searchParams }: { searchParams: any }) {
  const session = await auth();
  const isOwner = (session?.user as any)?.role === "OWNER";
  
  const page = parseInt(searchParams.page || "1");
  const query = searchParams.q || "";
  const statusFilter = searchParams.status || "";

  const { bookings, total, totalPages } = await getBookings(page, query, statusFilter);

  return (
    <div className="space-y-12 pb-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="font-heading text-4xl italic uppercase">Mission Archive</h1>
          <p className="text-white/40 text-sm mt-1 uppercase tracking-widest">Master list of all {total} reservations</p>
        </div>
        
        <div className="flex flex-wrap gap-4 w-full md:w-auto">
           <form className="relative flex-grow md:w-64">
              <Search size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" />
              <input 
                name="q"
                defaultValue={query}
                placeholder="Search code or name..."
                className="w-full bg-[var(--bg-card)] border border-white/10 rounded-full pl-14 pr-6 py-4 outline-none focus:border-[var(--accent-primary)] text-sm"
              />
           </form>
           <div className="flex items-center gap-2 bg-[var(--bg-card)] border border-white/10 rounded-full px-6 py-4">
              <Filter size={16} className="text-white/20" />
              <select className="bg-transparent text-xs uppercase tracking-widest text-white/60 outline-none">
                 <option value="">All Status</option>
                 <option value="CONFIRMED">Confirmed</option>
                 <option value="CANCELLED">Cancelled</option>
                 <option value="COMPLETED">Completed</option>
              </select>
           </div>
        </div>
      </header>

      {/* DATA TABLE */}
      <div className="overflow-hidden rounded-[2rem] border border-white/5 bg-[var(--bg-card)] shadow-glow">
         <div className="overflow-x-auto">
           <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-white/5 text-[10px] uppercase tracking-widest text-white/40">
                 <tr>
                    <th className="px-8 py-6">Code</th>
                    <th className="px-8 py-6">Mission Details</th>
                    <th className="px-8 py-6">Soldier</th>
                    <th className="px-8 py-6">Status</th>
                    <th className="px-8 py-6">Tactical Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                 {bookings.map((r) => (
                    <tr key={r.id} className="hover:bg-white/5 transition-colors group">
                       <td className="px-8 py-6 font-heading text-lg text-[var(--accent-primary)]">{r.reservationCode}</td>
                       <td className="px-8 py-6 space-y-1">
                          <div className="font-medium text-white">{r.game === "LASER_TAG" ? "Laser Tag" : "Gel Blasters"}</div>
                          <div className="text-[10px] text-white/40 uppercase tracking-widest">
                             {String(r.sessionDate).split('T')[0]} @ {r.sessionTime} · {r.playerCount} PX
                          </div>
                       </td>
                       <td className="px-8 py-6 space-y-1">
                          <div className="text-sm font-medium">{r.clientName}</div>
                          {isOwner && (
                            <div className="text-[11px] font-mono text-white/20 flex items-center gap-2">
                               {decryptField(r.clientPhone)} <Eye size={10} />
                            </div>
                          )}
                       </td>
                       <td className="px-8 py-6">
                          <span className={`text-[10px] uppercase font-bold px-3 py-1 rounded-full border ${
                             r.status === "CONFIRMED" ? "bg-green-500/10 text-green-500 border-green-500/20" :
                             r.status === "CANCELLED" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                             "bg-white/10 text-white/40 border-white/10"
                          }`}>
                             {r.status}
                          </span>
                       </td>
                       <td className="px-8 py-6">
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button className="p-3 bg-white/5 rounded-xl hover:bg-[var(--accent-primary)]/20 hover:text-[var(--accent-primary)] transition-all">
                                <CheckCircle2 size={16} />
                             </button>
                             {isOwner && r.status !== "CANCELLED" && (
                               <button className="p-3 bg-white/5 rounded-xl hover:bg-red-500/20 hover:text-red-500 transition-all">
                                  <Trash2 size={16} />
                               </button>
                             )}
                          </div>
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>
         </div>

         {/* PAGINATION */}
         <div className="px-8 py-6 bg-white/5 border-t border-white/5 flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-white/20">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
               <button disabled={page === 1} className="p-2 rounded-lg bg-white/5 disabled:opacity-30"><ChevronLeft size={16} /></button>
               <button disabled={page >= totalPages} className="p-2 rounded-lg bg-white/5 disabled:opacity-30"><ChevronRight size={16} /></button>
            </div>
         </div>
      </div>
    </div>
  );
}
