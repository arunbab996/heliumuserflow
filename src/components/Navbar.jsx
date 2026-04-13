import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bookmark } from 'lucide-react'
import { useBookmarks } from '../context/BookmarksContext'
import BookmarksDrawer from './BookmarksDrawer'

export default function Navbar({ variant = 'home' }) {
  const navigate = useNavigate()
  const { bookmarks } = useBookmarks()
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      <div>
        {/* ── Thin accent line ─────────────────────────────── */}
        <div className="h-[3px]" style={{ background: 'linear-gradient(90deg, #004449 0%, #0D9488 50%, #0ea5e9 100%)' }} />

        {/* ── Main navbar ────────────────────────────────── */}
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-stone-100/80">
          <div className="max-w-screen-xl mx-auto flex items-center justify-between px-5 md:px-8 h-[58px]">

            {/* Logo */}
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

            {/* Right */}
            <div className="flex items-center gap-2.5">
              {/* Saved bookmarks icon */}
              <button
                onClick={() => setDrawerOpen(true)}
                className="relative w-8 h-8 rounded-full bg-stone-100 hover:bg-[#004449]/10 flex items-center justify-center text-stone-500 hover:text-[#004449] transition-colors"
              >
                <Bookmark size={14} />
                {bookmarks.size > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#0D9488] text-white text-[9px] font-bold flex items-center justify-center">
                    {bookmarks.size}
                  </span>
                )}
              </button>

              {/* Deposit Saver pill */}
              <button
                onClick={() => navigate('/deposit-saver')}
                className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold text-[#004449] border border-[#004449]/25 hover:border-[#0D9488] hover:bg-[#0D9488]/5 hover:text-[#0D9488] px-3 py-1.5 rounded-full transition-all tracking-wide uppercase"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488]" />
                Deposit Saver
              </button>

              {/* Hi Arun — glossy pill */}
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-stone-200/80 shadow-sm hover:shadow-md transition-all duration-200"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(240,238,233,0.92) 100%)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <span className="w-6 h-6 rounded-full bg-[#004449] flex items-center justify-center text-white text-[10px] font-bold shrink-0">A</span>
                <span className="text-sm font-semibold text-[#004449] pr-0.5" style={{ fontFamily: "'DM Sans', sans-serif" }}>Hi, Arun</span>
              </button>
            </div>
          </div>
        </header>
      </div>

      <BookmarksDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  )
}
