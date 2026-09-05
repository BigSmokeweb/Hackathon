/**
 * Mumbai Suburban Railway Network & A* Track Search Engine
 * Models Central, Western, and Harbour lines with real station coordinates,
 * line interchanges, and A* heuristic routing for multimodal transit (Walk -> Train -> Walk).
 */

export interface StationNode {
  id: string;
  name: string;
  lat: number;
  lng: number;
  lines: ('central' | 'western' | 'harbour')[];
  platforms?: string;
}

export interface TrainStep {
  type: 'walk_to_station' | 'drive_to_station' | 'train_ride' | 'interchange' | 'walk_to_dest' | 'drive_to_dest';
  instruction: string;
  stationName?: string;
  targetStation?: string;
  lineName?: string;
  stationsCount?: number;
  stationsList?: string[];
  distanceMeters: number;
  durationMin: number;
  isDrive?: boolean;
}

export interface RoadSegment {
  polyline: [number, number][];
  distanceKm: number;
  durationMin: number;
  isDrive: boolean;
  context: 'to_station' | 'to_dest';
}

export interface TrainSegment {
  polyline: [number, number][];
  stations: StationNode[];
  distanceKm: number;
  durationMin: number;
  lineName: string;
}

export interface MultimodalRouteResult {
  polyline: [number, number][]; // Full merged polyline
  roadSegments: RoadSegment[];
  trainSegments: TrainSegment[];
  walkToStationPolyline: [number, number][];
  trainPolyline: [number, number][];
  walkToDestPolyline: [number, number][];
  trainStationsOnRoute: StationNode[];
  totalDistanceKm: number;
  totalDurationMin: number;
  trainDurationMin: number;
  roadDurationMin: number;
  walkDurationMin: number;
  fareInr: number;
  startStation: StationNode;
  destStation: StationNode;
  steps: TrainStep[];
  mode: 'train';
  algorithm: string;
  summaryText?: string;
}

