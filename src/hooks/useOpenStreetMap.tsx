import { useRef, useState } from 'react'
import L, { Map as LeafletMap } from 'leaflet';

// Types
import type { MapConfig } from "../types/common";
import { DEFAULT_MAP_CONFIG } from '../constants/map'

export const useMap = (config: Partial<MapConfig> = {}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const mapInstance = useRef<LeafletMap | null>(null);

  const initMap = (element: HTMLDivElement) => {
    try {
      setIsLoading(true);

      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }

      const map = L.map(element, {
        zoomControl: false,
        preferCanvas: true,
      }).setView(
        [config.center?.lat ?? DEFAULT_MAP_CONFIG.center.lat, config.center?.lng ?? DEFAULT_MAP_CONFIG.center.lng],
        config.zoom ?? DEFAULT_MAP_CONFIG.zoom
      );

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
        crossOrigin: true,
      }).addTo(map);

      if (config.zoomControl ? config.zoomControl : DEFAULT_MAP_CONFIG.zoomControl) {
        L.control.zoom({
          position: 'bottomleft'
        }).addTo(map);
      }

      mapInstance.current = map;
    } 
    catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to initialize map'));
    } 
    finally {
      setIsLoading(false);
    }
  };


  return {
    initMap,
    isLoading,
    error,
    mapInstance,
  };
};