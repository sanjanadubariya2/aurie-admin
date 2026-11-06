import { useEffect, useRef, useState } from 'react'
import Button from '../ui/Button.jsx'
import { useSettings } from '../../hooks/useSettings.js'
import { useToast } from '../../context/ToastContext.jsx'
import { draftReply, parseVoiceUpdate, fetchWeeklySummary, describeProduct } from '../../api/growth.js'

/**
 * The admin's AI helpers (Gemini, via aurie-api). Everything they produce is a
 * draft shown for editing — nothing is sent or saved without a click. All of
 * them render nothing until GEMINI_API_KEY is set on the API.
 */
const useAi = () => Boolean(useSettings().features?.ai)
const Recognition = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null

function Sparkle() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-ember" fill="currentColor" aria-hidden="true">
      <path d="M8 0l1.6 5.2L15 7l-5.4 1.8L8 14l-1.6-5.2L1 7l5.4-1.8L8 0z" />
    </svg>
  )
}

/** Mic -> transcript, using the browser's own speech recognition. */
export function useDictation(onText) {
  const [listening, setListening] = useState(false)
  const rec = useRef(null)
  useEffect(() => () => rec.current?.abort(), [])
  if (!Recognition) return { supported: false }
  const toggle = () => {
    if (listening) return rec.current?.stop()
    const r = new Recognition()
    r.lang = 'en-IN'
    r.interimResults = false
    r.onresult = (e) => onText(e.results?.[0]?.[0]?.transcript || '')
    r.onend = () => setListening(false)
    r.onerror = () => setListening(false)
    rec.current = r
    setListening(true)
    r.start()
  }
  return { supported: true, listening, toggle }
}

/** Dashboard card: the week in plain words, from real numbers. */
export function WeeklySummary() {
  const ai = useAi()
  const [data, setData] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  if (!ai) return null

  const load = async () => {
    setBusy(true)
    setError('')
    try {
      setData(await fetchWeeklySummary())
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="rounded-card border border-wick bg-wax p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-display text-[18px] text-soot">
          <Sparkle /> Your week
        </h2>
        <Button size="sm" variant="outline" onClick={load} loading={busy}>
          {data ? 'Refresh' : 'Summarise'}
        </Button>
      </div>
      {error && <p className="mt-2 text-[13px] text-ember">{error}</p>}
      {data ? (
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[14px] leading-relaxed text-ink marker:text-ember">
          {data.bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-[14px] text-smoke">Late orders, waiting requests, low stock and best sellers — in five lines.</p>
      )}
    </section>
  )
}

/** Order drawer: speak an update, or draft a message to the customer. */
export function OrderAssistant({ order, onVoiceUpdate }) {
  const ai = useAi()
  const { toast } = useToast()
  const [intent, setIntent] = useState('')
  const [channel, setChannel] = useState('whatsapp')
  const [draft, setDraft] = useState(null)
  const [busy, setBusy] = useState(false)
  const dictation = useDictation(async (text) => {
    if (!text) return
    setBusy(true)
    try {
      const parsed = await parseVoiceUpdate(`${text} (order ${order.reference})`)
      onVoiceUpdate(parsed)
      toast(`Heard: “${text}” — check the fields, then save`)
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setBusy(false)
    }
  })
  if (!ai) return null

  const write = async () => {
    setBusy(true)
    try {
      setDraft(await draftReply(order.id, intent, channel))
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  const phone = order.address?.phone
  const waLink = draft && phone ? `https://wa.me/91${phone}?text=${encodeURIComponent(draft.message)}` : null

  return (
    <div className="mt-6 rounded-xl border border-wick p-4">
      <p className="flex items-center gap-2 text-[13px] font-medium text-soot">
        <Sparkle /> Assistant
      </p>
      {dictation.supported && (
        <button
          onClick={dictation.toggle}
          disabled={busy}
          className={`mt-3 flex w-full items-center justify-center gap-2 rounded-full border px-4 py-2 text-[13px] transition-colors ${
            dictation.listening ? 'border-ember bg-ember text-wax' : 'border-wick text-soot hover:border-soot'
          }`}
        >
          {dictation.listening ? 'Listening… tap to stop' : '🎙 Speak an update — “shipped with Delhivery, tracking …”'}
        </button>
      )}
      <div className="mt-3 flex gap-2">
        <input
          value={intent}
          onChange={(e) => setIntent(e.target.value)}
          placeholder="Message about… e.g. running 2 days late, sorry"
          className="h-9 min-w-0 flex-1 rounded-lg border border-wick bg-wax px-3 text-[13px] focus:outline-none focus-visible:border-ember"
        />
        <select value={channel} onChange={(e) => setChannel(e.target.value)} className="h-9 rounded-lg border border-wick bg-wax px-2 text-[12px]">
          <option value="whatsapp">WhatsApp</option>
          <option value="email">Email</option>
        </select>
        <Button size="sm" variant="dark" onClick={write} loading={busy} disabled={intent.trim().length < 3}>
          Draft
        </Button>
      </div>
      {draft && (
        <div className="mt-3">
          {draft.subject && <p className="text-[12px] text-smoke">Subject: {draft.subject}</p>}
          <textarea
            value={draft.message}
            onChange={(e) => setDraft({ ...draft, message: e.target.value })}
            rows={5}
            className="mt-1 w-full rounded-lg border border-wick bg-wax p-2.5 text-[13px] leading-relaxed"
          />
          <div className="mt-2 flex gap-2">
            {waLink && channel === 'whatsapp' && (
              <Button as="a" href={waLink} target="_blank" rel="noreferrer" size="sm">
                Open in WhatsApp
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={() => navigator.clipboard?.writeText(draft.message).then(() => toast('Copied'))}>
              Copy
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

/** Product editor: fill name/scent/description from the photo. */
export function WriteProductCopy({ draft, onFill }) {
  const ai = useAi()
  const { toast } = useToast()
  const [busy, setBusy] = useState(false)
  if (!ai) return null

  const run = async () => {
    setBusy(true)
    try {
      const out = await describeProduct({ imageUrl: draft.image, name: draft.name })
      onFill(out)
      toast('Drafted — edit anything before saving')
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      onClick={run}
      disabled={busy || (!draft.image && !draft.name)}
      title={!draft.image && !draft.name ? 'Add a photo or a name first' : ''}
      className="inline-flex items-center gap-2 rounded-full border border-wick bg-wax px-3.5 py-1.5 text-[13px] text-soot hover:border-soot disabled:opacity-50"
    >
      <Sparkle /> {busy ? 'Writing…' : 'Write it for me'}
    </button>
  )
}
