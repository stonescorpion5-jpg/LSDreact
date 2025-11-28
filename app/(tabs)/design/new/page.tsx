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
  const [focusedDesignId, setFocusedDesignId] = useState<string | null>(null);

  const toggleDesign = (designId: string) => {
    const newSelected = new Set(selectedDesigns);
    if (newSelected.has(designId)) {
      newSelected.delete(designId);
      // If we're removing the focused design, clear it
      if (focusedDesignId === designId) {
        setFocusedDesignId(null);
      }
    } else {
      newSelected.add(designId);
      // Auto-focus on the newly selected design
      setFocusedDesignId(designId);
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
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-lg p-6 text-gray-900 border flex-1 flex flex-col">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">Designs</h2>
            
            <div className="flex-1">
              {designs.length === 0 ? (
                <p className="text-sm text-gray-600">No designs yet. Create one to compare.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {designs.map((design) => (
                    <div
                      key={design.id}
                      className={`flex items-start gap-3 p-3 rounded border transition-colors ${
                        focusedDesignId === design.id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedDesigns.has(design.id)}
                        onChange={() => {
                          toggleDesign(design.id);
                          setFocusedDesignId(design.id);
                        }}
                        className="w-4 h-4 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      />
                      <div className="flex-1 min-w-0 pointer-events-none select-none">
                        <div className="font-medium text-gray-900">{design.name}</div>
                        <div className="text-xs text-gray-600">
                          {drivers.find((d) => d.id === design.driverId)?.brandModel}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Plus Button for New Design */}
            <button
              onClick={() => setActiveTab('design')}
              className="mt-4 w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <span className="text-lg">+</span>
              <span>New Design</span>
            </button>
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
                  {!focusedDesignId ? (
                    <p className="text-gray-500 text-center py-8">Select a design to view box dimensions</p>
                  ) : (
                    (() => {
                      const design = designs.find((d) => d.id === focusedDesignId);
                      if (!design) return <p className="text-gray-500 text-center py-8">Design not found</p>;
                      return (
                        <div className="space-y-4">
                          <h3 className="font-semibold text-gray-900">{design.name}</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="border rounded-lg p-4 bg-gray-50">
                              <p className="text-xs text-gray-600 mb-1">Width</p>
                              <p className="text-lg font-semibold text-gray-900">{design.box.width.cm.toFixed(2)} cm</p>
                              <p className="text-sm text-gray-600">{design.box.width.in.toFixed(2)} in</p>
                            </div>
                            <div className="border rounded-lg p-4 bg-gray-50">
                              <p className="text-xs text-gray-600 mb-1">Height</p>
                              <p className="text-lg font-semibold text-gray-900">{design.box.height.cm.toFixed(2)} cm</p>
                              <p className="text-sm text-gray-600">{design.box.height.in.toFixed(2)} in</p>
                            </div>
                            <div className="border rounded-lg p-4 bg-gray-50">
                              <p className="text-xs text-gray-600 mb-1">Depth</p>
                              <p className="text-lg font-semibold text-gray-900">{design.box.depth.cm.toFixed(2)} cm</p>
                              <p className="text-sm text-gray-600">{design.box.depth.in.toFixed(2)} in</p>
                            </div>
                          </div>
                        </div>
                      );
                    })()
                  )}
                </div>
              )}

              {/* Port Tab */}
              {activeTab === 'port' && (
                <div>
                  {!focusedDesignId ? (
                    <p className="text-gray-500 text-center py-8">Select a design to view port specifications</p>
                  ) : (
                    (() => {
                      const design = designs.find((d) => d.id === focusedDesignId);
                      if (!design) return <p className="text-gray-500 text-center py-8">Design not found</p>;
                      return (
                        <div className="space-y-4">
                          <h3 className="font-semibold text-gray-900">{design.name}</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="border rounded-lg p-4 bg-gray-50">
                              <p className="text-xs text-gray-600 mb-1">Min Dia (Rec)</p>
                              <p className="text-lg font-semibold text-gray-900">{design.dmin.rec.cm.toFixed(2)} cm</p>
                            </div>
                            <div className="border rounded-lg p-4 bg-gray-50">
                              <p className="text-xs text-gray-600 mb-1">Min Dia (Act)</p>
                              <p className="text-lg font-semibold text-gray-900">{design.dmin.actual.cm.toFixed(2)} cm</p>
                            </div>
                            <div className="border rounded-lg p-4 bg-gray-50">
                              <p className="text-xs text-gray-600 mb-1">Port Area</p>
                              <p className="text-lg font-semibold text-gray-900">{design.port.area.cm.toFixed(2)} cm²</p>
                            </div>
                            <div className="border rounded-lg p-4 bg-gray-50">
                              <p className="text-xs text-gray-600 mb-1">Port Length</p>
                              <p className="text-lg font-semibold text-gray-900">{design.lv.cm.toFixed(2)} cm</p>
                            </div>
                            <div className="border rounded-lg p-4 bg-gray-50">
                              <p className="text-xs text-gray-600 mb-1">Port Width</p>
                              <p className="text-lg font-semibold text-gray-900">{design.port.width.cm.toFixed(2)} cm</p>
                            </div>
                            <div className="border rounded-lg p-4 bg-gray-50">
                              <p className="text-xs text-gray-600 mb-1">Port Height</p>
                              <p className="text-lg font-semibold text-gray-900">{design.port.height.cm.toFixed(2)} cm</p>
                            </div>
                          </div>
                        </div>
                      );
                    })()
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
