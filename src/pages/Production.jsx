import { useCallback, useEffect, useState } from 'react'
import PageHeader from '../components/layout/PageHeader.jsx'
import Button from '../components/ui/Button.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import ErrorNotice from '../components/ui/ErrorNotice.jsx'
import StatusBadge from '../components/orders/StatusBadge.jsx'
import { RowSkeleton } from '../components/ui/Skeleton.jsx'
import { fetchProduction } from '../api/ops.js'
import { longDate, shortDate } from '../lib/format.js'

const daysUntil = (d) => Math.ceil((new Date(d).getTime() - Date.now()) / 86_400_000)

/**
 * The pour list: what to make right now, summed across every order that is new
 * or pouring, grouped by candle, size and colour note. Occasion deadlines
 * (needed-by dates) come first. Prints cleanly for the workbench.
 */
export default function Production() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [done, setDone] = useState(() => new Set())

  const load = useCallback(() => {
    setError('')
    setData(null)
    fetchProduction()
      .then(setData)
      .catch((e) => setError(e.message))
  }, [])
  useEffect(load, [load])

  if (error) return <ErrorNotice message={error} onRetry={load} />

  const toggle = (key) =>
    setDone((s) => {
      const next = new Set(s)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })

  return (
    <>
      <PageHeader
        title="Pour list"
        subtitle={data ? `${data.totals.units} candles across ${data.totals.orders} orders · ${longDate(new Date())}` : 'Loading'}
        action={
          <div className="flex gap-2 print:hidden">
            <Button variant="outline" size="sm" onClick={load}>
              Refresh
            </Button>
            <Button size="sm" onClick={() => window.print()}>
              Print
            </Button>
          </div>
        }
      />

      {data === null ? (
        <RowSkeleton />
      ) : data.items.length === 0 ? (
        <EmptyState title="Nothing to pour" body="New orders and orders marked “Pouring started” show up here." />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
          <section className="overflow-hidden rounded-card border border-wick bg-wax">
            <div className="grid grid-cols-[28px_1fr_70px] gap-3 border-b border-wick px-5 py-3 sm:grid-cols-[28px_1fr_90px_140px]">
              <span />
              <span className="label">Candle</span>
              <span className="label text-right">Units</span>
              <span className="label hidden sm:block">Deadline</span>
            </div>
            <ul className="divide-y divide-wick">
              {data.items.map((g) => {
                const checked = done.has(g.key)
                const urgent = g.neededBy && daysUntil(g.neededBy) <= 3
                return (
                  <li key={g.key} className={`grid grid-cols-[28px_1fr_70px] items-center gap-3 px-5 py-3.5 sm:grid-cols-[28px_1fr_90px_140px] ${checked ? 'opacity-45' : ''}`}>
                    <input type="checkbox" checked={checked} onChange={() => toggle(g.key)} aria-label={`Poured ${g.name}`} className="h-4 w-4 accent-[#C1441E]" />
                    <span className="flex min-w-0 items-center gap-3">
                      {g.image ? <img src={g.image} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover print:hidden" /> : null}
                      <span className="min-w-0">
                        <span className={`block text-[15px] text-soot ${checked ? 'line-through' : ''}`}>
                          {g.name} <span className="text-smoke">· {g.tierLabel}</span>
                        </span>
                        {g.note && <span className="mt-0.5 block truncate rounded bg-glow/20 px-1.5 text-[13px] italic text-ink">{g.note}</span>}
                        <span className="mt-0.5 block truncate text-[12px] text-smoke">{g.orders.map((o) => `${o.orderNumber}×${o.count}`).join(', ')}</span>
                      </span>
                    </span>
                    <span className="text-right font-display text-[22px] tabular-nums text-soot">{g.units}</span>
                    <span className={`hidden text-[13px] sm:block ${urgent ? 'font-medium text-ember' : 'text-smoke'}`}>
                      {g.neededBy ? `${shortDate(g.neededBy)} (${daysUntil(g.neededBy)}d)` : '—'}
                    </span>
                  </li>
                )
              })}
            </ul>
          </section>

          <section className="rounded-card border border-wick bg-wax print:break-before-page">
            <h2 className="border-b border-wick px-5 py-3.5 font-display text-[18px] text-soot">Order queue</h2>
            <ul className="divide-y divide-wick">
              {data.queue.map((o) => {
                const due = o.neededBy || o.expectedBy
                const left = daysUntil(due)
                return (
                  <li key={o.id} className="flex items-center gap-3 px-5 py-3">
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] tabular-nums text-soot">
                        {o.orderNumber} <span className="text-smoke">· {o.units} pcs · {o.city}</span>
                        {o.gift && <span className="ml-1.5 rounded-full bg-glow/30 px-1.5 text-[11px] text-[#8A5A12]">gift</span>}
                      </span>
                      <span className={`block text-[12px] ${left <= 2 ? 'text-ember' : 'text-smoke'}`}>
                        {o.neededBy ? 'Needed by' : 'Promised by'} {shortDate(due)} · {left < 0 ? `${-left}d late` : `${left}d left`}
                      </span>
                    </span>
                    <StatusBadge status={o.status} />
                  </li>
                )
              })}
            </ul>
          </section>
        </div>
      )}
    </>
  )
}
