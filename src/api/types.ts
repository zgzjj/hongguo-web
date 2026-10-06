/**
 * 后端接口的返回类型。
 * 字段名与类型均来自 _run/api_surface.py 的实测输出, 不是猜的。
 */

export type Genre = 'short_play' | 'comic_series' | 'ai_series'
export type RankBoard = 'recommend' | 'hot' | 'new'
/** /browse 的 sort 实测可接受四个值, 但 /filters 只暴露前三个 */
export type BrowseSort = 'online_time' | 'hot_score' | 'hot_collect' | 'score'

export const GENRES: readonly { id: Genre; name: string }[] = [
  { id: 'short_play', name: '真人剧' },
  { id: 'comic_series', name: '漫剧' },
  { id: 'ai_series', name: 'AI剧' },
] as const

/**
 * 注意: 三个榜单在后端全部映射到漫剧(comic_series_*)。
 * 真人剧没有官方榜, 只能用 /browse?genre=short_play&sort=hot_score 顶替。
 */
export const RANK_BOARDS: readonly { id: RankBoard; name: string }[] = [
  { id: 'recommend', name: '推荐榜' },
  { id: 'hot', name: '热播榜' },
  { id: 'new', name: '新剧榜' },
] as const

/** 与 /filters 里「全部推荐」那一行保持一致 */
export const BROWSE_SORTS: readonly { id: BrowseSort; name: string }[] = [
  { id: 'hot_score', name: '最高热度' },
  { id: 'online_time', name: '最新上架' },
  { id: 'hot_collect', name: '最高收藏' },
] as const

/** 服务端没有 offset/page 参数, 只能靠 limit 一次多取 */
export const BROWSE_LIMIT = 60

/** 剧(列表项)。/rank、/latest、/browse 共用这套字段, 各自多几个专有字段。 */
export interface Series {
  series_id: string
  title: string
  cover: string
  episode_cnt: number
  /** 评分是**字符串**, 如 "8.6" —— 参与计算前必须 Number() */
  score: string
  play_cnt: number
  /** **斜杠分隔的字符串**, 不是数组, 如 "爱情 / 都市爱情 / 先婚后爱" */
  category?: string
  intro?: string
  copyright?: string
  /** 仅 /latest: 是否今日上新 */
  today?: boolean
  /** 仅 /latest: 如 "新剧" */
  premiere?: string
  /** 仅 /rank: 名次 */
  rank?: number
  hot?: string
  /** 仅 /browse: 首集视频 ID, 可直接 /stream?vid= 播第 1 集 */
  vid?: string
  duration?: number
  comment_count?: number
  horiz_cover?: string
  cover_tags?: string[]
  /** 仅 /browse: 后端拼好的播放/取集地址 */
  stream_url?: string
  episodes_url?: string
}

export interface Episode {
  index: number
  vid: string
  title: string
  duration: number
  cover: string
  comment_count: number
  digged_count: number
}

/**
 * 演员表的**原始**形状 —— 字段名是中文, 直接来自接口, 不要改动。
 * 实测只有真人剧(short_play)有数据(17~20 条), 漫剧/AI剧一律是空数组。
 */
export interface CelebrityRaw {
  演员: string
  角色: string
  头像: string
  简介: string
}

/** 归一化后的演员。中文键名只留在 CelebrityRaw 里, 其余代码一律用这套。 */
export interface Celebrity {
  name: string
  role: string
  avatar: string
  bio: string
}

export interface SeriesMeta {
  series_id: string
  title: string
  intro: string
  episode_cnt: number
  /** "完结" | "连载中" */
  status: string
  play_cnt: number
  followed_cnt: number
  /** Unix 秒 */
  create_time: number
  cover: string
  /** 这里才是数组(列表项的 category 是字符串) */
  category: string[]
  /** 演员表原始数据, 用 parseCelebrities() 转成 Celebrity[] */
  celebrities: CelebrityRaw[]
}

export interface FilterItem {
  id: string
  name: string
}

/** 一行筛选条件。`type` 就是 /browse 的参数名。 */
export interface FilterRow {
  type: string
  row_name: string
  selection_type: number
  items: FilterItem[]
}

export interface RankResponse {
  board: string
  name: string
  items: Series[]
}

export interface LatestResponse {
  genre: Genre
  name: string
  /** 后端如实标注的粒度: "今日上新" | "7天内上新·最新上架" —— UI 直接显示它 */
  mode: string
  only_today: boolean
  count: number
  items: Series[]
}

export interface FiltersResponse {
  genre: Genre
  name: string
  rows: FilterRow[]
}

export interface BrowseResponse {
  genre: Genre
  name: string
  count: number
  note: string
  items: Series[]
}

export interface EpisodesResponse {
  meta: SeriesMeta
  episodes: Episode[]
}

export interface SearchResponse {
  query: string
  results: Series[]
}

export interface BrowseParams {
  genre: Genre
  /** 以下参数名 = /filters 返回的 row.type; 多选用逗号分隔 */
  theme?: string
  setting?: string
  background?: string
  sort?: BrowseSort
  gender?: string
  days?: string
  status?: string
  limit?: number
}
