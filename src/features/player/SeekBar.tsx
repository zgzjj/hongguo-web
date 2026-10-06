import { useCallback, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent, KeyboardEvent as ReactKeyboardEvent } from 'react'
import { formatDuration } from '@/lib/format'

export interface SeekBarProps {
  currentTime: number
  buffered: number
  duration: number
  onSeek: (seconds: number) => void
  /** 拖动中外部要暂停"自动跟进度"之类的逻辑, 用它 */
  onScrubbingChange?: (scrubbing: boolean) => void
}

/** 方向键一次挪多少秒 */
const KEY_STEP = 5

/**
 * 进度条。拖动期间只更新本地 scrub 值, 松手才真正 seek ——
 * 每移动一像素就 seek 会让还没下完的流反复发 Range 请求。
 * 触摸必须 touch-action: none, 否则竖着拖会变成翻到下一集。
 */
export function SeekBar({ currentTime, buffered, duration, onSeek, onScrubbingChange }: SeekBarProps) {
  const railRef = useRef<HTMLDivElement>(null)
  const [scrub, setScrub] = useState<number | null>(null)

  const timeAt = useCallback(
    (clientX: number): number => {
      const rail = railRef.current
      if (!rail || duration <= 0) return 0
      const rect = rail.getBoundingClientRect()
      if (rect.width <= 0) return 0
      const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
      return ratio * duration
    },
    [duration],
  )

  function begin(event: ReactPointerEvent<HTMLDivElement>) {
    if (duration <= 0) return
    event.currentTarget.setPointerCapture(event.pointerId)
    setScrub(timeAt(event.clientX))
    onScrubbingChange?.(true)
  }

  function move(event: ReactPointerEvent<HTMLDivElement>) {
    if (scrub === null) return
    setScrub(timeAt(event.clientX))
  }

  function finish(event: ReactPointerEvent<HTMLDivElement>) {
    if (scrub === null) return
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    onSeek(scrub)
    setScrub(null)
    onScrubbingChange?.(false)
  }

  function onKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (duration <= 0) return
    let next: number | null = null
    if (event.key === 'ArrowRight') next = currentTime + KEY_STEP
    else if (event.key === 'ArrowLeft') next = currentTime - KEY_STEP
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = duration
    if (next === null) return
    // 左右键在这里被进度条吃掉, 别再冒泡成页面滚动
    event.preventDefault()
    event.stopPropagation()
    onSeek(next)
  }

  const shown = scrub ?? currentTime
  const percent = duration > 0 ? Math.min(100, Math.max(0, (shown / duration) * 100)) : 0
  const bufferPercent = duration > 0 ? Math.min(100, Math.max(0, (buffered / duration) * 100)) : 0

  return (
    <div className="seek">
      <span className="seek__time">
        {formatDuration(shown)}
        <span className="seek__sep">/</span>
        {formatDuration(duration)}
      </span>
      <div
        ref={railRef}
        className={scrub === null ? 'seek__rail' : 'seek__rail is-scrubbing'}
        role="slider"
        tabIndex={0}
        aria-label="播放进度"
        aria-valuemin={0}
        aria-valuemax={Math.round(duration)}
        aria-valuenow={Math.round(shown)}
        aria-valuetext={`${formatDuration(shown)} / ${formatDuration(duration)}`}
        onPointerDown={begin}
        onPointerMove={move}
        onPointerUp={finish}
        onPointerCancel={finish}
        onKeyDown={onKeyDown}
      >
        <span className="seek__buffer" style={{ width: `${bufferPercent}%` }} />
        <span className="seek__fill" style={{ width: `${percent}%` }} />
        <span className="seek__knob" style={{ left: `${percent}%` }} />
      </div>
    </div>
  )
}
