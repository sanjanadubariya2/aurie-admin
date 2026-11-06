import { useCallback, useEffect, useMemo, useState } from 'react'
import PageHeader from '../components/layout/PageHeader.jsx'
import StatusTabs from '../components/orders/StatusTabs.jsx'
import OrderTable from '../components/orders/OrderTable.jsx'
import OrderDrawer from '../components/orders/OrderDrawer.jsx'
import { SearchInput } from '../components/ui/Field.jsx'
import { RowSkeleton } from '../components/ui/Skeleton.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import ErrorNotice from '../components/ui/ErrorNotice.jsx'
import Button from '../components/ui/Button.jsx'
import { fetchOrders } from '../api/orders.js'
import { STATUS_TABS } from '../api/endpoints.js'
import { useDebounced } from '../hooks/useDebounced.js'
import { useAdminAuth } from '../context/AdminAuthContext.jsx'
import { exportUrl } from '../api/ops.js'

export default function Orders() {
  const { staff } = useAdminAuth()
  const [orders, setOrders] = useState(null)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(null)

  const search = useDebounced(query)

  const load = useCallback(() => {
    setError('')
    setOrders(null)
    fetchOrders()
      .then(setOrders)
      .catch((e) => setError(e.message))
  }, [])

  useEffect(load, [load])

  const counts = useMemo(() => {
    const c = { all: orders?.length || 0 }
    STATUS_TABS.forEach((s) => {
      c[s] = orders?.filter((o) => o.status === s).length || 0
    })
    return c
  }, [orders])

  const visible = useMemo(() => {
    if (!orders) return []
    const q = search.trim().toLowerCase()
    return orders.filter((o) => {
      const byStatus = filter === 'all' || o.status === filter
      const byQuery =
        !q ||
        String(o.reference).toLowerCase().includes(q) ||
        (o.customer?.name || '').toLowerCase().includes(q) ||
        (o.customer?.email || '').toLowerCase().includes(q) ||
        String(o.address?.phone || '').includes(q)
      return byStatus && byQuery
    })
  }, [orders, filter, search])

  const onSaved = (saved) => setOrders((list) => list.map((o) => (o.id === saved.id ? saved : o)))

  if (error) return <ErrorNotice message={error} onRetry={load} />

  return (
    <>
      <PageHeader
        title="Orders"
        subtitle={orders ? `${orders.length} total` : 'Loading'}
        action={
          <div className="flex gap-2">
            {staff?.role === 'admin' && (
              <Button as="a" href={exportUrl()} variant="outline" size="sm" title="Last 31 days as a spreadsheet">
                Export CSV
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={load}>
              Refresh
            </Button>
          </div>
        }
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <StatusTabs active={filter} counts={counts} onChange={setFilter} />
        <SearchInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Order number, name, email or phone"
          aria-label="Search orders"
          className="lg:ml-auto lg:w-80"
        />
      </div>

      <div className="mt-6">
        {orders === null ? (
          <RowSkeleton />
        ) : visible.length === 0 ? (
          <EmptyState
            title="No orders match that"
            body="Try another status or clear the search."
            action={
              <Button
                variant="outline"
                onClick={() => {
                  setFilter('all')
                  setQuery('')
                }}
              >
                Clear filters
              </Button>
            }
          />
        ) : (
          <OrderTable orders={visible} onOpen={setOpen} />
        )}
      </div>

      <OrderDrawer order={open} onClose={() => setOpen(null)} onSaved={onSaved} />
    </>
  )
}
