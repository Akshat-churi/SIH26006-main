import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { 
  Navigation, Wind, Layers, Compass, MapPin, 
  Activity, ShieldAlert, Anchor, Ship, RefreshCw,
  Info, AlertTriangle, Eye, EyeOff, Radio,
  Search, X, Crosshair, ChevronRight, ChevronDown, ExternalLink, Gauge
} from "lucide-react";
import axios from "@/lib/api";

// 12 East Coast India Ports Geodata
const EAST_COAST_PORTS = [
  { id: "Paradip", name: "Paradip Port", locode: "INPPT", state: "Odisha", lat: 20.2644, lon: 86.6685, maxDraft: 14.5, congestion: "Low", queue: 9, waitHrs: 12 },
  { id: "Visakhapatnam", name: "Visakhapatnam Port", locode: "INVTZ", state: "Andhra Pradesh", lat: 17.6868, lon: 83.2185, maxDraft: 16.5, congestion: "Medium", queue: 16, waitHrs: 22 },
  { id: "Dhamra", name: "Dhamra Port", locode: "INDHM", state: "Odisha", lat: 20.8145, lon: 86.9634, maxDraft: 18.0, congestion: "Low", queue: 6, waitHrs: 10 },
  { id: "Haldia", name: "Haldia Dock Complex", locode: "INHAL", state: "West Bengal", lat: 22.0232, lon: 88.0645, maxDraft: 9.0, congestion: "High", queue: 18, waitHrs: 32 },
  { id: "Kolkata", name: "Kolkata (SMP Port)", locode: "INCCU", state: "West Bengal", lat: 22.5726, lon: 88.3639, maxDraft: 8.5, congestion: "High", queue: 14, waitHrs: 36 },
  { id: "Chennai", name: "Chennai Port", locode: "INMAA", state: "Tamil Nadu", lat: 13.0827, lon: 80.2707, maxDraft: 15.5, congestion: "High", queue: 22, waitHrs: 28 },
  { id: "Gangavaram", name: "Gangavaram Port", locode: "INGGW", state: "Andhra Pradesh", lat: 17.6200, lon: 83.2300, maxDraft: 19.5, congestion: "Low", queue: 7, waitHrs: 11 },
  { id: "Gopalpur", name: "Gopalpur Port", locode: "INGOP", state: "Odisha", lat: 19.3093, lon: 84.9667, maxDraft: 12.5, congestion: "Low", queue: 4, waitHrs: 14 },
  { id: "Kakinada", name: "Kakinada Deepwater", locode: "INKAK", state: "Andhra Pradesh", lat: 16.9891, lon: 82.2475, maxDraft: 13.0, congestion: "Medium", queue: 8, waitHrs: 18 },
  { id: "Krishnapatnam", name: "Krishnapatnam Port", locode: "INKRI", state: "Andhra Pradesh", lat: 14.2500, lon: 80.1200, maxDraft: 18.5, congestion: "Low", queue: 8, waitHrs: 13 },
  { id: "Kamarajar", name: "Kamarajar (Ennore)", locode: "INENR", state: "Tamil Nadu", lat: 13.2500, lon: 80.3300, maxDraft: 16.0, congestion: "Medium", queue: 11, waitHrs: 19 },
  { id: "V.O. Chidambaranar", name: "VOC Port (Tuticorin)", locode: "INTUT", state: "Tamil Nadu", lat: 8.7642, lon: 78.1348, maxDraft: 14.2, congestion: "Medium", queue: 10, waitHrs: 16 },
];

// High-Reliability Maritime & Tactical Tile Providers (No API Key Required, Zero Watermarks)
const BASEMAP_TILES = {
  dark: {
    id: "dark",
    name: "Tactical Dark",
    url: "https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    options: { maxZoom: 16, attribution: "Esri, HERE, Garmin, &copy; OpenStreetMap" }
  },
  satellite: {
    id: "satellite",
    name: "Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    options: { maxZoom: 18, attribution: "Esri, Maxar, Earthstar Geographics" }
  },
  osm: {
    id: "osm",
    name: "Standard",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    options: { maxZoom: 19, subdomains: ["a", "b", "c"], attribution: "&copy; OpenStreetMap" }
  }
};

// Realistic maritime waypoints generator for East Coast India supply corridors
export const PORT_COORDINATES_MAP = {
  Paradip: [20.2644, 86.6685],
  Visakhapatnam: [17.6868, 83.2185],
  Dhamra: [20.8145, 86.9634],
  Haldia: [22.0232, 88.0645],
  Kolkata: [22.5726, 88.3639],
  Chennai: [13.0827, 80.2707],
  Gangavaram: [17.6200, 83.2300],
  Gopalpur: [19.3093, 84.9667],
  Kakinada: [16.9891, 82.2475],
  Krishnapatnam: [14.2500, 80.1200],
  Kamarajar: [13.2500, 80.3300],
  "V.O. Chidambaranar": [8.7642, 78.1348],
  Tuticorin: [8.7642, 78.1348],
  Singapore: [1.2655, 103.8198],
  Newcastle: [-32.9283, 151.7817],
  "Hay Point": [-21.2858, 149.3000],
  Gladstone: [-23.8427, 151.2555],
  "Port Hedland": [-20.3167, 118.5760],
  "Richards Bay": [-28.8000, 32.0833],
  Durban: [-29.8587, 31.0218],
  Balikpapan: [-1.2654, 116.8312],
  Samarinda: [-0.5022, 117.1536],
  Taboneo: [-3.6167, 114.4833],
  Maputo: [-25.9692, 32.5732],
  "Ust-Luga": [59.6833, 28.3167],
  Vostochny: [42.7333, 133.0833]
};

export function getPortCoord(name, defaultPt) {
  if (!name) return defaultPt;
  if (PORT_COORDINATES_MAP[name]) return PORT_COORDINATES_MAP[name];
  const lower = String(name).toLowerCase();
  for (const [k, v] of Object.entries(PORT_COORDINATES_MAP)) {
    if (lower.includes(k.toLowerCase()) || k.toLowerCase().includes(lower)) {
      return v;
    }
  }
  return defaultPt;
}

