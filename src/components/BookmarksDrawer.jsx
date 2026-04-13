import { Link } from 'react-router-dom'
import { X, Bookmark, ArrowRight, Zap, Maximize2 } from 'lucide-react'
import { useBookmarks } from '../context/BookmarksContext'
import { LISTINGS, formatRentFull } from '../data/listings'

export default function BookmarksDrawer({ open, onClose }) {
  const { bookmarks, toggle } = useBookmarks()
  const saved = LISTINGS.filter(l => bookmarks.has(l.id))

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-[400px] z-[70] bg-white shadow-2xl transition-transform duration-300 ease-out flex flex-col ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#004449] flex items-center justify-center">
              <Bookmark size={13} className="text-white fill-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#004449]">Saved Homes</p>
              <p className="text-[10px] text-stone-400 font-medium">{saved.length} listing{saved.length !== 1 ? 's' : ''} saved</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 transition-colors">
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {saved.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center mb-4">
                <Bookmark size={22} className="text-stone-300" />
              </div>
              <p className="text-sm font-semibold text-stone-400 mb-1">No saved homes yet</p>
              <p className="text-xs text-stone-300 max-w-[200px]">Tap the bookmark icon on any listing to save it here</p>
            </div>
          ) : (
            saved.map(l => {
              const savings = l.priceBreakdown.deposit - l.depositSaverAmount
              return (
                <div key={l.id} className="group bg-stone-50/60 border border-stone-100 rounded-2xl overflow-hidden hover:border-[#0D9488]/30 hover:shadow-md transition-all">
                  <Link
                    to={`/listing/${l.id}`}
                    onClick={() => { window.scrollTo({ top: 0, behavior: 'instant' }); onClose() }}
                    className="flex gap-0"
                  >
                    {/* Photo */}
                    <div className="w-28 shrink-0 relative self-stretch overflow-hidden">
                      <img
                        src={l.images[0]}
                        alt={l.society}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={e => { e.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=80' }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-stone-50/20" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 p-3.5">
                      <p className="text-[9px] font-bold text-[#0D9488] uppercase tracking-widest mb-0.5">{l.location}</p>
                      <p className="text-[13px] font-semibold text-[#004449] leading-snug line-clamp-2 mb-2">{l.society}</p>
                      <div className="flex items-center gap-2 mb-2.5">
                        <span className="text-[10px] text-stone-400 font-medium flex items-center gap-1">
                          <Maximize2 size={9} />{l.sqft.toLocaleString()} sq ft
                        </span>
                        <span className="text-[10px] text-stone-400">·</span>
                        <span className="text-[10px] text-stone-400 font-medium">{l.bhk}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-[#004449]">{formatRentFull(l.rent)}<span className="text-[10px] font-normal text-stone-400 ml-0.5">/mo</span></p>
                        <ArrowRight size={12} className="text-stone-300 group-hover:text-[#0D9488] transition-colors" />
                      </div>
                      {savings > 0 && (
                        <div className="flex items-center gap-1 mt-1.5">
                          <Zap size={8} className="text-[#0D9488]" />
                          <span className="text-[9px] text-[#0D9488] font-semibold">Save {formatRentFull(savings)} deposit</span>
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Remove button */}
                  <div className="border-t border-stone-100 px-3.5 py-2 flex items-center justify-between">
                    <span className={`text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${l.status === 'available' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                      {l.status === 'available' ? 'Available now' : 'Reserved'}
                    </span>
                    <button
                      onClick={() => toggle(l.id)}
                      className="text-[10px] font-semibold text-stone-400 hover:text-red-500 transition-colors flex items-center gap-1"
                    >
                      <X size={10} /> Remove
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </>
  )
}
