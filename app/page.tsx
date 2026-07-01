"use client"

import Link from "next/link";
import { useMemo, useState } from "react";
import { useCards } from "./lib/cards/useCards";
import { useMounted } from "@/app/lib/useMounted";
import { ThemePicker } from "@/app/components/ThemePicker";

function uniq(values: (string | undefined)[]) {
  return Array.from(new Set(values.filter(Boolean))) as string[]
}

export default function Home() {
  const mounted = useMounted()

  const { cards } = useCards()

  const courses = useMemo(() => uniq(cards.map(c => c.path?.[0])), [cards])
  const [course, setCourse] = useState<string>("")

  const units = useMemo(() => {
    if (!course) return []
    return uniq(cards.filter(c => c.path?.[0] === course).map(c => c.path?.[1]))
  }, [cards, course])

  const [unit, setUnit] = useState<string>("")

  const lessons = useMemo(() => {
    if (!course || !unit) return []
    return uniq(cards.filter(c => c.path?.[0] === course && c.path?.[1] === unit).map(c => c.path?.[2]))
  }, [cards, course, unit])

  const [lesson, setLesson] = useState<string>("")

  const filteredCount = useMemo(() => {
    return cards.filter(c => {
      if (course && c.path?.[0] !== course) return false
      if (unit && c.path?.[1] !== unit) return false
      if (lesson && c.path?.[2] !== lesson) return false
      return true
    }).length
  }, [cards, course, unit, lesson])

  if (!mounted) {
    return (
      <main className="mx-auto max-w-xl p-4 space-y-4">
        <h1 className="text-2xl font-bold">BlissCards</h1>
        <div className="text-sm text-muted">Loading…</div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">BlissCards</h1>
        <ThemePicker />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Course</label>
        <select className="w-full border rounded p-2 bg-bg text-fg appearance-none" value={course} onChange={e => { setCourse(e.target.value); setUnit(""); setLesson("") }}>
          <option value="">All</option>
          {courses.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <label className="block text-sm font-medium">Unit</label>
        <select className="w-full border rounded p-2 bg-bg text-fg appearance-none" value={unit} onChange={e => { setUnit(e.target.value); setLesson("") }} disabled={!course}>
          <option value="">All</option>
          {units.map(a => <option key={a} value={a}>{a}</option>)}
        </select>

        <label className="block text-sm font-medium">Lesson</label>
        <select className="w-full border rounded p-2 bg-bg text-fg appearance-none" value={lesson} onChange={e => setLesson(e.target.value)} disabled={!course || !unit}>
          <option value="">All</option>
          {lessons.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="flex gap-2">
        <Link
          className="flex-1 text-center rounded bg-primary text-primary-fg p-3 hover:brightness-110 hover:[box-shadow:0_0_8px_2px_var(--glow-primary)] transition"
          href={`/study?course=${encodeURIComponent(course)}&unit=${encodeURIComponent(unit)}&lesson=${encodeURIComponent(lesson)}`}
        >
          Study ({filteredCount})
        </Link>
        <Link className="flex-1 text-center rounded border p-3 hover:bg-fg/10 transition" href="/edit">
          Edit Cards
        </Link>
        <Link className="flex-1 text-center rounded border p-3 hover:bg-fg/10 transition" href="/import-export">
          Import/Export
        </Link>
      </div>
    </main>
  );
}
