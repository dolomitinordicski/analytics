import { useEffect, useMemo, useState } from 'react';
import {
  findRegionLogosForEntity,
  regionLogoPath,
  resolveReportingAreaId,
  type DNSRegionLogoAsset,
} from '@dolomitinordicski/dns-shared-data';
import { DNS_FOUNDATION_RELEASE_VERSION } from '@dolomitinordicski/dns-shared-data/release';

type Manifest = {
  assets?: DNSRegionLogoAsset[];
};

const FOUNDATION_ASSET_BASE =
  `https://raw.githubusercontent.com/dolomitinordicski/dns-shared-data/foundation-v${DNS_FOUNDATION_RELEASE_VERSION}`;
const MANIFEST_URL = `${FOUNDATION_ASSET_BASE}/brand/regions/manifest.json`;

let manifestPromise: Promise<DNSRegionLogoAsset[]> | null = null;

function loadAssets() {
  if (!manifestPromise) {
    manifestPromise = fetch(MANIFEST_URL, { cache: 'force-cache' })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Region logo manifest HTTP ${response.status}`);
        }
        return response.json() as Promise<Manifest>;
      })
      .then((manifest) => Array.isArray(manifest.assets) ? manifest.assets : [])
      .catch((error) => {
        console.warn('Shared DNS region-logo manifest unavailable', error);
        return [];
      });
  }

  return manifestPromise;
}

export function RegionLabel({ name, compact = false }: { name: string; compact?: boolean }) {
  const [assets, setAssets] = useState<DNSRegionLogoAsset[]>([]);

  useEffect(() => {
    let active = true;
    void loadAssets().then((next) => {
      if (active) setAssets(next);
    });
    return () => {
      active = false;
    };
  }, []);

  const logos = useMemo(() => {
    const reportingAreaId = resolveReportingAreaId(name);
    if (!reportingAreaId) return [];
    return findRegionLogosForEntity(assets, 'reportingArea', reportingAreaId);
  }, [assets, name]);

  return (
    <span className="analytics-region-label">
      {logos.length > 0 && (
        <span className="analytics-region-logos">
          {logos.map((asset) => (
            <img
              key={asset.id}
              src={`${FOUNDATION_ASSET_BASE}/${regionLogoPath(asset)}`}
              alt={asset.label}
              className={compact ? 'is-compact' : ''}
              loading="lazy"
            />
          ))}
        </span>
      )}
      <span>{name}</span>
    </span>
  );
}
