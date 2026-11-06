import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import Flame from '../ui/Flame.jsx'
import { useAdminAuth } from '../../context/AdminAuthContext.jsx'
import { fetchOrders } from '../../api/orders.js'
import { fetchQuotes } from '../../api/quotes.js'

export default function Shell() {
  const { staff, signOut } = useAdminAuth()
  const [pending, setPending] = useState(0)
  const [newQuotes, setNewQuotes] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  // Badge count for the sidebar. Failing quietly is correct here — a broken
  // badge should never block the page you actually navigated to.
  useEffect(() => {
    fetchOrders()
      .then((orders) => setPending(orders.filter((o) => ['placed', 'confirmed'].includes(o.status)).length))
      .catch(() => setPending(0))
    fetchQuotes('new')
      .then((q) => setNewQuotes(q.length))
      .catch(() => setNewQuotes(0))
  }, [location.pathname])

  useEffect(() => setMenuOpen(false), [location])

  return (
    <div className="min-h-screen lg:flex">
      <aside className="sticky top-0 hidden h-screen w-[220px] shrink-0 lg:block">
        <Sidebar pending={pending} newQuotes={newQuotes} />
      </aside>

      <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-wick bg-ash/90 px-4 backdrop-blur-md lg:hidden">
        <button
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          className="grid h-9 w-9 place-items-center rounded-full text-soot"
        >
          <svg viewBox="0 0 18 12" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M0 1h18M0 6h18M0 11h18" strokeLinecap="round" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <Flame className="h-4 w-2.5 text-ember" />
          <span className="font-display text-[17px] font-semibold tracking-[0.12em] text-soot">AURIE</span>
        </div>
        <button onClick={signOut} className="ml-auto text-[13px] text-smoke underline underline-offset-4">
          Sign out
        </button>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 animate-fadeIn bg-soot/50" onClick={() => setMenuOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-[240px] animate-fadeIn">
            <Sidebar pending={pending} newQuotes={newQuotes} onNavigate={() => setMenuOpen(false)} />
          </div>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="hidden items-center justify-end gap-4 px-8 pt-6 lg:flex">
          <span className="text-[13px] text-smoke">{staff?.email}</span>
          <button onClick={signOut} className="text-[13px] text-smoke underline underline-offset-4 hover:text-soot">
            Sign out
          </button>
        </div>
        <main className="px-4 pb-24 pt-6 sm:px-6 lg:px-8">
          {staff && staff.totpEnabled === false && location.pathname !== '/security' && (
            <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-ember/30 bg-ember/[0.06] px-4 py-3 text-[14px] text-ink">
              <span>
                <span className="font-medium">Two-factor sign-in is off.</span> Anyone with your password can get in.
              </span>
              <Link to="/security" className="ml-auto rounded-full bg-soot px-3.5 py-1.5 text-[13px] text-wax">
                Turn it on
              </Link>
            </div>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  )
}
