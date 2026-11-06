import { useRef, useState } from 'react'
import Button from '../components/ui/Button.jsx'
import Field, { Input } from '../components/ui/Field.jsx'
import Flame from '../components/ui/Flame.jsx'
import { useAdminAuth } from '../context/AdminAuthContext.jsx'
import { isEmail } from '../lib/validate.js'
import { MOCK } from '../api/client.js'

export default function Login() {
  const { signIn } = useAdminAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  // Second step: shown only after the password checks out and the account has two-factor on.
  const [needsCode, setNeedsCode] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const codeRef = useRef(null)

  const submit = async () => {
    if (!isEmail(email)) return setError('Enter a valid email address')
    if (!password) return setError('Enter your password')
    if (needsCode && !/^\d{6}$/.test(code)) return setError('Enter the 6-digit code from your authenticator app')
    setError('')
    setBusy(true)
    try {
      await signIn(email.trim(), password, needsCode ? code : undefined)
    } catch (e) {
      if (e.data?.needsTotp) {
        if (needsCode) setError(e.message)
        setNeedsCode(true)
        setCode('')
        setTimeout(() => codeRef.current?.focus(), 50)
      } else {
        setError(e.message)
      }
    } finally {
      setBusy(false)
    }
  }

  const onEnter = (e) => e.key === 'Enter' && submit()

  return (
    <div className="grid min-h-screen bg-ash lg:grid-cols-[1fr_1.1fr]">
      <div className="grid place-items-center px-5 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-10 flex items-center gap-2">
            <Flame className="h-5 w-3 text-ember" />
            <span className="font-display text-[20px] font-semibold tracking-[0.12em] text-soot">AURIE</span>
            <span className="ml-1 rounded-full bg-soot px-2 py-0.5 text-[10px] uppercase tracking-label text-wax">Admin</span>
          </div>

          <h1 className="font-display text-[32px] leading-tight text-soot">
            {needsCode ? 'One more step' : 'Welcome back'}
          </h1>
          <p className="mt-2 text-[15px] text-smoke">
            {needsCode
              ? 'Open your authenticator app and enter the 6-digit code for Aurie Admin.'
              : 'Staff accounts only. Customers sign in on the storefront with an email code.'}
          </p>

          <div className="mt-8 space-y-4">
            {!needsCode ? (
              <>
                <Field label="Email" id="email">
                  <Input id="email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={onEnter} />
                </Field>
                <Field label="Password" id="password" error={error}>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    invalid={Boolean(error)}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={onEnter}
                  />
                </Field>
              </>
            ) : (
              <Field label="Authenticator code" id="totp" error={error}>
                <Input
                  ref={codeRef}
                  id="totp"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={code}
                  invalid={Boolean(error)}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  onKeyDown={onEnter}
                  className="text-center font-display text-[22px] tracking-[0.4em]"
                />
              </Field>
            )}
          </div>

          <Button onClick={submit} loading={busy} size="block" className="mt-6">
            {needsCode ? 'Verify and sign in' : 'Sign in'}
          </Button>
          {needsCode && (
            <button
              onClick={() => {
                setNeedsCode(false)
                setError('')
              }}
              className="mt-4 w-full text-center text-[13px] text-smoke underline underline-offset-4 hover:text-soot"
            >
              Use a different account
            </button>
          )}

          <p className="mt-8 rounded-xl bg-wax px-3.5 py-2.5 text-[12px] leading-relaxed text-smoke">
            {MOCK
              ? 'Mock mode is on. Any email and a password of four or more characters gets you in — no backend needed.'
              : 'No admin account yet? Run npm run create-admin in aurie-api to make the first one.'}
          </p>
        </div>
      </div>

      {/* Brand panel — desktop only */}
      <div className="relative hidden overflow-hidden bg-soot lg:block">
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{ background: 'radial-gradient(60% 50% at 50% 60%, rgba(255,182,92,0.28), transparent 70%)' }}
        />
        <div className="relative flex h-full flex-col justify-end p-14 text-wax">
          <Flame className="mb-8 h-16 w-9 animate-flicker text-glow" />
          <p className="max-w-md font-display text-[34px] leading-[1.1]">
            Every order here is a candle someone is waiting to light.
          </p>
          <p className="mt-4 text-[14px] text-wax/55">Orders, products and the pouring queue — all in one place.</p>
        </div>
      </div>
    </div>
  )
}
