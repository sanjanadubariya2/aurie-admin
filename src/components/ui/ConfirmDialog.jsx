import Modal from './Modal.jsx'
import Button from './Button.jsx'

export default function ConfirmDialog({ open, title, body, confirmLabel, onConfirm, onCancel, busy }) {
  return (
    <Modal open={open} onClose={onCancel} title={title} size="sm">
      <div className="p-7">
        <h2 className="font-display text-[22px] leading-tight text-soot">{title}</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-smoke">{body}</p>
        <div className="mt-7 flex gap-3">
          <Button variant="danger" onClick={onConfirm} loading={busy}>
            {confirmLabel}
          </Button>
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  )
}
