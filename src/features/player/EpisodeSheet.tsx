import { useEffect, useRef } from 'react'
import type { Episode } from '@/api/types'
import { Icon } from '@/components/ui/Icon'
import { EpisodeGrid } from '@/features/series/EpisodeGrid'

export interface EpisodeSheetProps {
  open: boolean
  title: string
  episodes: Episode[]
  current: number
  onPick: (index: number) => void
  onClose: () => void
}

const FOCUSABLE =
  'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

/** 手机端选集抽屉: 滑动切集是主路径, 这里用于跳远。 */
export function EpisodeSheet({
  open,
  title,
  episodes,
  current,
  onPick,
  onClose,
}: EpisodeSheetProps) {
  const bodyRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    // 记下打开前的焦点, 关闭时还回去, 否则键盘用户会掉到 <body>
    const previous = document.activeElement as HTMLElement | null
    closeRef.current?.focus()

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }
      if (event.key !== 'Tab') return

      // aria-modal 管不住背景元素, Tab 得自己绕圈
      const items = [...(bodyRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])]
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      previous?.focus()
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="ep-sheet" role="dialog" aria-modal="true" aria-label="选集">
      <button type="button" className="ep-sheet__scrim" aria-label="关闭" onClick={onClose} />

      <div className="ep-sheet__body" ref={bodyRef}>
        <header className="ep-sheet__head">
          <div>
            <p className="ep-sheet__title">{title}</p>
            <p className="ep-sheet__count">共 {episodes.length} 集</p>
          </div>
          <button
            type="button"
            className="ep-sheet__close"
            aria-label="关闭"
            onClick={onClose}
            ref={closeRef}
          >
            <Icon name="close" size={18} />
          </button>
        </header>

        <div className="ep-sheet__scroll">
          <EpisodeGrid
            episodes={episodes}
            current={current}
            target={{
              kind: 'button',
              onPick: (index) => {
                onPick(index)
                onClose()
              },
            }}
          />
        </div>
      </div>
    </div>
  )
}
