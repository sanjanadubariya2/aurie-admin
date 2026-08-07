export default function EmptyState({ title, body, action }) {
  return (
    <div className="mx-auto max-w-sm py-16 text-center">
      <h3 className="font-display text-2xl text-soot">{title}</h3>
      {body && <p className="mt-2 text-[15px] text-smoke">{body}</p>}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  )
}
