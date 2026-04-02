'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Bar } from '@/types';

interface MapProps {
  bars: Bar[];
  selectedBar: Bar | null;
  onSelectBar: (bar: Bar) => void;
}

export default function Map({ bars, selectedBar, onSelectBar }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      console.error('Mapbox token saknas');
      return;
    }

    mapboxgl.accessToken = token;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [18.0686, 59.3293], // Stockholm
      zoom: 12,
    });

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      markers.current.forEach(marker => marker.remove());
      map.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    bars.forEach(bar => {
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.width = '40px';
      el.style.height = '40px';
      el.style.cursor = 'pointer';
      el.innerHTML = `
        <div class="relative">
          <div class="w-10 h-10 bg-accent-green rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform ${
            selectedBar?.id === bar.id ? 'ring-4 ring-white' : ''
          }">
            <span class="text-2xl">🍺</span>
          </div>
          ${bar.currentMatch ? '<div class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>' : ''}
        </div>
      `;

      const marker = new mapboxgl.Marker(el)
        .setLngLat([bar.longitude, bar.latitude])
        .addTo(map.current!);

      el.addEventListener('click', () => {
        onSelectBar(bar);
      });

      markers.current.push(marker);
    });
  }, [bars, mapLoaded, selectedBar, onSelectBar]);

  useEffect(() => {
    if (selectedBar && map.current) {
      map.current.flyTo({
        center: [selectedBar.longitude, selectedBar.latitude],
        zoom: 15,
        duration: 1000,
      });
    }
  }, [selectedBar]);

  return (
    <div ref={mapContainer} className="w-full h-full" />
  );
}
