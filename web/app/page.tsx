import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      <header className="bg-white/80 backdrop-blur-md border-b border-blue-100 shadow-sm sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
              </svg>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-700 to-teal-600 bg-clip-text text-transparent">SmartLogix</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/track" className="text-sm font-medium text-blue-700 hover:text-blue-900 hover:bg-blue-50 px-3 py-2 rounded-lg transition-all">
              Track Shipment
            </Link>
            <Link href="/login" className="rounded-lg bg-gradient-to-r from-blue-600 to-teal-500 px-5 py-2.5 text-sm font-semibold text-white hover:shadow-lg hover:scale-105 transition-all">
              Sign In
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-32 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-200 px-4 py-1.5 mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-sm font-medium text-blue-800">Now delivering across Greater Accra</span>
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Smart Logistics for{" "}
            <span className="bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-500 bg-clip-text text-transparent">
              Modern Business
            </span>
          </h1>
          <p className="mt-8 text-lg sm:text-xl leading-relaxed text-slate-600 max-w-3xl mx-auto">
            From real-time tracking to intelligent driver assignment, streamline your entire delivery workflow. Ship smarter, deliver faster, grow bigger.
          </p>
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 px-8 py-4 text-base font-bold text-white hover:shadow-2xl hover:scale-105 transition-all shadow-lg">
              Get Started Free
            </Link>
            <Link href="/track" className="w-full sm:w-auto rounded-xl border-2 border-blue-200 bg-white px-8 py-4 text-base font-bold text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-all">
              Track a Shipment
            </Link>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="bg-white border-y border-blue-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <p className="text-3xl sm:text-4xl font-extrabold text-blue-600">15K+</p>
                <p className="mt-1 text-sm font-medium text-slate-500">Deliveries Made</p>
              </div>
              <div>
                <p className="text-3xl sm:text-4xl font-extrabold text-teal-500">98%</p>
                <p className="mt-1 text-sm font-medium text-slate-500">On-Time Rate</p>
              </div>
              <div>
                <p className="text-3xl sm:text-4xl font-extrabold text-emerald-500">200+</p>
                <p className="mt-1 text-sm font-medium text-slate-500">Active Drivers</p>
              </div>
              <div>
                <p className="text-3xl sm:text-4xl font-extrabold text-amber-500">4.9</p>
                <p className="mt-1 text-sm font-medium text-slate-500">Customer Rating</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">Everything you need to deliver</h2>
            <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">Powerful tools for customers, dispatchers, and drivers — all in one platform.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group rounded-2xl bg-white border border-blue-100 p-8 hover:shadow-xl hover:border-blue-300 transition-all hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900">Real-time Tracking</h3>
              <p className="mt-3 text-slate-500 leading-relaxed">Follow every package from pickup to delivery with live GPS updates and instant status notifications.</p>
            </div>

            <div className="group rounded-2xl bg-white border border-teal-100 p-8 hover:shadow-xl hover:border-teal-300 transition-all hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900">Smart Dispatch</h3>
              <p className="mt-3 text-slate-500 leading-relaxed">AI-powered driver matching gets your packages moving faster. Auto-assign the nearest available driver instantly.</p>
            </div>

            <div className="group rounded-2xl bg-white border border-amber-100 p-8 hover:shadow-xl hover:border-amber-300 transition-all hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900">Proof of Delivery</h3>
              <p className="mt-3 text-slate-500 leading-relaxed">Capture photos, signatures, and timestamps for every delivery. Full audit trail for complete peace of mind.</p>
            </div>
          </div>
        </section>

        {/* Demo Dashboard Preview */}
        <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white">Powerful dashboards for every role</h2>
                <p className="mt-6 text-lg text-blue-200 leading-relaxed">Whether you are a customer shipping packages, a dispatcher managing operations, or a driver on the road — SmartLogix gives you the tools you need.</p>
                <div className="mt-10 space-y-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">1</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white">Customers</h4>
                      <p className="text-blue-200">Create shipments, track deliveries, and manage your shipping history.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-teal-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">2</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white">Dispatchers</h4>
                      <p className="text-blue-200">Assign drivers, monitor fleet, and view real-time analytics.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">3</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white">Drivers</h4>
                      <p className="text-blue-200">View assigned jobs, update delivery status, and capture proof of delivery.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-2xl p-6 space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-teal-400"></div>
                    <div>
                      <p className="font-bold text-slate-900">Dispatcher Dashboard</p>
                      <p className="text-sm text-slate-500">Accra HQ</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">Live</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-xl p-4">
                    <p className="text-sm text-blue-600 font-medium">Today&apos;s Shipments</p>
                    <p className="text-2xl font-extrabold text-blue-900">24</p>
                  </div>
                  <div className="bg-teal-50 rounded-xl p-4">
                    <p className="text-sm text-teal-600 font-medium">Active Drivers</p>
                    <p className="text-2xl font-extrabold text-teal-900">18</p>
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-4">
                    <p className="text-sm text-emerald-600 font-medium">Delivered</p>
                    <p className="text-2xl font-extrabold text-emerald-900">156</p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-4">
                    <p className="text-sm text-amber-600 font-medium">Revenue</p>
                    <p className="text-2xl font-extrabold text-amber-900">GHS 4.2K</p>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm font-medium text-slate-700">SLX-20260426-A1B2</span>
                    <span className="ml-auto px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">Delivered</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-teal-500"></div>
                    <span className="text-sm font-medium text-slate-700">SLX-20260426-C3D4</span>
                    <span className="ml-auto px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">In Transit</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
          <div className="rounded-3xl bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-500 px-8 py-16 text-center shadow-2xl">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Ready to streamline your logistics?</h2>
            <p className="mt-4 text-lg text-blue-100 max-w-xl mx-auto">Join thousands of businesses using SmartLogix to power their deliveries.</p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register" className="w-full sm:w-auto rounded-xl bg-white px-8 py-4 text-base font-bold text-blue-700 hover:bg-blue-50 hover:shadow-xl transition-all shadow-lg">
                Create Free Account
              </Link>
              <Link href="/login" className="w-full sm:w-auto rounded-xl border-2 border-white/50 px-8 py-4 text-base font-bold text-white hover:bg-white/10 transition-all">
                Sign In
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 text-slate-400">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                  </svg>
                </div>
                <span className="text-lg font-bold text-white">SmartLogix</span>
              </div>
              <p className="text-sm max-w-xs">Ghana&apos;s smartest logistics platform. Real-time tracking, smart dispatch, and seamless delivery management.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/track" className="hover:text-white transition-colors">Track Shipment</Link></li>
                <li><Link href="/register" className="hover:text-white transition-colors">Get Started</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Demo Accounts</h4>
              <ul className="space-y-2 text-sm">
                <li>admin@smartlogix.com</li>
                <li>dispatcher@smartlogix.com</li>
                <li>customer1@demo.com</li>
                <li className="text-slate-500 text-xs mt-2">Password: {`{role}`}123</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-slate-800 text-center text-sm">
            SmartLogix Logistics Platform. Built for modern delivery management.
          </div>
        </div>
      </footer>
    </div>
  );
}

