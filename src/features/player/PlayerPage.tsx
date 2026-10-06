import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode, RefObject } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useEpisodes } from '@/api/queries'
import type { Episode, SeriesMeta } from '@/api/types'
import { Icon } from '@/components/ui/Icon'
import { StateBlock } from '@/components/ui/StateBlock'
import { useLibraryActions } from '@/features/library/useLibrary'
import { errorMessage } from '@/lib/error'
import { formatDuration } from '@/lib/format'
import { metaToSeries } from '@/lib/series'
import { MOBILE_QUERY, useMediaQuery } from '@/lib/useMediaQuery'
import { EpisodeGrid } from '@/features/series/EpisodeGrid'
import { EpisodeSheet } from './EpisodeSheet'
import { EpisodeVideo } from './EpisodeVideo'
import './player.css'

/** 手机上除当前屏外, 前后各多挂载一屏, 滑动时不至于白屏 */
const NEIGHBOR_WINDOW = 1

/** 下一集的集号。剧集按集号有序, 就是数组里的下一个; 最后一集返回 null。 */
function nextIndexOf(episodes: Episode[], index: number): number | null {
  const at = episodes.findIndex((item) => item.index === index)
  const next = at >= 0 ? episodes[at + 1] : undefined
  return next ? next.index : null
}

interface PlayerFeed {
  episodes: Episode[]
  meta: SeriesMeta | undefined
  total: number
  current: number
  currentEpisode: Episode | undefined
  feedRef: RefObject<HTMLDivElement | null>
  setCurrent: (index: number) => void
  goNext: () => void
  isPending: boolean
  error: unknown
  refetch: () => void
}

/**
 * 手机端把 feed 和 current 对齐, 双向:
 * 滑到哪一屏就是哪一集(IntersectionObserver), 选集/自动跳集时反过来滚过去。
 */
function useFeedScrollSync(
  feedRef: RefObject<HTMLDivElement | null>,
  isMobile: boolean,
  current: number,
  total: number,
  onIndexChange: (index: number) => void,
) {
  useEffect(() => {
    const feed = feedRef.current
    if (!isMobile || !feed || total === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const index = Number((entry.target as HTMLElement).dataset.index)
          if (Number.isFinite(index)) onIndexChange(index)
        }
      },
      { root: feed, threshold: 0.6 },
    )

    for (const node of feed.querySelectorAll('[data-index]')) observer.observe(node)
    return () => observer.disconnect()
  }, [feedRef, isMobile, total, onIndexChange])

  useEffect(() => {
    const feed = feedRef.current
    if (!isMobile || !feed) return
    const target = feed.querySelector<HTMLElement>(`[data-index="${current}"]`)
    if (!target) return
    if (Math.abs(target.offsetTop - feed.scrollTop) > 8) feed.scrollTo({ top: target.offsetTop })
  }, [feedRef, isMobile, current, total])
}

/** 播放页的状态与副作用: 取剧集、跟地址栏同步、手机上把 feed 滚到当前那一屏。 */
function usePlayerFeed(seriesId: string, ep: string | undefined, isMobile: boolean): PlayerFeed {
  const navigate = useNavigate()
  const { data, isPending, error, refetch } = useEpisodes(seriesId)
  const { recordWatch } = useLibraryActions()

  const [current, setCurrent] = useState(() => Math.max(1, Number(ep) || 1))
  const feedRef = useRef<HTMLDivElement>(null)

  const episodes = useMemo(() => data?.episodes ?? [], [data])
  const meta = data?.meta
  const total = episodes.length
  const currentEpisode = useMemo(
    () => episodes.find((item) => item.index === current) ?? episodes[0],
    [episodes, current],
  )

  // 进入和切集都记一次进度, 详情页就能续播
  useEffect(() => {
    if (!meta || !currentEpisode) return
    recordWatch(metaToSeries(meta), currentEpisode.index)
  }, [meta, currentEpisode, recordWatch])

  // 地址栏跟着当前集走, 刷新或分享都能回到同一集
  useEffect(() => {
    if (!currentEpisode || String(currentEpisode.index) === ep) return
    navigate(`/play/${seriesId}/${currentEpisode.index}`, { replace: true })
  }, [currentEpisode, ep, navigate, seriesId])

  useFeedScrollSync(feedRef, isMobile, current, total, setCurrent)

  const goNext = useCallback(() => {
    setCurrent((prev) => (prev < total ? prev + 1 : prev))
  }, [total])

  return {
    episodes,
    meta,
    total,
    current,
    currentEpisode,
    feedRef,
    setCurrent,
    goNext,
    isPending,
    error,
    refetch,
  }
}

function EpisodeHeading({
  title,
  index,
  total,
  duration,
}: {
  title: string
  index: number
  total: number
  duration: number | undefined
}) {
  return (
    <div className="player__heading">
      <p className="player__series">{title}</p>
      <p className="player__ep">
        第 {index} 集 · 共 {total} 集{duration ? ` · ${formatDuration(duration)}` : ''}
      </p>
    </div>
  )
}

interface PlayerDesktopProps {
  seriesId: string
  meta: SeriesMeta
  episodes: Episode[]
  total: number
  current: number
  heading: ReactNode
  onPick: (index: number) => void
  onBack: () => void
  onEnded: () => void
}

