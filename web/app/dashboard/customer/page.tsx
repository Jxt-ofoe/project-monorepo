"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getShipments, cancelShipment } from "@/lib/api";
import { useSocket } from "@/hooks/useSocket";

interface Shipment {
  id: string;
  trackingNumber: string;
  status: string;
  receiverName: string;
  receiverAddress: string;
  quotedPrice: number;
  createdAt: string;
}

export default function CustomerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const socket = useSocket(session?.user?.id ? `user_${session.user.id}` : undefined);

  useEffect(() => {
    if (socket) {
      socket.on('shipment_status_updated', () => {
        loadShipments();
      });
    }
  }, [socket]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (session?.token) loadShipments();
  }, [session]);

  async function loadShipments() {
    try {
      setLoading(true);
      const data = await getShipments(session!.token as string);
      setShipments(data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load shipments");
    } finally {
      setLoading(false);
    }
  }

  const statusMap: Record<string, { color: string; label: string }> = {
    created: { color: "bg-slate-500/10 text-slate-500 border-slate-500/20", label: "Pending" },
    assigned: { color: "bg-blue-500/10 text-blue-500 border-blue-500/20", label: "Assigned" },
    picked_up: { color: "bg-amber-500/10 text-amber-500 border-amber-500/20", label: "Picked Up" },
    in_transit: { color: "bg-primary/10 text-primary border-primary/20", label: "In Transit" },
    out_for_delivery: { color: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20", label: "Out for Delivery" },
    delivered: { color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", label: "Delivered" },
    cancelled: { color: "bg-rose-500/10 text-rose-500 border-rose-500/20", label: "Cancelled" },
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-primary font-bold tracking-widest uppercase">Initializing Portal...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      {/* Premium Navbar */}
      <nav className="sticky top-0 z-50 glass-card border-x-0 border-t-0 rounded-none">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center amber-glow">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter text-secondary uppercase">SmartLogix</h1>
              <p className="text-[10px] uppercase tracking-widest font-bold text-secondary/40 -mt-1">Customer Command Center</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:block text-right">
              <p className="text-xs font-bold text-secondary/60">Welcome back,</p>
              <p className="text-sm font-black text-secondary">{session?.user?.fullName || session?.user?.email}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="p-2 text-secondary/60 hover:text-rose-500 transition-colors"
              title="Logout"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Header */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10 animate-fade-in">
          {[
            { label: "Active Orders", value: shipments.filter(s => !["delivered", "cancelled"].includes(s.status)).length, icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-primary" },
            { label: "Total Shipments", value: shipments.length, icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2", color: "text-secondary" },
            { label: "Completed", value: shipments.filter(s => s.status === "delivered").length, icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-emerald-500" },
            { label: "Cancelled", value: shipments.filter(s => s.status === "cancelled").length, icon: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-rose-500" }
          ].map((stat, i) => (
            <div key={stat.label} className={`glass-card p-5 rounded-2xl animate-fade-in stagger-${i+1}`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] uppercase tracking-widest font-black text-secondary/40">{stat.label}</p>
                <svg className={`w-5 h-5 ${stat.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                </svg>
              </div>
              <p className="text-3xl font-black tracking-tighter text-secondary">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Action Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-black tracking-tighter text-secondary uppercase">Recent Activity</h2>
          <div className="flex items-center gap-3 w-full md:w-auto">
             <Link href="/track" className="flex-1 md:flex-none text-center px-6 py-2.5 rounded-xl border border-border text-sm font-bold text-secondary/60 hover:text-secondary hover:border-secondary transition-all">
              Track Order
            </Link>
            <Link href="/shipments/new" className="flex-1 md:flex-none text-center px-6 py-2.5 rounded-xl bg-primary text-sm font-bold text-white hover:bg-primary/90 transition-all amber-glow">
              + New Shipment
            </Link>
          </div>
        </div>

        {/* Shipment List */}
        <div className="glass-card rounded-3xl overflow-hidden animate-fade-in stagger-2">
          {loading ? (
            <div className="p-20 text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-sm font-bold text-secondary/40 uppercase tracking-widest">Accessing records...</p>
            </div>
          ) : shipments.length === 0 ? (
            <div className="p-20 text-center">
              <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0l-8 4-8-4" />
                </svg>
              </div>
              <h3 className="text-xl font-black text-secondary mb-2">No Shipments Found</h3>
              <p className="text-secondary/60 mb-8 max-w-xs mx-auto">Your logistics history is empty. Start by booking your first premium delivery service.</p>
              <Link href="/shipments/new" className="px-8 py-3 rounded-2xl bg-secondary text-white font-bold hover:scale-105 transition-transform inline-block">
                Create First Order
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-secondary/5">
                    <th className="px-8 py-4 text-left text-[10px] font-black text-secondary/40 uppercase tracking-widest">Order Details</th>
                    <th className="px-8 py-4 text-left text-[10px] font-black text-secondary/40 uppercase tracking-widest">Destination</th>
                    <th className="px-8 py-4 text-left text-[10px] font-black text-secondary/40 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-4 text-left text-[10px] font-black text-secondary/40 uppercase tracking-widest">Price</th>
                    <th className="px-8 py-4 text-right text-[10px] font-black text-secondary/40 uppercase tracking-widest">Manage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {shipments.map((s) => (
                    <tr key={s.id} className="group hover:bg-secondary/2 transition-colors">
                      <td className="px-8 py-6">
                        <p className="text-sm font-black text-secondary mb-0.5">{s.trackingNumber}</p>
                        <p className="text-[10px] font-bold text-secondary/40">{new Date(s.createdAt).toLocaleDateString('en-GH', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm font-bold text-secondary">{s.receiverName}</p>
                        <p className="text-[10px] font-medium text-secondary/60 truncate max-w-[200px]">{s.receiverAddress}</p>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${statusMap[s.status]?.color || "bg-slate-100 text-slate-500 border-slate-200"}`}>
                          {statusMap[s.status]?.label || s.status}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm font-black text-secondary">GHS {s.quotedPrice?.toFixed(2)}</p>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <Link href={`/track/${s.trackingNumber}`} className="p-2 inline-block text-secondary/40 hover:text-primary transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Floating Mobile Action */}
      <div className="md:hidden fixed bottom-8 right-8">
        <Link href="/shipments/new" className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center shadow-2xl amber-glow animate-bounce">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
