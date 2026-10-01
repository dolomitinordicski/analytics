import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import type { ChartConfiguration } from 'chart.js';

export function ChartCanvas({ config, height = 210 }: { config: ChartConfiguration; height?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const chart = new Chart(ref.current, config);
    return () => chart.destroy();
  }, [config]);
  return <div style={{ position: 'relative', height }}><canvas ref={ref} /></div>;
}
