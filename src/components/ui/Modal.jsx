import { useLockBodyScroll } from '../../hooks/useLockBodyScroll.js'
import { useEscape } from '../../hooks/useEscape.js'

export default function Modal({ open, onClose, title, children, size = 'md' }) {
  useLockBodyScroll(open)
  useEscape(open, onClose)
  if (!open) return null

  const width = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-3xl' }[size]

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 animate-fadeIn bg-soot/45 backdrop-blur-[2px]" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative z-10 w-full ${width} animate-slideUp overflow-hidden rounded-t-3xl bg-wax
          shadow-lift sm:animate-fadeIn sm:rounded-3xl`}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-20 grid h-9 w-9 place-items-center rounded-full bg-ash/80 text-soot hover:bg-ash"
        >
          <svg viewBox="0 0 14 14" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M1 1l12 12M13 1L1 13" strokeLinecap="round" />
          </svg>
        </button>
        {children}
      </div>
    </div>
  )
}
