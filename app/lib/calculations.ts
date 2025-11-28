import { Driver, Design } from './types';

/**
 * Ported from oldapp/js/controllers.js - calTS method
 * Calculates derived driver parameters based on Thiele-Small parameters
 */
export function calculateDriverParameters(driver: Partial<Driver>): Partial<Driver> {
  const pi = 3.14;
  const ro = 1.18;
  const c = 345;

  // Map driver size to displacement (sd)
  const sizeToDisplacement: Record<number, number> = {
    6: 165,
    8: 220,
    10: 220,
    12: 530,
    15: 890,
    18: 1300,
  };

  const sd = driver.size && sizeToDisplacement[driver.size] ? sizeToDisplacement[driver.size] : driver.sd || 0;

  // Calculate dd3 (displacement cubed equivalent, normalized by size)
  const dd3 = driver.size
    ? Math.round(100 * (Math.pow((driver.size - 1) / 3, 2) * 3.14 * (driver.size / 2) * 0.016)) / 100
    : 0;

  // Ensure qts is calculated from qms and qes if not provided
  const qts =
    driver.qts ||
    (driver.qms && driver.qes ? 1 / (1 / driver.qms + 1 / driver.qes) : driver.qts || 0.5);

  // Volume displacement (Vd)
  const vd = sd && driver.xmax ? (sd * driver.xmax) / 10 : 0;

  // Efficiency reference (n0)
  const n0 =
    driver.fs && driver.vas && driver.qes
      ? 9.64 * Math.pow(10, -10) * Math.pow(driver.fs, 3) * (driver.vas / driver.qes)
      : 0;

  // Sound pressure level at 1W/1m
  const spl = n0 ? 112 + 10 * Math.log10(n0) : 0;

  // K1 - acoustic power index
  const k1 =
    driver.fs && vd
      ? (4 * Math.pow(pi, 3) * ro) / c * Math.pow(driver.fs, 4) * Math.pow(vd / 1000000, 2)
      : 0;

  // K2 - acoustic power level
  const k2 = k1 ? 112 + 10 * Math.log10(k1) : 0;

  // Recommended ported enclosure volume (Vb)
  const recPortedVb =
    driver.vas && qts
      ? Math.round(100 * (20 * driver.vas * Math.pow(qts, 3.3))) / 100
      : 0;

  // -3dB frequency for ported enclosure
  const recPortedF3 =
    driver.fs && recPortedVb && driver.vas
      ? Math.round(100 * (Math.pow(driver.vas / recPortedVb, 0.44) * driver.fs)) / 100
      : 0;

  // Tuning frequency for ported enclosure
  const recPortedFb =
    driver.fs && recPortedVb && driver.vas
      ? Math.round(100 * (Math.pow(driver.vas / recPortedVb, 0.31) * driver.fs)) / 100
      : 0;

  // Recommended sealed enclosure volume (Vb)
  // Using Thiele-Small alignment formula with Butterworth target (Qtc = 0.577)
  //
  // EQUATIONS TESTED:
  // 1. Vb = Vas * Qts (too small)
  // 2. Vb = Vas / (2*Qts^2 - 1) (Butterworth, equivalent to #4)
  // 3. Vb = Vas / Qts (inverse, too large)
  // 4. Vb = Vas / [(Qtc/Qts)^2 - 1] where Qtc = 0.577 (Butterworth alignment) ← SELECTED
  // 5. Vb = 1.5 * Vas (simple rule of thumb, fallback)
  // 6. Vb = Vas / (2*(Qts^2 - 0.5)) (critical damping formula)
  //
  // FINAL IMPLEMENTATION: Using form #4 (Thiele-Small with Butterworth alignment)
  // Qtc = 0.577 provides optimal flat bass response with smooth rolloff
  const QTC_BUTTERWORTH = 0.577;
  const recSealedVb =
    driver.vas
      ? (() => {
          if (!qts || qts <= 0) return 0;
          const denom = Math.pow(QTC_BUTTERWORTH / qts, 2) - 1;
          if (denom > 0.1) {
            // Butterworth alignment: Vb = Vas / [(Qtc/Qts)^2 - 1]
            return Math.round(100 * (driver.vas / denom)) / 100;
          } else {
            // Fallback to simple rule of thumb if alignment invalid
            return Math.round(100 * (driver.vas * 1.5)) / 100;
          }
        })()
      : 0;

  // -3dB frequency for sealed enclosure
  const recSealedFb =
    driver.fs && recSealedVb && driver.vas
      ? Math.round(100 * (Math.pow(driver.vas / recSealedVb, 0.5) * driver.fs)) / 100
      : 0;

  // -3dB frequency for sealed enclosure (F3)
  // For sealed enclosures with Butterworth alignment (Qtc = 0.577)
  const recSealedF3 =
    driver.fs && recSealedVb && driver.vas
      ? Math.round(100 * (Math.pow(driver.vas / recSealedVb, 0.31) * driver.fs)) / 100
      : 0;

  // EBP - Efficiency bandwidth product
  const ebp = driver.fs && driver.qes ? driver.fs / driver.qes : 0;

  // Acoustic power (Par)
  const par =
    recPortedF3 && vd
      ? 3 * Math.pow(recPortedF3, 4) * Math.pow(vd, 2)
      : 0;

  // Acoustic power efficiency (Per)
  const per = n0 ? par / n0 : 0;

  // Peak SPL at rated RMS power
  const peakSPL =
    driver.rms && spl
      ? spl + 10 * Math.log10(driver.rms)
      : 0;

  // Brand + Model name
  const brandModel = driver.brand && driver.model ? `${driver.brand} : ${driver.model}` : '';

  return {
    sd,
    dd3,
    qts,
    vd,
    n0,
    spl,
    k1,
    k2,
    recPortedVb,
    recPortedF3,
    recPortedFb,
    recSealedVb,
    recSealedFb,
    recSealedF3,
    ebp,
    par,
    per,
    peakSPL,
    brandModel,
  };
}

