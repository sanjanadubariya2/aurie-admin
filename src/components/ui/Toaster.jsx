export default function Toaster({ toasts, onDismiss }) {
  if (!toasts.length) return null
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-5 z-[80] flex flex-col items-center gap-2 px-4"
    >
      {toasts.map((t) => (
        <button
          key={t.id}
          onClick={() => onDismiss(t.id)}
          className={`pointer-events-auto animate-slideUp rounded-full px-5 py-2.5 text-[13px] shadow-lift
            ${t.tone === 'error' ? 'bg-ember text-wax' : 'bg-soot text-wax'}`}
        >
          {t.message}
        </button>
      ))}
    </div>
  )
}
