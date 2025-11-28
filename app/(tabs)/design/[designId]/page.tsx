'use client';

import { useAppStore } from '../../../lib/store';
import { ResponseCurve } from '../../../components/ResponseCurve';
import { DesignFormEmbedded } from '../../../components/DesignFormEmbedded';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function DesignDetailPage() {
  const params = useParams();
  const designId = params.designId as string;
  const { designs, drivers, editDesign, removeDesign } = useAppStore();

  const design = designs.find((d) => d.id === designId);
  const driver = design ? drivers.find((d) => d.id === design.driverId) : null;

  if (!design || !driver) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-red-500">Design not found</p>
        <Link href="/design" className="text-blue-600 underline mt-4">
          Back to Designs
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
        <h1 className="text-3xl font-bold text-gray-900 mt-2">{design.name}</h1>
        <div className="flex gap-6 mt-3 text-sm text-gray-600">
          <div>
            <span className="font-semibold">Driver Config:</span> {design.nod} driver{design.nod !== 1 ? 's' : ''}
          </div>
          {design.type === 'Ported' && (
            <div>
              <span className="font-semibold">Port Config:</span> {design.np} port{design.np !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      {/* Split Layout: Form on left (1/2), calculations on right (1/2) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 min-h-screen">
        {/* Left Column: Edit Form (1/2 width on xl and up) */}
        <div>
          <DesignFormEmbedded existing={design} />
        </div>

        {/* Right Column: Chart and Specs Below (1/2 width on xl and up) */}
        <div className="flex flex-col space-y-6 xl:col-span-1 min-h-96">
          {/* SPL Response Curve - Grows to fill available space */}
          <div className="flex flex-col flex-grow min-h-96">
            <h2 className="text-lg font-semibold mb-4">SPL Response</h2>
            <div className="flex-grow flex items-center justify-center">
              {design.splData?.dataset && design.splData.dataset.length > 0 ? (
                <ResponseCurve data={design.splData.dataset} />
              ) : (
                <p className="text-gray-500">No SPL data available</p>
              )}
            </div>
          </div>

          {/* Box Dimensions */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Box Dimensions</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-xs text-gray-600 mb-2">Width (Editable)</p>
                <input
                  type="number"
                  step="0.1"
                  value={design.box.width.cm.toFixed(2)}
                  onChange={(e) => {
                    const newWidth = parseFloat(e.target.value) || design.box.width.cm;
                    const newWidthIn = newWidth / 2.54;
                    editDesign({
                      ...design,
                      box: {
                        ...design.box,
                        width: { cm: newWidth, in: newWidthIn }
                      }
                    });
                  }}
                  className="border border-gray-300 p-2 rounded text-gray-900 bg-white w-full mb-2 text-sm"
                />
                <p className="text-xs text-gray-600">{(design.box.width.cm / 2.54).toFixed(2)} in</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-xs text-gray-600 mb-2">Height (Editable)</p>
                <input
                  type="number"
                  step="0.1"
                  value={design.box.height.cm.toFixed(2)}
                  onChange={(e) => {
                    const newHeight = parseFloat(e.target.value) || design.box.height.cm;
                    const newHeightIn = newHeight / 2.54;
                    editDesign({
                      ...design,
                      box: {
                        ...design.box,
                        height: { cm: newHeight, in: newHeightIn }
                      }
                    });
                  }}
                  className="border border-gray-300 p-2 rounded text-gray-900 bg-white w-full mb-2 text-sm"
                />
                <p className="text-xs text-gray-600">{(design.box.height.cm / 2.54).toFixed(2)} in</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-xs text-gray-600 mb-2">Depth (Auto)</p>
                <p className="text-sm font-semibold mb-2">{((design.vb * 1000) / (design.box.width.cm * design.box.height.cm)).toFixed(2)} cm</p>
                <p className="text-xs text-gray-600">{(((design.vb * 1000) / (design.box.width.cm * design.box.height.cm)) / 2.54).toFixed(2)} in</p>
                <p className="text-xs text-gray-500 mt-2">Calculated from Vb ÷ (W×H)</p>
              </div>
            </div>
          </div>

          {/* Port Dimensions - Only for Ported designs */}
          {design.type === 'Ported' && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Port Specifications</h2>
              <div className="grid grid-cols-4 gap-3 text-sm text-gray-700">
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-xs text-gray-600">Min Dia (Rec)</p>
                  <p className="font-semibold">{design.dmin.rec.cm.toFixed(2)} cm</p>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-xs text-gray-600">Min Dia (Act)</p>
                  <p className="font-semibold">{design.dmin.actual.cm.toFixed(2)} cm</p>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-xs text-gray-600">Port Area</p>
                  <p className="font-semibold">{design.port.area.cm.toFixed(2)} cm²</p>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-xs text-gray-600">Port Length</p>
                  <p className="font-semibold">{design.lv.cm.toFixed(2)} cm</p>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-xs text-gray-600">Port Width</p>
                  <p className="font-semibold">{design.port.width.cm.toFixed(2)} cm</p>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-xs text-gray-600">Port Height</p>
                  <p className="font-semibold">{design.port.height.cm.toFixed(2)} cm</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Footer - Save/Delete Buttons */}
        <div className="xl:col-span-2 border-t bg-gray-50 p-4 flex justify-end gap-2 -mx-6 -mb-8 px-6">
          <button
            onClick={() => {
              // Refresh to show updated design
              window.location.reload();
            }}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium"
          >
            Save
          </button>
          <button
            onClick={() => {
              if (confirm('Are you sure you want to delete this design?')) {
                removeDesign(design.id);
                window.location.href = '/design';
              }
            }}
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 text-sm font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
