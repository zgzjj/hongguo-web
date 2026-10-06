import type { Episode } from '@/api/types'

export interface EpisodeSegment {
  /** 段内第一集的集号 */
  from: number
  /** 段内最后一集的集号 */
  to: number
  episodes: Episode[]
}

/** 每段多少集。国内平台普遍 30/50, 30 在 300px 的侧栏里也不会太长。 */
export const SEGMENT_SIZE = 30

/**
 * 把剧集按顺序切成若干段。
 * 标签用真实集号而不是数组下标 —— 集号不保证从 1 开始或连续, 拿下标当标签会撒谎。
 */
export function buildSegments(episodes: Episode[], size = SEGMENT_SIZE): EpisodeSegment[] {
  const out: EpisodeSegment[] = []
  for (let i = 0; i < episodes.length; i += size) {
    const chunk = episodes.slice(i, i + size)
    if (chunk.length === 0) continue
    out.push({ from: chunk[0].index, to: chunk[chunk.length - 1].index, episodes: chunk })
  }
  return out
}
