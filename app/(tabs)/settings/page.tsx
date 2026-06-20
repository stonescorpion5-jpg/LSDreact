'use client';

import { useUnitSystem } from '../../../lib/useUnitSystem';
import { useAppStore } from '../../lib/store';
import { ExportModal } from '../../components/ExportModal';
import { useState } from 'react';

export default function SettingsPage() {
  const { unitSystem, setUnitSystem, isHydrated } = useUnitSystem();
  const { designs, drivers } = useAppStore();
  const [showExport, setShowExport] = useState(false);
  const [defaultType, setDefaultType] = useState<'Ported' | 'Sealed'>(
    (typeof window !== 'undefined' ? localStorage.getItem('defaultDesignType') : null) as 'Ported' | 'Sealed' || 'Ported'
  );

  const handleDefaultTypeChange = (type: 'Ported' | 'Sealed') => {
    setDefaultType(type);
    localStorage.setItem('defaultDesignType', type);
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to delete ALL designs and drivers? This cannot be undone!')) {
      if (confirm('Really delete everything? This is your last chance!')) {
        localStorage.clear();
        window.location.reload();
      }
    }
  };

  if (!isHydrated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 pb-20 max-w-3xl">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-900">Settings</h1>

      <div className="space-y-4 sm:space-y-6">
        {/* Unit System */}
        <div className="bg-white rounded-lg p-4 sm:p-6 border">
          <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-gray-900">Unit System</h2>
          <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
            Choose your preferred unit system for measurements
          </p>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={() => setUnitSystem('cm')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                unitSystem === 'cm'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Metric (cm, L)
            </button>
            <button
              onClick={() => setUnitSystem('in')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                unitSystem === 'in'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Imperial (in, ft³)
            </button>
          </div>
        </div>

        {/* Default Design Type */}
        <div className="bg-white rounded-lg p-6 border">
          <h2 className="text-lg font-semibold mb-3 text-gray-900">Default Design Type</h2>
          <p className="text-sm text-gray-600 mb-4">
            Choose the default enclosure type when creating new designs
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => handleDefaultTypeChange('Ported')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                defaultType === 'Ported'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Ported (Bass Reflex)
            </button>
            <button
              onClick={() => handleDefaultTypeChange('Sealed')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                defaultType === 'Sealed'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Sealed (Closed Box)
            </button>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white rounded-lg p-6 border">
          <h2 className="text-lg font-semibold mb-3 text-gray-900">Data Management</h2>
          <p className="text-sm text-gray-600 mb-4">
            Export or clear your data
          </p>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Export All Data</p>
                <p className="text-xs text-gray-500">
                  {designs.length} designs + {drivers.length} drivers
                </p>
              </div>
              <button
                onClick={() => setShowExport(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
              >
                Export
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
              <div>
                <p className="font-medium text-red-900">Clear All Data</p>
                <p className="text-xs text-red-600">
                  Delete all designs, drivers, and settings (cannot be undone)
                </p>
              </div>
              <button
                onClick={handleClearAll}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="bg-white rounded-lg p-6 border">
          <h2 className="text-lg font-semibold mb-3 text-gray-900">About</h2>
          <div className="text-sm text-gray-600 space-y-2">
            <p>
              <strong className="text-gray-900">Loudspeaker Design</strong>
            </p>
            <p>Version 2.0</p>
            <p>
              A tool for designing loudspeaker enclosures using Thiele-Small parameters.
              Supports both ported (bass reflex) and sealed (closed box) designs.
            </p>
            <p className="pt-2 text-xs">
              Built with Next.js, React, and TypeScript
            </p>
          </div>
        </div>
      </div>

      {showExport && <ExportModal onClose={() => setShowExport(false)} />}
    </div>
  );
}
