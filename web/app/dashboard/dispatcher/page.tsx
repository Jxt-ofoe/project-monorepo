"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  getAnalytics, 
  getAllOrders, 
  assignDriver, 
  updateShipmentStatus, 
  getDrivers 
} from "@/lib/api";
import { useSocket } from "@/hooks/useSocket";
import { 
  Activity, 
  Truck, 
  Package, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  RefreshCcw, 
  Map as MapIcon,
  ChevronRight,
  MoreVertical,
  User as UserIcon
} from "lucide-react";

interface Shipment {
  id: string;
  trackingNumber: string;
  status: string;
  senderName: string;
  senderAddress: string;
  receiverName: string;
  receiverAddress: string;
  weightKg: number;
  quotedPrice: number;
  priority: string;
  assignedDriverId: string | null;
  createdAt: string;
}

interface Driver {
  id: string;
  fullName: string;
  status: string;
  licenseNumber: string;
  currentLat: number | null;
  currentLng: number | null;
}

export default function DispatcherDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");

  const socket = useSocket('admins');

  useEffect(() => {
    if (socket) {
      socket.on('shipment_assigned', () => loadData());
      socket.on('shipment_status_updated', () => loadData());
      socket.on('location_updated', () => loadData());
    }
  }, [socket]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (session?.token) loadData();
  }, [session]);

  async function loadData() {
    try {
      setLoading(true);
      const [shipmentsData, driversData, analyticsData] = await Promise.all([
        getAllOrders(session!.token as string, filter ? { status: filter } : undefined),
        getDrivers(session!.token as string),
        getAnalytics(session!.token as string),
      ]);
      setShipments(shipmentsData || []);
      setDrivers(driversData || []);
      setAnalytics(analyticsData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Data synchronization failed");
    } finally {
      setLoading(false);
    }
  }

  const statusMap: Record<string, { color: string; bg: string; icon: any }> = {
    created: { color: "text-slate-500", bg: "bg-slate-500/10", icon: Package },
    assigned: { color: "text-blue-500", bg: "bg-blue-500/10", icon: UserIcon },
    picked_up: { color: "text-amber-500", bg: "bg-amber-500/10", icon: Activity },
    in_transit: { color: "text-primary", bg: "bg-primary/10", icon: Truck },
    out_for_delivery: { color: "text-indigo-500", bg: "bg-indigo-500/10", icon: Truck },
    delivered: { color: "text-emerald-500", bg: "bg-emerald-500/10", icon: CheckCircle2 },
    cancelled: { color: "text-rose-500", bg: "bg-rose-500/10", icon: XCircle },
  };

  if (status === "loading") return null;

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 flex flex-col md:flex-row">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-64 glass-card border-y-0 border-l-0 rounded-none z-40 hidden md:flex flex-col">
        <div className="p-6 border-b border-border flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center amber-glow">
             <Activity className="w-5 h-5 text-white" strokeWidth={3} />
          </div>
          <h1 className="text-lg font-black tracking-tighter text-secondary uppercase">Mission Control</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {[
            { label: "Active Operations", icon: Activity, href: "/dashboard/dispatcher", active: true },
            { label: "Fleet Monitor", icon: MapIcon, href: "/dashboard/dispatcher/fleet" },
            { label: "Driver Directory", icon: UserIcon, href: "/dashboard/dispatcher/drivers" },
            { label: "Analytics Hub", icon: TrendingUp, href: "/dashboard/dispatcher/analytics" },
          ].map((item) => (
            <Link 
              key={item.label} 
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                item.active ? "bg-primary text-white amber-glow" : "text-secondary/40 hover:bg-secondary/5 hover:text-secondary"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-border">
          <button onClick={() => signOut({ callbackUrl: "/" })} className="flex items-center gap-3 text-rose-500/60 hover:text-rose-500 text-[10px] font-black uppercase tracking-widest">
            <XCircle className="w-4 h-4" />
            Terminate Session
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto h-screen p-4 md:p-8">
        <div className="mx-auto max-w-7xl">
          
          {/* Header Bar */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">Global Logistics Intelligence</p>
              <h2 className="text-4xl font-black tracking-tighter text-secondary uppercase">Dispatcher Dashboard</h2>
            </div>
            
            <div className="flex items-center gap-3">
              <button onClick={loadData} className="p-3 rounded-xl bg-secondary/5 text-secondary/40 hover:text-secondary hover:bg-secondary/10 transition-all">
                <RefreshCcw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
              </button>
              <Link href="/dashboard/dispatcher/fleet" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-secondary text-white text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl">
                <MapIcon className="w-4 h-4" />
                Live Fleet Map
              </Link>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Today's Volume", value: analytics?.overview?.todayShipments || 0, icon: Package, color: "text-primary" },
              { label: "Active Fleet", value: analytics?.overview?.activeDrivers || 0, icon: Truck, color: "text-blue-500" },
              { label: "Revenue (GHS)", value: analytics?.overview?.totalRevenue?.toFixed(0) || "0", icon: TrendingUp, color: "text-emerald-500" },
              { label: "Performance", value: `${analytics?.overview?.onTimeRate || 100}%`, icon: Clock, color: "text-indigo-500" }
            ].map((stat, i) => (
              <div key={stat.label} className="glass-card p-6 rounded-2xl border-border/40 animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="flex items-center justify-between mb-4">
                   <div className={`p-2 rounded-lg ${stat.color.replace('text', 'bg')}/10`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <span className="text-[10px] font-black text-secondary/20 uppercase tracking-widest">Live</span>
                </div>
                <p className="text-3xl font-black tracking-tighter text-secondary">{stat.value}</p>
                <p className="text-[10px] font-bold text-secondary/40 uppercase tracking-widest mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* ORDERS TABLE */}
            <div className="flex-1 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black tracking-tighter text-secondary uppercase">Operational Queue</h3>
                <div className="flex items-center gap-2">
                  <select 
                    value={filter} 
                    onChange={(e) => setFilter(e.target.value)}
                    className="bg-secondary/5 border border-border rounded-lg px-3 py-1.5 text-[10px] font-black uppercase outline-none focus:border-primary"
                  >
                    <option value="">All Streams</option>
                    <option value="created">Unassigned</option>
                    <option value="in_transit">In Transit</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>
              </div>

              <div className="glass-card rounded-3xl overflow-hidden shadow-2xl">
                {shipments.length === 0 ? (
                  <div className="p-20 text-center text-secondary/40">No records found in active stream.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-secondary/5">
                          <th className="px-6 py-4 text-[10px] font-black text-secondary/40 uppercase tracking-widest">Shipment ID</th>
                          <th className="px-6 py-4 text-[10px] font-black text-secondary/40 uppercase tracking-widest">Route</th>
                          <th className="px-6 py-4 text-[10px] font-black text-secondary/40 uppercase tracking-widest">Status</th>
                          <th className="px-6 py-4 text-[10px] font-black text-secondary/40 uppercase tracking-widest text-right">Operations</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {shipments.map((s) => {
                          const StatusIcon = statusMap[s.status]?.icon || Package;
                          return (
                            <tr key={s.id} className="group hover:bg-secondary/2 transition-colors">
                              <td className="px-6 py-5">
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${statusMap[s.status]?.bg || "bg-slate-100"}`}>
                                    <StatusIcon className={`w-4 h-4 ${statusMap[s.status]?.color || "text-slate-400"}`} />
                                  </div>
                                  <div>
                                    <p className="text-xs font-black text-secondary uppercase">{s.trackingNumber}</p>
                                    <p className="text-[10px] font-bold text-secondary/40">{s.priority.toUpperCase()}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-5">
                                <div className="flex items-center gap-2">
                                  <div className="max-w-[120px] truncate text-[10px] font-bold text-secondary/60">{s.senderAddress}</div>
                                  <ChevronRight className="w-3 h-3 text-primary" />
                                  <div className="max-w-[120px] truncate text-[10px] font-bold text-secondary/60">{s.receiverAddress}</div>
                                </div>
                                <p className="text-[10px] font-medium text-secondary/30 mt-1">{s.receiverName}</p>
                              </td>
                              <td className="px-6 py-5">
                                <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${statusMap[s.status]?.color || "text-slate-500"} ${statusMap[s.status]?.bg || "bg-slate-50"} border-current/20`}>
                                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                                  {s.status.replace('_', ' ')}
                                </div>
                              </td>
                              <td className="px-6 py-5 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {s.status === 'created' && (
                                    <button className="px-3 py-1.5 rounded-lg bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">Assign</button>
                                  )}
                                  <button className="p-2 text-secondary/20 hover:text-secondary transition-colors">
                                    <MoreVertical className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* DRIVER FEED SIDEBAR */}
            <div className="w-full lg:w-80 space-y-6">
              <h3 className="text-xl font-black tracking-tighter text-secondary uppercase">Active Fleet</h3>
              <div className="space-y-4">
                {drivers.map((d) => (
                  <div key={d.id} className="glass-card p-4 rounded-2xl flex items-center gap-4 group hover:border-primary/50 transition-all">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center border border-border">
                        <UserIcon className="w-6 h-6 text-secondary/40" />
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${
                        d.status === 'available' ? "bg-emerald-500" : d.status === 'busy' ? "bg-amber-500" : "bg-slate-400"
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-black text-secondary uppercase leading-none mb-1">{d.fullName}</p>
                      <p className="text-[10px] font-bold text-secondary/40 uppercase tracking-widest">{d.status}</p>
                    </div>
                    <div className="text-right">
                       <Link href="/dashboard/dispatcher/fleet" className="text-primary hover:scale-110 transition-transform inline-block">
                         <MapIcon className="w-4 h-4" />
                       </Link>
                    </div>
                  </div>
                ))}
              </div>
              
              <Link href="/dashboard/dispatcher/drivers" className="w-full py-4 rounded-2xl border border-border text-center text-[10px] font-black text-secondary/40 uppercase tracking-[0.2em] hover:bg-secondary/5 hover:text-secondary transition-all block">
                Manage All Resources
              </Link>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
