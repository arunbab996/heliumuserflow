import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, Clock, CheckCircle } from 'lucide-react'
import Navbar from '../components/Navbar'
import { LISTINGS, formatRentFull } from '../data/listings'

const DATES = (() => {
  const days = []
  const today = new Date()
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  for (let i = 0; i < 7; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    days.push({
      dayName: i === 0 ? 'Today' : dayNames[d.getDay()],
      date: d.getDate(),
      month: monthNames[d.getMonth()],
      full: d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }),
    })
  }
  return days
})()

const TIMES = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM']

export default function TourBookingPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const listing = LISTINGS.find(l => l.id === Number(id))
  const [selectedDate, setSelectedDate] = useState(0)
  const [selectedTime, setSelectedTime] = useState(null)
  const [step, setStep] = useState(1) // 1 = pick date/time, 2 = confirm

  if (!listing) return null

  const handleBook = () => {
    if (!selectedTime) return
    setStep(2)
    setTimeout(() => navigate(`/move-in/${listing.id}`), 2200)
  }

  if (step === 2) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center px-6">
          <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-teal-600" />
          </div>
          <h2 className="text-xl font-semibold text-stone-900">Tour Booked!</h2>
          <p className="text-sm text-stone-500 mt-2">
            {DATES[selectedDate].full} at {selectedTime}
          </p>
          <p className="text-xs text-stone-400 mt-4">You'll receive a confirmation on WhatsApp</p>
          <div className="mt-3 flex justify-center">
            <span className="inline-block w-6 h-1 rounded bg-teal-200 animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar variant="detail" />

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Back */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 mb-6">
          <ArrowLeft size={14} /> Back
        </button>

        {/* Property summary */}
        <div className="bg-white rounded-2xl border border-stone-100 p-4 flex gap-4 mb-8">
          <img
            src={listing.images[0]}
            alt=""
            className="w-20 h-20 rounded-xl object-cover shrink-0"
          />
          <div>
            <p className="text-xs text-stone-400 mb-0.5">{listing.location}</p>
            <h3 className="text-sm font-semibold text-stone-900 leading-snug">{listing.name}</h3>
            <p className="text-sm mt-1">
              <span className="font-bold text-stone-900">{formatRentFull(listing.rent)}/mo</span>
              <span className="text-stone-400 text-xs ml-1.5">{listing.bhk} · {listing.sqft.toLocaleString()} sqft</span>
            </p>
          </div>
        </div>

        <h2 className="text-lg font-semibold text-stone-900 mb-5">Book an Instant Visit</h2>

        {/* Date picker */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm font-medium text-stone-700 mb-3">
            <Calendar size={15} className="text-teal-600" />
            Select a date
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {DATES.map((d, i) => (
              <button
                key={i}
                onClick={() => setSelectedDate(i)}
                className={`shrink-0 flex flex-col items-center px-4 py-3 rounded-xl border text-sm transition-all ${
                  selectedDate === i
                    ? 'bg-stone-900 border-stone-900 text-white'
                    : 'bg-white border-stone-200 text-stone-700 hover:border-stone-400'
                }`}
              >
                <span className="text-[10px] uppercase tracking-wide font-medium opacity-70">{d.dayName}</span>
                <span className="text-lg font-bold mt-0.5">{d.date}</span>
                <span className="text-[10px] opacity-70">{d.month}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Time picker */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm font-medium text-stone-700 mb-3">
            <Clock size={15} className="text-teal-600" />
            Select a time
          </div>
          <div className="grid grid-cols-3 gap-2">
            {TIMES.map(t => (
              <button
                key={t}
                onClick={() => setSelectedTime(t)}
                className={`py-2.5 px-3 rounded-xl border text-sm transition-all ${
                  selectedTime === t
                    ? 'bg-stone-900 border-stone-900 text-white'
                    : 'bg-white border-stone-200 text-stone-700 hover:border-stone-400'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Info strip */}
        <div className="bg-teal-50 border border-teal-100 rounded-xl px-4 py-3 text-xs text-teal-700 mb-6">
          ✓ No broker involved · ✓ Keys available instantly · ✓ Helium agent will be present
        </div>

        {/* CTA */}
        <button
          onClick={handleBook}
          disabled={!selectedTime}
          className={`w-full py-4 rounded-2xl text-sm font-semibold transition-all ${
            selectedTime
              ? 'bg-stone-900 text-white hover:bg-stone-800'
              : 'bg-stone-100 text-stone-400 cursor-not-allowed'
          }`}
        >
          {selectedTime ? `Confirm Visit: ${DATES[selectedDate].full}, ${selectedTime}` : 'Select a time to continue'}
        </button>
      </div>
    </div>
  )
}
