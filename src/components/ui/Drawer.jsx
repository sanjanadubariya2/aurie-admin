import { useLockBodyScroll } from '../../hooks/useLockBodyScroll.js'
import { useEscape } from '../../hooks/useEscape.js'

export default function Drawer({ open, onClose, title, subtitle, children, footer }) {
  useLockBodyScroll(open)
  useEscape(open, onClose)
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[70]">
      <div className="absolute inset-0 animate-fadeIn bg-soot/45 backdrop-blur-[2px]" onClick={onClose} />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="absolute right-0 top-0 flex h-full w-full max-w-[460px] animate-slideLeft flex-col bg-wax shadow-lift"
      >
        <header className="flex items-start justify-between gap-4 border-b border-wick px-5 py-4">
          <div>
            <h2 className="font-display text-lg leading-tight text-soot">{title}</h2>
            {subtitle && <p className="mt-0.5 text-[13px] text-smoke">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-smoke hover:bg-ash hover:text-soot"
          >
            <svg viewBox="0 0 14 14" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M1 1l12 12M13 1L1 13" strokeLinecap="round" />
            </svg>
          </button>
        </header>
        <div className="flex-1 overflow-y-auto overscroll-contain">{children}</div>
        {footer && <footer className="border-t border-wick bg-wax px-5 py-4">{footer}</footer>}
      </aside>
    </div>
  )
}
