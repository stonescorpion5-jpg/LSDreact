'use client';

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { Driver, Design } from './types';
import { enrichDriver } from './calculations';
import { enrichDesign } from './calculations';
import { seedDrivers } from './seedData';

type AppStore = {
  drivers: Driver[];
  designs: Design[];
  addDriver: (driver: Omit<Driver, 'id'>) => Driver;
  editDriver: (driver: Driver) => void;
  removeDriver: (id: string) => void;
  addDesign: (design: Omit<Design, 'id'>) => Design;
  editDesign: (design: Design) => void;
  removeDesign: (id: string) => void;
};

const STORAGE_KEY = 'lsd-store-v10';
const SEED_KEY = 'lsd-store-seeded';

const defaultStore: AppStore = {
  drivers: [],
  designs: [],
  addDriver: () => {
    throw new Error('Not implemented');
  },
  editDriver: () => {
    throw new Error('Not implemented');
  },
  removeDriver: () => {
    throw new Error('Not implemented');
  },
  addDesign: () => {
    throw new Error('Not implemented');
  },
  editDesign: () => {
    throw new Error('Not implemented');
  },
  removeDesign: () => {
    throw new Error('Not implemented');
  },
};

const StoreContext = createContext<AppStore>(defaultStore);

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const seedingRef = useRef(false);
  
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [designs, setDesigns] = useState<Design[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Initialize on mount (client-side only)
  useEffect(() => {
    try {
      if (typeof window === 'undefined' || seedingRef.current) return;
      seedingRef.current = true;

      console.log('🔷 AppStore: Hydrating from localStorage...');
      
      // Clear old seed flag if it exists
      localStorage.removeItem(SEED_KEY);
      
      const raw = localStorage.getItem(STORAGE_KEY);

      if (!raw) {
        console.log('🌱 AppStore: No stored data found - seeding drivers...');
        const seededDrivers = seedDrivers.map((driverData, index) => {
          const id = `seed-driver-${index}-${Date.now()}`;
          const enriched = enrichDriver({ id, ...driverData });
          console.log(`✓ Enriched driver: ${enriched.brandModel}`);
          return enriched;
        });

        setDrivers(seededDrivers);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ drivers: seededDrivers, designs: [] }));
        console.log(`✓ Seeded ${seededDrivers.length} drivers`);
      } else {
        console.log('🔷 AppStore: Loading from localStorage...');
        const parsed = JSON.parse(raw);
        setDrivers(parsed.drivers || []);
        setDesigns(parsed.designs || []);
        console.log(`✓ Loaded ${(parsed.drivers || []).length} drivers`);
      }

      setIsHydrated(true);
    } catch (e) {
      console.error('❌ Error during hydration:', e);
      setIsHydrated(true);
    }
  }, []);

  // Persist changes to localStorage (only after hydration)
  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined') return;
    try {
      const payload = JSON.stringify({ drivers, designs });
      localStorage.setItem(STORAGE_KEY, payload);
    } catch (e) {
      console.error('Error persisting:', e);
    }
  }, [drivers, designs, isHydrated]);

  function addDriver(driverData: Omit<Driver, 'id'>) {
    const id = Date.now().toString();
    const enriched = enrichDriver({ id, ...driverData });
    setDrivers((s) => [enriched, ...s]);
    return enriched;
  }

  function editDriver(driver: Driver) {
    const enriched = enrichDriver(driver);
    setDrivers((s) => s.map((d) => (d.id === driver.id ? enriched : d)));
  }

  function removeDriver(id: string) {
    setDrivers((s) => s.filter((d) => d.id !== id));
  }

  const addDesign = useCallback((designData: Omit<Design, 'id'>) => {
    let enriched: Design | null = null;
    setDesigns((designs) => {
      // Get current drivers from closure
      const id = Date.now().toString();
      const driver = drivers.find((d) => d.id === designData.driverId);
      console.log('addDesign:', { driverId: designData.driverId, found: !!driver, driversCount: drivers.length });
      if (!driver) {
        console.error('Driver not found:', { driverId: designData.driverId, availableIds: drivers.map(d => d.id) });
        throw new Error('Driver not found');
      }
      enriched = enrichDesign({ id, ...designData }, driver);
      return [enriched, ...designs];
    });
    return enriched!;
  }, [drivers]);

  const editDesign = useCallback((design: Design) => {
    const driver = drivers.find((d) => d.id === design.driverId);
    console.log('editDesign:', { driverId: design.driverId, found: !!driver, driversCount: drivers.length });
    if (!driver) {
      console.error('Driver not found:', { driverId: design.driverId, availableIds: drivers.map(d => d.id) });
      throw new Error('Driver not found');
    }
    const enriched = enrichDesign(design, driver);
    setDesigns((s) => s.map((d) => (d.id === design.id ? enriched : d)));
  }, [drivers]);

  function removeDesign(id: string) {
    setDesigns((s) => s.filter((d) => d.id !== id));
  }

  const value: AppStore = {
    drivers,
    designs,
    addDriver,
    editDriver,
    removeDriver,
    addDesign,
    editDesign,
    removeDesign,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useAppStore() {
  return useContext(StoreContext);
}
