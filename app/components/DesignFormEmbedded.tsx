'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '../lib/store';
import { Design } from '../lib/types';

export function DesignFormEmbedded({
  existing,
  onSave,
}: {
  existing?: Design | null;
  onSave?: () => void;
}) {
  const { addDesign, editDesign, drivers } = useAppStore();

  const [form, setForm] = useState(() => ({
    driverId: existing?.driverId || drivers[0]?.id || '',
    type: (existing?.type || 'Ported') as 'Ported' | 'Sealed',
    vb: existing?.vb || 50,
    fb: existing?.fb || 45,
    nod: existing?.nod || 1,
    np: existing?.np || 1,
  }));

  useEffect(() => {
    if (existing) {
      setForm({
        driverId: existing.driverId || drivers[0]?.id || '',
        type: existing.type || 'Ported',
        vb: existing.vb || 50,
        fb: existing.fb || 45,
        nod: existing.nod || 1,
        np: existing.np || 1,
      });
    }
  }, [existing, drivers]);

  function onChange<K extends keyof typeof form>(k: K, v: string | number) {
    setForm((s) => ({
      ...s,
      [k]: typeof v === 'string' && k !== 'type' ? parseFloat(v) || 0 : v,
    }));
  }

  function submit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const payload = {
      driverId: String(form.driverId),
      type: form.type as 'Ported' | 'Sealed',
      vb: Number(form.vb),
      fb: Number(form.fb),
      nod: Number(form.nod),
      np: Number(form.np),
      box: existing?.box || {
        width: { cm: 0, in: 0 },
        height: { cm: 0, in: 0 },
        depth: { cm: 0, in: 0 },
      },
      port: existing?.port || {
        area: { cm: 0, in: 0 },
        width: { cm: 0, in: 0 },
        height: { cm: 0, in: 0 },
      },
      dmin: existing?.dmin || {
        actual: { cm: 0, in: 0 },
        rec: { cm: 0, in: 0 },
        outer: { cm: 0, in: 0 },
      },
      bracing: existing?.bracing || { cm: 2.54, in: 1 },
      lv: existing?.lv || { cm: 0, in: 0 },
      splData: existing?.splData || { dataset: [] },
    } as Omit<Design, 'id'>;

    if (existing) {
      editDesign({ id: existing.id, ...payload });
    } else {
      addDesign(payload);
    }

    onSave?.();
  }

  const selectedDriver = drivers.find((d) => d.id === form.driverId);

  return (
    <form onSubmit={submit} className="bg-white rounded-lg p-6 text-gray-900 border">
      <h2 className="text-lg font-semibold mb-4 text-gray-900">{existing ? 'Edit' : 'New'} Design</h2>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col col-span-2">
          <span className="text-sm text-gray-700">Driver</span>
          <select
            value={form.driverId}
            onChange={(e) => onChange('driverId', e.target.value)}
            className="border border-gray-300 p-2 rounded text-gray-900 bg-white"
          >
            {drivers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.brandModel || `${d.brand} ${d.model}`}
              </option>
            ))}
          </select>
          {selectedDriver && (
            <div className="text-xs text-gray-600 mt-1">
              Rec Ported Vb: {selectedDriver.recPortedVb}L, F3: {selectedDriver.recPortedF3}Hz
            </div>
          )}
        </label>

        <label className="flex flex-col">
          <span className="text-sm text-gray-700">Type</span>
          <select
            value={form.type}
            onChange={(e) => onChange('type', e.target.value)}
            className="border border-gray-300 p-2 rounded text-gray-900 bg-white"
          >
            <option value="Ported">Ported</option>
            <option value="Sealed">Sealed</option>
          </select>
        </label>

        <label className="flex flex-col">
          <span className="text-sm text-gray-700">Vb (L)</span>
          <input
            type="number"
            step="0.1"
            value={form.vb}
            onChange={(e) => onChange('vb', e.target.value)}
            className="border border-gray-300 p-2 rounded text-gray-900 bg-white"
          />
        </label>

        <label className="flex flex-col">
          <span className="text-sm text-gray-700">Fb (Hz)</span>
          <input
            type="number"
            step="0.1"
            value={form.fb}
            onChange={(e) => onChange('fb', e.target.value)}
            className="border border-gray-300 p-2 rounded text-gray-900 bg-white"
          />
        </label>

        <label className="flex flex-col">
          <span className="text-sm text-gray-700"># of Drivers</span>
          <input
            type="number"
            value={form.nod}
            onChange={(e) => onChange('nod', e.target.value)}
            className="border border-gray-300 p-2 rounded text-gray-900 bg-white"
          />
        </label>

        <label className="flex flex-col">
          <span className="text-sm text-gray-700"># of Ports</span>
          <input
            type="number"
            value={form.np}
            onChange={(e) => onChange('np', e.target.value)}
            className="border border-gray-300 p-2 rounded text-gray-900 bg-white"
          />
        </label>
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
          Save Design
        </button>
      </div>
    </form>
  );
}
