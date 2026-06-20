'use client';

import { useState } from 'react';
import { useAppStore } from '../lib/store';
import { Design } from '../lib/types';

export function DesignImportModal({ onClose }: { onClose: () => void }) {
  const { addDesign, drivers } = useAppStore();
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleImport = () => {
    setError(null);
    setSuccess(null);

    try {
      const parsed = JSON.parse(jsonText);
      
      // Support multiple formats
      let designsToImport: Partial<Design>[] = [];
      
      if (Array.isArray(parsed)) {
        // Direct array of designs
        designsToImport = parsed;
      } else if (parsed.designs && Array.isArray(parsed.designs)) {
        // Wrapped in { designs: [...] }
        designsToImport = parsed.designs;
      } else if (parsed.id && parsed.name) {
        // Single design object
        designsToImport = [parsed];
      } else {
        throw new Error('Invalid format. Expected an array of designs or an object with a "designs" property.');
      }

      if (designsToImport.length === 0) {
        throw new Error('No designs found in the JSON.');
      }

      let imported = 0;
      let skipped = 0;

      designsToImport.forEach((design) => {
        // Validate required fields
        if (!design.name || !design.driverId || !design.type) {
          console.warn('Skipping invalid design:', design);
          skipped++;
          return;
        }

        // Check if driver exists
        const driverExists = drivers.find(d => d.id === design.driverId);
        if (!driverExists) {
          console.warn(`Skipping design "${design.name}" - driver not found:`, design.driverId);
          skipped++;
          return;
        }

        try {
          // Remove the old id and let addDesign generate a new one
          const { id, ...designData } = design;
          
          addDesign({
            name: designData.name!,
            driverId: designData.driverId!,
            type: designData.type!,
            vb: designData.vb || 0,
            fb: designData.fb || 0,
            nod: designData.nod || 1,
            np: designData.np || 1,
            isDisplayed: false,
            box: designData.box || {
              width: { cm: 30, in: 11.81 },
              height: { cm: 30, in: 11.81 },
              depth: { cm: 30, in: 11.81 },
            },
            port: designData.port || {
              area: { cm: 0, in: 0 },
              width: { cm: 0, in: 0 },
              height: { cm: 0, in: 0 },
            },
            dmin: designData.dmin || {
              actual: { cm: 0, in: 0 },
              rec: { cm: 0, in: 0 },
              outer: { cm: 0, in: 0 },
            },
            bracing: designData.bracing || { cm: 2.54, in: 1 },
            lv: designData.lv || { cm: 0, in: 0 },
            splData: { dataset: [] }, // Will be recalculated
          });
          
          imported++;
        } catch (err) {
          console.error('Error importing design:', err);
          skipped++;
        }
      });

      if (imported > 0) {
        setSuccess(`✅ Successfully imported ${imported} design${imported > 1 ? 's' : ''}${skipped > 0 ? ` (${skipped} skipped)` : ''}`);
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError('No designs could be imported. Check that the required drivers exist.');
      }
    } catch (err) {
      setError(`❌ ${err instanceof Error ? err.message : 'Invalid JSON format'}`);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4 text-gray-900">Import Designs</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Paste JSON Data
            </label>
            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder='Paste JSON here (e.g., [{"name": "My Design", "driverId": "...", ...}])'
              className="w-full h-64 p-3 border border-gray-300 rounded-lg font-mono text-sm text-gray-900 bg-white"
            />
            <p className="text-xs text-gray-500 mt-2">
              Import designs from a JSON file. Note: The required drivers must already exist in your library.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
              {success}
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <button
              onClick={handleImport}
              disabled={!jsonText.trim()}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
            >
              Import Designs
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
