import { useCallback, useEffect, useState } from 'react'
import PageHeader from '../components/layout/PageHeader.jsx'
import Button from '../components/ui/Button.jsx'
import Modal from '../components/ui/Modal.jsx'
import Field, { Input } from '../components/ui/Field.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import ErrorNotice from '../components/ui/ErrorNotice.jsx'
import { RowSkeleton } from '../components/ui/Skeleton.jsx'
import { fetchMaterials, createMaterial, updateMaterial, adjustMaterial, deleteMaterial } from '../api/ops.js'
import { useAdminAuth } from '../context/AdminAuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'

const blank = { name: '', unit: 'kg', onHand: 0, lowAt: 0, supplier: '' }

/** Wax, wicks, jars, oils — what is on the shelf, and what is running low. */
export default function Materials() {
  const { staff } = useAdminAuth()
  const isOwner = staff?.role === 'admin'
  const { toast } = useToast()
  const [list, setList] = useState(null)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null)
  const [adjusting, setAdjusting] = useState(null)

  const load = useCallback(() => {
    setError('')
    fetchMaterials()
      .then(setList)
      .catch((e) => setError(e.message))
  }, [])
  useEffect(load, [load])

  const replace = (m) => setList((l) => (l.some((x) => x._id === m._id) ? l.map((x) => (x._id === m._id ? m : x)) : [...l, m].sort((a, b) => a.name.localeCompare(b.name))))
  const low = (list || []).filter((m) => m.onHand <= m.lowAt)

  if (error) return <ErrorNotice message={error} onRetry={load} />

  return (
    <>
      <PageHeader
        title="Materials"
        subtitle={list ? (low.length ? `${low.length} running low` : 'Everything above its low-stock line') : 'Loading'}
        action={isOwner && <Button onClick={() => setEditing(blank)}>Add material</Button>}
      />

      {list === null ? (
        <RowSkeleton />
      ) : list.length === 0 ? (
        <EmptyState title="No materials yet" body="Add soy wax, wicks, jars and fragrance oils with a low-stock line, and this page tells you when to reorder." />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((m) => {
            const isLow = m.onHand <= m.lowAt
            const pct = m.lowAt > 0 ? Math.min(100, Math.round((m.onHand / (m.lowAt * 3)) * 100)) : 100
            return (
              <li key={m._id} className={`rounded-card border bg-wax p-5 ${isLow ? 'border-ember/50' : 'border-wick'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-[18px] text-soot">{m.name}</p>
                    {m.supplier && <p className="text-[12px] text-smoke">{m.supplier}</p>}
                  </div>
                  {isLow && <span className="rounded-full bg-ember/12 px-2.5 py-1 text-[12px] font-medium text-ember">Reorder</span>}
                </div>
                <p className="mt-3 font-display text-[28px] tabular-nums text-soot">
                  {m.onHand} <span className="font-sans text-[14px] text-smoke">{m.unit}</span>
                </p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ash">
                  <div className={`h-full rounded-full ${isLow ? 'bg-ember' : 'bg-sea'}`} style={{ width: `${pct}%` }} />
                </div>
                <p className="mt-1.5 text-[12px] text-smoke">
                  Low at {m.lowAt} {m.unit}
                </p>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setAdjusting(m)}>
                    Record use / stock in
                  </Button>
                  {isOwner && (
                    <Button size="sm" variant="ghost" onClick={() => setEditing(m)}>
                      Edit
                    </Button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {editing && (
        <MaterialEditor
          material={editing}
          onClose={() => setEditing(null)}
          onSaved={(m) => {
            replace(m)
            setEditing(null)
            toast(`${m.name} saved`)
          }}
          onDeleted={(id) => {
            setList((l) => l.filter((x) => x._id !== id))
            setEditing(null)
          }}
        />
      )}
      {adjusting && (
        <AdjustDialog
          material={adjusting}
          onClose={() => setAdjusting(null)}
          onSaved={(m) => {
            replace(m)
            setAdjusting(null)
            toast(`${m.name}: ${m.onHand} ${m.unit} on hand`)
          }}
        />
      )}
    </>
  )
}

function MaterialEditor({ material, onClose, onSaved, onDeleted }) {
  const { toast } = useToast()
  const [d, setD] = useState({ ...blank, ...material })
  const [busy, setBusy] = useState(false)
  const isNew = !material._id
  const num = (k) => (e) => setD({ ...d, [k]: Number(e.target.value) || 0 })

  const save = async () => {
    setBusy(true)
    try {
      const body = { name: d.name, unit: d.unit, onHand: d.onHand, lowAt: d.lowAt, supplier: d.supplier }
      onSaved(isNew ? await createMaterial(body) : await updateMaterial(material._id, body))
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open onClose={onClose} title={isNew ? 'Add material' : material.name} size="sm">
      <div className="space-y-4 p-6">
        <h2 className="font-display text-[22px] text-soot">{isNew ? 'Add material' : `Edit ${material.name}`}</h2>
        <Field label="Name" id="m-name">
          <Input id="m-name" value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} placeholder="Soy wax" />
        </Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Unit" id="m-unit">
            <Input id="m-unit" value={d.unit} onChange={(e) => setD({ ...d, unit: e.target.value })} />
          </Field>
          <Field label="On hand" id="m-on">
            <Input id="m-on" type="number" min="0" value={d.onHand} onChange={num('onHand')} />
          </Field>
          <Field label="Low at" id="m-low">
            <Input id="m-low" type="number" min="0" value={d.lowAt} onChange={num('lowAt')} />
          </Field>
        </div>
        <Field label="Supplier (optional)" id="m-sup">
          <Input id="m-sup" value={d.supplier || ''} onChange={(e) => setD({ ...d, supplier: e.target.value })} />
        </Field>
        <div className="flex gap-3 pt-2">
          <Button onClick={save} loading={busy} disabled={!d.name.trim()}>
            Save
          </Button>
          {!isNew && (
            <Button
              variant="ghost"
              onClick={async () => {
                await deleteMaterial(material._id).catch((e) => toast(e.message, 'error'))
                onDeleted(material._id)
              }}
            >
              Delete
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}

function AdjustDialog({ material, onClose, onSaved }) {
  const { toast } = useToast()
  const [mode, setMode] = useState('use')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)

  const save = async () => {
    setBusy(true)
    try {
      const value = Number(amount)
      onSaved(await adjustMaterial(material._id, mode === 'use' ? -value : value, note.trim()))
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open onClose={onClose} title={material.name} size="sm">
      <div className="space-y-4 p-6">
        <h2 className="font-display text-[22px] text-soot">{material.name}</h2>
        <p className="text-[14px] text-smoke">
          {material.onHand} {material.unit} on hand
        </p>
        <div className="flex gap-2">
          {[
            ['use', 'Used'],
            ['in', 'Stock in'],
          ].map(([m, label]) => (
            <button key={m} onClick={() => setMode(m)} className={`rounded-full border px-3.5 py-1.5 text-[13px] ${mode === m ? 'border-soot bg-soot text-wax' : 'border-wick text-smoke'}`}>
              {label}
            </button>
          ))}
        </div>
        <Field label={`Amount (${material.unit})`} id="adj-amount">
          <Input id="adj-amount" type="number" min="0" step="any" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </Field>
        <Field label="Note (optional)" id="adj-note">
          <Input id="adj-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Diwali batch" />
        </Field>
        <Button onClick={save} loading={busy} disabled={!(Number(amount) > 0)}>
          Save
        </Button>
      </div>
    </Modal>
  )
}
