import type { Series } from '@/api/types'
import { errorMessage } from '@/lib/error'
import { SeriesCard } from './SeriesCard'
import { StateBlock } from './ui/StateBlock'
import './series-grid.css'

export interface SeriesGridProps {
  items: Series[] | undefined
  loading?: boolean
  error?: unknown
  onRetry?: () => void
  /** 显示名次角标 (排行榜用) */
  ranked?: boolean
  skeletonCount?: number
  emptyText?: string
}

export function SeriesGrid({
  items,
  loading = false,
  error,
  onRetry,
  ranked = false,
  skeletonCount = 12,
  emptyText,
}: SeriesGridProps) {
  if (loading) {
    return <StateBlock state="loading" variant="skeleton" skeletonCount={skeletonCount} />
  }

  if (error) {
    return <StateBlock state="error" hint={errorMessage(error)} onRetry={onRetry} />
  }

  if (!items || items.length === 0) {
    return <StateBlock state="empty" message={emptyText} />
  }

  return (
    <div className="series-grid">
      {items.map((series, index) => (
        <SeriesCard key={series.series_id} series={series} rank={ranked ? index + 1 : undefined} />
      ))}
    </div>
  )
}
