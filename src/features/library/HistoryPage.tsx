import { Link } from 'react-router-dom'
import { coverUrl } from '@/api/endpoints'
import { Poster } from '@/components/Poster'
import { Icon } from '@/components/ui/Icon'
import { PageHead } from '@/components/ui/PageHead'
import { StateBlock } from '@/components/ui/StateBlock'
import { formatRelative } from '@/lib/format'
import { useHistory } from './useLibrary'
import './library-page.css'
import './history.css'

export function HistoryPage() {
  const { items } = useHistory()

  return (
    <div className="library-page">
      <PageHead
        title="观看历史"
        sub={items.length > 0 ? `最近 ${items.length} 条 · 只存在这台设备上` : '还没有观看记录'}
      />

      {items.length === 0 ? (
        <StateBlock
          state="empty"
          message="还没有看过任何剧集"
          hint="看过的剧会自动出现在这里，方便接着往下看。"
          action={
            <Link className="library-page__cta" to="/">
              去发现
              <Icon name="chevronRight" size={14} />
            </Link>
          }
        />
      ) : (
        <ul className="history">
          {items.map((item) => {
            const total = item.episode_cnt || 0
            const percent = total > 0 ? Math.min(100, Math.round((item.ep / total) * 100)) : 0

            return (
              <li className="history__row" key={item.series_id}>
                <Link className="history__thumb" to={`/series/${item.series_id}`} tabIndex={-1}>
                  <Poster src={coverUrl(item.cover)} alt={item.title} />
                </Link>

                <div className="history__body">
                  <Link className="history__title" to={`/series/${item.series_id}`}>
                    {item.title}
                  </Link>

                  <p className="history__meta">
                    看到第 {item.ep} 集
                    {total > 0 ? ` · 共 ${total} 集` : ''}
                    {item.watchedAt ? ` · ${formatRelative(item.watchedAt)}` : ''}
                  </p>

                  <div
                    className="history__bar"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={percent}
                    aria-label={`已看 ${percent}%`}
                  >
                    <span className="history__bar-fill" style={{ width: `${percent}%` }} />
                  </div>
                </div>

                <Link className="history__resume" to={`/play/${item.series_id}/${item.ep}`}>
                  <Icon name="play" size={15} />
                  <span className="history__resume-label">继续观看</span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