// Realistic maritime waypoints generator for East Coast India supply corridors
export function generateNauticalWaypoints(origin, destination) {
  const originPt = getPortCoord(origin, [1.2655, 103.8198]);
  const destPt = getPortCoord(destination, [20.8145, 86.9634]);
  const lowerOrig = String(origin || "").toLowerCase();
  const lowerDest = String(destination || "").toLowerCase();

  // Reference safe coastal passage waypoints along India's East Coast (ordered North to South)
  // Deep-water navigation corridor (30-50 NM offshore) in the Bay of Bengal
  const EAST_COAST_CORRIDOR = [
    { name: "Haldia/Kolkata", lat: 21.80, lon: 88.30 },
    { name: "Dhamra",         lat: 20.80, lon: 87.35 },
    { name: "Paradip",        lat: 20.15, lon: 87.15 },
    { name: "Gopalpur",       lat: 19.10, lon: 85.50 },
    { name: "Visakhapatnam",  lat: 17.50, lon: 83.85 },
    { name: "Kakinada",       lat: 16.70, lon: 82.80 },
    { name: "Krishnapatnam",  lat: 14.20, lon: 80.65 },
    { name: "Chennai",        lat: 13.00, lon: 80.75 },
    { name: "Tuticorin",      lat: 8.50,  lon: 78.60 }
  ];

  const eastCoastNames = [
    "paradip", "visakhapatnam", "dhamra", "haldia", "kolkata",
    "chennai", "gangavaram", "gopalpur", "kakinada", "krishnapatnam",
    "kamarajar", "chidambaranar", "tuticorin"
  ];

  const isOrigEastCoast = eastCoastNames.some(ep => lowerOrig.includes(ep));
  const isDestEastCoast = eastCoastNames.some(ep => lowerDest.includes(ep));

  // Case A: Domestic Coastal Shipping (between any two Indian East Coast ports)
  if (isOrigEastCoast && isDestEastCoast) {
    const lat1 = originPt[0];
    const lat2 = destPt[0];
    const waypoints = [originPt];

    if (lat1 > lat2) {
      // Sailing North to South (e.g., Paradip -> Krishnapatnam, Dhamra -> Chennai)
      const inter = EAST_COAST_CORRIDOR.filter(p => p.lat < lat1 - 0.25 && p.lat > lat2 + 0.25);
      inter.forEach(p => waypoints.push([p.lat, p.lon]));
    } else {
      // Sailing South to North (e.g., Chennai -> Paradip, Krishnapatnam -> Dhamra)
      const inter = EAST_COAST_CORRIDOR.filter(p => p.lat > lat1 + 0.25 && p.lat < lat2 - 0.25).reverse();
      inter.forEach(p => waypoints.push([p.lat, p.lon]));
    }

    waypoints.push(destPt);
    return waypoints;
  }

  // Helper: Open-ocean entry into Bay of Bengal customized for target East Coast destination port
  const getBayOfBengalApproach = (destTargetPt) => {
    const targetLat = destTargetPt[0];
    const approachWaypoints = [];

    if (targetLat >= 20.0) {
      // Northern ports: Dhamra, Paradip, Haldia
      approachWaypoints.push([11.5, 90.0], [15.5, 88.5], [18.5, 87.5], [20.0, 87.2]);
    } else if (targetLat >= 16.0) {
      // Central ports: Visakhapatnam, Gopalpur, Gangavaram, Kakinada
      approachWaypoints.push([11.0, 88.5], [14.5, 86.0], [16.8, 84.2]);
    } else if (targetLat >= 12.0) {
      // South Central ports: Krishnapatnam, Chennai, Kamarajar
      approachWaypoints.push([9.5, 87.5], [12.0, 84.0], [13.8, 81.2]);
    } else {
      // Southern ports: Tuticorin / V.O. Chidambaranar
      approachWaypoints.push([6.5, 85.0], [5.8, 80.5], [7.5, 78.8]);
    }

    return approachWaypoints;
  };

  // Case B: Singapore / SE Asia Corridor (via Malacca Strait & Ten Degree Channel)
  if (!origin || lowerOrig.includes("singapore") || lowerOrig.includes("jurong") || lowerOrig.includes("malacca")) {
    const approach = getBayOfBengalApproach(destPt);
    return [
      originPt,
      [1.85, 102.50],
      [2.85, 101.00],
      [5.50, 98.00],
      [6.00, 95.00],
      [6.80, 93.50],
      ...approach,
      destPt
    ];
  }

  // Case C: Australia (Newcastle, Hay Point, Gladstone, Port Hedland)
  if (lowerOrig.includes("newcastle") || lowerOrig.includes("hay point") || lowerOrig.includes("gladstone") || lowerOrig.includes("hedland") || lowerOrig.includes("australia")) {
    const approach = getBayOfBengalApproach(destPt);
    const startPoints = lowerOrig.includes("hedland")
      ? [originPt, [-17.0, 115.0], [-12.0, 108.0], [-5.9, 105.8], [6.0, 95.0]]
      : [originPt, [-15.0, 147.0], [-10.5, 142.5], [-8.5, 115.5], [-5.9, 105.8], [6.0, 95.0]];
    return [
      ...startPoints,
      ...approach,
      destPt
    ];
  }

  // Case D: South / East Africa (Richards Bay, Durban, Maputo)
  if (lowerOrig.includes("richards") || lowerOrig.includes("durban") || lowerOrig.includes("maputo") || lowerOrig.includes("africa")) {
    const approach = destPt[0] < 12.0
      ? [[8.0, 79.5]]
      : destPt[0] < 16.0
        ? [[11.5, 81.5]]
        : [[12.0, 83.5], [16.5, 85.0]];
    return [
      originPt,
      [-16.0, 44.0],
      [-5.0, 65.0],
      [4.5, 76.0],
      [5.8, 80.5],
      [7.5, 82.5],
      ...approach,
      destPt
    ];
  }

  // Case E: Indonesia (Taboneo, Balikpapan, Samarinda)
  if (lowerOrig.includes("taboneo") || lowerOrig.includes("balikpapan") || lowerOrig.includes("samarinda") || lowerOrig.includes("indonesia")) {
    const approach = getBayOfBengalApproach(destPt);
    return [
      originPt,
      [-5.85, 105.85],
      [-2.0, 96.0],
      [3.5, 93.5],
      [7.0, 92.5],
      ...approach,
      destPt
    ];
  }

  // Case F: Inbound reverse (origin is Indian East Coast, destination is overseas)
  if (isOrigEastCoast && !isDestEastCoast) {
    const forwardRoute = generateNauticalWaypoints(destination, origin);
    return [...forwardRoute].reverse();
  }

  // Case G: General Nautical Corridors
  return [
    originPt,
    [Math.min(originPt[0], destPt[0]) + Math.abs(originPt[0] - destPt[0]) * 0.35, Math.max(originPt[1], destPt[1]) + 2.0],
    [Math.min(originPt[0], destPt[0]) + Math.abs(originPt[0] - destPt[0]) * 0.70, Math.max(destPt[1] + 1.0, 86.0)],
    destPt
  ];
}

// Computes position [lat, lon] and heading along waypoint path based on progress 0-100%
// The sea transit corridor completes cleanly between progress 0% and 100%.
// At progress 100%, the vessel arrives at the destination port berth.
export function calculateVesselPosOnRoute(waypoints, progress) {
  if (!waypoints || waypoints.length === 0) return null;
  if (waypoints.length === 1) {
    return { 
      pos: waypoints[0], 
      heading: 0, 
      traveledPoints: [waypoints[0]], 
      remainingPoints: [waypoints[0]] 
    };
  }

  const seaNorm = Math.max(0, Math.min(1, (progress || 0) / 100));
  
  const dists = [];
  let total = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    const dLat = waypoints[i+1][0] - waypoints[i][0];
    const dLon = waypoints[i+1][1] - waypoints[i][1];
    const d = Math.sqrt(dLat * dLat + dLon * dLon);
    dists.push(d);
    total += d;
  }

  if (total === 0) {
    return { 
      pos: waypoints[0], 
      heading: 0, 
      traveledPoints: [waypoints[0]], 
      remainingPoints: waypoints 
    };
  }

  // Explicitly sitting at source port at 0%
  if (seaNorm <= 0) {
    const p1 = waypoints[0];
    const p2 = waypoints[1];
    const dLonRad = ((p2[1] - p1[1]) * Math.PI) / 180;
    const p1LatRad = (p1[0] * Math.PI) / 180;
    const p2LatRad = (p2[0] * Math.PI) / 180;
    const y = Math.sin(dLonRad) * Math.cos(p2LatRad);
    const x = Math.cos(p1LatRad) * Math.sin(p2LatRad) -
              Math.sin(p1LatRad) * Math.cos(p2LatRad) * Math.cos(dLonRad);
    const heading = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
    return { 
      pos: waypoints[0], 
      heading, 
      traveledPoints: [waypoints[0]], 
      remainingPoints: waypoints 
    };
  }

  // Explicitly berthed at destination port at >= 100%
  if (seaNorm >= 1) {
    const pPrev = waypoints[waypoints.length - 2];
    const pLast = waypoints[waypoints.length - 1];
    const dLonRad = ((pLast[1] - pPrev[1]) * Math.PI) / 180;
    const pPrevLatRad = (pPrev[0] * Math.PI) / 180;
    const pLastLatRad = (pLast[0] * Math.PI) / 180;
    const y = Math.sin(dLonRad) * Math.cos(pLastLatRad);
    const x = Math.cos(pPrevLatRad) * Math.sin(pLastLatRad) -
              Math.sin(pPrevLatRad) * Math.cos(pLastLatRad) * Math.cos(dLonRad);
    const heading = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
    return { 
      pos: waypoints[waypoints.length - 1], 
      heading, 
      traveledPoints: waypoints, 
      remainingPoints: [waypoints[waypoints.length - 1]] 
    };
  }

  const target = seaNorm * total;
  let accumulated = 0;

  for (let i = 0; i < dists.length; i++) {
    if (accumulated + dists[i] >= target || i === dists.length - 1) {
      const segT = dists[i] > 0 ? (target - accumulated) / dists[i] : 0;
      const p1 = waypoints[i];
      const p2 = waypoints[i+1];
      const lat = p1[0] + (p2[0] - p1[0]) * segT;
      const lon = p1[1] + (p2[1] - p1[1]) * segT;

      const dLonRad = ((p2[1] - p1[1]) * Math.PI) / 180;
      const p1LatRad = (p1[0] * Math.PI) / 180;
      const p2LatRad = (p2[0] * Math.PI) / 180;

      const y = Math.sin(dLonRad) * Math.cos(p2LatRad);
      const x = Math.cos(p1LatRad) * Math.sin(p2LatRad) -
                Math.sin(p1LatRad) * Math.cos(p2LatRad) * Math.cos(dLonRad);
      const heading = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;

      const currentPos = [lat, lon];
      const traveledPoints = [...waypoints.slice(0, i + 1), currentPos];
      const remainingPoints = [currentPos, ...waypoints.slice(i + 1)];

      return { pos: currentPos, heading, traveledPoints, remainingPoints };
    }
    accumulated += dists[i];
  }

  return { 
    pos: waypoints[waypoints.length - 1], 
    heading: 0, 
    traveledPoints: waypoints, 
    remainingPoints: [waypoints[waypoints.length - 1]] 
  };
}

