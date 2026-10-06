import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useSearch } from '@/api/queries'
import { SeriesGrid } from '@/components/SeriesGrid'
import { Icon } from '@/components/ui/Icon'
import { errorMessage } from '@/lib/error'
import './search.css'

export function SearchPage() {
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const [draft, setDraft] = useState(query)
  // 从顶栏或分享链接带过来的词要回填到输入框, 但用户正在输入时不能覆盖
  const [syncedFrom, setSyncedFrom] = useState(query)

  if (query !== syncedFrom) {
    setSyncedFrom(query)
    setDraft(query)
  }

  const search = useSearch(query)

  function submit(event: FormEvent) {
    event.preventDefault()
    const next = draft.trim()
    if (next) setParams({ q: next })
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
          placeholder="搜索剧名、演员、题材"
          aria-label="搜索关键词"
          autoFocus
        />
        <button type="submit" className="search__submit">
          搜索
        </button>
      </form>

      {query === '' ? (
        <p className="search__idle">输入关键词后回车。搜索需要已注册的设备身份，本机通道可能拿不到结果。</p>
      ) : null}

      {/* 搜索失败是接口能力边界, 不是用户操作失误, 所以给一条替代路径而不是只甩报错 */}
      {query !== '' && search.error ? (
        <aside className="search__fallback">
          <p className="search__fallback-title">搜索接口暂不可用</p>
          <p className="search__fallback-hint">
            红果网关对搜索要求已注册的设备身份，当前审计通道拿不到，这个请求会稳定失败，重试也没用。
            可以改用「探索」按题材逐层筛选，或者用「排行榜」按热度找剧。
          </p>
          <p className="search__fallback-detail">接口返回：{errorMessage(search.error)}</p>
          <div className="search__fallback-actions">
            <Link className="search__fallback-link" to="/explore">
              去探索
              <Icon name="chevronRight" size={14} />
            </Link>
            <Link className="search__fallback-link" to="/rank">
              看排行榜
              <Icon name="chevronRight" size={14} />
            </Link>
          </div>
        </aside>
      ) : null}

      {query !== '' && !search.error ? (
        <>
          <p className="search__count">
            关键词「{query}」的搜索结果
            {search.data ? ` · ${search.data.results.length} 条` : ''}
          </p>
          <SeriesGrid
            items={search.data?.results}
            loading={search.isPending}
            emptyText="没有匹配的剧集"
          />
        </>
      ) : null}
    </div>
  )
}
