import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { get } from '../api/client.js'
import { normaliseOrder } from '../api/endpoints.js'
import { useSettings } from '../hooks/useSettings.js'
import { rupees, longDate } from '../lib/format.js'

/**
 * Printable invoice and packing slip for one order (A4, opens the print
 * dialog). The invoice is a "Tax invoice" with a GST breakup when GST_RATE and
 * a GSTIN are set on the API, otherwise a "Bill of supply". The packing slip
 * leaves prices off when the customer ticked "hide prices", and carries the
 * gift note.
 *
 * ?doc=invoice | slip | both (default both)
 */
export default function PrintOrder() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const doc = params.get('doc') || 'both'
  const settings = useSettings()
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    get(`/admin/orders/${id}`)
      .then((d) => setOrder(normaliseOrder(d.order)))
      .catch((e) => setError(e.message))
  }, [id])

  useEffect(() => {
    if (order && settings.business) {
      document.title = `${order.invoiceNumber || order.reference} · Aurie`
      const t = setTimeout(() => window.print(), 400)
      return () => clearTimeout(t)
    }
    return undefined
  }, [order, settings.business])

  if (error) return <p className="p-10 text-ember">{error}</p>
  if (!order || !settings.business) return <p className="p-10 text-smoke">Preparing…</p>

  return (
    <div className="bg-white text-[13px] text-soot print:bg-white">
      <div className="mx-auto flex max-w-[800px] justify-end gap-2 p-4 print:hidden">
        <button onClick={() => window.print()} className="rounded-full bg-soot px-4 py-2 text-wax">
          Print
        </button>
        <button onClick={() => window.close()} className="rounded-full border border-wick px-4 py-2">
          Close
        </button>
      </div>
      {(doc === 'both' || doc === 'invoice') && <Invoice order={order} business={settings.business} />}
      {(doc === 'both' || doc === 'slip') && <PackingSlip order={order} business={settings.business} />}
    </div>
  )
}

function Header({ business, title, right }) {
  return (
    <div className="flex items-start justify-between border-b-2 border-soot pb-4">
      <div>
        <p className="font-display text-[26px] font-semibold tracking-[0.14em]">AURIE</p>
        <p className="mt-1 max-w-[280px] text-[12px] leading-snug text-smoke">
          {business.legalName}
          <br />
          {business.address}
          {business.gstin && (
            <>
              <br />
              GSTIN {business.gstin}
            </>
          )}
          <br />
          {business.email}
          {business.phone && ` · ${business.phone}`}
        </p>
      </div>
      <div className="text-right">
        <p className="font-display text-[20px]">{title}</p>
        <div className="mt-1 text-[12px] leading-snug text-smoke">{right}</div>
      </div>
    </div>
  )
}

function Address({ label, a, email }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-smoke">{label}</p>
      <p className="mt-1 leading-snug">
        {a.fullName}
        <br />
        {a.line1}
        {a.line2 && (
          <>
            <br />
            {a.line2}
          </>
        )}
        <br />
        {a.city}, {a.state} {a.pincode}
        <br />
        +91 {a.phone}
        {email && (
          <>
            <br />
            {email}
          </>
        )}
      </p>
    </div>
  )
}

