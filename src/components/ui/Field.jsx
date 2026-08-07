export default function Field({ label, hint, error, id, className = '', children }) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="label mb-1.5 block">
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p className="mt-1.5 text-[13px] text-ember">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-[13px] text-smoke">{hint}</p>
      ) : null}
    </div>
  )
}

export function Input({ invalid, className = '', ...props }) {
  return (
    <input
      className={`h-11 w-full rounded-xl border bg-wax px-3.5 text-[15px] text-ink placeholder:text-smoke/60
        focus:outline-none focus-visible:border-ember ${invalid ? 'border-ember' : 'border-wick'} ${className}`}
      {...props}
    />
  )
}

export function Textarea({ className = '', ...props }) {
  return (
    <textarea
      rows={3}
      className={`w-full rounded-xl border border-wick bg-wax px-3.5 py-2.5 text-[15px] text-ink
        placeholder:text-smoke/60 focus:outline-none focus-visible:border-ember ${className}`}
      {...props}
    />
  )
}

export function Select({ invalid, className = '', children, ...props }) {
  return (
    <select
      className={`h-11 w-full rounded-xl border bg-wax px-3 text-[15px] text-ink focus:outline-none
        focus-visible:border-ember ${invalid ? 'border-ember' : 'border-wick'} ${className}`}
      {...props}
    >
      {children}
    </select>
  )
}

export function SearchInput({ className = '', ...props }) {
  return (
    <div className={`relative ${className}`}>
      <svg
        viewBox="0 0 16 16"
        className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-smoke"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <circle cx="7" cy="7" r="5" />
        <path d="M11 11l4 4" strokeLinecap="round" />
      </svg>
      <input
        className="h-10 w-full rounded-full border border-wick bg-wax pl-9 pr-3.5 text-[14px]
          placeholder:text-smoke/60 focus:outline-none focus-visible:border-ember"
        {...props}
      />
    </div>
  )
}
