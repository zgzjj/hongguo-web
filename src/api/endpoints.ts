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
  SearchGenre,
  SearchResponse,
  SeasonsResponse,
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
      offset: params.offset,
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

/**
 * 搜索。走 novelfm 公开接口(官方桌面版同源), 不需要签名/设备身份。
 * genre 必传: 同名剧在真人/动漫两个 tab 里是两部不同的剧, 不指定会串。
 */
export function getSearch(
  query: string,
  genre: SearchGenre,
  signal?: AbortSignal,
): Promise<SearchResponse> {
  return apiGet<SearchResponse>('/search', { params: { q: query, genre }, signal })
}

/**
 * 同一部剧的其他季。上游没有这个接口 —— 后端拿剧名去搜索再按基础名匹配,
 * 所以 title 必须一起传(带不带季号都行)。series_id 也必传: 后端靠它认准
 * 这部剧属于哪个 tab, 否则同名剧会串季。
 */
export function getSeasons(
  seriesId: string,
  title: string,
  signal?: AbortSignal,
): Promise<SeasonsResponse> {
  return apiGet<SeasonsResponse>('/seasons', {
    params: { series_id: seriesId, title },
    signal,
  })
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
