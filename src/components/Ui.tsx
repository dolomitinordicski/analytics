import type { ReactNode } from 'react';

export function Metric({ label, sublabel, value, note, top = false }: { label: string; sublabel?: string; value: ReactNode; note?: string; top?: boolean }) {
  return <div className={`analytics-metric ${top ? 'is-top' : ''}`}>
    <div className="analytics-label analytics-lang-de">{label}</div>
    {sublabel && <div className="analytics-sublabel analytics-lang-it">{sublabel}</div>}
    <div className="analytics-metric-value">{value}</div>
    {note && <div className="analytics-note-small">{note}</div>}
  </div>;
}

export function SectionHeading({ de, it }: { de: string; it: string }) {
  return <div className="analytics-section-heading">
    <div className="analytics-section-de analytics-lang-de">{de}</div>
    <div className="analytics-section-it analytics-lang-it">{it}</div>
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
      <div className="analytics-card-title analytics-lang-de">{de}</div>
      <div className="analytics-card-subtitle analytics-lang-it">{it}</div>
      <p className="analytics-insight-body analytics-lang-de">{bodyDe}</p>
      <p className="analytics-insight-body is-it analytics-lang-it">{bodyIt}</p>
      <span className="analytics-tag">{tag}</span>
    </div>
  </article>;
}


export function EditorialSummary({de,it}:{de:string;it:string}) {
  return <div className="analytics-editorial-summary" data-dns-reveal>
    <p className="analytics-lang-de">{de}</p>
    <p className="analytics-lang-it">{it}</p>
  </div>;
}

export function MethodologyPanel({titleDe,titleIt,items}:{titleDe:string;titleIt:string;items:Array<{
  key:string;labelDe:string;labelIt:string;value:string;classification:string;source:string;noteDe:string;noteIt:string;
}>}) {
  return <article className="analytics-methodology" data-dns-reveal>
    <header>
      <div className="analytics-card-title analytics-lang-de">{titleDe}</div>
      <div className="analytics-card-subtitle analytics-lang-it">{titleIt}</div>
    </header>
    <div className="analytics-methodology-grid">
      {items.map(item=><div key={item.key} className="analytics-methodology-item">
        <div className="analytics-methodology-topline">
          <strong>{item.labelDe}</strong>
          <span className={`analytics-methodology-kind is-${item.classification}`}>{item.classification}</span>
        </div>
        <div className="analytics-card-subtitle analytics-lang-it">{item.labelIt}</div>
        <div className="analytics-methodology-value">{item.value}</div>
        <p className="analytics-lang-de">{item.noteDe}</p>
        <p className="analytics-lang-it">{item.noteIt}</p>
        <div className="analytics-methodology-source">Quelle · Fonte: {item.source}</div>
      </div>)}
    </div>
  </article>;
}
