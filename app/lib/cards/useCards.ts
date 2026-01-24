"use client"

import { useEffect, useMemo, useState } from "react"
import type { Card } from "./types"
import { deleteCard, loadStore, saveStore, upsertCard } from "./storage"

export function useCards() {
  const [cards, setCards] = useState<Card[]>([])

  useEffect(() => {
    const store = loadStore()
    setCards(store.cards)
  }, [])

  function refresh() {
    setCards(loadStore().cards)
  }

  function addCard(card: Card) {
    upsertCard(card)
    refresh()
  }

  function updateCard(card: Card) {
    upsertCard(card)
    refresh()
  }

  function removeCard(id: string) {
    deleteCard(id)
    refresh()
  }

  function replaceAll(next: Card[]) {
    saveStore({ version: 1, cards: next })
    setCards(next)
  }

  const meta = useMemo(() => {
    const courses = Array.from(new Set(cards.map(c => c.path?.[0]).filter(Boolean)))
    return { courses }
  }, [cards])

  return { cards, meta, addCard, updateCard, removeCard, replaceAll }
}