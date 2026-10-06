import { readJson, writeJson } from './storage'

type Listener = () => void

export interface PersistentStore<T> {
  get: () => T
  set: (next: T) => void
  subscribe: (listener: Listener) => () => void
}

/**
 * 持久化到 localStorage 的极简 store。
 * 配合 useSyncExternalStore 使用 —— get 返回稳定引用, 只有 set 时才换新对象。
 */
export function createPersistentStore<T>(key: string, initial: T): PersistentStore<T> {
  let value: T = readJson(key, initial)
  const listeners = new Set<Listener>()

  const notify = () => {
    for (const listener of listeners) listener()
  }

  // 家里常常手机看剧、平板开着历史页, 别的标签页改了同一份数据要跟着变
  // (storage 事件只在"其它"标签页触发, 本页自己的写入不会回流)
  window.addEventListener('storage', (event) => {
    if (event.key !== key) return
    value = readJson(key, initial)
    notify()
  })

  return {
    get: () => value,
    set: (next: T) => {
      value = next
      writeJson(key, next)
      notify()
    },
    subscribe: (listener: Listener) => {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
  }
}
