/** localStorage 读写。全部包在 try 里 —— 隐私模式 / 存储禁用时不能让页面崩。 */

export function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* 隐私模式或配额超限, 忽略 */
  }
}

export function removeKey(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    /* 忽略 */
  }
}

export const STORAGE_KEYS = {
  favorites: 'hg.favorites',
  history: 'hg.history',
  progress: 'hg.progress',
  theme: 'hg.theme',
  player: 'hg.player',
} as const
