'use client';

import { useAppStore } from '../../../lib/store';
import Link from 'next/link';
import { DesignFormEmbedded } from '../../../components/DesignFormEmbedded';
import { ResponseCurve } from '../../../components/ResponseCurve';
import { useState, useMemo } from 'react';

type TabType = 'design' | 'box' | 'port';

export default function NewDesignPage() {
  const { designs, drivers } = useAppStore();
  const [selectedDesigns, setSelectedDesigns] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<TabType>('design');

  const toggleDesign = (designId: string) => {
    const newSelected = new Set(selectedDesigns);
    if (newSelected.has(designId)) {
      newSelected.delete(designId);
    } else {
      newSelected.add(designId);
    }
    setSelectedDesigns(newSelected);
  };

  const datasets = useMemo(() => {
    return Array.from(selectedDesigns)
      .map((id) => designs.find((d) => d.id === id))
      .filter((d) => d && d.splData?.dataset)
      .map((d, i) => ({
        label: d!.name,
        data: d!.splData!.dataset,
      }));
  }, [selectedDesigns, designs]);

  const selectedDesignsList = Array.from(selectedDesigns)
    .map((id) => designs.find((d) => d.id === id))
    .filter((d) => d) as any[];

  if (drivers.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-red-500 mb-4">No drivers available. Please create a driver first.</p>
        <Link href="/driver" className="text-blue-600 underline">
          Go to Drivers
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/design" className="text-blue-600 underline">
          ← Back to Designs
        </Link>
      </div>

      {/* Split Layout: Design buttons on left (1/4), chart on right (3/4) */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 min-h-screen">
        {/* Left Column: Design Selection Checkboxes (1/4 width on xl and up) */}
        <div>
          <div className="bg-white rounded-lg p-6 text-gray-900 border">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">Designs</h2>
            
            {designs.length === 0 ? (
              <p className="text-sm text-gray-600">No designs yet. Create one to compare.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {designs.map((design) => (
                  <label
                    key={design.id}
                    className="flex items-start gap-3 p-3 rounded border border-gray-300 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedDesigns.has(design.id)}
                      onChange={() => toggleDesign(design.id)}
                      className="w-4 h-4 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900">{design.name}</div>
                      <div className="text-xs text-gray-600">
                        {drivers.find((d) => d.id === design.driverId)?.brandModel}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Chart and Tabbed Content (3/4 width on xl and up) */}
        <div className="flex flex-col space-y-6 xl:col-span-3 min-h-96">
          {/* SPL Response Curve */}
          <div className="border p-4 rounded-lg flex flex-col flex-grow min-h-96">
            <h2 className="text-lg font-semibold mb-4">SPL Response Comparison</h2>
            <div className="flex-grow flex items-center justify-center">
              {datasets.length > 0 ? (
                <ResponseCurve datasets={datasets} />
              ) : (
                <p className="text-gray-500">Select designs to compare</p>
              )}
            </div>
          </div>

          {/* Tabbed Content Section - Full Width */}
          <div className="border rounded-lg overflow-hidden">
            {/* Tab Navigation */}
            <div className="flex border-b bg-gray-50">
              <button
                onClick={() => setActiveTab('design')}
                className={`flex-1 px-4 py-3 text-center font-medium transition-colors ${
                  activeTab === 'design'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Design
              </button>
              <button
                onClick={() => setActiveTab('box')}
                className={`flex-1 px-4 py-3 text-center font-medium transition-colors ${
                  activeTab === 'box'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Box
              </button>
              <button
                onClick={() => setActiveTab('port')}
                className={`flex-1 px-4 py-3 text-center font-medium transition-colors ${
                  activeTab === 'port'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Port
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-6 bg-white">
              {/* Design Tab */}
              {activeTab === 'design' && (
                <div className="space-y-6">
                  <div className="max-w-2xl">
                    <DesignFormEmbedded
                      onSave={() => {
                        // Refresh the page to show new design in list
                        window.location.reload();
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Box Tab */}
              {activeTab === 'box' && (
                <div>
                  {selectedDesignsList.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Select designs to view box dimensions</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b bg-gray-50">
                            <th className="px-4 py-3 text-left font-semibold text-gray-900">Design Name</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-900">Width (cm)</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-900">Height (cm)</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-900">Depth (cm)</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-900">Width (in)</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-900">Height (in)</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-900">Depth (in)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedDesignsList.map((design, idx) => (
                            <tr key={design.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="px-4 py-3 font-medium text-gray-900">{design.name}</td>
                              <td className="px-4 py-3 text-gray-700">{design.box.width.cm.toFixed(2)}</td>
                              <td className="px-4 py-3 text-gray-700">{design.box.height.cm.toFixed(2)}</td>
                              <td className="px-4 py-3 text-gray-700">{design.box.depth.cm.toFixed(2)}</td>
                              <td className="px-4 py-3 text-gray-700">{design.box.width.in.toFixed(2)}</td>
                              <td className="px-4 py-3 text-gray-700">{design.box.height.in.toFixed(2)}</td>
                              <td className="px-4 py-3 text-gray-700">{design.box.depth.in.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Port Tab */}
              {activeTab === 'port' && (
                <div>
                  {selectedDesignsList.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Select designs to view port specifications</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b bg-gray-50">
                            <th className="px-4 py-3 text-left font-semibold text-gray-900">Design Name</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-900">Min Dia Rec (cm)</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-900">Min Dia Act (cm)</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-900">Port Area (cm²)</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-900">Port Length (cm)</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-900">Port Width (cm)</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-900">Port Height (cm)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedDesignsList.map((design, idx) => (
                            <tr key={design.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="px-4 py-3 font-medium text-gray-900">{design.name}</td>
                              <td className="px-4 py-3 text-gray-700">{design.dmin.rec.cm.toFixed(2)}</td>
                              <td className="px-4 py-3 text-gray-700">{design.dmin.actual.cm.toFixed(2)}</td>
                              <td className="px-4 py-3 text-gray-700">{design.port.area.cm.toFixed(2)}</td>
                              <td className="px-4 py-3 text-gray-700">{design.lv.cm.toFixed(2)}</td>
                              <td className="px-4 py-3 text-gray-700">{design.port.width.cm.toFixed(2)}</td>
                              <td className="px-4 py-3 text-gray-700">{design.port.height.cm.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
