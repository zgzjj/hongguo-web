import { GENRES } from '@/api/types'
import { useGenre } from './useGenre'
import './genre-switch.css'

export interface GenreSwitchProps {
  /** topbar: 桌面顶栏显示、手机隐藏; page: 反过来 */
  placement: 'topbar' | 'page'
}

export function GenreSwitch({ placement }: GenreSwitchProps) {
  const [genre, setGenre] = useGenre()

  return (
    <div
      className={`genre-switch genre-switch--${placement}`}
      role="group"
      aria-label="内容类型"
    >
      {GENRES.map((item) => (
        <button
          key={item.id}
          type="button"
          className={genre === item.id ? 'genre-switch__item is-on' : 'genre-switch__item'}
          aria-pressed={genre === item.id}
          onClick={() => setGenre(item.id)}
        >
          {item.name}
        </button>
      ))}
    </div>
  )
}
