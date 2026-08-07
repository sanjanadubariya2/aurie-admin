import { STATUS_FLOW, STATUS_COPY } from '../../api/endpoints.js'

/**
 * Status is a sequence, so it is walked one step at a time rather than picked
 * from a dropdown. You can move forward one step or back to a completed step —
 * you cannot jump from "New" straight to "Delivered" by accident.
 */
export default function StatusPicker({ current, value, onChange }) {
  const currentIndex = Math.max(0, STATUS_FLOW.indexOf(current))

  return (
    <div className="space-y-1.5" role="radiogroup" aria-label="Order status">
      {STATUS_FLOW.map((key, i) => {
        const selectable = i <= currentIndex + 1
        const active = value === key
        return (
          <button
            key={key}
            role="radio"
            aria-checked={active}
            disabled={!selectable}
            onClick={() => onChange(key)}
            className={`flex w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-colors
              disabled:pointer-events-none disabled:opacity-35
              ${active ? 'border-soot bg-soot text-wax' : 'border-wick hover:border-smoke'}`}
          >
            <span className="text-[14px]">{STATUS_COPY[key].title}</span>
            {i === currentIndex && !active && <span className="ml-auto text-[12px] text-smoke">current</span>}
          </button>
        )
      })}
    </div>
  )
}
