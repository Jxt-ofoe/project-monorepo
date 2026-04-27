"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

// Fix for default Leaflet marker icons in Next.js
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const DriverIcon = (color: string) => L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

interface FleetMapProps {
  drivers: any[];
  shipments: any[];
}

// Component to handle map view updates
function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}

export default function FleetMap({ drivers, shipments }: FleetMapProps) {
  // Center of Accra
  const defaultCenter: [number, number] = [5.6037, -0.1870];

  return (
    <MapContainer 
      center={defaultCenter} 
      zoom={13} 
      className="w-full h-full"
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      
      {drivers.map((driver) => (
        driver.currentLat && driver.currentLng && (
          <Marker 
            key={driver.id} 
            position={[driver.currentLat, driver.currentLng]}
            icon={DriverIcon(driver.status === 'available' ? '#10b981' : '#f59e0b')}
          >
            <Popup className="premium-popup">
              <div className="p-1">
                <p className="text-xs font-black uppercase text-slate-800">{driver.fullName}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{driver.status}</p>
                <p className="text-[10px] text-slate-400 mt-1">{driver.licenseNumber}</p>
              </div>
            </Popup>
          </Marker>
        )
      ))}

      {shipments.map((s) => (
        <div key={s.id}>
          {/* Pickup Marker */}
          <Marker 
            position={[s.pickupLat, s.pickupLng]} 
            icon={DefaultIcon}
          >
            <Popup>
              <div className="p-1">
                <p className="text-[10px] font-black uppercase text-slate-500">Pickup</p>
                <p className="text-xs font-bold text-slate-800">{s.trackingNumber}</p>
              </div>
            </Popup>
          </Marker>

          {/* Delivery Marker */}
          <Marker 
            position={[s.deliveryLat, s.deliveryLng]} 
            icon={DefaultIcon}
          >
             <Popup>
              <div className="p-1">
                <p className="text-[10px] font-black uppercase text-slate-500">Delivery</p>
                <p className="text-xs font-bold text-slate-800">{s.receiverName}</p>
              </div>
            </Popup>
          </Marker>
        </div>
      ))}
      
      <style jsx global>{`
        .premium-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          padding: 0;
          overflow: hidden;
        }
        .premium-popup .leaflet-popup-content {
          margin: 12px;
        }
      `}</style>
    </MapContainer>
  );
}
