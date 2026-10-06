import { useEffect, useState } from 'react'

/** 手机断点。必须和 CSS 里的 @media (max-width: 720px) 保持一致。 */
export const MOBILE_QUERY = '(max-width: 720px)'

/** 响应式断点判断。纯 SPA, 不需要考虑服务端渲染。 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)

  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = () => setMatches(mql.matches)
    setMatches(mql.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])

  return matches
}