// 1. Mumbai Suburban Railway Stations Coordinates Database
export const MUMBAI_STATIONS: Record<string, StationNode> = {
  // --- CENTRAL LINE ---
  csmt: { id: 'csmt', name: 'CSMT (Chhatrapati Shivaji Maharaj Terminus)', lat: 18.9401, lng: 72.8354, lines: ['central', 'harbour'] },
  masjid: { id: 'masjid', name: 'Masjid Bunder', lat: 18.9525, lng: 72.8398, lines: ['central', 'harbour'] },
  sandhurst: { id: 'sandhurst', name: 'Sandhurst Road', lat: 18.9612, lng: 72.8402, lines: ['central', 'harbour'] },
  byculla: { id: 'byculla', name: 'Byculla', lat: 18.9748, lng: 72.8335, lines: ['central'] },
  chinchpokli: { id: 'chinchpokli', name: 'Chinchpokli', lat: 18.9868, lng: 72.8322, lines: ['central'] },
  currey_road: { id: 'currey_road', name: 'Currey Road', lat: 18.9950, lng: 72.8315, lines: ['central'] },
  parel: { id: 'parel', name: 'Parel', lat: 19.0062, lng: 72.8358, lines: ['central'] },
  dadar_central: { id: 'dadar_central', name: 'Dadar (Central)', lat: 19.0178, lng: 72.8437, lines: ['central', 'western'] },
  matunga_central: { id: 'matunga_central', name: 'Matunga', lat: 19.0275, lng: 72.8512, lines: ['central'] },
  sion: { id: 'sion', name: 'Sion', lat: 19.0396, lng: 72.8624, lines: ['central'] },
  kurla: { id: 'kurla', name: 'Kurla Junction', lat: 19.0657, lng: 72.8793, lines: ['central', 'harbour'] },
  vidyavihar: { id: 'vidyavihar', name: 'Vidyavihar', lat: 19.0792, lng: 72.8967, lines: ['central'] },
  ghatkopar: { id: 'ghatkopar', name: 'Ghatkopar', lat: 19.0863, lng: 72.9082, lines: ['central'] },
  vikhroli: { id: 'vikhroli', name: 'Vikhroli', lat: 19.1105, lng: 72.9287, lines: ['central'] },
  kanjurmarg: { id: 'kanjurmarg', name: 'Kanjurmarg', lat: 19.1278, lng: 72.9366, lines: ['central'] },
  bhandup: { id: 'bhandup', name: 'Bhandup', lat: 19.1437, lng: 72.9377, lines: ['central'] },
  nahur: { id: 'nahur', name: 'Nahur', lat: 19.1554, lng: 72.9463, lines: ['central'] },
  mulund: { id: 'mulund', name: 'Mulund', lat: 19.1726, lng: 72.9565, lines: ['central'] },
  thane: { id: 'thane', name: 'Thane', lat: 19.1860, lng: 72.9757, lines: ['central'] },
  kalwa: { id: 'kalwa', name: 'Kalwa', lat: 19.1989, lng: 72.9961, lines: ['central'] },
  mumbra: { id: 'mumbra', name: 'Mumbra', lat: 19.1764, lng: 73.0232, lines: ['central'] },
  diva: { id: 'diva', name: 'Diva Junction', lat: 19.1885, lng: 73.0428, lines: ['central'] },
  kopar: { id: 'kopar', name: 'Kopar', lat: 19.2081, lng: 73.0766, lines: ['central'] },
  dombivli: { id: 'dombivli', name: 'Dombivli', lat: 19.2184, lng: 73.0867, lines: ['central'] },
  thakurli: { id: 'thakurli', name: 'Thakurli', lat: 19.2278, lng: 73.0995, lines: ['central'] },
  kalyan: { id: 'kalyan', name: 'Kalyan Junction', lat: 19.2364, lng: 73.1306, lines: ['central'] },

  // --- WESTERN LINE ---
  churchgate: { id: 'churchgate', name: 'Churchgate', lat: 18.9322, lng: 72.8264, lines: ['western'] },
  marine_lines: { id: 'marine_lines', name: 'Marine Lines', lat: 18.9436, lng: 72.8239, lines: ['western'] },
  charni_road: { id: 'charni_road', name: 'Charni Road', lat: 18.9519, lng: 72.8190, lines: ['western'] },
  grant_road: { id: 'grant_road', name: 'Grant Road', lat: 18.9632, lng: 72.8166, lines: ['western'] },
  mumbai_central: { id: 'mumbai_central', name: 'Mumbai Central', lat: 18.9696, lng: 72.8194, lines: ['western'] },
  mahalaxmi: { id: 'mahalaxmi', name: 'Mahalaxmi', lat: 18.9827, lng: 72.8239, lines: ['western'] },
  lower_parel: { id: 'lower_parel', name: 'Lower Parel', lat: 18.9953, lng: 72.8300, lines: ['western'] },
  prabhadevi: { id: 'prabhadevi', name: 'Prabhadevi', lat: 19.0084, lng: 72.8329, lines: ['western'] },
  dadar_western: { id: 'dadar_western', name: 'Dadar (Western)', lat: 19.0186, lng: 72.8428, lines: ['western', 'central'] },
  matunga_road: { id: 'matunga_road', name: 'Matunga Road', lat: 19.0305, lng: 72.8427, lines: ['western'] },
  mahim: { id: 'mahim', name: 'Mahim Junction', lat: 19.0416, lng: 72.8441, lines: ['western', 'harbour'] },
  bandra: { id: 'bandra', name: 'Bandra Terminus / Local', lat: 19.0553, lng: 72.8404, lines: ['western', 'harbour'] },
  khar_road: { id: 'khar_road', name: 'Khar Road', lat: 19.0694, lng: 72.8378, lines: ['western'] },
  santacruz: { id: 'santacruz', name: 'Santacruz', lat: 19.0818, lng: 72.8405, lines: ['western'] },
  vile_parle: { id: 'vile_parle', name: 'Vile Parle', lat: 19.0995, lng: 72.8442, lines: ['western'] },
  andheri: { id: 'andheri', name: 'Andheri', lat: 19.1197, lng: 72.8464, lines: ['western', 'harbour'] },
  jogeshwari: { id: 'jogeshwari', name: 'Jogeshwari', lat: 19.1367, lng: 72.8491, lines: ['western'] },
  ram_mandir: { id: 'ram_mandir', name: 'Ram Mandir', lat: 19.1517, lng: 72.8488, lines: ['western'] },
  goregaon: { id: 'goregaon', name: 'Goregaon', lat: 19.1643, lng: 72.8491, lines: ['western', 'harbour'] },
  malad: { id: 'malad', name: 'Malad', lat: 19.1868, lng: 72.8486, lines: ['western'] },
  kandivali: { id: 'kandivali', name: 'Kandivali', lat: 19.2045, lng: 72.8522, lines: ['western'] },
  borivali: { id: 'borivali', name: 'Borivali', lat: 19.2294, lng: 72.8571, lines: ['western'] },
  dahisar: { id: 'dahisar', name: 'Dahisar', lat: 19.2505, lng: 72.8596, lines: ['western'] },
  mira_road: { id: 'mira_road', name: 'Mira Road', lat: 19.2809, lng: 72.8561, lines: ['western'] },
  bhayandar: { id: 'bhayandar', name: 'Bhayandar', lat: 19.3023, lng: 72.8528, lines: ['western'] },
  vasai_road: { id: 'vasai_road', name: 'Vasai Road', lat: 19.3809, lng: 72.8328, lines: ['western'] },
  virar: { id: 'virar', name: 'Virar', lat: 19.4542, lng: 72.8105, lines: ['western'] },

  // --- HARBOUR LINE ---
  wadala_road: { id: 'wadala_road', name: 'Wadala Road', lat: 19.0167, lng: 72.8583, lines: ['harbour'] },
  gtb_nagar: { id: 'gtb_nagar', name: 'Guru Tegh Bahadur Nagar', lat: 19.0342, lng: 72.8647, lines: ['harbour'] },
  chunabhatti: { id: 'chunabhatti', name: 'Chunabhatti', lat: 19.0504, lng: 72.8732, lines: ['harbour'] },
  tilak_nagar: { id: 'tilak_nagar', name: 'Tilak Nagar', lat: 19.0699, lng: 72.8932, lines: ['harbour'] },
  chembur: { id: 'chembur', name: 'Chembur', lat: 19.0622, lng: 72.9009, lines: ['harbour'] },
  govandi: { id: 'govandi', name: 'Govandi', lat: 19.0566, lng: 72.9149, lines: ['harbour'] },
  mankhurd: { id: 'mankhurd', name: 'Mankhurd', lat: 19.0494, lng: 72.9324, lines: ['harbour'] },
  vashi: { id: 'vashi', name: 'Vashi (Navi Mumbai)', lat: 19.0768, lng: 72.9983, lines: ['harbour'] },
  sanpada: { id: 'sanpada', name: 'Sanpada', lat: 19.0664, lng: 73.0116, lines: ['harbour'] },
  juinagar: { id: 'juinagar', name: 'Juinagar', lat: 19.0558, lng: 73.0195, lines: ['harbour'] },
  nerul: { id: 'nerul', name: 'Nerul', lat: 19.0335, lng: 73.0177, lines: ['harbour'] },
  seawoods: { id: 'seawoods', name: 'Seawoods Grand Central', lat: 19.0216, lng: 73.0182, lines: ['harbour'] },
  belapur: { id: 'belapur', name: 'CBD Belapur', lat: 19.0194, lng: 73.0392, lines: ['harbour'] },
  kharghar: { id: 'kharghar', name: 'Kharghar', lat: 19.0275, lng: 73.0678, lines: ['harbour'] },
  panvel: { id: 'panvel', name: 'Panvel Terminus', lat: 18.9894, lng: 73.1207, lines: ['harbour'] },
};

