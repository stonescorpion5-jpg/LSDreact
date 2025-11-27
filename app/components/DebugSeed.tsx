'use client';

import { useEffect, useState } from 'react';
import { enrichDriver } from '../lib/calculations';
import { seedDrivers } from '../lib/seedData';

export function DebugSeed() {
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    try {
      const STORAGE_KEY = 'lsd-store-v1';
      const SEED_KEY = 'lsd-store-seeded';

      const isSeeded = localStorage.getItem(SEED_KEY);
      const storedData = localStorage.getItem(STORAGE_KEY);

      let info = '';
      info += `SEED_KEY: ${isSeeded}\n`;
      info += `STORAGE_KEY exists: ${!!storedData}\n`;
      info += `seedDrivers.length: ${seedDrivers.length}\n`;

      if (seedDrivers.length > 0) {
        const driver = seedDrivers[0];
        info += `\nFirst seed driver:\n`;
        info += `  brand: ${driver.brand}\n`;
        info += `  model: ${driver.model}\n`;

        try {
          const enriched = enrichDriver({ id: 'test-1', ...driver });
          info += `\nEnriched successfully:\n`;
          info += `  brandModel: ${enriched.brandModel}\n`;
          info += `  SPL: ${enriched.spl}\n`;
        } catch (e) {
          info += `\nEnrich error: ${e}\n`;
        }
      }

      setDebugInfo(info);
      console.log(info);
    } catch (e) {
      setDebugInfo(`Error: ${e}`);
    }
  }, []);

  return (
    <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '12px', padding: '10px', background: '#f0f0f0' }}>
      {debugInfo || 'Loading...'}
    </div>
  );
}
