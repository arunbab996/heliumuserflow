import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle, Zap, Shield, CreditCard } from 'lucide-react'
import Navbar from '../components/Navbar'

const STEPS = [
  { icon: '🏡', title: 'Find your home', desc: 'Browse our curated listings and pick a home you love.' },
  { icon: '⚡', title: 'Activate Deposit Saver', desc: 'Apply for Deposit Saver. Takes 5 minutes. No paperwork.' },
  { icon: '✅', title: 'Instant approval', desc: 'Our NBFC partner Fintree Finance approves you instantly.' },
  { icon: '🔑', title: 'Move in for 1 month', desc: 'Pay just 1 month\'s rent as deposit. We cover the rest.' },
]

const COMPARISONS = [
  { label: 'Deposit required', traditional: '5 to 6 months rent', helium: '1 month rent' },
  { label: 'Upfront cash blocked', traditional: '2 to 4 Lakhs', helium: '38K to 75K' },
  { label: 'Processing time', traditional: 'Immediate payment', helium: '5 minutes online' },
  { label: 'Refund timeline', traditional: '30 to 60 days after exit', helium: 'Standard process' },
]

export default function DepositSaverPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar variant="detail" />

      <div className="max-w-2xl mx-auto px-4 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 mb-8">
          <ArrowLeft size={14} /> Back
        </button>

        {/* Hero */}
        <div className="bg-teal-600 rounded-3xl p-8 text-white mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <p className="text-xs font-bold tracking-widest uppercase opacity-70 mb-2">Deposit Saver</p>
          <h1 className="text-3xl font-bold leading-tight mb-3">
            Move in for just<br />
            <span className="text-4xl">1 month's rent</span>
          </h1>
          <p className="text-sm opacity-80 leading-relaxed">
            Stop blocking 5 to 6 months of savings as deposit. With Deposit Saver, you pay just 1 month's rent upfront. We work with Fintree Finance to cover the rest.
          </p>
        </div>

        {/* How it works */}
        <h2 className="text-base font-semibold text-stone-900 mb-4">How it works</h2>
        <div className="space-y-3 mb-8">
          {STEPS.map((s, i) => (
            <div key={i} className="bg-white border border-stone-100 rounded-2xl px-5 py-4 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center text-xl shrink-0">
                {s.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-stone-900">{s.title}</p>
                <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Comparison table */}
        <h2 className="text-base font-semibold text-stone-900 mb-4">Traditional deposit vs Deposit Saver</h2>
        <div className="bg-white border border-stone-100 rounded-2xl overflow-hidden mb-8">
          <div className="grid grid-cols-3 bg-stone-50 px-5 py-3 border-b border-stone-100">
            <span className="text-xs font-semibold text-stone-500" />
            <span className="text-xs font-semibold text-stone-500 text-center">Traditional</span>
            <span className="text-xs font-semibold text-teal-600 text-center">With Helium</span>
          </div>
          {COMPARISONS.map((r, i) => (
            <div key={i} className="grid grid-cols-3 px-5 py-4 border-b border-stone-50 last:border-0">
              <span className="text-xs text-stone-500">{r.label}</span>
              <span className="text-xs text-stone-400 text-center line-through">{r.traditional}</span>
              <span className="text-xs font-semibold text-teal-700 text-center">{r.helium}</span>
            </div>
          ))}
        </div>

        {/* Trust signals */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <TrustCard icon={<Shield size={18} className="text-teal-600" />} label="NBFC Backed" sub="Fintree Finance" />
          <TrustCard icon={<Zap size={18} className="text-teal-600" />} label="5 Min Approval" sub="Instant online" />
          <TrustCard icon={<CreditCard size={18} className="text-teal-600" />} label="No Hidden Fees" sub="Transparent pricing" />
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate('/')}
          className="w-full py-4 bg-teal-600 text-white text-sm font-semibold rounded-2xl hover:bg-teal-700 transition-colors"
        >
          Browse homes with Deposit Saver →
        </button>
      </div>
    </div>
  )
}

function TrustCard({ icon, label, sub }) {
  return (
    <div className="bg-white border border-stone-100 rounded-2xl p-4 flex flex-col items-center text-center gap-2">
      {icon}
      <p className="text-xs font-semibold text-stone-900">{label}</p>
      <p className="text-[10px] text-stone-400">{sub}</p>
    </div>
  )
}
