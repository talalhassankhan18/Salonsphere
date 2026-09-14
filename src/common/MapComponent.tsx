"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

type Salon = {
  name: string;
  latitude: number;
  longitude: number;
};

export default function MapComponent({ salons }: { salons: Salon[] }) {
  return (
    <MapContainer
      center={[24.8607, 67.0011]} // Karachi coordinates
      zoom={10}
      style={{ height: "500px", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {salons.map((salon, index) => (
        <Marker key={index} position={[salon.latitude, salon.longitude]}>
          <Popup>{salon.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
