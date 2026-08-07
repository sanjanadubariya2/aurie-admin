import { Link } from 'react-router-dom'
import StatusBadge from '../orders/StatusBadge.jsx'
import { rupees, relative } from '../../lib/format.js'

/** The only list on the dashboard that is a to-do rather than a report. */
export default function AttentionQueue({ orders, onOpen }) {
  return (
    <section className="rounded-card border border-wick bg-wax">
      <div className="flex items-center justify-between border-b border-wick px-5 py-4">
        <h2 className="font-display text-[19px] text-soot">Needs your attention</h2>
        <Link to="/orders" className="text-[13px] text-smoke underline underline-offset-4 hover:text-soot">
          All orders
        </Link>
      </div>

      {orders.length === 0 ? (
        <p className="px-5 py-10 text-center text-[15px] text-smoke">
          Everything is shipped. Nothing waiting on you.
        </p>
      ) : (
        <ul className="divide-y divide-wick">
          {orders.map((o) => (
            <li key={o.id}>
              <button
                onClick={() => onOpen(o)}
                className="flex w-full items-center gap-4 px-5 py-3.5 text-left transition-colors hover:bg-ash/60"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] text-soot">{o.customer?.name || o.reference}</p>
                  <p className="text-[12px] text-smoke">
                    {o.reference} · {relative(o.createdAt)} · {rupees(o.total)}
                  </p>
                </div>
                <StatusBadge status={o.status} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
