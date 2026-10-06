import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import './poster.css'

export interface PosterProps {
  /** 已经过 /img 代理转换的封面地址 */
  src: string
  alt: string
  className?: string
  /** 叠在海报上的角标 (名次 / 集数 / 热度) */
  children?: ReactNode
}

type LoadState = 'loading' | 'ready' | 'error'

/**
 * 3:4 海报位。封面来自外网且是 HEIC 转码, 必然有等待和失败,
 * 所以加载中走微光占位、失败退回首字色块, 避免出现破图。
 */
export function Poster({ src, alt, className, children }: PosterProps) {
  const [state, setState] = useState<LoadState>('loading')

  // 列表复用时 src 会变, 不重置就会拿上一张的 ready 状态闪一下旧图
  useEffect(() => {
    setState(src ? 'loading' : 'error')
  }, [src])

  return (
    <div className={className ? `poster ${className}` : 'poster'}>
      {state === 'ready' ? null : (
        <div className="poster__ph" data-kind={state} aria-hidden="true">
          {state === 'error' ? <span className="poster__initial">{alt.slice(0, 1)}</span> : null}
        </div>
      )}
      {src ? (
        <img
          className="poster__img"
          data-state={state}
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setState('ready')}
          onError={() => setState('error')}
        />
      ) : null}
      {children ? <div className="poster__overlay">{children}</div> : null}
    </div>
  )
}
