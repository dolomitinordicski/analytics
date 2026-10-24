/**
 * DNS Analytics browser-native report printing.
 * Text, tables and SVG stay native; canvas charts are copied as images because
 * a canvas itself is already raster. No full-page screenshots or jsPDF.
 */
export async function printAnalyticsReport(title: string, language: 'de'|'it'): Promise<void> {
  const source=document.getElementById('analytics-active-panel');
  if(!source) throw new Error('Analytics report not found');
  await document.fonts.ready;
  const frame=document.createElement('iframe');
  frame.title='DNS Analytics print';
  frame.setAttribute('aria-hidden','true');
  frame.style.cssText='position:fixed;left:-10000px;top:0;width:794px;height:1123px;border:0;';
  document.body.appendChild(frame);
  const doc=frame.contentDocument, win=frame.contentWindow;
  if(!doc||!win){frame.remove();throw new Error('Print document unavailable');}
  const styles=Array.from(document.querySelectorAll('link[rel="stylesheet"],style')).map(x=>x.outerHTML).join('\n');
  const logo=document.querySelector<HTMLImageElement>('.dns-tool-header-logo');
  const date=new Date().toLocaleDateString(language==='de'?'de-DE':'it-IT');
  const cloned=source.cloneNode(true) as HTMLElement;
  const canvases=[...source.querySelectorAll('canvas')];
  const copied=[...cloned.querySelectorAll('canvas')];
  canvases.forEach((canvas,i)=>{
    const target=copied[i];
    if(!target)return;
    try{
      const image=doc.createElement('img');
      image.src=canvas.toDataURL('image/png');
      image.alt=canvas.getAttribute('aria-label')||'Analytics chart';
      image.style.cssText='display:block;width:100%;height:auto;max-width:100%;';
      target.replaceWith(image);
    }catch {throw new Error('A chart could not be prepared for printing');}
  });
  doc.open();
  doc.write(`<!doctype html><html lang="${language}"><head><meta charset="utf-8"><base href="${document.baseURI}">${styles}<style>
    @page {size:A4 portrait;margin:12mm 12mm 14mm;}
    html,body {margin:0!important;padding:0!important;background:white!important;min-width:0!important;}
    *,*::before,*::after {-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;}
    .analytics-print-document {width:100%;max-width:100%;font-family:inherit;color:#0D4D5E;}
    .analytics-print-document-header {display:flex;align-items:center;gap:14px;border-bottom:2px solid #0D4D5E;margin-bottom:18px;padding-bottom:12px;}
    .analytics-print-document-header img {max-height:44px;max-width:145px;object-fit:contain;}
    .analytics-print-document-header h1 {font-size:19px;font-weight:800;margin:0;}
    .analytics-print-document-header small {font-size:10px;}
    .analytics-page,.analytics-module,#analytics-active-panel {width:100%!important;max-width:100%!important;padding:0!important;margin:0!important;}
    .analytics-grid-2,.analytics-grid-3,.analytics-metrics,.analytics-insights,.analytics-kpi-stack,.analytics-reference-grid,.analytics-methodology-grid {grid-template-columns:repeat(2,minmax(0,1fr))!important;}
    .analytics-table-wrap {overflow:visible!important;width:100%!important;}
    .analytics-table {min-width:0!important;width:100%!important;font-size:9px;}
    .analytics-card,.analytics-metric,.analytics-insight,.analytics-reference-item,.analytics-methodology-item {break-inside:avoid;page-break-inside:avoid;box-shadow:none!important;}
    h1,h2,h3,h4,.analytics-section-heading {break-after:avoid;page-break-after:avoid;}
    img,svg,canvas {max-width:100%;}
    button,input,select,.analytics-sliders {display:none!important;}
  </style></head><body><article class="analytics-print-document"><header class="analytics-print-document-header">
   ${logo?.src?'<img src="'+logo.src+'" alt="Dolomiti NordicSki">':''}
   <div><h1>DNS Analytics · ${title.replace(/&/g,'&amp;').replace(/</g,'&lt;')}</h1><small>${date}</small></div>
  </header><main id="analytics-print-mount"></main></article></body></html>`);
  doc.close();
  doc.getElementById('analytics-print-mount')?.appendChild(doc.importNode(cloned,true));
  try {
    await Promise.all([doc.fonts.ready,...[...doc.images].map(im=>im.decode?.().catch(()=>undefined))]);
    await new Promise<void>(resolve=>win.requestAnimationFrame(()=>win.requestAnimationFrame(()=>resolve())));
    win.addEventListener('afterprint',()=>frame.remove(),{once:true});
    win.focus();
    win.print();
  } catch(error){frame.remove();throw error;}
}