// 2. Sequential Station Order along Railway Lines
const CENTRAL_LINE_SEQUENCE = [
  'csmt', 'masjid', 'sandhurst', 'byculla', 'chinchpokli', 'currey_road', 'parel',
  'dadar_central', 'matunga_central', 'sion', 'kurla', 'vidyavihar', 'ghatkopar',
  'vikhroli', 'kanjurmarg', 'bhandup', 'nahur', 'mulund', 'thane', 'kalwa',
  'mumbra', 'diva', 'kopar', 'dombivli', 'thakurli', 'kalyan',
];

const WESTERN_LINE_SEQUENCE = [
  'churchgate', 'marine_lines', 'charni_road', 'grant_road', 'mumbai_central',
  'mahalaxmi', 'lower_parel', 'prabhadevi', 'dadar_western', 'matunga_road',
  'mahim', 'bandra', 'khar_road', 'santacruz', 'vile_parle', 'andheri',
  'jogeshwari', 'ram_mandir', 'goregaon', 'malad', 'kandivali', 'borivali',
  'dahisar', 'mira_road', 'bhayandar', 'vasai_road', 'virar',
];

const HARBOUR_LINE_SEQUENCE = [
  'csmt', 'masjid', 'sandhurst', 'wadala_road', 'gtb_nagar', 'chunabhatti',
  'kurla', 'tilak_nagar', 'chembur', 'govandi', 'mankhurd', 'vashi',
  'sanpada', 'juinagar', 'nerul', 'seawoods', 'belapur', 'kharghar', 'panvel',
];

