import { STATUS_FLOW, STATUS_COPY } from '../../api/endpoints.js'

export default function StatusTabs({ active, counts, onChange }) {
  return (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <Tab active={active === 'all'} count={counts.all} onClick={() => onChange('all')}>
        All
      </Tab>
      {STATUS_FLOW.map((s) => (
        <Tab key={s} active={active === s} count={counts[s]} onClick={() => onChange(s)}>
          {STATUS_COPY[s].short}
        </Tab>
      ))}
    </div>
  )
}

function Tab({ active, count, children, ...props }) {
  return (
    <button
      className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[13px] transition-colors
        ${active ? 'border-soot bg-soot text-wax' : 'border-wick bg-wax text-smoke hover:border-smoke hover:text-soot'}`}
      {...props}
    >
      {children}
      <span className={`tabular-nums ${active ? 'text-wax/60' : 'text-smoke/70'}`}>{count ?? 0}</span>
    </button>
  )
}
