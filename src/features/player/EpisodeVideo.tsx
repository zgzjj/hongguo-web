import { useCallback, useEffect, useRef, useState } from 'react'
import type { Episode } from '@/api/types'
import { coverUrl, streamUrl } from '@/api/endpoints'
import { Icon } from '@/components/ui/Icon'
import { clampBrightness, usePlayerPrefs } from '@/lib/playerPrefs'
import { VideoControls } from './VideoControls'
import type { VideoChrome } from './VideoControls'
import { useControlsVisibility } from './useControlsVisibility'
import { usePrefetchEpisode } from './usePrefetchEpisode'
import { useVideoPlayback } from './useVideoPlayback'

export interface EpisodeVideoProps {
  seriesId: string
  episode: Episode
  /** 当前这一屏是否正在看 */
  active: boolean
  /** 窄屏: 控制条收成精简版, 音量/亮度/倍速进弹出面板 */
  compact: boolean
  /** 下一集的集号, 没有下一集传 null */
  nextIndex: number | null
  onEnded: () => void
  /** 手机端把"选集"入口并进控制条, 由外层给开抽屉的动作 */
  onOpenSheet?: () => void
}

type VideoState = 'loading' | 'ready' | 'blocked' | 'error'

/** 冷启动超过这个时长就换文案 —— 服务端要下载密文再离线解密, 10~60 秒都可能 */
const SLOW_HINT_MS = 4000

/**
 * 取流失败和"浏览器不许自动播放"是两回事, 别把前者说成后者。
 * 换源/重试会打断上一次还没落定的 play(), 浏览器拿 AbortError 报这个 —— 那不是失败,
 * 返回 null 让调用方别动状态(冷启动期间这个窗口能有几秒, 误报会一直挂在界面上)。
 */
function describePlayFailure(error: unknown): VideoState | null {
  if (!(error instanceof DOMException)) return 'error'
  if (error.name === 'AbortError') return null
  return error.name === 'NotAllowedError' ? 'blocked' : 'error'
}

/** iOS Safari 没有元素级全屏, 只有 <video> 自己的 webkitEnterFullscreen */
function supportsFullscreen(video: HTMLVideoElement | null): boolean {
  if (document.fullscreenEnabled) return true
  return Boolean(video && 'webkitEnterFullscreen' in video)
}

/**
 * 单集播放器。
 * 画面按原始宽高比自适应, 剩下的空白用本集封面的模糊层填上 ——
 * 竖屏剧在横屏舞台上是窄窄一条, 纯黑边看着像没加载出来。
 */
