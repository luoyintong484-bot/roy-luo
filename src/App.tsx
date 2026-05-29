import { Routes, Route, useLocation } from 'react-router'
import { useEffect, useState } from 'react'
import { I18nProvider } from '@/contexts/I18nContext'
import BannerStyleBg from '@/components/BannerStyleBg'
import SubtlePinkBg from '@/components/SubtlePinkBg'
import Home from './pages/Home'
import Login from './pages/Login'
import Profile from './pages/Profile'
import TarotPage from './pages/TarotPage'
import DestinyPage from './pages/DestinyPage'
import IdolPage from './pages/IdolPage'
import ArtistDetail from './pages/ArtistDetail'
import ArtistReading from './pages/ArtistReading'
import IdolCompatibilityPage from './pages/IdolCompatibilityPage'
import IdolCompatibilityDetailPage from './pages/IdolCompatibilityDetailPage'
import ArtistCompatibilityPage from './pages/ArtistCompatibilityPage'
import IdolMatchPage from './pages/IdolMatchPage'
import CpReportPage from './pages/CpReportPage'
import DestinyDetail from './pages/DestinyDetail'
import PaymentPage from './pages/PaymentPage'
import NotFound from './pages/NotFound'

function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const [display, setDisplay] = useState(children)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    setAnimating(true)
    const t = setTimeout(() => {
      setDisplay(children)
      setAnimating(false)
    }, 300)
    return () => clearTimeout(t)
  }, [location.pathname])

  return (
    <div
      className="min-h-screen transition-all duration-300"
      style={{
        opacity: animating ? 0 : 1,
        transform: animating ? 'translateY(20px) scale(0.98)' : 'translateY(0) scale(1)',
      }}
    >
      {display}
    </div>
  )
}

function AppBackground() {
  const location = useLocation();
  if (location.pathname === "/") return <BannerStyleBg />;
  return <SubtlePinkBg />;
}

export default function App() {
  return (
    <I18nProvider>
      <AppBackground />
      <Routes>
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />
        <Route path="/tarot" element={<PageTransition><TarotPage /></PageTransition>} />
        <Route path="/destiny" element={<PageTransition><DestinyPage /></PageTransition>} />
        <Route path="/idol" element={<PageTransition><IdolPage /></PageTransition>} />
        <Route path="/artist/:id" element={<PageTransition><ArtistDetail /></PageTransition>} />
        <Route path="/artist/:id/reading" element={<PageTransition><ArtistReading /></PageTransition>} />
        <Route path="/artist/:id/compatibility" element={<PageTransition><ArtistCompatibilityPage /></PageTransition>} />
        <Route path="/idol-compatibility" element={<PageTransition><IdolCompatibilityPage /></PageTransition>} />
        <Route path="/idol-match" element={<PageTransition><IdolMatchPage /></PageTransition>} />
        <Route path="/cp-report" element={<PageTransition><CpReportPage /></PageTransition>} />
        <Route path="/idol-compatibility/:id" element={<PageTransition><IdolCompatibilityDetailPage /></PageTransition>} />
        <Route path="/destiny-result" element={<PageTransition><DestinyDetail /></PageTransition>} />
        <Route path="/payment" element={<PageTransition><PaymentPage /></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </I18nProvider>
  )
}
