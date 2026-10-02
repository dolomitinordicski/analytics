import type { ReactNode } from 'react';

export function Metric({ label, sublabel, value, note, noteDe, noteIt, top = false }: { label: string; sublabel?: string; value: ReactNode; note?: string; noteDe?: ReactNode; noteIt?: ReactNode; top?: boolean }) {
  return <div className={`analytics-metric ${top ? 'is-top' : ''}`}>
    <div className="analytics-label analytics-lang-de">{label}</div>
    {sublabel && <div className="analytics-sublabel analytics-lang-it">{sublabel}</div>}
    <div className="analytics-metric-value">{value}</div>
    {note && <div className="analytics-note-small">{note}</div>}
    {(noteDe || noteIt) && <div className="analytics-note-small">
      {noteDe && <span className="analytics-lang-de">{noteDe}</span>}
      {noteIt && <span className="analytics-lang-it">{noteIt}</span>}
    </div>}
  </div>;
}

export function SectionHeading({ de, it }: { de: string; it: string }) {
  return <div className="analytics-section-heading">
    <div className="analytics-section-de analytics-lang-de">{de}</div>
    <div className="analytics-section-it analytics-lang-it">{it}</div>
  </div>;
}

export function Card({ title, subtitle, titleDe, titleIt, subtitleDe, subtitleIt, children, accent = false }: { title?: string; subtitle?: string; titleDe?: string; titleIt?: string; subtitleDe?: string; subtitleIt?: string; children: ReactNode; accent?: boolean }) {
  return <article className={`analytics-card ${accent ? 'is-accent' : ''}`} data-dns-reveal>
    <header className="analytics-card-header">
      {(titleDe || titleIt) ? <>
        {titleDe && <div className="analytics-card-title analytics-lang-de">{titleDe}</div>}
        {titleIt && <div className="analytics-card-title analytics-lang-it">{titleIt}</div>}
      </> : title ? <div className="analytics-card-title">{title}</div> : null}
      {(subtitleDe || subtitleIt) ? <>
        {subtitleDe && <div className="analytics-card-subtitle analytics-lang-de">{subtitleDe}</div>}
        {subtitleIt && <div className="analytics-card-subtitle analytics-lang-it">{subtitleIt}</div>}
      </> : subtitle ? <div className="analytics-card-subtitle">{subtitle}</div> : null}
    </header>
    {children}
  </article>;
}

export function Insight({ n, de, it, bodyDe, bodyIt, tag, tagDe, tagIt }: { n: string; de: string; it: string; bodyDe: string; bodyIt: string; tag: string; tagDe?: string; tagIt?: string }) {
  const parts = tag.split(' · ');
  const fallbackDe = parts[0] ?? tag;
  const fallbackIt = parts.length > 1 ? parts.slice(1).join(' · ') : tag;
  return <article className="analytics-insight" data-dns-reveal>
    <div className="analytics-insight-n">{n}</div>
    <div>
      <div className="analytics-card-title analytics-lang-de">{de}</div>
      <div className="analytics-card-subtitle analytics-lang-it">{it}</div>
      <p className="analytics-insight-body analytics-lang-de">{bodyDe}</p>
      <p className="analytics-insight-body is-it analytics-lang-it">{bodyIt}</p>
      <span className="analytics-tag"><BilingualText de={tagDe ?? fallbackDe} it={tagIt ?? fallbackIt}/></span>
    </div>
  </article>;
}


export function EditorialSummary({de,it}:{de:string;it:string}) {
  return <aside className="dns-insight analytics-editorial-summary" data-dns-reveal>
    <div className="dns-insight-body">
      <p className="analytics-lang-de">{de}</p>
      <p className="analytics-lang-it">{it}</p>
    </div>
  </aside>;
}

export function Alert({title, children, variant = 'info'}:{title?:string;children:ReactNode;variant?:'info'|'success'|'warning'|'error'}) {
  return <aside className="dns-alert" data-variant={variant} role={variant === 'error' || variant === 'warning' ? 'alert' : 'status'}>
    <div>
      {title && <div className="dns-alert-title">{title}</div>}
      <div className="dns-alert-body">{children}</div>
    </div>
  </aside>;
}

const methodologyLabels:Record<string,{de:string;it:string}>={
  observed:{de:'Beobachtet',it:'Osservato'},
  derived:{de:'Abgeleitet',it:'Derivato'},
  'external-source':{de:'Externe Quelle',it:'Fonte esterna'},
  assumption:{de:'Annahme',it:'Assunzione'},
  limitation:{de:'Grenze',it:'Limite'},
};

export function MethodologyPanel({titleDe,titleIt,items}:{titleDe:string;titleIt:string;items:Array<{
  key:string;labelDe:string;labelIt:string;value:string;classification:string;source:string;sourceYear?:string;sourceUrl?:string;noteDe:string;noteIt:string;
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
          <span className={`analytics-methodology-kind is-${item.classification}`}>
            <span className="analytics-lang-de">{methodologyLabels[item.classification]?.de ?? item.classification}</span>
            <span className="analytics-lang-it">{methodologyLabels[item.classification]?.it ?? item.classification}</span>
          </span>
        </div>
        <div className="analytics-card-subtitle analytics-lang-it">{item.labelIt}</div>
        <div className="analytics-methodology-value">{item.value}</div>
        <p className="analytics-lang-de">{item.noteDe}</p>
        <p className="analytics-lang-it">{item.noteIt}</p>
        <div className="analytics-methodology-source">
          <BilingualText de="Quelle:" it="Fonte:"/> {item.source}{item.sourceYear ? ` · ${item.sourceYear}` : ''}
          {item.sourceUrl && <> · <a href={item.sourceUrl} target="_blank" rel="noreferrer"><BilingualText de="Quelle öffnen" it="Apri fonte"/></a></>}
        </div>
      </div>)}
    </div>
  </article>;
}


export type AnalyticsSourceState = 'live'|'public'|'compatibility'|'historical'|'fair';

export function SourceBadge({state,de,it,children}:{state:AnalyticsSourceState;de?:ReactNode;it?:ReactNode;children?:ReactNode}) {
  return <div className={`analytics-source-badge is-${state}`} data-analytics-source={state}>
    {(de || it) ? <BilingualText de={de ?? ''} it={it ?? ''}/> : children}
  </div>;
}


export function BilingualText({de,it,className=''}:{de:ReactNode;it:ReactNode;className?:string}) {
  return <>
    <span className={`analytics-lang-de ${className}`.trim()}>{de}</span>
    <span className={`analytics-lang-it ${className}`.trim()}>{it}</span>
  </>;
}
