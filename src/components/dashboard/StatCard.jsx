export default function StatCard({ label, value, sub, tone = 'default' }) {
  return (
    <div className="rounded-card border border-wick bg-wax p-5">
      <p className="label">{label}</p>
      <p className={`mt-2 font-display text-[28px] leading-none tabular-nums ${tone === 'alert' ? 'text-ember' : 'text-soot'}`}>
        {value}
      </p>
      {sub && <p className="mt-1.5 text-[13px] text-smoke">{sub}</p>}
    </div>
  )
}
