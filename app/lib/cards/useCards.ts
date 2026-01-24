"use client"

import { useCallback, useState } from "react"
import type { Card } from "./types"
import { deleteCard, loadStore, saveStore, upsertCard } from "./storage"

export function useCards() {
  const [cards, setCards] = useState<Card[]>(() => {
    if (typeof window === "undefined") return []
    // loadStore() already seeds on first run if empty
    return loadStore().cards
  })

  const refresh = useCallback(() => {
    setCards(loadStore().cards)
  }, [])

  const addCard = useCallback(
    (card: Card) => {
      upsertCard(card)
      refresh()
    },
    [refresh]
  )

  const updateCard = useCallback(
    (card: Card) => {
      upsertCard(card)
      refresh()
    },
    [refresh]
  )

  const removeCard = useCallback(
    (id: string) => {
      deleteCard(id)
      refresh()
    },
    [refresh]
  )

  const replaceAll = useCallback((next: Card[]) => {
    saveStore({ version: 1, cards: next })
    setCards(next)
  }, [])

  return { cards, addCard, updateCard, removeCard, replaceAll }
}