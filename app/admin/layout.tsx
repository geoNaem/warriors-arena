import { auth, signOut } from "@/auth";
import Link from "next/link";
import { 
  LayoutDashboard, 
  BookOpen, 
  CalendarDays, 
  ScanLine, 
  Download, 
  Settings, 
  LogOut,
  User as UserIcon
} from "lucide-react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const userRole = (session?.user as any)?.role || "STAFF";
  const isOwner = userRole === "OWNER";

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/admin", roles: ["OWNER", "STAFF"] },
    { label: "Bookings", icon: BookOpen, href: "/admin/bookings", roles: ["OWNER", "STAFF"] },
    { label: "Calendar", icon: CalendarDays, href: "/admin/calendar", roles: ["OWNER", "STAFF"] },
    { label: "Check-In", icon: ScanLine, href: "/admin/checkin", roles: ["OWNER", "STAFF"] },
    { label: "Export", icon: Download, href: "/admin/export", roles: ["OWNER"] },
    { label: "Settings", icon: Settings, href: "/admin/settings", roles: ["OWNER"] },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex">
      {/* SIDEBAR (Desktop) */}
      <aside className="w-64 border-r border-white/5 bg-[var(--bg-card)] p-6 hidden md:flex flex-col">
        <div className="mb-12">
           <h2 className="font-heading text-lg italic tracking-tight">
             WARRIORS <span className="text-[var(--accent-primary)]">ARENA</span>
           </h2>
           <div className="mt-4 flex items-center gap-3">
              <div className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest ${isOwner ? 'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20' : 'bg-white/10 text-white/40'}`}>
                {userRole}
              </div>
              <span className="text-[10px] text-white/40 truncate">{session?.user?.name}</span>
           </div>
        </div>

        <nav className="space-y-2 flex-grow">
           {navItems.filter(item => item.roles.includes(userRole)).map((item) => (
             <Link 
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-all text-sm text-white/60 hover:text-white group"
             >
                <item.icon size={18} className="group-hover:text-[var(--accent-primary)] transition-colors" />
                {item.label}
             </Link>
           ))}
        </nav>

        <div className="pt-6 border-t border-white/5">
           <form action={async () => { "use server"; await signOut(); }}>
             <button className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 transition-all text-sm text-red-500/60 hover:text-red-500 w-full">
                <LogOut size={18} />
                Sign Out
             </button>
           </form>
        </div>
      </aside>

      {/* MOBILE BOTTOM NAV */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full h-20 bg-black/80 backdrop-blur-xl border-t border-white/10 flex items-center justify-around px-6 z-50">
         {navItems.filter(item => ["Dashboard", "Bookings", "Check-In"].includes(item.label)).map((item) => (
            <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1 text-[10px] text-white/40">
               <item.icon size={20} />
               {item.label}
            </Link>
         ))}
      </nav>

      <main className="flex-grow p-8 md:p-12 pb-32 md:pb-12 h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
