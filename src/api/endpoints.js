/**
 * ============================================================================
 *  THE ONLY FILE YOU SHOULD NEED TO EDIT TO MATCH aurie-api
 * ============================================================================
 *
 * Every path, request body and response shape this app assumes about
 * routes/admin.js lives here. Nothing else in src/ knows a URL. If your
 * backend disagrees with an assumption below, change it here and the whole
 * app follows.
 *
 * Two things worth knowing about the assumptions:
 *
 * 1. Mongoose documents come back with `_id`, not `id`. Every read path runs
 *    through a normaliser so the rest of the app can just use `.id`.
 *
 * 2. The stats endpoint is optional. If GET /admin/stats is missing or errors,
 *    the dashboard falls back to computing its numbers from the orders list.
 *    So the dashboard works whether or not you built that route.
 */

// ---------------------------------------------------------------- paths

export const PATHS = {
  login: '/admin/login',
  me: '/admin/me',

  orders: '/admin/orders',
  order: (id) => `/admin/orders/${id}`,

  products: '/admin/products',
  product: (id) => `/admin/products/${id}`,
  productImage: (id) => `/admin/products/${id}/image`,

  stats: '/admin/stats',
  collections: '/admin/collections',
}

// ------------------------------------------------------- response unwrapping

/**
 * Handles the three shapes an Express route usually returns:
 *   res.json(thing)              -> thing
 *   res.json({ order: thing })   -> thing
 *   res.json({ data: thing })    -> thing
 */
export const unwrap = (body, key) => {
  if (body == null) return null
  if (key && body[key] !== undefined) return body[key]
  if (body.data !== undefined) return body.data
  return body
}

/** Same, for list endpoints that may return a bare array or a wrapped one. */
export const unwrapList = (body, key) => {
  const value = unwrap(body, key)
  if (Array.isArray(value)) return value
  if (Array.isArray(body)) return body
  return []
}

// ------------------------------------------------------------- normalisers

/** Mongo `_id` -> `id`, and a couple of field aliases the API might use. */
export const normaliseProduct = (p = {}) => ({
  ...p,
  id: p.id || p._id,
  image: p.image || p.imageUrl || p.imageURL || '',
  tiers: Array.isArray(p.tiers) ? p.tiers : [],
  inStock: p.inStock !== false,
  quote: Boolean(p.quote),
})

export const normaliseOrder = (o = {}) => ({
  ...o,
  id: o.id || o._id,
  /* Customer-facing order number. Falls back to the Mongo id so the table
     always has something to show. */
  reference: o.reference || o.orderNumber || o.orderId || o.id || o._id,
  items: (o.items || o.orderItems || []).map((l, i) => ({
    ...l,
    key: l.key || `${l.productId || l.product || 'item'}-${i}`,
    name: l.name || l.nameSnapshot || l.productName || 'Item',
    unitPrice: l.unitPrice ?? l.unitPriceSnapshot ?? l.price ?? 0,
    tierLabel: l.tierLabel || l.tierLabelSnapshot || l.tier || '',
    count: l.count ?? l.quantity ?? 1,
    image: l.image || l.imageUrl || '',
  })),
  address: o.address || o.shippingAddress || {},
  customer: o.customer || { name: o.customerName, email: o.customerEmail },
  status: o.status || 'placed',
  total: o.total ?? 0,
  subtotal: o.subtotal ?? o.total ?? 0,
  shipping: o.shipping ?? 0,
  // aurie-api's raw order doc has `payment: { method: 'upi' | 'cod' }`, not a
  // flat string — every `order.payment === 'upi'` check in this app was
  // comparing an object to a string and always landing on the COD branch.
  payment: (typeof o.payment === 'object' && o.payment !== null ? o.payment.method : o.payment) || o.paymentMethod || 'cod',
  // Mock orders have no paymentStatus; treat their UPI as paid like before.
  paymentStatus: o.paymentStatus || (o.payment === 'upi' ? 'paid' : 'pending'),
  createdAt: o.createdAt || o.placedAt || new Date().toISOString(),
})

// ------------------------------------------------------------ request bodies

/** What PATCH /admin/orders/:id receives. */
export const orderPatchBody = ({ status, courier, trackingNumber }) => ({
  status,
  courier: courier || null,
  trackingNumber: trackingNumber || null,
})

/** What POST/PATCH /admin/products receives. Strips fields the API won't want. */
export const productBody = (p) => {
  const { _id, id, createdAt, updatedAt, __v, ...rest } = p
  return rest
}

/**
 * The form field name the image upload route expects.
 * If your multer setup is `upload.single('file')`, change this to 'file'.
 */
export const IMAGE_FIELD = 'image'

/** Where the upload response keeps the resulting URL. */
export const readUploadedUrl = (body) => {
  const value = unwrap(body, 'url')
  if (typeof value === 'string') return value
  return value?.url || value?.secure_url || value?.image || ''
}

// ------------------------------------------------------------- status flow

/** Must match the storefront's src/api/orders.js and the API's enum. */
export const STATUS_FLOW = ['placed', 'confirmed', 'shipped', 'out_for_delivery', 'delivered']

export const STATUS_COPY = {
  placed: { title: 'Order placed', short: 'New', body: 'Payment method recorded, nothing poured yet.' },
  confirmed: { title: 'Pouring started', short: 'Pouring', body: 'Candles being poured and cured.' },
  shipped: { title: 'Shipped', short: 'Shipped', body: 'Handed to the courier with a tracking number.' },
  out_for_delivery: { title: 'Out for delivery', short: 'Out for delivery', body: 'Arriving today.' },
  delivered: { title: 'Delivered', short: 'Delivered', body: 'Order complete.' },
  cancelled: { title: 'Cancelled', short: 'Cancelled', body: 'Will not be fulfilled.' },
  awaiting_payment: { title: 'Awaiting payment', short: 'Unpaid', body: 'UPI payment never confirmed.' },
}

/** Tabs on the Orders page — the flow plus cancelled. */
export const STATUS_TABS = [...STATUS_FLOW, 'cancelled']

/** "Paid by UPI" only when Razorpay actually confirmed it. */
export const paymentLabel = (o) =>
  o.payment === 'upi' ? (o.paymentStatus === 'paid' ? 'Paid by UPI' : 'UPI — not confirmed') : 'Cash on delivery'
