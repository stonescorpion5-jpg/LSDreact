'use client';

import { useAppStore } from '../../../lib/store';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DesignFormEmbedded } from '../../../components/DesignFormEmbedded';
import { ResponseCurve } from '../../../components/ResponseCurve';
import { useState, useMemo } from 'react';

export default function NewDesignPage() {
  const router = useRouter();
  const { designs, drivers } = useAppStore();
  const [selectedDesigns, setSelectedDesigns] = useState<Set<string>>(new Set());

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/design" className="text-blue-600 underline">
          ← Back to Designs
        </Link>
      </div>

      {/* Split Layout: Design buttons on left (1/4), chart on right (3/4) */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 min-h-screen">
        {/* Left Column: Design Selection Buttons (1/4 width on xl and up) */}
        <div>
          <div className="bg-white rounded-lg p-6 text-gray-900 border">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">Designs</h2>
            
            {designs.length === 0 ? (
              <p className="text-sm text-gray-600">No designs yet. Create one to compare.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {designs.map((design) => (
                  <button
                    key={design.id}
                    onClick={() => toggleDesign(design.id)}
                    className={`p-3 rounded border-2 text-left transition-colors ${
                      selectedDesigns.has(design.id)
                        ? 'border-blue-600 bg-blue-50 text-blue-900'
                        : 'border-gray-300 bg-white text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium">{design.name}</div>
                    <div className="text-xs text-gray-600">
                      {drivers.find((d) => d.id === design.driverId)?.brandModel}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Chart and Forms (3/4 width on xl and up) */}
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

          {/* New Design Form and Specs in a Tabular Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* New Design Form */}
            <div className="lg:col-span-1">
              <div className="max-w-md">
                <DesignFormEmbedded
                  onSave={() => {
                    // Refresh the page to show new design in list
                    window.location.reload();
                  }}
                />
              </div>
            </div>

            {/* Design Details for Selected Designs */}
            {selectedDesigns.size > 0 && (
              <div className="lg:col-span-1 space-y-4">
                {Array.from(selectedDesigns)
                  .map((id) => designs.find((d) => d.id === id))
                  .filter((d) => d)
                  .map((design) => (
                    <div key={design!.id} className="border p-4 rounded-lg">
                      <h3 className="font-semibold mb-3 text-gray-900">{design!.name}</h3>

                      {/* Box Dimensions */}
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-gray-700 mb-2">Box Dimensions</p>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="bg-gray-50 p-2 rounded">
                            <p className="text-gray-600">Width</p>
                            <p className="font-semibold">{design!.box.width.cm.toFixed(1)} cm</p>
                          </div>
                          <div className="bg-gray-50 p-2 rounded">
                            <p className="text-gray-600">Height</p>
                            <p className="font-semibold">{design!.box.height.cm.toFixed(1)} cm</p>
                          </div>
                          <div className="bg-gray-50 p-2 rounded">
                            <p className="text-gray-600">Depth</p>
                            <p className="font-semibold">{design!.box.depth.cm.toFixed(1)} cm</p>
                          </div>
                        </div>
                      </div>

                      {/* Port Specifications */}
                      <div>
                        <p className="text-xs font-semibold text-gray-700 mb-2">Port Specs</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-gray-50 p-2 rounded">
                            <p className="text-gray-600">Dia (Rec)</p>
                            <p className="font-semibold">{design!.dmin.rec.cm.toFixed(1)} cm</p>
                          </div>
                          <div className="bg-gray-50 p-2 rounded">
                            <p className="text-gray-600">Dia (Act)</p>
                            <p className="font-semibold">{design!.dmin.actual.cm.toFixed(1)} cm</p>
                          </div>
                          <div className="bg-gray-50 p-2 rounded">
                            <p className="text-gray-600">Area</p>
                            <p className="font-semibold">{design!.port.area.cm.toFixed(1)} cm²</p>
                          </div>
                          <div className="bg-gray-50 p-2 rounded">
                            <p className="text-gray-600">Length</p>
                            <p className="font-semibold">{design!.lv.cm.toFixed(1)} cm</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
