import { NavLink } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import type { IconName } from '@/components/ui/Icon'
import { useMediaQuery, MOBILE_QUERY } from '@/lib/useMediaQuery'
import './sidebar.css'

interface NavItem {
  to: string
  label: string
  /** 底部 tab 栏用更短的字 (排行榜 → 排行) */
  shortLabel?: string
  icon: IconName
  /** 精确匹配 (首页), 否则 /series/xxx 也会点亮首页 */
  end?: boolean
  /** 手机上从底部 tab 栏隐去, 改由顶栏齿轮进入 */
  secondary?: boolean
}

const NAV: NavItem[] = [
  { to: '/', label: '发现', icon: 'home', end: true },
  { to: '/rank', label: '排行榜', shortLabel: '排行', icon: 'rank' },
  { to: '/explore', label: '探索', icon: 'explore' },
  { to: '/favorites', label: '收藏', icon: 'heart' },
  { to: '/history', label: '历史', icon: 'history' },
  { to: '/settings', label: '设置', icon: 'settings', secondary: true },
]

export function Sidebar() {
  // 底部 tab 栏位置窄, 用更短的字
  const isMobile = useMediaQuery(MOBILE_QUERY)

  return (
    <nav className="sidebar" aria-label="主导航">
      <NavLink to="/" className="sidebar__brand" aria-label="红果短剧 首页">
        <span className="sidebar__logo">
          <Icon name="play" size={17} />
        </span>
        <span className="sidebar__wordmark">红果</span>
      </NavLink>

      <ul className="sidebar__list">
        {NAV.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                [
                  'sidebar__item',
                  isActive ? 'is-active' : '',
                  item.secondary ? 'sidebar__item--secondary' : '',
                ]
                  .filter(Boolean)
                  .join(' ')
              }
            >
              <Icon name={item.icon} size={22} />
              <span className="sidebar__label">{isMobile ? (item.shortLabel ?? item.label) : item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
