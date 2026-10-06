import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from './ui/Icon'
import type { IconName } from './ui/Icon'
import './section-header.css'

export interface SectionHeaderProps {
  title: string
  /** 标题左侧的图标 (如热播用火苗), 与 accent 二选一 */
  icon?: IconName
  /** 标题左侧的品牌渐变竖条 */
  accent?: boolean
  /** 右侧「更多」入口 */
  action?: { label: string; to: string }
  /** 右侧自定义内容, 例如切换用的 chip */
  children?: ReactNode
}

export function SectionHeader({
  title,
  icon,
  accent = false,
  action,
  children,
}: SectionHeaderProps) {
  return (
    <div className="section-header">
      <h2 className="section-header__title">
        {icon ? (
          <Icon name={icon} size={20} className="section-header__icon" />
        ) : accent ? (
          <span className="section-header__bar" aria-hidden="true" />
        ) : null}
        {title}
      </h2>
      {action || children ? (
        <div className="section-header__aside">
          {children}
          {action ? (
            <Link className="section-header__more" to={action.to}>
              {action.label}
              <Icon name="chevronRight" size={14} />
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
