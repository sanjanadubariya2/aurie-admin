export default function TopProducts({ items }) {
  if (!items?.length) {
    return (
      <div className="rounded-card border border-wick bg-wax p-5 sm:p-6">
        <h2 className="font-display text-[19px] text-soot">Selling most</h2>
        <p className="mt-4 text-[14px] text-smoke">Nothing sold yet.</p>
      </div>
    )
  }

  const max = items[0].count

  return (
    <div className="rounded-card border border-wick bg-wax p-5 sm:p-6">
      <h2 className="font-display text-[19px] text-soot">Selling most</h2>
      <ol className="mt-5 space-y-3.5">
        {items.map((p, i) => (
          <li key={p.name}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="truncate text-[14px] text-ink">
                <span className="mr-2 tabular-nums text-smoke">{i + 1}</span>
                {p.name}
              </span>
              <span className="shrink-0 text-[13px] tabular-nums text-smoke">{p.count} sold</span>
            </div>
            <div className="mt-1.5 h-1 rounded-full bg-ash">
              <div className="h-1 rounded-full bg-ember" style={{ width: `${(p.count / max) * 100}%` }} />
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