function Invoice({ order, business }) {
  const taxed = Boolean(business.gstin) && business.gstRate > 0
  const rate = business.gstRate / 100
  // Prices are tax-inclusive: taxable value = gross / (1 + rate).
  const taxable = (gross) => (taxed ? gross / (1 + rate) : gross)
  const intraState = (order.address.state || '').toLowerCase() === (business.state || '').toLowerCase()
  const lines = [
    ...order.items.map((l) => ({ name: `${l.name} — ${l.tierLabel}`, note: l.note, qty: l.count, gross: l.unitPrice * l.count, unit: l.unitPrice })),
    ...(order.shipping ? [{ name: 'Delivery', qty: 1, gross: order.shipping, unit: order.shipping }] : []),
    ...(order.giftWrapFee ? [{ name: 'Gift wrap', qty: 1, gross: order.giftWrapFee, unit: order.giftWrapFee }] : []),
  ]
  const totalTaxable = lines.reduce((s, l) => s + taxable(l.gross), 0)
  const totalTax = order.total - totalTaxable

  return (
    <section className="mx-auto max-w-[800px] p-10 print:break-after-page print:p-6">
      <Header
        business={business}
        title={taxed ? 'Tax invoice' : 'Bill of supply'}
        right={
          <>
            {order.invoiceNumber || '— not yet invoiced —'}
            <br />
            Order {order.reference}
            <br />
            {longDate(order.invoicedAt || order.createdAt)}
          </>
        }
      />
      <div className="mt-6 grid grid-cols-2 gap-8">
        <Address label="Bill and ship to" a={order.address} email={order.customer?.email} />
        <div className="text-right text-[12px] leading-relaxed">
          <p>
            Payment: <strong>{order.payment === 'upi' ? 'UPI (prepaid)' : 'Cash on delivery'}</strong>
          </p>
          {taxed && <p>Place of supply: {order.address.state}</p>}
          {taxed && <p>HSN {business.hsn}</p>}
        </div>
      </div>

      <table className="mt-6 w-full border-collapse text-[12px]">
        <thead>
          <tr className="border-y border-soot text-left">
            <th className="py-2">Item</th>
            <th className="py-2 text-right">Qty</th>
            <th className="py-2 text-right">Rate</th>
            {taxed && <th className="py-2 text-right">Taxable</th>}
            <th className="py-2 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((l, i) => (
            <tr key={i} className="border-b border-wick align-top">
              <td className="py-2">
                {l.name}
                {l.note && <span className="block text-[11px] italic text-smoke">{l.note}</span>}
              </td>
              <td className="py-2 text-right tabular-nums">{l.qty}</td>
              <td className="py-2 text-right tabular-nums">{rupees(l.unit)}</td>
              {taxed && <td className="py-2 text-right tabular-nums">₹{taxable(l.gross).toFixed(2)}</td>}
              <td className="py-2 text-right tabular-nums">{rupees(l.gross)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="ml-auto mt-4 w-[280px] space-y-1 text-[12px]">
        {taxed && (
          <>
            <Row k="Taxable value" v={`₹${totalTaxable.toFixed(2)}`} />
            {intraState ? (
              <>
                <Row k={`CGST ${business.gstRate / 2}%`} v={`₹${(totalTax / 2).toFixed(2)}`} />
                <Row k={`SGST ${business.gstRate / 2}%`} v={`₹${(totalTax / 2).toFixed(2)}`} />
              </>
            ) : (
              <Row k={`IGST ${business.gstRate}%`} v={`₹${totalTax.toFixed(2)}`} />
            )}
          </>
        )}
        <div className="flex justify-between border-t border-soot pt-2 font-display text-[16px]">
          <span>Total</span>
          <span>{rupees(order.total)}</span>
        </div>
        {order.refundedTotal > 0 && <Row k="Refunded" v={`− ${rupees(order.refundedTotal)}`} />}
      </div>

      <p className="mt-10 text-[11px] text-smoke">
        {taxed ? 'Prices are inclusive of GST.' : 'Not registered under GST — no tax charged.'} This is a computer-generated document and needs no signature.
      </p>
    </section>
  )
}

function PackingSlip({ order, business }) {
  const hide = order.gift?.hidePrices
  return (
    <section className="mx-auto max-w-[800px] p-10 print:p-6">
      <Header business={business} title="Packing slip" right={<>Order {order.reference}</>} />
      <div className="mt-6 grid grid-cols-2 gap-8">
        <Address label="Ship to" a={order.address} />
        <div className="text-right text-[12px] leading-relaxed">
          {order.payment === 'cod' && !hide && (
            <p className="text-[15px] font-semibold">
              COLLECT {rupees(order.total)} CASH
            </p>
          )}
          {order.payment === 'cod' && hide && <p className="text-[15px] font-semibold">CASH ON DELIVERY</p>}
          {order.neededBy && <p className="mt-1 font-semibold text-ember">Needed by {longDate(order.neededBy)}</p>}
          {order.address.notes && <p className="mt-1 italic">“{order.address.notes}”</p>}
        </div>
      </div>

      <table className="mt-6 w-full border-collapse text-[13px]">
        <thead>
          <tr className="border-y border-soot text-left">
            <th className="w-8 py-2">✓</th>
            <th className="py-2">Item</th>
            <th className="py-2 text-right">Qty</th>
            {!hide && <th className="py-2 text-right">Price</th>}
          </tr>
        </thead>
        <tbody>
          {order.items.map((l) => (
            <tr key={l.key} className="border-b border-wick align-top">
              <td className="py-2.5">☐</td>
              <td className="py-2.5">
                {l.name} — {l.tierLabel}
                {l.note && <span className="block text-[12px] italic">{l.note}</span>}
              </td>
              <td className="py-2.5 text-right text-[15px] font-semibold tabular-nums">{l.count}</td>
              {!hide && <td className="py-2.5 text-right tabular-nums">{rupees(l.unitPrice * l.count)}</td>}
            </tr>
          ))}
        </tbody>
      </table>

      {(order.gift?.wrap || order.gift?.note) && (
        <div className="mt-6 rounded-xl border-2 border-dashed border-soot p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em]">{order.gift?.wrap ? 'Gift wrap this order' : 'Gift'}</p>
          {order.gift?.note && <p className="mt-2 font-display text-[18px] leading-snug">“{order.gift.note}”</p>}
          {order.gift?.note && <p className="mt-1 text-[11px] text-smoke">Write this on the card.</p>}
        </div>
      )}

      <p className="mt-10 text-center text-[12px] text-smoke">
        Thank you for ordering from {business.name}. Trim the wick to 5mm before every burn. · {business.email}
      </p>
    </section>
  )
}

function Row({ k, v }) {
  return (
    <div className="flex justify-between">
      <span className="text-smoke">{k}</span>
      <span className="tabular-nums">{v}</span>
    </div>
  )
}
