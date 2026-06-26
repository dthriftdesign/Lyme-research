import { useState } from 'react'

// Persistent, dismissible-to-collapsed disclaimer required on every page.
export default function DisclaimerBanner() {
  const [open, setOpen] = useState(false)
  return (
    <div className="bg-amber-50 border-b border-amber-200 text-amber-900 text-sm">
      <div className="max-w-6xl mx-auto px-4 py-2 flex items-start gap-3">
        <span className="font-semibold shrink-0">⚠ Research-synthesis resource — not medical advice.</span>
        <button
          onClick={() => setOpen((o) => !o)}
          className="underline shrink-0 text-amber-800"
        >
          {open ? 'Hide' : 'Read full disclaimer'}
        </button>
      </div>
      {open && (
        <div className="max-w-6xl mx-auto px-4 pb-3 text-amber-900/90 space-y-2">
          <p>
            This project aggregates published research and patient-reported experiences related to
            Lyme disease and associated conditions. Nothing here is medical advice, diagnosis, or
            treatment recommendation. Information presented as &ldquo;non-consensus&rdquo; or
            &ldquo;fringe&rdquo; is included because rigorous research synthesis requires engaging
            with minority positions, not because those positions are endorsed.
          </p>
          <p>
            Patient reports from forums are paraphrased for pattern-recognition purposes; they are
            not validated case data. If you are experiencing a medical issue, consult a licensed
            clinician.
          </p>
          <p className="font-medium">
            In crisis or considering self-harm? US: call or text <strong>988</strong> · UK:
            Samaritans <strong>116 123</strong> · International: findahelpline.com
          </p>
        </div>
      )}
    </div>
  )
}
