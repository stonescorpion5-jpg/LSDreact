'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '../../lib/store';
import { DriverForm } from '../../components/DriverForm';

export default function DriverPage() {
  const { drivers, removeDriver } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null as null | any);

  useEffect(() => {
    console.log('🔍 DriverPage: drivers loaded:', drivers.length, drivers);
  }, [drivers]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Drivers</h1>
        <div>
          <button
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
            className="px-3 py-2 bg-blue-600 text-white rounded"
          >
            Add Driver
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {drivers.length === 0 && <div className="text-sm text-gray-500">No drivers yet</div>}
        {drivers.map((driver) => (
          <div key={driver.id} className="border p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h2 className="font-semibold text-lg">{driver.brandModel || `${driver.brand} ${driver.model}`}</h2>
                <div className="flex gap-6 mt-2 text-sm">
                  <div>
                    <p className="text-xs text-gray-400 font-semibold">Size</p>
                    <p className="text-gray-500">{driver.size}"</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-semibold">Rec Sealed Vb</p>
                    <p className="text-gray-500">{driver.recSealedVb?.toFixed(1)}L</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-semibold">Rec Port Vb</p>
                    <p className="text-gray-500">{driver.recPortedVb?.toFixed(1)}L</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 ml-4">
                <button onClick={() => { setEditing(driver); setShowForm(true); }} className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-800">Edit</button>
                <button onClick={() => removeDriver(driver.id)} className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && <DriverForm existing={editing} onClose={() => setShowForm(false)} />}
    </div>
  );
}