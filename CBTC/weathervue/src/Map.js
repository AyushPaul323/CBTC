import React, { useRef, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIconUrl from './Img/marker.gif'; 

const Map=({ onMarkerMove }) => 
{
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  useEffect(()=>
    {
    mapRef.current = L.map('map',
    {
      center: [51.505,-0.09],
      zoom: 9
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    }).addTo(mapRef.current);
    const markerIcon = L.icon({
      iconUrl: markerIconUrl,
      iconSize: [89, 90],
      iconAnchor: [22, 94],
      popupAnchor: [-3, -76]
    });

    markerRef.current = L.marker([0, 0], { 
      icon: markerIcon,
      draggable: true
    });
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          mapRef.current.setView([latitude, longitude], 13);

          markerRef.current.setLatLng([latitude, longitude]); 
          markerRef.current.addTo(mapRef.current);
          markerRef.current.on('dragend', (event) => {
            const marker = event.target;
            onMarkerMove(marker.getLatLng());
          });
        },
        (error) => {
          console.error('Error getting user location:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }

    return () => {
      mapRef.current.remove();
    };
  }, []); 

  return (
    <div id="map" style={{ width: '100%', height: '400px' }} />
  );
};

export default Map;
