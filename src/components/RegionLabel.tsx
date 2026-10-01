import { useEffect, useMemo, useState } from 'react';
import { resolveReportingAreaId } from '@dolomitinordicski/dns-shared-data';

type ManifestAsset = {
  id: string;
  label: string;
  filename: string;
  priority?: 'primary' | 'secondary';
  entityBindings?: Array<{
    entityType: 'reportingArea' | 'destination' | 'organization';
    entityId: string;
  }>;
};

const MANIFEST_URL =
  'https://dolomitinordicski.github.io/dns-shared-data/brand/regions/manifest.json';
const ASSET_BASE =
  'https://dolomitinordicski.github.io/dns-shared-data/brand/regions';

let promise: Promise<ManifestAsset[]> | null = null;
function loadAssets() {
  if (!promise) {
    promise = fetch(MANIFEST_URL, { cache: 'no-cache' })
      .then(r => r.ok ? r.json() : Promise.reject(new Error(String(r.status))))
      .then(v => Array.isArray(v.assets) ? v.assets : [])
      .catch(() => []);
  }
  return promise;
}

export function RegionLabel({ name, compact = false }: { name: string; compact?: boolean }) {
  const [assets,setAssets] = useState<ManifestAsset[]>([]);
  useEffect(() => { let live=true; void loadAssets().then(v=>live&&setAssets(v)); return()=>{live=false}; },[]);
  const logos = useMemo(() => {
    const id = resolveReportingAreaId(name);
    if (!id) return [];
    return assets
      .filter(a => a.entityBindings?.some(b => b.entityType === 'reportingArea' && b.entityId === id))
      .sort((a,b) => (a.priority === 'primary' ? 0 : 1) - (b.priority === 'primary' ? 0 : 1));
  },[assets,name]);
  return <span className="analytics-region-label">
    {logos.length > 0 && <span className="analytics-region-logos">
      {logos.map(a => <img key={a.id} src={`${ASSET_BASE}/${a.filename}`} alt={a.label} className={compact ? 'is-compact' : ''}/>)}
    </span>}
    <span>{name}</span>
  </span>;
}
