import { rupees, shortDate } from '../../lib/format.js'

/** Fourteen bars. Not worth a charting library. */
export default function RevenueChart({ days }) {
  if (!days?.length) return null
  const max = Math.max(...days.map((d) => d.revenue), 1)

  return (
    <div className="rounded-card border border-wick bg-wax p-5 sm:p-6">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-[19px] text-soot">Revenue, last 14 days</h2>
        <span className="text-[13px] tabular-nums text-smoke">
          {rupees(days.reduce((s, d) => s + d.revenue, 0))}
        </span>
      </div>

      <div className="mt-6 flex h-40 items-end gap-1.5">
        {days.map((d) => (
          <div key={d.date} className="group relative flex-1">
            <div
              className="w-full rounded-t-[3px] bg-soot/85 transition-colors group-hover:bg-ember"
              style={{ height: `${Math.max((d.revenue / max) * 152, 3)}px` }}
            />
            <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-soot px-2.5 py-1.5 text-[12px] text-wax group-hover:block">
              {rupees(d.revenue)} · {d.orders} {d.orders === 1 ? 'order' : 'orders'}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-2 flex justify-between text-[11px] text-smoke">
        <span>{shortDate(days[0].date)}</span>
        <span>{shortDate(days[days.length - 1].date)}</span>
      </div>
    </div>
  )
}