function createVesselMarkerHtml(vessel, heading, pulseColor, routePct) {
  return `
    <div class="relative cursor-pointer group" style="transform: rotate(${heading}deg); transform-origin: center center;">
      <!-- Steady Radar Halo Glow (Calm pulse, NO strobe / NO vibration) -->
      <div class="absolute -inset-2 rounded-full border border-cyan-400/40 bg-cyan-400/15 animate-pulse"></div>
      <div class="absolute -inset-1 rounded-full" style="background-color: ${pulseColor}25"></div>
      
      <!-- Forward Radar Beam -->
      <div class="absolute left-1/2 -top-8 -translate-x-1/2 w-0.5 h-8 pointer-events-none" style="background: linear-gradient(to top, ${pulseColor}, transparent)"></div>

      <svg width="40" height="40" viewBox="0 0 44 44" class="filter drop-shadow-xl">
        <line x1="22" y1="22" x2="22" y2="4" stroke="${pulseColor}" stroke-width="2" stroke-dasharray="3,2" />
        <path d="M22,3 C26.5,8.5 28.5,15.5 28.5,31 C28.5,37 25,40 22,40 C19,40 15.5,37 15.5,31 C15.5,15.5 17.5,8.5 22,3 Z" fill="${pulseColor}" stroke="#FFFFFF" stroke-width="2" />
        <rect x="18.5" y="14" width="7" height="4" fill="#0F172A" rx="0.5" />
        <rect x="18.5" y="20" width="7" height="4" fill="#0F172A" rx="0.5" />
        <rect x="19" y="28" width="6" height="5" fill="#0F172A" rx="1" />
        <circle cx="22" cy="7" r="2" fill="#FDE68A" />
      </svg>
      <div style="transform: rotate(-${heading}deg); transform-origin: center center; border-color: ${pulseColor}90;" class="absolute left-9 -top-4 whitespace-nowrap bg-slate-950/95 border px-2 py-0.5 rounded shadow-xl text-[10px] font-bold font-mono text-white flex items-center gap-1.5 pointer-events-none">
        <span class="w-2 h-2 rounded-full" style="background-color: ${pulseColor}"></span>
        <span>🚢 ${vessel.name || "Booked Vessel"}</span>
        <span class="text-amber-300 font-bold">(${routePct}%)</span>
      </div>
    </div>
  `;
}

