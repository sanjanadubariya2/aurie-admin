import { useCallback, useEffect, useMemo, useState } from 'react'
import PageHeader from '../components/layout/PageHeader.jsx'
import ProductTable from '../components/products/ProductTable.jsx'
import ProductEditor from '../components/products/ProductEditor.jsx'
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'
import Button from '../components/ui/Button.jsx'
import { SearchInput } from '../components/ui/Field.jsx'
import { RowSkeleton } from '../components/ui/Skeleton.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import ErrorNotice from '../components/ui/ErrorNotice.jsx'
import { fetchProducts, updateProduct, deleteProduct } from '../api/products.js'
import { useToast } from '../context/ToastContext.jsx'
import { useDebounced } from '../hooks/useDebounced.js'

/** Mirrors the storefront's collection list. Keep the ids identical. */
const COLLECTIONS = [
  { id: 'festive', name: 'Festive' },
  { id: 'bloom', name: 'Bloom' },
  { id: 'brew', name: 'Brew & Glow' },
  { id: 'tide', name: 'Tide' },
  { id: 'whims', name: 'Whims' },
  { id: 'jars', name: 'Jars' },
  { id: 'secret', name: 'Secret Glow' },
  { id: 'luxe', name: 'Luxe Boxes' },
]

export default function Products() {
  const { toast } = useToast()
  const [products, setProducts] = useState(null)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [deletingBusy, setDeletingBusy] = useState(false)

  const search = useDebounced(query)

  const load = useCallback(() => {
    setError('')
    setProducts(null)
    fetchProducts()
      .then(setProducts)
      .catch((e) => setError(e.message))
  }, [])

  useEffect(load, [load])

  const visible = useMemo(() => {
    if (!products) return []
    const q = search.trim().toLowerCase()
    return products.filter(
      (p) => (filter === 'all' || p.collection === filter) && (!q || p.name.toLowerCase().includes(q)),
    )
  }, [products, filter, search])

  const onSaved = (saved) =>
    setProducts((list) =>
      list.some((p) => p.id === saved.id) ? list.map((p) => (p.id === saved.id ? saved : p)) : [saved, ...list],
    )

  // Optimistic — the toggle should feel instant. Rolls back if the API says no.
  const toggleStock = async (product) => {
    const next = { ...product, inStock: !product.inStock }
    setProducts((list) => list.map((p) => (p.id === next.id ? next : p)))
    try {
      await updateProduct(product.id, next)
      toast(next.inStock ? `${next.name} is live again` : `${next.name} hidden from the storefront`)
    } catch (e) {
      setProducts((list) => list.map((p) => (p.id === product.id ? product : p)))
      toast(e.message, 'error')
    }
  }

  const confirmDelete = async () => {
    setDeletingBusy(true)
    try {
      await deleteProduct(deleting.id)
      setProducts((list) => list.filter((p) => p.id !== deleting.id))
      toast(`${deleting.name} deleted`)
      setDeleting(null)
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setDeletingBusy(false)
    }
  }

  if (error) return <ErrorNotice message={error} onRetry={load} />

  return (
    <>
      <PageHeader
        title="Products"
        subtitle={products ? `${products.length} in the catalogue` : 'Loading'}
        action={<Button onClick={() => setEditing({})}>Add a candle</Button>}
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <Chip active={filter === 'all'} onClick={() => setFilter('all')}>
            All
          </Chip>
          {COLLECTIONS.map((c) => (
            <Chip key={c.id} active={filter === c.id} onClick={() => setFilter(c.id)}>
              {c.name}
            </Chip>
          ))}
        </div>
        <SearchInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products"
          aria-label="Search products"
          className="lg:ml-auto lg:w-64"
        />
      </div>

      <div className="mt-6">
        {products === null ? (
          <RowSkeleton height="h-20" />
        ) : visible.length === 0 ? (
          <EmptyState
            title="Nothing here"
            body={products.length === 0 ? 'Run the seed script in aurie-api, or add a candle by hand.' : 'No products match that filter.'}
            action={<Button onClick={() => setEditing({})}>Add a candle</Button>}
          />
        ) : (
          <ProductTable
            products={visible}
            collections={COLLECTIONS}
            onEdit={setEditing}
            onToggleStock={toggleStock}
            onDelete={setDeleting}
          />
        )}
      </div>

      {editing && (
        <ProductEditor
          product={editing}
          collections={COLLECTIONS}
          onClose={() => setEditing(null)}
          onSaved={onSaved}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        title={`Delete ${deleting?.name}?`}
        body="This removes it from the catalogue for good. Past orders keep their own copy of the name and price, so they are unaffected. If you only want it off the storefront, hide it instead."
        confirmLabel="Delete permanently"
        busy={deletingBusy}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </>
  )
}

function Chip({ active, children, ...props }) {
  return (
    <button
      className={`shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[13px] transition-colors
        ${active ? 'border-soot bg-soot text-wax' : 'border-wick bg-wax text-smoke hover:border-smoke hover:text-soot'}`}
      {...props}
    >
      {children}
    </button>
  )
}