export function EpisodeVideo({
  seriesId,
  episode,
  active,
  compact,
  nextIndex,
  onEnded,
  onOpenSheet,
}: EpisodeVideoProps) {
  const shellRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [state, setState] = useState<VideoState>('loading')
  const [slow, setSlow] = useState(false)
  const [started, setStarted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [canFullscreen, setCanFullscreen] = useState(false)
  const { prefs, update } = usePlayerPrefs()
  const playback = useVideoPlayback(videoRef)
  const [controlsVisible, poke] = useControlsVisibility(active && playback.playing)

  const brightness = clampBrightness(prefs.brightness)
  /** 本屏的流地址。换集或换剧都会变, 是"换源"的唯一判据(换剧时集号可能还是 1) */
  const src = streamUrl(seriesId, episode.index)

  // 这一集真出画面之后才去预热下一集: 那时当前集的解密已经落盘, 不抢 IO。
  // 用 started 而不是 state === 'ready' —— 中途缓冲会来回切 ready/loading, 会重复预热。
  usePrefetchEpisode(seriesId, active && started ? nextIndex : null)

  useEffect(() => {
    setCanFullscreen(supportsFullscreen(videoRef.current))
  }, [])

  useEffect(() => {
    const onChange = () => setIsFullscreen(document.fullscreenElement === shellRef.current)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  // 音量/倍速记在偏好里, 换集换剧都要续上; defaultPlaybackRate 一起设, retry 走 load() 时才不会被重置回 1
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.volume = Math.min(1, Math.max(0, prefs.volume))
    video.muted = prefs.muted
    video.defaultPlaybackRate = prefs.rate
    video.playbackRate = prefs.rate
  }, [prefs.volume, prefs.muted, prefs.rate])

  useEffect(() => {
    if (!active || state !== 'loading') {
      setSlow(false)
      return
    }
    const timer = window.setTimeout(() => setSlow(true), SLOW_HINT_MS)
    return () => window.clearTimeout(timer)
    // 依赖里带 src: 上一集也在 loading 时换源, state 不变, 少了它计时器不会重新开始
  }, [active, state, src])

  /** play() 被拒时切到对应状态。换源打断的 AbortError 不算失败, 跳过 */
  const reportPlayFailure = useCallback((error: unknown) => {
    const next = describePlayFailure(error)
    if (next) setState(next)
  }, [])

  const play = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    // 不在这里置 loading: 从暂停恢复不该弹"正在准备视频", 真正的缓冲由 onWaiting 报
    void video.play().catch(reportPlayFailure)
  }, [reportPlayFailure])

  /** 重试得让浏览器重新走一遍资源选择 —— 光调 play() 不会重发那个失败的请求 */
  const retry = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    setState('loading')
    video.load()
    void video.play().catch(reportPlayFailure)
  }, [reportPlayFailure])

  // 换源(换集/换剧)时把这一屏的界面状态清干净。
  // 放在渲染期而不是 effect 里: effect 会晚一帧, 那一帧里上一集的 state 还挂在界面上。
  // (同样是为了跨集复用 <video> 才要手动清 —— 用 key 强制重挂的话画中画连播会断。)
  const [lastSrc, setLastSrc] = useState(src)
  if (src !== lastSrc) {
    setLastSrc(src)
    setState('loading')
    setStarted(false)
    // 慢提示一起清: 否则上一集那次计时的余量会算到新集头上
    setSlow(false)
  }

  // 起播 / 暂停。依赖里必须带 src —— 换源时 active 不变,
  // 少了它换了源就不会自动播(桌面端连播会停在这一步)。
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (active) play()
    else video.pause()
  }, [active, play, src])

  function toggle() {
    const video = videoRef.current
    if (!video || state === 'error' || state === 'blocked') return
    if (video.paused) play()
    else video.pause()
  }

  function toggleFullscreen() {
    const shell = shellRef.current
    const video = videoRef.current
    if (!shell || !video) return
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => {})
      return
    }
    if (shell.requestFullscreen) {
      void shell.requestFullscreen().catch(() => {})
      return
    }
    // iOS: 只有 video 元素自己能全屏, 且没有 Promise
    const legacy = video as HTMLVideoElement & { webkitEnterFullscreen?: () => void }
    legacy.webkitEnterFullscreen?.()
  }

  function togglePip() {
    const video = videoRef.current
    if (!video) return
    // 画中画是锦上添花, 浏览器拒绝(手势/编码限制)时没必要打断播放
    if (document.pictureInPictureElement) void document.exitPictureInPicture().catch(() => {})
    else void video.requestPictureInPicture().catch(() => {})
  }

  const chrome: VideoChrome = {
    isFullscreen,
    canFullscreen,
    canPip: typeof document !== 'undefined' && document.pictureInPictureEnabled,
    onToggleFullscreen: toggleFullscreen,
    onTogglePip: togglePip,
  }

  return (
    <div
      ref={shellRef}
      className="ep-video"
      onPointerDown={poke}
      // 鼠标移进来就把控件叫出来; 手指滑动不算"想看控件", 免得一划就闪一下
      onPointerMove={(event) => {
        if (event.pointerType === 'mouse') poke()
      }}
    >
      {episode.cover ? (
        <span
          className="ep-video__backdrop"
          style={{ backgroundImage: `url(${coverUrl(episode.cover)})` }}
          aria-hidden="true"
        />
      ) : null}
      <span className="ep-video__scrim" aria-hidden="true" />

      <video
        ref={videoRef}
        className="ep-video__el"
        style={{ filter: `brightness(${brightness})` }}
        src={src}
        // 非当前集不预载, 否则整部剧同时发请求; 下一集的预热靠 Range 请求单独做
        preload={active ? 'auto' : 'none'}
        playsInline
        // 只让当前屏可聚焦, 否则前后两屏的 <video> 也会各占一个 Tab 位
        tabIndex={active ? 0 : -1}
        aria-label={`第 ${episode.index} 集，空格键播放或暂停`}
        onClick={() => {
          // 控件藏着的时候, 第一下只是把它叫出来, 不顺手切暂停
          if (!controlsVisible) {
            poke()
            return
          }
          toggle()
        }}
        onKeyDown={(event) => {
          if (event.key !== ' ' && event.key !== 'k') return
          // 空格默认会滚页面, 在这个竖向 feed 里就是换集
          event.preventDefault()
          toggle()
        }}
        onPlaying={() => {
          setState('ready')
          setStarted(true)
        }}
        onWaiting={() => setState('loading')}
        onEnded={onEnded}
        onError={() => setState('error')}
      />

      {/* 浮层只属于正在看的那一屏: 否则前后各一屏的文案会同时挂在 DOM 里 */}
      {active && state === 'loading' ? (
        <div className="ep-video__overlay" role="status">
          <Icon name="spinner" size={30} className="ep-video__spin" />
          <p className="ep-video__msg">{slow ? '首次播放需要下载并解密，请稍候…' : '正在准备视频…'}</p>
          {slow ? <p className="ep-video__sub">这一集播过一次之后就是秒开</p> : null}
        </div>
      ) : null}

      {active && state === 'blocked' ? (
        <div className="ep-video__overlay">
          <button type="button" className="ep-video__action" onClick={play}>
            <Icon name="play" size={20} />
            点击播放
          </button>
          <p className="ep-video__sub">浏览器不允许带声音自动播放，需要点一下</p>
        </div>
      ) : null}

      {active && state === 'error' ? (
        <div className="ep-video__overlay">
          <p className="ep-video__msg">这一集取流失败了</p>
          <button type="button" className="ep-video__action" onClick={retry}>
            <Icon name="refresh" size={16} />
            重试
          </button>
        </div>
      ) : null}

      {active ? (
        // key 只加在不含 <video> 的这一层: 换集时把倍速弹层、拖动中的进度这些局部状态清掉,
        // 又不碰 <video> 本身 —— 画中画连播靠的正是那个元素的复用。
        <VideoControls
          key={episode.vid}
          playback={playback}
          prefs={prefs}
          onUpdatePrefs={update}
          onToggle={toggle}
          visible={controlsVisible}
          compact={compact}
          chrome={chrome}
          onOpenSheet={onOpenSheet}
        />
      ) : null}
    </div>
  )
}