// Graph Adjacency representation for A* search
interface TrackEdge {
  targetId: string;
  line: 'central' | 'western' | 'harbour' | 'interchange';
  distanceKm: number;
  durationMin: number;
}

const RAIL_GRAPH: Record<string, TrackEdge[]> = {};

function addEdge(a: string, b: string, line: 'central' | 'western' | 'harbour' | 'interchange', distKm: number, timeMin: number) {
  if (!RAIL_GRAPH[a]) RAIL_GRAPH[a] = [];
  if (!RAIL_GRAPH[b]) RAIL_GRAPH[b] = [];
  RAIL_GRAPH[a].push({ targetId: b, line, distanceKm: distKm, durationMin: timeMin });
  RAIL_GRAPH[b].push({ targetId: a, line, distanceKm: distKm, durationMin: timeMin });
}

// Build line edges from sequences
function buildLineEdges(sequence: string[], line: 'central' | 'western' | 'harbour') {
  for (let i = 0; i < sequence.length - 1; i++) {
    const s1 = MUMBAI_STATIONS[sequence[i]];
    const s2 = MUMBAI_STATIONS[sequence[i + 1]];
    if (s1 && s2) {
      const dist = haversineDistanceKm(s1.lat, s1.lng, s2.lat, s2.lng) * 1.15; // +15% track curve factor
      const time = Math.max(2, Math.round((dist / 45) * 60) + 1.5); // avg speed 45 km/h + 1.5 min dwell
      addEdge(sequence[i], sequence[i + 1], line, dist, time);
    }
  }
}

buildLineEdges(CENTRAL_LINE_SEQUENCE, 'central');
buildLineEdges(WESTERN_LINE_SEQUENCE, 'western');
buildLineEdges(HARBOUR_LINE_SEQUENCE, 'harbour');

// Physical Interchanges between lines
addEdge('dadar_central', 'dadar_western', 'interchange', 0.15, 5); // 5 min transfer
addEdge('csmt', 'csmt', 'interchange', 0, 3);
addEdge('kurla', 'kurla', 'interchange', 0, 4);
addEdge('mahim', 'bandra', 'western', 1.8, 3);

