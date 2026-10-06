import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { GENRES } from '@/api/types'
import type { Genre } from '@/api/types'

const DEFAULT_GENRE: Genre = 'short_play'

const GENRE_IDS = GENRES.map((item) => item.id) as Genre[]

function isGenre(value: string | null): value is Genre {
  return value !== null && (GENRE_IDS as string[]).includes(value)
}

/**
 * 内容类型放在 URL 上(?genre=), 而不是组件状态里 ——
 * 这样分享链接、浏览器前进后退、以及顶栏与页面共用同一份状态都不会打架。
 */
export function useGenre(): [Genre, (next: Genre) => void] {
  const [params, setParams] = useSearchParams()

  const raw = params.get('genre')
  const genre = isGenre(raw) ? raw : DEFAULT_GENRE

  const setGenre = useCallback(
    (next: Genre) => {
      setParams(
        (prev) => {
          const draft = new URLSearchParams(prev)
          draft.set('genre', next)
          return draft
        },
        { replace: true },
      )
    },
    [setParams],
  )

  return [genre, setGenre]
}
