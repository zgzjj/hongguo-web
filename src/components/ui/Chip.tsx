import type { ReactNode } from 'react'
import './chip.css'

export interface ChipProps {
  children: ReactNode
  active?: boolean
  onClick?: () => void
  title?: string
}

export function Chip({ children, active = false, onClick, title }: ChipProps) {
  return (
    <button
      type="button"
      className={active ? 'chip chip--on' : 'chip'}
      onClick={onClick}
      title={title}
      aria-pressed={active}
    >
      {children}
    </button>
  )
}

export interface ChipRowProps {
  children: ReactNode
  label?: string
}

/**
 * 一行 chip。放不下就换行铺开, 不做横向滚动 ——
 * 选项要一眼看得全, 让人先滑动才知道有什么, 等于把一半选项藏起来了。
 */
export function ChipRow({ children, label }: ChipRowProps) {
  return (
    <div className="chip-row">
      {label ? <span className="chip-row__label">{label}</span> : null}
      <div className="chip-row__track">{children}</div>
    </div>
  )
}
