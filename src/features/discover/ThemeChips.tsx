import { Link } from 'react-router-dom'
import type { FilterRow } from '@/api/types'
import { Chip } from '@/components/ui/Chip'
import { Icon } from '@/components/ui/Icon'
import './theme-chips.css'

export interface ThemeChipsProps {
  row: FilterRow | undefined
  value: string
  onChange: (next: string) => void
}

/** 一行露出的主题数, 其余的去「探索」页找 */
const VISIBLE = 14

export function ThemeChips({ row, value, onChange }: ThemeChipsProps) {
  if (!row || row.items.length === 0) return null

  return (
    <div className="theme-chips">
      <div className="theme-chips__track scroll-x">
        <Chip active={value === ''} onClick={() => onChange('')}>
          全部
        </Chip>
        {row.items.slice(0, VISIBLE).map((item) => (
          <Chip key={item.id} active={value === item.id} onClick={() => onChange(item.id)}>
            {item.name}
          </Chip>
        ))}
      </div>
      <Link className="theme-chips__more" to="/explore">
        更多筛选
        <Icon name="chevronRight" size={14} />
      </Link>
    </div>
  )
}
