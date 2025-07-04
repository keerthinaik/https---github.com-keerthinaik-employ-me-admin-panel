
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
    if (lat !== undefined && lng !== undefined) {
      map.flyTo([lat, lng], map.getZoom())
    }
  }, [lat, lng, map])

  return lat === undefined || lng === undefined ? null : <Marker position={[lat, lng]} icon={defaultIcon} />
}

export default function MapPicker({ lat, lng, setValue }: MapPickerProps) {
  return (
    <MapContainer
      center={[lat || 51.505, lng || -0.09]}
      zoom={lat !== undefined && lng !== undefined ? 13 : 5}
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
