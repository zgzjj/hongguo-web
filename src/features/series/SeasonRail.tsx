import { Link } from 'react-router-dom'
import type { Series } from '@/api/types'
import { coverUrl } from '@/api/endpoints'
import { Poster } from '@/components/Poster'
import { formatEpisodeCount } from '@/lib/format'
import './season-rail.css'

export interface SeasonRailProps {
  seasons: Series[]
}

/**
 * 同一部剧的其他季。
 *
 * 上游没有这个入口 —— 后端是拿剧名去搜索、再按基础名匹配出来的(见后端 novelfm.py),
 * 所以栏里不会有当前这一季: 页头标题已经写着它是第几季了, 再放一张只会占位置。
 */
export function SeasonRail({ seasons }: SeasonRailProps) {
  return (
    <ul className="season-rail scroll-x">
      {seasons.map((item) => (
        <li key={item.series_id}>
          <Link className="season-card" to={`/series/${item.series_id}`} title={item.title}>
            <Poster className="season-card__poster" src={coverUrl(item.cover)} alt={item.title}>
              {/* 没有季号的通常是正传, 标出来比留个空角标好认 */}
              <span className="season-card__badge">{item.season || '正传'}</span>
            </Poster>
            <span className="season-card__title">{item.title}</span>
            <span className="season-card__eps">{formatEpisodeCount(item.episode_cnt)}</span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
