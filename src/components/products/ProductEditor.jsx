import { useEffect, useState } from 'react'
import Modal from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'
import Field, { Input, Textarea, Select } from '../ui/Field.jsx'
import ImageUploader from './ImageUploader.jsx'
import { createProduct, updateProduct } from '../../api/products.js'
import { validateProduct } from '../../lib/validate.js'
import { useToast } from '../../context/ToastContext.jsx'
import { rupees } from '../../lib/format.js'

/** Matches the storefront's tier ids so the two catalogues stay compatible. */
const TIER_SHAPE = [
  ['single', 'Single', 1],
  ['double', 'Pair', 2],
  ['combo', 'Box of 4', 4],
]

const blank = {
  name: '',
  collection: '',
  image: '',
  scent: '',
  burn: '',
  blurb: '',
  badge: '',
  inStock: true,
  tiers: [{ id: 'single', label: 'Single', qty: 1, price: 199 }],
}

export default function ProductEditor({ product, collections, onClose, onSaved }) {
  const { toast } = useToast()
  const [draft, setDraft] = useState(blank)
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)

  // Derived from `draft`, not the original `product` prop: a brand-new product
  // is kept open after its first save (to unlock image upload), and at that
  // point it has a real id even though the modal never received a fresh
  // `product` prop. Reading `product.id` here would keep this true forever,
  // so a second save would call createProduct again instead of updateProduct
  // and silently create a duplicate.
  const isNew = !draft.id

  useEffect(() => {
    setDraft(product?.id ? { ...blank, ...product } : { ...blank, collection: collections[0]?.id || '' })
    setErrors({})
  }, [product, collections])

  const set = (field) => (e) => setDraft((d) => ({ ...d, [field]: e.target.value }))

  const setTierPrice = (tierId, value) =>
    setDraft((d) => ({
      ...d,
      tiers: d.tiers.map((t) => (t.id === tierId ? { ...t, price: Number(value) || 0 } : t)),
    }))

  const toggleTier = (tierId, label, qty) =>
    setDraft((d) => {
      const order = TIER_SHAPE.map((t) => t[0])
      const exists = d.tiers.some((t) => t.id === tierId)
      const next = exists
        ? d.tiers.filter((t) => t.id !== tierId)
        : [...d.tiers, { id: tierId, label, qty, price: 0 }]
      return { ...d, tiers: next.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id)) }
    })

  const submit = async () => {
    const found = validateProduct(draft)
    setErrors(found)
    if (Object.keys(found).length) {
      toast('Check the highlighted fields', 'error')
      return
    }

    setBusy(true)
    try {
      const saved = isNew ? await createProduct(draft) : await updateProduct(draft.id, draft)
      onSaved(saved)
      toast(isNew ? `${saved.name} added` : `${saved.name} updated`)
      // A new product needs an id before its image can be uploaded, so keep the
      // editor open on the freshly saved record instead of closing.
      if (isNew && !saved.image) setDraft({ ...blank, ...saved })
      else onClose()
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  const lowest = draft.tiers.length ? Math.min(...draft.tiers.map((t) => t.price || 0)) : 0

  return (
    <Modal open onClose={onClose} title={isNew ? 'Add a candle' : draft.name} size="md">
      <div className="max-h-[82vh] overflow-y-auto p-6 sm:p-7">
        <h2 className="font-display text-[24px] leading-tight text-soot">
          {isNew ? 'Add a candle' : `Edit ${product.name}`}
        </h2>

        <div className="mt-6">
          <p className="label mb-2">Photo</p>
          <ImageUploader
            productId={draft.id || product?.id}
            value={draft.image}
            onChange={(url) => setDraft((d) => ({ ...d, image: url }))}
          />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Name" id="p-name" error={errors.name} className="sm:col-span-2">
            <Input id="p-name" value={draft.name} invalid={errors.name} onChange={set('name')} />
          </Field>

          <Field label="Collection" id="p-collection" error={errors.collection}>
            <Select id="p-collection" value={draft.collection} invalid={errors.collection} onChange={set('collection')}>
              <option value="">Select one</option>
              {collections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Badge" id="p-badge" hint="Optional, e.g. Bestseller">
            <Input id="p-badge" value={draft.badge || ''} onChange={set('badge')} />
          </Field>

          <Field label="Scent" id="p-scent">
            <Input id="p-scent" value={draft.scent || ''} onChange={set('scent')} />
          </Field>

          <Field label="Burn time" id="p-burn">
            <Input id="p-burn" value={draft.burn || ''} onChange={set('burn')} placeholder="40 hrs" />
          </Field>

          <Field label="Description" id="p-blurb" className="sm:col-span-2">
            <Textarea id="p-blurb" value={draft.blurb || ''} onChange={set('blurb')} />
          </Field>
        </div>

        <div className="mt-7">
          <div className="flex items-baseline justify-between">
            <p className="label">Sizes and prices</p>
            {errors.tiers && <span className="text-[13px] text-ember">{errors.tiers}</span>}
          </div>

          <div className="mt-3 space-y-2.5">
            {TIER_SHAPE.map(([id, label, qty]) => {
              const tier = draft.tiers.find((t) => t.id === id)
              return (
                <div key={id} className="flex items-center gap-3 rounded-xl border border-wick bg-wax px-3.5 py-2.5">
                  <label className="flex flex-1 items-center gap-2.5 text-[14px] text-ink">
                    <input
                      type="checkbox"
                      checked={Boolean(tier)}
                      onChange={() => toggleTier(id, label, qty)}
                      className="h-4 w-4 accent-[#C1441E]"
                    />
                    {label}
                  </label>
                  {tier && (
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] text-smoke">&#8377;</span>
                      <input
                        type="number"
                        min="0"
                        value={tier.price}
                        onChange={(e) => setTierPrice(id, e.target.value)}
                        aria-label={`${label} price`}
                        className="h-9 w-24 rounded-lg border border-wick bg-wax px-2.5 text-right text-[14px] tabular-nums focus:outline-none focus-visible:border-ember"
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <p className="mt-2.5 text-[13px] text-smoke">
            Storefront shows {rupees(lowest)} as the starting price.
          </p>
        </div>

        <label className="mt-6 flex items-center gap-2.5 text-[14px] text-ink">
          <input
            type="checkbox"
            checked={draft.inStock}
            onChange={(e) => setDraft((d) => ({ ...d, inStock: e.target.checked }))}
            className="h-4 w-4 accent-[#C1441E]"
          />
          Taking orders for this
        </label>

        <div className="mt-7 flex gap-3">
          <Button onClick={submit} loading={busy}>
            {isNew ? 'Add candle' : 'Save changes'}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            {isNew ? 'Cancel' : 'Done'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
