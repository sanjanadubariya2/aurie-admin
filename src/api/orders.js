import { MOCK, get, patch, delay } from './client.js'
import { PATHS, unwrapList, unwrap, normaliseOrder, orderPatchBody } from './endpoints.js'
import { mockOrders, updateMockOrder } from './mockData.js'

/**
 * GET   /admin/orders          -> { orders: [...] }
 * PATCH /admin/orders/:id      { status, courier, trackingNumber } -> { order }
 */

export async function fetchOrders() {
  if (MOCK) {
    await delay(400)
    return mockOrders().map(normaliseOrder)
  }
  // The API pages its results (100 max per page). Asking once returned only
  // the newest 25, so older orders silently vanished from every screen.
  const PAGE = 100
  const all = []
  for (let page = 1; page <= 50; page++) {
     
    const body = await get(`${PATHS.orders}?page=${page}&limit=${PAGE}`)
    const batch = unwrapList(body, 'orders')
    all.push(...batch)
    const total = typeof body?.total === 'number' ? body.total : null
    if (batch.length < PAGE || (total !== null && all.length >= total)) break
  }
  return all.map(normaliseOrder)
}

export async function updateOrder(id, changes) {
  if (MOCK) {
    await delay(450)
    return normaliseOrder(updateMockOrder(id, orderPatchBody(changes)))
  }
  const body = await patch(PATHS.order(id), orderPatchBody(changes))
  return normaliseOrder(unwrap(body, 'order'))
}
