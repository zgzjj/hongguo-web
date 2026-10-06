import type { ReactNode } from 'react'
import { Icon } from './Icon'
import './state-block.css'

export interface StateBlockProps {
  state: 'loading' | 'empty' | 'error'
  message?: string
  hint?: string
  onRetry?: () => void
  /** 空态下的引导动作 (例如「去发现」), 错误态请用 onRetry */
  action?: ReactNode
  /** 骨架屏: 用海报网格的占位替代转圈, 减少布局跳动 */
  variant?: 'inline' | 'skeleton'
  skeletonCount?: number
}

export function StateBlock({
  state,
  message,
  hint,
  onRetry,
  action,
  variant = 'inline',
  skeletonCount = 6,
}: StateBlockProps) {
  if (state === 'loading' && variant === 'skeleton') {
    return (
      <div className="skeleton-grid" aria-busy="true" aria-label="加载中">
        {Array.from({ length: skeletonCount }, (_, index) => (
          <div className="skeleton-card" key={index}>
            <div className="skeleton-card__poster" />
            <div className="skeleton-card__line" />
            <div className="skeleton-card__line skeleton-card__line--short" />
          </div>
        ))}
      </div>
    )
  }

  if (state === 'loading') {
    return (
      <div className="state-block" role="status">
        <Icon name="spinner" size={20} className="state-block__spin" />
        <span>{message ?? '加载中…'}</span>
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div className="state-block state-block--error" role="alert">
        <span className="state-block__title">{message ?? '加载失败'}</span>
        {hint ? <span className="state-block__hint">{hint}</span> : null}
        {onRetry ? (
          <button type="button" className="state-block__retry" onClick={onRetry}>
            <Icon name="refresh" size={15} />
            重试
          </button>
        ) : null}
      </div>
    )
  }

  return (
    <div className="state-block">
      <span className="state-block__title">{message ?? '没有内容'}</span>
      {hint ? <span className="state-block__hint">{hint}</span> : null}
      {action ? <div className="state-block__action">{action}</div> : null}
    </div>
  )
}
