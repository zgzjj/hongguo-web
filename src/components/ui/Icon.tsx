import type { ReactNode } from 'react'

export type IconName =
  | 'home'
  | 'rank'
  | 'explore'
  | 'heart'
  | 'heartFilled'
  | 'history'
  | 'settings'
  | 'search'
  | 'back'
  | 'chevronRight'
  | 'chevronDown'
  | 'play'
  | 'pause'
  | 'close'
  | 'fire'
  | 'prev'
  | 'next'
  | 'refresh'
  | 'spinner'
  | 'volume'
  | 'volumeMute'
  | 'brightness'
  | 'fullscreen'
  | 'fullscreenExit'
  | 'pip'
  | 'check'

/** 统一 24×24 线性图标, 颜色跟随 currentColor。实心图标在 path 上自行覆盖 fill/stroke。 */
const ICONS: Record<IconName, ReactNode> = {
  home: <path d="M3 10.6 12 3.2l9 7.4V20a1.4 1.4 0 0 1-1.4 1.4H15v-6.6H9v6.6H4.4A1.4 1.4 0 0 1 3 20z" />,
  rank: (
    <>
      <path d="M5.5 20.5V10" />
      <path d="M12 20.5V3.5" />
      <path d="M18.5 20.5v-7" />
    </>
  ),
  explore: (
    <>
      <circle cx="12" cy="12" r="9.2" />
      <path d="m15.8 8.2-2.2 5.4-5.4 2.2 2.2-5.4z" />
    </>
  ),
  heart: (
    <path d="M20.6 5.9a5.1 5.1 0 0 0-7.2 0L12 7.3l-1.4-1.4a5.1 5.1 0 1 0-7.2 7.2L12 21.7l8.6-8.6a5.1 5.1 0 0 0 0-7.2z" />
  ),
  heartFilled: (
    <path
      d="M20.6 5.9a5.1 5.1 0 0 0-7.2 0L12 7.3l-1.4-1.4a5.1 5.1 0 1 0-7.2 7.2L12 21.7l8.6-8.6a5.1 5.1 0 0 0 0-7.2z"
      fill="currentColor"
      stroke="none"
    />
  ),
  history: (
    <>
      <circle cx="12" cy="12" r="9.2" />
      <path d="M12 6.8V12l3.6 2.2" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3.1" />
      <path d="M19.5 14.6a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.9 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.2a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.9l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.9-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.9l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1h.2a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7.2" />
      <path d="m20.5 20.5-4.4-4.4" />
    </>
  ),
  back: <path d="M19 12H5m7 7-7-7 7-7" />,
  chevronRight: <path d="m9.5 18 6-6-6-6" />,
  chevronDown: <path d="m6 9.5 6 6 6-6" />,
  play: <path d="M7.5 4.8v14.4L19.5 12z" fill="currentColor" stroke="none" />,
  pause: (
    <path
      d="M7 4.5h3.4v15H7zM13.6 4.5H17v15h-3.4z"
      fill="currentColor"
      stroke="none"
    />
  ),
  close: <path d="M18.5 5.5 5.5 18.5m0-13 13 13" />,
  fire: (
    <path
      d="M12 2.5s4.6 4.4 4.6 8.6a4.6 4.6 0 0 1-9.2 0c0-1.1.5-2.1.5-2.1s-2 1.7-2 5.2a6.6 6.6 0 0 0 13.2 0c0-5.6-7.1-11.7-7.1-11.7z"
      fill="currentColor"
      stroke="none"
    />
  ),
  prev: (
    <path
      d="M18.5 5.5 9.5 12l9 6.5zM5.5 5v14"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1.6"
    />
  ),
  next: (
    <path
      d="M5.5 5.5 14.5 12l-9 6.5zM18.5 5v14"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1.6"
    />
  ),
  refresh: (
    <>
      <path d="M20.5 12a8.5 8.5 0 1 1-2.6-6.1" />
      <path d="M20.5 3.5V9h-5.5" />
    </>
  ),
  spinner: <circle cx="12" cy="12" r="9" strokeDasharray="42 14" />,
  volume: (
    <>
      <path d="M11 4.5 6.5 8.6H3v6.8h3.5L11 19.5z" />
      <path d="M15 9.4a3.6 3.6 0 0 1 0 5.2" />
      <path d="M17.8 6.6a7.4 7.4 0 0 1 0 10.8" />
    </>
  ),
  volumeMute: (
    <>
      <path d="M11 4.5 6.5 8.6H3v6.8h3.5L11 19.5z" />
      <path d="m16 9.5 4.5 5m0-5-4.5 5" />
    </>
  ),
  brightness: (
    <>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5.3 5.3l1.7 1.7M17 17l1.7 1.7M18.7 5.3 17 7M7 17l-1.7 1.7" />
    </>
  ),
  fullscreen: (
    <path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" />
  ),
  fullscreenExit: (
    <path d="M9 4v5H4M20 9h-5V4M15 20v-5h5M4 15h5v5" />
  ),
  pip: (
    <>
      <path d="M20.5 5.5v13a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1v-13a1 1 0 0 1 1-1h15a1 1 0 0 1 1 1z" />
      <path d="M13 12.5h6v4h-6z" fill="currentColor" stroke="none" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
}

export interface IconProps {
  name: IconName
  size?: number
  className?: string
}

export function Icon({ name, size = 22, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {ICONS[name]}
    </svg>
  )
}
