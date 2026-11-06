import { useCallback, useEffect, useState } from 'react'
import PageHeader from '../components/layout/PageHeader.jsx'
import Button from '../components/ui/Button.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import ErrorNotice from '../components/ui/ErrorNotice.jsx'
import { RowSkeleton } from '../components/ui/Skeleton.jsx'
import { fetchReviews, moderateReview } from '../api/growth.js'
import { useToast } from '../context/ToastContext.jsx'
import { relative } from '../lib/format.js'

const TABS = [
  ['pending', 'Waiting'],
  ['approved', 'Published'],
  ['rejected', 'Hidden'],
]

/** Verified-buyer reviews wait here until someone reads them. */
export default function Reviews() {
  const { toast } = useToast()
  const [tab, setTab] = useState('pending')
  const [list, setList] = useState(null)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    setError('')
    setList(null)
    fetchReviews(tab)
      .then(setList)
      .catch((e) => setError(e.message))
  }, [tab])
  useEffect(load, [load])

  const act = async (r, status) => {
    try {
      await moderateReview(r._id, status)
      setList((l) => l.filter((x) => x._id !== r._id))
      toast(status === 'approved' ? 'Published on the product page' : 'Hidden')
    } catch (e) {
      toast(e.message, 'error')
    }
  }

  if (error) return <ErrorNotice message={error} onRetry={load} />

  return (
    <>
      <PageHeader title="Reviews" subtitle="Only buyers of delivered orders can review. Nothing shows until it is published here." />
      <div className="mb-5 flex gap-2">
        {TABS.map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-full border px-3.5 py-1.5 text-[13px] ${tab === t ? 'border-soot bg-soot text-wax' : 'border-wick bg-wax text-smoke'}`}>
            {label}
          </button>
        ))}
      </div>
      {list === null ? (
        <RowSkeleton />
      ) : list.length === 0 ? (
        <EmptyState title="Nothing here" body={tab === 'pending' ? 'New reviews arrive about 3 days after delivery, when customers get the review email.' : 'Try another tab.'} />
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {list.map((r) => (
            <li key={r._id} className="flex gap-4 rounded-card border border-wick bg-wax p-5">
              {r.photo?.url && (
                <a href={r.photo.url} target="_blank" rel="noreferrer" className="shrink-0">
                  <img src={r.photo.url} alt="" className="h-24 w-24 rounded-xl object-cover" />
                </a>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-[14px] text-soot">
                  <span className="text-glow">{'★'.repeat(r.rating)}</span>
                  <span className="text-wick">{'★'.repeat(5 - r.rating)}</span> · {r.productName}
                </p>
                {r.text && <p className="mt-1.5 text-[14px] leading-relaxed text-ink">{r.text}</p>}
                <p className="mt-1.5 text-[12px] text-smoke">
                  {r.authorName} · {r.customer?.email} · {r.order?.orderNumber} · {relative(r.createdAt)}
                </p>
                <div className="mt-3 flex gap-2">
                  {tab !== 'approved' && (
                    <Button size="sm" onClick={() => act(r, 'approved')}>
                      Publish
                    </Button>
                  )}
                  {tab !== 'rejected' && (
                    <Button size="sm" variant="ghost" onClick={() => act(r, 'rejected')}>
                      Hide
                    </Button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
