import type { ReactNode } from 'react'
import './card.css'

export default function Card({
  icon,
  title,
  meta,
  footer,
  wide,
  children,
}: {
  icon: string
  title: string
  meta?: string
  footer?: ReactNode
  wide?: boolean
  children: ReactNode
}) {
  return (
    <div className={`card${wide ? ' card-wide' : ''}`}>
      <div className="card-header">
        <div className="card-title">
          <span>{icon}</span> {title}
        </div>
        {meta && <div className="card-meta">{meta}</div>}
      </div>
      {children}
      {footer}
    </div>
  )
}
