import React from 'react'
import { Link } from 'react-router-dom'

export function StatusBadge({ value }) {
  if (!value) return null
  const cls = value.toLowerCase()
  return <span className={`badge ${cls}`}>{value.replace('_', ' ')}</span>
}

export function PageHead({ eyebrow, title, sub }) {
  return (
    <div className="page-head">
      {eyebrow && <div className="eyebrow">{eyebrow}</div>}
      <h1>{title}</h1>
      {sub && <p>{sub}</p>}
    </div>
  )
}

export function EmptyState({ text }) {
  return <div className="empty-state">{text}</div>
}

export function initials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/).slice(0, 2)
  return parts.map((w) => w[0]).join('').toUpperCase()
}

export function Avatar({ name, size = 42, className = '' }) {
  return (
    <div
      className={`flex items-center justify-center rounded-full bg-gold-soft text-ink font-display font-bold shrink-0 ${className}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
    >
      {initials(name)}
    </div>
  )
}

const ACCENTS = {
  gold: 'bg-gold-soft text-gold',
  teal: 'bg-teal-soft text-teal',
  red: 'bg-[#F5DCD3] text-red',
  ink: 'bg-ink/[0.06] text-ink',
}

export function StatCard({ icon: Icon, label, value, sub, accent = 'ink' }) {
  return (
    <div className="rounded-[10px] bg-paper-card border border-line p-5 shadow-[0_1px_2px_rgba(20,24,31,0.06),0_8px_24px_rgba(20,24,31,0.06)] flex items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-wider text-text-muted font-semibold mb-2">{label}</div>
        <div className="font-display text-[28px] leading-none font-bold text-ink">{value}</div>
        {sub && <div className="text-xs text-text-muted mt-2">{sub}</div>}
      </div>
      {Icon && (
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${ACCENTS[accent]}`}>
          <Icon size={18} strokeWidth={2} />
        </div>
      )}
    </div>
  )
}

export function QuickLink({ icon: Icon, label, sub, to, onClick, accent = 'ink' }) {
  const Comp = to ? Link : 'button'
  const props = to ? { to } : { onClick, type: 'button' }
  return (
    <Comp
      {...props}
      className="group flex items-center gap-3 rounded-[10px] bg-paper-card border border-line p-4 text-left hover:border-gold hover:-translate-y-0.5 transition-all duration-150 shadow-[0_1px_2px_rgba(20,24,31,0.06)]"
    >
      {Icon && (
        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${ACCENTS[accent]}`}>
          <Icon size={16} strokeWidth={2} />
        </div>
      )}
      <div className="min-w-0">
        <div className="text-[13.5px] font-semibold text-ink">{label}</div>
        {sub && <div className="text-xs text-text-muted">{sub}</div>}
      </div>
    </Comp>
  )
}
