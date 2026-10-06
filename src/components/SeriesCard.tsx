import { Link } from 'react-router-dom'
import type { Series } from '@/api/types'
import { coverUrl } from '@/api/endpoints'
import { formatEpisodeCount, formatHeat, splitCategory } from '@/lib/format'
import { useFavoriteState } from '@/features/library/useLibrary'
import { Icon } from './ui/Icon'
import { Poster } from './Poster'
import './series-card.css'

export interface SeriesCardProps {
  series: Series
  /** 排行榜名次。给了就占左上角, 否则让位给 premiere(新剧/红果首发) */
  rank?: number
  /** 右上角收藏按钮 (桌面 hover 才浮出, 手机不显示) */
  favoritable?: boolean
}

export function SeriesCard({ series, rank, favoritable = true }: SeriesCardProps) {
  const { favorited, toggle } = useFavoriteState(series.series_id)

  const corner = rank ? String(rank) : (series.premiere ?? '')
  const tags = splitCategory(series.category)
  const heat = formatHeat(series.play_cnt)
  const total = formatEpisodeCount(series.episode_cnt)
  const to = `/series/${series.series_id}`

  return (
    <article className="series-card">
      <Link className="series-card__link" to={to} aria-label={series.title}>
        <Poster className="series-card__poster" src={coverUrl(series.cover)} alt={series.title}>
          {corner ? <span className="series-card__corner">{corner}</span> : null}
          {heat ? (
            <span className="series-card__heat">
              <Icon name="fire" size={12} />
              {heat}
            </span>
          ) : null}
          {total ? <span className="series-card__eps">{total}</span> : null}
        </Poster>
      </Link>

      {favoritable ? (
        <button
          type="button"
          className={favorited ? 'series-card__fav is-on' : 'series-card__fav'}
          aria-pressed={favorited}
          aria-label={favorited ? `取消收藏 ${series.title}` : `收藏 ${series.title}`}
          onClick={() => toggle(series)}
        >
          <Icon name={favorited ? 'heartFilled' : 'heart'} size={15} />
        </button>
      ) : null}

      <Link className="series-card__body" to={to}>
        <h3 className="series-card__title">{series.title}</h3>
        {tags.length ? <p className="series-card__tags">{tags.join(' · ')}</p> : null}
        {series.intro ? <p className="series-card__desc">{series.intro}</p> : null}
      </Link>
    </article>
  )
}