// Haversine formula (km)
export function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Find nearest railway station to any given lat/lng
export function findNearestStation(lat: number, lng: number): { station: StationNode; distanceKm: number } {
  let nearest: StationNode = MUMBAI_STATIONS.csmt;
  let minDistance = Infinity;

  for (const key of Object.keys(MUMBAI_STATIONS)) {
    const s = MUMBAI_STATIONS[key];
    const dist = haversineDistanceKm(lat, lng, s.lat, s.lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = s;
    }
  }

  return { station: nearest, distanceKm: minDistance };
}

// 3. A* Pathfinding Engine across Mumbai Train Tracks
export function runAStarTrainRouting(
  startStationId: string,
  destStationId: string
): {
  path: StationNode[];
  totalDistanceKm: number;
  totalDurationMin: number;
  linesUsed: string[];
} {
  if (startStationId === destStationId) {
    const st = MUMBAI_STATIONS[startStationId] || MUMBAI_STATIONS.csmt;
    return { path: [st], totalDistanceKm: 0, totalDurationMin: 0, linesUsed: [] };
  }

  const destNode = MUMBAI_STATIONS[destStationId];
  if (!destNode) {
    return { path: [], totalDistanceKm: 0, totalDurationMin: 0, linesUsed: [] };
  }

  // Priority Queue entries: [stationId, fCost, gCost]
  const openSet: Array<{ id: string; fCost: number; gCost: number }> = [
    {
      id: startStationId,
      fCost: heuristic(startStationId, destStationId),
      gCost: 0,
    },
  ];

  const cameFrom: Record<string, { fromId: string; edge: TrackEdge }> = {};
  const gCostMap: Record<string, number> = { [startStationId]: 0 };
  const closedSet = new Set<string>();

  function heuristic(fromId: string, toId: string): number {
    const s1 = MUMBAI_STATIONS[fromId];
    const s2 = MUMBAI_STATIONS[toId];
    if (!s1 || !s2) return 0;
    // Admissible heuristic: Haversine distance divided by max local train speed (70 km/h) * 60 min
    const distKm = haversineDistanceKm(s1.lat, s1.lng, s2.lat, s2.lng);
    return (distKm / 70) * 60;
  }

  while (openSet.length > 0) {
    // Sort to extract lowest fCost
    openSet.sort((a, b) => a.fCost - b.fCost);
    const current = openSet.shift()!;

    if (current.id === destStationId) {
      // Reconstruct track path
      const path: StationNode[] = [];
      const linesUsed = new Set<string>();
      let currId = destStationId;
      let totalDist = 0;
      let totalTime = 0;

      while (cameFrom[currId]) {
        path.unshift(MUMBAI_STATIONS[currId]);
        const record = cameFrom[currId];
        totalDist += record.edge.distanceKm;
        totalTime += record.edge.durationMin;
        if (record.edge.line !== 'interchange') {
          linesUsed.add(record.edge.line);
        }
        currId = record.fromId;
      }
      path.unshift(MUMBAI_STATIONS[startStationId]);

      return {
        path,
        totalDistanceKm: Number(totalDist.toFixed(1)),
        totalDurationMin: Math.round(totalTime),
        linesUsed: Array.from(linesUsed),
      };
    }

    closedSet.add(current.id);

    const neighbors = RAIL_GRAPH[current.id] || [];
    for (const edge of neighbors) {
      if (closedSet.has(edge.targetId)) continue;

      const tentativeG = current.gCost + edge.durationMin;
      const existingG = gCostMap[edge.targetId] ?? Infinity;

      if (tentativeG < existingG) {
        cameFrom[edge.targetId] = { fromId: current.id, edge };
        gCostMap[edge.targetId] = tentativeG;
        const f = tentativeG + heuristic(edge.targetId, destStationId);

        const openEntry = openSet.find((x) => x.id === edge.targetId);
        if (openEntry) {
          openEntry.fCost = f;
          openEntry.gCost = tentativeG;
        } else {
          openSet.push({ id: edge.targetId, fCost: f, gCost: tentativeG });
        }
      }
    }
  }

  // Fallback direct path
  const s1 = MUMBAI_STATIONS[startStationId];
  const s2 = MUMBAI_STATIONS[destStationId];
  return {
    path: s1 && s2 ? [s1, s2] : [],
    totalDistanceKm: s1 && s2 ? Number(haversineDistanceKm(s1.lat, s1.lng, s2.lat, s2.lng).toFixed(1)) : 0,
    totalDurationMin: 30,
    linesUsed: ['central'],
  };
}

