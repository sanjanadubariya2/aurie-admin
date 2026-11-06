export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((v || '').trim())

export function validateProduct(p) {
  const e = {}
  if (!p.name?.trim()) e.name = 'Give it a name'
  if (!p.collection) e.collection = 'Pick a collection'
  // Quote-only products (Secret Glow, Luxe boxes) have no fixed sizes — they
  // are priced on WhatsApp — so requiring a size made them impossible to edit.
  if (!p.quote && !p.tiers?.length) e.tiers = 'Add at least one size, or tick "Priced on request"'
  else if (p.tiers?.some((t) => !(t.price > 0))) e.tiers = 'Every size needs a price above zero'
  return e
}

/** Guards against marking something shipped with no tracking for the customer. */
export function validateOrderUpdate({ status, courier, trackingNumber }) {
  const needsTracking = ['shipped', 'out_for_delivery', 'delivered'].includes(status)
  if (!needsTracking) return {}
  const e = {}
  if (!courier) e.courier = 'Pick a courier'
  if (!trackingNumber || trackingNumber.trim().length < 6) e.trackingNumber = 'Enter the tracking number'
  return e
}
