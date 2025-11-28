'use client';

import { useAppStore } from '../../../lib/store';
import { ResponseCurve } from '../../../components/ResponseCurve';
import { DesignFormEmbedded } from '../../../components/DesignFormEmbedded';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function DesignDetailPage() {
  const params = useParams();
  const designId = params.designId as string;
  const { designs, drivers } = useAppStore();

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
      </div>

      {/* Split Layout: Form on left (1/4), calculations on right (3/4) */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 min-h-screen">
        {/* Left Column: Edit Form (1/4 width on xl and up) */}
        <div>
          <DesignFormEmbedded existing={design} />
        </div>

        {/* Right Column: Chart and Specs Below (3/4 width on xl and up) */}
        <div className="flex flex-col space-y-6 xl:col-span-3 min-h-96">
          {/* SPL Response Curve - Grows to fill available space */}
          <div className="border p-4 rounded-lg flex flex-col flex-grow min-h-96">
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
          <div className="border p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Box Dimensions</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-xs text-gray-600">Width</p>
                <p className="text-sm font-semibold">{design.box.width.cm.toFixed(2)} cm</p>
                <p className="text-xs text-gray-600">{design.box.width.in.toFixed(2)} in</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-xs text-gray-600">Height</p>
                <p className="text-sm font-semibold">{design.box.height.cm.toFixed(2)} cm</p>
                <p className="text-xs text-gray-600">{design.box.height.in.toFixed(2)} in</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-xs text-gray-600">Depth</p>
                <p className="text-sm font-semibold">{design.box.depth.cm.toFixed(2)} cm</p>
                <p className="text-xs text-gray-600">{design.box.depth.in.toFixed(2)} in</p>
              </div>
            </div>
          </div>

          {/* Port Dimensions */}
          <div className="border p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Port Specifications</h2>
            <div className="grid grid-cols-4 gap-3 text-sm">
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
        </div>
      </div>
    </div>
  );
}
