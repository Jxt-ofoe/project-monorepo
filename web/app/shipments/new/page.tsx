"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createShipment, calculateQuote, initializePayment } from "@/lib/api";
import { StepIndicator } from "@/components/ui/StepIndicator";
import { PriceCard } from "@/components/ui/PriceCard";

export default function NewShipmentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [quote, setQuote] = useState<any>(null);

  const [form, setForm] = useState({
    senderName: "",
    senderPhone: "",
    senderAddress: "",
    pickupLat: "5.6037", // Default to Accra
    pickupLng: "-0.1870",
    receiverName: "",
    receiverPhone: "",
    receiverAddress: "",
    deliveryLat: "5.6037",
    deliveryLng: "-0.1870",
    weightKg: "1.0",
    packageType: "parcel",
    priority: "standard",
    description: "",
    specialInstructions: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  const steps = ["Participants", "Logistics", "Cargo", "Quote", "Review"];

  async function nextStep() {
    if (step === 3) {
      // Before going to quote step, fetch the quote
      await handleCalculateQuote();
    }
    setStep(s => Math.min(s + 1, steps.length));
    window.scrollTo(0, 0);
  }

  function prevStep() {
    setStep(s => Math.max(s - 1, 1));
    window.scrollTo(0, 0);
  }

  async function handleCalculateQuote() {
    setLoading(true);
    setError("");
    try {
      const data = await calculateQuote(session!.token as string, {
        pickupLat: parseFloat(form.pickupLat),
        pickupLng: parseFloat(form.pickupLng),
        deliveryLat: parseFloat(form.deliveryLat),
        deliveryLng: parseFloat(form.deliveryLng),
        weightKg: parseFloat(form.weightKg),
        priority: form.priority,
      });
      setQuote(data);
    } catch (err: any) {
      setError("Could not calculate quote. Please check your locations.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    setLoading(true);
    setError("");
    try {
      const body = {
        ...form,
        pickupLat: parseFloat(form.pickupLat),
        pickupLng: parseFloat(form.pickupLng),
        deliveryLat: parseFloat(form.deliveryLat),
        deliveryLng: parseFloat(form.deliveryLng),
        weightKg: parseFloat(form.weightKg),
      };
      const createdShipment = await createShipment(session!.token as string, body);
      
      // Initialize Payment
      setSuccess("Shipment created! Redirecting to secure payment...");
      const paymentData = await initializePayment(session!.token as string, {
        email: session!.user!.email as string,
        amount: quote.total,
        metadata: {
          shipmentId: createdShipment.id,
          customerId: session!.user!.id,
        }
      });

      // Redirect to Paystack
      if (paymentData.authorization_url) {
        window.location.href = paymentData.authorization_url;
      } else {
        router.push("/dashboard/customer?status=pending_payment");
      }
    } catch (err: any) {
      setError(err.message || "Failed to book shipment");
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading") return null;

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <nav className="glass-card border-x-0 border-t-0 rounded-none mb-8">
        <div className="mx-auto max-w-3xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h1 className="text-lg font-black tracking-tighter text-secondary uppercase">New Shipment</h1>
          </div>
          <Link href="/dashboard/customer" className="text-xs font-bold text-secondary/40 hover:text-secondary uppercase tracking-widest">
            Exit Wizard
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-2xl px-4 pb-20">
        <StepIndicator currentStep={step} totalSteps={steps.length} steps={steps} />

        <div className="mt-10 animate-fade-in">
          {error && <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-sm font-bold">{error}</div>}
          {success && <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-500 text-sm font-bold">{success}</div>}

          {/* STEP 1: PARTICIPANTS */}
          {step === 1 && (
            <div className="space-y-8">
              <section>
                <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-4">Sender Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-secondary/40 uppercase ml-1">Full Name</label>
                    <input value={form.senderName} onChange={e => setForm({...form, senderName: e.target.value})} className="w-full bg-secondary/5 border border-border rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="e.g. John Doe" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-secondary/40 uppercase ml-1">Contact Phone</label>
                    <input value={form.senderPhone} onChange={e => setForm({...form, senderPhone: e.target.value})} className="w-full bg-secondary/5 border border-border rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="+233..." />
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-4">Receiver Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-secondary/40 uppercase ml-1">Full Name</label>
                    <input value={form.receiverName} onChange={e => setForm({...form, receiverName: e.target.value})} className="w-full bg-secondary/5 border border-border rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="e.g. Jane Smith" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-secondary/40 uppercase ml-1">Contact Phone</label>
                    <input value={form.receiverPhone} onChange={e => setForm({...form, receiverPhone: e.target.value})} className="w-full bg-secondary/5 border border-border rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="+233..." />
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* STEP 2: LOGISTICS */}
          {step === 2 && (
            <div className="space-y-8">
              <section>
                <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-4">Pickup Location</h3>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-secondary/40 uppercase ml-1">Pickup Address</label>
                    <input value={form.senderAddress} onChange={e => setForm({...form, senderAddress: e.target.value})} className="w-full bg-secondary/5 border border-border rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="Digital Address or Landmark" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-secondary/40 uppercase ml-1">Lat</label>
                      <input type="number" step="any" value={form.pickupLat} onChange={e => setForm({...form, pickupLat: e.target.value})} className="w-full bg-secondary/5 border border-border rounded-xl px-4 py-3 text-sm outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-secondary/40 uppercase ml-1">Lng</label>
                      <input type="number" step="any" value={form.pickupLng} onChange={e => setForm({...form, pickupLng: e.target.value})} className="w-full bg-secondary/5 border border-border rounded-xl px-4 py-3 text-sm outline-none" />
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-4">Delivery Destination</h3>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-secondary/40 uppercase ml-1">Delivery Address</label>
                    <input value={form.receiverAddress} onChange={e => setForm({...form, receiverAddress: e.target.value})} className="w-full bg-secondary/5 border border-border rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="Destination Address" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-secondary/40 uppercase ml-1">Lat</label>
                      <input type="number" step="any" value={form.deliveryLat} onChange={e => setForm({...form, deliveryLat: e.target.value})} className="w-full bg-secondary/5 border border-border rounded-xl px-4 py-3 text-sm outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-secondary/40 uppercase ml-1">Lng</label>
                      <input type="number" step="any" value={form.deliveryLng} onChange={e => setForm({...form, deliveryLng: e.target.value})} className="w-full bg-secondary/5 border border-border rounded-xl px-4 py-3 text-sm outline-none" />
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* STEP 3: CARGO */}
          {step === 3 && (
            <div className="space-y-8">
              <section>
                <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-4">Shipment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-secondary/40 uppercase ml-1">Package Type</label>
                    <select value={form.packageType} onChange={e => setForm({...form, packageType: e.target.value})} className="w-full bg-secondary/5 border border-border rounded-xl px-4 py-3 text-sm outline-none">
                      <option value="parcel">Parcel</option>
                      <option value="document">Document</option>
                      <option value="fragile">Fragile Goods</option>
                      <option value="perishable">Perishable Items</option>
                      <option value="electronics">Electronics</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-secondary/40 uppercase ml-1">Weight (KG)</label>
                    <input type="number" step="0.1" value={form.weightKg} onChange={e => setForm({...form, weightKg: e.target.value})} className="w-full bg-secondary/5 border border-border rounded-xl px-4 py-3 text-sm outline-none" />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] font-black text-secondary/40 uppercase ml-1">Priority Service</label>
                    <div className="grid grid-cols-3 gap-3">
                      {['standard', 'express', 'same_day'].map(p => (
                        <button key={p} type="button" onClick={() => setForm({...form, priority: p})} className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${form.priority === p ? "bg-primary border-primary text-white amber-glow" : "bg-transparent border-border text-secondary/40 hover:border-secondary/20"}`}>
                          {p.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] font-black text-secondary/40 uppercase ml-1">Description (Optional)</label>
                    <textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full bg-secondary/5 border border-border rounded-xl px-4 py-3 text-sm outline-none" placeholder="What's inside?" />
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* STEP 4: QUOTE */}
          {step === 4 && (
            <div className="space-y-8 animate-fade-in">
              <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-4 text-center">Service Valuation</h3>
              {loading ? (
                <div className="py-20 text-center">
                  <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-[10px] font-black text-secondary/40 uppercase tracking-widest">Calculating logistics cost...</p>
                </div>
              ) : quote && (
                <PriceCard {...quote} weightKg={parseFloat(form.weightKg)} />
              )}
            </div>
          )}

          {/* STEP 5: REVIEW */}
          {step === 5 && (
            <div className="space-y-8 animate-fade-in">
              <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-4 text-center">Final Review</h3>
              <div className="glass-card rounded-2xl p-6 divide-y divide-border">
                <div className="pb-4 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-black text-secondary/40 uppercase">Route</p>
                    <p className="text-sm font-bold text-secondary">{form.senderAddress} → {form.receiverAddress}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-secondary/40 uppercase">Receiver</p>
                    <p className="text-sm font-bold text-secondary">{form.receiverName}</p>
                  </div>
                </div>
                <div className="py-4 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-black text-secondary/40 uppercase">Cargo</p>
                    <p className="text-sm font-bold text-secondary">{form.weightKg}kg {form.packageType}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-secondary/40 uppercase">Service</p>
                    <p className="text-sm font-bold text-primary uppercase tracking-widest">{form.priority}</p>
                  </div>
                </div>
                <div className="pt-4 flex justify-between items-center">
                  <p className="text-sm font-black text-secondary uppercase">Total Payable</p>
                  <p className="text-2xl font-black text-primary">GHS {quote?.total.toFixed(2)}</p>
                </div>
              </div>
              
              <div className="p-4 bg-accent/50 rounded-xl flex items-start gap-3">
                <input type="checkbox" className="mt-1" required />
                <p className="text-[10px] text-secondary/60 leading-relaxed font-medium">
                  I agree to the <span className="text-primary font-bold">Terms of Service</span> and confirm that the package does not contain prohibited items as per SmartLogix guidelines.
                </p>
              </div>
            </div>
          )}

          {/* NAVIGATION */}
          <div className="mt-12 flex gap-4">
            {step > 1 && (
              <button onClick={prevStep} className="flex-1 px-8 py-4 rounded-2xl border border-border text-xs font-black text-secondary/40 uppercase tracking-widest hover:text-secondary hover:border-secondary transition-all">
                Back
              </button>
            )}
            {step < steps.length ? (
              <button onClick={nextStep} disabled={loading} className="flex-[2] px-8 py-4 rounded-2xl bg-secondary text-white text-xs font-black uppercase tracking-widest hover:bg-secondary/90 transition-all shadow-xl">
                {loading ? "Processing..." : "Continue"}
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading} className="flex-[2] px-8 py-4 rounded-2xl bg-primary text-white text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-xl amber-glow">
                {loading ? "Booking..." : "Confirm & Book Shipment"}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
