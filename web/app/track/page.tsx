"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { trackShipment } from "@/lib/api";

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
  estimatedDeliveryTime: string | null;
  actualDeliveryTime: string | null;
  createdAt: string;
  statusLogs: Array<{
    id: string;
    status: string;
    timestamp: string;
    note: string | null;
    lat: number | null;
    lng: number | null;
  }>;
}

export default function TrackPage() {
  const { data: session } = useSession();
  const [trackingNumber, setTrackingNumber] = useState("");
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleTrack(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setShipment(null);

    try {
      const data = await trackShipment(session?.token as string || "", trackingNumber);
      setShipment(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Tracking failed");
    } finally {
      setLoading(false);
    }
  }

  const statusColors: Record<string, string> = {
    created: "bg-zinc-100 text-zinc-700",
    assigned: "bg-blue-100 text-blue-700",
    picked_up: "bg-yellow-100 text-yellow-700",
    in_transit: "bg-orange-100 text-orange-700",
    out_for_delivery: "bg-purple-100 text-purple-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };

  const statusOrder = ["created", "assigned", "picked_up", "in_transit", "out_for_delivery", "delivered"];

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="bg-white border-b border-zinc-200">
        <div className="mx-auto max-w-3xl px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-zinc-900">SmartLogix</h1>
            <p className="text-sm text-zinc-500">Track Shipment</p>
          </div>
          <Link href="/" className="text-sm text-zinc-600 hover:text-zinc-900">
            Home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <form onSubmit={handleTrack} className="flex gap-2 mb-8">
          <input
            type="text"
            placeholder="Enter tracking number (e.g. SLX-20260426-XXXX)"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            className="flex-1 rounded-lg border border-zinc-300 px-4 py-2.5 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
          />
          <button
            type="submit"
            disabled={loading || !trackingNumber}
            className="rounded-lg bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Tracking..." : "Track"}
          </button>
        </form>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-200">{error}</div>
        )}

        {shipment && (
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">Tracking Number</p>
                <p className="text-lg font-bold text-zinc-900">{shipment.trackingNumber}</p>
              </div>
              <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${statusColors[shipment.status] || "bg-zinc-100 text-zinc-700"}`}>
                {shipment.status.replace(/_/g, " ")}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg bg-zinc-50 p-4">
                <p className="text-xs font-medium text-zinc-400 uppercase">From</p>
                <p className="text-sm font-medium text-zinc-900">{shipment.senderName}</p>
                <p className="text-xs text-zinc-500">{shipment.senderAddress}</p>
              </div>
              <div className="rounded-lg bg-zinc-50 p-4">
                <p className="text-xs font-medium text-zinc-400 uppercase">To</p>
                <p className="text-sm font-medium text-zinc-900">{shipment.receiverName}</p>
                <p className="text-xs text-zinc-500">{shipment.receiverAddress}</p>
              </div>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Weight: {shipment.weightKg} kg</span>
              <span className="text-zinc-500">Price: GHS {shipment.quotedPrice?.toFixed(2)}</span>
            </div>

            {shipment.estimatedDeliveryTime && (
              <p className="text-sm text-zinc-600">
                Estimated delivery: {new Date(shipment.estimatedDeliveryTime).toLocaleDateString()}
              </p>
            )}

            {shipment.statusLogs && shipment.statusLogs.length > 0 && (
              <div className="border-t border-zinc-200 pt-6">
                <h3 className="text-sm font-semibold text-zinc-900 mb-4">Tracking History</h3>
                <div className="space-y-4">
                  {shipment.statusLogs.map((log, index) => (
                    <div key={log.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${statusColors[log.status]?.split(" ")[0] || "bg-zinc-200"}`} />
                        {index < shipment.statusLogs.length - 1 && <div className="w-0.5 flex-1 bg-zinc-200 mt-1" />}
                      </div>
                      <div className="pb-4">
                        <p className="text-sm font-medium text-zinc-900 capitalize">{log.status.replace(/_/g, " ")}</p>
                        <p className="text-xs text-zinc-500">{new Date(log.timestamp).toLocaleString()}</p>
                        {log.note && <p className="text-xs text-zinc-400 mt-1">{log.note}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

