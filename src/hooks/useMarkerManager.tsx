import { useState, useCallback } from 'react';
import L, { Map as LeafletMap, Marker, divIcon } from 'leaflet';
import type { LatLngExpression } from 'leaflet';

export const useMarkerManager = (map: LeafletMap | null) =>{
  const [markers, setMarkers] = useState<Marker[]>([]);

  const clearMarkers = useCallback(() => {
    setMarkers((prevMarkers) => {
      prevMarkers.forEach((marker) => marker.remove());
      return [];
    });
  }, []);

  const clearMarkerByLocation = useCallback(async (location: { lat: number; lng: number }) => {
    setMarkers((prevMarkers) => {
      const updatedMarkers = prevMarkers.filter((marker) => {
        const markerLatLng = marker.getLatLng();
        
        const isSame = 
          markerLatLng.lat.toFixed(6) === location.lat.toFixed(6) &&
          markerLatLng.lng.toFixed(6) === location.lng.toFixed(6);

        if (isSame) {
          marker.remove();
          return false;
        }
        return true;
      });
      return updatedMarkers;
    });
  }, []);


  const createMarker = (location: LatLngExpression, color: string = "#FF0000", isLocationWithLabel: boolean = false, markerTag: string = "") => {
    if (!map) return;

    const iconSVG = `
      <svg width="30px" height="40px" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M3.37892 10.2236L8 16L12.6211 10.2236C13.5137 9.10788 14 7.72154 14 6.29266V6C14 2.68629 11.3137 0 8 0C4.68629 0 2 2.68629 2 6V6.29266C2 7.72154 2.4863 9.10788 3.37892 10.2236ZM8 8C9.10457 8 10 7.10457 10 6C10 4.89543 9.10457 4 8 4C6.89543 4 6 4.89543 6 6C6 7.10457 6.89543 8 8 8Z" fill="${color}"/>
      </svg>
    `;

    let htmlContent = `<div style="position: relative; display: flex; align-items: center; justify-content: center;">${iconSVG}`;
    
    if (isLocationWithLabel && Array.isArray(location)) {
      const [lat, lng] = location;
      htmlContent += `
        <label style="position: absolute; bottom: -20px; left: 20px; color: white; background: black; padding: 5px 10px; border-radius: 5px; font-size: 14px; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">
          ${lat.toFixed(5)}, ${lng.toFixed(5)}
        </label>
      `;
    }

    htmlContent += `</div>`;

    const marker = L.marker(location, {
      icon: divIcon({
        html: htmlContent,
        className: '',
        iconSize: [30, 40],
      }),
    }).addTo(map);

    if (markerTag) {
      createToolTip(marker, location);
    }

    setMarkers([marker]);
  };

  const createMarkerWithList = (locations: {latLng: LatLngExpression, name: string}[], color: string = "#FF0000", isLocationWithLabel: boolean = false) => {
    if (!map) return;
    clearMarkers();

    const newMarkers: Marker[] = [];

    for (let i = 0; i < locations.length; i++) {
      const loc = locations[i];
      const iconSVG = `
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#000000" stroke-width="1" stroke-linecap="round" stroke-linejoin="miter"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M12,2a8,8,0,0,0-8,8c0,8,8,12,8,12s8-4,8-12A8,8,0,0,0,12,2Zm0,11a3,3,0,1,1,3-3A3,3,0,0,1,12,13Z" fill="${i === 0 ? "#FF0000" : color}" opacity="1" stroke-width="0"></path><path d="M20,10c0,8-8,12-8,12S4,18,4,10a8,8,0,0,1,16,0Z"></path><circle cx="12" cy="10" r="3"></circle></g></svg>
      `;

      let htmlContent = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
          ${iconSVG}
        </div>
      `;

      const marker = L.marker(loc.latLng, {
        icon: divIcon({
          html: htmlContent,
          className: '',
          iconSize: [30, 40],
        }),
      }).addTo(map);

      if (isLocationWithLabel && loc.latLng) {
        const latLng  = L.latLng(loc.latLng);
        createToolTip(marker, latLng);
        if (i === 0) {
          createPopup(marker, latLng);
          marker.openPopup();
        }
      }

      newMarkers.push(marker);
    };

    setMarkers(newMarkers);
  };

  const createToolTip = (marker: L.Marker<any>, latLng: LatLngExpression) => {
    const newLatLng = L.latLng(latLng);
    return marker.bindTooltip(
      `<div style="text-align: center;">
        <div>${newLatLng.lat.toFixed(5)}, ${newLatLng.lng.toFixed(5)}</div>
      </div>`,
      {
        permanent: false,
        direction: 'top',
        offset: [0, -10],
      }
    );
  }

  const createPopup = (marker: L.Marker<any>, latLng: LatLngExpression) => {
    const newLatLng = L.latLng(latLng);
    return marker.bindPopup(
      `<div style="text-align: center;">
        <div>
          ${newLatLng.lat.toFixed(5)}, ${newLatLng.lng.toFixed(5)}
        </div>
      </div>`,
      {
        closeButton: true,
        autoPan: true,
        className: "custom-map-popup",
      }
    );
  }

  return {
    clearMarkers,
    markers,
    clearMarkerByLocation,
    createMarker,
    createMarkerWithList,
  };
};