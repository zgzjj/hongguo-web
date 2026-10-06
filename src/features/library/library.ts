import type { Series } from '@/api/types'
import { STORAGE_KEYS, removeKey } from '@/lib/storage'
import { createPersistentStore } from '@/lib/store'

export interface FavoriteItem {
  series_id: string
  title: string
  cover: string
  episode_cnt: number
  addedAt: number
}

export interface HistoryItem {
  series_id: string
  title: string
  cover: string
  episode_cnt: number
  ep: number
  watchedAt: number
}

/** series_id → 看到第几集 */
export type ProgressMap = Record<string, number>

export const favoritesStore = createPersistentStore<FavoriteItem[]>(STORAGE_KEYS.favorites, [])
export const historyStore = createPersistentStore<HistoryItem[]>(STORAGE_KEYS.history, [])
export const progressStore = createPersistentStore<ProgressMap>(STORAGE_KEYS.progress, {})

const HISTORY_LIMIT = 100

function pick(series: Series) {
  return {
    series_id: series.series_id,
    title: series.title,
    cover: series.cover,
    episode_cnt: series.episode_cnt,
  }
}

export function isFavorite(seriesId: string): boolean {
  return favoritesStore.get().some((item) => item.series_id === seriesId)
}

export function toggleFavorite(series: Series): boolean {
  const current = favoritesStore.get()
  const exists = current.some((item) => item.series_id === series.series_id)

  favoritesStore.set(
    exists
      ? current.filter((item) => item.series_id !== series.series_id)
      : [{ ...pick(series), addedAt: Date.now() }, ...current],
  )

  return !exists
}

/** 记录一次观看: 更新历史(去重上浮) + 记住进度 */
export function recordWatch(series: Series, ep: number): void {
  const entry: HistoryItem = { ...pick(series), ep, watchedAt: Date.now() }
  const rest = historyStore.get().filter((item) => item.series_id !== series.series_id)
  historyStore.set([entry, ...rest].slice(0, HISTORY_LIMIT))
  setProgress(series.series_id, ep)
}

export function getProgress(seriesId: string): number {
  return progressStore.get()[seriesId] ?? 0
}

export function setProgress(seriesId: string, ep: number): void {
  const current = progressStore.get()
  if (current[seriesId] === ep) return
  progressStore.set({ ...current, [seriesId]: ep })
}

export function clearLibrary(): void {
  favoritesStore.set([])
  historyStore.set([])
  progressStore.set({})
  removeKey(STORAGE_KEYS.favorites)
  removeKey(STORAGE_KEYS.history)
  removeKey(STORAGE_KEYS.progress)
}
