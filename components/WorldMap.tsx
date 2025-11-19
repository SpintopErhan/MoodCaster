import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MoodEntry, Location } from '../types';

// Ensure Leaflet default icons are fixed if needed (though we use custom divIcon)
// Leaflet CSS is in index.html

interface WorldMapProps {
  userLocation: Location;
  entries: MoodEntry[];
}

// Component to recenter map when user location is found
const RecenterMap = ({ location }: { location: Location }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([location.lat, location.lng], map.getZoom());
  }, [location, map]);
  return null;
};

const WorldMap: React.FC<WorldMapProps> = ({ userLocation, entries }) => {
  // Define bounds to restrict the map to one world instance
  const worldBounds: L.LatLngBoundsExpression = [[-90, -180], [90, 180]];

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer
        center={[userLocation.lat, userLocation.lng]}
        zoom={3}
        minZoom={2}
        maxBounds={worldBounds}
        maxBoundsViscosity={1.0}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%", background: '#0f172a' }}
        className="w-full h-full"
      >
        {/* Dark themed map tiles for Farcaster vibe */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          noWrap={true}
        />

        <RecenterMap location={userLocation} />

        {entries.map((entry) => {
          // Create a custom HTML icon for the emoji
          const icon = L.divIcon({
            className: 'emoji-marker',
            html: `<div>${entry.emoji}</div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15],
          });

          return (
            <Marker 
              key={entry.id} 
              position={[entry.lat, entry.lng]} 
              icon={icon}
            >
              <Popup>
                <div className="text-center p-1">
                  <div className="text-3xl mb-2">{entry.emoji}</div>
                  <div className="font-bold text-sm text-white mb-1">
                    {entry.isUser ? 'You' : 'Anonymous User'}
                  </div>
                  {entry.status && (
                    <div className="text-xs text-gray-300 bg-slate-700/50 p-1 rounded">
                      "{entry.status}"
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default WorldMap;