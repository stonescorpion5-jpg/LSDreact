'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '../lib/store';
import { Driver } from '../lib/types';

export function DriverForm({
  onClose,
  existing,
}: {
  onClose: () => void;
  existing?: Driver | null;
}) {
  const { addDriver, editDriver } = useAppStore();

  const [form, setForm] = useState(() => ({
    brand: existing?.brand || '',
    model: existing?.model || '',
    size: existing?.size || 8,
    fs: existing?.fs || 100,
    re: existing?.re || 4,
    qms: existing?.qms || 1,
    qes: existing?.qes || 1,
    qts: existing?.qts || 0.5,
    vas: existing?.vas || 10,
    xmax: existing?.xmax || 3,
    sd: existing?.sd || 220,
    le: existing?.le || 0.5,
    rms: existing?.rms || 100,
  }));

  useEffect(() => {
    if (existing) {
      setForm({
        brand: existing.brand || '',
        model: existing.model || '',
        size: existing.size || 8,
        fs: existing.fs || 100,
        re: existing.re || 4,
        qms: existing.qms || 1,
        qes: existing.qes || 1,
        qts: existing.qts || 0.5,
        vas: existing.vas || 10,
        xmax: existing.xmax || 3,
        sd: existing.sd || 220,
        le: existing.le || 0.5,
        rms: existing.rms || 100,
      });
    }
  }, [existing]);

  function onChange<K extends keyof typeof form>(k: K, v: string | number) {
    setForm((s) => ({ ...s, [k]: typeof v === 'string' ? v : Number(v) }));
  }

  function submit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const payload = {
      brand: String(form.brand),
      model: String(form.model),
      size: Number(form.size),
      fs: Number(form.fs),
      re: Number(form.re),
      qms: Number(form.qms),
      qes: Number(form.qes),
      qts: Number(form.qts),
      vas: Number(form.vas),
      xmax: Number(form.xmax),
      sd: Number(form.sd),
      le: Number(form.le),
      rms: Number(form.rms),
    } as Omit<Driver, 'id'>;

    if (existing) {
      editDriver({ ...(existing as Driver), ...payload });
    } else {
      addDriver(payload);
    }

    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <form onSubmit={submit} className="bg-white rounded-lg p-6 w-11/12 max-w-md text-gray-900">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">{existing ? 'Edit' : 'Add'} Driver</h2>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col">
            <span className="text-sm text-gray-700">Brand</span>
            <input value={form.brand} onChange={(e) => onChange('brand', e.target.value)} className="border border-gray-300 p-2 rounded text-gray-900 bg-white placeholder-gray-400" />
          </label>

          <label className="flex flex-col">
            <span className="text-sm text-gray-700">Model</span>
            <input value={form.model} onChange={(e) => onChange('model', e.target.value)} className="border border-gray-300 p-2 rounded text-gray-900 bg-white placeholder-gray-400" />
          </label>

          <label className="flex flex-col">
            <span className="text-sm text-gray-700">Size (in)</span>
            <input type="number" value={form.size} onChange={(e) => onChange('size', e.target.value)} className="border border-gray-300 p-2 rounded text-gray-900 bg-white" />
          </label>

          <label className="flex flex-col">
            <span className="text-sm text-gray-700">Fs (Hz)</span>
            <input type="number" value={form.fs} onChange={(e) => onChange('fs', e.target.value)} className="border border-gray-300 p-2 rounded text-gray-900 bg-white" />
          </label>

          <label className="flex flex-col">
            <span className="text-sm text-gray-700">Re (Ω)</span>
            <input type="number" step="0.01" value={form.re} onChange={(e) => onChange('re', e.target.value)} className="border border-gray-300 p-2 rounded text-gray-900 bg-white" />
          </label>

          <label className="flex flex-col">
            <span className="text-sm text-gray-700">Qms</span>
            <input type="number" value={form.qms} onChange={(e) => onChange('qms', e.target.value)} className="border border-gray-300 p-2 rounded text-gray-900 bg-white" />
          </label>

          <label className="flex flex-col">
            <span className="text-sm text-gray-700">Qes</span>
            <input type="number" value={form.qes} onChange={(e) => onChange('qes', e.target.value)} className="border border-gray-300 p-2 rounded text-gray-900 bg-white" />
          </label>

          <label className="flex flex-col">
            <span className="text-sm text-gray-700">Vas (L)</span>
            <input type="number" value={form.vas} onChange={(e) => onChange('vas', e.target.value)} className="border border-gray-300 p-2 rounded text-gray-900 bg-white" />
          </label>

          <label className="flex flex-col">
            <span className="text-sm text-gray-700">Xmax (mm)</span>
            <input type="number" value={form.xmax} onChange={(e) => onChange('xmax', e.target.value)} className="border border-gray-300 p-2 rounded text-gray-900 bg-white" />
          </label>

          <label className="flex flex-col">
            <span className="text-sm text-gray-700">Sd (cm²)</span>
            <input type="number" value={form.sd} onChange={(e) => onChange('sd', e.target.value)} className="border border-gray-300 p-2 rounded text-gray-900 bg-white" />
          </label>

          <label className="flex flex-col">
            <span className="text-sm text-gray-700">Le (mH)</span>
            <input type="number" step="0.01" value={form.le} onChange={(e) => onChange('le', e.target.value)} className="border border-gray-300 p-2 rounded text-gray-900 bg-white" />
          </label>

          <label className="flex flex-col">
            <span className="text-sm text-gray-700">RMS (W)</span>
            <input type="number" value={form.rms} onChange={(e) => onChange('rms', e.target.value)} className="border border-gray-300 p-2 rounded text-gray-900 bg-white" />
          </label>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-200 text-gray-800">Cancel</button>
          <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">Save</button>
        </div>
      </form>
    </div>
  );
}
