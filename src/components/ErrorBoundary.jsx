import { Component } from 'react'

/**
 * Catches a crash in one page so it shows a message instead of blanking the
 * whole app (header, cart and navigation keep working). `resetKey` — the
 * current URL — clears the error when the visitor navigates elsewhere.
 */
export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('[page crashed]', error, info?.componentStack)
  }

  componentDidUpdate(prev) {
    if (prev.resetKey !== this.props.resetKey && this.state.error) this.setState({ error: null })
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="mx-auto max-w-md px-5 py-24 text-center">
        <h1 className="font-display text-[30px] leading-tight text-soot">Something went wrong on this page</h1>
        <p className="mt-3 text-[15px] text-smoke">The rest of the site still works. Reloading usually fixes it.</p>
        <div className="mt-6 flex justify-center gap-3">
          <button onClick={() => window.location.reload()} className="h-11 rounded-full bg-soot px-6 text-[14px] text-wax">
            Reload
          </button>
          <a href="/" className="flex h-11 items-center rounded-full border border-soot/25 px-6 text-[14px] text-soot">
            Go home
          </a>
        </div>
      </div>
    )
  }
}
