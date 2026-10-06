import type { ReactNode } from 'react'
import './page-head.css'

export interface PageHeadProps {
  title: string
  /** 标题下的一行说明 */
  sub?: string
  /** 右侧操作区 */
  children?: ReactNode
}

/** 二级页面统一的页头: 大标题 + 说明 + 右侧操作。 */
export function PageHead({ title, sub, children }: PageHeadProps) {
  return (
    <header className="page-head">
      <div className="page-head__text">
        <h1 className="page-head__title">{title}</h1>
        {sub ? <p className="page-head__sub">{sub}</p> : null}
      </div>
      {children ? <div className="page-head__aside">{children}</div> : null}
    </header>
  )
}
