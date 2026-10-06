import { useCallback, useEffect, useState } from 'react'
import type { RefObject } from 'react'

export interface VideoPlayback {
  playing: boolean
  currentTime: number
  /** 已缓冲到的秒数, 进度条用它画第二层 */
  buffered: number
  /** 拿不到元数据时是 0, 调用方要按 0 处理 */
  duration: number
  seek: (seconds: number) => void
}

/** 进度条补帧频率。timeupdate 只有 ~4Hz, 直接用它进度条会一格一格跳。 */
const TICK_MS = 100

/**
 * 观察 <video> 的播放位置 / 时长 / 缓冲区间。
 * 只管"读", 不碰播放控制 —— play() 失败要按取流失败处理, 那属于播放器的事。
 */
export function useVideoPlayback(videoRef: RefObject<HTMLVideoElement | null>): VideoPlayback {
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [buffered, setBuffered] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const syncTime = () => {
      setCurrentTime(video.currentTime)
      const ranges = video.buffered
      setBuffered(ranges.length > 0 ? ranges.end(ranges.length - 1) : 0)
    }
    const syncMeta = () => {
      setDuration(Number.isFinite(video.duration) ? video.duration : 0)
      syncTime()
    }
    const onPlay = () => setPlaying(true)
    const onStop = () => setPlaying(false)

    video.addEventListener('play', onPlay)
    video.addEventListener('pause', onStop)
    video.addEventListener('ended', onStop)
    video.addEventListener('timeupdate', syncTime)
    video.addEventListener('progress', syncTime)
    video.addEventListener('loadedmetadata', syncMeta)
    video.addEventListener('durationchange', syncMeta)
    video.addEventListener('seeked', syncTime)
    syncMeta()

    return () => {
      video.removeEventListener('play', onPlay)
      video.removeEventListener('pause', onStop)
      video.removeEventListener('ended', onStop)
      video.removeEventListener('timeupdate', syncTime)
      video.removeEventListener('progress', syncTime)
      video.removeEventListener('loadedmetadata', syncMeta)
      video.removeEventListener('durationchange', syncMeta)
      video.removeEventListener('seeked', syncTime)
    }
  }, [videoRef])

  useEffect(() => {
    if (!playing) return
    let raf = 0
    let last = 0
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      if (now - last < TICK_MS) return
      last = now
      const video = videoRef.current
      if (video) setCurrentTime(video.currentTime)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [playing, videoRef])

  const seek = useCallback(
    (seconds: number) => {
      const video = videoRef.current
      if (!video) return
      const end = Number.isFinite(video.duration) ? video.duration : seconds
      video.currentTime = Math.min(Math.max(0, seconds), end)
      setCurrentTime(video.currentTime)
    },
    [videoRef],
  )

  return { playing, currentTime, buffered, duration, seek }
}
