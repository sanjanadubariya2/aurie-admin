import Button from './Button.jsx'

/** Shown when a fetch fails. Says what broke and offers the one useful action. */
export default function ErrorNotice({ message, onRetry }) {
  return (
    <div className="rounded-card border border-ember/30 bg-ember/[0.04] p-6">
      <h3 className="font-display text-[19px] text-soot">Could not load this</h3>
      <p className="mt-2 text-[15px] text-smoke">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-4">
          Try again
        </Button>
      )}
    </div>
  )
}