/// Helper: Fetch real road/street route between two points.
// If distance > 5km: uses driving time and suggests drive / auto / cab.
// If distance <= 5km: uses walking time and suggests walk.
async function fetchRoadLeg(
  from: { lat: number; lng: number; title?: string },
  to: { lat: number; lng: number; title?: string },
  context: 'to_station' | 'to_dest'
): Promise<{
  polyline: [number, number][];
  distanceKm: number;
  durationMin: number;
  isDrive: boolean;
  step: TrainStep;
}> {
  const directDist = haversineDistanceKm(from.lat, from.lng, to.lat, to.lng);
  const initialIsDrive = directDist > 5.0; // Rule: if distance > 5km, drive time and suggest drive
  const mode = initialIsDrive ? 'driving' : 'walking';

  const waypointsParam = `${from.lng},${from.lat};${to.lng},${to.lat}`;
  const apiUrl = `/api/route-navigation?waypoints=${encodeURIComponent(waypointsParam)}&mode=${mode}`;

  let roadPolyline: [number, number][] = [[from.lat, from.lng], [to.lat, to.lng]];
  let roadDist = directDist * 1.25;
  let finalIsDrive = initialIsDrive;
  let duration = Math.max(2, Math.round((roadDist / (finalIsDrive ? 26 : 4.5)) * 60));

  try {
    const res = await fetch(apiUrl);
    if (res.ok) {
      const data = await res.json();
      if (data.polyline && data.polyline.length > 0) {
        roadPolyline = data.polyline;
        roadDist = data.totalDistanceKm || directDist;
        finalIsDrive = roadDist > 5.0 || initialIsDrive;
        if (finalIsDrive) {
          duration = data.mode === 'driving' && data.totalDurationMin
            ? data.totalDurationMin
            : Math.max(3, Math.round((roadDist / 26) * 60));
        } else {
          duration = data.totalDurationMin || Math.max(2, Math.round((roadDist / 4.5) * 60));
        }
      }
    }
  } catch (err) {
    console.warn('Road leg fetch error, falling back:', err);
  }

  roadDist = Number(roadDist.toFixed(1));
  const distLabel = roadDist > 1 ? `${roadDist} km` : `${Math.round(roadDist * 1000)}m`;
  const toLabel = to.title || 'destination';

  let stepType: TrainStep['type'];
  let instruction: string;

  if (context === 'to_station') {
    stepType = finalIsDrive ? 'drive_to_station' : 'walk_to_station';
    instruction = finalIsDrive
      ? `Take an auto / cab ~${distLabel} (~${duration} min) to ${toLabel}`
      : `Walk ~${distLabel} (~${duration} min) via city street to ${toLabel}`;
  } else {
    stepType = finalIsDrive ? 'drive_to_dest' : 'walk_to_dest';
    instruction = finalIsDrive
      ? `Take an auto / cab ~${distLabel} (~${duration} min) to ${toLabel}`
      : `Walk ~${distLabel} (~${duration} min) via city street to ${toLabel}`;
  }

  return {
    polyline: roadPolyline,
    distanceKm: roadDist,
    durationMin: duration,
    isDrive: finalIsDrive,
    step: {
      type: stepType,
      instruction,
      distanceMeters: Math.round(roadDist * 1000),
      durationMin: duration,
      isDrive: finalIsDrive,
    },
  };
}

