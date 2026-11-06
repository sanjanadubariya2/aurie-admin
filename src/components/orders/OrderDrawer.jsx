import { useEffect, useState } from 'react'
import Drawer from '../ui/Drawer.jsx'
import Button from '../ui/Button.jsx'
import Field, { Input, Select } from '../ui/Field.jsx'
import StatusBadge from './StatusBadge.jsx'
import StatusPicker from './StatusPicker.jsx'
import ConfirmDialog from '../ui/ConfirmDialog.jsx'
import { updateOrder } from '../../api/orders.js'
import { STATUS_COPY, paymentLabel } from '../../api/endpoints.js'
import { validateOrderUpdate } from '../../lib/validate.js'
import { useToast } from '../../context/ToastContext.jsx'
import { rupees, longDate } from '../../lib/format.js'

const COURIERS = ['Delhivery', 'Shiprocket', 'Bluedart', 'DTDC', 'India Post', 'Other']

export default function OrderDrawer({ order, onClose, onSaved }) {
  const { toast } = useToast()
  const [status, setStatus] = useState('placed')
  const [courier, setCourier] = useState('')
  const [tracking, setTracking] = useState('')
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)

  useEffect(() => {
    if (!order) return
    setStatus(order.status)
    setCourier(order.courier || '')
    setTracking(order.trackingNumber || '')
    setErrors({})
  }, [order])

  if (!order) return null

  const closed = order.status === 'cancelled'
  const unpaid = order.status === 'awaiting_payment'
  const canCancel = !closed && order.status !== 'delivered'

  const cancelOrder = async () => {
    setBusy(true)
    try {
      const saved = await updateOrder(order.id, { status: 'cancelled', courier, trackingNumber: tracking.trim() })
      onSaved(saved)
      toast(`${order.reference} cancelled`)
      setConfirmCancel(false)
      onClose()
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  const needsTracking = ['shipped', 'out_for_delivery', 'delivered'].includes(status)
  const changed =
    status !== order.status || courier !== (order.courier || '') || tracking !== (order.trackingNumber || '')

  const save = async () => {
    const found = validateOrderUpdate({ status, courier, trackingNumber: tracking })
    setErrors(found)
    if (Object.keys(found).length) return

    setBusy(true)
    try {
      const saved = await updateOrder(order.id, { status, courier, trackingNumber: tracking.trim() })
      onSaved(saved)
      toast(`${order.reference} marked ${STATUS_COPY[status].short.toLowerCase()}`)
      onClose()
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Drawer
      open
      onClose={onClose}
      title={order.reference}
      subtitle={`Placed ${longDate(order.createdAt)}`}
      footer={
        closed || unpaid ? (
          canCancel ? (
            <Button variant="outline" onClick={() => setConfirmCancel(true)} size="block">
              Cancel this unpaid order
            </Button>
          ) : (
            <p className="text-center text-[13px] text-smoke">This order is cancelled. Nothing more to do.</p>
          )
        ) : (
          <>
            <Button onClick={save} loading={busy} disabled={!changed} size="block">
              {changed ? 'Save and notify customer' : 'No changes to save'}
            </Button>
            {canCancel && (
              <button
                onClick={() => setConfirmCancel(true)}
                className="mt-3 w-full text-center text-[13px] text-smoke underline underline-offset-4 hover:text-ember"
              >
                Cancel order
              </button>
            )}
          </>
        )
      }
    >
      <div className="px-5 py-5">
        <div className="flex items-center justify-between">
          <StatusBadge status={order.status} />
          <span className="text-[13px] text-smoke">{paymentLabel(order)}</span>
        </div>

        {unpaid && (
          <p className="mt-5 rounded-xl bg-ash p-4 text-[13px] text-ink">
            The customer opened the UPI payment but Razorpay never confirmed it. Do not pour this. If they did pay,
            Razorpay's webhook moves it to New automatically.
          </p>
        )}

        {(order.neededBy || order.gift?.wrap || order.gift?.note || order.gift?.hidePrices || order.quote) && (
          <div className="mt-5 space-y-2 rounded-xl border border-glow/60 bg-glow/10 p-4 text-[14px] text-ink">
            {order.neededBy && (
              <p>
                <span className="font-medium">Needed by {longDate(order.neededBy)}</span> — the customer has an occasion.
              </p>
            )}
            {order.gift?.wrap && <p>🎁 Gift wrap</p>}
            {order.gift?.hidePrices && <p>No prices on the packing slip</p>}
            {order.gift?.note && <p className="italic">Card: “{order.gift.note}”</p>}
            {order.quote && <p>Custom order — paid from a quote.</p>}
          </div>
        )}

        {!closed && !unpaid && (
          <div className="mt-6">
            <p className="label mb-2.5">Update status</p>
            <StatusPicker current={order.status} value={status} onChange={setStatus} />
          </div>
        )}

        {needsTracking && !closed && (
          <div className="mt-5 space-y-4 rounded-xl bg-ash p-4">
            <p className="text-[13px] text-smoke">
              The customer's tracking page shows both of these, so neither can be blank.
            </p>
            <Field label="Courier" id="courier" error={errors.courier}>
              <Select id="courier" value={courier} invalid={errors.courier} onChange={(e) => setCourier(e.target.value)}>
                <option value="">Select a courier</option>
                {COURIERS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
            </Field>
            <Field label="Tracking number" id="tracking" error={errors.trackingNumber}>
              <Input
                id="tracking"
                value={tracking}
                invalid={errors.trackingNumber}
                onChange={(e) => setTracking(e.target.value)}
              />
            </Field>
          </div>
        )}

        <div className="rule my-6" />

        <p className="label mb-3">Items</p>
        <ul className="space-y-3">
          {order.items.map((l) => (
            <li key={l.key} className="flex items-center gap-3">
              {l.image ? (
                <img src={l.image} alt="" className="h-11 w-11 shrink-0 rounded-lg object-cover" />
              ) : (
                <span className="h-11 w-11 shrink-0 rounded-lg bg-ash" />
              )}
              <span className="min-w-0 flex-1 text-[14px] text-ink">
                {l.name}
                <span className="block text-[12px] text-smoke">
                  {l.tierLabel} &times; {l.count}
                </span>
              </span>
              <span className="shrink-0 text-[14px] tabular-nums text-ink">{rupees(l.unitPrice * l.count)}</span>
            </li>
          ))}
        </ul>

        <dl className="mt-5 space-y-1.5 border-t border-wick pt-4 text-[14px]">
          <Row term="Subtotal" value={rupees(order.subtotal)} />
          <Row term="Delivery" value={order.shipping === 0 ? 'Free' : rupees(order.shipping)} />
          {order.giftWrapFee > 0 && <Row term="Gift wrap" value={rupees(order.giftWrapFee)} />}
          <div className="flex justify-between pt-1 font-display text-[17px] text-soot">
            <dt>Total</dt>
            <dd className="tabular-nums">{rupees(order.total)}</dd>
          </div>
        </dl>

        <div className="rule my-6" />

        <p className="label mb-2">Deliver to</p>
        <address className="text-[14px] not-italic leading-relaxed text-ink">
          {order.address.fullName || order.customer?.name}
          <br />
          {order.address.line1}
          {order.address.line2 && (
            <>
              <br />
              {order.address.line2}
            </>
          )}
          <br />
          {order.address.city} {order.address.pincode}
          {order.address.phone && (
            <>
              <br />
              <a href={`tel:+91${order.address.phone}`} className="text-ember underline underline-offset-4">
                +91 {order.address.phone}
              </a>
            </>
          )}
        </address>
        {order.customer?.email && <p className="mt-2 text-[13px] text-smoke">{order.customer.email}</p>}
        {order.address.notes && (
          <p className="mt-3 rounded-xl bg-ash px-3.5 py-2.5 text-[13px] italic text-ink">{order.address.notes}</p>
        )}
      </div>
      <ConfirmDialog
        open={confirmCancel}
        title={`Cancel ${order.reference}?`}
        body={
          order.payment === 'upi' && order.paymentStatus === 'paid'
            ? 'The customer is emailed that it is cancelled. This was paid by UPI — refund it from the Razorpay dashboard; this panel does not move money.'
            : 'The customer is emailed that it is cancelled. This cannot be undone.'
        }
        confirmLabel="Cancel order"
        cancelLabel="Keep order"
        busy={busy}
        onConfirm={cancelOrder}
        onCancel={() => setConfirmCancel(false)}
      />
    </Drawer>
  )
}

function Row({ term, value }) {
  return (
    <div className="flex justify-between">
      <dt className="text-smoke">{term}</dt>
      <dd className="tabular-nums text-ink">{value}</dd>
    </div>
  )
}
