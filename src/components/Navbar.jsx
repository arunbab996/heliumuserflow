import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Bookmark, Search, Trash2, ChevronRight } from 'lucide-react'
import { useBookmarks } from '../context/BookmarksContext'
import BookmarksDrawer from './BookmarksDrawer'

function useSavedSearches() {
  const [searches, setSearches] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hf_saved_searches') || '[]') }
    catch { return [] }
  })
  useEffect(() => {
    const sync = () => {
      try { setSearches(JSON.parse(localStorage.getItem('hf_saved_searches') || '[]')) }
      catch { setSearches([]) }
    }
    window.addEventListener('storage', sync)
    window.addEventListener('hf_saved_searches_updated', sync)
    return () => { window.removeEventListener('storage', sync); window.removeEventListener('hf_saved_searches_updated', sync) }
  }, [])
  const remove = (id) => {
    const updated = searches.filter(s => s.id !== id)
    setSearches(updated)
    localStorage.setItem('hf_saved_searches', JSON.stringify(updated))
    window.dispatchEvent(new Event('hf_saved_searches_updated'))
  }
  return { searches, remove }
}

export default function Navbar({ variant = 'home' }) {
  const { bookmarks } = useBookmarks()
  const { searches, remove } = useSavedSearches()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('homes')
  const menuRef = useRef(null)

  useEffect(() => {
    const close = e => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  return (
    <>
      <div>
        {/* ── Thin accent line ─────────────────────────────── */}
        <div className="h-[3px]" style={{ background: 'linear-gradient(90deg, #004449 0%, #0D9488 50%, #0ea5e9 100%)' }} />

        {/* ── Main navbar ────────────────────────────────── */}
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-stone-100/80">
          <div className="max-w-screen-xl mx-auto flex items-center justify-between px-5 md:px-8 h-[58px]">

            {/* Logo → homepage */}
            <Link to="/" className="shrink-0 flex items-center">
              <img
                src="https://heliumhomes.in/logos/logo_helium_dark.svg"
                alt="Helium"
                className="h-7"
                onError={e => {
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'flex'
                }}
              />
              <span style={{ display: 'none' }} className="items-center gap-1.5">
                <span className="flex items-center justify-center w-6 h-6 rounded bg-[#004449] text-white">
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                    <path d="M7 1L13 6V13H9V9H5V13H1V6L7 1Z" fill="currentColor"/>
                  </svg>
                </span>
                <span className="font-bold text-[#004449] text-lg tracking-tight" style={{ fontFamily: "'Cormorant Garamond', serif" }}>helium</span>
              </span>
            </Link>

            {/* Center — renter/homeowner tabs on detail page */}
            {variant !== 'home' && (
              <nav className="hidden md:flex items-center gap-6">
                <span className="text-sm font-semibold text-[#004449] border-b-2 border-[#004449] pb-0.5" style={{ fontFamily: "'DM Sans', sans-serif" }}>I am a Renter</span>
                <button className="text-sm text-stone-400 hover:text-stone-700 transition-colors font-medium">Homeowner</button>
              </nav>
            )}

            {/* Right — Hi Arun pill with dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(o => !o)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-stone-200/80 shadow-sm hover:shadow-md transition-all duration-200"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(240,238,233,0.92) 100%)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <span className="w-6 h-6 rounded-full bg-[#004449] flex items-center justify-center text-white text-[10px] font-bold shrink-0">S</span>
                <span className="text-sm font-semibold text-[#004449] pr-0.5" style={{ fontFamily: "'DM Sans', sans-serif" }}>Hi, Sahil</span>
                {(bookmarks.size > 0 || searches.length > 0) && (
                  <span className="w-4 h-4 rounded-full bg-[#0D9488] text-white text-[9px] font-bold flex items-center justify-center">
                    {bookmarks.size + searches.length}
                  </span>
                )}
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-[calc(100%+10px)] w-80 bg-white rounded-2xl shadow-2xl border border-stone-100/80 overflow-hidden z-50">

                  {/* Header */}
                  <div className="px-5 pt-4 pb-3 border-b border-stone-100">
                    <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">My Helium</p>
                  </div>

                  {/* Tabs */}
                  <div className="flex gap-1 px-4 pt-3">
                    {[
                      { key: 'homes',    icon: Bookmark, label: 'Saved Homes',    count: bookmarks.size },
                      { key: 'searches', icon: Search,   label: 'Saved Searches', count: searches.length },
                    ].map(({ key, icon: Icon, label, count }) => (
                      <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                          activeTab === key
                            ? 'bg-[#004449] text-white'
                            : 'text-stone-400 hover:bg-stone-100 hover:text-stone-700'
                        }`}
                      >
                        <Icon size={11} />
                        {label}
                        {count > 0 && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === key ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-500'}`}>
                            {count}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Saved Homes */}
                  {activeTab === 'homes' && (
                    <div className="px-4 py-4">
                      {bookmarks.size === 0 ? (
                        <div className="py-8 text-center">
                          <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-3">
                            <Bookmark size={16} className="text-stone-300" />
                          </div>
                          <p className="text-sm font-medium text-stone-400">No saved homes yet</p>
                          <p className="text-xs text-stone-300 mt-1">Tap the bookmark icon on any listing</p>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setMenuOpen(false); setDrawerOpen(true) }}
                          className="w-full flex items-center justify-between p-3.5 rounded-xl bg-stone-50 hover:bg-[#004449]/5 hover:border-[#004449]/10 border border-transparent transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-[#004449] flex items-center justify-center shrink-0">
                              <Bookmark size={14} className="text-white" />
                            </div>
                            <div className="text-left">
                              <p className="text-sm font-semibold text-[#004449]">{bookmarks.size} saved home{bookmarks.size > 1 ? 's' : ''}</p>
                              <p className="text-xs text-stone-400 mt-0.5">View all saved listings</p>
                            </div>
                          </div>
                          <ChevronRight size={14} className="text-stone-300 group-hover:text-[#0D9488] transition-colors" />
                        </button>
                      )}
                    </div>
                  )}

                  {/* Saved Searches */}
                  {activeTab === 'searches' && (
                    <div className="px-4 py-4 max-h-72 overflow-y-auto">
                      {searches.length === 0 ? (
                        <div className="py-8 text-center">
                          <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-3">
                            <Search size={16} className="text-stone-300" />
                          </div>
                          <p className="text-sm font-medium text-stone-400">No saved searches yet</p>
                          <p className="text-xs text-stone-300 mt-1">Save a search from the filter bar</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {searches.map(s => (
                            <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 hover:bg-stone-100 transition-colors group">
                              <div className="w-8 h-8 rounded-lg bg-[#004449]/[0.07] flex items-center justify-center shrink-0">
                                <Search size={12} className="text-[#004449]" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-[#004449] truncate">{s.label}</p>
                                <p className="text-xs text-stone-400 mt-0.5">{s.matchCount} matches · {s.layout !== 'all' ? s.layout : 'Any layout'}</p>
                              </div>
                              <button
                                onClick={() => remove(s.id)}
                                className="w-7 h-7 rounded-full flex items-center justify-center text-stone-300 hover:text-red-400 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 shrink-0"
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="px-4 pb-4" />
                </div>
              )}
            </div>
          </div>
        </header>
      </div>

      <BookmarksDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  )
}
