import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import PageHeader from '../components/layout/PageHeader.jsx'
import Drawer from '../components/ui/Drawer.jsx'
import Button from '../components/ui/Button.jsx'
import Field, { Input, Textarea } from '../components/ui/Field.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import ErrorNotice from '../components/ui/ErrorNotice.jsx'
import { RowSkeleton } from '../components/ui/Skeleton.jsx'
import { fetchQuotes, sendQuote, declineQuote } from '../api/quotes.js'
import { useToast } from '../context/ToastContext.jsx'
import { rupees, relative, longDate } from '../lib/format.js'

export const QUOTE_TONE = {
  new: ['New', 'bg-ember/12 text-ember'],
  quoted: ['Quoted', 'bg-glow/30 text-[#8A5A12]'],
  paid: ['Paid', 'bg-sea/15 text-sea'],
  declined: ['Declined', 'bg-soot/10 text-smoke'],
  expired: ['Expired', 'bg-soot/10 text-smoke'],
}
const TABS = ['new', 'quoted', 'paid', 'declined', 'expired']

/** Custom requests: read the brief, set a price (or decline), and the customer
 *  gets an email with a link to pay. Paid quotes become normal orders. */
export default function Quotes() {
  const [params, setParams] = useSearchParams()
  const [quotes, setQuotes] = useState(null)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('new')
  const openId = params.get('open')

  const load = useCallback(() => {
    setError('')
    setQuotes(null)
    fetchQuotes()
      .then(setQuotes)
      .catch((e) => setError(e.message))
  }, [])
  useEffect(load, [load])

  const counts = useMemo(() => Object.fromEntries(TABS.map((t) => [t, (quotes || []).filter((q) => q.status === t).length])), [quotes])
  const visible = (quotes || []).filter((q) => q.status === tab)
  const open = (quotes || []).find((q) => q.id === openId) || null
  const setOpen = (q) => setParams(q ? { open: q.id } : {}, { replace: true })
  const onSaved = (saved) => setQuotes((list) => list.map((q) => (q.id === saved.id ? { ...q, ...saved } : q)))

  if (error) return <ErrorNotice message={error} onRetry={load} />

  return (
    <>
      <PageHeader
        title="Custom requests"
        subtitle={quotes ? `${counts.new} waiting for a price` : 'Loading'}
        action={
          <Button variant="outline" size="sm" onClick={load}>
            Refresh
          </Button>
        }
      />

      <div className="no-scrollbar -mx-4 mb-5 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-[13px] transition-colors ${
              tab === t ? 'border-soot bg-soot text-wax' : 'border-wick bg-wax text-smoke hover:border-smoke hover:text-soot'
            }`}
          >
            {QUOTE_TONE[t][0]}
            <span className={`tabular-nums ${tab === t ? 'text-wax/60' : 'text-smoke/70'}`}>{counts[t] ?? 0}</span>
          </button>
        ))}
      </div>

      {quotes === null ? (
        <RowSkeleton />
      ) : visible.length === 0 ? (
        <EmptyState title={tab === 'new' ? 'Nothing waiting' : 'Nothing here'} body={tab === 'new' ? 'New custom requests from the storefront land here.' : 'Try another tab.'} />
      ) : (
        <ul className="divide-y divide-wick overflow-hidden rounded-card border border-wick bg-wax">
          {visible.map((q) => (
            <li key={q.id}>
              <button onClick={() => setOpen(q)} className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-ash/60">
                {q.images?.[0] ? (
                  <img src={q.images[0]} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
                ) : (
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-ash text-[11px] text-smoke">{q.images?.length || 'no'} img</span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] text-soot">
                    {q.productName || q.occasion || 'Custom request'}
                    {q.message && <span className="text-smoke"> · “{q.message}”</span>}
                  </span>
                  <span className="mt-0.5 block truncate text-[13px] text-smoke">
                    {q.number} · {q.customer?.email} · {relative(q.createdAt)}
                    {q.neededBy && ` · needed ${longDate(q.neededBy)}`}
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-[12px] font-medium ${QUOTE_TONE[q.status][1]}`}>{QUOTE_TONE[q.status][0]}</span>
                  {q.price ? <span className="mt-1 block text-[13px] tabular-nums text-ink">{rupees(q.price)}</span> : q.budget && <span className="mt-1 block text-[12px] text-smoke">{q.budget}</span>}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <QuoteDrawer quote={open} onClose={() => setOpen(null)} onSaved={onSaved} />
    </>
  )
}

