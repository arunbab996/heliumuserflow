import { useParams, useNavigate, Link } from 'react-router-dom'
import { CheckCircle, Home, Phone, Calendar, ChevronRight } from 'lucide-react'
import Navbar from '../components/Navbar'
import { LISTINGS, formatRentFull } from '../data/listings'

const STEPS = [
  { done: true, label: 'Tour booked', sub: 'Visit confirmed' },
  { done: true, label: 'Deposit Saver activated', sub: 'Fintree Finance approved' },
  { done: true, label: 'Lease agreement signed', sub: 'Digital signature complete' },
  { done: false, label: 'Keys handed over', sub: 'Scheduled for move-in day', active: true },
]

export default function MoveInPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const listing = LISTINGS.find(l => l.id === Number(id))

  if (!listing) return null

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar variant="detail" />

      <div className="max-w-lg mx-auto px-4 py-10">
        {/* Celebration header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-teal-50 flex items-center justify-center mx-auto mb-4">
            <Home size={36} className="text-teal-600" />
          </div>
          <h1 className="text-2xl font-bold text-stone-900">You're all set, Arun! 🎉</h1>
          <p className="text-sm text-stone-500 mt-2 leading-relaxed">
            Your new home is ready. Here's your move-in summary.
          </p>
        </div>

        {/* Property card */}
        <div className="bg-white border border-stone-100 rounded-2xl overflow-hidden mb-6">
          <img src={listing.images[0]} alt="" className="w-full h-40 object-cover" />
          <div className="p-5">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold tracking-widest text-teal-600 uppercase">Your new home</span>
              <CheckCircle size={12} className="text-teal-600" />
            </div>
            <h3 className="font-semibold text-stone-900">{listing.name}</h3>
            <p className="text-sm text-stone-500 mt-0.5">{listing.bhk} · {listing.sqft.toLocaleString()} sqft · {listing.location}</p>
            <p className="text-lg font-bold text-stone-900 mt-2">{formatRentFull(listing.rent)}<span className="text-sm font-normal text-stone-500">/month</span></p>
          </div>
        </div>

        {/* Journey steps */}
        <div className="bg-white border border-stone-100 rounded-2xl p-5 mb-6">
          <h3 className="text-sm font-semibold text-stone-900 mb-4">Your journey</h3>
          <div className="space-y-4">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  s.done ? 'bg-teal-600' : s.active ? 'bg-stone-900 ring-2 ring-stone-200' : 'bg-stone-100'
                }`}>
                  {s.done
                    ? <CheckCircle size={12} className="text-white" />
                    : <span className="w-2 h-2 rounded-full bg-stone-400" />
                  }
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${s.done ? 'text-stone-900' : s.active ? 'text-stone-900' : 'text-stone-400'}`}>{s.label}</p>
                  <p className="text-xs text-stone-400 mt-0.5">{s.sub}</p>
                </div>
                {s.done && <CheckCircle size={14} className="text-teal-400 shrink-0 mt-0.5" />}
              </div>
            ))}
          </div>
        </div>

        {/* Deposit Saver summary */}
        <div className="bg-teal-50 border border-teal-100 rounded-2xl p-5 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-teal-800 uppercase tracking-wide mb-1">Deposit Saver Active</p>
              <p className="text-sm text-teal-700">You paid <strong>{formatRentFull(listing.depositSaverAmount)}</strong> instead of <strong>{formatRentFull(listing.priceBreakdown.deposit)}</strong></p>
              <p className="text-xs text-teal-600 mt-1">You saved <strong>{formatRentFull(listing.priceBreakdown.deposit - listing.depositSaverAmount)}</strong> upfront</p>
            </div>
            <div className="bg-teal-600 text-white text-[10px] font-bold px-2 py-1 rounded-full tracking-wide">ACTIVE</div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button className="w-full flex items-center justify-between bg-white border border-stone-100 rounded-2xl px-5 py-4 hover:border-stone-300 transition-colors">
            <div className="flex items-center gap-3">
              <Phone size={16} className="text-teal-600" />
              <div className="text-left">
                <p className="text-sm font-medium text-stone-900">Talk to your Helium agent</p>
                <p className="text-xs text-stone-400">Priya Kumar · Available now</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-stone-300" />
          </button>

          <button className="w-full flex items-center justify-between bg-white border border-stone-100 rounded-2xl px-5 py-4 hover:border-stone-300 transition-colors">
            <div className="flex items-center gap-3">
              <Calendar size={16} className="text-teal-600" />
              <div className="text-left">
                <p className="text-sm font-medium text-stone-900">Add move-in to calendar</p>
                <p className="text-xs text-stone-400">Get a reminder 2 days before</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-stone-300" />
          </button>
        </div>

        <div className="mt-8 text-center">
          <Link to="/" className="text-sm text-stone-400 hover:text-stone-600 underline-offset-2 underline">
            Browse more homes
          </Link>
        </div>
      </div>
    </div>
  )
}
