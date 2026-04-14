import { useState, useMemo, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Search, Sparkles, ChevronDown, Map, LayoutGrid, X, ArrowRight, CheckCircle, BadgeCheck, CalendarCheck, Banknote, MapPin, BookmarkPlus, Bell } from 'lucide-react'
import Navbar from '../components/Navbar'
import MapView from '../components/MapView'
import ListingCard from '../components/ListingCard'
import { LISTINGS, formatRentFull } from '../data/listings'

// ─── Move-in options (dynamic — always future months) ───────────────────────
const FULL_MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
function buildMoveInOptions() {
  return [
    { v: 'any',      l: 'Anytime' },
    { v: 'now',      l: 'Available now' },
    { v: '2weeks',   l: 'Within 2 weeks' },
    { v: 'flexible', l: 'Flexible' },
    { v: 'pick',     l: 'Pick a date…' },
  ]
}
const MOVEIN_OPTIONS = buildMoveInOptions()

// ─── Orbit ring data ──────────────────────────────────────────────────────────
const RING1 = LISTINGS.slice(0, 7)
const RING2 = LISTINGS.slice(7, 17)
const RING3 = LISTINGS.slice(17)

// ─── Semantic match ───────────────────────────────────────────────────────────
function semanticMatch(raw) {
  const q = raw.toLowerCase()
  return LISTINGS.map(l => {
    let s = 0
    if ((q.includes('2 bhk') || q.includes('2bhk')) && l.bhk === '2 BHK') s += 5
    if ((q.includes('3 bhk') || q.includes('3bhk')) && l.bhk === '3 BHK') s += 5
    if ((q.includes('4 bhk') || q.includes('4bhk') || q.includes('villa')) && l.bhk === '4 BHK') s += 5
    const socs = { prestige:'Prestige', brigade:'Brigade', godrej:'Godrej', purva:'Purva', adarsh:'Adarsh', salarpuria:'Salarpuria', 'total environment':'Total Environment', sobha:'Sobha', assetz:'Assetz', vaswani:'Vaswani' }
    for (const [k, v] of Object.entries(socs)) { if (q.includes(k) && l.society.includes(v)) s += 6 }
    if (q.includes('pet') && l.features.some(f => f.includes('Pet'))) s += 3
    if ((q.includes('pool') || q.includes('swim')) && l.amenities.includes('Swimming Pool')) s += 3
    if ((q.includes('view') || q.includes('high floor')) && l.unitFloor > 10) s += 3
    if ((q.includes('east') || q.includes('morning')) && l.facing.includes('East')) s += 3
    if ((q.includes('quiet') || q.includes('peaceful')) && l.qualityScores.soundLevel.score >= 8) s += 3
    if ((q.includes('bright') || q.includes('light') || q.includes('airy')) && l.qualityScores.naturalLight.score >= 9) s += 3
    if ((q.includes('villa') || q.includes('independent')) && l.floors <= 2) s += 4
    const um = q.match(/under\s*[₹]?\s*(\d+)\s*k/i) || q.match(/below\s*[₹]?\s*(\d+)\s*k/i)
    if (um && l.rent <= parseInt(um[1]) * 1000) s += 4
    if ((q.includes('available') || q.includes('immediate') || q.includes('now')) && l.status === 'available') s += 2
    if (s === 0 && l.status === 'available') s = 0.2
    return { ...l, _score: s }
  }).filter(l => l._score > 0).sort((a, b) => b._score - a._score)
}

function filterMatch({ location, layout }) {
  return LISTINGS.filter(l => {
    if (location !== 'all' && l.neighborhood !== location) return false
    if (layout !== 'all' && l.bhk !== layout) return false
    return true
  })
}

const SLIDER_MIN = 20000
const SLIDER_MAX = 300000
const SLIDER_STEP = 5000

const AREAS = [
  { v: 'all',       l: 'Anywhere',        sub: 'All serviceable areas' },
  { v: 'whitefield',l: 'Whitefield',      sub: 'ITPL, Brookfield' },
  { v: 'varthur',   l: 'Varthur',         sub: 'Near Wipro campus' },
  { v: 'hoodi',     l: 'Hoodi',           sub: 'Marathahalli belt' },
  { v: 'panathur',  l: 'Panathur',        sub: 'Outer Ring Road' },
]

const PROMPT_IDEAS = [
  'Quiet 3BHK, east-facing, with pool',
  'High floor with views, under 65K',
  'Pet-friendly villa near ITPL',
  'Move in this week, 2BHK',
]

const HOW_IT_WORKS = [
  { n: '01', Icon: BadgeCheck,    title: 'Curated, not cluttered', body: 'Every listing is personally verified with real photos and real availability. No filler, no clutter.' },
  { n: '02', Icon: CalendarCheck, title: 'Tour today. No broker.',  body: 'Book a slot and our agent meets you with the key. No coordination. No middlemen.' },
  { n: '03', Icon: Banknote,      title: '1 month deposit',         body: 'Deposit Saver cuts your upfront deposit from 5 months down to just 1. Powered by Fintree Finance.' },
]

