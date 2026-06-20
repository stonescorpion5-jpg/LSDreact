'use client';

import { useAppStore } from '../lib/store';
import { useState } from 'react';

type ExportType = 'designs' | 'drivers' | 'all';

export function ExportModal({ onClose }: { onClose: () => void }) {
  const { designs, drivers } = useAppStore();
  const [exportType, setExportType] = useState<ExportType>('all');
  const [exportStatus, setExportStatus] = useState<string>('');

  const handleExport = () => {
    let data: any = {};
    let filename = '';

    switch (exportType) {
      case 'designs':
        data = { designs, exportDate: new Date().toISOString(), version: '1.0' };
        filename = `lsd-designs-${Date.now()}.json`;
        break;
      case 'drivers':
        data = { drivers, exportDate: new Date().toISOString(), version: '1.0' };
        filename = `lsd-drivers-${Date.now()}.json`;
        break;
      case 'all':
        data = { designs, drivers, exportDate: new Date().toISOString(), version: '1.0' };
        filename = `lsd-backup-${Date.now()}.json`;
        break;
    }

    try {
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportStatus(`✅ Exported successfully: ${filename}`);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      setExportStatus(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4 text-gray-900">Export Data</h2>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-3">Select what to export:</p>
            
            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 mb-2">
              <input
                type="radio"
                name="exportType"
                value="all"
                checked={exportType === 'all'}
                onChange={(e) => setExportType(e.target.value as ExportType)}
                className="w-4 h-4"
              />
              <div>
                <p className="font-medium text-gray-900">Everything</p>
                <p className="text-xs text-gray-500">
                  {designs.length} designs + {drivers.length} drivers
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 mb-2">
              <input
                type="radio"
                name="exportType"
                value="designs"
                checked={exportType === 'designs'}
                onChange={(e) => setExportType(e.target.value as ExportType)}
                className="w-4 h-4"
              />
              <div>
                <p className="font-medium text-gray-900">Designs Only</p>
                <p className="text-xs text-gray-500">{designs.length} designs</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="exportType"
                value="drivers"
                checked={exportType === 'drivers'}
                onChange={(e) => setExportType(e.target.value as ExportType)}
                className="w-4 h-4"
              />
              <div>
                <p className="font-medium text-gray-900">Drivers Only</p>
                <p className="text-xs text-gray-500">{drivers.length} drivers</p>
              </div>
            </label>
          </div>

          {exportStatus && (
            <div className={`p-3 rounded-lg text-sm ${exportStatus.startsWith('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              {exportStatus}
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <button
              onClick={handleExport}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Export to JSON
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
