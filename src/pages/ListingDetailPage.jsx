import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, Bookmark, Phone, Calendar,
  Zap, Wind, Volume2, Sun, ChevronRight,
  Users, Clock, CheckCircle2, Share2, MapPin, Home, Bath, Maximize2,
  Building2, Snowflake, Flame, Droplets, Car, Heart, Layers,
  Briefcase, ShoppingBag, Stethoscope, Plane, GraduationCap, UtensilsCrossed,
  Dumbbell, Waves, Play, ShoppingCart, Star, X
} from 'lucide-react'
import { LISTINGS, formatRentFull } from '../data/listings'
import MapView from '../components/MapView'
import ListingCard from '../components/ListingCard'

function richDescription(l) {
  const typeLabel = l.floors <= 2 && l.bhk.includes('4') ? 'independent villa' : l.unitFloor > 15 ? 'high-floor apartment' : 'apartment'
  const topAmenities = (l.amenities || []).slice(0, 3).join(', ')
  const floorNote = l.floors <= 2 ? 'a ground-level ' : `floor ${l.unitFloor} of ${l.floors} in `
  return `A curated ${l.bhk} ${typeLabel} inside ${l.society}. Spanning ${l.sqft.toLocaleString()} sq ft with ${l.facing.toLowerCase()} exposure, the home is ${floorNote}one of Bengaluru's most sought-after gated addresses. Verified by Helium. ${topAmenities ? `Society amenities include ${topAmenities} and more.` : ''}`
}

const QUALITY_META = {
  naturalLight: { Icon: Sun,      label: 'Natural Light',  color: '#f59e0b' },
  soundLevel:   { Icon: Volume2,  label: 'Sound Level',    color: '#0D9488' },
  airFlow:      { Icon: Wind,     label: 'Air Flow',       color: '#6366f1' },
}

// Feature icons — lucide only, no emojis
const FEATURE_ICON_MAP = {
  'Floor':          Building2,
  'Air Conditioner':Snowflake,
  'Piped Gas':      Flame,
  'Kaveri':         Droplets,
  'Balcon':         Layers,
  'Car Park':       Car,
  'Pet Friendly':   Heart,
  'Power Backup':   Zap,
  'Gym':            Dumbbell,
}
function featureIcon(f) {
  for (const [k, Icon] of Object.entries(FEATURE_ICON_MAP)) {
    if (f.toLowerCase().includes(k.toLowerCase())) return Icon
  }
  return CheckCircle2
}

// Amenity photos — high quality Unsplash
const AMENITY_PHOTOS = {
  'Swimming Pool':   'https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=400&q=80',
  'Gymnasium':       'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80',
  'Badminton Court': 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400&q=80',
  'Tennis Court':    'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400&q=80',
  'Squash Court':    'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=400&q=80',
  'Clubhouse':       'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=400&q=80',
  'Kids Play Area':  'https://images.unsplash.com/photo-1575783970733-1aaedde1db74?w=400&q=80',
  'Jogging Track':   'https://images.unsplash.com/photo-1519311965067-36d3e5f33d39?w=400&q=80',
  'Amphitheatre':    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=80',
  'Grocery Market':  'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80',
  'Co-working Space':'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80',
  'Yoga Deck':       'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80',
  'Mini Theatre':    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80',
  'Banquet Hall':    'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&q=80',
  'Basketball Court':'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&q=80',
  'Playing Ground':  'https://images.unsplash.com/photo-1575783970733-1aaedde1db74?w=400&q=80',
  'Salon':           'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&q=80',
  'ATM':             'https://images.unsplash.com/photo-1602934585418-f588bea4215c?w=400&q=80',
  'Retail Area':     'https://images.unsplash.com/photo-1555529771-7888783a18d3?w=400&q=80',
  'Prep School':     'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&q=80',
  'Pool/Billiards Table': 'https://images.unsplash.com/photo-1611095973362-88e8e2557e58?w=400&q=80',
  'Indoor Games Area':'https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=400&q=80',
}

// Neighbourhood icons — lucide only
const NEIGHBOURHOOD = [
  { Icon: Briefcase,       label: 'IT Parks',   value: 'ITPL, Prestige Tech Park, Bagmane' },
  { Icon: ShoppingBag,     label: 'Shopping',   value: 'Forum Whitefield, Phoenix Marketcity' },
  { Icon: Stethoscope,     label: 'Healthcare', value: 'Manipal Hospital, Columbia Asia' },
  { Icon: Plane,           label: 'Airport',    value: '~48 km · 45 to 60 min' },
  { Icon: GraduationCap,   label: 'Schools',    value: 'Greenwood High, Inventure Academy' },
  { Icon: UtensilsCrossed, label: 'Dining',     value: 'Whitefield Main Rd, VR Bengaluru' },
]

