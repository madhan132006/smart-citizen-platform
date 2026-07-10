import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Search, Navigation } from 'lucide-react';

// Fix for default Leaflet marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const locations = [
  { id: 1, name: 'City Hospital', position: [13.0827, 80.2707], type: 'healthcare' },
  { id: 2, name: 'Emergency Dispatch A', position: [13.1, 80.25], type: 'emergency' },
];

function LocationMarker() {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const map = useMap();

  useEffect(() => {
    map.locate().on("locationfound", function (e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
      map.flyTo(e.latlng, map.getZoom());
    });
  }, [map]);

  return position === null ? null : (
    <Marker position={position}>
      <Popup>You are here</Popup>
    </Marker>
  );
}

export default function MapOSM() {
  const [search, setSearch] = useState('');

  return (
    <div className="relative h-[400px] w-full rounded-2xl overflow-hidden border border-white/5 bg-slate-950">
      <div className="absolute top-4 left-4 z-[1000] flex gap-2">
        <input 
          type="text" 
          placeholder="Search location..." 
          className="bg-slate-900 border border-white/10 p-2 rounded-lg text-white text-xs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="bg-cyan-500/20 p-2 rounded-lg text-cyan-400">
          <Search size={16} />
        </button>
      </div>
      <MapContainer center={[13.0827, 80.2707]} zoom={12} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker />
        {locations.map((loc) => (
          <Marker key={loc.id} position={loc.position as [number, number]}>
            <Popup>{loc.name}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
