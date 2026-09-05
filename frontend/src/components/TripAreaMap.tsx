'use client';

import { useEffect, useRef, useState } from 'react';
import { Locate, Compass, Navigation, ExternalLink } from 'lucide-react';
import { SelectedExperience } from '@/lib/trip-session-store';

interface RealAreaMapProps {
  city?: string;
  initialUserLat?: number;
  initialUserLng?: number;
  stops: SelectedExperience[];
}

const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  mumbai: { lat: 18.9220, lng: 72.8347 },
  ahmedabad: { lat: 23.0225, lng: 72.5714 },
  jaipur: { lat: 26.9124, lng: 75.7873 },
  varanasi: { lat: 25.3176, lng: 82.9739 },
};

export function TripAreaMap({
  city = 'Mumbai',
  initialUserLat,
  initialUserLng,
  stops,
}: RealAreaMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const layerGroupRef = useRef<any>(null);

  const cityKey = (city || 'Mumbai').toLowerCase();
  const cityDefault = CITY_COORDINATES[cityKey] || CITY_COORDINATES.mumbai;

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>({
    lat: initialUserLat || cityDefault.lat,
    lng: initialUserLng || cityDefault.lng,
  });

  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Geolocation trigger
  function requestLiveLocation() {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setLocationStatus('Geolocation not supported by browser.');
      return;
    }

    setIsLocating(true);
    setLocationStatus('Pinpointing live GPS coordinates...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setUserLocation(coords);
        setIsLocating(false);
        setLocationStatus('GPS position locked.');

        // Pan real map to user
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([coords.lat, coords.lng], 14, { animate: true });
        }
      },
      (err) => {
        setIsLocating(false);
        setLocationStatus(
          err.code === 1
            ? 'Permission denied. Showing starting zone.'
            : 'Weak signal. Using circuit start point.'
        );
      },
      { enableHighAccuracy: true, timeout: 9000, maximumAge: 30000 }
    );
  }

  // Auto-locate once if no userLat provided
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation && !initialUserLat) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {},
        { enableHighAccuracy: false, timeout: 5000 }
      );
    }
  }, [initialUserLat]);

  // Leaflet Map Initialization and Layer Updates
  useEffect(() => {
    if (!isMounted || !mapContainerRef.current) return;

    let isSubscribed = true;

    async function initMap() {
      const L = (await import('leaflet')).default;

      if (!isSubscribed || !mapContainerRef.current) return;

      // Initialize map instance if not already present
      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [userLocation.lat, userLocation.lng],
          zoom: 13,
          zoomControl: false,
          attributionControl: false,
        });

        // Standard OpenStreetMap tiles (100% free, open, zero API key required)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map);

        // Custom position zoom control
        L.control.zoom({ position: 'bottomright' }).addTo(map);

        const layerGroup = L.layerGroup().addTo(map);
        layerGroupRef.current = layerGroup;
        mapInstanceRef.current = map;
      }

      const map = mapInstanceRef.current;
      const layerGroup = layerGroupRef.current;

      if (!map || !layerGroup) return;

      // Clear existing markers & route lines
      layerGroup.clearLayers();

      const routePoints: [number, number][] = [[userLocation.lat, userLocation.lng]];

      // 1. User Location Pulse Marker
      const userIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;">
            <div style="position: absolute; width: 36px; height: 36px; background-color: rgba(79, 163, 209, 0.35); border-radius: 9999px; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: absolute; width: 22px; height: 22px; background-color: rgba(79, 163, 209, 0.5); border-radius: 9999px;"></div>
            <div style="position: relative; width: 14px; height: 14px; background-color: #347F8C; border: 2.5px solid #FFFFFF; border-radius: 9999px; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon });
      userMarker.bindPopup(`
        <div style="padding: 6px; font-family: monospace; font-size: 11px;">
          <strong style="color: #347F8C; text-transform: uppercase;">You Are Here</strong>
          <div style="color: #3E4541; opacity: 0.8; margin-top: 2px;">${userLocation.lat.toFixed(4)}°N, ${userLocation.lng.toFixed(4)}°E</div>
        </div>
      `);
      layerGroup.addLayer(userMarker);

      // 2. Add Stop Markers
      stops.forEach((stop, idx) => {
        const stopLat = stop.candidateLat || (userLocation.lat + (idx + 1) * 0.007);
        const stopLng = stop.candidateLng || (userLocation.lng + (idx + 1) * 0.006);
        routePoints.push([stopLat, stopLng]);

        const stopIcon = L.divIcon({
          className: 'custom-map-pin',
          html: `
            <div style="background-color: #347F8C; color: #F7F4EA; border: 2px solid #FFFFFF; box-shadow: 0 4px 10px rgba(52, 127, 140, 0.4); border-radius: 9999px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-family: monospace; font-weight: bold; font-size: 12px;">
              ${idx + 1}
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([stopLat, stopLng], { icon: stopIcon });
        marker.bindPopup(`
          <div style="padding: 6px; max-width: 200px;">
            <div style="font-size: 10px; font-family: monospace; text-transform: uppercase; color: #347F8C; font-weight: bold;">
              Stop ${idx + 1} &bull; ${stop.category}
            </div>
            <strong style="font-size: 12px; color: #3E4541; display: block; margin-top: 2px; line-height: 1.2;">
              ${stop.title}
            </strong>
            <div style="font-size: 11px; font-family: monospace; color: #3E4541; opacity: 0.75; margin-top: 4px;">
              ₹${stop.priceMin}–₹${stop.priceMax} &bull; ${stop.city}
            </div>
          </div>
        `);
        layerGroup.addLayer(marker);
      });

      // 3. Draw Route Polyline
      if (routePoints.length > 1) {
        // Outline glow
        const outlinePolyline = L.polyline(routePoints, {
          color: '#8FAF82',
          weight: 7,
          opacity: 0.4,
          lineCap: 'round',
          lineJoin: 'round',
        });
        layerGroup.addLayer(outlinePolyline);

        // Core route
        const routePolyline = L.polyline(routePoints, {
          color: '#347F8C',
          weight: 3.5,
          dashArray: '8, 6',
          opacity: 0.9,
          lineCap: 'round',
          lineJoin: 'round',
        });
        layerGroup.addLayer(routePolyline);

        // Fit map bounds to encompass user and all stops
        const bounds = L.latLngBounds(routePoints);
        map.fitBounds(bounds, { padding: [45, 45], maxZoom: 15 });
      } else {
        map.setView([userLocation.lat, userLocation.lng], 14);
      }
    }

    initMap();

    return () => {
      isSubscribed = false;
    };
  }, [isMounted, userLocation, stops]);

  // Cleanup map on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const routeWaypoints = stops.map((s) => encodeURIComponent(s.title + ' ' + (s.city || city))).join('/');
  const externalRouteUrl = stops.length > 0
    ? `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${routeWaypoints}`
    : `https://www.google.com/maps/@${userLocation.lat},${userLocation.lng},14z`;

  return (
    <div className="bg-white rounded-3xl border border-[#D8D4C8] p-5 sm:p-6 shadow-sm overflow-hidden flex flex-col">
      {/* Map Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#D8D4C8] mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#4FA3D1]/15 text-[#347F8C] flex items-center justify-center">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-manifold text-sm uppercase tracking-wider text-[#3E4541] font-bold">
              Real Area Map & Live Route
            </h4>
            <p className="text-[11px] font-mono text-[#3E4541]/70">
              OpenStreetMap &bull; {city} &bull; {stops.length} stop{stops.length === 1 ? '' : 's'} linked
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={requestLiveLocation}
          disabled={isLocating}
          title="Detect Current GPS Location"
          className="inline-flex items-center gap-1.5 text-[11px] font-mono font-semibold uppercase tracking-wider text-[#347F8C] hover:text-[#2A6772] bg-[#F7F4EA] hover:bg-[#F7F4EA]/80 border border-[#D8D4C8] px-3 py-1.5 rounded-xl transition cursor-pointer active:scale-95"
        >
          <Locate className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin text-[#347F8C]' : ''}`} />
          <span>{isLocating ? 'Locating...' : 'Locate Me'}</span>
        </button>
      </div>

      {locationStatus && (
        <div className="mb-3 px-3 py-1.5 bg-[#4FA3D1]/10 rounded-xl text-[11px] font-mono text-[#347F8C] flex items-center justify-between">
          <span>{locationStatus}</span>
          <button onClick={() => setLocationStatus(null)} className="ml-2 font-bold hover:text-[#2A6772]">✕</button>
        </div>
      )}

      {/* Real Interactive Leaflet Container */}
      <div className="relative w-full aspect-[16/10] bg-[#F7F4EA] rounded-2xl border border-[#D8D4C8] overflow-hidden shadow-inner">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Legend */}
        <div className="absolute top-3 right-3 z-[400] bg-white/95 backdrop-blur-sm border border-[#D8D4C8] rounded-xl px-2.5 py-1.5 text-[10px] font-mono text-[#3E4541]/90 shadow-xs space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#347F8C] animate-pulse" />
            <span>You (Live GPS)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#8FAF82]" />
            <span>Stops (1-{stops.length || 0})</span>
          </div>
        </div>
      </div>

      {/* Bottom Footer Actions */}
      <div className="mt-3 pt-3 border-t border-[#D8D4C8] flex items-center justify-between text-xs">
        <span className="font-mono text-[11px] text-[#3E4541]/70">
          {stops.length === 0
            ? 'Select stops on the left to draw live route path'
            : `Continuous route across ${stops.length} stop${stops.length === 1 ? '' : 's'}`}
        </span>

        <a
          href={externalRouteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold uppercase text-[#347F8C] hover:text-[#2A6772] hover:underline"
        >
          <span>Open in Google Maps</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
