"use client";

import "leaflet/dist/leaflet.css";

import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

const markerIcon = L.divIcon({
  html: '<div style="width:34px;height:34px;border-radius:13px;background:linear-gradient(135deg,#FF4D6D,#7C5CFC);border:3px solid white;box-shadow:0 8px 20px rgba(17,24,39,.22);display:grid;place-items:center;color:white;font-size:14px">♥</div>',
  className: "",
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

const points: Array<{
  position: [number, number];
  title: string;
  subtitle: string;
}> = [
  {
    position: [12.9719, 77.6412],
    title: "Slow Dating Social",
    subtitle: "Today · 7:00 PM",
  },
  {
    position: [12.9794, 77.6408],
    title: "Sunday Coffee Club",
    subtitle: "Tomorrow · 11:00 AM",
  },
  {
    position: [12.9667, 77.6358],
    title: "Board Games & Bites",
    subtitle: "Tomorrow · 5:30 PM",
  },
];

export default function EventsMap() {
  return (
    <MapContainer
      center={[12.973, 77.641]}
      zoom={14}
      zoomControl={false}
      className="h-full w-full"
      attributionControl
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {points.map((point) => (
        <Marker key={point.title} position={point.position} icon={markerIcon}>
          <Popup>
            <strong>{point.title}</strong>
            <br />
            {point.subtitle}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
