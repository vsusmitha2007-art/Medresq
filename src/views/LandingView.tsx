import React from 'react';
import {
  ShieldCheck,
  MapPin,
  Building2,
  Ambulance,
  QrCode,
  ArrowRight,
  Activity,
  HeartPulse,
  Lock,
  Clock,
  Compass,
} from 'lucide-react';
import heroNetworkImg from '../assets/images/emergency_hero_network_1791209408824.jpg';

interface LandingViewProps {
  onEnterApp: () => void;
  onOpenLogin: () => void;
  onScanQR: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onEnterApp,
  onOpenLogin,
  onScanQR,
}) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white shadow-sm">
              <HeartPulse className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">
              Emergency<span className="text-rose-600">Link</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
            <a href="#network" className="hover:text-slate-900 transition-colors">Architecture</a>
            <a href="#security" className="hover:text-slate-900 transition-colors">Security</a>
            <a href="#hospitals" className="hover:text-slate-900 transition-colors">Hospitals</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onOpenLogin}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={onEnterApp}
              className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors pulse-emergency"
            >
              Emergency Access
            </button>
          </div>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="flex-1">
        <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden border-b border-slate-200/80 bg-gradient-to-b from-white to-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Content */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
                  Location-Aware Emergency Patient & Hospital Resource Platform
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 text-balance leading-tight">
                  Emergency Response, <span className="text-rose-600">Connected.</span>
                </h1>

                <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
                  Securely connect patients, emergency personnel, hospitals, locations and critical resources when every second matters. Real-time patient identification, GPS coordinates, ICU bed tracking, and ambulance dispatch.
                </p>

                {/* Primary & Secondary Buttons */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <button
                    type="button"
                    onClick={onEnterApp}
                    className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-lg shadow-rose-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span>Emergency Access</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={onScanQR}
                    className="flex items-center gap-2 px-5 py-3 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-sm transition-all"
                  >
                    <QrCode className="w-4 h-4 text-blue-600" />
                    <span>Scan Patient QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={onOpenLogin}
                    className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    Explore Platform
                  </button>
                </div>

                {/* Quantitative Adjacency Proof */}
                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200">
                  <div>
                    <div className="text-2xl font-extrabold text-slate-900 font-mono" data-tabular>
                      &lt; 4.2s
                    </div>
                    <div className="text-xs text-slate-500">Patient QR ID & Triage Access</div>
                  </div>
                  <div>
                    <div className="text-2xl font-extrabold text-emerald-600 font-mono" data-tabular>
                      100%
                    </div>
                    <div className="text-xs text-slate-500">Live Hospital Resource Visibility</div>
                  </div>
                  <div>
                    <div className="text-2xl font-extrabold text-blue-600 font-mono" data-tabular>
                      Zero
                    </div>
                    <div className="text-xs text-slate-500">Unlogged Medical Access Events</div>
                  </div>
                </div>
              </div>

              {/* Right Hero Visual: Emergency Network Visualization & Hero Image */}
              <div className="lg:col-span-5">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200 bg-slate-900">
                  {/* Generated Image with CSS Fallback */}
                  <img
                    src={heroNetworkImg}
                    alt="EmergencyLink Coordination Center"
                    referrerPolicy="no-referrer"
                    className="w-full h-64 sm:h-72 object-cover opacity-90"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />

                  {/* Overlaid HTML/SVG Emergency Network Flow */}
                  <div className="p-5 bg-gradient-to-t from-slate-950 via-slate-900/95 to-slate-900/80 text-white">
                    <div className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-3 flex items-center justify-between">
                      <span>Real-Time Emergency Stream</span>
                      <span className="flex items-center gap-1 text-emerald-400 text-[10px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                        ONLINE
                      </span>
                    </div>

                    {/* SVG / HTML Emergency Chain */}
                    <div className="space-y-2.5 text-xs">
                      <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/10">
                        <div className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-[10px]">
                          1
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-slate-200">Patient Identified</div>
                          <div className="text-[10px] text-slate-400">Eleanor Vance (P1001) · QR Token Authenticated</div>
                        </div>
                        <QrCode className="w-4 h-4 text-rose-400" />
                      </div>

                      <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/10">
                        <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[10px]">
                          2
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-slate-200">HTML5 Geolocation</div>
                          <div className="text-[10px] text-slate-400">Lat 47.6101, Lon -122.3364 (±8m accuracy)</div>
                        </div>
                        <MapPin className="w-4 h-4 text-blue-400" />
                      </div>

                      <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/10">
                        <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px]">
                          3
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-slate-200">Hospital Matching Engine</div>
                          <div className="text-[10px] text-slate-400">Metro General Trauma Center · 7 ICU beds available</div>
                        </div>
                        <Building2 className="w-4 h-4 text-amber-400" />
                      </div>

                      <div className="flex items-center gap-3 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                          4
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-emerald-200">Ambulance AMB-101 Dispatched</div>
                          <div className="text-[10px] text-emerald-400">ALS Unit En Route · ETA 3 mins</div>
                        </div>
                        <Ambulance className="w-4 h-4 text-emerald-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Cards Section */}
        <section id="features" className="py-16 md:py-24 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold text-rose-600 uppercase tracking-wider block mb-2">
                Unified Emergency Infrastructure
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl text-balance">
                Built for Faster Emergency Decisions
              </h2>
              <p className="mt-4 text-base text-slate-600 leading-relaxed">
                Every component is structured for rapid triage, strict HIPAA/audit compliance, and zero latency in life-or-death workflows.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Feature 1 */}
              <article className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5 border border-blue-100">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Secure Patient Information
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Instant, permission-gated access to critical allergies, chronic conditions, current medications, and primary emergency contacts without exposing full records.
                </p>
              </article>

              {/* Feature 2 */}
              <article className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-5 border border-rose-100">
                  <MapPin className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Location Intelligence
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  HTML5 Web Geolocation API locks GPS coordinates, calculates transit times, and renders interactive Leaflet maps with custom SVG emergency overlays.
                </p>
              </article>

              {/* Feature 3 */}
              <article className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-5 border border-amber-100">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Hospital Resource Matching
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Transparent rule-based ranking engine evaluates real-time ICU beds, ventilators, blood bank supply, and ambulance standby before destination selection.
                </p>
              </article>

              {/* Feature 4 */}
              <article className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5 border border-emerald-100">
                  <Activity className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Emergency Coordination
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Full status progression pipeline from initial call to hospital arrival with immutable audit trail logging every interaction and permission check.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* Security & Audit Proof Section */}
        <section id="security" className="py-16 md:py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-slate-900 text-white p-8 md:p-12 shadow-xl border border-slate-800">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-8 space-y-4">
                  <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block">
                    Security First Architecture
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    Zero Medical Data in QR Codes. 100% Append-Only Audit Logging.
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
                    Patient QR codes contain only safe, cryptographically randomized tokens. Every scan, profile inspection, and resource edit is captured with user ID, role, IP address, and timestamp in tamper-evident logs.
                  </p>
                  <div className="flex flex-wrap gap-4 pt-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Lock className="w-4 h-4 text-emerald-400" />
                      Role-Based Access Control (RBAC)
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-blue-400" />
                      Real-time Geolocation Locking
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Compass className="w-4 h-4 text-amber-400" />
                      Transparent Resource Matching
                    </span>
                  </div>
                </div>

                <div className="lg:col-span-4 flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={onEnterApp}
                    className="w-full py-3.5 px-6 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm text-center shadow-lg transition-colors"
                  >
                    Open Live Emergency Demo
                  </button>
                  <button
                    type="button"
                    onClick={onOpenLogin}
                    className="w-full py-3 px-6 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs text-center border border-white/20 transition-colors"
                  >
                    Sign in with Demo Roles
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded bg-rose-600 flex items-center justify-center text-white font-bold text-xs">
                EL
              </div>
              <span className="font-bold text-sm text-slate-900">EmergencyLink</span>
              <span className="text-slate-400 text-xs">·</span>
              <span className="text-xs text-slate-500">Location-Aware Emergency Healthcare Platform</span>
            </div>

            <nav className="flex items-center gap-6 text-xs text-slate-600 font-medium">
              <a href="#privacy" onClick={(e) => { e.preventDefault(); }} className="hover:text-slate-900 transition-colors">Privacy</a>
              <a href="#security" onClick={(e) => { e.preventDefault(); }} className="hover:text-slate-900 transition-colors">Security</a>
              <a href="#contact" onClick={(e) => { e.preventDefault(); }} className="hover:text-slate-900 transition-colors">Contact</a>
              <button onClick={onEnterApp} className="text-rose-600 hover:text-rose-700 font-bold">
                Interactive Demo
              </button>
            </nav>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-400">
            © 2026 EmergencyLink Systems. Built for emergency response teams and hospital networks. Synthetic demo data only.
          </div>
        </div>
      </footer>
    </div>
  );
};
