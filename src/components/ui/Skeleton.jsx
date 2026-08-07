export default function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-lg bg-wick/60 ${className}`} />
}

export function RowSkeleton({ count = 6, height = 'h-16' }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className={`${height} rounded-xl`} />
      ))}
    </div>
  )
}
