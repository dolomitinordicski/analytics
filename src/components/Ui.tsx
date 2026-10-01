import type { ReactNode } from 'react';

export function Metric({ label, sublabel, value, note, top = false }: { label: string; sublabel?: string; value: ReactNode; note?: string; top?: boolean }) {
  return <div className={`analytics-metric ${top ? 'is-top' : ''}`}>
    <div className="analytics-label">{label}</div>
    {sublabel && <div className="analytics-sublabel">{sublabel}</div>}
    <div className="analytics-metric-value">{value}</div>
    {note && <div className="analytics-note-small">{note}</div>}
  </div>;
}

export function SectionHeading({ de, it }: { de: string; it: string }) {
  return <div className="analytics-section-heading">
    <div className="analytics-section-de">{de}</div>
    <div className="analytics-section-it">{it}</div>
  </div>;
}

export function Card({ title, subtitle, children, accent = false }: { title: string; subtitle?: string; children: ReactNode; accent?: boolean }) {
  return <article className={`analytics-card ${accent ? 'is-accent' : ''}`} data-dns-reveal>
    <header className="analytics-card-header">
      <div className="analytics-card-title">{title}</div>
      {subtitle && <div className="analytics-card-subtitle">{subtitle}</div>}
    </header>
    {children}
  </article>;
}

export function Insight({ n, de, it, bodyDe, bodyIt, tag }: { n: string; de: string; it: string; bodyDe: string; bodyIt: string; tag: string }) {
  return <article className="analytics-insight" data-dns-reveal>
    <div className="analytics-insight-n">{n}</div>
    <div>
      <div className="analytics-card-title">{de}</div>
      <div className="analytics-card-subtitle">{it}</div>
      <p className="analytics-insight-body">{bodyDe}</p>
      <p className="analytics-insight-body is-it">{bodyIt}</p>
      <span className="analytics-tag">{tag}</span>
    </div>
  </article>;
}
