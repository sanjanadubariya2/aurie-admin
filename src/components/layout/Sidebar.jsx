import { NavLink } from 'react-router-dom'
import Flame from '../ui/Flame.jsx'

const items = [
  { to: '/', end: true, label: 'Dashboard', d: 'M2 8L9 2l7 6v8H2V8Z' },
  { to: '/orders', label: 'Orders', d: 'M3 4h12v12H3V4Zm0 4h12M7 4v12' },
  { to: '/products', label: 'Products', d: 'M9 2l7 4v8l-7 4-7-4V6l7-4Zm0 0v16M2 6l7 4 7-4' },
  { to: '/security', label: 'Security', d: 'M9 2l6 2.5v4.5c0 4-2.6 6.6-6 8-3.4-1.4-6-4-6-8V4.5L9 2Zm-2.5 7.5L8.5 11.5l3-3.5' },
]

export default function Sidebar({ pending, onNavigate }) {
  return (
    <div className="flex h-full flex-col bg-soot px-4 py-6 text-wax">
      <div className="flex items-center gap-2 px-2">
        <Flame className="h-5 w-3 text-ember" />
        <span className="font-display text-[19px] font-semibold tracking-[0.12em]">AURIE</span>
      </div>
      <p className="mt-1 px-2 text-[11px] uppercase tracking-label text-wax/40">Admin</p>

      <nav className="mt-8 space-y-1">
        {items.map((item) => (
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
