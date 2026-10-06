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

/** 横向可滚动的一行 chip, 隐藏滚动条 */
export function ChipRow({ children, label }: ChipRowProps) {
  return (
    <div className="chip-row">
      {label ? <span className="chip-row__label">{label}</span> : null}
      <div className="chip-row__track scroll-x">{children}</div>
    </div>
  )
}
