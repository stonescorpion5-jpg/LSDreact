'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAppStore } from '../lib/store';
import { Design } from '../lib/types';

export function DesignForm({
  onClose,
  existing,
}: {
  onClose: () => void;
  existing?: Design | null;
}) {
  const { addDesign, editDesign, drivers } = useAppStore();

  const handleChange = useCallback((k: keyof typeof form, v: string | number) => {
    let newValue: any = v;
    
    // Only convert to number for numeric fields, keep strings for driverId and type
    if (k !== 'type' && k !== 'driverId') {
      newValue = typeof v === 'string' ? parseFloat(v) || 0 : v;
    }
    
    setForm((s) => {
      const updated = {
        ...s,
        [k]: newValue,
      };
      
      // If driver or type changed, update Vb and Fb with recommended values (for new designs only)
      if (!existing && (k === 'driverId' || k === 'type')) {
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
          console.log('handleChange: driver not found for id', updated.driverId, 'available ids:', drivers.map(d => d.id));
        }
      }
      
      return updated;
    });
  }, [drivers, existing]);

  const [form, setForm] = useState(() => {
    const driverId = existing?.driverId || drivers[0]?.id || '';
    const type = (existing?.type || 'Ported') as 'Ported' | 'Sealed';
    const driver = drivers.find((d) => d.id === driverId);
    
    // Use recommended volumes from driver based on type
    let vb = existing?.vb;
    if (!vb) {
      vb = type === 'Ported' ? (driver?.recPortedVb || 50) : (driver?.recSealedVb || 50);
    }
    
    let fb = existing?.fb;
    if (!fb) {
      fb = type === 'Ported' ? (driver?.recPortedFb || 45) : (driver?.recSealedFb || 45);
    }

    console.log('DesignForm init:', { driverId, type, driver: driver?.brandModel, vb, fb, hasRecPortedVb: !!driver?.recPortedVb, hasRecSealedVb: !!driver?.recSealedVb });

    return {
      driverId,
      type,
      vb,
      fb,
      nod: existing?.nod || 1,
      np: existing?.np || 1,
    };
  });

  // Sync driverId and volumes when drivers array changes (ensures we have latest driver data)
  useEffect(() => {
    setForm((s) => {
      // If no driverId set yet and drivers are available, use first driver
      if (!s.driverId && drivers.length > 0) {
        const driver = drivers[0];
        const newVb = s.type === 'Ported' ? (driver?.recPortedVb || 50) : (driver?.recSealedVb || 50);
        const newFb = s.type === 'Ported' ? (driver?.recPortedFb || 45) : (driver?.recSealedFb || 45);
        console.log('DesignForm useEffect sync:', { driverId: driver.id, vb: newVb, fb: newFb });
        return { ...s, driverId: driver.id, vb: newVb, fb: newFb };
      }
      return s;
    });
  }, [drivers.length]);

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
    let newValue: any = v;
    
    // Only convert to number for numeric fields, keep strings for driverId and type
    if (k !== 'type' && k !== 'driverId') {
      newValue = typeof v === 'string' ? parseFloat(v) || 0 : v;
    }
    
    setForm((s) => {
      const updated = {
        ...s,
        [k]: newValue,
      };
      
      // If driver or type changed, update Vb and Fb with recommended values (for new designs only)
      if (!existing && (k === 'driverId' || k === 'type')) {
        const driver = drivers.find((d) => d.id === updated.driverId);
        console.log('onChange driver select:', { 
          changed: k, 
          driverId: updated.driverId, 
          found: !!driver,
          type: updated.type,
          recPortedVb: driver?.recPortedVb,
          recSealedVb: driver?.recSealedVb
        });
        if (driver) {
          const newVb = updated.type === 'Ported' ? (driver.recPortedVb || 50) : (driver.recSealedVb || 50);
          const newFb = updated.type === 'Ported' ? (driver.recPortedFb || 45) : (driver.recSealedFb || 45);
          console.log('Setting volumes:', { newVb, newFb });
          updated.vb = newVb;
          updated.fb = newFb;
        }
      }
      
      return updated;
    });
  }

  function submit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    
    // Validate that the selected driver exists
    const selectedDriver = drivers.find((d) => d.id === form.driverId);
    if (!selectedDriver) {
      console.error('Selected driver not found:', { driverId: form.driverId, availableDrivers: drivers.map(d => d.id) });
      alert('Please select a valid driver');
      return;
    }
    
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

    onClose();
  }

  const selectedDriver = drivers.find((d) => d.id === form.driverId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <form onSubmit={submit} className="bg-white rounded-lg p-6 w-11/12 max-w-md text-gray-900 max-h-96 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">{existing ? 'Edit' : 'Add'} Design</h2>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col col-span-2">
            <span className="text-sm text-gray-700">Driver</span>
            <select
              value={form.driverId}
              onChange={(e) => handleChange('driverId', e.target.value)}
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
              onChange={(e) => handleChange('type', e.target.value)}
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
              onChange={(e) => handleChange('vb', e.target.value)}
              className="border border-gray-300 p-2 rounded text-gray-900 bg-white"
            />
          </label>

          <label className="flex flex-col">
            <span className="text-sm text-gray-700">Fb (Hz)</span>
            <input
              type="number"
              step="0.1"
              value={form.fb}
              onChange={(e) => handleChange('fb', e.target.value)}
              className="border border-gray-300 p-2 rounded text-gray-900 bg-white"
            />
          </label>

          <label className="flex flex-col">
            <span className="text-sm text-gray-700"># of Drivers</span>
            <input
              type="number"
              step="1"
              value={form.nod}
              onChange={(e) => handleChange('nod', e.target.value)}
              className="border border-gray-300 p-2 rounded text-gray-900 bg-white"
            />
          </label>

          <label className="flex flex-col">
            <span className="text-sm text-gray-700"># of Ports</span>
            <input
              type="number"
              step="1"
              value={form.np}
              onChange={(e) => handleChange('np', e.target.value)}
              className="border border-gray-300 p-2 rounded text-gray-900 bg-white"
            />
          </label>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-200 text-gray-800">
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
