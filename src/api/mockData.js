/**
 * Only used when VITE_MOCK=1. Lets you build and demo screens with no backend.
 * Nothing here ships to production — the real data comes from aurie-api.
 */

import { read, write } from '../lib/storage.js'

const ORDERS_KEY = 'aurie.admin.mock.orders'
const PRODUCTS_KEY = 'aurie.admin.mock.products'

const NAMES = [
  ['Ishita Rao', 'ishita.rao@gmail.com', 'Mumbai', '400058'],
  ['Vedant Shah', 'vedant.shah@gmail.com', 'Ahmedabad', '380015'],
  ['Aditi Kulkarni', 'aditi.k@outlook.com', 'Pune', '411004'],
  ['Rhea Menon', 'rhea.menon@gmail.com', 'Bengaluru', '560001'],
  ['Kabir Sethi', 'kabir.sethi@gmail.com', 'Delhi', '110016'],
  ['Nandini Iyer', 'nandini.iyer@gmail.com', 'Chennai', '600020'],
  ['Farhan Qureshi', 'farhan.q@gmail.com', 'Mumbai', '400050'],
  ['Sneha Patil', 'sneha.patil@gmail.com', 'Nashik', '422005'],
]

const CATALOGUE = [
  ['laddoo', 'Motichoor Laddoo', 'festive', 69],
  ['modak', 'Modak', 'festive', 69],
  ['lotus-thali', 'Lotus Thali', 'festive', 300],
  ['peony-bloom', 'Peony Bloom', 'bloom', 249],
  ['tulip-jar', 'Tulip Jar', 'bloom', 499],
  ['cold-brew', 'Cold Brew', 'brew', 249],
  ['biscoff-chai', 'Biscoff Chai', 'brew', 200],
  ['shell-shore', 'Shell Shore', 'tide', 399],
  ['bubble-cube', 'Bubble Cube', 'whims', 59],
  ['teddy-bear', 'Teddy Bear', 'whims', 199],
  ['cupcake', 'Cupcake', 'whims', 249],
  ['monogram-rose', 'Monogram Rose Jar', 'jars', 199],
  ['blueberry-bliss', 'Blueberry Bliss', 'jars', 199],
  ['indigo-marble', 'Indigo Marble Jar', 'jars', 249],
]

const STATUSES = ['placed', 'placed', 'confirmed', 'confirmed', 'shipped', 'out_for_delivery', 'delivered', 'delivered']
const COURIERS = ['Delhivery', 'Shiprocket', 'Bluedart']

const rng = (n) => {
  const x = Math.sin(n * 9973) * 10000
  return x - Math.floor(x)
}

function seedProducts() {
  return CATALOGUE.map(([id, name, collection, price], i) => ({
    id,
    name,
    collection,
    image: '',
    scent: '',
    burn: '',
    blurb: '',
    inStock: i !== 6,
    tiers:
      price < 100
        ? [
            { id: 'single', label: 'Single', qty: 1, price },
            { id: 'double', label: 'Pair', qty: 2, price: price * 2 - 18 },
            { id: 'combo', label: 'Box of 4', qty: 4, price: price * 4 - 36 },
          ]
        : [{ id: 'single', label: 'Single', qty: 1, price }],
  }))
}

function seedOrders() {
  const products = seedProducts()
  return Array.from({ length: 28 }).map((_, i) => {
    const [name, email, city, pincode] = NAMES[Math.floor(rng(i) * NAMES.length)]
    const lineCount = 1 + Math.floor(rng(i + 90) * 3)
    const items = Array.from({ length: lineCount }).map((__, j) => {
      const p = products[Math.floor(rng(i * 7 + j + 1) * products.length)]
      const tier = p.tiers[Math.floor(rng(i * 13 + j + 1) * p.tiers.length)]
      return {
        key: `${p.id}-${j}`,
        productId: p.id,
        name: p.name,
        image: '',
        tierLabel: tier.label,
        unitPrice: tier.price,
        count: 1 + Math.floor(rng(i * 17 + j + 1) * 2),
      }
    })
    const subtotal = items.reduce((s, l) => s + l.unitPrice * l.count, 0)
    const shipping = subtotal >= 999 ? 0 : 79
    const status = STATUSES[Math.floor(rng(i + 700) * STATUSES.length)]
    const shipped = ['shipped', 'out_for_delivery', 'delivered'].includes(status)
    const createdAt = new Date(Date.now() - Math.floor(rng(i + 400) * 14) * 864e5).toISOString()

    return {
      _id: `mock${i}`,
      reference: `AUR${100000 + i * 137}`,
      createdAt,
      status,
      items,
      subtotal,
      shipping,
      total: subtotal + shipping,
      payment: rng(i + 300) > 0.45 ? 'upi' : 'cod',
      customer: { name, email },
      address: {
        fullName: name,
        phone: `9${Math.floor(700000000 + rng(i + 11) * 99999999)}`,
        line1: `${1 + Math.floor(rng(i + 21) * 400)}, Sunbeam Apartments`,
        city,
        state: 'Maharashtra',
        pincode,
        notes: rng(i + 33) > 0.85 ? 'Please call before delivery, gate is locked after 8pm.' : '',
      },
      courier: shipped ? COURIERS[Math.floor(rng(i + 55) * COURIERS.length)] : null,
      trackingNumber: shipped ? `${Math.floor(10000000000 + rng(i + 77) * 8e10)}` : null,
      expectedBy: new Date(new Date(createdAt).getTime() + 7 * 864e5).toISOString(),
    }
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export function mockOrders() {
  const stored = read(ORDERS_KEY, null)
  if (stored) return stored
  const fresh = seedOrders()
  write(ORDERS_KEY, fresh)
  return fresh
}

export function updateMockOrder(id, patch) {
  const next = mockOrders().map((o) => (o._id === id || o.id === id ? { ...o, ...patch } : o))
  write(ORDERS_KEY, next)
  return next.find((o) => o._id === id || o.id === id)
}

export function mockProducts() {
  const stored = read(PRODUCTS_KEY, null)
  if (stored) return stored
  const fresh = seedProducts()
  write(PRODUCTS_KEY, fresh)
  return fresh
}

export function saveMockProduct(product) {
  const id = product.id || product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const withId = { ...product, id }
  const list = mockProducts()
  const next = list.some((p) => p.id === id) ? list.map((p) => (p.id === id ? withId : p)) : [withId, ...list]
  write(PRODUCTS_KEY, next)
  return withId
}

export function deleteMockProduct(id) {
  write(PRODUCTS_KEY, mockProducts().filter((p) => p.id !== id))
}
