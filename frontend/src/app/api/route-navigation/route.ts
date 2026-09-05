import { NextRequest, NextResponse } from 'next/server';

interface Step {
  instruction: string;
  name: string;
  distanceMeters: number;
  durationSeconds: number;
  type: string;
  modifier?: string;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const waypoints = searchParams.get('waypoints'); // Format: "lng1,lat1;lng2,lat2;..."
  const mode = searchParams.get('mode') === 'walking' ? 'walking' : 'driving';

  if (!waypoints) {
    return NextResponse.json({ error: 'Missing waypoints' }, { status: 400 });
  }

  const osrmMode = mode === 'walking' ? 'foot' : 'driving';

  // Multi-provider endpoint list with fallback
  const endpoints = [
    mode === 'walking'
      ? `https://routing.openstreetmap.de/routed-foot/route/v1/driving/${waypoints}?overview=full&geometries=geojson&steps=true`
      : `https://routing.openstreetmap.de/routed-car/route/v1/driving/${waypoints}?overview=full&geometries=geojson&steps=true`,
    `https://router.project-osrm.org/route/v1/${osrmMode}/${waypoints}?overview=full&geometries=geojson&steps=true`,
  ];

  for (const url of endpoints) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(url, {
        headers: { 'User-Agent': 'ExperiencePlatform/1.0' },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) continue;
      const data = await res.json();

      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const coordinates = route.geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng]);

        const steps: Step[] = [];
        if (route.legs) {
          for (const leg of route.legs) {
            if (leg.steps) {
              for (const s of leg.steps) {
                const maneuver = s.maneuver || {};
                const name = s.name || s.ref || 'Road';
                let instruction = `Continue on ${name}`;

                if (maneuver.type === 'depart') {
                  instruction = `Head ${maneuver.modifier || 'forward'} on ${name}`;
                } else if (maneuver.type === 'arrive') {
                  instruction = `Arrive at destination`;
                } else if (maneuver.type === 'turn') {
                  instruction = `Turn ${maneuver.modifier || ''} onto ${name}`;
                } else if (maneuver.type === 'on ramp') {
                  instruction = `Take the ramp onto ${name}`;
                } else if (maneuver.type === 'roundabout') {
                  instruction = `Enter roundabout and take exit onto ${name}`;
                }

                steps.push({
                  instruction: instruction.replace(/\s+/g, ' ').trim(),
                  name,
                  distanceMeters: Math.round(s.distance || 0),
                  durationSeconds: Math.round(s.duration || 0),
                  type: maneuver.type || 'turn',
                  modifier: maneuver.modifier,
                });
              }
            }
          }
        }

        return NextResponse.json({
          success: true,
          provider: 'OpenStreetMap Real Road Engine (A* CH)',
          mode,
          polyline: coordinates,
          totalDistanceKm: Number((route.distance / 1000).toFixed(1)),
          totalDurationMin: Math.max(1, Math.round(route.duration / 60)),
          steps,
        });
      }
    } catch {
      // Continue to next provider
    }
  }

  return NextResponse.json(
    { error: 'Failed to compute real road route across providers' },
    { status: 502 }
  );
}
