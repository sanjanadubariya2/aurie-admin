import StatusBadge from './StatusBadge.jsx'
import { rupees, relative } from '../../lib/format.js'

export default function OrderTable({ orders, onOpen }) {
  return (
    <div className="overflow-hidden rounded-card border border-wick bg-wax">
      <div className="hidden grid-cols-[1fr_1.5fr_0.8fr_0.9fr_1fr] gap-4 border-b border-wick px-5 py-3 md:grid">
        {['Order', 'Customer', 'Placed', 'Total', 'Status'].map((h) => (
          <span key={h} className="label">{h}</span>
        ))}
      </div>

      <ul className="divide-y divide-wick">
        {orders.map((o) => (
          <li key={o.id}>
            <button
              onClick={() => onOpen(o)}
              className="grid w-full grid-cols-1 gap-1.5 px-5 py-3.5 text-left transition-colors hover:bg-ash/60 md:grid-cols-[1fr_1.5fr_0.8fr_0.9fr_1fr] md:items-center md:gap-4"
            >
              <span className="font-display text-[15px] tabular-nums text-soot">{o.reference}</span>

              <span className="min-w-0 text-[14px] text-ink">
                {o.customer?.name || '—'}
                <span className="block truncate text-[12px] text-smoke">{o.customer?.email}</span>
              </span>

              <span className="text-[13px] text-smoke">{relative(o.createdAt)}</span>

              <span className="text-[14px] tabular-nums text-ink">
                {rupees(o.total)}
                <span className="ml-1.5 text-[12px] uppercase text-smoke">{o.payment === 'upi' ? 'UPI' : 'COD'}</span>
              </span>

              <span className="mt-1 md:mt-0">
                <StatusBadge status={o.status} />
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
