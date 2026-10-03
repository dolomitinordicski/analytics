import { useLayoutEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import type { ChartConfiguration } from 'chart.js';

export function ChartCanvas({ config, height = 210 }: { config: ChartConfiguration; height?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    if (!ref.current) return;

    const isPrintCopy = ref.current.closest('.dns-print-sheet') !== null;
    const chartConfig = isPrintCopy
      ? {
          ...config,
          options: {
            ...config.options,
            animation: false,
          },
        }
      : config;

    const chart = new Chart(ref.current, chartConfig);
    return () => chart.destroy();
  }, [config]);
  return <div style={{ position: 'relative', height }}><canvas ref={ref} /></div>;
}
