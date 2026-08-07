import { MOCK, get, delay } from './client.js'
import { PATHS, unwrap } from './endpoints.js'
import { fetchOrders } from './orders.js'

/**
 * GET /admin/stats -> { stats }
 *
 * This route is optional. If it is missing, errors, or returns a shape this
 * app does not recognise, the dashboard computes the same numbers from the
 * orders list instead. So you can ship the dashboard before the route exists.
 */

const DAYS = 14

/** Computed client-side. Correct as long as the orders list is not paginated. */
export function deriveStats(orders) {
  const cutoff = Date.now() - DAYS * 864e5
  const recent = orders.filter((o) => new Date(o.createdAt).getTime() >= cutoff)
  const basis = recent.length ? recent : orders

  const days = Array.from({ length: DAYS }).map((_, i) => {
    const key = new Date(Date.now() - (DAYS - 1 - i) * 864e5).toISOString().slice(0, 10)
    const forDay = orders.filter((o) => String(o.createdAt).slice(0, 10) === key)
    return {
      date: key,
      revenue: forDay.reduce((s, o) => s + (o.total || 0), 0),
      orders: forDay.length,
    }
  })

  const units = {}
  basis.forEach((o) =>
    o.items.forEach((l) => {
      units[l.name] = (units[l.name] || 0) + (l.count || 0)
    }),
  )

  const revenue = basis.reduce((s, o) => s + (o.total || 0), 0)

  return {
    revenue,
    orderCount: basis.length,
    averageOrder: basis.length ? Math.round(revenue / basis.length) : 0,
    pending: orders.filter((o) => ['placed', 'confirmed'].includes(o.status)).length,
    codShare: basis.length
      ? Math.round((basis.filter((o) => o.payment !== 'upi').length / basis.length) * 100)
      : 0,
    days,
    topProducts: Object.entries(units)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
    derived: true,
  }
}

/** Returns { stats, orders } — the dashboard needs both anyway. */
export async function fetchDashboard() {
  const orders = await fetchOrders()

  if (MOCK) {
    await delay(150)
    return { stats: deriveStats(orders), orders }
  }

  try {
    const body = await get(PATHS.stats)
    const stats = unwrap(body, 'stats')
    // Only trust the endpoint if it actually carries the fields we render.
    if (stats && typeof stats.revenue === 'number' && Array.isArray(stats.days)) {
      return { stats: { ...deriveStats(orders), ...stats, derived: false }, orders }
    }
  } catch {
    /* route missing or shape unknown — fall through to the derived numbers */
  }

  return { stats: deriveStats(orders), orders }
}
