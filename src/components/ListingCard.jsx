import { Link } from 'react-router-dom'
import { Bookmark, BedDouble, Maximize2, Compass, TrendingUp, Users, ArrowRight, Zap } from 'lucide-react'
import { formatRentFull } from '../data/listings'
import { useBookmarks } from '../context/BookmarksContext'

const STATUS_CONFIG = {
  available: { label: 'Available Now', bg: 'bg-emerald-500' },
  reserved:  { label: 'Reserved',      bg: 'bg-amber-500'  },
  occupied:  { label: 'Rented Out',    bg: 'bg-stone-400'  },
}

// Smart tag data — text only, no emojis, with lucide icon key
const TAG_DEFS = [
  { key: 'bright',    test: l => l.qualityScores.naturalLight.score >= 9 && l.facing.includes('East'), label: 'Bright & airy',         Icon: Compass },
  { key: 'quiet',     test: l => l.qualityScores.soundLevel.score >= 9,                                label: 'Ultra quiet',           Icon: TrendingUp },
  { key: 'pet',       test: l => l.features.some(f => f.includes('Pet')),                             label: 'Pet friendly',          Icon: Bookmark },
  { key: 'amenities', test: l => l.amenities.includes('Swimming Pool') && l.amenities.includes('Gymnasium'), label: 'Full amenities', Icon: TrendingUp },
  { key: 'highfloor', test: l => l.unitFloor > 10,                                                    label: 'High floor views',      Icon: TrendingUp },
  { key: 'villa',     test: l => l.sqft > 2500,                                                       label: 'Villa scale',           Icon: Maximize2 },
  { key: 'balcony',   test: l => l.balconies >= 3,                                                    label: 'Wraparound balconies',  Icon: Compass },
]

function getSmartTags(listing) {
  return TAG_DEFS.filter(d => d.test(listing)).slice(0, 2)
}

export default function ListingCard({ listing }) {
  const status = STATUS_CONFIG[listing.status] || STATUS_CONFIG.available
  const smartTags = getSmartTags(listing)
  const savings = listing.priceBreakdown.deposit - listing.depositSaverAmount
  const { bookmarks, toggle } = useBookmarks()
  const saved = bookmarks.has(listing.id)
  const isOccupied = listing.status === 'occupied'

  return (
    <Link
      to={`/listing/${listing.id}`}
      className={`group block ${isOccupied ? 'pointer-events-none' : ''}`}
      onClick={() => !isOccupied && window.scrollTo({ top: 0, behavior: 'instant' })}
    >
      <article className={`bg-white rounded-2xl overflow-hidden border transition-all duration-300 ${
        isOccupied
          ? 'border-stone-100 opacity-55 grayscale-[40%] cursor-default'
          : saved
            ? 'hover:-translate-y-1.5 hover:shadow-xl hover:shadow-[#0D9488]/25 hover:border-[#0D9488]/50 border-[#0D9488]/50 shadow-lg shadow-[#0D9488]/15'
            : 'hover:-translate-y-1.5 hover:shadow-xl hover:shadow-[#0D9488]/25 hover:border-[#0D9488]/50 border-stone-100'
      }`}>

        {/* ── Photo ── */}
        <div className="relative overflow-hidden bg-stone-100" style={{ paddingBottom: '68%' }}>
          <img
            src={listing.images[0]}
            alt={listing.society}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-700 ease-out"
            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80' }}
          />

          {/* Dark gradient fade at bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent" />

          {/* Status pill — top left */}
          <div className="absolute top-3 left-3">
            <span className={`inline-flex items-center gap-1.5 text-[9px] font-bold tracking-[0.1em] text-white px-2.5 py-1 rounded-full uppercase ${status.bg}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
              {status.label}
            </span>
          </div>

          {/* Bookmark — top right, revealed on hover or when saved */}
          {!isOccupied && (
            <button
              onClick={e => { e.preventDefault(); toggle(listing.id); if (!saved) window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              className={`absolute top-3 right-3 w-8 h-8 rounded-full backdrop-blur-sm flex items-center justify-center shadow-sm transition-all duration-200 ${
                saved
                  ? 'bg-[#0D9488] opacity-100 scale-100'
                  : 'bg-white/90 opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100'
              }`}
            >
              <Bookmark size={13} className={saved ? 'text-white fill-white' : 'text-stone-500'} />
            </button>
          )}

          {/* Deposit saver strip — bottom left */}
          {listing.status === 'available' && savings > 0 && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-[#004449]/90 backdrop-blur-sm px-2.5 py-1 rounded-lg">
              <Zap size={10} className="text-[#0D9488]" />
              <span className="text-[9px] font-bold text-white/90 tracking-wide">Save {formatRentFull(savings)} deposit</span>
            </div>
          )}

          {/* Viewer count — bottom right */}
          {listing.viewCount > 5 && listing.status === 'available' && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-lg">
              <Users size={9} className="text-white/70" />
              <span className="text-[9px] font-semibold text-white/80">{listing.viewCount} viewing</span>
            </div>
          )}
        </div>

        {/* ── Content ── */}
        <div className="p-5">

          {/* Location + bhk row */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-[#0D9488] uppercase tracking-widest">{listing.location}</span>
            <span className="text-[10px] font-semibold text-stone-400 bg-stone-50 border border-stone-100 px-2 py-0.5 rounded-md">{listing.bhk}</span>
          </div>

          {/* Society name — main heading */}
          <h3 className="text-[16px] font-semibold text-[#004449] leading-snug mb-3 line-clamp-2 tracking-tight">
            {listing.society}
          </h3>

          {/* Spec chips */}
          <div className="flex items-center gap-2 mb-4">
            {[
              { Icon: Maximize2, v: `${listing.sqft.toLocaleString()} sq ft` },
              { Icon: Compass,   v: listing.facing },
              { Icon: BedDouble, v: `${listing.bath} bath` },
            ].map(({ Icon, v }, i) => (
              <div key={i} className="flex items-center gap-1 text-[11px] text-stone-400 font-medium bg-stone-50 border border-stone-100 rounded-lg px-2 py-1">
                <Icon size={10} className="text-stone-300 shrink-0" />
                {v}
              </div>
            ))}
          </div>

          {/* Smart tags (no emojis) */}
          {smartTags.length > 0 && (
            <div className="flex gap-1.5 mb-4 flex-wrap">
              {smartTags.map((tag, i) => (
                <span key={i} className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#004449]/70 bg-[#004449]/[0.06] border border-[#004449]/10 px-2.5 py-1 rounded-full">
                  <tag.Icon size={9} className="text-[#004449]/50" />
                  {tag.label}
                </span>
              ))}
            </div>
          )}

          {/* Price + CTA */}
          <div className="border-t border-stone-100 pt-4 flex items-center justify-between">
            <div>
              <p className="text-[9px] text-stone-400 font-semibold uppercase tracking-widest mb-0.5">Monthly rent</p>
              <p className="text-[22px] font-bold text-[#004449] leading-none tracking-tight">
                {formatRentFull(listing.rent)}
                <span className="text-xs font-normal text-stone-400 ml-1">/mo</span>
              </p>
            </div>
            {isOccupied ? (
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-400 bg-stone-100 px-3.5 py-2 rounded-xl">
                Rented
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#004449] group-hover:bg-[#0D9488] px-3.5 py-2 rounded-xl transition-colors duration-300">
                View
                <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform duration-200" />
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}
