export default function Flame({ className = '' }) {
  return (
    <svg viewBox="0 0 12 20" className={className} aria-hidden="true" fill="none">
      <path d="M6 1v10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <g className="animate-flicker origin-[6px_14px]">
        <path d="M6 20c2.8 0 4.6-1.9 4.6-4.4C10.6 12.6 8.4 10.6 6 8c-2.4 2.6-4.6 4.6-4.6 7.6C1.4 18.1 3.2 20 6 20Z" fill="#FFB65C" />
        <path d="M6 20c1.5 0 2.4-1.1 2.4-2.5C8.4 15.8 7.2 14.7 6 13.2c-1.2 1.5-2.4 2.6-2.4 4.3C3.6 18.9 4.5 20 6 20Z" fill="#C1441E" />
      </g>
    </svg>
  )
}
