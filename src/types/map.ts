import { Map as LeafletMap } from 'leaflet';
import type { LatLngExpression } from 'leaflet';

export interface MapConfig {
  mapId: string
  center: {
    lat: number
    lng: number
  }
  zoom: number
  panControl?: boolean
  zoomControl?: boolean
  mapTypeControl?: boolean
  streetViewControl?: boolean
  fullscreenControl?: boolean
}

export interface MapProps {
  height?: string
  width?: string
  panControl?: boolean
  zoomControl?: boolean
  mapTypeControl?: boolean
  streetViewControl?: boolean
  fullscreenControl?: boolean
  currentLocation?: boolean
  onMapLoad?: (mapInstance: LeafletMap | null) => void
}

export interface SearchResult {
  name: string
  location: LatLngExpression
  placeId?: string
}