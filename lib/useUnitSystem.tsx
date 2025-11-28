import { useState, useEffect } from 'react';

export function useUnitSystem() {
  const [unitSystem, setUnitSystemState] = useState<'cm' | 'in'>('cm');
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('lsd-unit-system');
    if (saved === 'in' || saved === 'cm') {
      setUnitSystemState(saved);
    }
    setIsHydrated(true);
  }, []);

  // Save to localStorage whenever it changes
  const setUnitSystem = (unit: 'cm' | 'in') => {
    setUnitSystemState(unit);
    localStorage.setItem('lsd-unit-system', unit);
  };

  return { unitSystem, setUnitSystem, isHydrated };
}
