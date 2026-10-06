import { useSyncExternalStore } from 'react'
import { STORAGE_KEYS } from './storage'
import { createPersistentStore } from './store'

/** 播放偏好。用户调过一次就记住 —— 换集、换剧、下次打开都沿用同一套。 */
export interface PlayerPrefs {
  volume: number
  muted: boolean
  rate: number
  /** 亮度走 CSS filter, 浏览器控制不了屏幕背光 */
  brightness: number
}

export const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2] as const

export const BRIGHTNESS_MIN = 0.4
export const BRIGHTNESS_MAX = 1.8

/**
 * 默认带声音。浏览器只放行"用户已经跟页面交互过"的带声音自动播放,
 * 放行不了时由播放器临时静音兜底(画面先动起来, 点一下补上声音) —— 不在这里预先静音。
 */
const DEFAULTS: PlayerPrefs = { volume: 1, muted: false, rate: 1, brightness: 1 }

const store = createPersistentStore<PlayerPrefs>(STORAGE_KEYS.player, DEFAULTS)

export function clampBrightness(value: number): number {
  if (!Number.isFinite(value)) return DEFAULTS.brightness
  return Math.min(BRIGHTNESS_MAX, Math.max(BRIGHTNESS_MIN, value))
}

export function updatePlayerPrefs(patch: Partial<PlayerPrefs>): void {
  store.set({ ...store.get(), ...patch })
}

export function usePlayerPrefs() {
  const prefs = useSyncExternalStore(store.subscribe, store.get)
  return { prefs, update: updatePlayerPrefs }
}