/**
 * Merges calculated fields into a driver object
 */
export function enrichDriver(driver: Partial<Driver>): Driver {
  const calculated = calculateDriverParameters(driver);
  return {
    id: driver.id || '',
    brand: driver.brand || '',
    model: driver.model || '',
    size: driver.size || 0,
    fs: driver.fs || 0,
    qms: driver.qms || 0,
    qes: driver.qes || 0,
    qts: calculated.qts as number,
    vas: driver.vas || 0,
    xmax: driver.xmax || 0,
    sd: calculated.sd as number,
    rms: driver.rms || 0,
    re: driver.re,
    le: driver.le,
    ...calculated,
  } as Driver;
}

/**
 * Ported from oldapp/js/controllers.js - calPort, calPlot, calBox methods
 * Calculates design parameters: port dimensions, box dimensions, and SPL curve
 */
export function calculateDesignParameters(design: Partial<Design>, driver: Driver): Partial<Design> {
  const pi = 3.14;
  const ro = 1.18;
  const c = 345;

  // Port calculations only for ported designs
  let dminRecCm = 0;
  let dminRecIn = 0;
  let dminActualCm = 0;
  let dminActualIn = 0;
  let dminOuterCm = 0;
  let dminOuterIn = 0;
  let portAreaCm = 0;
  let portAreaIn = 0;
  let portWidthCm = 0;
  let portWidthIn = 0;
  let portHeightCm = 0;
  let portHeightIn = 0;

  if (design.type === 'Ported') {
    // Port diameter calculation (Dmin)
    dminRecCm =
      design.fb && design.nod && driver.vd && design.np
        ? Math.round(10000 * ((20.3 * Math.pow(Math.pow((driver.vd / 1000000) * design.nod, 2) / design.fb, 0.25)) / Math.sqrt(design.np))) / 100
        : 0;

    dminRecIn = dminRecCm ? Math.round(100 * (dminRecCm * 0.393701)) / 100 : 0;

    dminActualCm = design.dmin?.actual?.cm || dminRecCm;
    dminActualIn = design.dmin?.actual?.in || dminRecIn;

    dminOuterCm = dminActualCm;
    dminOuterIn = dminActualIn;

    // Port area
    portAreaCm =
      dminActualCm > 0
        ? Math.round(100 * (pi * Math.pow(dminActualCm / 2, 2))) / 100
        : 0;

    portAreaIn =
      dminActualIn > 0
        ? Math.round(100 * (pi * Math.pow(dminActualIn / 2, 2))) / 100
        : 0;

    // Port dimensions
    portWidthCm = design.port?.width?.cm || driver.size * 2.54;
    portWidthIn = design.port?.width?.in || driver.size;

    portHeightCm =
      portWidthCm > 0
        ? Math.round(100 * (portAreaCm / portWidthCm)) / 100
        : 0;

    portHeightIn =
      portWidthIn > 0
        ? Math.round(100 * (portAreaIn / portWidthIn)) / 100
        : 0;
  }

  // Recalculate TS based on multi-driver setup
  const designVd = design.nod && driver.sd && driver.xmax
    ? (driver.sd * design.nod * driver.xmax) / 10
    : 0;

  const designN0 = design.nod && driver.fs && driver.vas && driver.qes
    ? 9.64 * Math.pow(10, -10) * Math.pow(driver.fs, 3) * ((driver.vas * design.nod) / driver.qes)
    : 0;

  const designSpl = designN0 ? 112 + 10 * Math.log10(designN0) : 0;

  const designK1 = designVd && driver.fs
    ? (4 * Math.pow(pi, 3) * ro) / c * Math.pow(driver.fs, 4) * Math.pow(designVd / 1000000, 2)
    : 0;

  const designK2 = designK1 ? 112 + 10 * Math.log10(designK1) : 0;

  const designPar = driver.recPortedF3 && designVd
    ? 3 * Math.pow(driver.recPortedF3, 4) * Math.pow(designVd, 2)
    : 0;

  const designPer = designN0 ? designPar / designN0 : 0;

  const designPeakSpl = design.nod && driver.rms && designSpl
    ? designSpl + 10 * Math.log10(driver.rms * design.nod)
    : 0;

  // Port length calculation (lv) - only for ported designs
  let lvCm = 0;
  let lvIn = 0;
  let lvCmRounded = 0;
  
  if (design.type === 'Ported') {
    lvCm = design.fb && design.vb && (design.np || 1) && dminActualCm > 0
      ? (23562.5 * Math.pow(dminActualCm, 2) * (design.np || 1)) / (design.vb * Math.pow(design.fb, 2)) - (dminActualCm * 0.732)
      : 0;

    lvIn = lvCm ? Math.round(100 * (lvCm * 0.393701)) / 100 : 0;
    lvCmRounded = lvCm ? Math.round(100 * lvCm) / 100 : 0;
  }

  // Transfer function coefficients for SPL curve
  // For sealed boxes: fb is the frequency at which we calculate (typically Fb from driver)
  // For ported boxes: fb is the tuning frequency
  const A = design.fb && driver.fs ? Math.pow(design.fb / driver.fs, 2) : 0;
  
  let B = 0;
  let C = 0;
  let D = 0;
  let E = 0;

  if (design.type === 'Ported') {
    // Ported enclosure transfer function
    B = design.fb && driver.fs && driver.qts
      ? A / driver.qts + design.fb / (7 * driver.fs)
      : 0;
    C = design.fb && design.vb && design.nod && driver.vas && driver.fs && driver.qts
      ? 1 + A + (driver.vas * design.nod) / design.vb + design.fb / (driver.fs * driver.qts * 7)
      : 0;
    D = design.fb && driver.fs && driver.qts
      ? 1 / driver.qts + design.fb / (driver.fs * 7)
      : 0;
    E = A ? (97 / 49) * A : 0;
  } else {
    // Sealed enclosure transfer function
    // For sealed, fb is typically recSealedFb from driver
    // C coefficient uses volume instead of tuning frequency
    B = design.fb && driver.fs && driver.qts
      ? A / driver.qts + design.fb / (driver.fs * driver.qts * 7)
      : 0;
    C = design.vb && design.nod && driver.vas && driver.fs && driver.qts
      ? 1 + A + (driver.vas * design.nod) / design.vb
      : 0;
    D = design.fb && driver.fs && driver.qts
      ? 1 / driver.qts + design.fb / (driver.fs * driver.qts * 7)
      : 0;
    E = A ? (97 / 49) * A : 0;
  }

  // Generate SPL curve
  const splData: Array<{ x: number; y: number }> = [];
  if (driver.fs > 0 && A > 0) {
    for (let i = 10; i < 500; i = Math.round(i * 1.1)) {
      const F = i;
      const Fn2 = Math.pow(F / driver.fs, 2);
      const Fn4 = Math.pow(Fn2, 2);

      const dBmag =
        10 *
        Math.log10(
          Math.pow(Fn4, 2) /
          (Math.pow(Fn4 - C * Fn2 + A, 2) + Fn2 * Math.pow(D * Fn2 - B, 2))
        );

      const SPLmax =
        designK2 +
        10 *
        Math.log10(
          Math.pow(Fn4, 2) /
          (Fn4 - E * Fn2 + Math.pow(A, 2))
        );

      const SPLtherm = designPeakSpl + dBmag;
      const SPL = Math.round(100 * Math.min(SPLmax, SPLtherm)) / 100;

      splData.push({ x: F, y: SPL });
    }
  }

  // Box dimensions
  const boxWidthCm = design.box?.width?.cm || driver.size * 2.54 + 2;
  const boxWidthIn = design.box?.width?.in || driver.size + 2;

  const boxHeightCm = design.box?.height?.cm || driver.size * 2.54 + 2;
  const boxHeightIn = design.box?.height?.in || driver.size + 2;

  const bracingCm = design.bracing?.cm || 2.54;

  const boxDepthCm =
    boxWidthCm > 0 && boxHeightCm > 0
      ? (lvCmRounded * (design.np || 1) * dminOuterCm + 8 * bracingCm * boxWidthCm + 4 * bracingCm * boxHeightCm + 1000 * (driver.dd3 || 0) * (design.nod || 1) - 16 * Math.pow(bracingCm, 1 / 3) + 1000 * (design.vb || 0)) / (boxWidthCm * boxHeightCm)
      : 0;

  const boxDepthIn =
    boxDepthCm > 0
      ? Math.round(100 * (boxDepthCm / 2.54)) / 100
      : 0;

  return {
    box: {
      width: { cm: boxWidthCm, in: boxWidthIn },
      height: { cm: boxHeightCm, in: boxHeightIn },
      depth: { cm: Math.round(100 * boxDepthCm) / 100, in: boxDepthIn },
    },
    port: {
      area: { cm: portAreaCm, in: portAreaIn },
      width: { cm: portWidthCm, in: portWidthIn },
      height: { cm: portHeightCm, in: portHeightIn },
    },
    dmin: {
      actual: { cm: dminActualCm, in: dminActualIn },
      rec: { cm: dminRecCm, in: dminRecIn },
      outer: { cm: dminOuterCm, in: dminOuterIn },
    },
    bracing: {
      cm: bracingCm,
      in: Math.round(100 * (bracingCm / 2.54)) / 100,
    },
    lv: {
      cm: lvCmRounded,
      in: lvIn,
    },
    splData: {
      dataset: splData,
    },
  };
}

/**
 * Merge calculated fields into a design object
 */
export function enrichDesign(design: Partial<Design>, driver: Driver): Design {
  const calculated = calculateDesignParameters(design, driver);
  return {
    id: design.id || '',
    name: design.name || '',
    driverId: design.driverId || '',
    type: design.type || 'Ported',
    vb: design.vb || 0,
    fb: design.fb || 0,
    nod: design.nod || 1,
    np: design.np || 1,
    isDisplayed: design.isDisplayed ?? false,
    ...calculated,
  } as Design;
}
