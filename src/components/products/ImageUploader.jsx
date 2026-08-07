import { useRef, useState } from 'react'
import { uploadProductImage } from '../../api/products.js'
import { useToast } from '../../context/ToastContext.jsx'

const MAX_MB = 5

/**
 * Uploads to POST /admin/products/:id/image and hands back the hosted URL.
 * A product must exist before it can hold an image, so for a brand-new product
 * this is disabled until the first save.
 */
export default function ImageUploader({ productId, value, onChange }) {
  const { toast } = useToast()
  const inputRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const [preview, setPreview] = useState(null)

  const pick = async (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) return toast('Pick an image file', 'error')
    if (file.size > MAX_MB * 1024 * 1024) return toast(`Images must be under ${MAX_MB}MB`, 'error')

    setPreview(URL.createObjectURL(file))
    setBusy(true)
    try {
      const url = await uploadProductImage(productId, file)
      onChange(url)
      toast('Image uploaded')
    } catch (e) {
      setPreview(null)
      toast(e.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  const shown = preview || value
  const locked = !productId

  return (
    <div className="flex items-center gap-4">
      <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-xl border border-wick bg-ash">
        {shown ? (
          <img
            src={shown}
            alt=""
            className={`h-full w-full object-cover ${busy ? 'opacity-40' : ''}`}
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        ) : (
          <svg viewBox="0 0 20 20" className="h-5 w-5 text-smoke" fill="none" stroke="currentColor" strokeWidth="1.3">
            <rect x="2" y="4" width="16" height="12" rx="2" />
            <path d="M2 13l4-4 4 4 3-3 5 5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>

      <div className="min-w-0">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => pick(e.target.files?.[0])}
        />
        <button
          type="button"
          disabled={locked || busy}
          onClick={() => inputRef.current?.click()}
          className="rounded-full border border-soot/25 px-3.5 py-1.5 text-[13px] text-soot transition-colors
            hover:border-soot hover:bg-soot hover:text-wax disabled:pointer-events-none disabled:opacity-45"
        >
          {busy ? 'Uploading…' : shown ? 'Replace image' : 'Upload image'}
        </button>
        <p className="mt-1.5 text-[12px] text-smoke">
          {locked ? 'Save the product first, then add its image.' : `JPG or PNG, under ${MAX_MB}MB.`}
        </p>
      </div>
    </div>
  )
}
