import { createContext, useContext, useState, useCallback } from 'react'

const BookmarksContext = createContext(null)

export function BookmarksProvider({ children }) {
  const [bookmarks, setBookmarks] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('hf_bookmarks') || '[]')) }
    catch { return new Set() }
  })

  const toggle = useCallback((id) => {
    setBookmarks(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      localStorage.setItem('hf_bookmarks', JSON.stringify([...next]))
      return next
    })
  }, [])

  return (
    <BookmarksContext.Provider value={{ bookmarks, toggle }}>
      {children}
    </BookmarksContext.Provider>
  )
}

export function useBookmarks() {
  return useContext(BookmarksContext)
}
