"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import type { Card, CardStoreV1 } from "@/app/lib/cards/types"
import { useCards } from "@/app/lib/cards/useCards"
import { useMounted } from "@/app/lib/useMounted"

function isStringArray(x: unknown): x is string[] {
  return Array.isArray(x) && x.every(v => typeof v === "string")
}

function normalizeCard(input: unknown): Card | null {
  if (!input || typeof input !== "object") return null
  const c = input as Partial<Card>

  // front/back required
  if (typeof c.front !== "string" || typeof c.back !== "string") return null

  const id =
    typeof c.id === "string"
      ? c.id
      : (typeof crypto !== "undefined" && "randomUUID" in crypto)
        ? crypto.randomUUID()
        : `imp_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`

  const now = new Date().toISOString()

  return {
    id,
    front: c.front,
    back: c.back,
    path: isStringArray(c.path) ? c.path : ["Japanese", "Unsorted", "Unsorted"],
    tags: isStringArray(c.tags) ? c.tags : [],
    notes: typeof c.notes === "string" ? c.notes : undefined,
    createdAt: typeof c.createdAt === "string" ? c.createdAt : now,
    updatedAt: typeof c.updatedAt === "string" ? c.updatedAt : now,
    source: c.source === "seed" || c.source === "user" ? c.source : "user",
  }
}

function parseIncoming(json: unknown): Card[] {
  // Accept:
  // 1) {version: 1, cards: [...]}
  // 2) [...]
  if (Array.isArray(json)) {
    return json.map(normalizeCard).filter(Boolean) as Card[]
  }

  if (json && typeof json === "object") {
    const obj = json as Partial<CardStoreV1>
    if (Array.isArray(obj.cards)) {
      return obj.cards.map(normalizeCard).filter(Boolean) as Card[]
    }
  }

  return []
}

function download(filename: string, text: string) {
  const blob = new Blob([text], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export default function ImportExportPage() {
  const mounted = useMounted()
  const { cards, replaceAll } = useCards()
  const [status, setStatus] = useState<string>("")

  const storeForExport: CardStoreV1 = useMemo(() => ({ version: 1, cards }), [cards])

  if (!mounted) {
    return (
      <main className="mx-auto max-w-xl p-4 space-y-4">
        <h1 className="text-2xl font-bold">Import / Export</h1>
        <div className="text-sm text-muted">Loading…</div>
      </main>
    )
  }

  function exportJson() {
    const filename = `blisscards-backup-${new Date().toISOString().slice(0, 10)}.json`
    download(filename, JSON.stringify(storeForExport, null, 2))
    setStatus(`Downloaded backup (${cards.length} cards).`)
  }

  async function importFile(file: File, mode: "merge" | "replace") {
    setStatus("")
    try {
      const text = await file.text()
      const parsed = JSON.parse(text) as unknown
      const incoming = parseIncoming(parsed)

      if (incoming.length === 0) {
        setStatus("Import failed: no valid cards found in that JSON.")
        return
      }

      if (mode === "replace") {
        const ok = confirm(`Replace ALL existing cards with ${incoming.length} imported cards?`)
        if (!ok) return
        replaceAll(incoming)
        setStatus(`Replaced with ${incoming.length} imported cards.`)
        return
      }

      // merge by id (import overwrites if same id)
      const byId = new Map<string, Card>()
      for (const c of cards) byId.set(c.id, c)
      for (const c of incoming) byId.set(c.id, c)

      const merged = Array.from(byId.values())
      replaceAll(merged)
      setStatus(`Merged ${incoming.length} imported cards. Total: ${merged.length}.`)
    } catch {
      setStatus("Import failed: file was not valid JSON.")
    }
  }

  return (
    <main className="mx-auto max-w-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Import / Export</h1>
        <Link className="rounded border px-3 py-2 hover:bg-fg/10 transition" href="/">Back</Link>
      </div>

      <section className="rounded-xl border p-4 space-y-3 bg-surface">
        <div className="font-semibold">Export</div>
        <p className="text-sm text-muted">
          Download a JSON backup you can import on another device.
        </p>
        <button className="rounded bg-primary text-primary-fg px-4 py-2 hover:brightness-110 hover:[box-shadow:0_0_8px_2px_var(--glow-primary)] transition" onClick={exportJson}>
          Download backup JSON ({cards.length} cards)
        </button>
      </section>

      <section className="rounded-xl border p-4 space-y-3 bg-surface">
        <div className="font-semibold">Import</div>
        <p className="text-sm text-muted">
          Import a JSON file exported from this app. Choose merge or replace.
        </p>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm">
              <div className="font-medium">Merge</div>
              <div className="text-muted">Keeps existing cards; imported cards overwrite on same ID.</div>
            </div>
            <input
              type="file"
              accept="application/json,.json"
              onChange={e => {
                const file = e.target.files?.[0]
                if (file) importFile(file, "merge")
                e.currentTarget.value = ""
              }}
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="text-sm">
              <div className="font-medium">Replace</div>
              <div className="text-muted">Deletes all current cards and replaces with the import.</div>
            </div>
            <input
              type="file"
              accept="application/json,.json"
              onChange={e => {
                const file = e.target.files?.[0]
                if (file) importFile(file, "replace")
                e.currentTarget.value = ""
              }}
            />
          </div>
        </div>

        {status ? (
          <div className="text-sm text-muted">{status}</div>
        ) : null}
      </section>

      <section className="rounded-xl border p-4 space-y-2 bg-surface">
        <div className="font-semibold">Tip</div>
        <p className="text-sm text-muted">
          This app also accepts importing a raw array of cards (not wrapped in a store object).
        </p>
      </section>
    </main>
  )
}
