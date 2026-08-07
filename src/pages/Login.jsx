import { useState } from 'react'
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
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    if (!isEmail(email)) return setError('Enter a valid email address')
    if (!password) return setError('Enter your password')
    setError('')
    setBusy(true)
    try {
      await signIn(email.trim(), password)
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-ash px-5">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-2">
          <Flame className="h-5 w-3 text-ember" />
          <span className="font-display text-[20px] font-semibold tracking-[0.12em] text-soot">AURIE</span>
        </div>

        <h1 className="font-display text-[30px] leading-tight text-soot">Admin sign in</h1>
        <p className="mt-2 text-[15px] text-smoke">
          Staff accounts only. Customers sign in on the storefront with an email code.
        </p>

        <div className="mt-7 space-y-4">
          <Field label="Email" id="email">
            <Input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
            />
          </Field>

          <Field label="Password" id="password" error={error}>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              invalid={Boolean(error)}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
            />
          </Field>
        </div>

        <Button onClick={submit} loading={busy} size="block" className="mt-6">
          Sign in
        </Button>

        <p className="mt-6 rounded-xl bg-wax px-3.5 py-2.5 text-[12px] leading-relaxed text-smoke">
          {MOCK
            ? 'Mock mode is on. Any email and a password of four or more characters gets you in — no backend needed.'
            : 'No admin account yet? Run createAdmin.js in aurie-api to make the first one.'}
        </p>
      </div>
    </div>
  )
}
