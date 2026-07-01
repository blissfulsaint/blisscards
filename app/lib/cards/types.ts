export type Card = {
  id: string
  front: string
  back: string
  path: string[] // ["Japanese", "Unit 1", "Lesson 3"]
  tags: string[]
  notes?: string
  createdAt: string
  updatedAt: string
  source?: "seed" | "user"
}

export type CardStoreV1 = {
  version: 1
  cards: Card[]
}