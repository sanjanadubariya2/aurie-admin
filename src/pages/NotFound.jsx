import { Link } from 'react-router-dom'
import Button from '../components/ui/Button.jsx'

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md py-24 text-center">
      <h1 className="font-display text-[36px] leading-none text-soot">Nothing here</h1>
      <p className="mt-3 text-[15px] text-smoke">That admin page does not exist.</p>
      <Button as={Link} to="/" className="mt-7">
        Back to dashboard
      </Button>
    </div>
  )
}