export interface DestinationStop {
  lat: number;
  lng: number;
  title?: string;
}

// 4. Generate Full Multimodal Travel Plan: Auto/Walk -> Train -> Auto/Walk (Drive if >5km)
export async function calculateMumbaiTrainPlan(
  userLat: number,
  userLng: number,
  destinations: DestinationStop[] | { lat: number; lng: number; title?: string }
): Promise<MultimodalRouteResult> {
  const destArray: DestinationStop[] = Array.isArray(destinations)
    ? destinations
    : [destinations];

  if (destArray.length === 0) {
    destArray.push({ lat: 18.922, lng: 72.8347, title: 'Mumbai Gateway' });
  }

  let currentLoc: { lat: number; lng: number; title?: string } = {
    lat: userLat,
    lng: userLng,
    title: 'Your Location',
  };

  const allMergedPolyline: [number, number][] = [];
  const allWalkToStationPoly: [number, number][] = [];
  const allTrainPoly: [number, number][] = [];
  const allWalkToDestPoly: [number, number][] = [];
  const roadSegments: RoadSegment[] = [];
  const trainSegments: TrainSegment[] = [];
  const allStationsOnRoute: StationNode[] = [];
  const allSteps: TrainStep[] = [];

  let totalDistKm = 0;
  let totalDurMin = 0;
  let trainDurMin = 0;
  let roadDurMin = 0;
  let firstStartStation: StationNode | null = null;
  let lastDestStation: StationNode | null = null;

  for (let i = 0; i < destArray.length; i++) {
    const dest = destArray[i];
    const directHop = haversineDistanceKm(currentLoc.lat, currentLoc.lng, dest.lat, dest.lng);

    const stFromInfo = findNearestStation(currentLoc.lat, currentLoc.lng);
    const stToInfo = findNearestStation(dest.lat, dest.lng);

    if (!firstStartStation) firstStartStation = stFromInfo.station;
    lastDestStation = stToInfo.station;

    // Check if both points are in the same immediate neighborhood (< 2.5 km or same station)
    if (stFromInfo.station.id === stToInfo.station.id || directHop < 2.5) {
      const roadRes = await fetchRoadLeg(currentLoc, dest, 'to_dest');
      roadSegments.push({
        polyline: roadRes.polyline,
        distanceKm: roadRes.distanceKm,
        durationMin: roadRes.durationMin,
        isDrive: roadRes.isDrive,
        context: 'to_dest',
      });
      allMergedPolyline.push(...roadRes.polyline);
      allWalkToDestPoly.push(...roadRes.polyline);
      allSteps.push(roadRes.step);
      totalDistKm += roadRes.distanceKm;
      totalDurMin += roadRes.durationMin;
      roadDurMin += roadRes.durationMin;
    } else {
      // Inter-station transit on Mumbai local railway
      // 1. Road leg to boarding station (Drive if >5km, else Walk)
      const legToStation = await fetchRoadLeg(
        currentLoc,
        { lat: stFromInfo.station.lat, lng: stFromInfo.station.lng, title: stFromInfo.station.name },
        'to_station'
      );
      roadSegments.push({
        polyline: legToStation.polyline,
        distanceKm: legToStation.distanceKm,
        durationMin: legToStation.durationMin,
        isDrive: legToStation.isDrive,
        context: 'to_station',
      });
      allMergedPolyline.push(...legToStation.polyline);
      allWalkToStationPoly.push(...legToStation.polyline);
      allSteps.push(legToStation.step);
      totalDistKm += legToStation.distanceKm;
      totalDurMin += legToStation.durationMin;
      roadDurMin += legToStation.durationMin;

      // 2. Train ride along A* rail tracks
      const trainLeg = runAStarTrainRouting(stFromInfo.station.id, stToInfo.station.id);
      const trainCoords: [number, number][] = trainLeg.path.map((s) => [s.lat, s.lng]);
      const lineLabel = trainLeg.linesUsed.map((l) => l.toUpperCase() + ' LINE').join(' / ') || 'LOCAL TRAIN';
      trainSegments.push({
        polyline: trainCoords,
        stations: trainLeg.path,
        distanceKm: trainLeg.totalDistanceKm,
        durationMin: trainLeg.totalDurationMin,
        lineName: lineLabel,
      });
      allMergedPolyline.push(...trainCoords);
      allTrainPoly.push(...trainCoords);
      trainLeg.path.forEach((s) => {
        if (!allStationsOnRoute.some((existing) => existing.id === s.id)) {
          allStationsOnRoute.push(s);
        }
      });

      allSteps.push({
        type: 'train_ride',
        instruction: `Board ${lineLabel} local train from ${stFromInfo.station.name} to ${stToInfo.station.name} (${trainLeg.path.length} stations)`,
        stationName: stFromInfo.station.name,
        targetStation: stToInfo.station.name,
        lineName: lineLabel,
        stationsCount: trainLeg.path.length,
        stationsList: trainLeg.path.map((s) => s.name),
        distanceMeters: Math.round(trainLeg.totalDistanceKm * 1000),
        durationMin: trainLeg.totalDurationMin,
      });
      totalDistKm += trainLeg.totalDistanceKm;
      totalDurMin += trainLeg.totalDurationMin;
      trainDurMin += trainLeg.totalDurationMin;

      // 3. Road leg from arrival station to destination stop (Drive if >5km, else Walk)
      const legFromStation = await fetchRoadLeg(
        { lat: stToInfo.station.lat, lng: stToInfo.station.lng, title: stToInfo.station.name },
        dest,
        'to_dest'
      );
      roadSegments.push({
        polyline: legFromStation.polyline,
        distanceKm: legFromStation.distanceKm,
        durationMin: legFromStation.durationMin,
        isDrive: legFromStation.isDrive,
        context: 'to_dest',
      });
      allMergedPolyline.push(...legFromStation.polyline);
      allWalkToDestPoly.push(...legFromStation.polyline);
      allSteps.push(legFromStation.step);
      totalDistKm += legFromStation.distanceKm;
      totalDurMin += legFromStation.durationMin;
      roadDurMin += legFromStation.durationMin;
    }

    currentLoc = dest;
  }

  // Calculate fare (based on rail hops)
  const totalRailDist = allTrainPoly.length > 0 ? (totalDistKm * 0.75) : 10;
  const fare = totalRailDist < 10 ? 5 : totalRailDist < 25 ? 10 : totalRailDist < 45 ? 15 : 20;

  const startSt = firstStartStation || MUMBAI_STATIONS.csmt;
  const destSt = lastDestStation || MUMBAI_STATIONS.borivali;

  const summaryText = destArray.length > 1
    ? `Local train via ${startSt.name} & ${destSt.name} • ${destArray.length} stops • Auto/Drive suggested for legs > 5km`
    : `${startSt.name} to ${destSt.name} (${allStationsOnRoute.length} stations)`;

  return {
    polyline: allMergedPolyline,
    roadSegments,
    trainSegments,
    walkToStationPolyline: allWalkToStationPoly,
    trainPolyline: allTrainPoly,
    walkToDestPolyline: allWalkToDestPoly,
    trainStationsOnRoute: allStationsOnRoute,
    totalDistanceKm: Number(totalDistKm.toFixed(1)),
    totalDurationMin: Math.max(15, Math.round(totalDurMin)),
    trainDurationMin: Math.round(trainDurMin),
    roadDurationMin: Math.round(roadDurMin),
    walkDurationMin: Math.round(roadDurMin),
    fareInr: fare,
    startStation: startSt,
    destStation: destSt,
    steps: allSteps,
    mode: 'train',
    algorithm: 'A* Railway Network Router',
    summaryText,
  };
}
