import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './Layout'
import { DiscoverPage } from '@/features/discover/DiscoverPage'
import { ExplorePage } from '@/features/explore/ExplorePage'
import { FavoritesPage } from '@/features/library/FavoritesPage'
import { HistoryPage } from '@/features/library/HistoryPage'
import { PlayerPage } from '@/features/player/PlayerPage'
import { RankPage } from '@/features/rank/RankPage'
import { SearchPage } from '@/features/search/SearchPage'
import { SeriesDetailPage } from '@/features/series/SeriesDetailPage'
import { SettingsPage } from '@/features/settings/SettingsPage'

export function App() {
  return (
    <Routes>
      {/* 播放页独占整屏, 不带侧栏/顶栏 */}
      <Route path="/play/:seriesId/:ep" element={<PlayerPage />} />

      <Route element={<Layout />}>
        <Route index element={<DiscoverPage />} />
        <Route path="rank" element={<RankPage />} />
        <Route path="explore" element={<ExplorePage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="favorites" element={<FavoritesPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="series/:seriesId" element={<SeriesDetailPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
