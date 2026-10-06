import { useEffect, useMemo, useState } from 'react'
import { useBrowse, useFilters } from '@/api/queries'
import { BROWSE_LIMIT } from '@/api/types'
import type { BrowseParams, BrowseSort, FilterRow, Genre } from '@/api/types'
import { SectionHeader } from '@/components/SectionHeader'
import { SeriesGrid } from '@/components/SeriesGrid'
import { Chip, ChipRow } from '@/components/ui/Chip'
import { Icon } from '@/components/ui/Icon'
import { GenreSwitch } from '@/features/browse/GenreSwitch'
import { useGenre } from '@/features/browse/useGenre'
import './explore.css'

/** 行 type → 选中项 id, 空串表示「全部」 */
type Selection = Record<string, string>

const DEFAULT_SORT: BrowseSort = 'hot_score'

/**
 * /filters 每行的 type 与 /browse 的参数名不同名(如 category_dim_theme ↔ theme),
 * 这里显式列出映射, 不用动态取值以免拼错参数被服务端静默忽略。
 */
function buildParams(genre: Genre, rows: FilterRow[], selection: Selection): BrowseParams {
  const params: BrowseParams = { genre, limit: BROWSE_LIMIT, sort: DEFAULT_SORT }

  for (const row of rows) {
    const value = selection[row.type]
    if (!value) continue

    switch (row.type) {
      case 'category_dim_theme':
        params.theme = value
        break
      case 'category_dim_role':
        params.setting = value
        break
      case 'category_dim_epoch':
        params.background = value
        break
      case 'sort':
        params.sort = value as BrowseSort
        break
      case 'gender':
        params.gender = value
        break
      case 'online_time':
        // 筛选项给的是 days_7, /browse 收的是 7
        params.days = value.replace('days_', '')
        break
      case 'creation_status':
        params.status = value
        break
      default:
        break
    }
  }

  return params
}

export function ExplorePage() {
  const [genre] = useGenre()
  const [selection, setSelection] = useState<Selection>({})
  const [panelOpen, setPanelOpen] = useState(true)

  // 各体裁的维度项完全不同, 换体裁必须清空, 否则会带着上一个体裁的 cate_ id
  useEffect(() => {
    setSelection({})
  }, [genre])

  const filters = useFilters(genre)
  const rows = useMemo(
    () => (filters.data?.rows ?? []).filter((row) => row.type !== 'genre'),
    [filters.data],
  )

  const params = useMemo(() => buildParams(genre, rows, selection), [genre, rows, selection])
  const browse = useBrowse(params, rows.length > 0)

  const picked = Object.values(selection).filter(Boolean).length

  function pick(type: string, id: string) {
    setSelection((prev) => ({ ...prev, [type]: prev[type] === id ? '' : id }))
  }

  return (
    <div className="explore">
      <GenreSwitch placement="page" />

      <button
        type="button"
        className="explore__toggle"
        aria-expanded={panelOpen}
        onClick={() => setPanelOpen((open) => !open)}
      >
        <Icon name="explore" size={16} />
        筛选条件
        {picked > 0 ? <span className="explore__toggle-count">{picked}</span> : null}
        <Icon name={panelOpen ? 'chevronDown' : 'chevronRight'} size={15} />
      </button>

      {panelOpen ? (
        <div className="explore__panel">
          {rows.map((row) => (
            <ChipRow key={row.type} label={row.row_name}>
              <Chip active={!selection[row.type]} onClick={() => pick(row.type, '')}>
                全部
              </Chip>
              {row.items.map((item) => (
                <Chip
                  key={item.id}
                  active={selection[row.type] === item.id}
                  onClick={() => pick(row.type, item.id)}
                >
                  {item.name}
                </Chip>
              ))}
            </ChipRow>
          ))}

          {picked > 0 ? (
            <button type="button" className="explore__reset" onClick={() => setSelection({})}>
              <Icon name="close" size={14} />
              清空筛选
            </button>
          ) : null}
        </div>
      ) : null}

      <SectionHeader icon="explore" title="筛选结果">
        <span className="explore__count">服务端不支持翻页，一次最多 {BROWSE_LIMIT} 条</span>
      </SectionHeader>

      <SeriesGrid
        items={browse.data?.items}
        loading={browse.isPending || filters.isPending}
        error={browse.error ?? filters.error}
        onRetry={() => {
          void filters.refetch()
          void browse.refetch()
        }}
        skeletonCount={18}
        emptyText="没有符合条件的剧集，换个条件试试"
      />
    </div>
  )
}
