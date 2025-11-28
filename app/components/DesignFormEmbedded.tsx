'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAppStore } from '../lib/store';
import { Design } from '../lib/types';

export function DesignFormEmbedded({
  existing,
  onSave,
}: {
  existing?: Design | null;
  onSave?: () => void;
}) {
  const { addDesign, editDesign, removeDesign, drivers } = useAppStore();

  const [form, setForm] = useState(() => {
    // For new designs, leave driverId empty and don't set Vb/Fb
    if (!existing) {
      return {
        name: '',
        driverId: '',
        type: 'Ported' as const,
        vb: 0,
        fb: 0,
        nod: 1,
        np: 1,
        boxWidthCm: 30,
        boxHeightCm: 30,
      };
    }

    // For existing designs, populate with current values
    const driverId = existing.driverId;
    const type = existing.type as 'Ported' | 'Sealed';
    
    return {
      name: existing.name || '',
      driverId,
      type,
      vb: existing.vb,
      fb: existing.fb,
      nod: existing.nod || 1,
      np: existing.np || 1,
      boxWidthCm: existing.box.width.cm || 30,
      boxHeightCm: existing.box.height.cm || 30,
    };
  });

  const handleChange = useCallback((k: keyof typeof form, v: string | number) => {
    let newValue: any = v;
    
    // Only convert to number for numeric fields, keep strings for name, driverId and type
    if (k !== 'type' && k !== 'driverId' && k !== 'name') {
      newValue = typeof v === 'string' ? parseFloat(v) || 0 : v;
    }
    
    setForm((s) => {
      const updated = {
        ...s,
        [k]: newValue,
      };
      
      // If driver or type changed, update Vb and Fb with recommended values
      if (k === 'driverId' || k === 'type') {
        const driver = drivers.find((d) => d.id === updated.driverId);
        if (driver) {
          const newVb = updated.type === 'Ported' ? (driver.recPortedVb || 50) : (driver.recSealedVb || 50);
          const newFb = updated.type === 'Ported' ? (driver.recPortedFb || 45) : (driver.recSealedFb || 45);
          console.log('handleChange volumes update:', { 
            field: k, 
            oldVb: s.vb, 
            newVb, 
            oldFb: s.fb, 
            newFb,
            driver: driver.brandModel, 
            hasRecPortedVb: driver.recPortedVb,
            hasRecSealedVb: driver.recSealedVb,
          });
          updated.vb = newVb;
          updated.fb = newFb;
        } else {
          console.log('handleChange: driver not found for id', updated.driverId);
        }
      }
      
      return updated;
    });
  }, [drivers, existing]);

  // Reset form when existing design changes
  useEffect(() => {
    if (!existing) {
      return;
    }
    setForm({
      name: existing.name || '',
      driverId: existing.driverId,
      type: existing.type as 'Ported' | 'Sealed',
      vb: existing.vb,
      fb: existing.fb,
      nod: existing.nod || 1,
      np: existing.np || 1,
      boxWidthCm: existing.box.width.cm || 30,
      boxHeightCm: existing.box.height.cm || 30,
    });
  }, [existing?.id]);

  // Sync volumes when drivers load (ensures we have driver data with recommended values)
  useEffect(() => {
    // Only auto-populate for existing designs, not new ones
    if (existing && drivers.length > 0 && form.driverId) {
      const driver = drivers.find((d) => d.id === form.driverId);
      if (driver && form.vb === 0 && form.fb === 0) {
        const newVb = form.type === 'Ported' ? (driver?.recPortedVb || 50) : (driver?.recSealedVb || 50);
        const newFb = form.type === 'Ported' ? (driver?.recPortedFb || 45) : (driver?.recSealedFb || 45);
        setForm((s) => ({ ...s, vb: newVb, fb: newFb }));
      }
    }
  }, [drivers.length, existing?.id]);

  function submit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    
    // Calculate depth from Vb: depth = Vb / (width * height)
    // Vb is in liters (1 liter = 1000 cm³)
    const widthCm = Number(form.boxWidthCm) || 30;
    const heightCm = Number(form.boxHeightCm) || 30;
    const vbCm3 = Number(form.vb) * 1000; // Convert liters to cm³
    const depthCm = vbCm3 / (widthCm * heightCm);
    
    // Convert cm to inches (1 inch = 2.54 cm)
    const widthIn = widthCm / 2.54;
    const heightIn = heightCm / 2.54;
    const depthIn = depthCm / 2.54;
    
    const payload = {
      name: String(form.name),
      driverId: String(form.driverId),
      type: form.type as 'Ported' | 'Sealed',
      vb: Number(form.vb),
      fb: Number(form.fb),
      nod: Number(form.nod),
      np: Number(form.np),
      isDisplayed: existing?.isDisplayed ?? true,
      box: {
        width: { cm: widthCm, in: widthIn },
        height: { cm: heightCm, in: heightIn },
        depth: { cm: depthCm, in: depthIn },
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
    <form onSubmit={submit} className="bg-white rounded-lg p-6 text-gray-900">
      <h2 className="text-lg font-semibold mb-4 text-gray-900">
        {existing ? 'Edit' : 'New'} Design {form.name && `— ${form.name}`}
      </h2>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col col-span-1">
          <span className="text-sm text-gray-700">Design Name</span>
          <input
            type="text"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="e.g., My First Speaker"
            className="border border-gray-300 p-2 rounded text-gray-900"
          />
        </label>

        <label className="flex flex-col col-span-1">
          <span className="text-sm text-gray-700">Driver</span>
          <select
            value={form.driverId}
            onChange={(e) => handleChange('driverId', e.target.value)}
            className="border border-gray-300 p-2 rounded text-gray-900 bg-white"
          >
            <option value="">Select Driver</option>
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

        <label className="flex flex-col col-span-1">
          <span className="text-sm text-gray-700">Type</span>
          <select
            value={form.type}
            onChange={(e) => handleChange('type', e.target.value)}
            className="border border-gray-300 p-2 rounded text-gray-900 bg-white"
          >
            <option value="Ported">Ported</option>
            <option value="Sealed">Sealed</option>
          </select>
        </label>

        <label className="flex flex-col col-span-1">
          <span className="text-sm text-gray-700">
            Vb (L)
            {selectedDriver && (
              <span className="text-xs text-gray-500 ml-1">
                (Rec: {((form.type === 'Ported' ? (selectedDriver.recPortedVb || 50) : (selectedDriver.recSealedVb || 20)) * form.nod).toFixed(1)}L)
              </span>
            )}
          </span>
          <input
            type="number"
            step="0.1"
            value={form.vb}
            onChange={(e) => handleChange('vb', e.target.value)}
            className="border border-gray-300 p-2 rounded text-gray-900 bg-white"
          />
        </label>

        <label className="flex flex-col col-span-1">
          <span className="text-sm text-gray-700">
            Fb (Hz)
            {selectedDriver && (
              <span className="text-xs text-gray-500 ml-1">
                (Rec: {form.type === 'Ported' ? selectedDriver.recPortedFb : selectedDriver.recSealedFb}Hz)
              </span>
            )}
          </span>
          <input
            type="number"
            step="0.1"
            value={form.fb}
            onChange={(e) => handleChange('fb', e.target.value)}
            className="border border-gray-300 p-2 rounded text-gray-900 bg-white"
          />
        </label>

        <label className="flex flex-col col-span-1">
          <span className="text-sm text-gray-700"># of Drivers</span>
          <input
            type="number"
            step="1"
            value={form.nod}
            onChange={(e) => handleChange('nod', e.target.value)}
            className="border border-gray-300 p-2 rounded text-gray-900 bg-white"
          />
        </label>

        {form.type === 'Ported' && (
          <label className="flex flex-col col-span-1">
            <span className="text-sm text-gray-700"># of Ports</span>
            <input
              type="number"
              step="1"
              value={form.np}
              onChange={(e) => handleChange('np', e.target.value)}
              className="border border-gray-300 p-2 rounded text-gray-900 bg-white"
            />
          </label>
        )}

        <label className="flex flex-col col-span-1">
          <span className="text-sm text-gray-700">
            F3 (Hz)
            {selectedDriver && (
              <span className="text-xs text-gray-500 ml-1">
                (Rec: {form.type === 'Ported' ? selectedDriver.recPortedF3 : selectedDriver.recSealedF3}Hz)
              </span>
            )}
          </span>
          <input
            type="number"
            step="0.1"
            value={selectedDriver ? (form.type === 'Ported' ? selectedDriver.recPortedF3 : selectedDriver.recSealedF3 || 0) : 0}
            disabled
            className="border border-gray-300 p-2 rounded text-gray-600 bg-gray-100 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">Auto-calculated from driver specs</p>
        </label>

        <label className="flex flex-col col-span-1">
          <span className="text-sm text-gray-700">Box Width (cm)</span>
          <input
            type="number"
            step="0.1"
            value={form.boxWidthCm}
            onChange={(e) => handleChange('boxWidthCm', e.target.value)}
            className="border border-gray-300 p-2 rounded text-gray-900 bg-white"
          />
        </label>

        <label className="flex flex-col col-span-1">
          <span className="text-sm text-gray-700">Box Height (cm)</span>
          <input
            type="number"
            step="0.1"
            value={form.boxHeightCm}
            onChange={(e) => handleChange('boxHeightCm', e.target.value)}
            className="border border-gray-300 p-2 rounded text-gray-900 bg-white"
          />
        </label>

        <label className="flex flex-col col-span-2">
          <span className="text-sm text-gray-700">
            Box Depth (cm)
            <span className="text-xs text-gray-500 ml-1">
              (Auto-calculated: {((Number(form.vb) * 1000) / ((Number(form.boxWidthCm) || 30) * (Number(form.boxHeightCm) || 30))).toFixed(1)} cm)
            </span>
          </span>
          <input
            type="number"
            step="0.1"
            value={((Number(form.vb) * 1000) / ((Number(form.boxWidthCm) || 30) * (Number(form.boxHeightCm) || 30))).toFixed(1)}
            disabled
            className="border border-gray-300 p-2 rounded text-gray-600 bg-gray-100 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">Calculated from Vb ÷ (Width × Height)</p>
        </label>
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
          Save Design
        </button>
        {existing && (
          <button
            type="button"
            onClick={() => {
              if (confirm('Are you sure you want to delete this design?')) {
                removeDesign(existing.id);
                onSave?.();
              }
            }}
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
          >
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
