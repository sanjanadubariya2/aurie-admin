import { useCallback, useEffect, useState } from 'react'
import PageHeader from '../components/layout/PageHeader.jsx'
import Button from '../components/ui/Button.jsx'
import Field, { Input, Select } from '../components/ui/Field.jsx'
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'
import ErrorNotice from '../components/ui/ErrorNotice.jsx'
import { RowSkeleton } from '../components/ui/Skeleton.jsx'
import { fetchStaff, addStaff, removeStaff, fetchAudit } from '../api/ops.js'
import { useToast } from '../context/ToastContext.jsx'
import { relative } from '../lib/format.js'

const ROLE = {
  admin: ['Owner', 'Everything, including prices, refunds, exports and the team.'],
  staff: ['Staff', 'Orders, the pour list, requests and materials. Cannot change prices or refund.'],
}

/** The team (owner + staff accounts) and the activity log of who did what. */
export default function Team() {
  const { toast } = useToast()
  const [members, setMembers] = useState(null)
  const [log, setLog] = useState(null)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ email: '', password: '', role: 'staff' })
  const [busy, setBusy] = useState(false)
  const [removing, setRemoving] = useState(null)

  const load = useCallback(() => {
    setError('')
    Promise.all([fetchStaff(), fetchAudit()])
      .then(([s, a]) => {
        setMembers(s)
        setLog(a)
      })
      .catch((e) => setError(e.message))
  }, [])
  useEffect(load, [load])

  const add = async () => {
    setBusy(true)
    try {
      await addStaff(form)
      toast(`${form.email} can now sign in`)
      setForm({ email: '', password: '', role: 'staff' })
      load()
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  if (error) return <ErrorNotice message={error} onRetry={load} />

  return (
    <>
      <PageHeader title="Team" subtitle="Who can sign in to this panel, and what they have done" />

      <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
        <div className="space-y-6">
          <section className="rounded-card border border-wick bg-wax">
            <h2 className="border-b border-wick px-5 py-3.5 font-display text-[18px] text-soot">Accounts</h2>
            {members === null ? (
              <div className="p-5">
                <RowSkeleton />
              </div>
            ) : (
              <ul className="divide-y divide-wick">
                {members.map((m) => (
                  <li key={m.id} className="flex items-center gap-3 px-5 py-3.5">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-soot text-[13px] uppercase text-wax">{m.email[0]}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] text-soot">
                        {m.email} {m.self && <span className="text-smoke">(you)</span>}
                      </span>
                      <span className="block text-[12px] text-smoke">
                        {ROLE[m.role]?.[0]} · two-factor {m.totpEnabled ? 'on' : <span className="text-ember">off</span>}
                      </span>
                    </span>
                    {!m.self && (
                      <Button size="sm" variant="ghost" onClick={() => setRemoving(m)}>
                        Remove
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-card border border-wick bg-wax p-5">
            <h2 className="font-display text-[18px] text-soot">Add someone</h2>
            <p className="mt-1 text-[13px] text-smoke">Give them the password in person or by phone — not by email. They should turn on two-factor at first sign-in.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field label="Email" id="t-email">
                <Input id="t-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </Field>
              <Field label="Temporary password" id="t-pass" hint="At least 10 characters">
                <Input id="t-pass" type="text" autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </Field>
              <Field label="Role" id="t-role" className="sm:col-span-2" hint={ROLE[form.role][1]}>
                <Select id="t-role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <option value="staff">Staff</option>
                  <option value="admin">Owner</option>
                </Select>
              </Field>
            </div>
            <Button className="mt-4" onClick={add} loading={busy} disabled={!form.email || form.password.length < 10}>
              Add to team
            </Button>
          </section>
        </div>

        <section className="rounded-card border border-wick bg-wax">
          <h2 className="border-b border-wick px-5 py-3.5 font-display text-[18px] text-soot">Activity</h2>
          {log === null ? (
            <div className="p-5">
              <RowSkeleton />
            </div>
          ) : log.length === 0 ? (
            <p className="p-5 text-[14px] text-smoke">Nothing yet.</p>
          ) : (
            <ul className="max-h-[640px] divide-y divide-wick overflow-y-auto">
              {log.map((e) => (
                <li key={e._id} className="px-5 py-3 text-[13px]">
                  <span className="flex justify-between gap-3">
                    <span className="text-ink">
                      <span className="font-medium">{e.action}</span>
                      {e.target && <span className="text-smoke"> · {e.target}</span>}
                    </span>
                    <span className="shrink-0 text-smoke">{relative(e.createdAt)}</span>
                  </span>
                  <span className="mt-0.5 block truncate text-smoke">
                    {e.actor}
                    {e.details && Object.keys(e.details).length > 0 && ` — ${JSON.stringify(e.details).replace(/[{}"]/g, '').replace(/,/g, ', ').slice(0, 140)}`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <ConfirmDialog
        open={Boolean(removing)}
        title={`Remove ${removing?.email}?`}
        body="They are signed out everywhere immediately and can no longer sign in to the admin panel."
        confirmLabel="Remove"
        cancelLabel="Keep"
        busy={busy}
        onConfirm={async () => {
          await removeStaff(removing.id).catch((e) => toast(e.message, 'error'))
          setRemoving(null)
          load()
        }}
        onCancel={() => setRemoving(null)}
      />
    </>
  )
}
