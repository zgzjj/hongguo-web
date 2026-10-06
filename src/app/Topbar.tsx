import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { GenreSwitch } from '@/features/browse/GenreSwitch'
import './topbar.css'

/** 只有这几个页面用得上内容类型切换 */
const GENRE_ROUTES = new Set(['/', '/rank', '/explore'])

export function Topbar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [params] = useSearchParams()

  // 搜索框要跟随地址栏: 在 /search 上直接改词会同步, 离开时清空
  const queryParam = pathname === '/search' ? (params.get('q') ?? '') : ''
  const [query, setQuery] = useState(queryParam)
  const [syncedFrom, setSyncedFrom] = useState(queryParam)

  if (queryParam !== syncedFrom) {
    setSyncedFrom(queryParam)
    setQuery(queryParam)
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const keyword = query.trim()
    if (!keyword) return
    // 同一个词再提交一次不该在浏览器历史里压一条重复记录
    if (pathname === '/search' && params.get('q') === keyword) return
    navigate(`/search?q=${encodeURIComponent(keyword)}`)
  }

  return (
    <header className="topbar">
      <Link to="/" className="topbar__brand">
        红果短剧
      </Link>

      {GENRE_ROUTES.has(pathname) ? <GenreSwitch placement="topbar" /> : null}

      <form className="topbar__search" role="search" onSubmit={submit}>
        <Icon name="search" size={16} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜剧名"
          aria-label="搜索剧名"
          enterKeyHint="search"
        />
      </form>

      <Link to="/settings" className="topbar__settings" aria-label="设置">
        <Icon name="settings" size={20} />
      </Link>
    </header>
  )
}
