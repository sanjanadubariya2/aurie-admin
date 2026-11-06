import { Routes, Route } from 'react-router-dom'
import { ToastProvider } from './context/ToastContext.jsx'
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext.jsx'
import Shell from './components/layout/Shell.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Orders from './pages/Orders.jsx'
import Products from './pages/Products.jsx'
import Security from './pages/Security.jsx'
import Quotes from './pages/Quotes.jsx'
import Production from './pages/Production.jsx'
import Customers from './pages/Customers.jsx'
import Materials from './pages/Materials.jsx'
import Team from './pages/Team.jsx'
import PrintOrder from './pages/PrintOrder.jsx'
import Coupons from './pages/Coupons.jsx'
import Reviews from './pages/Reviews.jsx'
import NotFound from './pages/NotFound.jsx'
import Flame from './components/ui/Flame.jsx'

/**
 * This gate is convenience, not security. The real check is requireAdmin.js on
 * the server — anything here can be bypassed by opening devtools.
 */
function Gate() {
  const { isSignedIn, checking } = useAdminAuth()

  if (checking) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Flame className="h-8 w-5 text-ember" />
      </div>
    )
  }

  if (!isSignedIn) return <Login />

  return (
    <Routes>
      <Route path="print/:id" element={<PrintOrder />} />
      <Route element={<Shell />}>
        <Route index element={<Dashboard />} />
        <Route path="orders" element={<Orders />} />
        <Route path="products" element={<Products />} />
        <Route path="quotes" element={<Quotes />} />
        <Route path="production" element={<Production />} />
        <Route path="customers" element={<Customers />} />
        <Route path="materials" element={<Materials />} />
        <Route path="team" element={<Team />} />
        <Route path="coupons" element={<Coupons />} />
        <Route path="reviews" element={<Reviews />} />
        <Route path="security" element={<Security />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <AdminAuthProvider>
        <Gate />
      </AdminAuthProvider>
    </ToastProvider>
  )
}
