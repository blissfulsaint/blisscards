"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useCards } from "@/app/lib/cards/useCards"
import type { Card } from "@/app/lib/cards/types"

import { useMounted } from "../lib/useMounted"

type Direction = "front-to-back" | "back-to-front"

function getPrompt(card: Card, dir: Direction) {
  return dir === "front-to-back" ? card.front : card.back
}
function getAnswer(card: Card, dir: Direction) {
  return dir === "front-to-back" ? card.back : card.front
}

function shuffle<T>(arr: T[]) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function matchFilters(card: Card, course: string, act: string, scene: string) {
  if (course && card.path?.[0] !== course) return false
  if (act && card.path?.[1] !== act) return false
  if (scene && card.path?.[2] !== scene) return false
  return true
}

export default function StudyClient() {
  const mounted = useMounted()

  const [direction, setDirection] = useState<Direction>("front-to-back")
  const { cards } = useCards()
  const params = useSearchParams()

  const course = params.get("course") ?? ""
  const act = params.get("act") ?? ""
  const scene = params.get("scene") ?? ""

  const pool = useMemo(() => {
    const filtered = cards.filter(c => matchFilters(c, course, act, scene))
    return shuffle(filtered)
  }, [cards, course, act, scene])

  const [index, setIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [correct, setCorrect] = useState(0)
  const [missed, setMissed] = useState<Card[]>([])
  const [mode, setMode] = useState<"main" | "missed">("main")

  const activePool = mode === "main" ? pool : missed
  const current = activePool[index]

  const done = activePool.length > 0 && index >= activePool.length

  function next() {
    setIsFlipped(false)
    setIndex(i => i + 1)
  }

  function markGotIt() {
    setCorrect(c => c + 1)
    next()
  }

  function markMissed() {
    if (current) setMissed(m => (m.some(x => x.id === current.id) ? m : [...m, current]))
    next()
  }

  function restartMain() {
    setMode("main")
    setIndex(0)
    setIsFlipped(false)
    setCorrect(0)
    setMissed([])
  }

  function studyMissed() {
    setMode("missed")
    setIndex(0)
    setIsFlipped(false)
  }
  
  
  // Empty states
  if (!mounted) return <div className="p-4">Loading…</div>
  
  if (pool.length === 0) {
    return (
      <main className="mx-auto max-w-xl p-4 space-y-4">
        <h1 className="text-2xl font-bold">Study</h1>
        <p className="text-sm text-gray-600">
          No cards match your current filter.
        </p>
        <div className="flex gap-2">
          <Link className="rounded border px-3 py-2" href="/">Back</Link>
          <Link className="rounded bg-black text-white px-3 py-2" href="/edit">Add Cards</Link>
        </div>
      </main>
    )
  }
  
  return (
    <main className="mx-auto max-w-xl p-4 space-y-4">
      <div className="flex gap-2">
        <button
          className={`rounded border px-3 py-2 text-sm ${direction === "front-to-back" ? "bg-black text-white" : ""}`}
          onClick={() => { setDirection("front-to-back"); setIsFlipped(false) }}
        >
          Front → Back
        </button>
        <button
          className={`rounded border px-3 py-2 text-sm ${direction === "back-to-front" ? "bg-black text-white" : ""}`}
          onClick={() => { setDirection("back-to-front"); setIsFlipped(false) }}
        >
          Back → Front
        </button>
      </div>
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">Study</h1>
          <p className="text-xs text-gray-600">
            {course || "All"}{act ? ` • ${act}` : ""}{scene ? ` • ${scene}` : ""} • {mode === "main" ? "Main" : "Missed"}
          </p>
        </div>
        <Link className="rounded border px-3 py-2" href="/">Exit</Link>
      </div>

      <div className="text-sm text-gray-700 flex justify-between">
        <div>
          Card {Math.min(index + 1, activePool.length)} / {activePool.length}
        </div>
        <div>
          ✅ {correct} • ❌ {missed.length}
        </div>
      </div>

      {!done ? (
        <>
          <button
            className="w-full rounded-xl border p-6 text-left active:scale-[0.99] transition"
            onClick={() => setIsFlipped(f => !f)}
          >
            <div className="text-xs text-gray-500 mb-2">{isFlipped ? "Back" : "Front"}</div>
            <div className="text-xl font-semibold leading-snug whitespace-pre-wrap">
              {current ? (isFlipped ? getAnswer(current, direction) : getPrompt(current, direction)) : ""}
            </div>
            {(current?.notes?.trim() && isFlipped) ? (
              <div className="mt-4 text-sm text-gray-600 whitespace-pre-wrap">
                <span className="font-medium">Notes: </span>{current.notes}
              </div>
            ) : null}
            {(current?.tags?.length ? true : false) ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {current!.tags.map(t => (
                  <span key={t} className="text-xs rounded-full border px-2 py-1 text-gray-700">
                    {t}
                  </span>
                ))}
              </div>
            ) : null}
            <div className="mt-4 text-xs text-gray-500">
              Tap to flip
            </div>
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              className="rounded-xl border p-3"
              onClick={markMissed}
            >
              ❌ Missed
            </button>
            <button
              className="rounded-xl bg-black text-white p-3"
              onClick={markGotIt}
            >
              ✅ Got it
            </button>
          </div>
        </>
      ) : (
        <div className="rounded-xl border p-6 space-y-4">
          <div>
            <div className="text-lg font-semibold">Session complete</div>
            <div className="text-sm text-gray-700">
              ✅ {correct} correct • ❌ {missed.length} missed
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {missed.length > 0 && mode === "main" ? (
              <button className="rounded bg-black text-white px-3 py-2" onClick={studyMissed}>
                Study missed cards ({missed.length})
              </button>
            ) : null}

            <button className="rounded border px-3 py-2" onClick={restartMain}>
              Restart session
            </button>

            <Link className="rounded border px-3 py-2 text-center" href="/edit">
              Edit cards
            </Link>
          </div>
        </div>
      )}
    </main>
  )
}