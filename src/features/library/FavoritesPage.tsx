import { Link } from 'react-router-dom'
import { SeriesGrid } from '@/components/SeriesGrid'
import { Icon } from '@/components/ui/Icon'
import { PageHead } from '@/components/ui/PageHead'
import { StateBlock } from '@/components/ui/StateBlock'
import { libraryToSeries } from '@/lib/series'
import { useFavorites } from './useLibrary'
import './library-page.css'

export function FavoritesPage() {
  const { items } = useFavorites()

  return (
    <div className="library-page">
      <PageHead
        title="我的收藏"
        sub={items.length > 0 ? `共 ${items.length} 部 · 只存在这台设备上` : '收藏夹是空的'}
      />

      {items.length === 0 ? (
        <StateBlock
          state="empty"
          message="还没有收藏任何剧集"
          hint="在剧集卡片或详情页点一下心形，就会出现在这里。"
          action={
            <Link className="library-page__cta" to="/">
              去发现
              <Icon name="chevronRight" size={14} />
            </Link>
          }
        />
      ) : (
        <SeriesGrid items={items.map(libraryToSeries)} skeletonCount={items.length} />
      )}
    </div>
  )
}
