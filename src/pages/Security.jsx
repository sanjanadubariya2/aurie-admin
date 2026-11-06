import { useState } from 'react'
import PageHeader from '../components/layout/PageHeader.jsx'
import Button from '../components/ui/Button.jsx'
import Field, { Input } from '../components/ui/Field.jsx'
import { useAdminAuth } from '../context/AdminAuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { setupTwoFactor, enableTwoFactor, disableTwoFactor } from '../api/auth.js'
import { MOCK } from '../api/client.js'

const digits = (v) => v.replace(/\D/g, '').slice(0, 6)

/**
 * Two-factor sign-in for the admin account. This panel can change prices and
 * read every customer's address, so a stolen password alone should not be
 * enough to get in.
 */
export default function Security() {
  const { staff, refresh } = useAdminAuth()
  const { toast } = useToast()
  const [setup, setSetup] = useState(null) // { qr, secret }
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const enabled = Boolean(staff?.totpEnabled)

  const run = async (fn) => {
    setBusy(true)
    setError('')
    try {
      await fn()
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const start = () => run(async () => setSetup(await setupTwoFactor()))
  const confirm = () =>
    run(async () => {
      await enableTwoFactor(code)
      await refresh()
      setSetup(null)
      setCode('')
      toast('Two-factor sign-in is on')
    })
  const turnOff = () =>
    run(async () => {
      await disableTwoFactor(code, password)
      await refresh()
      setCode('')
      setPassword('')
      toast('Two-factor sign-in is off')
    })

  return (
    <>
      <PageHeader title="Security" subtitle={staff?.email} />

      <section className="max-w-2xl rounded-card border border-wick bg-wax p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-[22px] text-soot">Two-factor sign-in</h2>
            <p className="mt-1.5 max-w-md text-[14px] leading-relaxed text-smoke">
              After your password, sign-in asks for a 6-digit code from an authenticator app on your phone (Google
              Authenticator, Microsoft Authenticator, 1Password…).
            </p>
          </div>
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-[12px] font-medium ${
              enabled ? 'bg-sea/15 text-sea' : 'bg-ember/12 text-ember'
            }`}
          >
            {enabled ? 'On' : 'Off'}
          </span>
        </div>

        {MOCK && <p className="mt-5 rounded-xl bg-ash p-3 text-[13px] text-smoke">Not available in mock mode.</p>}

        {!MOCK && !enabled && !setup && (
          <Button onClick={start} loading={busy} className="mt-6">
            Set up two-factor
          </Button>
        )}

        {!MOCK && !enabled && setup && (
          <div className="mt-6 grid gap-6 sm:grid-cols-[220px_1fr]">
            <img src={setup.qr} alt="QR code for your authenticator app" className="h-[220px] w-[220px] rounded-xl border border-wick bg-white p-2" />
            <div>
              <ol className="list-decimal space-y-2 pl-5 text-[14px] text-ink">
                <li>Open your authenticator app and scan this code.</li>
                <li>
                  Can't scan? Enter this key by hand:
                  <code className="mt-1 block break-all rounded-lg bg-ash px-2.5 py-1.5 font-mono text-[13px] text-soot">{setup.secret}</code>
                </li>
                <li>Type the 6-digit code the app shows.</li>
              </ol>
              <Field label="Code from the app" id="enable-code" error={error} className="mt-5">
                <Input
                  id="enable-code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(e) => setCode(digits(e.target.value))}
                  onKeyDown={(e) => e.key === 'Enter' && confirm()}
                  className="max-w-[180px] text-center tracking-[0.3em]"
                />
              </Field>
              <div className="mt-4 flex gap-3">
                <Button onClick={confirm} loading={busy} disabled={code.length !== 6}>
                  Turn on
                </Button>
                <Button variant="ghost" onClick={() => setSetup(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {!MOCK && enabled && (
          <div className="mt-6 border-t border-wick pt-5">
            <p className="text-[14px] text-ink">To turn it off, confirm with your password and a current code.</p>
            <div className="mt-4 grid max-w-md gap-4 sm:grid-cols-2">
              <Field label="Password" id="off-password">
                <Input id="off-password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </Field>
              <Field label="Current code" id="off-code">
                <Input id="off-code" inputMode="numeric" value={code} onChange={(e) => setCode(digits(e.target.value))} />
              </Field>
            </div>
            {error && <p className="mt-2 text-[13px] text-ember">{error}</p>}
            <Button variant="outline" onClick={turnOff} loading={busy} disabled={!password || code.length !== 6} className="mt-4">
              Turn off two-factor
            </Button>
          </div>
        )}
      </section>

      <section className="mt-6 max-w-2xl rounded-card border border-wick bg-wax p-6 text-[14px] leading-relaxed text-smoke sm:p-7">
        <h2 className="font-display text-[20px] text-soot">Sessions</h2>
        <p className="mt-1.5">
          Admin sessions last 12 hours and live in a cookie scripts cannot read. Turning two-factor on signs out every
          other device.
        </p>
      </section>
    </>
  )
}