const REVIEW_COLORS = ['#7C3AED','#0D9488','#D97706','#DC2626','#2563EB','#059669','#DB2777','#7C3AED','#0D9488','#D97706','#DC2626','#2563EB','#059669','#DB2777']
const REVIEWS = [
  { name: 'Priyanka Goel',       text: 'They clearly understood what we were looking for and only showed us relevant homes, which saved us a lot of time.' },
  { name: 'Raghav Gupta',        text: 'No fake photos. No surprises. What we saw online is exactly what we got.' },
  { name: 'Santosh Kumar',       text: 'The house looked exactly like the listing — not a single mismatch.' },
  { name: 'Shaina & Arihant',    text: "Helium's support didn't stop after move-in. Even eight months later, they've been responsive and help us whenever we need." },
  { name: 'Vishal & Divya',      text: 'Move-in felt planned, not chaotic. Everything was ready when we arrived.' },
  { name: 'Vaibhav & Ananya',    text: 'We visited multiple homes instantly — no waiting for keys or coordinating with multiple people.' },
  { name: 'Saurabh & Lavanya',   text: 'They handled everything before we stepped in. Genuinely stress-free.' },
  { name: 'Thanga Prakash',      text: 'Visits were smooth, no waiting around. Fast and professional.' },
  { name: 'T Sugasini',          text: 'One-month deposit made the decision a no brainer!' },
  { name: 'Apoorva & Ritika',    text: 'We just paid 1 month of deposit. Saved us over ₹1.5L upfront.' },
  { name: 'Rakesh Mehta',        text: 'What we saw online is what we visited — genuine listings, no bait-and-switch.' },
  { name: 'Abhishek & Bhavna',   text: "We found a perfect house in 3 days. Couldn't believe how fast it was." },
  { name: 'Abhishek Goyal',      text: 'Every house looked exactly like the photos. There was no mismatch or wasted visit.' },
  { name: 'Pranoy & Debangshee', text: 'Helium helped us avoid paying a huge security deposit upfront. Saving almost ₹2L made the decision much easier.' },
]

function loadSearchState() {
  try {
    const s = JSON.parse(sessionStorage.getItem('hf_search_state') || 'null')
    return s || null
  } catch { return null }
}

