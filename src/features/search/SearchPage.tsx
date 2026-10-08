import { useState } from 'react'
import type { FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useSearch } from '@/api/queries'
import { SEARCH_GENRES, isSearchGenre } from '@/api/types'
import type { SearchGenre } from '@/api/types'
import { SeriesGrid } from '@/components/SeriesGrid'
import { Chip, ChipRow } from '@/components/ui/Chip'
import { Icon } from '@/components/ui/Icon'
import { StateBlock } from '@/components/ui/StateBlock'
import { errorMessage } from '@/lib/error'
import './search.css'

export function SearchPage() {
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const genreParam = params.get('genre')
  const genre: SearchGenre = isSearchGenre(genreParam) ? genreParam : 'short_play'
  const [draft, setDraft] = useState(query)
  // 从顶栏或分享链接带过来的词要回填到输入框, 但用户正在输入时不能覆盖
  const [syncedFrom, setSyncedFrom] = useState(query)

  if (query !== syncedFrom) {
    setSyncedFrom(query)
    setDraft(query)
  }

  const search = useSearch(query, genre)

  function submit(event: FormEvent) {
    event.preventDefault()
    const next = draft.trim()
    if (next) setParams({ q: next, genre })
  }

  function pickGenre(next: SearchGenre) {
    setParams({ q: query, genre: next })
  }

  return (
    <div className="search">
      <form className="search__form" onSubmit={submit} role="search">
        <Icon name="search" size={18} />
        <input
          className="search__input"
          type="search"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="搜索剧名、题材"
          aria-label="搜索关键词"
          autoFocus
        />
        <button type="submit" className="search__submit">
          搜索
        </button>
      </form>

      {query === '' ? (
        <p className="search__idle">输入剧名或题材，回车搜索。</p>
      ) : null}

      {/* 真人剧和动漫剧是两个独立的片库, 同名剧在两边是两部不同的剧 —— 所以要显式选一个 */}
      {query !== '' ? (
        <ChipRow label="类型">
          {SEARCH_GENRES.map((item) => (
            <Chip key={item.id} active={item.id === genre} onClick={() => pickGenre(item.id)}>
              {item.name}
            </Chip>
          ))}
        </ChipRow>
      ) : null}

      {query !== '' ? (
        <>
          <p className="search__count">
            关键词「{query}」的搜索结果
            {search.data ? ` · ${search.data.results.length} 条` : ''}
          </p>
          {search.error ? (
            <StateBlock
              state="error"
              message="搜索失败"
              hint={errorMessage(search.error)}
              onRetry={() => void search.refetch()}
            />
          ) : (
            <SeriesGrid
              items={search.data?.results}
              loading={search.isPending}
              emptyText="没有匹配的剧集"
            />
          )}
        </>
      ) : null}
    </div>
  )
}
