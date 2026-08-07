import Button from '../ui/Button.jsx'
import { rupees, startingPrice } from '../../lib/format.js'

export default function ProductTable({ products, collections, onEdit, onToggleStock, onDelete }) {
  const collectionName = (id) => collections.find((c) => c.id === id)?.name || id

  return (
    <ul className="space-y-2">
      {products.map((p) => (
        <li
          key={p.id}
          className={`flex items-center gap-4 rounded-card border border-wick bg-wax p-3.5 ${p.inStock ? '' : 'opacity-55'}`}
        >
          {p.image ? (
            <img src={p.image} alt="" className="h-16 w-16 shrink-0 rounded-lg bg-ash object-cover" />
          ) : (
            <span className="h-16 w-16 shrink-0 rounded-lg bg-ash" />
          )}

          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-[16px] text-soot">{p.name}</p>
            <p className="truncate text-[13px] text-smoke">
              {collectionName(p.collection)}
              {p.scent ? ` · ${p.scent}` : ''}
            </p>
          </div>

          <div className="hidden shrink-0 text-right sm:block">
            <p className="text-[15px] tabular-nums text-soot">
              {startingPrice(p) === null ? 'Quoted' : rupees(startingPrice(p))}
            </p>
            <p className="text-[12px] text-smoke">
              {p.tiers.length} {p.tiers.length === 1 ? 'size' : 'sizes'}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={() => onToggleStock(p)}
              title={p.inStock ? 'Hide from the storefront' : 'Show on the storefront'}
              className={`rounded-full border px-3 py-1.5 text-[12px] transition-colors
                ${p.inStock ? 'border-soot/20 text-soot hover:border-soot' : 'border-wick text-smoke hover:border-soot hover:text-soot'}`}
            >
              {p.inStock ? 'Live' : 'Hidden'}
            </button>
            <Button size="sm" variant="outline" onClick={() => onEdit(p)}>
              Edit
            </Button>
            <button
              onClick={() => onDelete(p)}
              aria-label={`Delete ${p.name}`}
              className="grid h-9 w-9 place-items-center rounded-full text-smoke transition-colors hover:bg-ember/10 hover:text-ember"
            >
              <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.4">
                <path d="M2 4h12M6 4V2h4v2M4 4l1 10h6l1-10" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
