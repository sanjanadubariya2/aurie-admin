import { useCallback, useEffect, useMemo, useState } from 'react'
import PageHeader from '../components/layout/PageHeader.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import ErrorNotice from '../components/ui/ErrorNotice.jsx'
import { SearchInput } from '../components/ui/Field.jsx'
import { RowSkeleton } from '../components/ui/Skeleton.jsx'
import { fetchCustomers } from '../api/ops.js'
import { useDebounced } from '../hooks/useDebounced.js'
import { rupees, shortDate, relative } from '../lib/format.js'

/** Everyone who has bought, ranked by lifetime spend (net of refunds). */
export default function Customers() {
  const [list, setList] = useState(null)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [repeatOnly, setRepeatOnly] = useState(false)
  const search = useDebounced(query)

  const load = useCallback(() => {
    setError('')
    fetchCustomers()
      .then(setList)
      .catch((e) => setError(e.message))
  }, [])
  useEffect(load, [load])

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    return (list || []).filter(
      (c) => (!repeatOnly || c.repeat) && (!q || [c.email, c.name, c.phone, c.city].some((v) => String(v || '').toLowerCase().includes(q))),
    )
  }, [list, search, repeatOnly])

  const stats = useMemo(() => {
    const all = list || []
    const repeat = all.filter((c) => c.repeat).length
    return { count: all.length, repeatRate: all.length ? Math.round((repeat / all.length) * 100) : 0, spend: all.reduce((s, c) => s + c.spend, 0) }
  }, [list])

  if (error) return <ErrorNotice message={error} onRetry={load} />

  return (
    <>
      <PageHeader title="Customers" subtitle={list ? `${stats.count} buyers · ${stats.repeatRate}% came back · ${rupees(stats.spend)} lifetime` : 'Loading'} />
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="min-w-[240px] flex-1">
          <SearchInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Email, name, phone or city" aria-label="Search customers" />
        </div>
        <label className="flex items-center gap-2 text-[14px] text-ink">
          <input type="checkbox" checked={repeatOnly} onChange={(e) => setRepeatOnly(e.target.checked)} className="h-4 w-4 accent-[#C1441E]" />
          Repeat buyers only
        </label>
      </div>

      {list === null ? (
        <RowSkeleton />
      ) : visible.length === 0 ? (
        <EmptyState title="No customers yet" body="Anyone who places an order shows up here." />
      ) : (
        <div className="overflow-x-auto rounded-card border border-wick bg-wax">
          <table className="w-full min-w-[720px] text-left text-[14px]">
            <thead>
              <tr className="border-b border-wick">
                {['Customer', 'City', 'Orders', 'Spend', 'First order', 'Last order'].map((h) => (
                  <th key={h} className="label px-5 py-3 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-wick">
              {visible.map((c) => (
                <tr key={c.id} className="hover:bg-ash/50">
                  <td className="px-5 py-3">
                    <span className="block text-soot">
                      {c.name || '—'}
                      {c.repeat && <span className="ml-2 rounded-full bg-sea/15 px-2 py-0.5 text-[11px] text-sea">repeat</span>}
                    </span>
                    <span className="block text-[12px] text-smoke">
                      {c.email}
                      {c.phone && (
                        <>
                          {' · '}
                          <a href={`https://wa.me/91${c.phone}`} target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-soot">
                            {c.phone}
                          </a>
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-ink">{c.city}</td>
                  <td className="px-5 py-3 tabular-nums text-ink">{c.orders}</td>
                  <td className="px-5 py-3 font-display tabular-nums text-soot">{rupees(c.spend)}</td>
                  <td className="px-5 py-3 text-smoke">{shortDate(c.firstOrder)}</td>
                  <td className="px-5 py-3 text-smoke">{relative(c.lastOrder)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
