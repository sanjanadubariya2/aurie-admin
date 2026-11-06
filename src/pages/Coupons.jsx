import { useCallback, useEffect, useState } from 'react'
import PageHeader from '../components/layout/PageHeader.jsx'
import Button from '../components/ui/Button.jsx'
import Modal from '../components/ui/Modal.jsx'
import Field, { Input, Select } from '../components/ui/Field.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import ErrorNotice from '../components/ui/ErrorNotice.jsx'
import { RowSkeleton } from '../components/ui/Skeleton.jsx'
import { fetchCoupons, createCoupon, updateCoupon } from '../api/growth.js'
import { fetchCollections } from '../api/collections.js'
import { useToast } from '../context/ToastContext.jsx'
import { rupees, shortDate } from '../lib/format.js'

const blank = { code: '', description: '', type: 'percent', value: 10, maxDiscount: '', minSubtotal: 0, collection: '', firstOrderOnly: false, usageLimit: '', perCustomerLimit: 1, endsAt: '', active: true }

const describe = (c) =>
  [
    c.type === 'percent' ? `${c.value}% off${c.maxDiscount ? ` (max ${rupees(c.maxDiscount)})` : ''}` : `${rupees(c.value)} off`,
    c.minSubtotal ? `on ${rupees(c.minSubtotal)}+` : '',
    c.collection ? `${c.collection} only` : '',
    c.firstOrderOnly ? 'first order' : '',
  ]
    .filter(Boolean)
    .join(' · ')

/** Discount codes for festivals, first orders and Instagram giveaways. */
export default function Coupons() {
  const { toast } = useToast()
  const [list, setList] = useState(null)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null)

  const load = useCallback(() => {
    setError('')
    fetchCoupons()
      .then(setList)
      .catch((e) => setError(e.message))
  }, [])
  useEffect(load, [load])

  const toggle = async (c) => {
    try {
      const saved = await updateCoupon(c._id, { active: !c.active })
      setList((l) => l.map((x) => (x._id === saved._id ? saved : x)))
    } catch (e) {
      toast(e.message, 'error')
    }
  }

  if (error) return <ErrorNotice message={error} onRetry={load} />

  return (
    <>
      <PageHeader title="Discount codes" subtitle="Checked by the server at checkout — what the customer sees is what they pay" action={<Button onClick={() => setEditing(blank)}>New code</Button>} />
      {list === null ? (
        <RowSkeleton />
      ) : list.length === 0 ? (
        <EmptyState title="No codes yet" body="Try WELCOME10 for first orders, or DIWALI for the festive collection." action={<Button onClick={() => setEditing(blank)}>Create one</Button>} />
      ) : (
        <ul className="divide-y divide-wick overflow-hidden rounded-card border border-wick bg-wax">
          {list.map((c) => {
            const expired = c.endsAt && new Date(c.endsAt) < new Date()
            return (
              <li key={c._id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                <span className="rounded-lg bg-soot px-2.5 py-1 font-mono text-[14px] tracking-wider text-wax">{c.code}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] text-ink">{describe(c)}</span>
                  <span className="block text-[12px] text-smoke">
                    Used {c.used}
                    {c.usageLimit ? ` of ${c.usageLimit}` : ''} · {c.perCustomerLimit} per customer
                    {c.endsAt && ` · ${expired ? 'ended' : 'ends'} ${shortDate(c.endsAt)}`}
                  </span>
                </span>
                <button
                  onClick={() => toggle(c)}
                  className={`rounded-full border px-3 py-1 text-[12px] ${c.active && !expired ? 'border-sea/40 text-sea' : 'border-wick text-smoke'}`}
                >
                  {expired ? 'Ended' : c.active ? 'Live' : 'Paused'}
                </button>
              </li>
            )
          })}
        </ul>
      )}
      {editing && (
        <CouponEditor
          onClose={() => setEditing(null)}
          onSaved={(c) => {
            setList((l) => [c, ...(l || [])])
            setEditing(null)
            toast(`${c.code} is live`)
          }}
        />
      )}
    </>
  )
}

function CouponEditor({ onClose, onSaved }) {
  const { toast } = useToast()
  const [d, setD] = useState(blank)
  const [collections, setCollections] = useState([])
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    fetchCollections().then(setCollections)
  }, [])
  const set = (k, num) => (e) => setD({ ...d, [k]: num ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value })

  const save = async () => {
    setBusy(true)
    try {
      const body = {
        ...d,
        maxDiscount: d.maxDiscount || null,
        usageLimit: d.usageLimit || null,
        collection: d.collection || null,
        endsAt: d.endsAt ? `${d.endsAt}T23:59:59+05:30` : null,
      }
      onSaved(await createCoupon(body))
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open onClose={onClose} title="New discount code" size="md">
      <div className="grid gap-4 p-6 sm:grid-cols-2">
        <h2 className="font-display text-[22px] text-soot sm:col-span-2">New discount code</h2>
        <Field label="Code" id="c-code" hint="Letters, numbers, hyphens">
          <Input id="c-code" value={d.code} onChange={(e) => setD({ ...d, code: e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '') })} />
        </Field>
        <Field label="Shown to customer" id="c-desc">
          <Input id="c-desc" value={d.description} onChange={set('description')} placeholder="10% off your first order" />
        </Field>
        <Field label="Type" id="c-type">
          <Select id="c-type" value={d.type} onChange={set('type')}>
            <option value="percent">Percent off</option>
            <option value="flat">Rupees off</option>
          </Select>
        </Field>
        <Field label={d.type === 'percent' ? 'Percent' : 'Rupees'} id="c-value">
          <Input id="c-value" type="number" min="1" value={d.value} onChange={set('value', true)} />
        </Field>
        {d.type === 'percent' && (
          <Field label="Max discount ₹ (optional)" id="c-max">
            <Input id="c-max" type="number" min="1" value={d.maxDiscount} onChange={set('maxDiscount', true)} />
          </Field>
        )}
        <Field label="Minimum spend ₹" id="c-min">
          <Input id="c-min" type="number" min="0" value={d.minSubtotal} onChange={set('minSubtotal', true)} />
        </Field>
        <Field label="Only this collection" id="c-col">
          <Select id="c-col" value={d.collection} onChange={set('collection')}>
            <option value="">Whole shop</option>
            {collections.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Ends on (optional)" id="c-end">
          <Input id="c-end" type="date" value={d.endsAt} onChange={set('endsAt')} />
        </Field>
        <Field label="Total uses (optional)" id="c-limit">
          <Input id="c-limit" type="number" min="1" value={d.usageLimit} onChange={set('usageLimit', true)} />
        </Field>
        <Field label="Uses per customer" id="c-per">
          <Input id="c-per" type="number" min="1" value={d.perCustomerLimit} onChange={set('perCustomerLimit', true)} />
        </Field>
        <label className="flex items-center gap-2 text-[14px] text-ink sm:col-span-2">
          <input type="checkbox" checked={d.firstOrderOnly} onChange={(e) => setD({ ...d, firstOrderOnly: e.target.checked })} className="h-4 w-4 accent-[#C1441E]" />
          First order only
        </label>
        <div className="sm:col-span-2">
          <Button onClick={save} loading={busy} disabled={d.code.length < 3 || !(d.value > 0)}>
            Create code
          </Button>
        </div>
      </div>
    </Modal>
  )
}