export default function NauticalLeafletMap({
  selectedOrigin = "Singapore",
  selectedDestination = "Dhamra",
  showRoute: propShowRoute = false,
  showSimulation = false,
  bookedVessel = null,
  simProgress = 0,
  isPlaying = false,
  simSpeed = 1,
  weatherDelayActive = false,
  berthReallocated = false,
  portCongestionActive = false,
  portDiverted = false,
  waitingForTruckGateScan = false,
  gateCleared = false,
  onPortSelect,
  onVesselSelect
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersRef = useRef({});
  const markersRef = useRef({});
  const simElementsRef = useRef(null);

  // State
  const [fleet, setFleet] = useState([]);
  const [routeData, setRouteData] = useState(null);
  const [marineWeather, setMarineWeather] = useState(null);
  const [apiHealth, setApiHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVessel, setSelectedVessel] = useState(null);
  const [basemapStyle, setBasemapStyle] = useState("dark"); // 'dark' | 'ocean' | 'satellite' | 'osm'

  // Nearby East Coast Vessels Drawer & Filter State
  const [showNearbyDrawer, setShowNearbyDrawer] = useState(false);
  const [vesselFilterText, setVesselFilterText] = useState("");

  // Layer Visibility Toggles
  const [showSeamarks, setShowSeamarks] = useState(true);
  const [showVessels, setShowVessels] = useState(true);
  const [showRoute, setShowRoute] = useState(propShowRoute);
  const [showWeatherOverlay, setShowWeatherOverlay] = useState(true);

  // Map Controls Dropdown Menu State
  const [showMapMenu, setShowMapMenu] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMapMenu(false);
      }
    };
    if (showMapMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMapMenu]);

  // Synchronize showRoute when propShowRoute changes
  useEffect(() => {
    setShowRoute(propShowRoute);
  }, [propShowRoute]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center on Bay of Bengal & East Coast India maritime corridor
    const map = L.map(mapContainerRef.current, {
      center: [16.5, 87.0],
      zoom: 5,
      minZoom: 3,
      maxZoom: 14,
      zoomControl: false,
      attributionControl: false
    });

    // Custom Zoom control placed bottom-right
    L.control.zoom({ position: "bottomright" }).addTo(map);

    // 1. High-Precision Maritime Base Layer (Default: ESRI Tactical Dark, zero watermark)
    const baseCfg = BASEMAP_TILES[basemapStyle] || BASEMAP_TILES.dark;
    const baseLayer = L.tileLayer(baseCfg.url, baseCfg.options).addTo(map);

    // 2. OpenSeaMap Seamarks Layer (Navigational aids, lights, buoys, depth lines)
    const seamarksLayer = L.tileLayer("https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png", {
      maxZoom: 18,
      opacity: 0.85
    });
    if (showSeamarks) seamarksLayer.addTo(map);

    // Feature Groups
    const routeGroup = L.featureGroup().addTo(map);
    const simGroup = L.featureGroup().addTo(map);
    const portsGroup = L.featureGroup().addTo(map);
    const vesselsGroup = L.featureGroup().addTo(map);
    const weatherGroup = L.featureGroup().addTo(map);

    layersRef.current = {
      base: baseLayer,
      seamarks: seamarksLayer,
      route: routeGroup,
      sim: simGroup,
      ports: portsGroup,
      vessels: vesselsGroup,
      weather: weatherGroup
    };

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle Dynamic Basemap Style Switching
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (layersRef.current.base && map.hasLayer(layersRef.current.base)) {
      map.removeLayer(layersRef.current.base);
    }

    const cfg = BASEMAP_TILES[basemapStyle] || BASEMAP_TILES.dark;
    const newBase = L.tileLayer(cfg.url, cfg.options);
    newBase.addTo(map);
    layersRef.current.base = newBase;

    // Keep seamarks on top if enabled
    if (showSeamarks && layersRef.current.seamarks && map.hasLayer(layersRef.current.seamarks)) {
      layersRef.current.seamarks.bringToFront();
    }
  }, [basemapStyle]);

  // Handle Seamarks Toggle
  useEffect(() => {
    const map = mapInstanceRef.current;
    const seamarks = layersRef.current.seamarks;
    if (!map || !seamarks) return;

    if (showSeamarks) {
      if (!map.hasLayer(seamarks)) map.addLayer(seamarks);
    } else {
      if (map.hasLayer(seamarks)) map.removeLayer(seamarks);
    }
  }, [showSeamarks]);

  // Fetch Live Data (Fleet, Route, Weather, Health) with correct `/` prefix (avoiding `/api/api` duplicate)
  const fetchLiveData = async () => {
    setLoading(true);
    try {
      // 1. Live AIS Fleet from VesselAPI
      const fleetRes = await axios.get("/live/vessels");
      if (fleetRes.data && fleetRes.data.vessels) {
        setFleet(fleetRes.data.vessels);
      }

      // 2. Live Marine Weather from Open-Meteo
      const weatherRes = await axios.get("/live/marine-weather");
      if (weatherRes.data) {
        setMarineWeather(weatherRes.data);
      }

      // 3. API Health & Latency
      const healthRes = await axios.get("/system/api-health");
      if (healthRes.data) {
        setApiHealth(healthRes.data);
      }

      // 4. Live Nautical Route Plan (only when showRoute is enabled)
      if (showRoute) {
        const routeRes = await axios.post("/live/route-plan", {
          origin: selectedOrigin,
          destination: selectedDestination
        });
        if (routeRes.data && routeRes.data.waypoints) {
          setRouteData(routeRes.data);
        }
      } else {
        setRouteData(null);
      }
    } catch (err) {
      console.error("Failed to load live nautical data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setRouteData(null);
    fetchLiveData();
    const timer = setInterval(fetchLiveData, 45000); // 45s live sync
    return () => clearInterval(timer);
  }, [selectedOrigin, selectedDestination, showRoute]);

  // Real-time Dynamic Positional Drift (Dead-Reckoning every 2.5s)
  useEffect(() => {
    const moveTimer = setInterval(() => {
      setFleet((prevFleet) => {
        if (!prevFleet || prevFleet.length === 0) return prevFleet;
        return prevFleet.map((v) => {
          if (v.status === "At Anchor" || v.status === "Moored") return v;
          const speed = v.speedKnots || 13.5;
          const heading = v.heading || v.course || 0;
          // Dead-reckoning movement simulation: slight drift along heading vector
          const distDeg = (speed / 3600) * 0.05;
          const rad = (heading * Math.PI) / 180;
          const dLat = distDeg * Math.cos(rad);
          const dLon = distDeg * Math.sin(rad);
          const newLat = v.lat + dLat;
          const newLon = (v.lon || v.lng) + dLon;
          return {
            ...v,
            lat: newLat,
            lon: newLon,
            lng: newLon
          };
        });
      });
    }, 2500);
    return () => clearInterval(moveTimer);
  }, []);

  // Action: Scan & Zoom to Nearby East Coast India Vessels
  const handleScanNearbyVessels = () => {
    setShowVessels(true);
    setShowNearbyDrawer(true);
    fetchLiveData();
    const map = mapInstanceRef.current;
    if (map) {
      // Smoothly fly to frame the entire East Coast corridor
      map.flyTo([16.8, 84.2], 6.2, { animate: true, duration: 1.2 });
    }
  };

  // Action: Locate & Focus on Specific Vessel
  const handleFocusVessel = (v) => {
    setSelectedVessel(v);
    if (onVesselSelect) onVesselSelect(v);
    const map = mapInstanceRef.current;
    if (map) {
      map.flyTo([v.lat, v.lon || v.lng], 9, { animate: true, duration: 1.2 });
      const marker = markersRef.current[v.id];
      if (marker) {
        setTimeout(() => marker.openPopup(), 600);
      }
    }
  };


  // Render East Coast Ports on Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    const portsGroup = layersRef.current.ports;
    if (!map || !portsGroup) return;

    portsGroup.clearLayers();

    EAST_COAST_PORTS.forEach((port) => {
      const isSelected = port.id === selectedDestination;
      const isHigh = port.congestion === "High";
      const isMedium = port.congestion === "Medium";
      const color = isHigh ? "#EF4444" : isMedium ? "#F59E0B" : "#10B981";

      const iconHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group">
          <div class="absolute w-5 h-5 rounded-full animate-pulse opacity-25" style="background-color: ${color}"></div>
          <div class="w-3.5 h-3.5 rounded-full border-2 border-white shadow-md flex items-center justify-center ${isSelected ? 'ring-2 ring-cyan-400' : ''}" style="background-color: ${color}">
            <div class="w-1 h-1 rounded-full bg-white"></div>
          </div>
          <div class="absolute left-5 whitespace-nowrap bg-slate-900/90 border border-slate-700/80 px-2 py-0.5 rounded shadow text-[10px] font-semibold text-slate-200 pointer-events-none opacity-90 group-hover:opacity-100 transition-opacity">
            ${port.name} <span class="text-slate-400">(${port.queue} ships)</span>
          </div>
        </div>
      `;

      const markerIcon = L.divIcon({
        html: iconHtml,
        className: "custom-port-marker",
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      const marker = L.marker([port.lat, port.lon], { icon: markerIcon });

      marker.bindPopup(`
        <div class="p-2 font-sans text-slate-800 text-xs">
          <div class="font-bold text-sm text-slate-900 flex items-center gap-1.5">
            <span>⚓ ${port.name}</span>
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 font-mono text-slate-600">${port.locode}</span>
          </div>
          <div class="mt-2 grid grid-cols-2 gap-2 text-[11px]">
            <div><span class="text-slate-500">Max Draft:</span> <b>${port.maxDraft}m</b></div>
            <div><span class="text-slate-500">Congestion:</span> <b style="color: ${color}">${port.congestion}</b></div>
            <div><span class="text-slate-500">Vessels in Queue:</span> <b>${port.queue}</b></div>
            <div><span class="text-slate-500">Avg Waiting:</span> <b>${port.waitHrs} hrs</b></div>
          </div>
          <div class="mt-2 text-[10px] text-slate-500 border-t pt-1">East Coast India Deepwater Terminal</div>
        </div>
      `);

      marker.on("click", () => {
        if (onPortSelect) onPortSelect(port);
      });

      portsGroup.addLayer(marker);
    });
  }, [selectedDestination]);

  // Render Live AIS Fleet on Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    const vesselsGroup = layersRef.current.vessels;
    if (!map || !vesselsGroup) return;

    vesselsGroup.clearLayers();
    if (!showVessels) return;

    fleet.forEach((v) => {
      const heading = v.heading || v.course || 0;
      const isCapesize = v.category === "Capesize";
      const isPanamax = v.category === "Panamax";
      const isSelected = selectedVessel?.id === v.id;

      const hullColor = isCapesize ? "#F59E0B" : isPanamax ? "#06B6D4" : "#10B981";

      const vesselHtml = `
        <div class="relative cursor-pointer transition-transform duration-300 group" style="transform: rotate(${heading}deg); transform-origin: center center;">
          <svg width="32" height="32" viewBox="0 0 40 40" class="filter drop-shadow-md">
            <!-- Speed Vector Trail -->
            <line x1="20" y1="20" x2="20" y2="4" stroke="${hullColor}" stroke-width="2" stroke-dasharray="3,2" opacity="0.8" />
            <!-- Realistic Ship Top-Down Hull -->
            <path d="M20,4 C23,8 24,14 24,28 C24,34 22,36 20,36 C18,36 16,34 16,28 C16,14 17,8 20,4 Z" fill="${hullColor}" stroke="#ffffff" stroke-width="1.5" />
            <!-- Deckhouse / Bridge -->
            <rect x="18" y="24" width="4" height="6" fill="#0F172A" rx="1" />
            <!-- Bow Bulb -->
            <circle cx="20" cy="8" r="1.5" fill="#FFFFFF" />
          </svg>
          ${isSelected ? `<div class="absolute -inset-1.5 rounded-full border border-cyan-400 bg-cyan-400/20 animate-pulse pointer-events-none"></div>` : ''}
        </div>
      `;

      const shipIcon = L.divIcon({
        html: vesselHtml,
        className: "custom-ship-marker",
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([v.lat, v.lon || v.lng], { icon: shipIcon });

      markersRef.current[v.id] = marker;

      marker.bindPopup(`
        <div class="p-2.5 font-sans text-slate-800 text-xs min-w-[220px]">
          <div class="flex items-center justify-between border-b pb-1.5">
            <span class="font-bold text-sm text-slate-900">${v.name}</span>
            <span class="px-1.5 py-0.5 rounded text-[10px] font-bold text-white uppercase" style="background-color: ${hullColor}">${v.category}</span>
          </div>
          <div class="mt-2 space-y-1 text-[11px]">
            <div class="flex justify-between"><span class="text-slate-500">MMSI / IMO:</span> <span class="font-mono">${v.mmsi} / ${v.imo || 'N/A'}</span></div>
            <div class="flex justify-between"><span class="text-slate-500">Live Position:</span> <b class="font-mono text-cyan-800">${v.lat.toFixed(3)}°N, ${(v.lon || v.lng).toFixed(3)}°E</b></div>
            <div class="flex justify-between"><span class="text-slate-500">Speed Over Ground:</span> <b>${v.speedKnots} kn</b></div>
            <div class="flex justify-between"><span class="text-slate-500">Heading / Course:</span> <b>${heading}°</b></div>
            <div class="flex justify-between"><span class="text-slate-500">Draft / LOA:</span> <b>${v.draftM}m / ${v.loaM}m</b></div>
            <div class="flex justify-between"><span class="text-slate-500">Destination:</span> <b class="text-cyan-700">⚓ ${v.destinationPort || v.destination}</b></div>
            <div class="flex justify-between"><span class="text-slate-500">Nav Status:</span> <span class="text-emerald-600 font-semibold">${v.status}</span></div>
          </div>
          <div class="mt-2 text-[10px] text-slate-400 bg-slate-50 p-1 rounded flex items-center justify-between">
            <span class="text-emerald-600 font-bold">📡 VesselAPI Verified AIS</span>
            <span>Real-time Dynamic</span>
          </div>
        </div>
      `);

      marker.on("click", () => {
        setSelectedVessel(v);
        if (onVesselSelect) onVesselSelect(v);
      });

      vesselsGroup.addLayer(marker);
    });
  }, [fleet, showVessels, selectedVessel]);

  // Render Real Nautical Route on Map (Only when showRoute is true)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const routeGroup = layersRef.current.route;
    if (!map || !routeGroup) return;

    routeGroup.clearLayers();
    if (!showRoute) return;

    const rawWaypoints = (routeData && routeData.waypoints && routeData.waypoints.length > 0)
      ? routeData.waypoints.map(pt => [pt.lat, pt.lon || pt.lng])
      : generateNauticalWaypoints(selectedOrigin, selectedDestination);

    if (!rawWaypoints || rawWaypoints.length < 2) return;

    const latLngs = rawWaypoints;

    // Outer Glow / Corridor Ribbon
    const glowLine = L.polyline(latLngs, {
      color: "#06B6D4",
      weight: 6,
      opacity: 0.25,
      lineCap: "round"
    });

    // Core Nautical Polyline
    const coreLine = L.polyline(latLngs, {
      color: "#22D3EE",
      weight: 2.5,
      dashArray: "6, 6",
      opacity: 0.95
    });

    // Start Waypoint Pin (Origin)
    const startPt = latLngs[0];
    const startPin = L.circleMarker(startPt, {
      radius: 6,
      fillColor: "#F59E0B",
      color: "#FFFFFF",
      weight: 2,
      fillOpacity: 1
    }).bindPopup(`<b>Origin: ${selectedOrigin}</b><br/>Global Loading Terminal`);

    // End Waypoint Pin (Destination)
    const endPt = latLngs[latLngs.length - 1];
    const endPin = L.circleMarker(endPt, {
      radius: 7,
      fillColor: "#10B981",
      color: "#FFFFFF",
      weight: 2,
      fillOpacity: 1
    }).bindPopup(`<b>Destination: ${selectedDestination}</b><br/>East Coast Discharge Port`);

    routeGroup.addLayer(glowLine);
    routeGroup.addLayer(coreLine);
    routeGroup.addLayer(startPin);
    routeGroup.addLayer(endPin);

    // Auto-fit route in view with comfortable padding
    if (latLngs.length > 1) {
      try {
        map.fitBounds(L.latLngBounds(latLngs), { padding: [60, 60], maxZoom: 7 });
      } catch (e) {
        // ignore
      }
    }
  }, [routeData, showRoute, selectedOrigin, selectedDestination]);

  // Render Booked Vessel Simulation Marker on Route (Only when showRoute && showSimulation)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const simGroup = layersRef.current.sim;
    if (!map || !simGroup) return;

    if (!showRoute || !showSimulation) {
      simGroup.clearLayers();
      simElementsRef.current = null;
      return;
    }

    const rawWaypoints = (routeData && routeData.waypoints && routeData.waypoints.length > 0)
      ? routeData.waypoints.map(pt => [pt.lat, pt.lon || pt.lng])
      : generateNauticalWaypoints(selectedOrigin, selectedDestination);

    if (!rawWaypoints || rawWaypoints.length < 2) return;

    const vesselPosState = calculateVesselPosOnRoute(rawWaypoints, simProgress);
    if (!vesselPosState) return;

    const { pos, heading, traveledPoints, remainingPoints } = vesselPosState;
    const vessel = bookedVessel || { name: "MV Bengal Voyager", category: "Panamax" };

    const isIdleInSwell = weatherDelayActive && !berthReallocated && simProgress >= 55 && simProgress <= 60;
    const isBerthedAtPort = simProgress >= 99;
    const routePct = Math.min(100, Math.round(simProgress));

    const pulseColor = isIdleInSwell ? "#EF4444" : isBerthedAtPort ? "#10B981" : "#06B6D4";
    const statusText = isIdleInSwell 
      ? "⚠️ Swell Hold (0 kn) · Waiting Berth" 
      : isBerthedAtPort 
        ? `⚓ Berthed at ${selectedDestination} · Cargo Discharge Active` 
        : "13.6 kn · Underway on Sea Lane";

    const routeKey = `${selectedOrigin}->${selectedDestination}->${vessel.name}`;

    // Initialize or rebuild simulation layers only when the active corridor changes
    if (!simElementsRef.current || simElementsRef.current.key !== routeKey) {
      simGroup.clearLayers();

      const startPt = rawWaypoints[0];
      const endPt = rawWaypoints[rawWaypoints.length - 1];

      // 1. Origin Port Beacon (Soft steady glowing halo with calm pulse, no aggressive blinking)
      const startPinHtml = `
        <div class="relative flex items-center justify-center pointer-events-none">
          <div class="absolute w-7 h-7 rounded-full bg-amber-400/20 border border-amber-400/40 animate-pulse"></div>
          <div class="w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-white shadow-md"></div>
          <div class="absolute left-5 whitespace-nowrap bg-slate-950/90 border border-amber-400/80 px-2 py-0.5 rounded shadow text-[10px] font-bold font-mono text-amber-300">
            ⚓ ORIGIN: ${selectedOrigin}
          </div>
        </div>
      `;
      const startMarker = L.marker(startPt, {
        icon: L.divIcon({ html: startPinHtml, className: "sim-start-pin", iconSize: [16, 16], iconAnchor: [8, 8] }),
        zIndexOffset: 950
      }).addTo(simGroup);

      // 2. Destination Port Beacon (Soft steady glowing halo with calm pulse)
      const endPinHtml = `
        <div class="relative flex items-center justify-center pointer-events-none">
          <div class="absolute w-7 h-7 rounded-full bg-emerald-400/20 border border-emerald-400/40 animate-pulse"></div>
          <div class="w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-md"></div>
          <div class="absolute left-5 whitespace-nowrap bg-slate-950/90 border border-emerald-400/80 px-2 py-0.5 rounded shadow text-[10px] font-bold font-mono text-emerald-300">
            🎯 DESTINATION: ${selectedDestination}
          </div>
        </div>
      `;
      const endMarker = L.marker(endPt, {
        icon: L.divIcon({ html: endPinHtml, className: "sim-end-pin", iconSize: [16, 16], iconAnchor: [8, 8] }),
        zIndexOffset: 950
      }).addTo(simGroup);

      // 3. Traveled Wake Trail (Glowing emerald line from Source Port to Vessel)
      const traveledGlow = L.polyline(traveledPoints && traveledPoints.length > 1 ? traveledPoints : [startPt, startPt], {
        color: "#10B981",
        weight: 5,
        opacity: 0.35,
        lineCap: "round"
      }).addTo(simGroup);

      const traveledCore = L.polyline(traveledPoints && traveledPoints.length > 1 ? traveledPoints : [startPt, startPt], {
        color: "#34D399",
        weight: 3,
        opacity: 0.95,
        lineCap: "round"
      }).addTo(simGroup);

      // 4. Remaining Navigation Corridor (Bright cyan dashed line from Vessel to Destination)
      const remainingLine = L.polyline(remainingPoints && remainingPoints.length > 1 ? remainingPoints : rawWaypoints, {
        color: "#38BDF8",
        weight: 2.5,
        dashArray: "6, 6",
        opacity: 0.85
      }).addTo(simGroup);

      // 5. Booked Vessel Marker (Leaflet DivIcon updated smoothly without destroying DOM)
      const vesselMarker = L.marker(pos, {
        icon: L.divIcon({
          html: createVesselMarkerHtml(vessel, heading, pulseColor, routePct),
          className: "booked-vessel-marker",
          iconSize: [42, 42],
          iconAnchor: [21, 21]
        }),
        zIndexOffset: 1200
      }).addTo(simGroup);

      simElementsRef.current = {
        key: routeKey,
        startMarker,
        endMarker,
        traveledGlow,
        traveledCore,
        remainingLine,
        vesselMarker,
        swellMarker: null,
        congestionMarker: null
      };

      try {
        const bounds = L.latLngBounds([startPt, endPt, pos]);
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 6 });
      } catch (e) {}
    }

    const els = simElementsRef.current;
    if (!els) return;

    // Smoothly update polyline geometry (native Leaflet SVG coordinate update, zero DOM recreate)
    if (traveledPoints && traveledPoints.length > 1) {
      els.traveledGlow.setLatLngs(traveledPoints);
      els.traveledCore.setLatLngs(traveledPoints);
    }
    if (remainingPoints && remainingPoints.length > 1) {
      els.remainingLine.setLatLngs(remainingPoints);
    }

    // Smoothly update vessel position via setLatLng
    els.vesselMarker.setLatLng(pos);
    if (!simGroup.hasLayer(els.vesselMarker)) {
      els.vesselMarker.addTo(simGroup);
    }
    els.vesselMarker.setIcon(L.divIcon({
      html: createVesselMarkerHtml(vessel, heading, pulseColor, routePct),
      className: "booked-vessel-marker",
      iconSize: [42, 42],
      iconAnchor: [21, 21]
    }));

    els.vesselMarker.bindPopup(`
      <div class="p-2.5 font-sans text-slate-800 text-xs min-w-[240px]">
        <div class="flex items-center justify-between border-b pb-1.5">
          <span class="font-bold text-sm text-slate-900">${vessel.name || "Booked Vessel"}</span>
          <span class="px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase bg-emerald-600">BOOKED FIXTURE</span>
        </div>
        <div class="mt-2 space-y-1 text-[11px]">
          <div class="flex justify-between"><span class="text-slate-500">Category:</span> <b>${vessel.category || "Panamax"}</b></div>
          <div class="flex justify-between"><span class="text-slate-500">Active Corridor:</span> <b class="text-cyan-800">${selectedOrigin} ➔ ${selectedDestination}</b></div>
          <div class="flex justify-between"><span class="text-slate-500">Sea Transit:</span> <b class="text-emerald-600 font-mono">${routePct}% Completed</b></div>
          <div class="flex justify-between"><span class="text-slate-500">Live Heading:</span> <b class="font-mono">${Math.round(heading)}°</b></div>
          <div class="flex justify-between"><span class="text-slate-500">Speed / Status:</span> <b class="text-blue-900">${statusText}</b></div>
          <div class="flex justify-between"><span class="text-slate-500">Health Score:</span> <span class="text-emerald-600 font-bold">${vessel.healthScore || 96.8}/100</span></div>
        </div>
        <div class="mt-2 text-[10px] text-emerald-700 bg-emerald-50 p-1.5 rounded flex items-center justify-between border border-emerald-200">
          <span class="font-bold">✅ Synchronized Transit</span>
          <span>Role-Adaptive Active</span>
        </div>
      </div>
    `);

    // Scenario 1: Swell Marker handling (gentle pulse, NO strobe / NO vibration)
    if (isIdleInSwell) {
      if (!els.swellMarker) {
        const swellIcon = L.divIcon({
          html: `
            <div class="relative flex items-center justify-center pointer-events-none">
              <div class="w-14 h-14 rounded-full border-2 border-amber-400 bg-amber-500/10 animate-pulse"></div>
              <div class="absolute whitespace-nowrap bg-amber-950/95 border border-amber-400 text-amber-200 px-2 py-0.5 rounded font-mono text-[9px] font-bold top-11 shadow-lg">
                ⚠️ MONSOON SWELL (+10H)
              </div>
            </div>
          `,
          className: "swell-delay-marker",
          iconSize: [56, 56],
          iconAnchor: [28, 28]
        });
        els.swellMarker = L.marker(pos, { icon: swellIcon, zIndexOffset: 900 }).addTo(simGroup);
      } else {
        els.swellMarker.setLatLng(pos);
      }
    } else if (els.swellMarker) {
      simGroup.removeLayer(els.swellMarker);
      els.swellMarker = null;
    }

    // Scenario 2: Congestion Alert at destination port (gentle pulse)
    if (portCongestionActive && !portDiverted) {
      if (!els.congestionMarker) {
        const endPt = rawWaypoints[rawWaypoints.length - 1];
        const congIcon = L.divIcon({
          html: `
            <div class="relative flex items-center justify-center pointer-events-none">
              <div class="w-12 h-12 rounded-full border border-red-500 bg-red-500/15 animate-pulse"></div>
              <div class="absolute whitespace-nowrap bg-red-950/95 border border-red-500 text-red-200 px-2 py-0.5 rounded font-mono text-[9px] font-bold -top-8 shadow-lg">
                🚨 HEAVY CONGESTION (32H DELAY)
              </div>
            </div>
          `,
          className: "congestion-marker",
          iconSize: [48, 48],
          iconAnchor: [24, 24]
        });
        els.congestionMarker = L.marker(endPt, { icon: congIcon, zIndexOffset: 960 }).addTo(simGroup);
      }
    } else if (els.congestionMarker) {
      simGroup.removeLayer(els.congestionMarker);
      els.congestionMarker = null;
    }
  }, [showRoute, showSimulation, simProgress, routeData, selectedOrigin, selectedDestination, bookedVessel, weatherDelayActive, berthReallocated, portCongestionActive, portDiverted, gateCleared]);

  // Render Weather & Wave Height Overlay
  useEffect(() => {
    const map = mapInstanceRef.current;
    const weatherGroup = layersRef.current.weather;
    if (!map || !weatherGroup) return;

    weatherGroup.clearLayers();
    if (!showWeatherOverlay) return;

    const waveHeight = typeof marineWeather?.waveHeightMeters === 'number' 
      ? marineWeather.waveHeightMeters.toFixed(1) 
      : (parseFloat(marineWeather?.waveHeightMeters) || 2.5).toFixed(1);
    const swellHeight = typeof marineWeather?.swellHeightMeters === 'number' 
      ? marineWeather.swellHeightMeters.toFixed(1) 
      : (parseFloat(marineWeather?.swellHeightMeters) || 1.8).toFixed(1);
    const risk = marineWeather?.riskLevel || "Moderate Swell (Sea State 3)";

    // Bay of Bengal Central Wave Telemetry Marker
    const weatherHtml = `
      <div class="bg-slate-900/90 backdrop-blur-md border border-cyan-500/40 px-3 py-2 rounded-lg shadow-2xl text-slate-100 flex items-center gap-3">
        <div class="p-1.5 bg-cyan-500/20 text-cyan-400 rounded-md">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M2 12c.6 0 1.2-.4 1.5-1 1-2 3-2 4 0 .3.6.9 1 1.5 1s1.2-.4 1.5-1c1-2 3-2 4 0 .3.6.9 1 1.5 1s1.2-.4 1.5-1c1-2 3-2 4 0 .3.6.9 1 1.5 1" />
            <path d="M2 18c.6 0 1.2-.4 1.5-1 1-2 3-2 4 0 .3.6.9 1 1.5 1s1.2-.4 1.5-1c1-2 3-2 4 0 .3.6.9 1 1.5 1s1.2-.4 1.5-1c1-2 3-2 4 0 .3.6.9 1 1.5 1" />
          </svg>
        </div>
        <div>
          <div class="text-[10px] text-cyan-300 font-semibold uppercase tracking-wider">Bay of Bengal Telemetry</div>
          <div class="text-xs font-bold flex items-center gap-2">
            <span>Wave: ${waveHeight}m</span>
            <span class="text-slate-400">•</span>
            <span>Swell: ${swellHeight}m</span>
          </div>
          <div class="text-[10px] text-amber-300 mt-0.5">${risk}</div>
        </div>
      </div>
    `;

    const weatherIcon = L.divIcon({
      html: weatherHtml,
      className: "weather-overlay-marker",
      iconSize: [220, 60],
      iconAnchor: [110, 30]
    });

    // Anchor at Central Bay of Bengal (15.5°N, 87.5°E)
    const weatherMarker = L.marker([15.5, 87.5], { icon: weatherIcon });
    weatherGroup.addLayer(weatherMarker);
  }, [marineWeather, showWeatherOverlay]);

  const filteredFleet = vesselFilterText
    ? fleet.filter(v => 
        v.name.toLowerCase().includes(vesselFilterText.toLowerCase()) ||
        v.category.toLowerCase().includes(vesselFilterText.toLowerCase()) ||
        (v.destinationPort && v.destinationPort.toLowerCase().includes(vesselFilterText.toLowerCase()))
      )
    : fleet;

  return (
    <div className="relative w-full h-full min-h-[580px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col">
      
      {/* Top HUD Floating Control Bar */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        
        {/* Left: Origin ➔ Destination Route Banner (Hidden when showRoute is false) */}
        {showRoute && (
          <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-4 py-2 rounded-xl shadow-xl flex items-center gap-3">
            <div className="p-2 bg-cyan-500/20 text-cyan-400 rounded-lg">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                {showSimulation ? "Active Vessel Transit Simulation" : "Active Nautical Sea-Lane"}
              </div>
              <div className="text-sm font-extrabold text-white flex items-center gap-2">
                <span className="text-amber-400">{selectedOrigin}</span>
                <span className="text-slate-500 font-mono">━━━━▶</span>
                <span className="text-emerald-400">{selectedDestination}</span>
              </div>
            </div>

            {showSimulation && bookedVessel && (
              <div className="pl-3 border-l border-slate-700/80 flex items-center gap-2 text-xs">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>{bookedVessel.name}</span>
                  <span className="text-amber-300">({Math.round(simProgress)}%)</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const map = mapInstanceRef.current;
                    if (!map || !simElementsRef.current?.vesselMarker) return;
                    const vesselLatLng = simElementsRef.current.vesselMarker.getLatLng();
                    map.setView(vesselLatLng, 6, { animate: true });
                  }}
                  className="px-2.5 py-1 rounded bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-400 text-cyan-200 text-[10px] font-bold font-mono transition-all flex items-center gap-1 cursor-pointer"
                  title="Center map on vessel"
                >
                  <span>🎯 Center Vessel</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const map = mapInstanceRef.current;
                    if (!map) return;
                    const rawWaypoints = (routeData && routeData.waypoints && routeData.waypoints.length > 0)
                      ? routeData.waypoints.map(pt => [pt.lat, pt.lon || pt.lng])
                      : generateNauticalWaypoints(selectedOrigin, selectedDestination);
                    if (rawWaypoints && rawWaypoints.length > 1) {
                      map.fitBounds(L.latLngBounds(rawWaypoints), { padding: [50, 50], maxZoom: 6 });
                    }
                  }}
                  className="px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 border border-slate-600 text-slate-300 text-[10px] font-bold font-mono transition-all flex items-center gap-1 cursor-pointer"
                  title="Fit entire corridor into view"
                >
                  <span>🗺️ Fit Route</span>
                </button>
              </div>
            )}

            {routeData && (
              <div className="pl-3 border-l border-slate-700/80 flex items-center gap-3 text-xs">
                <div>
                  <div className="text-[10px] text-slate-400">Distance</div>
                  <div className="font-mono font-bold text-cyan-300">{routeData.distanceNm.toLocaleString()} NM</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Est. Transit</div>
                  <div className="font-mono font-bold text-white">{(routeData.distanceNm / (14 * 24)).toFixed(1)} Days</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Right: Clean Compact Actions & Map Options Dropdown */}
        <div className="pointer-events-auto flex items-center gap-2" ref={menuRef}>
          {/* Nearby East Coast Vessels Radar Button */}
          <button
            onClick={handleScanNearbyVessels}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-xl active:scale-95 ${
              showNearbyDrawer
                ? "bg-emerald-400 text-slate-950 shadow-emerald-500/50 ring-2 ring-emerald-300 scale-105"
                : "bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 hover:text-white backdrop-blur-md"
            }`}
            title="Scan & dynamically view all vessels nearby East Coast India in real time"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Nearby Vessels ({fleet.length})</span>
          </button>

          {/* Map Options / Controls Dropdown Menu Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowMapMenu(prev => !prev)}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-xl border backdrop-blur-md ${
                showMapMenu
                  ? "bg-blue-600 text-white border-blue-400 shadow-blue-500/30"
                  : "bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-slate-700/80 hover:text-white"
              }`}
              title="Toggle Map Layers, Overlays & Base Maps"
            >
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Map Options</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showMapMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu Modal */}
            {showMapMenu && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl p-3.5 z-[1100] text-xs space-y-3.5 animate-in fade-in zoom-in-95 duration-150">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-700/70 pb-2">
                  <div className="flex items-center gap-2 font-bold text-white">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    <span>Map Controls & Layers</span>
                  </div>
                  <button
                    onClick={() => setShowMapMenu(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    title="Close Menu"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Base Maps Section (Tactical Dark, Satellite, Standard - Nautical Ocean removed) */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider block">
                    Base Map Style
                  </span>
                  <div className="grid grid-cols-3 gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
                    {[
                      { id: "dark", label: "Tactical Dark" },
                      { id: "satellite", label: "Satellite" },
                      { id: "osm", label: "Standard" }
                    ].map((b) => (
                      <button
                        key={b.id}
                        onClick={() => setBasemapStyle(b.id)}
                        className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold text-center transition-all ${
                          basemapStyle === b.id
                            ? "bg-blue-600 text-white shadow font-bold"
                            : "text-slate-400 hover:text-white hover:bg-slate-800/80"
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Map Overlays & Layers */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider block">
                    Map Overlays
                  </span>
                  <div className="space-y-1 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800">
                    <button
                      onClick={() => setShowVessels(!showVessels)}
                      className="w-full flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-800/80 text-left transition-colors"
                    >
                      <span className="flex items-center gap-2 text-slate-300">
                        <Ship className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Live AIS Fleet ({fleet.length})</span>
                      </span>
                      <span className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] font-bold ${
                        showVessels ? 'bg-cyan-600 border-cyan-500 text-white' : 'border-slate-600 text-transparent'
                      }`}>
                        ✓
                      </span>
                    </button>

                    <button
                      onClick={() => setShowSeamarks(!showSeamarks)}
                      className="w-full flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-800/80 text-left transition-colors"
                    >
                      <span className="flex items-center gap-2 text-slate-300">
                        <Anchor className="w-3.5 h-3.5 text-cyan-400" />
                        <span>OpenSeaMap Seamarks</span>
                      </span>
                      <span className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] font-bold ${
                        showSeamarks ? 'bg-cyan-600 border-cyan-500 text-white' : 'border-slate-600 text-transparent'
                      }`}>
                        ✓
                      </span>
                    </button>

                    <button
                      onClick={() => setShowWeatherOverlay(!showWeatherOverlay)}
                      className="w-full flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-800/80 text-left transition-colors"
                    >
                      <span className="flex items-center gap-2 text-slate-300">
                        <Wind className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Marine Weather & Swell</span>
                      </span>
                      <span className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] font-bold ${
                        showWeatherOverlay ? 'bg-cyan-600 border-cyan-500 text-white' : 'border-slate-600 text-transparent'
                      }`}>
                        ✓
                      </span>
                    </button>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="pt-1 border-t border-slate-700/70 space-y-1.5">
                  <button
                    onClick={fetchLiveData}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors font-medium text-[11px]"
                  >
                    <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
                    <span>{loading ? "Syncing AIS Data..." : "Refresh Live AIS & Weather"}</span>
                  </button>
                </div>

                {/* Unobtrusive VesselAPI Telemetry Status inside dropdown */}
                <div className="flex items-center justify-between px-2.5 py-1.5 bg-slate-950/80 rounded-xl text-[10px] font-mono text-slate-400 border border-slate-800/80">
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                    <span className="text-slate-300 font-semibold">VesselAPI</span>
                  </div>
                  <span className="text-emerald-400 font-bold">
                    {fleet.length > 0 ? `${fleet.length} LIVE AIS` : (apiHealth?.pingLatencyMs ? `${apiHealth.pingLatencyMs}ms` : '42ms LIVE')}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Main Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full flex-1 z-0" />

      {/* Interactive Sliding Nearby East Coast Vessels Drawer */}
      {showNearbyDrawer && (
        <div className="absolute top-16 right-4 bottom-16 w-84 md:w-96 bg-slate-900/95 backdrop-blur-xl border border-cyan-500/40 rounded-2xl shadow-2xl z-[1001] flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
          {/* Drawer Header */}
          <div className="p-3.5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 grid place-items-center border border-emerald-500/30">
                <Ship size={18} />
              </div>
              <div>
                <div className="text-xs font-extrabold text-white flex items-center gap-2">
                  <span>East Coast Live Fleet</span>
                  <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded text-[10px] font-mono font-bold">
                    {filteredFleet.length} LIVE
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Bay of Bengal Approaches · Real-Time Telemetry
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowNearbyDrawer(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close Panel"
            >
              <X size={16} />
            </button>
          </div>

          {/* Quick Filter Search Input */}
          <div className="p-2.5 border-b border-slate-800 bg-slate-950/40">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search vessel, port or category..."
                value={vesselFilterText}
                onChange={(e) => setVesselFilterText(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          {/* Scrollable Vessel List */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 custom-scrollbar">
            {filteredFleet.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs font-mono">
                No matching vessels found.
              </div>
            ) : (
              filteredFleet.map((v) => {
                const isSelected = selectedVessel?.id === v.id;
                const isCapesize = v.category === "Capesize";
                const isPanamax = v.category === "Panamax";
                const tagColor = isCapesize 
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/30" 
                  : isPanamax 
                    ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" 
                    : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";

                return (
                  <div
                    key={v.id}
                    onClick={() => handleFocusVessel(v)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer group ${
                      isSelected
                        ? "bg-blue-950/80 border-cyan-400 shadow-lg shadow-cyan-950/50 ring-1 ring-cyan-400/50"
                        : "bg-slate-800/60 hover:bg-slate-800 border-slate-700/60 hover:border-slate-600"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                          <span>{v.name}</span>
                          {v.flag && <span className="text-[10px] text-slate-400 font-normal">({v.flag})</span>}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          MMSI: {v.mmsi} · LOA: {v.loaM || 225}m
                        </div>
                      </div>
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${tagColor}`}>
                        {v.category}
                      </span>
                    </div>

                    {/* Real-time Telemetry Grid */}
                    <div className="mt-2 pt-2 border-t border-slate-700/50 grid grid-cols-2 gap-2 text-[11px] font-mono">
                      <div>
                        <div className="flex items-center gap-1 text-slate-400 text-[10px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          <span>Live AIS Position:</span>
                        </div>
                        <div className="text-cyan-300 font-bold text-[11px]">
                          {v.lat.toFixed(3)}°N, {(v.lon || v.lng).toFixed(3)}°E
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px]">SOG / Heading:</span>
                        <div className="text-emerald-400 font-bold text-[11px]">
                          {v.speedKnots} kn · {v.heading || v.course}°
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px]">Destination Port:</span>
                        <div className="text-white font-bold truncate">
                          ⚓ {v.destinationPort || v.destination}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px]">Draft:</span>
                        <div className="text-slate-200 font-bold">
                          {v.draftM}m
                        </div>
                      </div>
                    </div>

                    {/* Focus & Track Action */}
                    <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400 group-hover:text-cyan-400 transition-colors border-t border-slate-700/30 pt-1.5">
                      <span className="text-emerald-400 flex items-center gap-1 font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                        {v.status || "Underway"}
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-cyan-300 group-hover:underline">
                        Track on Map <ChevronRight size={12} />
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Bottom Floating Legend & Quick Telemetry */}
      <div className="absolute bottom-4 left-4 z-[1000] pointer-events-none">
        <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md border border-slate-700/80 p-2.5 rounded-xl shadow-xl flex items-center gap-3.5 text-xs">
          <div className="flex items-center gap-1.5 font-medium text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span> Capesize
          </div>
          <div className="flex items-center gap-1.5 font-medium text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block"></span> Panamax
          </div>
          <div className="flex items-center gap-1.5 font-medium text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span> Supramax / Handy
          </div>
          <div className="pl-3 border-l border-slate-700 text-[11px] text-slate-400 flex items-center gap-1.5 font-mono">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>12 East Coast Ports Monitored</span>
          </div>
        </div>
      </div>


    </div>
  );
}

