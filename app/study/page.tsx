import { Suspense } from "react"
import StudyClient from "./StudyClient"

export default function Study() {
  return (
    <Suspense fallback={<div className="p-4">Loading…</div>}>
      <StudyClient />
    </Suspense>
  )
}