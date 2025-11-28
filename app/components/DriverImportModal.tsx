'use client';

import React, { useState } from 'react';
import { useAppStore } from '../lib/store';
import { Driver } from '../lib/types';

export function DriverImportModal({ onClose }: { onClose: () => void }) {
  const { addDriver } = useAppStore();
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const parseDriverData = (text: string): Partial<Driver> => {
    let data: Record<string, any> = {};

    // Try to detect format: TSV (tab-separated key-value), JSON, or plain JSON
    if (text.includes('\t') || (text.includes('\n') && text.includes('"') && !text.trim().startsWith('{'))) {
      // Parse TSV format (key\t"value" or key\tvalue)
      const lines = text.trim().split('\n');
      for (const line of lines) {
        const parts = line.split('\t').map(p => p.trim());
        if (parts.length >= 2) {
          const key = parts[0].trim();
          let value = parts[1].trim();
          // Remove quotes if present
          if ((value.startsWith('"') && value.endsWith('"')) || 
              (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
          }
          data[key] = value;
        }
      }
    } else {
      // Try JSON parsing
      data = JSON.parse(text);
      if (Array.isArray(data)) {
        data = data[0]; // Take first driver if array
      }
    }

    // Calculate driver size from diameter (dd) if available
    let size = Number(data.size || data.Size || data.wooferDiameter || data.dd || 0);
    if (size > 100) {
      // If dd is in mm, convert to inches
      size = Math.round((size / 25.4) * 10) / 10;
    }

    // Map common field names to our Driver interface
    const driver: Partial<Driver> = {
      brand: data.brand || data.Brand || '',
      model: data.model || data.Model || '',
      size: size,
      fs: Number(data.fs || data.Fs || data.f0 || 0),
      qms: Number(data.qms || data.Qms || 0),
      qes: Number(data.qes || data.Qes || 0),
      qts: Number(data.qts || data.Qts || 0),
      vas: Number(data.vas || data.Vas || 0),
      xmax: Number(data.xmax || data.Xmax || 0),
      sd: Number(data.sd || data.Sd || 0),
      rms: Number(data.rms || data.Rms || 0),
      re: Number(data.re || data.Re || 0),
      le: Number(data.le || data.Le || data.leb || 0),
      dd3: Number(data.dd3 || data.Dd3 || 0),
      ebp: Number(data.ebp || data.Ebp || 0),
      k1: Number(data.k1 || data.K1 || 0),
      k2: Number(data.k2 || data.K2 || 0),
      n0: Number(data.n0 || data.N0 || 0),
      par: Number(data.par || data.Par || 0),
      peakSPL: Number(data.peakSPL || data.PeakSPL || data.peakSpl || 0),
      per: Number(data.per || data.Per || 0),
      vd: Number(data.vd || data.Vd || 0),
      recPortedVb: Number(data.recPortedVb || data.RecPortedVb || 50),
      recPortedFb: Number(data.recPortedFb || data.RecPortedFb || 45),
      recPortedF3: Number(data.recPortedF3 || data.RecPortedF3 || 40),
      recSealedVb: Number(data.recSealedVb || data.RecSealedVb || 20),
      recSealedFb: Number(data.recSealedFb || data.RecSealedFb || 0),
      recSealedF3: Number(data.recSealedF3 || data.RecSealedF3 || 0),
      recSealedFs: Number(data.recSealedFs || data.RecSealedFs || 0),
      spl: Number(data.spl || data.Spl || 0),
    };

    return driver;
  };

  const handleImport = () => {
    setError('');
    setSuccess('');

    if (!jsonText.trim()) {
      setError('Please paste JSON data');
      return;
    }

    try {
      const driverData = parseDriverData(jsonText);

      // Validate required fields
      if (!driverData.brand || !driverData.model) {
        setError('Driver must have brand and model fields');
        return;
      }

      if (typeof driverData.size !== 'number' || driverData.size === 0) {
        setError('Driver must have a valid size');
        return;
      }

      // Add the driver
      const newDriver = addDriver(driverData as Omit<Driver, 'id'>);
      setSuccess(`✓ Driver "${newDriver.brandModel || `${newDriver.brand} ${newDriver.model}`}" added successfully!`);
      
      // Clear form and close after 2 seconds
      setTimeout(() => {
        setJsonText('');
        onClose();
      }, 2000);
    } catch (err) {
      setError(`Failed to parse JSON: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-screen overflow-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Import Driver from JSON</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Paste Driver Data (JSON, TSV, or Tab-Separated)
            </label>
            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder='Paste data like: {"brand": "B&C Speaker", "model": "10CL51"...} OR key\t"value" format'
              className="w-full h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900 font-semibold mb-2">Supported Formats & Fields:</p>
            <div className="mb-3">
              <p className="text-xs text-blue-800 font-semibold">📋 Format Support:</p>
              <p className="text-xs text-blue-800">• JSON objects: {"{"} "brand": "...", "model": "..." {"}"}</p>
              <p className="text-xs text-blue-800">• TSV (Tab-Separated): key\t"value" or key\tvalue</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-blue-800">
              <div>
                <p>• brand/Brand</p>
                <p>• model/Model</p>
                <p>• size/Size/dd</p>
                <p>• fs/Fs/f0</p>
                <p>• qms/Qms</p>
                <p>• qes/Qes</p>
                <p>• vas/Vas</p>
                <p>• xmax/Xmax</p>
              </div>
              <div>
                <p>• sd/Sd</p>
                <p>• rms/Rms</p>
                <p>• re/Re</p>
                <p>• le/Le/leb</p>
                <p>• peakSPL</p>
                <p>• recPortedVb</p>
                <p>• recPortedF3</p>
                <p>• recSealedVb</p>
                <p>• recSealedF3</p>
                <p>• recSealedFs</p>
                <p>• And more...</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-900">❌ {error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-900">{success}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleImport}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Import Driver
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-300 text-gray-900 rounded-lg font-semibold hover:bg-gray-400 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
