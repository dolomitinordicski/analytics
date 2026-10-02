import { createPortal } from 'react-dom';
import { DNS_SHARED_PRINT_LOGO_URL } from '../services/foundation';

export function AnalyticsPrintSheet({ active, title, language, children }:{ active:boolean; title:string; language:'de'|'it'; children:React.ReactNode }) {
  if (!active) return null;
  return createPortal(
    <section className="dns-print-sheet">
      <header className="dns-print-document-header">
        <img className="dns-print-logo" src={DNS_SHARED_PRINT_LOGO_URL} alt="Dolomiti NordicSki"/>
        <div>
          <h1 className="dns-print-title">DNS Analytics · {title}</h1>
          <div className="dns-print-meta">{language==='de'?'WS 2025-26':'SI 2025-26'} · {new Date().toLocaleDateString(language==='de'?'de-DE':'it-IT')}</div>
        </div>
      </header>
      <div className="analytics-print-content">{children}</div>
    </section>,
    document.body,
  );
}
