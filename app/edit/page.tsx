"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { useCards } from "../lib/cards/useCards"
import type { Card } from "../lib/cards/types"
import { useMounted } from "../lib/useMounted"

function nowISO() {
  return new Date().toISOString()
}

function uid() {
  // good enough for local app; can swap for crypto.randomUUID() later
  return crypto?.randomUUID?.() ?? String(Date.now())
}

function uniq(values: (string | undefined)[]) {
  return Array.from(new Set(values.filter(Boolean))) as string[]
}

type FormState = {
  id?: string
  front: string
  back: string
  course: string
  act: string
  scene: string
  tags: string
  notes: string
}

export default function EditPage() {
  const mounted = useMounted()
  const { cards, addCard, updateCard, removeCard } = useCards()

  // Build options from existing cards
  const courses = useMemo(() => uniq(cards.map(c => c.path?.[0])), [cards])

  const [course, setCourse] = useState("")
  const acts = useMemo(() => uniq(cards.filter(c => !course || c.path?.[0] === course).map(c => c.path?.[1])), [cards, course])
  const [act, setAct] = useState("")
  const scenes = useMemo(() => uniq(cards.filter(c => (!course || c.path?.[0] === course) && (!act || c.path?.[1] === act)).map(c => c.path?.[2])), [cards, course, act])
  const [scene, setScene] = useState("")

  const filteredCards = useMemo(() => {
    return cards.filter(c => {
      if (course && c.path?.[0] !== course) return false
      if (act && c.path?.[1] !== act) return false
      if (scene && c.path?.[2] !== scene) return false
      return true
    })
  }, [cards, course, act, scene])

  const [form, setForm] = useState<FormState>({
    front: "",
    back: "",
    course: courses[0] ?? "Japanese",
    act: "Unsorted",
    scene: "Unsorted",
    tags: "",
    notes: ""
  })

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function startEdit(card: Card) {
    setForm({
      id: card.id,
      front: card.front,
      back: card.back,
      course: card.path?.[0] ?? "Japanese",
      act: card.path?.[1] ?? "Unsorted",
      scene: card.path?.[2] ?? "Unsorted",
      tags: (card.tags ?? []).join(", "),
      notes: card.notes ?? ""
    })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function resetForm() {
    setForm({
      id: undefined,
      front: "",
      back: "",
      course: form.course || "Japanese",
      act: "Unsorted",
      scene: "Unsorted",
      tags: "",
      notes: ""
    })
  }

  function submit() {
    const front = form.front.trim()
    const back = form.back.trim()
    if (!front || !back) return

    const tags = form.tags
      .split(",")
      .map(t => t.trim())
      .filter(Boolean)

    const card: Card = {
      id: form.id ?? uid(),
      front,
      back,
      path: [form.course.trim() || "Japanese", form.act.trim() || "Unsorted", form.scene.trim() || "Unsorted"],
      tags,
      notes: form.notes.trim() ? form.notes.trim() : undefined,
      createdAt: form.id ? (cards.find(c => c.id === form.id)?.createdAt ?? nowISO()) : nowISO(),
      updatedAt: nowISO(),
      source: form.id ? (cards.find(c => c.id === form.id)?.source ?? "user") : "user"
    }

    if (form.id) updateCard(card)
    else addCard(card)

    resetForm()
  }
  
  if (!mounted) return <div className="p-4">Loading…</div>

  return (
    <main className="mx-auto max-w-3xl p-4 space-y-6">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Edit Cards</h1>
        <div className="flex gap-2">
          <Link className="rounded border px-3 py-2" href="/">Back</Link>
          <Link className="rounded border px-3 py-2" href="/study">Study</Link>
        </div>
      </div>

      {/* Form */}
      <section className="rounded-xl border p-4 space-y-3">
        <div className="text-sm font-semibold">{form.id ? "Edit card" : "Add a new card"}</div>

        <div className="grid md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-sm font-medium">Front</label>
            <textarea
              className="w-full border rounded p-2 min-h-[80px]"
              value={form.front}
              onChange={e => set("front", e.target.value)}
              placeholder="e.g., Everyone (used in addressing a group)"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Back</label>
            <textarea
              className="w-full border rounded p-2 min-h-[80px]"
              value={form.back}
              onChange={e => set("back", e.target.value)}
              placeholder="e.g., みなさん"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label>Course</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                className="min-w-0 flex-1 border rounded p-2"
                value={form.course}
                onChange={e => set("course", e.target.value)}
                placeholder="Type or pick…"
              />
              <select
                className="sm:w-30 border rounded p-2"
                value=""
                onChange={e => {
                  if (e.target.value) set("course", e.target.value)
                  e.currentTarget.value = ""
                }}
              >
                <option value="">Select...</option>
                {courses.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label>Unit</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                className="min-w-0 flex-1 border rounded p-2"
                value={form.act}
                onChange={e => set("act", e.target.value)}
                placeholder="Type or pick…"
              />
              <select
                className="sm:w-30 border rounded p-2"
                value=""
                onChange={e => {
                  if (e.target.value) set("act", e.target.value)
                  e.currentTarget.value = ""
                }}
              >
                <option value="">Select...</option>
                {acts.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label>Scene</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                className="min-w-0 flex-1 border rounded p-2"
                value={form.scene}
                onChange={e => set("scene", e.target.value)}
                placeholder="Type or pick…"
              />
              <select
                className="sm:w-30 border rounded p-2"
                value=""
                onChange={e => {
                  if (e.target.value) set("scene", e.target.value)
                  e.currentTarget.value = ""
                }}
              >
                <option value="">Select...</option>
                {scenes.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-sm font-medium">Tags (comma separated)</label>
            <input
              className="w-full border rounded p-2"
              value={form.tags}
              onChange={e => set("tags", e.target.value)}
              placeholder="e.g., particles, polite, greeting"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Notes (optional)</label>
            <input
              className="w-full border rounded p-2"
              value={form.notes}
              onChange={e => set("notes", e.target.value)}
              placeholder="e.g., Used in formal contexts"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            className="rounded bg-black text-white px-4 py-2"
            onClick={submit}
          >
            {form.id ? "Save changes" : "Add card"}
          </button>
          {form.id ? (
            <button className="rounded border px-4 py-2" onClick={resetForm}>
              Cancel
            </button>
          ) : null}
        </div>
      </section>

      {/* Filters */}
      <section className="rounded-xl border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">Cards ({filteredCards.length})</div>
          <button
            className="text-sm rounded border px-3 py-2"
            onClick={() => { setCourse(""); setAct(""); setScene("") }}
          >
            Clear filters
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-sm font-medium">Course</label>
            <select className="w-full border rounded p-2" value={course} onChange={e => { setCourse(e.target.value); setAct(""); setScene("") }}>
              <option value="">All</option>
              {courses.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Act</label>
            <select className="w-full border rounded p-2" value={act} onChange={e => { setAct(e.target.value); setScene("") }} disabled={!course}>
              <option value="">All</option>
              {acts.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Scene</label>
            <select className="w-full border rounded p-2" value={scene} onChange={e => setScene(e.target.value)} disabled={!course || !act}>
              <option value="">All</option>
              {scenes.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="divide-y">
          {filteredCards.map(card => (
            <div key={card.id} className="py-3 flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
              <div className="flex-1">
                <div className="font-medium whitespace-pre-wrap">{card.front}</div>
                <div className="text-sm text-gray-600 whitespace-pre-wrap">{card.back}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {(card.path ?? []).filter(Boolean).join(" • ")}
                </div>
              </div>
              <div className="flex gap-2">
                <button className="rounded border px-3 py-2" onClick={() => startEdit(card)}>
                  Edit
                </button>
                <button
                  className="rounded border px-3 py-2"
                  onClick={() => {
                    if (confirm("Delete this card?")) removeCard(card.id)
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {filteredCards.length === 0 ? (
            <div className="py-6 text-sm text-gray-600">No cards match your filters.</div>
          ) : null}
        </div>
      </section>
    </main>
  )
}