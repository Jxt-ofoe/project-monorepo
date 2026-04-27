"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getDriverJobs, updateShipmentStatus } from "@/lib/api";

interface Shipment {
  id: string;
  trackingNumber: string;
  status: string;
  senderName: string;
  senderAddress: string;
  receiverName: string;
  receiverAddress: string;
  pickupLat: number;
  pickupLng: number;
  deliveryLat: number;
  deliveryLng: number;
  weightKg: number;
  quotedPrice: number;
  scheduledPickupTime: string | null;
  createdAt: string;
}

export default function DriverDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [jobs, setJobs] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (session?.token) loadJobs();
  }, [session]);

  async function loadJobs() {
    try {
      setLoading(true);
      const data = await getDriverJobs(session!.token as string);
      setJobs(data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateStatus(shipmentId: string, newStatus: string) {
    try {
      await updateShipmentStatus(session!.token as string, shipmentId, {
        status: newStatus,
        lat: 5.6037,
        lng: -0.1870,
      });
      loadJobs();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Update failed");
    }
  }

  const statusColors: Record<string, string> = {
    assigned: "bg-blue-100 text-blue-700",
    picked_up: "bg-yellow-100 text-yellow-700",
    in_transit: "bg-orange-100 text-orange-700",
    out_for_delivery: "bg-purple-100 text-purple-700",
    delivered: "bg-green-100 text-green-700",
  };

  const nextStatus: Record<string, string> = {
    assigned: "picked_up",
    picked_up: "in_transit",
    in_transit: "out_for_delivery",
    out_for_delivery: "delivered",
  };

  const statusLabels: Record<string, string> = {
    assigned: "Mark as Picked Up",
    picked_up: "Mark as In Transit",
    in_transit: "Mark as Out for Delivery",
    out_for_delivery: "Mark as Delivered",
  };

  if (status === "loading") {
    return <div className="flex min-h-screen items-center justify-center"><div className="text-zinc-500">Loading...</div></div>;
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="bg-white border-b border-zinc-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-zinc-900">SmartLogix</h1>
            <p className="text-sm text-zinc-500">Driver Dashboard</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-600">{session?.user?.email}</span>
            <button onClick={() => signOut({ callbackUrl: "/" })} className="text-sm text-zinc-600 hover:text-zinc-900">Logout</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900">My Jobs</h2>
          <button onClick={loadJobs} className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800">Refresh</button>
        </div>

        {error && <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-200">{error}</div>}

        {loading ? (
          <div className="text-center text-zinc-500 py-8">Loading jobs...</div>
        ) : jobs.length === 0 ? (
          <div className="bg-white rounded-xl border border-zinc-200 p-8 text-center">
            <p className="text-zinc-500">No assigned jobs yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.map((job) => (
              <div key={job.id} className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-mono text-zinc-500">{job.trackingNumber}</span>
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[job.status] || "bg-zinc-100 text-zinc-700"}`}>
                    {job.status.replace(/_/g, " ")}
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-zinc-400 uppercase">Pickup</p>
                    <p className="text-sm text-zinc-900">{job.senderName}</p>
                    <p className="text-xs text-zinc-500">{job.senderAddress}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-zinc-400 uppercase">Delivery</p>
                    <p className="text-sm text-zinc-900">{job.receiverName}</p>
                    <p className="text-xs text-zinc-500">{job.receiverAddress}</p>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Weight: {job.weightKg} kg</span>
                    <span className="text-zinc-500">GHS {job.quotedPrice?.toFixed(2)}</span>
                  </div>
                </div>

                {nextStatus[job.status] && (
                  <button
                    onClick={() => handleUpdateStatus(job.id, nextStatus[job.status])}
                    className="mt-4 w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 transition-colors"
                  >
                    {statusLabels[job.status]}
                  </button>
                )}

                {job.status === "delivered" && (
                  <div className="mt-4 rounded-lg bg-green-50 p-3 text-center text-sm text-green-700 border border-green-200">
                    Delivered
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

