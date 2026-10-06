import { useEffect } from 'react'
import { streamUrl } from '@/api/endpoints'

/** 只要 2 个字节: 目的是让服务端把这一集解密并落缓存, 不是真要把片子拉下来 */
const PROBE_RANGE = 'bytes=0-1'

/**
 * 预热某一集。
 *
 * /stream 冷启动要 10~60 秒 —— 服务端得先把密文下载完、离线解密, 才吐第一个字节。
 * 而 _ensure_decrypted() 在 FileResponse 之前是无条件执行的, 所以哪怕只要 2 个字节,
 * 也会把整集解密好落进缓存; 等真播到那一集就是命中缓存, 秒开。
 *
 * 传 null 表示不预热(没有下一集, 或者当前集还没出画面)。
 */
export function usePrefetchEpisode(seriesId: string, index: number | null): void {
  useEffect(() => {
    if (index === null) return
    const controller = new AbortController()
    void fetch(streamUrl(seriesId, index), {
      headers: { Range: PROBE_RANGE },
      signal: controller.signal,
    }).catch(() => {
      /* 预热失败不影响正常播放: 真播到那一集时再走一次冷启动就是了 */
    })
    return () => controller.abort()
  }, [seriesId, index])
}
