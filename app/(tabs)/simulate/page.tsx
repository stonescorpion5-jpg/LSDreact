'use client';

import { useMemo } from 'react';
import { useAppStore } from '../../lib/store';
import { ResponseCurve } from '../../components/ResponseCurve';

export default function SimulatePage() {
  const { designs, drivers, toggleDisplayDesign } = useAppStore();

  // Get driver info for each design
  const designsWithDrivers = useMemo(() => {
    return designs.map((design) => {
      const driver = drivers.find((d) => d.id === design.driverId);
      return { ...design, driver };
    });
  }, [designs, drivers]);

  // Filter designs that have valid SPL data and are toggled on
  const displayedDesigns = useMemo(() => {
    return designsWithDrivers.filter(
      (d) => d.isDisplayed && d.splData?.dataset && d.splData.dataset.length > 0
    );
  }, [designsWithDrivers]);

  // Prepare datasets for the chart
  const chartDatasets = useMemo(() => {
    return displayedDesigns.map((design) => ({
      label: design.name,
      data: design.splData!.dataset,
    }));
  }, [displayedDesigns]);

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 pb-20">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Simulate</h1>

      {/* Chart Section */}
      {chartDatasets.length > 0 ? (
        <div className="mb-6 sm:mb-8 bg-white rounded-lg p-3 sm:p-6 shadow">
          <ResponseCurve datasets={chartDatasets} />
        </div>
      ) : (
        <div className="mb-6 sm:mb-8 bg-gray-50 rounded-lg p-8 sm:p-12 text-center border-2 border-dashed border-gray-300">
          <p className="text-gray-500 text-base sm:text-lg">
            No designs selected. Toggle designs below to see their response curves.
          </p>
        </div>
      )}

      {/* Design List */}
      <div className="space-y-3">
        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Designs</h2>
        
        {designs.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-200">
            <p className="text-gray-500">
              No designs created yet. Create a design in the Design tab to simulate it here.
            </p>
          </div>
        ) : (
          designs.map((design) => {
            const driver = drivers.find((d) => d.id === design.driverId);
            const hasData = design.splData?.dataset && design.splData.dataset.length > 0;
            
            return (
              <div
                key={design.id}
                className={`
                  border rounded-lg p-4 transition-all
                  ${design.isDisplayed ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200'}
                  ${!hasData ? 'opacity-50' : ''}
                `}
              >
                <label className="flex items-start gap-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={design.isDisplayed || false}
                    onChange={() => toggleDisplayDesign(design.id)}
                    disabled={!hasData}
                    className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">
                          {design.name}
                        </h3>
                        {driver && (
                          <p className="text-sm text-gray-600 mt-1">
                            {design.nod}x {driver.brand} {driver.model}
                            {' '}({driver.size}")
                          </p>
                        )}
                      </div>
                      
                      {!hasData && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          No data
                        </span>
                      )}
                    </div>
                    
                    <div className="flex gap-4 mt-2 text-sm text-gray-700">
                      <div>
                        <span className="font-medium">Type:</span>{' '}
                        <span className="text-gray-600">{design.type}</span>
                      </div>
                      <div>
                        <span className="font-medium">Vb:</span>{' '}
                        <span className="text-gray-600">{design.vb}L</span>
                      </div>
                      {design.type === 'Ported' && (
                        <div>
                          <span className="font-medium">Fb:</span>{' '}
                          <span className="text-gray-600">{design.fb}Hz</span>
                        </div>
                      )}
                    </div>
                  </div>
                </label>
              </div>
            );
          })
        )}
      </div>

      {/* Legend/Status */}
      {displayedDesigns.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-900">
            <strong>{displayedDesigns.length}</strong>{' '}
            {displayedDesigns.length === 1 ? 'design' : 'designs'} displayed on chart
          </p>
        </div>
      )}
    </div>
  );
}