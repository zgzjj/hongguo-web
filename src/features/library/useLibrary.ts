import { useCallback, useSyncExternalStore } from 'react'
import type { Series } from '@/api/types'
import {
  clearLibrary,
  favoritesStore,
  getProgress,
  historyStore,
  isFavorite,
  progressStore,
  recordWatch,
  setProgress,
  toggleFavorite,
} from './library'

export function useFavorites() {
  const items = useSyncExternalStore(favoritesStore.subscribe, favoritesStore.get)
  return { items }
}

export function useFavoriteState(seriesId: string) {
  const items = useSyncExternalStore(favoritesStore.subscribe, favoritesStore.get)
  const favorited = items.some((item) => item.series_id === seriesId)

  const toggle = useCallback((series: Series) => toggleFavorite(series), [])

  return { favorited, toggle }
}

export function useHistory() {
  const items = useSyncExternalStore(historyStore.subscribe, historyStore.get)
  return { items }
}

export function useProgress(seriesId: string) {
  const map = useSyncExternalStore(progressStore.subscribe, progressStore.get)
  return map[seriesId] ?? 0
}

export function useLibraryActions() {
  return {
    toggleFavorite: useCallback((series: Series) => toggleFavorite(series), []),
    isFavorite: useCallback((seriesId: string) => isFavorite(seriesId), []),
    recordWatch: useCallback((series: Series, ep: number) => recordWatch(series, ep), []),
    setProgress: useCallback((seriesId: string, ep: number) => setProgress(seriesId, ep), []),
    getProgress: useCallback((seriesId: string) => getProgress(seriesId), []),
    clearAll: useCallback(() => clearLibrary(), []),
  }
}
