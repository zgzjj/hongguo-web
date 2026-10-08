import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import {
  getBrowse,
  getEpisodes,
  getFilters,
  getLatest,
  getRank,
  getSearch,
  getSeasons,
} from './endpoints'
import type { BrowseParams, BrowseResponse, Genre, RankBoard, SearchGenre } from './types'

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
  search: (query: string, genre: SearchGenre) => ['search', query, genre] as const,
  seasons: (seriesId: string) => ['seasons', seriesId] as const,
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

/** 只取一页 —— 发现页/排行榜用它当兜底数据源, 不需要往下翻 */
export function useBrowse(params: BrowseParams, enabled = true) {
  return useQuery({
    queryKey: queryKeys.browse(params),
    queryFn: ({ signal }) => getBrowse(params, signal),
    enabled,
    staleTime: STALE_MS,
  })
}

/**
 * /browse 的翻页版: 首屏 BROWSE_LIMIT 条, 之后按服务端给的 next_offset 往后取。
 * 老版自研后端不带 next_offset/has_more, 那儿的 has_more 是 undefined, 会自然退化成"只有一页"。
 */
export function useBrowseInfinite(params: BrowseParams, enabled = true) {
  // offset 交给 pageParam, queryKey 里必须抹平 —— 否则每翻一页都会多出一个独立缓存条目
  const filters = { ...params, offset: undefined }
  return useInfiniteQuery<BrowseResponse, Error, { pages: BrowseResponse[] }, readonly unknown[], number>({
    queryKey: queryKeys.browse(filters),
    queryFn: ({ signal, pageParam }) => getBrowse({ ...filters, offset: pageParam }, signal),
    initialPageParam: 0,
    getNextPageParam: (last) => (last.has_more ? last.next_offset : undefined),
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

export function useSearch(query: string, genre: SearchGenre) {
  return useQuery({
    queryKey: queryKeys.search(query, genre),
    queryFn: ({ signal }) => getSearch(query, genre, signal),
    enabled: query.length > 0,
    retry: false,
  })
}

/**
 * 其他季。只有详情页用。
 * 不分季的剧会返回空数组 —— 调用方据此整段不渲染, 而不是显示一个空标题。
 */
export function useSeasons(seriesId: string, title: string) {
  return useQuery({
    queryKey: queryKeys.seasons(seriesId),
    queryFn: ({ signal }) => getSeasons(seriesId, title, signal),
    enabled: Boolean(seriesId && title),
    staleTime: STALE_MS,
  })
}
