/** 接口调用底座: 基地址、密钥、错误、URL 拼装。 */

/** 开发时是 /hgapi(Vite 代理), 生产时为空串(同源根路径) */
export const API_BASE: string = import.meta.env.VITE_API_BASE ?? ''

const KEY_STORAGE = 'hg.apiKey'

let cachedKey: string | null = null

/** 支持 ?api_key= 直接带上密钥, 便于分享可用的链接 */
function readKeyFromUrl(): string | null {
  return new URLSearchParams(window.location.search).get('api_key')
}

/** 密钥存下来之后就从地址栏抹掉, 免得留在历史记录里 */
function stripKeyFromUrl(): void {
  const url = new URL(window.location.href)
  if (!url.searchParams.has('api_key')) return
  url.searchParams.delete('api_key')
  window.history.replaceState(null, '', url)
}

/**
 * 本地生成一把随机密钥。后端(启动器)会把不认识的密钥自动登记,
 * 所以首次访问不用手工配置 —— 生成、存下来、直接用。
 */
function createKey(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
  return `hg_${hex}`
}

export function getApiKey(): string {
  if (cachedKey !== null) return cachedKey

  const fromUrl = readKeyFromUrl()
  if (fromUrl) {
    cachedKey = fromUrl
    try {
      localStorage.setItem(KEY_STORAGE, fromUrl)
    } catch {
      /* 隐私模式下不可写, 忽略 */
    }
    stripKeyFromUrl()
    return fromUrl
  }

  try {
    const stored = localStorage.getItem(KEY_STORAGE)
    if (stored) {
      cachedKey = stored
      return stored
    }
  } catch {
    /* 隐私模式下不可读, 落到下面新生成一把 */
  }

  // 首次访问: 生成一把存下来, 后端会自动登记它。
  // getRandomValues 不需要安全上下文, 局域网 HTTP 下也能用。
  const fresh = createKey()
  cachedKey = fresh
  try {
    localStorage.setItem(KEY_STORAGE, fresh)
  } catch {
    /* 存不下也能用: cachedKey 在本页生命周期内有效 */
  }
  return fresh
}

export function setApiKey(key: string): void {
  cachedKey = key
  try {
    if (key) localStorage.setItem(KEY_STORAGE, key)
    else localStorage.removeItem(KEY_STORAGE)
  } catch {
    /* 隐私模式下不可写, 忽略 */
  }
}

export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export type QueryParams = Record<string, string | number | boolean | undefined>

function toSearch(params: QueryParams | undefined, withKey: boolean): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined) search.set(key, String(value))
  }
  if (withKey) {
    const key = getApiKey()
    if (key) search.set('api_key', key)
  }
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

/** 带密钥的地址 —— 接口调用用 */
export function apiUrl(path: string, params?: QueryParams): string {
  return `${API_BASE}${path}${toSearch(params, true)}`
}

/** 不带密钥的地址 —— <img> / <video> 这类不需要鉴权的资源用(但 video 需要, 见 streamUrl) */
export function publicUrl(path: string, params?: QueryParams): string {
  return `${API_BASE}${path}${toSearch(params, false)}`
}

/** 服务端卡住(接了连接不回包)时 fetch 会一直挂着, 不设超时页面就永远停在骨架屏 */
export const DEFAULT_TIMEOUT_MS = 30_000
/** 列表类接口都很快, 但 /episodes 偶尔要等后端现算, 给宽一点 */
export const SLOW_TIMEOUT_MS = 90_000

export interface ApiGetOptions {
  params?: QueryParams
  timeoutMs?: number
  /** React Query 传进来的取消信号 */
  signal?: AbortSignal
}

export async function apiGet<T>(path: string, options: ApiGetOptions = {}): Promise<T> {
  const { params, timeoutMs = DEFAULT_TIMEOUT_MS, signal } = options
  const timeout = AbortSignal.timeout(timeoutMs)
  const res = await fetch(apiUrl(path, params), {
    signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
  })
  if (!res.ok) {
    let message = `HTTP ${res.status}`
    try {
      const body: unknown = await res.json()
      if (body && typeof body === 'object' && 'detail' in body) {
        const detail = (body as { detail: unknown }).detail
        if (typeof detail === 'string') message = detail
      }
    } catch {
      /* 响应不是 JSON, 保留状态码文案 */
    }
    throw new ApiError(message, res.status)
  }
  return (await res.json()) as T
}
