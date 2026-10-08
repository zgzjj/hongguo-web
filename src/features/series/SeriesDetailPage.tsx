import { Link, useNavigate, useParams } from 'react-router-dom'
import { coverUrl } from '@/api/endpoints'
import { useEpisodes, useSeasons } from '@/api/queries'
import { Poster } from '@/components/Poster'
import { StateBlock } from '@/components/ui/StateBlock'
import { Icon } from '@/components/ui/Icon'
import { useFavoriteState, useProgress } from '@/features/library/useLibrary'
import { errorMessage } from '@/lib/error'
import { formatDate } from '@/lib/format'
import { metaToSeries, parseCelebrities } from '@/lib/series'
import { EpisodeGrid } from './EpisodeGrid'
import { SeasonRail } from './SeasonRail'
import './series-detail.css'

export function SeriesDetailPage() {
  const { seriesId = '' } = useParams()
  const navigate = useNavigate()

  const { data, isPending, error, refetch } = useEpisodes(seriesId)
  const progress = useProgress(seriesId)
  const { favorited, toggle } = useFavoriteState(seriesId)
  // 后端是拿剧名去搜索匹配的, 所以要等 meta 拿到剧名才能问 —— hook 不能放在 early return 后面,
  // 这里先传空串, enabled 会挡住, 拿到 title 后自动开跑。
  const seasons = useSeasons(seriesId, data?.meta.title ?? '')

  if (isPending) {
    return <StateBlock state="loading" variant="skeleton" skeletonCount={6} />
  }

  if (error || !data) {
    return (
      <StateBlock
        state="error"
        hint={error ? errorMessage(error) : '没有拿到这部剧的信息'}
        onRetry={() => void refetch()}
      />
    )
  }

  const { meta, episodes } = data
  const resumeEp = progress > 0 && progress <= meta.episode_cnt ? progress : 1
  const hasResume = progress > 0
  // 只有真人剧有演员表, 漫剧/AI剧是空数组 —— 空就整段不渲染
  const cast = parseCelebrities(meta.celebrities)
  // 不分季的剧返回空数组, 同样整段不渲染(加载中/失败也一样, 不为一个附加区块弹报错)
  const otherSeasons = seasons.data?.items ?? []

  return (
    <article className="detail">
      <button type="button" className="detail__back" onClick={() => navigate(-1)}>
        <Icon name="back" size={16} />
        返回
      </button>

      <header className="detail__head">
        <Poster className="detail__poster" src={coverUrl(meta.cover)} alt={meta.title} />

        <div className="detail__info">
          <h1 className="detail__title">{meta.title}</h1>

          <div className="detail__badges">
            {meta.status ? <span className="detail__status">{meta.status}</span> : null}
            <span className="detail__meta-item">全 {meta.episode_cnt} 集</span>
            {meta.followed_cnt ? (
              <span className="detail__meta-item">
                {meta.followed_cnt.toLocaleString('zh-CN')} 人追剧
              </span>
            ) : null}
          </div>

          {meta.category.length ? (
            <p className="detail__tags">{meta.category.slice(0, 6).join(' · ')}</p>
          ) : null}

          {meta.intro ? <p className="detail__intro">{meta.intro}</p> : null}

          <div className="detail__actions">
            <Link className="detail__play" to={`/play/${meta.series_id}/${resumeEp}`}>
              <Icon name="play" size={14} />
              {hasResume ? `继续看第 ${resumeEp} 集` : '立即观看'}
            </Link>
            <button
              type="button"
              className={favorited ? 'detail__fav is-on' : 'detail__fav'}
              aria-pressed={favorited}
              onClick={() => toggle(metaToSeries(meta))}
            >
              <Icon name={favorited ? 'heartFilled' : 'heart'} size={15} />
              {favorited ? '已收藏' : '收藏'}
            </button>
          </div>

          <dl className="detail__facts">
            {meta.create_time ? (
              <div>
                <dt>上架</dt>
                <dd>{formatDate(meta.create_time)}</dd>
              </div>
            ) : null}
            {meta.play_cnt ? (
              <div>
                <dt>播放</dt>
                <dd>{meta.play_cnt.toLocaleString('zh-CN')}</dd>
              </div>
            ) : null}
          </dl>
        </div>
      </header>

      {cast.length > 0 ? (
        <section className="detail__cast">
          <h2 className="detail__section-title">演员表</h2>
          <ul className="cast-rail scroll-x">
            {cast.map((person, index) => (
              <li className="cast-card" key={`${person.name}-${index}`} title={person.bio || undefined}>
                {person.avatar ? (
                  <img
                    className="cast-card__avatar"
                    src={coverUrl(person.avatar)}
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  // 没头像就用首字占位, 空框比没有还难看
                  <span className="cast-card__avatar cast-card__blank" aria-hidden="true">
                    {person.name.slice(0, 1)}
                  </span>
                )}
                <span className="cast-card__name">{person.name}</span>
                {person.role ? <span className="cast-card__role">{person.role}</span> : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {otherSeasons.length > 0 ? (
        <section className="detail__seasons">
          <h2 className="detail__section-title">其他季</h2>
          <SeasonRail seasons={otherSeasons} />
        </section>
      ) : null}

      <section className="detail__episodes">
        <h2 className="detail__section-title">选集</h2>
        {episodes.length === 0 ? (
          <StateBlock state="empty" message="这部剧还没有可播放的剧集" />
        ) : (
          <EpisodeGrid
            episodes={episodes}
            current={resumeEp}
            target={{
              kind: 'link',
              hrefFor: (index) => `/play/${meta.series_id}/${index}`,
            }}
          />
        )}
      </section>
    </article>
  )
}
