import { useCallback, useEffect, useRef, useState } from 'react'

/** 播放中控件自动淡出的等待时间 */
const HIDE_DELAY_MS = 3500

/**
 * 播放中让控件淡出, 暂停时一直显示 —— 暂停说明用户正在做决定, 这时候藏控件最讨厌。
 * poke 要挂在播放器区域的 pointer 事件上, 任何操作都把倒计时推后。
 */
export function useControlsVisibility(playing: boolean): [boolean, () => void] {
  const [visible, setVisible] = useState(true)
  const timer = useRef(0)

  const poke = useCallback(() => {
    window.clearTimeout(timer.current)
    setVisible(true)
    if (!playing) return
    timer.current = window.setTimeout(() => setVisible(false), HIDE_DELAY_MS)
  }, [playing])

  useEffect(() => {
    poke()
    return () => window.clearTimeout(timer.current)
  }, [poke])

  return [visible, poke]
}
