import { Link } from 'react-router-dom'
import type { Series } from '@/api/types'
import { coverUrl } from '@/api/endpoints'
import { formatHeat, parseScore, splitCategory } from '@/lib/format'
import { useFavoriteState } from '@/features/library/useLibrary'
import { Icon } from '@/components/ui/Icon'
import './hero.css'

export interface HeroBannerProps {
  series: Series | undefined
  loading: boolean
}

/** 首页头图。数据取「今日上新」首条 —— 与下方热播榜不重复。 */
export function HeroBanner({ series, loading }: HeroBannerProps) {
  const { favorited, toggle } = useFavoriteState(series?.series_id ?? '')

  if (loading) return <div className="hero hero--loading" aria-busy="true" aria-label="加载中" />
  if (!series) return null

  const tags = splitCategory(series.category, 3)
  const heat = formatHeat(series.play_cnt).replace('热度', '')
  const score = parseScore(series.score)

  return (
    <section className="hero" aria-label="今日首推">
      <img className="hero__bg" src={coverUrl(series.cover)} alt="" aria-hidden="true" />
      <div className="hero__scrim" aria-hidden="true" />

      <div className="hero__body">
        <p className="hero__eyebrow">
          <span className="hero__badge">{series.premiere ?? '今日上新'}</span>
          {tags.length ? <span>{tags.join(' · ')}</span> : null}
        </p>
        <h1 className="hero__title">{series.title}</h1>
        {series.intro ? <p className="hero__sub">{series.intro}</p> : null}

        <div className="hero__actions">
          <Link className="hero__play" to={`/play/${series.series_id}/1`}>
            <Icon name="play" size={14} />
            立即观看
          </Link>
          <button
            type="button"
            className={favorited ? 'hero__fav is-on' : 'hero__fav'}
            aria-pressed={favorited}
            onClick={() => toggle(series)}
          >
            <Icon name={favorited ? 'heartFilled' : 'heart'} size={15} />
            {favorited ? '已收藏' : '收藏'}
          </button>
        </div>
      </div>

      <dl className="hero__stats">
        {series.episode_cnt ? (
          <div className="hero__stat">
            <dt>全剧</dt>
            <dd>{series.episode_cnt} 集</dd>
          </div>
        ) : null}
        {score !== null ? (
          <div className="hero__stat">
            <dt>评分</dt>
            <dd>{score.toFixed(1)}</dd>
          </div>
        ) : null}
        {heat ? (
          <div className="hero__stat">
            <dt>热度</dt>
            <dd>{heat}</dd>
          </div>
        ) : null}
      </dl>
    </section>
  )
}
