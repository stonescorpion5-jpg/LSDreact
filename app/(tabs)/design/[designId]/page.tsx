'use client';

import { useAppStore } from '../../../lib/store';
import { useUnitSystem } from '../../../../lib/useUnitSystem';
import Link from 'next/link';
import { DesignFormEmbedded } from '../../../components/DesignFormEmbedded';
import { ResponseCurve } from '../../../components/ResponseCurve';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams } from 'next/navigation';

type TabType = 'design' | 'box' | 'port';

export default function DesignDetailPage() {
  const params = useParams();
  const designId = params.designId as string;
  const { designs, drivers, editDesign } = useAppStore();
  const { unitSystem, setUnitSystem, isHydrated } = useUnitSystem();
  const [activeTab, setActiveTab] = useState<TabType>('design');
  
  // Local state for box inputs
  const [boxWidth, setBoxWidth] = useState<string>('');
  const [boxHeight, setBoxHeight] = useState<string>('');
  
  // Refs for debouncing store updates (500ms delay)
  const widthTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heightTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (widthTimeoutRef.current) clearTimeout(widthTimeoutRef.current);
      if (heightTimeoutRef.current) clearTimeout(heightTimeoutRef.current);
    };
  }, []);

  // Sync box input state with current design
  useEffect(() => {
    const design = designs.find((d) => d.id === designId);
    if (design) {
      const width = unitSystem === 'cm' ? design.box.width.cm.toFixed(2) : (design.box.width.cm / 2.54).toFixed(2);
      const height = unitSystem === 'cm' ? design.box.height.cm.toFixed(2) : (design.box.height.cm / 2.54).toFixed(2);
      setBoxWidth(width);
      setBoxHeight(height);
    }
  }, [designId, designs, unitSystem]);

  const design = useMemo(() => designs.find((d) => d.id === designId), [designId, designs]);
  
  const singleDataset = useMemo(() => {
    if (design && design.splData?.dataset) {
      return [{ label: design.name, data: design.splData.dataset }];
    }
    return [];
  }, [design]);

  if (!isHydrated) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  if (!design) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-red-500 mb-4">Design not found.</p>
        <Link href="/design" className="text-blue-600 underline">
          Back to Designs
        </Link>
      </div>
    );
  }

  const widthCm = design.box.width.cm;
  const heightCm = design.box.height.cm;
  const depthCm = (design.vb * 1000) / (widthCm * heightCm);
  const widthIn = widthCm / 2.54;
  const heightIn = heightCm / 2.54;
  const depthIn = depthCm / 2.54;

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/design" className="text-blue-600 underline mb-4 inline-block">
        ← Back to Designs
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-screen">
        {/* Left Column: Design Form */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-lg border p-6 flex-1">
            <h2 className="text-lg font-semibold mb-6 text-gray-900">{design.name}</h2>
            <DesignFormEmbedded
              existing={design}
              onSave={() => {
                window.location.reload();
              }}
            />
          </div>
        </div>

        {/* Right Column: Chart and Specs */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* SPL Response Curve */}
          <div className="border p-4 rounded-lg flex flex-col flex-grow min-h-96">
            <h2 className="text-lg font-semibold mb-4">SPL Response</h2>
            <div className="flex-grow flex items-center justify-center">
              {singleDataset.length > 0 ? (
                <ResponseCurve datasets={singleDataset} />
              ) : (
                <p className="text-gray-500">Loading...</p>
              )}
            </div>
          </div>

          {/* Tabbed Content */}
          <div className="overflow-hidden">
            {/* Tab Navigation */}
            <div className="flex border-b bg-gray-50">
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
              <div className="ml-auto flex items-center border-l">
                <button
                  onClick={() => setUnitSystem(unitSystem === 'cm' ? 'in' : 'cm')}
                  className="px-3 py-3 text-sm font-medium text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  title="Toggle cm/in"
                >
                  {unitSystem === 'cm' ? 'cm' : 'in'}
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-6 bg-white">
              {/* Box Tab */}
              {activeTab === 'box' && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 mb-4">{design.name} - Box Dimensions</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <p className="text-xs text-gray-600 mb-1">Width (Editable) {unitSystem === 'cm' ? 'cm' : 'in'}</p>
                      <input
                        type="number"
                        step="0.1"
                        value={boxWidth}
                        onChange={(e) => {
                          setBoxWidth(e.target.value);
                          if (widthTimeoutRef.current) clearTimeout(widthTimeoutRef.current);
                          widthTimeoutRef.current = setTimeout(() => {
                            const inputValue = parseFloat(e.target.value);
                            if (!isNaN(inputValue)) {
                              const newWidth = unitSystem === 'cm' ? inputValue : inputValue * 2.54;
                              const newWidthIn = newWidth / 2.54;
                              editDesign({
                                ...design,
                                box: {
                                  ...design.box,
                                  width: { cm: newWidth, in: newWidthIn }
                                }
                              });
                            }
                          }, 500);
                        }}
                        className="border border-gray-300 p-2 rounded text-gray-900 bg-white w-full mb-2"
                      />
                      <p className="text-sm text-gray-600">{unitSystem === 'cm' ? widthIn.toFixed(2) + ' in' : widthCm.toFixed(2) + ' cm'}</p>
                    </div>
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <p className="text-xs text-gray-600 mb-1">Height (Editable) {unitSystem === 'cm' ? 'cm' : 'in'}</p>
                      <input
                        type="number"
                        step="0.1"
                        value={boxHeight}
                        onChange={(e) => {
                          setBoxHeight(e.target.value);
                          if (heightTimeoutRef.current) clearTimeout(heightTimeoutRef.current);
                          heightTimeoutRef.current = setTimeout(() => {
                            const inputValue = parseFloat(e.target.value);
                            if (!isNaN(inputValue)) {
                              const newHeight = unitSystem === 'cm' ? inputValue : inputValue * 2.54;
                              const newHeightIn = newHeight / 2.54;
                              editDesign({
                                ...design,
                                box: {
                                  ...design.box,
                                  height: { cm: newHeight, in: newHeightIn }
                                }
                              });
                            }
                          }, 500);
                        }}
                        className="border border-gray-300 p-2 rounded text-gray-900 bg-white w-full mb-2"
                      />
                      <p className="text-sm text-gray-600">{unitSystem === 'cm' ? heightIn.toFixed(2) + ' in' : heightCm.toFixed(2) + ' cm'}</p>
                    </div>
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <p className="text-xs text-gray-600 mb-1">Depth (Auto-calculated from Vb) {unitSystem === 'cm' ? 'cm' : 'in'}</p>
                      <p className="text-lg font-semibold text-gray-900 mb-2">{unitSystem === 'cm' ? depthCm.toFixed(2) : depthIn.toFixed(2)}</p>
                      <p className="text-sm text-gray-600">{unitSystem === 'cm' ? depthIn.toFixed(2) + ' in' : depthCm.toFixed(2) + ' cm'}</p>
                      <p className="text-xs text-gray-500 mt-2">Calculated as: Vb ({design.vb}L) ÷ (Width × Height)</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Port Tab */}
              {activeTab === 'port' && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 mb-4">{design.name} - Port Specifications</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <p className="text-xs text-gray-600 mb-1">Min Dia (Rec) {unitSystem === 'cm' ? 'cm' : 'in'}</p>
                      <p className="text-lg font-semibold text-gray-900">{unitSystem === 'cm' ? design.dmin.rec.cm.toFixed(2) : design.dmin.rec.in.toFixed(2)}</p>
                    </div>
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <p className="text-xs text-gray-600 mb-1">Min Dia (Act) {unitSystem === 'cm' ? 'cm' : 'in'}</p>
                      <p className="text-lg font-semibold text-gray-900">{unitSystem === 'cm' ? design.dmin.actual.cm.toFixed(2) : design.dmin.actual.in.toFixed(2)}</p>
                    </div>
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <p className="text-xs text-gray-600 mb-1">Port Area {unitSystem === 'cm' ? 'cm²' : 'in²'}</p>
                      <p className="text-lg font-semibold text-gray-900">{unitSystem === 'cm' ? design.port.area.cm.toFixed(2) : design.port.area.in.toFixed(2)}</p>
                    </div>
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <p className="text-xs text-gray-600 mb-1">Port Length {unitSystem === 'cm' ? 'cm' : 'in'}</p>
                      <p className="text-lg font-semibold text-gray-900">{unitSystem === 'cm' ? design.lv.cm.toFixed(2) : design.lv.in.toFixed(2)}</p>
                    </div>
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <p className="text-xs text-gray-600 mb-1">Port Width {unitSystem === 'cm' ? 'cm' : 'in'}</p>
                      <p className="text-lg font-semibold text-gray-900">{unitSystem === 'cm' ? design.port.width.cm.toFixed(2) : design.port.width.in.toFixed(2)}</p>
                    </div>
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <p className="text-xs text-gray-600 mb-1">Port Height {unitSystem === 'cm' ? 'cm' : 'in'}</p>
                      <p className="text-lg font-semibold text-gray-900">{unitSystem === 'cm' ? design.port.height.cm.toFixed(2) : design.port.height.in.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
