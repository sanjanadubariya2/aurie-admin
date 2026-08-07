import { STATUS_COPY } from '../../api/endpoints.js'

const tones = {
  placed: 'bg-ember/12 text-ember',
  confirmed: 'bg-glow/30 text-[#8A5A12]',
  shipped: 'bg-sea/15 text-sea',
  out_for_delivery: 'bg-sea/15 text-sea',
  delivered: 'bg-soot/10 text-smoke',
}

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-[12px] font-medium ${tones[status] || tones.delivered}`}>
      {STATUS_COPY[status]?.short || status}
    </span>
  )
}
