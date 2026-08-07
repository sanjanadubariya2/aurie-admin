export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-[28px] leading-tight text-soot sm:text-[32px]">{title}</h1>
        {subtitle && <p className="mt-1.5 text-[15px] text-smoke">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
