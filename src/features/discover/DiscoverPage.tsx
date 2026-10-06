import { useEffect, useState } from 'react'
import { useBrowse, useFilters, useLatest } from '@/api/queries'
import { SectionHeader } from '@/components/SectionHeader'
import { SeriesGrid } from '@/components/SeriesGrid'
import { Chip } from '@/components/ui/Chip'
import { GenreSwitch } from '@/features/browse/GenreSwitch'
import { useGenre } from '@/features/browse/useGenre'
import { MOBILE_QUERY, useMediaQuery } from '@/lib/useMediaQuery'
import { HeroBanner } from './HeroBanner'
import { ThemeChips } from './ThemeChips'
import './discover.css'

const HOT_LIMIT = 12
const NEW_LIMIT = 12
/** 头图固定取今日上新, 不跟着下面的 tab 变 */
const FEATURED_LIMIT = 6

export function DiscoverPage() {
  const [genre] = useGenre()
  const [theme, setTheme] = useState('')
  const [onlyToday, setOnlyToday] = useState(true)

  // 设计稿的手机端没有头图, 直接从筛选项进列表; 连请求一起关掉, 免得先撑高再塌回去
  const isMobile = useMediaQuery(MOBILE_QUERY)

  // 各体裁的维度项完全不同, 换体裁必须清空, 否则会带着上一个体裁的 cate_ id 去请求
  useEffect(() => {
    setTheme('')
  }, [genre])

  const featured = useLatest(genre, true, FEATURED_LIMIT, !isMobile)
  const hot = useBrowse({
    genre,
    theme: theme || undefined,
    sort: 'hot_score',
    limit: HOT_LIMIT,
  })
  const latest = useLatest(genre, onlyToday, NEW_LIMIT)
  const filters = useFilters(genre)

  const themeRow = filters.data?.rows.find((row) => row.type === 'category_dim_theme')

  return (
    <div className="discover">
      <GenreSwitch placement="page" />

      {isMobile ? null : <HeroBanner series={featured.data?.items[0]} loading={featured.isPending} />}

      <ThemeChips row={themeRow} value={theme} onChange={setTheme} />

      <section className="discover__section">
        <SectionHeader icon="fire" title="正在热播" action={{ label: '查看更多', to: '/rank' }} />
        <SeriesGrid
          items={hot.data?.items}
          loading={hot.isPending}
          error={hot.error}
          onRetry={() => void hot.refetch()}
          ranked
          emptyText="这个主题下暂时没有内容"
        />
      </section>

      <section className="discover__section">
        <SectionHeader title="新剧上线" action={{ label: '查看更多', to: '/rank' }}>
          <div className="discover__tabs">
            <Chip active={onlyToday} onClick={() => setOnlyToday(true)}>
              今日上新
            </Chip>
            <Chip active={!onlyToday} onClick={() => setOnlyToday(false)}>
              近期上新
            </Chip>
          </div>
        </SectionHeader>
        {/* 后端对粒度是诚实的: 漫剧/AI剧没有「今日」, 只会返回 7 天内。
            这里直接把它的说法照搬给用户 —— 点了「今日上新」却看到 7 天内的剧, 得有个交代 */}
        {latest.data?.mode ? <p className="discover__mode">{latest.data.mode}</p> : null}
        <SeriesGrid
          items={latest.data?.items}
          loading={latest.isPending}
          error={latest.error}
          onRetry={() => void latest.refetch()}
          emptyText="这段时间没有上新"
        />
      </section>
    </div>
  )
}