export default function HomePage() {
  const navigate = useNavigate()
  const routeLocation = useLocation()

  // Only restore search state when navigating back (not on fresh page load)
  const isBack = routeLocation.key !== 'default'
  const _s = isBack ? loadSearchState() : null
  if (!isBack) sessionStorage.removeItem('hf_search_state')

  const [location, setLocation] = useState(_s?.location ?? 'all')
  const [locationText, setLocationText] = useState(_s?.locationText ?? '')
  const [locationFocus, setLocationFocus] = useState(false)
  const [layout, setLayout] = useState(_s?.layout ?? 'all')
  const [moveIn, setMoveIn] = useState(_s?.moveIn ?? 'any')
  const [moveInDate, setMoveInDate] = useState(_s?.moveInDate ?? '')
  const [query, setQuery] = useState(_s?.query ?? '')
  const [describeActive, setDescribeActive] = useState(_s?.describeActive ?? false)
  const [results, setResults] = useState(() => {
    if (!_s?.resultIds) return null
    return LISTINGS.filter(l => _s.resultIds.includes(l.id))
      .sort((a, b) => _s.resultIds.indexOf(a.id) - _s.resultIds.indexOf(b.id))
  })
  const [searchLabel, setSearchLabel] = useState(_s?.searchLabel ?? '')
  const [showMap, setShowMap] = useState(_s?.showMap ?? true)
  const [selectedId, setSelectedId] = useState(_s?.selectedId ?? null)
  const [rfLocation, setRfLocation] = useState(_s?.rfLocation ?? 'all')
  const [rfLayout, setRfLayout] = useState(_s?.rfLayout ?? 'all')
  const [rfAvail, setRfAvail] = useState(_s?.rfAvail ?? 'any')
  const [priceRange, setPriceRange] = useState(_s?.priceRange ?? [SLIDER_MIN, SLIDER_MAX])
  const [savedSearches, setSavedSearches] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hf_saved_searches') || '[]') }
    catch { return [] }
  })
  const [showSaved, setShowSaved] = useState(false)
  const [savedMsg, setSavedMsg] = useState(false)

  const handleSearch = () => {
    let matched
    let label
    if (describeActive) {
      const q = query.trim()
      if (!q) return
      matched = semanticMatch(q)
      label = q
      setSearchLabel(q)
    } else {
      matched = filterMatch({ location, layout, moveIn })
      const locLabel = location === 'all' ? 'All areas' : AREAS.find(a => a.v === location)?.l || location
      const layLabel = layout === 'all' ? 'Any layout' : layout
      label = `${locLabel} · ${layLabel}`
      setSearchLabel(label)
    }
    setResults(matched)
    setRfLocation(location)
    setRfLayout(layout)
    setRfAvail(moveIn)
    sessionStorage.setItem('hf_search_state', JSON.stringify({
      location, locationText, layout, moveIn, moveInDate, query, describeActive,
      resultIds: matched.map(l => l.id),
      searchLabel: label,
      showMap, selectedId,
      rfLocation: location, rfLayout: layout, rfAvail: moveIn, priceRange,
    }))
    window.scrollTo(0, 0)
  }

  const clearSearch = () => {
    setResults(null)
    setSearchLabel('')
    setQuery('')
    sessionStorage.removeItem('hf_search_state')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const filteredResults = useMemo(() => {
    if (!results) return null
    return results.filter(l => {
      if (rfLocation !== 'all' && l.neighborhood !== rfLocation) return false
      if (rfLayout !== 'all' && l.bhk !== rfLayout) return false
      if (rfAvail === 'now' && l.status !== 'available') return false
      if (l.rent < priceRange[0] || l.rent > priceRange[1]) return false
      return true
    })
  }, [results, rfLocation, rfLayout, rfAvail, priceRange])

  const saveSearch = () => {
    const locLabel = rfLocation === 'all' ? 'Anywhere' : AREAS.find(a => a.v === rfLocation)?.l || rfLocation
    const search = {
      id: Date.now(),
      label: describeActive ? searchLabel : `${locLabel}${rfLayout !== 'all' ? ' · ' + rfLayout : ''}`,
      location: rfLocation,
      layout: rfLayout,
      avail: rfAvail,
      priceMin: priceRange[0],
      priceMax: priceRange[1],
      savedAt: Date.now(),
      matchCount: (filteredResults || []).length,
    }
    const updated = [...savedSearches, search]
    setSavedSearches(updated)
    localStorage.setItem('hf_saved_searches', JSON.stringify(updated))
    window.dispatchEvent(new Event('hf_saved_searches_updated'))
    setSavedMsg(true)
    setShowSaved(true)
    setTimeout(() => setSavedMsg(false), 2000)
  }

  const deleteSavedSearch = (id) => {
    const updated = savedSearches.filter(s => s.id !== id)
    setSavedSearches(updated)
    localStorage.setItem('hf_saved_searches', JSON.stringify(updated))
    window.dispatchEvent(new Event('hf_saved_searches_updated'))
  }

  const applySearch = (s) => {
    setRfLocation(s.location)
    setRfLayout(s.layout)
    setRfAvail(s.avail)
    setPriceRange([s.priceMin, s.priceMax])
    setShowSaved(false)
  }

  // ── SEARCH RESULTS SCREEN ──────────────────────────────────────────────────
  if (results !== null) {
    return (
      <div className="min-h-screen bg-stone-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <Navbar variant="home" />

        {/* Floating filter panel */}
        <div className="fixed top-[58px] left-0 right-0 z-40 px-4 md:px-10 py-2.5 pointer-events-none">
          <div className="max-w-4xl mx-auto pointer-events-auto search-bar-enter space-y-2">
            <div className="bg-[#004449] rounded-2xl shadow-2xl shadow-[#004449]/40 px-4 py-3 flex items-center gap-3 backdrop-blur-sm">
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] animate-pulse" />
                <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest hidden sm:block">Search</span>
              </div>
              <div className="w-px h-5 bg-white/10 shrink-0" />
              <div className="flex items-center gap-2 flex-1 overflow-x-auto no-scrollbar">
                <DarkFilter label="Area" value={rfLocation} onChange={setRfLocation} options={[
                  { v:'all', l:'Anywhere' }, { v:'whitefield', l:'Whitefield' },
                  { v:'varthur', l:'Varthur' }, { v:'hoodi', l:'Hoodi' }, { v:'panathur', l:'Panathur' },
                ]} />
                <DarkFilter label="Layout" value={rfLayout} onChange={setRfLayout} options={[
                  { v:'all', l:'Any' }, { v:'2 BHK', l:'2 BHK' },
                  { v:'3 BHK', l:'3 BHK' }, { v:'4 BHK', l:'4 BHK' },
                ]} />
                <DarkFilter label="When" value={rfAvail} onChange={setRfAvail} options={MOVEIN_OPTIONS} />
              </div>
              <div className="w-px h-5 bg-white/10 shrink-0" />
              <div className="flex items-center gap-2 shrink-0">
                <PriceFilter priceRange={priceRange} onChange={setPriceRange} />
                <button
                  onClick={saveSearch}
                  title="Save this search"
                  className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-all ${savedMsg ? 'bg-[#0D9488]/20 text-[#0D9488] border border-[#0D9488]/30' : 'bg-white/[0.07] border border-white/10 text-white/50 hover:text-white/80 hover:bg-white/12'}`}
                >
                  <BookmarkPlus size={11} />
                  <span className="hidden sm:block">{savedMsg ? 'Saved!' : 'Save'}</span>
                </button>
                {savedSearches.length > 0 && (
                  <button
                    onClick={() => setShowSaved(!showSaved)}
                    className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-all ${showSaved ? 'bg-white/15 text-white border border-white/20' : 'bg-white/[0.07] border border-white/10 text-white/50 hover:text-white/80 hover:bg-white/12'}`}
                  >
                    <Bell size={11} />
                    <span className="w-4 h-4 rounded-full bg-[#0D9488] text-white text-[8px] font-bold flex items-center justify-center">{savedSearches.length}</span>
                  </button>
                )}
                <span className="text-xs font-semibold text-white/60 hidden sm:block">
                  {(filteredResults || []).length} home{(filteredResults || []).length !== 1 ? 's' : ''}
                </span>
                <button onClick={() => setShowMap(!showMap)} className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg transition-all ${showMap ? 'bg-white/15 text-white' : 'text-white/40 hover:text-white/70'}`}>
                  {showMap ? <LayoutGrid size={11} /> : <Map size={11} />}
                  <span className="hidden sm:block">{showMap ? 'Grid' : 'Map'}</span>
                </button>
              </div>
            </div>

            {/* Saved Searches panel */}
            {showSaved && savedSearches.length > 0 && (
              <div className="bg-[#002a2f] border border-white/10 rounded-xl shadow-2xl p-3">
                <div className="flex items-center justify-between mb-2.5">
                  <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Saved Searches</p>
                  <button onClick={() => setShowSaved(false)} className="text-white/25 hover:text-white/60 transition-colors">
                    <X size={11} />
                  </button>
                </div>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
                  {savedSearches.map(s => (
                    <SavedSearchCard key={s.id} search={s} onView={() => applySearch(s)} onDelete={() => deleteSavedSearch(s.id)} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Green header banner */}
        <div className="bg-[#004449] pt-[68px] pb-8 px-5 search-page-enter">
          <div className="max-w-screen-xl mx-auto flex items-end justify-between">
            <div>
              {describeActive && (
                <p className="flex items-center gap-1.5 text-xs text-[#0D9488] font-medium mb-2">
                  <Sparkles size={11} />
                  <span className="italic opacity-80">"{searchLabel.length > 55 ? searchLabel.slice(0,55)+'...' : searchLabel}"</span>
                </p>
              )}
              <h2 className="text-3xl md:text-4xl font-light text-white leading-tight" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                {(filteredResults || []).length} home{(filteredResults || []).length !== 1 ? 's' : ''}{' '}
                <em className="italic font-semibold">{describeActive ? 'matched.' : 'found.'}</em>
              </h2>
              {!describeActive && (
                <p className="text-white/40 text-sm mt-1 font-medium">{searchLabel}</p>
              )}
            </div>
            <button
              onClick={clearSearch}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/15 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all"
            >
              <X size={14} /> Close search
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="max-w-screen-xl mx-auto px-5 py-8 search-page-enter">
          {showMap && (
            <div className="rounded-2xl overflow-hidden mb-7 border border-stone-200 shadow-sm" style={{ height: 380 }}>
              <MapView
                listings={filteredResults || []}
                selectedId={selectedId}
                onSelectListing={id => { setSelectedId(id); navigate(`/listing/${id}`) }}
              />
            </div>
          )}

          {(filteredResults || []).length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(filteredResults || []).map(l => <ListingCard key={l.id} listing={l} />)}
            </div>
          ) : (
            <div className="text-center py-24">
              <p className="text-4xl mb-4">🔍</p>
              <h3 className="text-xl font-light text-[#004449] mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>No homes match yet</h3>
              <p className="text-sm text-stone-400 mb-5">Try adjusting your filters above.</p>
              <button onClick={clearSearch} className="text-sm text-[#0D9488] font-semibold underline underline-offset-2">Reset search</button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── HOME SCREEN ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar variant="home" />

      {/* ═══════════════════════════════════════════════════
          HERO — centered with spinning orbit rings
          ═══════════════════════════════════════════════════ */}
      <section className="relative min-h-[94vh] flex items-center justify-center pattern-bg overflow-hidden" style={{ background: '#F7F5F0' }}>

        {/* Orbit rings — xl+ only */}
        <div className="hidden xl:block absolute inset-0 pointer-events-none">
          <div className="absolute" style={{ top: '50%', left: '50%' }}>
            <OrbitRing items={RING1} radius={320} duration={55} clockwise imgSize={88} blur={0} opacity={0.82} />
            <OrbitRing items={RING2} radius={520} duration={85} clockwise={false} imgSize={76} blur={0.8} opacity={0.65} />
            <OrbitRing items={RING3} radius={720} duration={120} clockwise imgSize={64} blur={2} opacity={0.48} />
          </div>
        </div>

        {/* Teal ambient glow behind center */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 55% 45% at 50% 52%, rgba(13,148,136,0.08) 0%, transparent 65%)' }}
        />
        {/* Radial vignette — fades rings toward center and edges */}
        <div className="hidden xl:block absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 50% 62% at 50% 50%, rgba(247,245,240,0.90) 0%, rgba(247,245,240,0.55) 45%, rgba(247,245,240,0.10) 70%, rgba(247,245,240,0.96) 100%)' }}
        />

        {/* Center content */}
        <div className="relative z-10 w-full max-w-[780px] mx-auto px-5 text-center py-24">
          <h1
            className="text-[52px] md:text-[70px] font-light text-[#004449] leading-[1.02] tracking-tight mb-5"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            The best homes<br />
            <em className="font-semibold italic" style={{ background: 'linear-gradient(135deg, #0D9488 0%, #059669 60%, #0ea5e9 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>are here.</em>
          </h1>

          <p className="text-base text-stone-500 leading-relaxed mb-10 max-w-sm mx-auto">
            Curated, verified rentals inside the finest gated societies.
          </p>

          {/* ── Search bar ── */}
          <div className="relative bg-[#004449] rounded-2xl shadow-2xl shadow-[#0D9488]/20 ring-1 ring-[#0D9488]/10 text-left">

            {/* Single row */}
            <div className="flex items-center gap-0 divide-x divide-white/10">

              {/* Location / Describe input */}
              <div className="relative flex-1 min-w-0">
                <div className="flex items-center gap-3 px-5 py-4">
                  {describeActive
                    ? <Sparkles size={14} className="text-[#0D9488] shrink-0" />
                    : <MapPin size={14} className="text-[#0D9488] shrink-0" />
                  }
                  <input
                    type="text"
                    value={describeActive ? query : locationText}
                    onChange={e => {
                      if (describeActive) setQuery(e.target.value)
                      else { setLocationText(e.target.value); setLocation('all') }
                    }}
                    onFocus={() => !describeActive && setLocationFocus(true)}
                    onBlur={() => setTimeout(() => setLocationFocus(false), 150)}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    placeholder={describeActive ? 'Describe your ideal home…' : 'Area, locality or society…'}
                    className="flex-1 bg-transparent text-[15px] text-white placeholder-white/30 outline-none font-medium min-w-0"
                  />
                  {(describeActive ? query : locationText) && (
                    <button onClick={() => { if (describeActive) setQuery(''); else { setLocationText(''); setLocation('all') } }}>
                      <X size={12} className="text-white/30 hover:text-white/60 shrink-0" />
                    </button>
                  )}
                </div>

                {/* Location dropdown */}
                {!describeActive && locationFocus && (
                  <div className="absolute left-0 right-0 top-full z-50 bg-[#002e32] border border-white/10 rounded-xl mt-1 shadow-2xl overflow-hidden">
                    {AREAS.filter(a =>
                      !locationText || a.l.toLowerCase().includes(locationText.toLowerCase()) || a.sub.toLowerCase().includes(locationText.toLowerCase())
                    ).map(a => (
                      <button key={a.v} onMouseDown={() => { setLocation(a.v); setLocationText(a.v === 'all' ? '' : a.l); setLocationFocus(false) }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/10 transition-colors ${location === a.v ? 'bg-white/[0.07]' : ''}`}>
                        <MapPin size={11} className="text-[#0D9488] shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white">{a.l}</p>
                          <p className="text-[10px] text-white/35">{a.sub}</p>
                        </div>
                        {location === a.v && <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] shrink-0" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Layout — hidden in describe mode */}
              {!describeActive && (
                <SlimSelect label="Layout" value={layout} onChange={setLayout} options={[
                  { v:'all', l:'Any' },
                  { v:'2 BHK', l:'2 BHK' },
                  { v:'3 BHK', l:'3 BHK' },
                  { v:'4 BHK', l:'4 BHK' },
                ]} />
              )}

              {/* Move-in — hidden in describe mode */}
              {!describeActive && (
                <MoveInSelect value={moveIn} onChange={setMoveIn} moveInDate={moveInDate} onDateChange={setMoveInDate} slim />
              )}

              {/* Describe toggle pill */}
              <div className="px-4 shrink-0">
                <button
                  onClick={() => setDescribeActive(d => !d)}
                  className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all ${describeActive ? 'bg-[#0D9488]/20 text-[#0D9488] border border-[#0D9488]/30' : 'bg-white/[0.08] text-white/50 hover:text-white/80 hover:bg-white/[0.13]'}`}
                >
                  <Sparkles size={10} />
                  AI
                </button>
              </div>

              {/* Search CTA */}
              <div className="p-3 shrink-0">
                <button
                  onClick={handleSearch}
                  disabled={describeActive && !query.trim()}
                  className="flex items-center justify-center gap-2 bg-[#0D9488] hover:bg-[#0b8076] disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-all"
                >
                  <Search size={14} />
                  <span>Search</span>
                </button>
              </div>
            </div>
          </div>

          {/* Try asking pills — only shown in Describe mode */}
          {describeActive && (
            <div className="mt-3">
              <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest mb-2 text-center">Try asking</p>
              <div className="flex gap-2 flex-wrap justify-center">
                {PROMPT_IDEAS.map((p, i) => (
                  <button key={i} onClick={() => setQuery(p)}
                    className="text-[11px] font-medium text-stone-500 hover:text-[#004449] bg-white/80 hover:bg-white border border-stone-200 hover:border-[#004449]/30 px-3 py-1.5 rounded-full transition-all whitespace-nowrap shadow-sm">
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mt-8 pt-8 border-t border-stone-200/60">
            {[
              { v: '127+', l: 'Verified homes' },
              { v: '12 days', l: 'Avg. to move in' },
              { v: '100%', l: 'Gated societies' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl font-bold tracking-tight leading-none" style={{ color: '#0D9488' }}>{s.v}</p>
                <p className="text-[11px] text-stone-400 font-medium mt-1.5 uppercase tracking-wider">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          WHY HELIUM
          ═══════════════════════════════════════════════════ */}
      <section className="bg-white border-y border-stone-100">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 py-20 md:py-28">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
            <div>
              <p className="text-[11px] font-semibold text-[#0D9488] tracking-[0.18em] uppercase mb-3">Why Helium</p>
              <h2 className="text-4xl md:text-5xl font-light text-[#004449] leading-[1.1]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Renting, done <em className="italic font-semibold">right.</em>
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {HOW_IT_WORKS.map((step, idx) => {
              const accent = idx === 0 ? '#6366f1' : idx === 1 ? '#0D9488' : '#f59e0b'
              const isDark = idx === 1
              return (
                <div key={step.n} className={`relative rounded-3xl p-8 overflow-hidden transition-all duration-300 cursor-default ${
                  isDark
                    ? 'bg-[#004449] shadow-2xl shadow-[#004449]/25'
                    : 'bg-white border border-stone-100 hover:border-stone-200 hover:shadow-xl hover:-translate-y-1.5'
                }`}>
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-8" style={{ backgroundColor: isDark ? `${accent}25` : `${accent}15` }}>
                    <step.Icon size={18} style={{ color: accent }} />
                  </div>
                  <div className="absolute top-5 right-6 text-[84px] font-bold leading-none select-none pointer-events-none"
                    style={{ fontFamily: "'Cormorant Garamond', serif", color: isDark ? 'rgba(255,255,255,0.05)' : `${accent}10` }}>
                    {step.n}
                  </div>
                  {/* Accent left border */}
                  {!isDark && <div className="absolute left-0 top-8 bottom-8 w-[3px] rounded-full" style={{ backgroundColor: accent, opacity: 0.5 }} />}
                  <h3 className={`text-[17px] font-semibold mb-3 leading-snug ${isDark ? 'text-white' : 'text-[#004449]'}`}>{step.title}</h3>
                  <p className={`text-sm leading-relaxed ${isDark ? 'text-white/55' : 'text-stone-500'}`}>{step.body}</p>
                  {isDark && <div className="absolute bottom-0 right-0 w-32 h-32 rounded-tl-full" style={{ backgroundColor: `${accent}12` }} />}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          REVIEWS — Straight from our users
          ═══════════════════════════════════════════════════ */}
      <section className="py-20 md:py-24 overflow-hidden bg-[#0a1a1a]">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 mb-12">
          <p className="text-[11px] font-semibold text-[#0D9488] tracking-[0.18em] uppercase mb-3">Testimonials</p>
          <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
            <h2 className="text-4xl md:text-5xl font-light text-white" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Straight from <em className="italic font-semibold">our users.</em>
            </h2>
            {/* 5 stars */}
            <div className="flex flex-col items-start md:items-end gap-1.5 shrink-0">
              <div className="flex gap-1">
                {[1,2,3,4,5].map(i => (
                  <svg key={i} width="18" height="18" viewBox="0 0 24 24" fill="#F59E0B" stroke="none">
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                  </svg>
                ))}
              </div>
              <p className="text-white/40 text-xs font-medium">14 verified reviews</p>
            </div>
          </div>
        </div>
        {/* Row 1 — scrolls left */}
        <div className="overflow-hidden mb-4">
          <div className="marquee-left">
            {[...REVIEWS.slice(0, 7), ...REVIEWS.slice(0, 7)].map((r, i) => <ReviewCard key={i} review={r} colorIdx={i % 7} />)}
          </div>
        </div>
        {/* Row 2 — scrolls right */}
        <div className="overflow-hidden">
          <div className="marquee-right">
            {[...REVIEWS.slice(7), ...REVIEWS.slice(7)].map((r, i) => <ReviewCard key={i} review={r} colorIdx={(i + 7) % 14} />)}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          DEPOSIT SAVER
          ═══════════════════════════════════════════════════ */}
      <section className="bg-[#004449]">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 py-16 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="text-white text-center md:text-left max-w-lg">
            <p className="text-[11px] font-semibold text-[#0D9488] tracking-[0.18em] uppercase mb-3">Deposit Saver</p>
            <h2 className="text-4xl md:text-5xl font-light leading-tight mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Move in for<br /><em className="italic font-semibold">1 month's rent.</em>
            </h2>
            <p className="text-white/50 text-sm leading-relaxed mb-6">
              Deposit Saver, powered by Fintree Finance, covers your security deposit gap. You pay 1 month. We handle the rest. Instant approval. No paperwork.
            </p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              {['5-min approval', 'NBFC backed', 'No hidden charges'].map((item, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs text-white/60 font-medium">
                  <CheckCircle size={12} className="text-[#0D9488]" />{item}
                </div>
              ))}
            </div>
            <button onClick={() => navigate('/deposit-saver')} className="mt-7 inline-flex items-center gap-2 text-white text-sm font-semibold px-7 py-3.5 rounded-xl transition-all hover:shadow-lg hover:shadow-[#0D9488]/30 hover:-translate-y-0.5" style={{ background: 'linear-gradient(135deg, #0D9488 0%, #059669 100%)' }}>
              How does it work <ArrowRight size={14} />
            </button>
          </div>
          <div className="shrink-0 bg-white/[0.06] border border-white/15 rounded-3xl p-8 text-center min-w-[220px]">
            <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-3">Traditional deposit</p>
            <p className="text-3xl font-light text-white/30 line-through mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>2 to 4 Lakhs</p>
            <div className="w-8 h-px bg-[#0D9488]/40 mx-auto mb-4" />
            <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-2">With Helium</p>
            <p className="text-5xl font-semibold text-[#0D9488]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>1 mo.</p>
            <p className="text-white/30 text-xs mt-2 font-medium">That's it.</p>
          </div>
        </div>
      </section>
    </div>
  )
}

// ─── Orbit Ring component ─────────────────────────────────────────────────────
function OrbitRing({ items, radius, duration, clockwise = true, imgSize = 80, blur = 3, opacity = 0.6 }) {
  const angleStep = 360 / items.length
  return (
    <div style={{
      position: 'absolute',
      top: 0, left: 0,
      width: 0, height: 0,
      animation: `${clockwise ? 'spinCW' : 'spinCCW'} ${duration}s linear infinite`,
    }}>
      {items.map((item, i) => {
        const angle = angleStep * i
        const rad = (angle * Math.PI) / 180
        const x = Math.cos(rad) * radius
        const y = Math.sin(rad) * radius
        return (
          <div key={item.id + i} style={{
            position: 'absolute',
            width: imgSize,
            height: imgSize,
            left: x - imgSize / 2,
            top: y - imgSize / 2,
          }}>
            <img
              src={item.images[0]}
              alt=""
              style={{
                width: '100%', height: '100%',
                objectFit: 'cover',
                borderRadius: 14,
                filter: `blur(${blur}px)`,
                opacity,
                boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
              }}
              onError={e => { e.target.style.opacity = 0 }}
            />
          </div>
        )
      })}
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ReviewCard({ review, colorIdx = 0 }) {
  const color = REVIEW_COLORS[colorIdx % REVIEW_COLORS.length]
  return (
    <div className="w-[300px] bg-white/[0.07] border border-white/10 rounded-2xl px-6 py-5 shrink-0 hover:bg-white/[0.11] hover:border-white/20 transition-all cursor-default select-none">
      <div className="text-[48px] leading-[0.8] font-bold mb-3" style={{ color, opacity: 0.5, fontFamily: 'Georgia, serif' }}>"</div>
      <p className="text-[14px] text-white/75 leading-relaxed mb-5 line-clamp-4 font-medium">{review.text}</p>
      <div className="flex items-center gap-2.5 pt-3.5 border-t border-white/10">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0" style={{ backgroundColor: color }}>
          {review.name[0]}
        </div>
        <p className="text-xs font-semibold text-white/50">{review.name}</p>
      </div>
    </div>
  )
}

function SearchModeTab({ active, label, accent, onClick }) {
  return (
    <button onClick={onClick} className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-all border-b-2 ${active ? (accent ? 'border-[#0D9488] text-[#0D9488]' : 'border-white text-white') : 'border-transparent text-white/35 hover:text-white/60'}`}>
      {label}
    </button>
  )
}

