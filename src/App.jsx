import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { BookmarksProvider } from './context/BookmarksContext'
import HomePage from './pages/HomePage'
import ListingDetailPage from './pages/ListingDetailPage'
import TourBookingPage from './pages/TourBookingPage'
import DepositSaverPage from './pages/DepositSaverPage'
import MoveInPage from './pages/MoveInPage'

export default function App() {
  return (
    <BookmarksProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/listing/:id" element={<ListingDetailPage />} />
        <Route path="/tour/:id" element={<TourBookingPage />} />
        <Route path="/deposit-saver" element={<DepositSaverPage />} />
        <Route path="/move-in/:id" element={<MoveInPage />} />
      </Routes>
    </BrowserRouter>
    </BookmarksProvider>
  )
}
