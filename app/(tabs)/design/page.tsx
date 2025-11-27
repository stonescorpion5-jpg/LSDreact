'use client';

import { useAppStore } from '../../lib/store';
import Link from 'next/link';

export default function DesignPage() {
  const { designs, removeDesign, drivers } = useAppStore();

  const getDriverName = (driverId: string) => {
    const driver = drivers.find((d) => d.id === driverId);
    return driver?.brandModel || driver?.model || 'Unknown';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Designs</h1>
        <div>
          <Link
            href="/design/new"
            className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 inline-block"
          >
            Add Design
          </Link>
        </div>
      </div>

      <div className="grid gap-4">
        {designs.length === 0 && <div className="text-sm text-gray-500">No designs yet</div>}
        {designs.map((design) => (
          <div key={design.id} className="border p-4 rounded-lg">
            <div className="flex items-start justify-between">
              <Link href={`/design/${design.id}`} className="flex-grow">
                <div className="cursor-pointer hover:opacity-70">
                  <h2 className="font-semibold">{getDriverName(design.driverId)} - {design.type}</h2>
                  <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                    <div>Type: {design.type}</div>
                    <div>Vb: {design.vb}L</div>
                    <div>Fb: {design.fb}Hz</div>
                    <div># Drivers: {design.nod}</div>
                    <div># Ports: {design.np}</div>
                  </div>
                </div>
              </Link>
              <div className="flex flex-col gap-2 ml-4">
                <Link
                  href={`/design/${design.id}`}
                  className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-800 text-center"
                >
                  Edit
                </Link>
                <button
                  onClick={() => removeDesign(design.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}