function SlimSelect({ label, value, onChange, options }) {
  const active = value !== options[0].v
  return (
    <div className="px-5 py-4 shrink-0">
      <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest leading-none mb-1.5">{label}</p>
      <div className="flex items-center gap-1.5">
        <select value={value} onChange={e => onChange(e.target.value)}
          className={`bg-transparent text-sm font-semibold outline-none cursor-pointer ${active ? 'text-white' : 'text-white/60'}`}
          style={{ appearance: 'none' }}>
          {options.map(o => <option key={o.v} value={o.v} className="text-stone-900 bg-white">{o.l}</option>)}
        </select>
        <ChevronDown size={10} className="text-white/25 shrink-0" />
      </div>
    </div>
  )
}

function MoveInSelect({ value, onChange, moveInDate, onDateChange, slim }) {
  const todayStr = new Date().toISOString().split('T')[0]
  if (slim) {
    return (
      <div className="px-5 py-4 shrink-0">
        <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest leading-none mb-1.5">Move-in</p>
        <div className="flex items-center gap-1.5">
          <select value={value} onChange={e => onChange(e.target.value)}
            className={`bg-transparent text-sm font-semibold outline-none cursor-pointer ${value !== 'any' ? 'text-white' : 'text-white/60'}`}
            style={{ appearance: 'none' }}>
            {MOVEIN_OPTIONS.map(o => <option key={o.v} value={o.v} className="text-stone-900 bg-white">{o.l}</option>)}
          </select>
          <ChevronDown size={10} className="text-white/25 shrink-0" />
        </div>
        {value === 'pick' && (
          <input type="date" value={moveInDate} onChange={e => onDateChange(e.target.value)} min={todayStr}
            className="mt-1.5 bg-white/10 text-white text-[11px] font-medium rounded-lg px-2 py-1 outline-none border border-white/20 w-full" />
        )}
      </div>
    )
  }
  return (
    <div className="flex-1 min-w-0 px-4 py-3.5">
      <p className="text-[9px] text-white/40 font-semibold uppercase tracking-[0.14em] leading-none mb-1.5">Move-in</p>
      <div className="flex items-center gap-1.5">
        <select value={value} onChange={e => onChange(e.target.value)} className="flex-1 bg-transparent text-sm text-white font-semibold outline-none cursor-pointer truncate min-w-0" style={{ appearance: 'none' }}>
          {MOVEIN_OPTIONS.map(o => <option key={o.v} value={o.v} className="text-stone-900 bg-white font-medium">{o.l}</option>)}
        </select>
        <ChevronDown size={11} className="text-white/25 shrink-0" />
      </div>
      {value === 'pick' && (
        <input type="date" value={moveInDate} onChange={e => onDateChange(e.target.value)} min={todayStr}
          className="mt-2 w-full bg-white/10 text-white text-xs font-medium rounded-lg px-2.5 py-1.5 outline-none border border-white/20 focus:border-[#0D9488]/60 transition-colors" />
      )}
    </div>
  )
}

