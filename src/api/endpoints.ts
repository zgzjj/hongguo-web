import { SLOW_TIMEOUT_MS, apiGet, apiUrl, publicUrl } from './client'
import type {
  BrowseParams,
  BrowseResponse,
  EpisodesResponse,
  FiltersResponse,
  Genre,
  LatestResponse,
  RankBoard,
  RankResponse,
  SearchResponse,
  Series,
  SeriesMeta,
} from './types'

export function getRank(
  board: RankBoard,
  limit = 30,
  signal?: AbortSignal,
): Promise<RankResponse> {
  return apiGet<RankResponse>('/rank', { params: { board, limit }, signal })
}

export function getLatest(
  genre: Genre,
  onlyToday = true,
  limit = 30,
  signal?: AbortSignal,
): Promise<LatestResponse> {
  return apiGet<LatestResponse>('/latest', {
    params: { genre, only_today: onlyToday, limit },
    signal,
  })
}

export function getFilters(genre: Genre, signal?: AbortSignal): Promise<FiltersResponse> {
  return apiGet<FiltersResponse>('/filters', { params: { genre }, signal })
}

export function getBrowse(params: BrowseParams, signal?: AbortSignal): Promise<BrowseResponse> {
  return apiGet<BrowseResponse>('/browse', {
    params: {
      genre: params.genre,
      theme: params.theme,
      setting: params.setting,
      background: params.background,
      sort: params.sort,
      gender: params.gender,
      days: params.days,
      status: params.status,
      limit: params.limit,
    },
    signal,
  })
}

export function getEpisodes(seriesId: string, signal?: AbortSignal): Promise<EpisodesResponse> {
  return apiGet<EpisodesResponse>('/episodes', {
    params: { series_id: seriesId },
    timeoutMs: SLOW_TIMEOUT_MS,
    signal,
  })
}

/** 搜索当前不可用(红果网关要求已注册设备身份), 调用方需做降级处理 */
export function getSearch(query: string, signal?: AbortSignal): Promise<SearchResponse> {
  return apiGet<SearchResponse>('/search', { params: { q: query }, signal })
}

/** 封面是 HEIC, 必须走后端 /img 代理转 JPEG */
export function coverUrl(cover: string | undefined): string {
  return cover ? publicUrl('/img', { url: cover }) : ''
}

/**
 * 可播放地址。服务端已做离线解密, 返回可直接喂给 <video> 的 mp4。
 * <video> 无法带请求头, 所以密钥必须走查询参数。
 */
export function streamUrl(seriesId: string, ep: number): string {
  return apiUrl('/stream', { series_id: seriesId, ep })
}

export type { Series, SeriesMeta }