/** 桌面/平板: 固定舞台 + 右侧选集面板, 点击切换。 */
function PlayerDesktop({
  seriesId,
  meta,
  episodes,
  total,
  current,
  heading,
  onPick,
  onBack,
  onEnded,
}: PlayerDesktopProps) {
  const episode = episodes.find((item) => item.index === current) ?? episodes[0]
  if (!episode) return null

  return (
    <div className="player player--desktop">
      <div className="player__stage">
        <EpisodeVideo
          key={episode.vid}
          seriesId={seriesId}
          episode={episode}
          active
          compact={false}
          nextIndex={nextIndexOf(episodes, episode.index)}
          onEnded={onEnded}
        />

        <div className="player__stage-bar">
          <button type="button" className="player__icon-btn" aria-label="返回" onClick={onBack}>
            <Icon name="back" size={20} />
          </button>
          {heading}
        </div>
      </div>

      <aside className="player__panel">
        <header className="player__panel-head">
          <p className="player__panel-title">{meta.title}</p>
          <p className="player__panel-sub">
            {meta.status} · 全 {total} 集
          </p>
        </header>

        <div className="player__panel-body">
          <EpisodeGrid
            episodes={episodes}
            current={current}
            target={{ kind: 'button', onPick }}
          />
        </div>
      </aside>
    </div>
  )
}

interface PlayerMobileProps {
  seriesId: string
  title: string
  episodes: Episode[]
  current: number
  feedRef: RefObject<HTMLDivElement | null>
  onPick: (index: number) => void
  onBack: () => void
  onEnded: () => void
}

/** 手机: 竖向 scroll-snap, 上下滑切集。 */
function PlayerMobile({
  seriesId,
  title,
  episodes,
  current,
  feedRef,
  onPick,
  onBack,
  onEnded,
}: PlayerMobileProps) {
  const [sheetOpen, setSheetOpen] = useState(false)

  return (
    <div className="player player--mobile">
      <div className="player__feed" ref={feedRef}>
        {episodes.map((episode) => (
          <section className="player__slide" key={episode.vid} data-index={episode.index}>
            {/* 一屏一集, 但只挂载当前屏和前后各一屏 —— 209 集全挂 <video> 会拖垮手机 */}
            {Math.abs(episode.index - current) <= NEIGHBOR_WINDOW ? (
              <EpisodeVideo
                seriesId={seriesId}
                episode={episode}
                active={episode.index === current}
                compact
                nextIndex={nextIndexOf(episodes, episode.index)}
                onEnded={onEnded}
              />
            ) : null}
          </section>
        ))}
      </div>

      <div className="player__chrome">
        <div className="player__top">
          <button type="button" className="player__icon-btn" aria-label="返回" onClick={onBack}>
            <Icon name="back" size={20} />
          </button>
          <EpisodeHeading
            title={title}
            index={current}
            total={episodes.length}
            duration={episodes.find((item) => item.index === current)?.duration}
          />
        </div>

        <div className="player__bottom">
          <span className="player__swipe-hint">上下滑动切换集数</span>
          <button type="button" className="player__sheet-btn" onClick={() => setSheetOpen(true)}>
            <Icon name="rank" size={15} />
            选集
          </button>
        </div>
      </div>

      <EpisodeSheet
        open={sheetOpen}
        title={title}
        episodes={episodes}
        current={current}
        onPick={(index) => {
          onPick(index)
          setSheetOpen(false)
        }}
        onClose={() => setSheetOpen(false)}
      />
    </div>
  )
}

export function PlayerPage() {
  const { seriesId = '', ep } = useParams()
  const navigate = useNavigate()
  const isMobile = useMediaQuery(MOBILE_QUERY)
  const feed = usePlayerFeed(seriesId, ep, isMobile)
  const { meta, currentEpisode, total, current } = feed
  const onBack = useCallback(() => navigate(-1), [navigate])

  if (feed.isPending) {
    return (
      <div className="player player--state">
        <StateBlock state="loading" message="正在取剧集信息…" />
      </div>
    )
  }

  if (feed.error || !meta || total === 0) {
    return (
      <div className="player player--state">
        <StateBlock
          state={feed.error ? 'error' : 'empty'}
          message={feed.error ? undefined : '这部剧还没有可播放的剧集'}
          hint={feed.error ? errorMessage(feed.error) : undefined}
          onRetry={() => feed.refetch()}
        />
        <button type="button" className="player__exit" onClick={onBack}>
          返回
        </button>
      </div>
    )
  }

  if (isMobile) {
    return (
      <PlayerMobile
        seriesId={seriesId}
        title={meta.title}
        episodes={feed.episodes}
        current={current}
        feedRef={feed.feedRef}
        onPick={feed.setCurrent}
        onBack={onBack}
        onEnded={feed.goNext}
      />
    )
  }

  return (
    <PlayerDesktop
      seriesId={seriesId}
      meta={meta}
      episodes={feed.episodes}
      total={total}
      current={current}
      heading={
        <EpisodeHeading
          title={meta.title}
          index={currentEpisode?.index ?? current}
          total={total}
          duration={currentEpisode?.duration}
        />
      }
      onPick={feed.setCurrent}
      onBack={onBack}
      onEnded={feed.goNext}
    />
  )
}
