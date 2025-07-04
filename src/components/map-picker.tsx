
'use client'

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useEffect } from 'react'
import type { UseFormSetValue } from 'react-hook-form'

// Fix for default icon issue with webpack
const defaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

interface MapPickerProps {
  lat?: number
  lng?: number
  setValue: UseFormSetValue<any>
}

function LocationMarker({ setValue, lat, lng }: MapPickerProps) {
  const map = useMapEvents({
    click(e) {
      setValue('latitude', e.latlng.lat, { shouldValidate: true })
      setValue('longitude', e.latlng.lng, { shouldValidate: true })
    },
  })

  useEffect(() => {
    // This effect runs when lat/lng props change, and flies to the new location.
    // It also handles the initial positioning of the map.
    if (lat !== undefined && lng !== undefined) {
      const targetZoom = map.getZoom() < 5 ? 13 : map.getZoom();
      map.flyTo([lat, lng], targetZoom)
    }
  }, [lat, lng, map])

  // Only render the marker if we have coordinates
  return lat === undefined || lng === undefined ? null : <Marker position={[lat, lng]} icon={defaultIcon} />
}

export default function MapPicker({ lat, lng, setValue }: MapPickerProps) {
  // MapContainer props should be immutable. We set a default view and let
  // the LocationMarker component handle dynamic position updates.
  return (
    <MapContainer
      center={[20, 0]} // A generic, static center
      zoom={2} // A generic, static zoom level
      scrollWheelZoom={false}
      className="h-full w-full z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker lat={lat} lng={lng} setValue={setValue} />
    </MapContainer>
  )
}
