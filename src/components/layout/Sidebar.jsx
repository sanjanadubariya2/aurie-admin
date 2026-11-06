import { NavLink } from 'react-router-dom'
import Flame from '../ui/Flame.jsx'

// `owner: true` items are hidden from staff (the API refuses them anyway).
const items = [
  { to: '/', end: true, label: 'Dashboard', d: 'M2 8L9 2l7 6v8H2V8Z' },
  { to: '/orders', label: 'Orders', d: 'M3 4h12v12H3V4Zm0 4h12M7 4v12' },
  { to: '/production', label: 'Pour list', d: 'M9 2c1.2 3.2 4 4.4 4 8.4A4 4 0 015 10.4c0-2 1-3.2 2-4.2 0 1.8.8 3 2 3 0-3-.6-4.4 0-7.2Z' },
  { to: '/quotes', label: 'Requests', d: 'M3 3h12v9H8l-4 3v-3H3V3Zm3 4h6M6 9.5h4' },
  { to: '/products', label: 'Products', d: 'M9 2l7 4v8l-7 4-7-4V6l7-4Zm0 0v16M2 6l7 4 7-4' },
  { to: '/materials', label: 'Materials', d: 'M3 6h12v9H3V6Zm2-3h8l2 3H3l2-3Zm2 7h4' },
  { to: '/reviews', label: 'Reviews', d: 'M9 2l2.2 4.6 5 .7-3.6 3.5.9 5L9 13.4l-4.5 2.4.9-5L1.8 7.3l5-.7L9 2Z' },
  { to: '/coupons', label: 'Discounts', owner: true, d: 'M3 3h6l7 7-6 6-7-7V3Zm3.5 3.5h.01' },
  { to: '/customers', label: 'Customers', owner: true, d: 'M6.5 8a2.5 2.5 0 100-5 2.5 2.5 0 000 5ZM2 15c0-2.5 2-4 4.5-4S11 12.5 11 15M12 4.5a2.3 2.3 0 010 4.5M13.5 11c1.6.4 2.5 1.8 2.5 4' },
  { to: '/team', label: 'Team', owner: true, d: 'M9 9a3 3 0 100-6 3 3 0 000 6Zm-5 7c0-3 2.2-5 5-5s5 2 5 5' },
  { to: '/security', label: 'Security', d: 'M9 2l6 2.5v4.5c0 4-2.6 6.6-6 8-3.4-1.4-6-4-6-8V4.5L9 2Zm-2.5 7.5L8.5 11.5l3-3.5' },
]

export default function Sidebar({ pending, newQuotes = 0, role, onNavigate }) {
  return (
    <div className="flex h-full flex-col bg-soot px-4 py-6 text-wax">
      <div className="flex items-center gap-2 px-2">
        <Flame className="h-5 w-3 text-ember" />
        <span className="font-display text-[19px] font-semibold tracking-[0.12em]">AURIE</span>
      </div>
      <p className="mt-1 px-2 text-[11px] uppercase tracking-label text-wax/40">{role === 'staff' ? 'Staff' : 'Admin'}</p>

      <nav className="mt-8 space-y-1">
        {items.filter((item) => !item.owner || role === 'admin').map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] transition-colors
               ${isActive ? 'bg-wax/12 text-wax' : 'text-wax/55 hover:bg-wax/[0.06] hover:text-wax'}`
            }
          >
            <svg viewBox="0 0 18 18" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.3">
              <path d={item.d} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {item.label}
            {item.label === 'Requests' && newQuotes > 0 && (
              <span className="ml-auto grid h-5 min-w-[20px] place-items-center rounded-full bg-glow px-1 text-[11px] tabular-nums text-soot">
                {newQuotes}
              </span>
            )}
            {item.label === 'Orders' && pending > 0 && (
              <span className="ml-auto grid h-5 min-w-[20px] place-items-center rounded-full bg-ember px-1 text-[11px] tabular-nums text-wax">
                {pending}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <a
        href={import.meta.env.VITE_STOREFRONT_URL || 'http://localhost:5173'}
        target="_blank"
        rel="noreferrer"
        className="mt-auto flex items-center gap-2 px-3 py-2 text-[13px] text-wax/45 hover:text-wax"
      >
        View storefront
        <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.4">
          <path d="M4 2h6v6M10 2L2 10" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>
    </div>
  )
}
