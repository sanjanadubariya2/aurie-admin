const base =
  'inline-flex items-center justify-center gap-2 font-sans font-medium transition-all duration-200 ' +
  'disabled:opacity-45 disabled:pointer-events-none select-none active:scale-[0.97]'

const variants = {
  primary: 'bg-ember text-wax hover:bg-[#A93A19]',
  dark: 'bg-soot text-wax hover:bg-[#241F17]',
  outline: 'border border-soot/25 text-soot hover:border-soot hover:bg-soot hover:text-wax',
  ghost: 'text-smoke hover:bg-soot/[0.06] hover:text-soot',
  danger: 'border border-ember/40 text-ember hover:bg-ember hover:text-wax',
}

const sizes = {
  sm: 'h-9 px-3.5 text-[13px] rounded-full',
  md: 'h-11 px-6 text-sm rounded-full',
  block: 'h-12 w-full text-sm rounded-full',
}

export default function Button({
  as: Tag = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  children,
  ...props
}) {
  return (
    <Tag
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={Tag === 'button' ? loading || props.disabled : undefined}
      {...props}
    >
      {loading && (
        <span
          aria-hidden="true"
          className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {children}
    </Tag>
  )
}
