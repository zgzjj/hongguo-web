import { useState } from 'react'
import { useBrowse, useRank } from '@/api/queries'
import { RANK_BOARDS } from '@/api/types'
import type { RankBoard } from '@/api/types'
import { SectionHeader } from '@/components/SectionHeader'
import { SeriesGrid } from '@/components/SeriesGrid'
import { Chip } from '@/components/ui/Chip'
import { GenreSwitch } from '@/features/browse/GenreSwitch'
import { useGenre } from '@/features/browse/useGenre'
import './rank.css'

const LIMIT = 30

export function RankPage() {
  const [genre] = useGenre()
  const [board, setBoard] = useState<RankBoard>('recommend')

  // 后端三个榜单全部映射到漫剧, 其它体裁只能退回按热度排序
  const hasOfficialBoard = genre === 'comic_series'

  const official = useRank(board, LIMIT, hasOfficialBoard)
  const fallback = useBrowse({ genre, sort: 'hot_score', limit: LIMIT }, !hasOfficialBoard)

  const active = hasOfficialBoard ? official : fallback

  return (
    <div className="rank-page">
      <GenreSwitch placement="page" />

      {hasOfficialBoard ? (
        <div className="rank-page__boards">
          {RANK_BOARDS.map((item) => (
            <Chip key={item.id} active={board === item.id} onClick={() => setBoard(item.id)}>
              {item.name}
            </Chip>
          ))}
        </div>
      ) : null}

      <SectionHeader
        icon="rank"
        title={hasOfficialBoard ? (official.data?.name ?? '排行榜') : '热度排行'}
        accent={!hasOfficialBoard}
      />

      {hasOfficialBoard ? null : (
        <p className="rank-page__note">
          官方榜单目前只覆盖漫剧，{genre === 'short_play' ? '真人剧' : 'AI剧'}这里按播放热度排序。
        </p>
      )}

      <SeriesGrid
        items={active.data?.items}
        loading={active.isPending}
        error={active.error}
        onRetry={() => void active.refetch()}
        ranked
        skeletonCount={18}
        emptyText="榜单暂时为空"
      />
    </div>
  )
}
