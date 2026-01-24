"use client"

import Link from "next/link";
import { useMemo, useState } from "react";
import { useCards } from "./lib/cards/useCards";

function uniq(values: (string | undefined)[]) {
  return Array.from(new Set(values.filter(Boolean))) as string[]
}

export default function Home() {
  const { cards } = useCards()

  const courses = useMemo(() => uniq(cards.map(c => c.path?.[0])), [cards])
  const [course, setCourse] = useState<string>("")

  const acts = useMemo(() => {
    if (!course) return []
    return uniq(cards.filter(c => c.path?.[0] === course).map(c => c.path?.[1]))
  }, [cards, course])

  const [act, setAct] = useState<string>("")

  const scenes = useMemo(() => {
    if (!course || !act) return []
    return uniq(cards.filter(c => c.path?.[0] === course && c.path?.[1] === act).map(c => c.path?.[2]))
  }, [cards, course, act])

  const [scene, setScene] = useState<string>("")

  const filteredCount = useMemo(() => {
    return cards.filter(c => {
      if (course && c.path?.[0] !== course) return false
      if (act && c.path?.[1] !== act) return false
      if (scene && c.path?.[2] !== scene) return false
      return true
    }).length
  }, [cards, course, act, scene])

  return (
    <main className="mx-auto max-w-xl p-4 space-y-4">
      <h1 className="text-2xl font-bold">Flashcards</h1>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Course</label>
        <select className="w-full border rounded p-2" value={course} onChange={e => { setCourse(e.target.value); setAct(""); setScene("") }}>
          <option value="">All</option>
          {courses.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <label className="block text-sm font-medium">Act</label>
        <select className="w-full border rounded p-2" value={act} onChange={e => { setAct(e.target.value); setScene("") }} disabled={!course}>
          <option value="">All</option>
          {acts.map(a => <option key={a} value={a}>{a}</option>)}
        </select>

        <label className="block text-sm font-medium">Scene</label>
        <select className="w-full border rounded p-2" value={scene} onChange={e => setScene(e.target.value)} disabled={!course || !act}>
          <option value="">All</option>
          {scenes.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="flex gap-2">
        <Link
          className="flex-1 text-center rounded bg-black text-white p-3"
          href={`/study?course=${encodeURIComponent(course)}&act=${encodeURIComponent(act)}&scene=${encodeURIComponent(scene)}`}
        >
          Study ({filteredCount})
        </Link>
        <Link className="flex-1 text-center rounded border p-3" href="/edit">
          Edit Cards
        </Link>
      </div>
    </main>
  );
}
