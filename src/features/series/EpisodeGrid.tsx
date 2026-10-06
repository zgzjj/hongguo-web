import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Episode } from '@/api/types'
import { Icon } from '@/components/ui/Icon'
import { buildSegments } from './episodeSegments'
import type { EpisodeSegment } from './episodeSegments'
import './episode-grid.css'

/** 详情页用链接(能新开标签/分享), 播放器侧栏用回调(不跳路由)。 */
export type EpisodeGridTarget =
  | { kind: 'link'; hrefFor: (index: number) => string }
  | { kind: 'button'; onPick: (index: number) => void }

export interface EpisodeGridProps {
  episodes: Episode[]
  /** 当前看到/播到的集号: 高亮它, 并决定默认展开哪一段 */
  current: number
  target: EpisodeGridTarget
  className?: string
}

/** 某个集号落在第几段。找不到就退回第一段。 */
function segmentIndexOf(segments: EpisodeSegment[], index: number): number {
  const found = segments.findIndex((segment) =>
    segment.episodes.some((episode) => episode.index === index),
  )
  return found < 0 ? 0 : found
}

/**
 * 选集宫格。
 * 一条横向长条滑 200 多集太难用, 所以改成"数字宫格 + 分段标签 + 正倒序",
 * 和国内主流平台一致: 一屏看完一段, 想跳远段直接点标签。
 */
export function EpisodeGrid({ episodes, current, target, className }: EpisodeGridProps) {
  const [descending, setDescending] = useState(false)
  /** 手动点的段 + 点它时的"当前集所在段"。后者一变, 这次手动选择就作废 —— 相当于自动跟着当前集走。 */
  const [manual, setManual] = useState<{ index: number; auto: number } | null>(null)

  const ordered = useMemo(
    () => (descending ? [...episodes].reverse() : episodes),
    [episodes, descending],
  )
  const segments = useMemo(() => buildSegments(ordered), [ordered])

  /** 当前集落在哪一段。找不到就退回第一段。 */
  const autoIndex = useMemo(() => segmentIndexOf(segments, current), [segments, current])

  const activeIndex = manual && manual.auto === autoIndex ? manual.index : autoIndex
  const active = segments[Math.min(activeIndex, segments.length - 1)]
  if (!active) return null

  /**
   * 切正/倒序时直接落到新顺序的第一段。
   * 这里不能沿用"跟着当前集走": 刚看完第 1 集的人切到倒序, 想要的是最新的 77 集,
   * 跟着当前集会把他甩到最老的那一段, 等于点了倒序却看到最旧的。
   */
  function toggleSort() {
    const next = !descending
    const nextSegments = buildSegments(next ? [...episodes].reverse() : episodes)
    setDescending(next)
    setManual({ index: 0, auto: segmentIndexOf(nextSegments, current) })
  }

  return (
    <div className={className ? `ep-grid ${className}` : 'ep-grid'}>
      {segments.length > 1 ? (
        <div className="ep-grid__bar">
          <div className="ep-grid__tabs scroll-x">
            {segments.map((segment, index) => (
              <button
                key={segment.from}
                type="button"
                className={index === activeIndex ? 'ep-grid__tab is-on' : 'ep-grid__tab'}
                aria-pressed={index === activeIndex}
                onClick={() => setManual({ index, auto: autoIndex })}
              >
                {segment.from === segment.to ? segment.from : `${segment.from}-${segment.to}`}
              </button>
            ))}
          </div>
          <button type="button" className="ep-grid__sort" onClick={toggleSort}>
            <Icon name="chevronDown" size={13} />
            {descending ? '倒序' : '正序'}
          </button>
        </div>
      ) : null}

      <ul className="ep-grid__list">
        {active.episodes.map((episode) => {
          const isOn = episode.index === current
          const cls = isOn ? 'ep-cell is-on' : 'ep-cell'
          return (
            <li key={episode.vid}>
              {target.kind === 'link' ? (
                <Link
                  className={cls}
                  to={target.hrefFor(episode.index)}
                  aria-current={isOn ? 'page' : undefined}
                >
                  {episode.index}
                </Link>
              ) : (
                <button
                  type="button"
                  className={cls}
                  aria-current={isOn ? 'true' : undefined}
                  onClick={() => target.onPick(episode.index)}
                >
                  {episode.index}
                </button>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
