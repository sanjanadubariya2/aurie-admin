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
  const body = await get(PATHS.orders)
  return unwrapList(body, 'orders').map(normaliseOrder)
}

export async function updateOrder(id, changes) {
  if (MOCK) {
    await delay(450)
    return normaliseOrder(updateMockOrder(id, orderPatchBody(changes)))
  }
  const body = await patch(PATHS.order(id), orderPatchBody(changes))
  return normaliseOrder(unwrap(body, 'order'))
}