function QuoteDrawer({ quote, onClose, onSaved }) {
  const { toast } = useToast()
  const [mode, setMode] = useState('quote')
  const [price, setPrice] = useState('')
  const [note, setNote] = useState('')
  const [validDays, setValidDays] = useState(7)
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!quote) return
    setMode('quote')
    setPrice(quote.price ? String(quote.price) : '')
    setNote(quote.adminNote || '')
    setReason('')
  }, [quote])

  if (!quote) return null
  const editable = ['new', 'quoted', 'expired'].includes(quote.status)

  const submit = async () => {
    setBusy(true)
    try {
      const saved =
        mode === 'quote'
          ? await sendQuote(quote.id, { price: Number(price), adminNote: note.trim(), validDays: Number(validDays) })
          : await declineQuote(quote.id, reason.trim())
      onSaved(saved)
      toast(mode === 'quote' ? `Quote ${quote.number} sent — ${rupees(Number(price))}` : `${quote.number} declined`)
      onClose()
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  const canSubmit = mode === 'quote' ? Number(price) > 0 : reason.trim().length >= 3

  return (
    <Drawer
      open
      onClose={onClose}
      title={`${quote.number} · ${quote.productName || 'Custom request'}`}
      subtitle={`${quote.customer?.email || ''} · ${relative(quote.createdAt)}`}
      footer={
        editable ? (
          <Button onClick={submit} loading={busy} disabled={!canSubmit} size="block" variant={mode === 'decline' ? 'danger' : 'primary'}>
            {mode === 'quote' ? (quote.status === 'quoted' ? 'Update and re-send quote' : 'Send quote to customer') : 'Decline and email customer'}
          </Button>
        ) : (
          <p className="text-center text-[13px] text-smoke">{quote.status === 'paid' ? 'Paid — find it in Orders.' : 'Declined.'}</p>
        )
      }
    >
      <div className="space-y-6 px-5 py-5">
        <dl className="grid grid-cols-2 gap-4 text-[14px]">
          {[
            ['Occasion', quote.occasion],
            ['Needed by', quote.neededBy && longDate(quote.neededBy)],
            ['Budget', quote.budget],
            ['Status', QUOTE_TONE[quote.status][0]],
          ]
            .filter(([, v]) => v)
            .map(([k, v]) => (
              <div key={k}>
                <dt className="label">{k}</dt>
                <dd className="mt-1 text-ink">{v}</dd>
              </div>
            ))}
        </dl>

        {quote.message && (
          <div className="rounded-xl bg-soot p-4 text-wax">
            <p className="label text-glow">Hidden message</p>
            <p className="mt-1 font-display text-[22px]">“{quote.message}”</p>
            <p className="mt-1 text-[12px] text-wax/50">{[...quote.message].length} characters — check spelling before pouring</p>
          </div>
        )}

        <div>
          <p className="label">Brief</p>
          <p className="mt-1.5 whitespace-pre-wrap text-[15px] leading-relaxed text-ink">{quote.details}</p>
        </div>

        {quote.images?.length > 0 && (
          <ul className="grid grid-cols-3 gap-2">
            {quote.images.map((src) => (
              <li key={src}>
                <a href={src} target="_blank" rel="noreferrer">
                  <img src={src} alt="Customer reference" className="aspect-square w-full rounded-lg object-cover" />
                </a>
              </li>
            ))}
          </ul>
        )}

        {editable && (
          <div className="rounded-xl border border-wick p-4">
            <div className="mb-4 flex gap-2">
              {[
                ['quote', 'Send a price'],
                ['decline', 'Decline'],
              ].map(([m, label]) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`rounded-full border px-3.5 py-1.5 text-[13px] ${mode === m ? 'border-soot bg-soot text-wax' : 'border-wick text-smoke'}`}
                >
                  {label}
                </button>
              ))}
            </div>
            {mode === 'quote' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Price (₹, delivery included)" id="q-price">
                    <Input id="q-price" type="number" min="1" inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value.replace(/\D/g, ''))} />
                  </Field>
                  <Field label="Valid for (days)" id="q-valid">
                    <Input id="q-valid" type="number" min="1" max="60" value={validDays} onChange={(e) => setValidDays(e.target.value)} />
                  </Field>
                </div>
                <Field label="What it includes (the customer sees this)" id="q-note">
                  <Textarea id="q-note" rows={4} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Two 200g jars, red beads, rose & vanilla, gift box with ribbon." />
                </Field>
              </div>
            ) : (
              <Field label="Why (emailed to the customer)" id="q-reason">
                <Textarea id="q-reason" rows={4} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Our moulds only go up to 15cm, so we cannot make this size." />
              </Field>
            )}
          </div>
        )}
      </div>
    </Drawer>
  )
}
