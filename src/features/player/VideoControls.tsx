import { useEffect, useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import { BRIGHTNESS_MAX, BRIGHTNESS_MIN, PLAYBACK_RATES } from '@/lib/playerPrefs'
import type { PlayerPrefs } from '@/lib/playerPrefs'
import { SeekBar } from './SeekBar'
import type { VideoPlayback } from './useVideoPlayback'

/** 全屏 / 画中画这类"浏览器能力相关"的动作, 由持有 <video> 的一侧提供 */
export interface VideoChrome {
  isFullscreen: boolean
  canFullscreen: boolean
  canPip: boolean
  onToggleFullscreen: () => void
  onTogglePip: () => void
}

export interface VideoControlsProps {
  playback: VideoPlayback
  prefs: PlayerPrefs
  onUpdatePrefs: (patch: Partial<PlayerPrefs>) => void
  onToggle: () => void
  /** 播放中自动隐藏时传 false */
  visible: boolean
  /** 手机端: 音量/亮度/倍速收进弹出面板, 控制条只留 播放/进度/设置/全屏 */
  compact: boolean
  chrome: VideoChrome
  /** 手机端"选集"入口。放进控制条而不是单独占一行, 免得和弹出的设置面板抢同一块地方 */
  onOpenSheet?: () => void
}

type Panel = 'rate' | 'setup' | null

export function VideoControls({
  playback,
  prefs,
  onUpdatePrefs,
  onToggle,
  visible,
  compact,
  chrome,
  onOpenSheet,
}: VideoControlsProps) {
  const [panel, setPanel] = useState<Panel>(null)

  // 点面板外面就收起来
  useEffect(() => {
    if (!panel) return
    const close = () => setPanel(null)
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [panel])

  const silent = prefs.muted || prefs.volume === 0

  function changeVolume(next: number) {
    onUpdatePrefs({ volume: next, muted: next === 0 })
  }

  function toggleMute() {
    if (!prefs.muted) {
      onUpdatePrefs({ muted: true })
      return
    }
    // 音量被拉到 0 之后再点喇叭, 得给个能听见的值, 否则"取消静音"毫无反应
    onUpdatePrefs({ muted: false, volume: prefs.volume > 0 ? prefs.volume : 1 })
  }

  const rateButton = (
    <button
      type="button"
      className="vc__btn vc__btn--text"
      aria-label="播放倍速"
      aria-expanded={panel === 'rate'}
      onClick={(event) => {
        event.stopPropagation()
        setPanel(panel === 'rate' ? null : 'rate')
      }}
    >
      {prefs.rate}x
    </button>
  )

  const rateChips = (
    <>
      {PLAYBACK_RATES.map((rate) => (
        <button
          key={rate}
          type="button"
          className={rate === prefs.rate ? 'vc__rate is-on' : 'vc__rate'}
          onClick={() => {
            onUpdatePrefs({ rate })
            setPanel(null)
          }}
        >
          {rate}x
          {rate === prefs.rate ? <Icon name="check" size={14} /> : null}
        </button>
      ))}
    </>
  )

  const volumeSlider = (
    <input
      type="range"
      className="vc__slider"
      min={0}
      max={1}
      step={0.01}
      value={silent ? 0 : prefs.volume}
      aria-label="音量"
      onChange={(event) => changeVolume(Number(event.target.value))}
    />
  )

  const brightnessSlider = (
    <input
      type="range"
      className="vc__slider"
      min={BRIGHTNESS_MIN}
      max={BRIGHTNESS_MAX}
      step={0.05}
      value={prefs.brightness}
      aria-label="亮度"
      onChange={(event) => onUpdatePrefs({ brightness: Number(event.target.value) })}
    />
  )

  return (
    <div className={visible ? 'vc' : 'vc is-hidden'} data-testid="video-controls">
      <div className="vc__row">
        <button
          type="button"
          className="vc__btn vc__btn--play"
          aria-label={playback.playing ? '暂停' : '播放'}
          onClick={onToggle}
        >
          <Icon name={playback.playing ? 'pause' : 'play'} size={22} />
        </button>

        <SeekBar
          currentTime={playback.currentTime}
          buffered={playback.buffered}
          duration={playback.duration}
          onSeek={playback.seek}
        />

        <div className="vc__actions">
          {compact ? null : rateButton}

          {compact ? null : (
            <span className="vc__group">
              <button type="button" className="vc__btn" aria-label={silent ? '取消静音' : '静音'} onClick={toggleMute}>
                <Icon name={silent ? 'volumeMute' : 'volume'} size={20} />
              </button>
              {volumeSlider}
            </span>
          )}

          {compact ? null : (
            <span className="vc__group">
              <span className="vc__btn vc__btn--static" aria-hidden="true">
                <Icon name="brightness" size={20} />
              </span>
              {brightnessSlider}
            </span>
          )}

          {compact ? (
            <button
              type="button"
              className="vc__btn"
              aria-label="播放设置"
              aria-expanded={panel === 'setup'}
              onClick={(event) => {
                event.stopPropagation()
                setPanel(panel === 'setup' ? null : 'setup')
              }}
            >
              <Icon name="settings" size={20} />
            </button>
          ) : null}

          {compact && onOpenSheet ? (
            <button type="button" className="vc__btn vc__btn--sheet" onClick={onOpenSheet}>
              <Icon name="rank" size={16} />
              选集
            </button>
          ) : null}

          {chrome.canPip && !compact ? (
            <button type="button" className="vc__btn" aria-label="画中画" onClick={chrome.onTogglePip}>
              <Icon name="pip" size={20} />
            </button>
          ) : null}

          {chrome.canFullscreen ? (
            <button
              type="button"
              className="vc__btn"
              aria-label={chrome.isFullscreen ? '退出全屏' : '全屏'}
              onClick={chrome.onToggleFullscreen}
            >
              <Icon name={chrome.isFullscreen ? 'fullscreenExit' : 'fullscreen'} size={20} />
            </button>
          ) : null}
        </div>
      </div>

      {panel === 'rate' ? (
        <div className="vc__panel" onPointerDown={(event) => event.stopPropagation()}>
          {rateChips}
        </div>
      ) : null}

      {panel === 'setup' ? (
        <div className="vc__panel vc__panel--setup" onPointerDown={(event) => event.stopPropagation()}>
          <div className="vc__field">
            <span className="vc__label">倍速</span>
            <div className="vc__rates">{rateChips}</div>
          </div>
          <div className="vc__field">
            <span className="vc__label">
              <Icon name={silent ? 'volumeMute' : 'volume'} size={16} />
              音量
            </span>
            <span className="vc__field-row">
              {volumeSlider}
              <button type="button" className="vc__btn vc__btn--sm" onClick={toggleMute}>
                {silent ? '取消静音' : '静音'}
              </button>
            </span>
          </div>
          <div className="vc__field">
            <span className="vc__label">
              <Icon name="brightness" size={16} />
              亮度
            </span>
            {brightnessSlider}
          </div>
        </div>
      ) : null}
    </div>
  )
}
