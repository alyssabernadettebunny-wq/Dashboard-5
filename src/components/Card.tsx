import type { ReactNode } from 'react'
import './card.css'

export type CardVariant =
  | 'default'
  | 'stickyNote'
  | 'tapedPaper'
  | 'miniWindow'
  | 'linedPaper'
  | 'gingham'
  | 'scrapbook'
  | 'memo'

export type CardSurface = 'pink' | 'lilac' | 'blue' | 'cream' | 'mint' | 'peach' | 'paper'

export default function Card({
  icon,
  title,
  meta,
  footer,
  wide,
  variant = 'default',
  surface,
  anchor,
  children,
}: {
  icon: ReactNode
  title: string
  meta?: string
  footer?: ReactNode
  wide?: boolean
  variant?: CardVariant
  surface?: CardSurface
  /** a decorative illustration anchored to a corner of the card */
  anchor?: ReactNode
  children: ReactNode
}) {
  return (
    <div
      className={`card card-variant-${variant}${wide ? ' card-wide' : ''}${surface ? ` card-surface-${surface}` : ''}`}
    >
      {variant === 'tapedPaper' && <span className="card-tape" aria-hidden="true" />}
      <div className="card-header">
        <div className="card-title">
          <span className="card-title-icon-wrap">{icon}</span> {title}
        </div>
        {meta && <div className="card-meta">{meta}</div>}
      </div>
      {children}
      {footer}
      {anchor && <div className="card-anchor">{anchor}</div>}
    </div>
  )
}
