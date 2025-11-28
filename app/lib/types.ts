export interface Driver {
  id: string;
  brand: string;
  model: string;
  size: number;
  fs: number;
  qms: number;
  qes: number;
  qts?: number;
  vas: number;
  xmax: number;
  sd: number;
  rms: number;
  re?: number;
  le?: number;
  brandModel?: string;
  dd3?: number;
  ebp?: number;
  k1?: number;
  k2?: number;
  n0?: number;
  par?: number;
  peakSPL?: number;
  per?: number;
  recPortedVb?: number;
  recPortedFb?: number;
  recPortedF3?: number;
  recSealedVb?: number;
  recSealedFb?: number;
  spl?: number;
  vd?: number;
}

export interface Design {
  id: string;
  name: string;
  driverId: string;
  type: 'Ported' | 'Sealed';
  vb: number;
  fb: number;
  nod: number;
  np: number;
  isDisplayed?: boolean;
  box: {
    width: {
      cm: number;
      in: number;
    };
    height: {
      cm: number;
      in: number;
    };
    depth: {
      cm: number;
      in: number;
    };
  };
  port: {
    area: {
      cm: number;
      in: number;
    };
    width: {
      cm: number;
      in: number;
    };
    height: {
      cm: number;
      in: number;
    };
  };
  dmin: {
    actual: {
      cm: number;
      in: number;
    };
    rec: {
      cm: number;
      in: number;
    };
    outer: {
      cm: number;
      in: number;
    };
  };
  bracing: {
    cm: number;
    in: number;
  };
  lv: {
    cm: number;
    in: number;
  };
  splData: {
    dataset: Array<{ x: number; y: number }>;
  };
}