// ─── Society reviews (rotated by listing index) ───────────────────────────────
const REVIEW_SETS = [
  [
    { name: 'Rajesh & Priya M.', rating: 5, text: 'One of the best-managed societies in the area. Maintenance team responds within hours and common areas are always immaculate. Been here 2 years and would not move anywhere else.', date: 'Mar 2025' },
    { name: 'Siddharth V.', rating: 5, text: 'World-class amenities — pool and gym are better maintained than most premium hotels. Worth every rupee.', date: 'Jan 2025' },
    { name: 'Ananya & Karan S.', rating: 4, text: 'Superb security and a genuine sense of community. Minor parking crunches on weekends but management is actively addressing it.', date: 'Feb 2025' },
  ],
  [
    { name: 'Meera R.', rating: 5, text: 'Incredibly safe and quiet. Kids can play freely and neighbours genuinely know each other — rare in Bangalore.', date: 'Feb 2025' },
    { name: 'Vikram & Divya N.', rating: 4, text: 'Great value for this location. Society events are fun and the management committee is proactive about upkeep.', date: 'Dec 2024' },
    { name: 'Aditi T.', rating: 5, text: 'Water supply and power backup are rock solid. Not a single issue in 18 months. Highly recommended.', date: 'Mar 2025' },
  ],
  [
    { name: 'Arjun K.', rating: 4, text: 'Well-maintained compound and good security. Gym equipment is regularly upgraded. A solid, well-run community.', date: 'Jan 2025' },
    { name: 'Neha & Suresh P.', rating: 5, text: 'Lovely greenery and well-lit walkways. The society WhatsApp group is helpful and new residents are always welcomed warmly.', date: 'Feb 2025' },
    { name: 'Kiran A.', rating: 4, text: 'Clean and quiet. Committee handles complaints quickly. Perfect for working professionals who want a hassle-free home.', date: 'Nov 2024' },
  ],
]

// ─── Agents ───────────────────────────────────────────────────────────────────
const AGENTS = [
  { initials: 'PK', name: 'Priya Kumar',  color: '#0D9488', rating: 4.9, reviews: 47, responseTime: '<10 min', tours: 52, years: 4 },
  { initials: 'RM', name: 'Rajan Mehta',  color: '#6366f1', rating: 4.8, reviews: 31, responseTime: '<15 min', tours: 38, years: 3 },
  { initials: 'DN', name: 'Divya Nair',   color: '#d97706', rating: 5.0, reviews: 23, responseTime: '<5 min',  tours: 29, years: 2 },
]

// ─── What's Included — feature classification ──────────────────────────────
const ALWAYS_EXCLUDED = [
  'Internet / Broadband',
  'Society Maintenance',
]
const FEATURE_INCLUDE_MAP = [
  { key: 'Air Conditioner', label: 'Air Conditioning' },
  { key: 'Piped Gas',       label: 'Piped Gas' },
  { key: 'Kaveri',          label: 'Kaveri Water Supply' },
  { key: 'Car Park',        label: 'Covered Car Parking' },
  { key: 'Power Backup',    label: 'Power Backup' },
  { key: 'Pet Friendly',    label: 'Pet-Friendly Home' },
  { key: 'Balcon',          label: 'Private Balcony' },
  { key: 'Gym',             label: 'Gym / Fitness Centre' },
  { key: 'Swimming',        label: 'Swimming Pool Access' },
  { key: 'Modular',         label: 'Modular Kitchen' },
  { key: 'Wardrobe',        label: 'Built-in Wardrobes' },
  { key: 'Geyser',          label: 'Geyser / Water Heater' },
  { key: 'CCTV',            label: 'CCTV & Security' },
]

function deriveInclusions(features) {
  const featureStr = features.join(' ')
  const included = FEATURE_INCLUDE_MAP.filter(({ key }) =>
    featureStr.toLowerCase().includes(key.toLowerCase())
  ).map(({ label }) => label)
  const excluded = FEATURE_INCLUDE_MAP.filter(({ key }) =>
    !featureStr.toLowerCase().includes(key.toLowerCase())
  ).slice(0, 3).map(({ label }) => label).concat(ALWAYS_EXCLUDED)
  return { included, excluded }
}

// ─── Tenant profiles (by BHK) ─────────────────────────────────────────────────
const TENANT_PROFILES = {
  '4 BHK': {
    household: ['Families', 'Corporate expats'],
    pets: false,
    petNote: null,
    dietary: 'Vegetarian',
    smoking: false,
    minLease: '11 months',
    note: 'Premium property — owners prefer established families or senior professional couples. Please discuss non-veg cooking arrangements with the agent during the visit.',
  },
  '3 BHK': {
    household: ['Families', 'Working professionals'],
    pets: true,
    petNote: 'Small pets on request',
    dietary: 'No restrictions',
    smoking: false,
    minLease: '11 months',
    note: 'Owners are flexible for the right fit and open to discussing requirements during the site visit.',
  },
  '2 BHK': {
    household: ['Working professionals', 'Couples'],
    pets: false,
    petNote: null,
    dietary: 'No restrictions',
    smoking: false,
    minLease: 'Flexible (6–11 months)',
    note: 'Ideal for working professionals or young couples. Owner is easy-going and responsive on day-to-day matters.',
  },
}

