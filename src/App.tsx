import { useEffect } from 'react'
import {
  BrowserRouter,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom'
import { ToastHost } from './components/ToastHost'
import { HomeView } from './views/HomeView'
import { NotFoundView } from './views/NotFoundView'
import { SessionView } from './views/SessionView'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname])

  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomeView />} />
        <Route path="/s/:slug" element={<SessionView />} />
        <Route path="*" element={<NotFoundView />} />
      </Routes>
      <ToastHost />
    </BrowserRouter>
  )
}
