import { useQuery } from '@tanstack/react-query'
import {
  getBrowse,
  getEpisodes,
  getFilters,
  getLatest,
  getRank,
  getSearch,
} from './endpoints'
import type { BrowseParams, Genre, RankBoard } from './types'

/**
 * 服务端数据全是只读 GET, 且后端自己带缓存 ——
 * 前端这边只要去重 + 短期保鲜即可, 不需要复杂的失效策略。
 */
const STALE_MS = 5 * 60 * 1000

export const queryKeys = {
  rank: (board: RankBoard, limit: number) => ['rank', board, limit] as const,
  latest: (genre: Genre, onlyToday: boolean, limit: number) =>
    ['latest', genre, onlyToday, limit] as const,
  filters: (genre: Genre) => ['filters', genre] as const,
  browse: (params: BrowseParams) => ['browse', params] as const,
  episodes: (seriesId: string) => ['episodes', seriesId] as const,
  search: (query: string) => ['search', query] as const,
}

export function useRank(board: RankBoard, limit = 30, enabled = true) {
  return useQuery({
    queryKey: queryKeys.rank(board, limit),
    queryFn: ({ signal }) => getRank(board, limit, signal),
    enabled,
    staleTime: STALE_MS,
  })
}

export function useLatest(genre: Genre, onlyToday = true, limit = 30, enabled = true) {
  return useQuery({
    queryKey: queryKeys.latest(genre, onlyToday, limit),
    queryFn: ({ signal }) => getLatest(genre, onlyToday, limit, signal),
    enabled,
    staleTime: STALE_MS,
  })
}

export function useFilters(genre: Genre) {
  return useQuery({
    queryKey: queryKeys.filters(genre),
    queryFn: ({ signal }) => getFilters(genre, signal),
    staleTime: STALE_MS,
  })
}

export function useBrowse(params: BrowseParams, enabled = true) {
  return useQuery({
    queryKey: queryKeys.browse(params),
    queryFn: ({ signal }) => getBrowse(params, signal),
    enabled,
    staleTime: STALE_MS,
  })
}

export function useEpisodes(seriesId: string) {
  return useQuery({
    queryKey: queryKeys.episodes(seriesId),
    queryFn: ({ signal }) => getEpisodes(seriesId, signal),
    enabled: Boolean(seriesId),
    staleTime: STALE_MS,
  })
}

/** 搜索当前不可用(红果网关要求已注册设备身份), 失败时调用方需降级 */
export function useSearch(query: string) {
  return useQuery({
    queryKey: queryKeys.search(query),
    queryFn: ({ signal }) => getSearch(query, signal),
    enabled: query.length > 0,
    retry: false,
  })
}