// SVG arc gauge
function QualityGauge({ score, color, Icon, label }) {
  const pct = score / 10
  const r = 28
  const circ = 2 * Math.PI * r
  const dash = circ * pct
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <div className="relative w-[72px] h-[72px]">
        <svg width="72" height="72" viewBox="0 0 72 72" className="-rotate-90">
          <circle cx="36" cy="36" r={r} fill="none" stroke="#f1f0ec" strokeWidth="5" />
          <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="5"
            strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-base font-bold text-[#004449]">{score}</span>
        </div>
      </div>
      <div className="flex items-center gap-1 text-stone-500">
        <Icon size={11} />
        <span className="text-[10px] font-semibold uppercase tracking-wide">{label}</span>
      </div>
    </div>
  )
}

export default function ListingDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const listing = LISTINGS.find(l => String(l.id) === id)
  const similarHomes = LISTINGS.filter(l => l.neighborhood === listing?.neighborhood && String(l.id) !== id).slice(0, 2)
  const listingIndex = LISTINGS.findIndex(l => String(l.id) === id)
  const reviews = REVIEW_SETS[Math.max(0, listingIndex) % REVIEW_SETS.length]
  const tenantProfile = TENANT_PROFILES[listing?.bhk] || TENANT_PROFILES['2 BHK']
  const [showGallery, setShowGallery] = useState(false)
  const [activeSection, setActiveSection] = useState('Overview')
  const sectionRefs = useRef({})
  const SECTIONS = ['Overview', 'Features', 'Amenities', 'Pricing', 'Neighbourhood', 'Reviews']

  useEffect(() => { window.scrollTo(0, 0) }, [id])

  useEffect(() => {
    if (!listing) return
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.dataset.sec) }),
      { rootMargin: '-15% 0px -65% 0px' }
    )
    Object.values(sectionRefs.current).forEach(el => el && obs.observe(el))
    return () => obs.disconnect()
  }, [listing])

  const scrollTo = sec => sectionRefs.current[sec]?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  if (!listing) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F5F0]">
      <p className="text-stone-400">Listing not available.</p>
    </div>
  )

  const isAvailable = listing.status === 'available'
  const savings = listing.priceBreakdown.deposit - listing.depositSaverAmount
  const agent = AGENTS[Math.max(0, listingIndex) % AGENTS.length]
  const { included, excluded } = deriveInclusions(listing.features)
  const waMsg = encodeURIComponent(`Hi ${agent.name}, I'm interested in the ${listing.bhk} at ${listing.society}, ${listing.location} (₹${listing.rent.toLocaleString()}/mo). Can you help me schedule a visit?`)
  const waLink = `https://wa.me/919999000001?text=${waMsg}`

  return (
    <div className="min-h-screen bg-[#F7F5F0]">

      {/* ── Top nav ───────────────────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-100">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-5 md:px-8 h-14">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-stone-500 hover:text-stone-900 text-sm font-medium transition-colors">
            <ArrowLeft size={15} /> Back
          </button>
          <div className="hidden md:flex items-center gap-1">
            {SECTIONS.map(s => (
              <button key={s} onClick={() => scrollTo(s)}
                className={`shrink-0 px-3 py-1.5 text-sm rounded-lg transition-all font-medium ${activeSection === s ? 'bg-[#004449] text-white' : 'text-stone-400 hover:text-stone-700 hover:bg-stone-100'}`}>
                {s}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 transition-colors"><Share2 size={14} /></button>
            <button className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 transition-colors"><Bookmark size={14} /></button>
          </div>
        </div>
      </div>

      {/* ── Photo mosaic ─────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-5">
        <div className="grid grid-cols-4 grid-rows-2 gap-2 rounded-2xl overflow-hidden" style={{ height: 420 }}>
          <div className="col-span-3 row-span-2 relative cursor-pointer group" onClick={() => setShowGallery(true)}>
            <img src={listing.images[0]} alt="" className="w-full h-full object-cover group-hover:brightness-95 transition-all" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent" />
            <div className="absolute top-4 left-4">
              <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wide ${isAvailable ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                {isAvailable ? 'Available Now' : listing.status === 'reserved' ? 'Reserved' : `Available ${listing.availableFrom}`}
              </span>
            </div>
            <div className="absolute bottom-5 left-5 right-5">
              <p className="text-white/65 text-sm font-medium mb-1">{listing.unit}{listing.unit ? ' · ' : ''}{listing.location}</p>
              <h1 className="text-2xl md:text-[28px] font-semibold text-white leading-tight tracking-tight">
                {listing.society}
              </h1>
            </div>
          </div>
          {listing.images.slice(1, 3).map((img, i) => (
            <div key={i} className="relative cursor-pointer group" onClick={() => setShowGallery(true)}>
              <img src={img} alt="" className="w-full h-full object-cover group-hover:brightness-90 transition-all" />
              {i === 1 && listing.images.length > 3 && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">+{listing.images.length - 3}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Specs ribbon ─────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-3">
        <div className="bg-white rounded-2xl border border-stone-100 px-6 py-4 flex items-center overflow-x-auto no-scrollbar divide-x divide-stone-100">
          {[
            { Icon: Home,      label: 'Type',      value: listing.bhk },
            { Icon: Maximize2, label: 'Area',       value: `${listing.sqft.toLocaleString()} sq ft` },
            { Icon: Bath,      label: 'Baths',      value: `${listing.bath} bathrooms` },
            { Icon: MapPin,    label: 'Floor',      value: `${listing.unitFloor} of ${listing.floors}` },
            { Icon: Sun,       label: 'Facing',     value: listing.facing },
            { Icon: Wind,      label: 'Balconies',  value: `${listing.balconies} balcon${listing.balconies > 1 ? 'ies' : 'y'}` },
          ].map(({ Icon, label, value }, i) => (
            <div key={i} className="flex items-center gap-3 px-5 shrink-0 first:pl-0 last:pr-0">
              <div className="w-8 h-8 rounded-lg bg-[#004449]/[0.07] flex items-center justify-center shrink-0">
                <Icon size={14} className="text-[#004449]" />
              </div>
              <div>
                <p className="text-[9px] text-stone-400 font-semibold uppercase tracking-wider">{label}</p>
                <p className="text-sm font-semibold text-[#004449] mt-0.5">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col lg:flex-row gap-8 items-start">

        <div className="flex-1 min-w-0 space-y-10">

          {/* ▸ Overview */}
          <section data-sec="Overview" ref={el => sectionRefs.current['Overview'] = el} className="section-anchor">
            <p className="text-stone-500 leading-[1.75] text-[15px] mb-6 max-w-2xl">{richDescription(listing)}</p>

            <div className="flex flex-wrap items-center gap-2.5 mb-6">
              {listing.viewCount > 4 && (
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 text-amber-700 text-xs font-semibold px-3 py-2 rounded-lg">
                  <Users size={11} />{listing.viewCount} people viewing today
                </div>
              )}
              <div className="flex items-center gap-2 bg-stone-50 border border-stone-100 text-stone-500 text-xs font-medium px-3 py-2 rounded-lg">
                <Clock size={11} />Typically rented in {listing.avgBookingDays} days
              </div>
              <div className="flex items-center gap-2 bg-teal-50 border border-teal-100 text-teal-700 text-xs font-semibold px-3 py-2 rounded-lg">
                <CheckCircle2 size={11} />Helium verified
              </div>
            </div>

            {/* Quality gauges */}
            <div className="bg-white rounded-2xl border border-stone-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Home quality scores</p>
                <span className="inline-flex items-center gap-1.5 text-[9px] font-bold text-[#0D9488] bg-teal-50 border border-teal-100 px-2.5 py-1 rounded-full uppercase tracking-widest">
                  <CheckCircle2 size={9} /> Helium Verified
                </span>
              </div>
              <div className="flex items-start justify-around gap-4">
                {Object.entries(listing.qualityScores).map(([key, q]) => {
                  const meta = QUALITY_META[key]
                  return (
                    <div key={key} className="flex-1 text-center">
                      <QualityGauge score={q.score} color={meta.color} Icon={meta.Icon} label={meta.label} />
                      <p className="text-[11px] text-stone-400 leading-relaxed mt-2 px-1">
                        {q.desc || 'Quality assessed based on floor level, orientation, and unit layout.'}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>

          {/* ▸ Features */}
          <section data-sec="Features" ref={el => sectionRefs.current['Features'] = el} className="section-anchor">
            <SectionLabel>Home Features</SectionLabel>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
              {listing.features.map((f, i) => {
                const Icon = featureIcon(f)
                return (
                  <div key={i} className="flex items-center gap-3 bg-white border border-stone-100 rounded-xl px-4 py-3 hover:border-[#004449]/20 hover:shadow-sm transition-all">
                    <div className="w-7 h-7 rounded-lg bg-[#004449]/[0.07] flex items-center justify-center shrink-0">
                      <Icon size={13} className="text-[#004449]" />
                    </div>
                    <span className="text-sm text-stone-700 font-medium">{f}</span>
                  </div>
                )
              })}
            </div>
          </section>

          {/* ▸ Amenities — photo grid */}
          <section data-sec="Amenities" ref={el => sectionRefs.current['Amenities'] = el} className="section-anchor">
            <SectionLabel>Society Amenities</SectionLabel>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {listing.amenities.map((a, i) => {
                const photo = AMENITY_PHOTOS[a]
                return (
                  <div key={i} className="group relative rounded-xl overflow-hidden border border-stone-100 hover:shadow-md hover:border-stone-200 transition-all" style={{ paddingBottom: '65%' }}>
                    {photo ? (
                      <>
                        <img src={photo} alt={a}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
                          onError={e => { e.target.parentElement.querySelector('.fallback').style.display = 'flex'; e.target.style.display = 'none' }} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                      </>
                    ) : (
                      <div className="absolute inset-0 bg-stone-100 flex items-center justify-center">
                        <CheckCircle2 size={24} className="text-stone-300" />
                      </div>
                    )}
                    <div className="fallback absolute inset-0 bg-stone-100 items-center justify-center" style={{ display: 'none' }}>
                      <CheckCircle2 size={24} className="text-stone-300" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 px-3 pb-3">
                      <p className="text-white text-xs font-semibold leading-tight drop-shadow-sm">{a}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* ▸ Floor plans */}
          {listing.floorPlans?.length > 0 && (
            <section className="section-anchor">
              <SectionLabel>Floor Plans</SectionLabel>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {listing.floorPlans.map((fp, i) => (
                  <div key={i} className="bg-white border border-stone-100 rounded-2xl overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="aspect-square overflow-hidden bg-stone-50">
                      <img src={fp} alt={`Floor ${i + 1}`}
                        className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                        onError={e => { e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d4d0ca" stroke-width="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg></div>' }} />
                    </div>
                    <div className="px-4 py-2.5 border-t border-stone-50 bg-stone-50/50">
                      <p className="text-xs font-semibold text-stone-400">{listing.bhk} · {listing.sqft.toLocaleString()} sq ft</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-stone-400 mt-2">Floor plans are illustrative. Actual dimensions may vary slightly.</p>
            </section>
          )}

          {/* ▸ Pricing */}
          <section data-sec="Pricing" ref={el => sectionRefs.current['Pricing'] = el} className="section-anchor">
            <SectionLabel>Pricing</SectionLabel>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-stone-100 rounded-2xl overflow-hidden">
                <div className="px-5 py-3.5 bg-stone-50/60 border-b border-stone-100">
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">What you pay</p>
                </div>
                <div className="divide-y divide-stone-50">
                  <PriceRow label="Monthly Rent" value={formatRentFull(listing.priceBreakdown.rent)} highlight />
                  {listing.priceBreakdown.maintenance > 0 && (
                    <PriceRow label="Maintenance" sub="monthly" value={formatRentFull(listing.priceBreakdown.maintenance)} />
                  )}
                  <PriceRow label="Service Fee" sub="one-time" value={formatRentFull(listing.priceBreakdown.serviceFee)} />
                  <PriceRow label="Security Deposit" sub="refundable" value={formatRentFull(listing.priceBreakdown.deposit)} />
                </div>
              </div>
              <Link to="/deposit-saver">
                <div className="bg-[#004449] rounded-2xl p-6 h-full flex flex-col justify-between hover:bg-[#003337] transition-colors group cursor-pointer">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-[#0D9488]/20 flex items-center justify-center">
                        <Zap size={18} className="text-[#0D9488]" />
                      </div>
                      <span className="text-[10px] font-bold text-[#0D9488] uppercase tracking-widest">Deposit Saver</span>
                    </div>
                    <p className="text-white/50 text-xs mb-2">Traditional deposit</p>
                    <p className="text-2xl font-light text-white/30 line-through mb-3">{formatRentFull(listing.priceBreakdown.deposit)}</p>
                    <p className="text-white/50 text-xs mb-1">With Deposit Saver</p>
                    <p className="text-3xl font-bold text-[#0D9488]">{formatRentFull(listing.depositSaverAmount)}</p>
                  </div>
                  <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                    <p className="text-white/40 text-xs">Save {formatRentFull(savings)} upfront · 5 min approval</p>
                    <ChevronRight size={14} className="text-white/30 group-hover:text-white/60 transition-colors" />
                  </div>
                </div>
              </Link>
            </div>
          </section>

          {/* ▸ What's Included */}
          <section className="section-anchor">
            <SectionLabel>What's Included</SectionLabel>
            <div className="bg-white border border-stone-100 rounded-2xl overflow-hidden">
              <div className="px-5 py-3.5 bg-stone-50/60 border-b border-stone-100 flex items-center justify-between">
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Included in rent</p>
                <span className="text-[10px] text-[#0D9488] font-semibold">{included.length} items</span>
              </div>
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {included.map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <CheckCircle2 size={11} className="text-emerald-600" />
                    </div>
                    <span className="text-sm text-stone-700 font-medium">{item}</span>
                  </div>
                ))}
              </div>
              <div className="px-5 py-3.5 bg-stone-50/40 border-t border-stone-100">
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">Not included</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {excluded.map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-stone-100 flex items-center justify-center shrink-0">
                        <X size={10} className="text-stone-400" />
                      </div>
                      <span className="text-sm text-stone-400 font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ▸ Neighbourhood */}
          <section data-sec="Neighbourhood" ref={el => sectionRefs.current['Neighbourhood'] = el} className="section-anchor">
            <SectionLabel>The Neighbourhood</SectionLabel>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
              {NEIGHBOURHOOD.map(({ Icon, label, value }, i) => (
                <div key={i} className="bg-white border border-stone-100 rounded-xl p-4 hover:border-stone-200 hover:shadow-sm transition-all">
                  <div className="w-8 h-8 rounded-lg bg-[#004449]/[0.07] flex items-center justify-center mb-3">
                    <Icon size={14} className="text-[#004449]" />
                  </div>
                  <p className="text-[10px] font-bold text-[#0D9488] uppercase tracking-widest mb-1">{label}</p>
                  <p className="text-sm text-stone-600 font-medium leading-snug">{value}</p>
                </div>
              ))}
            </div>
            <div className="rounded-2xl overflow-hidden border border-stone-100" style={{ height: 240 }}>
              <MapView listings={[listing]} selectedId={listing.id} onSelectListing={() => {}} />
            </div>
          </section>

          {/* ▸ Virtual Tour */}
          <VideoTourSection listing={listing} listingIndex={listingIndex} />

          {/* ▸ Society Reviews */}
          <section data-sec="Reviews" ref={el => sectionRefs.current['Reviews'] = el} className="section-anchor">
            <div className="flex items-center gap-3 mb-5">
              <h2 className="text-[11px] font-bold text-[#004449] shrink-0 uppercase tracking-widest">Society Reviews</h2>
              <div className="flex-1 h-px bg-stone-200" />
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => <Star key={i} size={10} className="text-amber-400 fill-amber-400" />)}
                <span className="text-[10px] text-stone-400 font-semibold ml-1.5">{reviews.length} reviews</span>
              </div>
            </div>
            <div className="space-y-3">
              {reviews.map((r, i) => (
                <div key={i} className="bg-white border border-stone-100 rounded-2xl p-5 hover:border-stone-200 hover:shadow-sm transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#004449] flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                        {r.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#004449]">{r.name}</p>
                        <p className="text-[10px] text-stone-400 font-medium">{r.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[...Array(r.rating)].map((_, j) => <Star key={j} size={10} className="text-amber-400 fill-amber-400" />)}
                      {[...Array(5 - r.rating)].map((_, j) => <Star key={j} size={10} className="text-stone-200 fill-stone-200" />)}
                    </div>
                  </div>
                  <p className="text-sm text-stone-600 leading-relaxed">{r.text}</p>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-stone-400 mt-3 font-medium">Reviews from verified Helium residents about this society.</p>
          </section>

          {/* ▸ House Rules & Ideal Tenant */}
          <section className="section-anchor">
            <SectionLabel>House Rules & Ideal Tenant</SectionLabel>
            <div className="bg-white border border-stone-100 rounded-2xl overflow-hidden">
              <div className="grid grid-cols-2 md:grid-cols-3 divide-x divide-y divide-stone-50/80">
                <div className="p-4">
                  <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-2">Ideal for</p>
                  <div className="flex flex-wrap gap-1">
                    {tenantProfile.household.map((h, i) => (
                      <span key={i} className="text-[10px] font-semibold text-[#004449] bg-[#004449]/[0.06] px-2.5 py-1 rounded-full">{h}</span>
                    ))}
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-2">Pets</p>
                  <div className="flex items-center gap-1.5">
                    {tenantProfile.pets ? (
                      <>
                        <span className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center shrink-0"><CheckCircle2 size={9} className="text-emerald-600" /></span>
                        <span className="text-xs font-semibold text-stone-600">{tenantProfile.petNote}</span>
                      </>
                    ) : (
                      <>
                        <span className="w-4 h-4 rounded-full bg-red-50 flex items-center justify-center shrink-0"><X size={9} className="text-red-400" /></span>
                        <span className="text-xs font-semibold text-stone-600">Not allowed</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-2">Dietary</p>
                  <p className="text-xs font-semibold text-stone-600">{tenantProfile.dietary}</p>
                </div>
                <div className="p-4">
                  <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-2">Smoking</p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-red-50 flex items-center justify-center shrink-0"><X size={9} className="text-red-400" /></span>
                    <span className="text-xs font-semibold text-stone-600">Not allowed</span>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-2">Min. Lease</p>
                  <p className="text-xs font-semibold text-stone-600">{tenantProfile.minLease}</p>
                </div>
                <div className="p-4">
                  <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-2">Verified by</p>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 size={11} className="text-[#0D9488]" />
                    <span className="text-xs font-semibold text-[#0D9488]">Helium agent</span>
                  </div>
                </div>
              </div>
              {tenantProfile.note && (
                <div className="px-5 py-3.5 bg-amber-50/50 border-t border-amber-100/60">
                  <p className="text-[11px] text-stone-500 leading-relaxed">{tenantProfile.note}</p>
                </div>
              )}
            </div>
          </section>

          {/* ▸ Similar Homes */}
          {similarHomes.length > 0 && (
            <section className="section-anchor pb-32 lg:pb-0">
              <SectionLabel>More in {listing.location}</SectionLabel>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {similarHomes.map(l => <ListingCard key={l.id} listing={l} />)}
              </div>
            </section>
          )}
        </div>

        {/* ── Right: Booking card ──────────── */}
        <div className="lg:w-[320px] shrink-0">
          <div className="sticky top-[72px] space-y-3">
            <div className="bg-white rounded-2xl border border-stone-100 shadow-lg overflow-hidden">
              <div className="bg-[#004449] px-6 pt-5 pb-5">
                <p className="text-[10px] text-white/40 font-semibold uppercase tracking-wider mb-1">Monthly rent</p>
                <p className="text-[32px] font-bold text-white leading-none tracking-tight">{formatRentFull(listing.rent)}</p>
                {listing.maintenance > 0 && (
                  <p className="text-xs text-white/40 mt-1.5">+ {formatRentFull(listing.maintenance)} maintenance</p>
                )}
                <div className={`inline-flex items-center gap-1.5 mt-3 text-[10px] font-bold px-2.5 py-1 rounded-full ${isAvailable ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                  <span className="w-1 h-1 rounded-full bg-current" />
                  {isAvailable ? 'Available now' : 'Reserved'}
                </div>
              </div>

              <div className="px-5 py-3.5 border-b border-stone-100 flex flex-wrap gap-1.5">
                {[listing.bhk, `${listing.bath} Bath`, `${listing.sqft.toLocaleString()} sq ft`, listing.facing].map((v, i) => (
                  <span key={i} className="text-xs bg-stone-50 border border-stone-100 text-stone-600 font-medium px-2.5 py-1 rounded-lg">{v}</span>
                ))}
              </div>

              {listing.viewCount > 4 && (
                <div className="px-5 py-2.5 bg-amber-50 border-b border-amber-100 flex items-center gap-2">
                  <Users size={11} className="text-amber-500" />
                  <p className="text-xs text-amber-700 font-medium">{listing.viewCount} people viewed today</p>
                </div>
              )}

              <div className="px-5 py-4 space-y-2">
                <button onClick={() => navigate(`/tour/${listing.id}`)} className="w-full flex items-center justify-center gap-2 bg-[#004449] hover:bg-[#003337] text-white text-sm font-semibold py-3.5 rounded-xl transition-colors">
                  <Calendar size={14} /> Book a Visit
                </button>
                <button className="w-full flex items-center justify-center gap-2 bg-[#0D9488] hover:bg-[#0b8076] text-white text-sm font-semibold py-3.5 rounded-xl transition-colors">
                  <Phone size={14} /> Talk to us
                </button>
              </div>

              <div className="px-5 pb-4 flex items-center gap-1.5 text-[11px] text-stone-400">
                <CheckCircle2 size={11} className="text-[#0D9488]" />
                Verified listing · No brokerage
              </div>
            </div>

            <Link to="/deposit-saver">
              <div className="bg-white border border-stone-100 rounded-2xl p-4 flex items-center gap-3 hover:border-[#0D9488]/40 hover:shadow-sm transition-all">
                <div className="w-9 h-9 rounded-xl bg-[#004449] flex items-center justify-center shrink-0">
                  <Zap size={14} className="text-[#0D9488]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-bold text-[#0D9488] uppercase tracking-widest">Deposit Saver</p>
                  <p className="text-sm font-semibold text-[#004449] mt-0.5">Pay {formatRentFull(listing.depositSaverAmount)} deposit</p>
                  <p className="text-[10px] text-stone-400">Save {formatRentFull(savings)} upfront</p>
                </div>
                <ChevronRight size={13} className="text-stone-300 shrink-0" />
              </div>
            </Link>

            {/* ── Agent Transparency Card ── */}
            <div className="bg-white border border-stone-100 rounded-2xl overflow-hidden">
              <div className="px-4 pt-4 pb-3 border-b border-stone-50">
                <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Your Helium Agent</p>
              </div>
              <div className="px-4 py-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                    style={{ backgroundColor: agent.color }}>
                    {agent.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#004449] leading-tight">{agent.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={9}
                          className={i < Math.floor(agent.rating) ? 'text-amber-400 fill-amber-400' : 'text-stone-200 fill-stone-200'} />
                      ))}
                      <span className="text-[10px] text-stone-400 font-semibold ml-1">{agent.rating} · {agent.reviews} reviews</span>
                    </div>
                  </div>
                  <div className="shrink-0 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-wide whitespace-nowrap">
                    {agent.responseTime}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-stone-50 rounded-xl px-3 py-2.5 text-center">
                    <p className="text-base font-bold text-[#004449]">{agent.tours}</p>
                    <p className="text-[9px] text-stone-400 font-semibold uppercase tracking-wide mt-0.5">Tours / mo</p>
                  </div>
                  <div className="bg-stone-50 rounded-xl px-3 py-2.5 text-center">
                    <p className="text-base font-bold text-[#004449]">{agent.years} yr{agent.years > 1 ? 's' : ''}</p>
                    <p className="text-[9px] text-stone-400 font-semibold uppercase tracking-wide mt-0.5">At Helium</p>
                  </div>
                </div>

                <a href={waLink} target="_blank" rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1db954] text-white text-sm font-semibold py-3 rounded-xl transition-colors">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  WhatsApp {agent.name.split(' ')[0]}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Gallery ──────────────────────────────────────────── */}
      {showGallery && (
        <div className="fixed inset-0 z-50 bg-black/96 overflow-y-auto">
          <button onClick={() => setShowGallery(false)} className="fixed top-5 right-5 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 z-10">
            <ArrowLeft size={16} className="rotate-[135deg]" />
          </button>
          <div className="max-w-3xl mx-auto p-5 pt-16 space-y-3">
            {listing.images.map((img, i) => (
              <img key={i} src={img} alt="" className="w-full rounded-2xl" />
            ))}
          </div>
        </div>
      )}

      {/* ── Mobile CTA ───────────────────────────────────────── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-stone-100 px-4 py-3 flex gap-2.5 z-40">
        <button onClick={() => navigate(`/tour/${listing.id}`)} className="flex-1 flex items-center justify-center gap-2 bg-[#004449] text-white text-sm font-semibold py-3.5 rounded-xl">
          <Calendar size={14} /> Book a Visit
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 bg-[#0D9488] text-white text-sm font-semibold py-3.5 rounded-xl">
          <Phone size={14} /> Talk to us
        </button>
      </div>
    </div>
  )
}

function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <h2 className="text-base font-bold text-[#004449] shrink-0 uppercase tracking-widest text-[11px]">{children}</h2>
      <div className="flex-1 h-px bg-stone-200" />
    </div>
  )
}

function VideoTourSection({ listing, listingIndex }) {
  const [playing, setPlaying] = useState(false)
  const videoIds = ['r_7fYBMqK5A', 'ZlAU_w7-Bls', 'MjQWY0j5sGY']
  const videoId = videoIds[Math.max(0, listingIndex) % videoIds.length]

  return (
    <section className="section-anchor">
      <SectionLabel>Virtual Tour</SectionLabel>
      {playing ? (
        <div className="relative bg-black rounded-2xl overflow-hidden" style={{ paddingBottom: '56.25%' }}>
          <iframe
            className="absolute inset-0 w-full h-full"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
            title={`Virtual tour of ${listing.society}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <div
          className="relative rounded-2xl overflow-hidden cursor-pointer group"
          style={{ paddingBottom: '56.25%' }}
          onClick={() => setPlaying(true)}
        >
          <img src={listing.images[0]} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[#004449]/60 group-hover:bg-[#004449]/70 transition-all" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-2xl group-hover:scale-105 transition-transform duration-200">
              <Play size={24} className="text-[#004449] translate-x-0.5" />
            </div>
            <p className="text-white font-semibold text-sm mt-1">Watch virtual walkthrough</p>
            <p className="text-white/50 text-xs">3–5 min · HD property tour</p>
          </div>
          <div className="absolute top-4 right-4">
            <span className="inline-flex items-center gap-1.5 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              Video Tour
            </span>
          </div>
        </div>
      )}
    </section>
  )
}

function PriceRow({ label, sub, value, highlight }) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5">
      <div className="flex items-center gap-2">
        <span className={`text-sm font-medium ${highlight ? 'text-[#004449]' : 'text-stone-600'}`}>{label}</span>
        {sub && <span className="text-[10px] text-stone-400 bg-stone-50 border border-stone-100 px-1.5 py-0.5 rounded">{sub}</span>}
      </div>
      <span className={`text-sm font-bold ${highlight ? 'text-[#004449]' : 'text-stone-700'}`}>{value}</span>
    </div>
  )
}
