import type { CardStoreV1, Card } from "./types";
import seed from "../../../public/seed.json";

const STORAGE_KEY = "flashcards_store";

function nowISO() {
  return new Date().toISOString();
}

function isCard(x: unknown): x is Card {
  if (!x || typeof x !== "object") return false
  const c = x as Partial<Card>
  return typeof c.id === "string" && typeof c.front === "string" && typeof c.back === "string"
}

export function loadStore(): CardStoreV1 {
  if (typeof window === "undefined") return { version: 1, cards: [] }

  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    const seeded = seed as CardStoreV1

    const safe: CardStoreV1 = {
      version: 1,
      cards: Array.isArray(seeded.cards) ? seeded.cards.filter(isCard) : []
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(safe))
    return safe
  }

  try {
    const parsed = JSON.parse(raw) as CardStoreV1
    if (parsed?.version !== 1 || !Array.isArray(parsed.cards)) throw new Error("bad store")
    return { version: 1, cards: parsed.cards.filter(isCard) }
  } catch {
    // if corrupted, reset to seed (could also implement a backup feature possibly)
    const fallback = seed as CardStoreV1
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fallback))
    return fallback
  }
}

export function saveStore(store: CardStoreV1) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

export function upsertCard(card: Card) {
  const store = loadStore()
  const idx = store.cards.findIndex(c => c.id === card.id)
  const updated: Card = { ...card, updatedAt: nowISO() }

  if (idx === -1) {
    store.cards.unshift({ ...updated, createdAt: updated.createdAt || nowISO() })
  } else {
    store.cards[idx] = updated
  }
  saveStore(store)
}

export function deleteCard(id: string) {
  const store = loadStore()
  saveStore({ version: 1, cards: store.cards.filter(c => c.id !== id) })
}

export function exportStore(): CardStoreV1 {
  return loadStore()
}