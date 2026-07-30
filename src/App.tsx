import { Navigate, Routes, Route, useLocation } from 'react-router'
import { useEffect, useState } from 'react'
import { detectCountryRemote } from '@/lib/geo'
import { I18nProvider } from '@/contexts/I18nContext'
import BannerStyleBg from '@/components/BannerStyleBg'
import SubtlePinkBg from '@/components/SubtlePinkBg'
import Home from './pages/Home'
import Login from './pages/Login'
import Profile from './pages/Profile'
import TarotPage from './pages/TarotPage'
import ZiweiTarotPage from './pages/ZiweiTarotPage'
import DestinyPage from './pages/DestinyPage'
import IdolPage from './pages/IdolPage'
import ArtistDetail from './pages/ArtistDetail'
import ArtistReading from './pages/ArtistReading'
import IdolCompatibilityPage from './pages/IdolCompatibilityPage'
import IdolCompatibilityDetailPage from './pages/IdolCompatibilityDetailPage'
import ArtistCompatibilityPage from './pages/ArtistCompatibilityPage'
import IdolMatchPage from './pages/IdolMatchPage'
import IdolFanGuidePage from './pages/IdolFanGuidePage'
import CpReportPage from './pages/CpReportPage'
import DestinyDetail from './pages/DestinyDetail'
import DestinyFullReport from './pages/DestinyFullReport'
import SynastryFullReport from './pages/SynastryFullReport'
import AstrologyHome from './pages/astrology/AstrologyHome'
import BirthChartNew from './pages/astrology/BirthChartNew'
import BirthChartVerify from './pages/astrology/BirthChartVerify'
import SynastryNew from './pages/astrology/SynastryNew'
import SynastryVerify from './pages/astrology/SynastryVerify'
import AstrologyError from './pages/astrology/AstrologyError'
import {
  BirthBasicReport,
  BirthFullReportBridge,
  SynastryBasicReport,
  SynastryFullReportBridge,
} from './pages/astrology/AstrologyReports'
import PaymentPage from './pages/PaymentPage'
import PaymentSuccessPage from './pages/PaymentSuccessPage'
import MyReports from './pages/MyReports'
import AdminPage from './pages/AdminPage'
import NotFound from './pages/NotFound'
import PrivacyPolicy from './pages/PrivacyPolicy'

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

function DocumentTitle() {
  const location = useLocation();

  useEffect(() => {
    const titles: Record<string, string> = {
      "/": "R7 Fortune | Tarot · Astrology · Idol Match",
      "/tarot": "塔羅占卜 | R7 Fortune",
      "/ziwei-tarot": "紫微塔羅雙牌 | R7 Fortune",
      "/destiny": "命理專區 | R7 Fortune",
      "/astrology": "命理專區 | R7 Fortune",
      "/idol": "愛豆玄學 | R7 Fortune",
      "/idol-match": "生日追星推薦 | R7 Fortune",
      "/cp-report": "CP 緣分合盤 | R7 Fortune",
      "/payment": "付款解鎖 | R7 Fortune",
      "/profile": "個人中心 | R7 Fortune",
      "/admin": "後台管理 | R7 Fortune",
      "/privacy-policy": "Privacy Policy | R7 Fortune",
    };
    document.title = titles[location.pathname] || "R7 Fortune";
  }, [location.pathname]);

  return null;
}

export default function App() {
  useEffect(() => {
    // Fire IP/VPN geo detection on load; prices re-render when it resolves.
    detectCountryRemote();
  }, []);
  return (
    <I18nProvider>
      <DocumentTitle />
      <AppBackground />
      <Routes>
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />
        <Route path="/tarot" element={<PageTransition><TarotPage /></PageTransition>} />
        <Route path="/ziwei-tarot" element={<PageTransition><ZiweiTarotPage /></PageTransition>} />
        <Route path="/destiny" element={<PageTransition><DestinyPage /></PageTransition>} />
        <Route path="/astrology" element={<PageTransition><AstrologyHome /></PageTransition>} />
        <Route path="/astrology/birth-chart/new" element={<PageTransition><BirthChartNew /></PageTransition>} />
        <Route path="/astrology/birth-chart/:id/verify" element={<PageTransition><BirthChartVerify /></PageTransition>} />
        <Route path="/astrology/birth-chart/:id/error" element={<PageTransition><AstrologyError type="birth" /></PageTransition>} />
        <Route path="/astrology/birth-chart/:id/report" element={<Navigate to="../basic-report" replace />} />
        <Route path="/astrology/birth-chart/:id/basic-report" element={<PageTransition><BirthBasicReport /></PageTransition>} />
        <Route path="/astrology/birth-chart/:id/full-report" element={<PageTransition><BirthFullReportBridge /></PageTransition>} />
        <Route path="/astrology/synastry/new" element={<PageTransition><SynastryNew /></PageTransition>} />
        <Route path="/astrology/synastry/:id/verify" element={<PageTransition><SynastryVerify /></PageTransition>} />
        <Route path="/astrology/synastry/:id/error" element={<PageTransition><AstrologyError type="synastry" /></PageTransition>} />
        <Route path="/astrology/synastry/:id/basic-report" element={<PageTransition><SynastryBasicReport /></PageTransition>} />
        <Route path="/astrology/synastry/:id/full-report" element={<PageTransition><SynastryFullReportBridge /></PageTransition>} />
        <Route path="/idol" element={<PageTransition><IdolPage /></PageTransition>} />
        <Route path="/artist/:id" element={<PageTransition><ArtistDetail /></PageTransition>} />
        <Route path="/artist/:id/reading" element={<PageTransition><ArtistReading /></PageTransition>} />
        <Route path="/artist/:id/compatibility" element={<PageTransition><ArtistCompatibilityPage /></PageTransition>} />
        <Route path="/idol-compatibility" element={<PageTransition><IdolCompatibilityPage /></PageTransition>} />
        <Route path="/idol-match" element={<PageTransition><IdolMatchPage /></PageTransition>} />
        <Route path="/idol-guide" element={<PageTransition><IdolFanGuidePage /></PageTransition>} />
        <Route path="/cp-report" element={<PageTransition><CpReportPage /></PageTransition>} />
        <Route path="/idol-compatibility/:id" element={<PageTransition><IdolCompatibilityDetailPage /></PageTransition>} />
        <Route path="/destiny-result" element={<PageTransition><DestinyDetail /></PageTransition>} />
        <Route path="/destiny-full-report" element={<PageTransition><DestinyFullReport /></PageTransition>} />
        <Route path="/synastry-full-report" element={<PageTransition><SynastryFullReport /></PageTransition>} />
        <Route path="/wellness" element={<Navigate to="/" replace />} />
        <Route path="/wellness/*" element={<Navigate to="/" replace />} />
        <Route path="/payment" element={<PageTransition><PaymentPage /></PageTransition>} />
        <Route path="/payment-success" element={<PageTransition><PaymentSuccessPage /></PageTransition>} />
        <Route path="/my-reports" element={<PageTransition><MyReports /></PageTransition>} />
        <Route path="/admin" element={<PageTransition><AdminPage /></PageTransition>} />
        <Route path="/privacy-policy" element={<PageTransition><PrivacyPolicy /></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </I18nProvider>
  )
}
