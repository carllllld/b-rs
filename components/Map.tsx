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
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token || token === 'your_mapbox_token_here') {
      setMapError(true);
      return;
    }

    mapboxgl.accessToken = token;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [18.0686, 59.3293], // Stockholm
        zoom: 12,
      });

      map.current.on('load', () => {
        setMapLoaded(true);
      });

      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
        setMapError(true);
      });
    } catch (error) {
      console.error('Failed to initialize map:', error);
      setMapError(true);
    }

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

  if (mapError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-dark-bg">
        <div className="text-center p-8 max-w-md">
          <div className="text-6xl mb-4">🗺️</div>
          <h2 className="text-2xl font-bold mb-4 text-accent-green">Karta (Mock Mode)</h2>
          <p className="text-gray-400 mb-4">
            Kartan körs i mock-läge. Lägg till din Mapbox-token i .env.local för att se den riktiga kartan.
          </p>
          <div className="bg-dark-card p-4 rounded-lg text-left">
            <p className="text-sm text-gray-500 mb-2">Sportbarer i Stockholm:</p>
            {bars.map((bar, index) => (
              <button
                key={bar.id}
                onClick={() => onSelectBar(bar)}
                className={`w-full text-left p-3 mb-2 rounded hover:bg-dark-bg transition-colors ${
                  selectedBar?.id === bar.id ? 'bg-accent-green/20 border border-accent-green' : 'bg-dark-bg'
                }`}
              >
                <div className="font-bold">{bar.name}</div>
                <div className="text-xs text-gray-400">{bar.address}</div>
                {bar.currentMatch && (
                  <div className="text-xs text-accent-green mt-1">⚽ {bar.currentMatch}</div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={mapContainer} className="w-full h-full" />
  );
}
