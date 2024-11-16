import React, { useState, useCallback } from 'react';
import { MapContainer, TileLayer, Polygon, useMapEvents } from 'react-leaflet';
import { LatLng } from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface VineyardMapProps {
  coordinates: { lat: number; lng: number; }[];
  onChange: (coordinates: { lat: number; lng: number; }[]) => void;
  readOnly?: boolean;
}

const DrawingLayer: React.FC<{
  coordinates: { lat: number; lng: number; }[];
  onChange: (coordinates: { lat: number; lng: number; }[]) => void;
}> = ({ coordinates, onChange }) => {
  useMapEvents({
    click(e) {
      const newPoint = { lat: e.latlng.lat, lng: e.latlng.lng };
      onChange([...coordinates, newPoint]);
    }
  });

  return coordinates.length >= 3 ? (
    <Polygon 
      positions={coordinates as LatLng[]}
      pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.2 }}
    />
  ) : null;
};

export const VineyardMap: React.FC<VineyardMapProps> = ({ coordinates, onChange, readOnly = false }) => {
  const [center] = useState({ lat: 38.4192, lng: 27.1287 }); // İzmir merkez

  const handleReset = useCallback(() => {
    onChange([]);
  }, [onChange]);

  return (
    <div className="relative">
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '400px', width: '100%' }}
        className="rounded-lg shadow-md"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {!readOnly && (
          <DrawingLayer 
            coordinates={coordinates}
            onChange={onChange}
          />
        )}
        
        {readOnly && coordinates.length >= 3 && (
          <Polygon 
            positions={coordinates as LatLng[]}
            pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.2 }}
          />
        )}
      </MapContainer>

      {!readOnly && (
        <button
          onClick={handleReset}
          className="absolute top-2 right-2 bg-white px-3 py-1 rounded-md shadow-md text-sm text-gray-700 hover:bg-gray-100 z-[1000]"
        >
          Sıfırla
        </button>
      )}
      
      <div className="mt-2 text-sm text-gray-500">
        {!readOnly && 'Bağın sınırlarını belirlemek için harita üzerinde tıklayarak noktaları işaretleyin.'}
      </div>
    </div>
  );
};