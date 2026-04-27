"use client";

import dynamic from 'next/dynamic';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getDrivers, getAllOrders } from "@/lib/api";
import { ChevronLeft, Activity, Truck, Package, Layers } from "lucide-react";

// Dynamically import Map component to avoid SSR issues with Leaflet
const FleetMap = dynamic(() => import('@/components/fleet/FleetMap'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-100">
      <div className="animate-pulse text-slate-400 font-bold uppercase tracking-widest">Calibrating Satellite...</div>
    </div>
  )
});

export default function FleetPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [drivers, setDrivers] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (session?.token) loadData();
    const interval = setInterval(() => {
      if (session?.token) loadData();
    }, 10000); // Refresh every 10s for real-time feel
    return () => clearInterval(interval);
  }, [session]);

  async function loadData() {
    try {
      const [driversData, shipmentsData] = await Promise.all([
        getDrivers(session!.token as string),
        getAllOrders(session!.token as string, { status: 'in_transit,out_for_delivery' }),
      ]);
      setDrivers(driversData || []);
      setShipments(shipmentsData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading") return null;

  return (
    <div className="h-screen flex flex-col bg-slate-900 overflow-hidden">
      {/* Control Tower Header */}
      <header className="z-50 bg-slate-900/80 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/dispatcher" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-black tracking-tighter text-white uppercase">Fleet Control Tower</h1>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Live Operations Monitor</p>
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8">
           <div className="text-right">
             <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Active Couriers</p>
             <p className="text-xl font-black text-white leading-none">{drivers.filter(d => d.status !== 'off').length}</p>
           </div>
           <div className="text-right">
             <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">En-Route</p>
             <p className="text-xl font-black text-primary leading-none">{shipments.length}</p>
           </div>
           <button className="p-3 rounded-xl bg-primary text-white amber-glow">
             <Layers className="w-5 h-5" />
           </button>
        </div>
      </header>

      {/* Map Content */}
      <div className="flex-1 relative">
        <FleetMap drivers={drivers} shipments={shipments} />
        
        {/* Floating Legend */}
        <div className="absolute bottom-8 left-8 z-[1000] space-y-2">
           <div className="glass-card bg-slate-900/60 border-white/10 p-4 rounded-2xl backdrop-blur-xl">
             <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-3">Live Legend</h4>
             <div className="space-y-3">
               <div className="flex items-center gap-3">
                 <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                 <span className="text-[10px] font-bold text-white/60 uppercase">Available Driver</span>
               </div>
               <div className="flex items-center gap-3">
                 <div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                 <span className="text-[10px] font-bold text-white/60 uppercase">Busy / En-Route</span>
               </div>
               <div className="flex items-center gap-3">
                 <div className="w-3 h-3 rounded-full bg-primary shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                 <span className="text-[10px] font-bold text-white/60 uppercase">Package (Pickup/Drop)</span>
               </div>
             </div>
           </div>
        </div>

        {/* Sidebar Info - Orders List */}
        <div className="absolute top-8 right-8 z-[1000] hidden lg:block w-72">
          <div className="glass-card bg-slate-900/60 border-white/10 p-0 rounded-3xl backdrop-blur-xl max-h-[70vh] flex flex-col">
            <div className="p-5 border-b border-white/5">
              <h3 className="text-xs font-black text-white uppercase tracking-widest">Active Streams</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {shipments.map(s => (
                <div key={s.id} className="p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-[10px] font-black text-white uppercase tracking-tighter">{s.trackingNumber}</p>
                    <span className="text-[8px] font-black text-primary uppercase">{s.status.replace('_', ' ')}</span>
                  </div>
                  <p className="text-[10px] font-medium text-white/40 truncate">{s.receiverAddress}</p>
                </div>
              ))}
              {shipments.length === 0 && <p className="text-[10px] text-white/20 text-center py-10 italic tracking-widest">No active shipments in transit</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
