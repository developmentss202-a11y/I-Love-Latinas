import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Banner from './components/Banner'
import ProfileGrid from './components/ProfileGrid'
import RegisterModal from './components/RegisterModal'
import AboutPage from './components/AboutPage'
import ContactPage from './components/ContactPage'
import SupportPage from './components/SupportPage'
import PendingPage from './components/PendingPage'
import WomanProfilePage from './components/WomanProfilePage'
import HotelsPage from './components/HotelsPage'

const ROLE_KEY = 'ill-role'

function readRole() {
  try {
    return sessionStorage.getItem(ROLE_KEY)
  } catch {
    return null
  }
}

function isWomanProfilePath(path) {
  return path === '/profile' || path.startsWith('/profile/') || path === '/my-profile'
}

function writeRole(role) {
  try {
    if (role) sessionStorage.setItem(ROLE_KEY, role)
    else sessionStorage.removeItem(ROLE_KEY)
  } catch {
    /* ignore */
  }
}

function NotFoundPage() {
  return (
    <section className="not-found-page">
      <h1>404</h1>
      <p>Page not exist</p>
    </section>
  )
}

export default function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const path = location.pathname
  const storedRole = readRole()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })

    if (path === '/') writeRole(null)
    else if (path === '/men' || path === '/profiles') writeRole('man')
    else if (path === '/women' || path === '/register' || path === '/hotels' || path === '/pending' || isWomanProfilePath(path)) writeRole('woman')
  }, [path])

  const role =
    path === '/men' || path === '/profiles' || (path === '/contact' && storedRole === 'man')
      ? 'man'
      : path === '/women' || path === '/pending' || path === '/register' || path === '/hotels' || isWomanProfilePath(path)
        ? 'woman'
        : storedRole

  const headerVariant =
    path === '/pending' || path === '/hotels' || isWomanProfilePath(path)
      ? 'dark'
      : path === '/men' || path === '/women' || path === '/register'
        ? 'home'
        : role === 'man'
          ? 'navy'
          : 'default'

  const hideHeader = path === '/'

  const hideFooter =
    path === '/' ||
    path === '/men' ||
    path === '/women' ||
    path === '/register' ||
    path === '/pending' ||
    isWomanProfilePath(path) ||
    role === 'man'

  return (
    <div className={path === '/' ? 'app-shell app-shell--blank' : 'app-shell'}>
      {hideHeader ? null : <Header variant={headerVariant} />}

      <main>
        <Routes>
          <Route path="/" element={<NotFoundPage />} />
          <Route
            path="/men"
            element={
              <Banner
                side="man"
                onSelectMan={() => navigate('/profiles')}
              />
            }
          />
          <Route
            path="/women"
            element={
              <Banner
                side="woman"
                onSelectWoman={() => navigate('/register')}
                onExploreHotels={() => navigate('/hotels')}
              />
            }
          />
          <Route
            path="/register"
            element={
              <Banner
                side="woman"
                onSelectWoman={() => navigate('/register')}
                onExploreHotels={() => navigate('/hotels')}
              />
            }
          />
          <Route path="/hotels" element={<HotelsPage />} />
          <Route
            path="/profiles"
            element={
              <div className="man-theme">
                <ProfileGrid
                  compact
                  onConnect={(profile) =>
                    navigate(`/contact?member=${encodeURIComponent(profile.name)}`)
                  }
                />
              </div>
            }
          />
          <Route path="/pending" element={<PendingPage />} />
          <Route path="/profile/:slug" element={<WomanProfilePage />} />
          <Route path="/my-profile" element={<WomanProfilePage />} />
          <Route path="/profile" element={<Navigate to="/my-profile" replace />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/browse" element={<Navigate to="/profiles" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {hideFooter ? null : <Footer compact={path === '/hotels'} />}

      <RegisterModal
        open={path === '/register'}
        onClose={() => navigate('/women')}
        onGoHome={() => navigate('/pending')}
        onSubmitted={(slug) =>
          navigate(slug ? `/pending?slug=${encodeURIComponent(slug)}` : '/pending')
        }
      />
    </div>
  )
}
