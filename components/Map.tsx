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
      el.style.cursor = 'pointer';
      
      const isSelected = selectedBar?.id === bar.id;
      const hasMatch = !!bar.currentMatch;
      
      el.innerHTML = `
        <div class="relative transition-transform hover:scale-110 ${isSelected ? 'scale-125' : ''}">
          <div class="w-12 h-12 rounded-full flex items-center justify-center shadow-2xl ${
            hasMatch 
              ? 'bg-gradient-to-br from-green-400 to-blue-500' 
              : 'bg-white/20 backdrop-blur-sm'
          } ${isSelected ? 'ring-4 ring-white' : ''}">
            <span class="text-2xl">${hasMatch ? '⚽' : '🍺'}</span>
          </div>
          ${hasMatch ? '<div class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>' : ''}
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
      <div className="w-full h-full flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-center p-8 max-w-md">
          <div className="text-6xl mb-4">🗺️</div>
          <h2 className="text-2xl font-bold mb-4">Karta laddas...</h2>
          <p className="text-gray-400 mb-6">
            Lägg till din Mapbox-token i .env.local
          </p>
          <div className="space-y-2">
            {bars.map((bar) => (
              <button
                key={bar.id}
                onClick={() => onSelectBar(bar)}
                className={`w-full text-left p-4 rounded-xl transition-all ${
                  selectedBar?.id === bar.id 
                    ? 'bg-white/20 border border-white/30' 
                    : 'bg-white/5 hover:bg-white/10 border border-transparent'
                }`}
              >
                <div className="font-bold">{bar.name}</div>
                <div className="text-xs text-gray-400 mt-1">{bar.address}</div>
                {bar.currentMatch && (
                  <div className="text-xs text-green-400 mt-2">⚽ {bar.currentMatch}</div>
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