function GreenSelect({ label, value, onChange, options }) {
  return (
    <div className="flex-1 min-w-0 px-4 py-3.5">
      <p className="text-[9px] text-white/40 font-semibold uppercase tracking-[0.14em] leading-none mb-1.5">{label}</p>
      <div className="flex items-center gap-1.5">
        <select value={value} onChange={e => onChange(e.target.value)} className="flex-1 bg-transparent text-sm text-white font-semibold outline-none cursor-pointer truncate min-w-0" style={{ appearance: 'none' }}>
          {options.map(o => <option key={o.v} value={o.v} className="text-stone-900 bg-white font-medium">{o.l}</option>)}
        </select>
        <ChevronDown size={11} className="text-white/25 shrink-0" />
      </div>
    </div>
  )
}

function DarkFilter({ label, value, onChange, options }) {
  const isActive = value !== options[0].v
  return (
    <div className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 cursor-pointer transition-all shrink-0 ${isActive ? 'bg-white/15 border border-white/25' : 'bg-white/[0.07] border border-white/10 hover:bg-white/12'}`}>
      <span className={`text-[10px] font-semibold ${isActive ? 'text-white/60' : 'text-white/35'}`}>{label}:</span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`bg-transparent text-[10px] font-bold outline-none cursor-pointer ${isActive ? 'text-white' : 'text-white/55'}`}
        style={{ appearance: 'none' }}
      >
        {options.map(o => <option key={o.v} value={o.v} className="text-stone-900 bg-white">{o.l}</option>)}
      </select>
      <ChevronDown size={8} className={isActive ? 'text-white/40' : 'text-white/20'} />
    </div>
  )
}

function PriceRangeSlider({ minVal, maxVal, onMinChange, onMaxChange }) {
  const SMIN = SLIDER_MIN, SMAX = SLIDER_MAX, STEP = SLIDER_STEP
  const minPct = ((minVal - SMIN) / (SMAX - SMIN)) * 100
  const maxPct = ((maxVal - SMIN) / (SMAX - SMIN)) * 100
  const fmtK = v => v >= 100000 ? `₹${(v / 100000).toFixed(1).replace(/\.0$/, '')}L` : `₹${v / 1000}K`
  return (
    <div className="px-1 pt-2 pb-1">
      <div className="flex justify-between mb-3">
        <span className="text-[11px] font-bold text-white">{fmtK(minVal)}</span>
        <span className="text-[10px] text-white/35 font-medium">to</span>
        <span className="text-[11px] font-bold text-white">{fmtK(maxVal)}</span>
      </div>
      <div className="relative h-5">
        <div className="absolute top-[8px] left-0 right-0 h-1.5 bg-white/15 rounded-full" />
        <div
          className="absolute top-[8px] h-1.5 bg-[#0D9488] rounded-full"
          style={{ left: `${minPct}%`, right: `${100 - maxPct}%` }}
        />
        <div className="absolute top-[2px] w-4 h-4 rounded-full bg-white shadow-md border-2 border-[#0D9488] pointer-events-none"
          style={{ left: `calc(${minPct}% - 8px)` }} />
        <div className="absolute top-[2px] w-4 h-4 rounded-full bg-white shadow-md border-2 border-[#0D9488] pointer-events-none"
          style={{ left: `calc(${maxPct}% - 8px)` }} />
        <input type="range" min={SMIN} max={SMAX} step={STEP} value={minVal}
          onChange={e => onMinChange(Math.min(Number(e.target.value), maxVal - STEP))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          style={{ zIndex: minVal > SMAX - 5 * STEP ? 5 : 3 }} />
        <input type="range" min={SMIN} max={SMAX} step={STEP} value={maxVal}
          onChange={e => onMaxChange(Math.max(Number(e.target.value), minVal + STEP))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          style={{ zIndex: 4 }} />
      </div>
      <div className="flex justify-between mt-1.5 text-[9px] text-white/20 font-medium">
        <span>₹20K</span><span>₹3L</span>
      </div>
    </div>
  )
}

function PriceFilter({ priceRange, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const [minVal, maxVal] = priceRange
  const isFiltered = minVal > SLIDER_MIN || maxVal < SLIDER_MAX
  const fmtK = v => v >= 100000 ? `₹${(v / 100000).toFixed(1).replace(/\.0$/, '')}L` : `₹${v / 1000}K`

  useEffect(() => {
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={ref} className="relative shrink-0">
      <div
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 cursor-pointer transition-all ${isFiltered ? 'bg-white/15 border border-white/25' : 'bg-white/[0.07] border border-white/10 hover:bg-white/12'}`}
      >
        <span className={`text-[10px] font-semibold ${isFiltered ? 'text-white/60' : 'text-white/35'}`}>Price:</span>
        <span className={`text-[10px] font-bold ${isFiltered ? 'text-white' : 'text-white/55'}`}>
          {isFiltered ? `${fmtK(minVal)}–${fmtK(maxVal)}` : 'Any'}
        </span>
        <ChevronDown size={8} className={isFiltered ? 'text-white/40' : 'text-white/20'} />
      </div>
      {open && (
        <div className="absolute top-full left-0 mt-1.5 w-52 bg-[#003337] border border-white/10 rounded-xl shadow-2xl z-[60] p-3">
          <PriceRangeSlider
            minVal={minVal} maxVal={maxVal}
            onMinChange={min => onChange([min, maxVal])}
            onMaxChange={max => onChange([minVal, max])}
          />
          {isFiltered && (
            <button
              onClick={() => { onChange([SLIDER_MIN, SLIDER_MAX]); setOpen(false) }}
              className="w-full text-center text-[9px] font-semibold text-white/35 hover:text-white/60 mt-1 py-1 transition-colors"
            >
              Reset to any price
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function SavedSearchCard({ search, onView, onDelete }) {
  const fmtK = v => v >= 100000 ? `₹${(v / 100000).toFixed(1).replace(/\.0$/, '')}L` : `₹${v / 1000}K`
  const priceLabel = (search.priceMin > SLIDER_MIN || search.priceMax < SLIDER_MAX)
    ? ` · ${fmtK(search.priceMin)}–${fmtK(search.priceMax)}` : ''
  return (
    <div className="shrink-0 bg-white/[0.06] border border-white/10 rounded-xl px-3 py-2.5 flex items-center gap-3 min-w-[180px] max-w-[260px] hover:bg-white/[0.09] transition-all">
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold text-white truncate">{search.label}{priceLabel}</p>
        <p className="text-[9px] text-white/40 mt-0.5">{search.matchCount} homes matched</p>
      </div>
      <button onClick={onView} className="shrink-0 text-[9px] font-bold text-[#0D9488] bg-[#0D9488]/10 hover:bg-[#0D9488]/20 px-2 py-1 rounded-md transition-colors whitespace-nowrap">
        View
      </button>
      <button onClick={onDelete} className="shrink-0 text-white/20 hover:text-white/50 transition-colors">
        <X size={9} />
      </button>
    </div>
  )
}
