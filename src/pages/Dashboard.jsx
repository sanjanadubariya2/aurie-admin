import { useCallback, useEffect, useState } from 'react'
import PageHeader from '../components/layout/PageHeader.jsx'
import StatCard from '../components/dashboard/StatCard.jsx'
import RevenueChart from '../components/dashboard/RevenueChart.jsx'
import TopProducts from '../components/dashboard/TopProducts.jsx'
import AttentionQueue from '../components/dashboard/AttentionQueue.jsx'
import OrderDrawer from '../components/orders/OrderDrawer.jsx'
import Skeleton from '../components/ui/Skeleton.jsx'
import ErrorNotice from '../components/ui/ErrorNotice.jsx'
import { fetchDashboard } from '../api/stats.js'
import { rupees } from '../lib/format.js'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [open, setOpen] = useState(null)

  const load = useCallback(() => {
    setError('')
    setData(null)
    fetchDashboard()
      .then(setData)
      .catch((e) => setError(e.message))
  }, [])

  useEffect(load, [load])

  const onSaved = (saved) =>
    setData((d) => ({ ...d, orders: d.orders.map((o) => (o.id === saved.id ? saved : o)) }))

  if (error) return <ErrorNotice message={error} onRetry={load} />

  if (!data) {
    return (
      <>
        <Skeleton className="h-8 w-52" />
        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-card" />
          ))}
        </div>
        <Skeleton className="mt-6 h-64 rounded-card" />
      </>
    )
  }

  const { stats, orders } = data
  const queue = orders.filter((o) => ['placed', 'confirmed'].includes(o.status)).slice(0, 6)

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Last 14 days" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Revenue" value={rupees(stats.revenue)} sub={`${stats.orderCount} orders`} />
        <StatCard label="Average order" value={rupees(stats.averageOrder)} sub="Across all collections" />
        <StatCard
          label="Waiting on you"
          value={stats.pending}
          sub="New or still pouring"
          tone={stats.pending > 0 ? 'alert' : 'default'}
        />
        <StatCard label="Cash on delivery" value={`${stats.codShare}%`} sub="Rest paid by UPI" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <RevenueChart days={stats.days} />
        <TopProducts items={stats.topProducts} />
      </div>

      <div className="mt-6">
        <AttentionQueue orders={queue} onOpen={setOpen} />
      </div>

      {stats.derived && (
        <p className="mt-4 text-[12px] text-smoke">
          Figures calculated from the orders list. Add GET /admin/stats to compute them server-side.
        </p>
      )}

      <OrderDrawer order={open} onClose={() => setOpen(null)} onSaved={onSaved} />
    </>
  )
}
