import React, { useState, useEffect, useRef } from "react";
import TopDownVesselIcon from "./VesselIcons";
import NauticalLeafletMap from "./NauticalLeafletMap";
import { 
  Anchor, Ship, Navigation, Wind, Layers, Play, Pause, FastForward, 
  RotateCcw, Compass, MapPin, Activity, ShieldAlert, CheckCircle2, ChevronRight, X,
  Globe, Radio
} from "lucide-react";
import axios from "@/lib/api";
import { useFlow } from "../lib/flow";

// Accurate geographic coordinates and operational limits for 12 East Coast India ports
export const EAST_COAST_PORTS = [
  {
    id: "Kolkata",
    name: "Kolkata (SMP Port)",
    state: "West Bengal",
    lat: 22.5726,
    lon: 88.3639,
    x: 730,
    y: 85,
    labelAlign: "right",
    labelDy: 0,
    maxDraft: 8.5,
    maxLoa: 190,
    maxBeam: 30,
    congestion: "High",
    vesselsWaiting: 14,
    avgWaitHours: 36,
    primaryCargo: "Coking Coal / Fertilizer",
    originRoutes: [
      { origin: "Newcastle, Australia", country: "Australia", distanceNm: 5120, transitDays: 16, cargo: "Coking Coal" },
      { origin: "Taboneo, Indonesia", country: "Indonesia", distanceNm: 2280, transitDays: 7, cargo: "Thermal Coal" }
    ]
  },
  {
    id: "Haldia",
    name: "Haldia Dock Complex",
    state: "West Bengal",
    lat: 22.0232,
    lon: 88.0645,
    x: 715,
    y: 125,
    labelAlign: "right",
    labelDy: 0,
    maxDraft: 9.0,
    maxLoa: 200,
    maxBeam: 32,
    congestion: "High",
    vesselsWaiting: 18,
    avgWaitHours: 32,
    primaryCargo: "Thermal Coal / Petcoke",
    originRoutes: [
      { origin: "Samarinda, Indonesia", country: "Indonesia", distanceNm: 2340, transitDays: 8, cargo: "Thermal Coal" },
      { origin: "Richards Bay, South Africa", country: "South Africa", distanceNm: 4680, transitDays: 15, cargo: "Steam Coal" }
    ]
  },
  {
    id: "Dhamra",
    name: "Dhamra Port",
    state: "Odisha",
    lat: 20.8145,
    lon: 86.9634,
    x: 672,
    y: 175,
    labelAlign: "right",
    labelDy: 0,
    maxDraft: 18.0,
    maxLoa: 320,
    maxBeam: 48,
    congestion: "Low",
    vesselsWaiting: 6,
    avgWaitHours: 10,
    primaryCargo: "Thermal Coal / Iron Ore (Capesize Ready)",
    originRoutes: [
      { origin: "Hay Point, Australia", country: "Australia", distanceNm: 4980, transitDays: 15, cargo: "Coking Coal" },
      { origin: "Newcastle, Australia", country: "Australia", distanceNm: 5080, transitDays: 15.5, cargo: "Thermal Coal" }
    ]
  },
  {
    id: "Paradip",
    name: "Paradip Port",
    state: "Odisha",
    lat: 20.2644,
    lon: 86.6685,
    x: 655,
    y: 215,
    labelAlign: "right",
    labelDy: 0,
    maxDraft: 14.5,
    maxLoa: 260,
    maxBeam: 40,
    congestion: "Low",
    vesselsWaiting: 9,
    avgWaitHours: 12,
    primaryCargo: "Thermal Coal / Coking Coal",
    originRoutes: [
      { origin: "Newcastle, Australia", country: "Australia", distanceNm: 4940, transitDays: 14.5, cargo: "Thermal Coal" },
      { origin: "Balikpapan, Indonesia", country: "Indonesia", distanceNm: 2210, transitDays: 6.8, cargo: "Thermal Coal" }
    ]
  },
  {
    id: "Gopalpur",
    name: "Gopalpur Port",
    state: "Odisha",
    lat: 19.2612,
    lon: 84.9084,
    x: 585,
    y: 275,
    labelAlign: "right",
    labelDy: 0,
    maxDraft: 12.5,
    maxLoa: 225,
    maxBeam: 33,
    congestion: "Low",
    vesselsWaiting: 4,
    avgWaitHours: 14,
    primaryCargo: "Limestone / Sand / Coal",
    originRoutes: [
      { origin: "Muara Pantai, Indonesia", country: "Indonesia", distanceNm: 2190, transitDays: 7, cargo: "Steam Coal" }
    ]
  },
  {
    id: "Visakhapatnam",
    name: "Visakhapatnam Port",
    state: "Andhra Pradesh",
    lat: 17.6868,
    lon: 83.2185,
    x: 512,
    y: 340,
    labelAlign: "right",
    labelDy: -7,
    maxDraft: 16.5,
    maxLoa: 290,
    maxBeam: 45,
    congestion: "Medium",
    vesselsWaiting: 16,
    avgWaitHours: 22,
    primaryCargo: "Iron Ore / Coking Coal / Bauxite",
    originRoutes: [
      { origin: "Port Hedland, Australia", country: "Australia", distanceNm: 3680, transitDays: 11, cargo: "Iron Ore" },
      { origin: "Newcastle, Australia", country: "Australia", distanceNm: 4820, transitDays: 14, cargo: "Coking Coal" }
    ]
  },
  {
    id: "Gangavaram",
    name: "Gangavaram Port",
    state: "Andhra Pradesh",
    lat: 17.6214,
    lon: 83.2369,
    x: 504,
    y: 378,
    labelAlign: "right",
    labelDy: 7,
    maxDraft: 19.5,
    maxLoa: 330,
    maxBeam: 50,
    congestion: "Low",
    vesselsWaiting: 7,
    avgWaitHours: 11,
    primaryCargo: "Coal / Iron Ore / Super Capesize",
    originRoutes: [
      { origin: "Newcastle, Australia", country: "Australia", distanceNm: 4810, transitDays: 14, cargo: "Thermal Coal" },
      { origin: "Maputo, Mozambique", country: "Mozambique", distanceNm: 4210, transitDays: 13, cargo: "Coking Coal" }
    ]
  },
  {
    id: "Kakinada",
    name: "Kakinada Deepwater Port",
    state: "Andhra Pradesh",
    lat: 16.9891,
    lon: 82.2789,
    x: 465,
    y: 425,
    labelAlign: "right",
    labelDy: 0,
    maxDraft: 13.0,
    maxLoa: 230,
    maxBeam: 34,
    congestion: "Medium",
    vesselsWaiting: 8,
    avgWaitHours: 18,
    primaryCargo: "Fertilizer / Grain / Granite",
    originRoutes: [
      { origin: "Taboneo, Indonesia", country: "Indonesia", distanceNm: 2080, transitDays: 6.5, cargo: "Thermal Coal" }
    ]
  },
  {
    id: "Krishnapatnam",
    name: "Krishnapatnam Port",
    state: "Andhra Pradesh",
    lat: 14.2541,
    lon: 80.1245,
    x: 378,
    y: 525,
    labelAlign: "right",
    labelDy: 0,
    maxDraft: 18.5,
    maxLoa: 320,
    maxBeam: 48,
    congestion: "Low",
    vesselsWaiting: 8,
    avgWaitHours: 13,
    primaryCargo: "Thermal Coal / Containers / Iron Ore",
    originRoutes: [
      { origin: "Richards Bay, South Africa", country: "South Africa", distanceNm: 4320, transitDays: 13.5, cargo: "Steam Coal" },
      { origin: "Gladstone, Australia", country: "Australia", distanceNm: 4620, transitDays: 14, cargo: "Coking Coal" }
    ]
  },
  {
    id: "Kamarajar",
    name: "Kamarajar Port (Ennore)",
    state: "Tamil Nadu",
    lat: 13.2592,
    lon: 80.3344,
    x: 352,
    y: 570,
    labelAlign: "right",
    labelDy: -7,
    maxDraft: 16.0,
    maxLoa: 290,
    maxBeam: 45,
    congestion: "Medium",
    vesselsWaiting: 11,
    avgWaitHours: 19,
    primaryCargo: "Thermal Coal for TANGEDCO",
    originRoutes: [
      { origin: "Taboneo, Indonesia", country: "Indonesia", distanceNm: 1980, transitDays: 6.2, cargo: "Thermal Coal" }
    ]
  },
  {
    id: "Chennai",
    name: "Chennai Port",
    state: "Tamil Nadu",
    lat: 13.0827,
    lon: 80.2907,
    x: 342,
    y: 608,
    labelAlign: "right",
    labelDy: 7,
    maxDraft: 15.5,
    maxLoa: 280,
    maxBeam: 42,
    congestion: "High",
    vesselsWaiting: 22,
    avgWaitHours: 28,
    primaryCargo: "Container / Cars / Bulk",
    originRoutes: [
      { origin: "Singapore (Hub)", country: "Singapore", distanceNm: 1580, transitDays: 4.8, cargo: "Containers" },
      { origin: "Newcastle, Australia", country: "Australia", distanceNm: 4720, transitDays: 14.2, cargo: "Thermal Coal" }
    ]
  },
  {
    id: "V.O. Chidambaranar",
    name: "V.O. Chidambaranar (Tuticorin)",
    state: "Tamil Nadu",
    lat: 8.7642,
    lon: 78.1822,
    x: 240,
    y: 725,
    labelAlign: "right",
    labelDy: 0,
    maxDraft: 14.2,
    maxLoa: 245,
    maxBeam: 36,
    congestion: "Medium",
    vesselsWaiting: 10,
    avgWaitHours: 16,
    primaryCargo: "Coal / Copper Concentrates / Salt",
    originRoutes: [
      { origin: "Durban, South Africa", country: "South Africa", distanceNm: 3980, transitDays: 12.5, cargo: "Coal / Ore" },
      { origin: "Taboneo, Indonesia", country: "Indonesia", distanceNm: 1850, transitDays: 5.8, cargo: "Thermal Coal" }
    ]
  }
];

// Initial simulated fleet cruising across the Bay of Bengal & Indian Ocean
const INITIAL_FLEET = [
  {
    id: "ASTRA-CAP-104",
    name: "MV Pacific Pioneer",
    category: "Capesize",
    dwt: 180000,
    origin: "Newcastle, Australia",
    destination: "Paradip",
    cargo: "165,000 MT Thermal Coal",
    speedKnots: 14.2,
    progress: 0.72,
    routeStartX: 950,
    routeStartY: 600,
    routeMidX: 820,
    routeMidY: 380,
    destPortId: "Paradip",
    status: "Underway",
    fuelBurn: "48.5 MT/day VLSFO",
    eta: "In 18 hours"
  },
  {
    id: "ASTRA-PAN-202",
    name: "MV Bengal Voyager",
    category: "Panamax",
    dwt: 75000,
    origin: "Taboneo, Indonesia",
    destination: "Chennai",
    cargo: "70,000 MT Steam Coal",
    speedKnots: 13.8,
    progress: 0.84,
    routeStartX: 960,
    routeStartY: 720,
    routeMidX: 620,
    routeMidY: 630,
    destPortId: "Chennai",
    status: "Approaching Outer Anchorage",
    fuelBurn: "29.2 MT/day VLSFO",
    eta: "In 4 hours"
  },
  {
    id: "ASTRA-SUP-308",
    name: "MV Eastern Horizon",
    category: "Supramax",
    dwt: 58000,
    origin: "Hay Point, Australia",
    destination: "Visakhapatnam",
    cargo: "54,000 MT Coking Coal",
    speedKnots: 14.0,
    progress: 0.58,
    routeStartX: 950,
    routeStartY: 580,
    routeMidX: 740,
    routeMidY: 460,
    destPortId: "Visakhapatnam",
    status: "Underway",
    fuelBurn: "24.5 MT/day VLSFO",
    eta: "In 1.5 days"
  },
  {
    id: "ASTRA-CAP-109",
    name: "MV Oceanic Giant",
    category: "Capesize",
    dwt: 178000,
    origin: "Port Hedland, Australia",
    destination: "Gangavaram",
    cargo: "170,000 MT Iron Ore",
    speedKnots: 14.5,
    progress: 0.42,
    routeStartX: 930,
    routeStartY: 650,
    routeMidX: 720,
    routeMidY: 510,
    destPortId: "Gangavaram",
    status: "Underway (Open Ocean)",
    fuelBurn: "51.0 MT/day VLSFO",
    eta: "In 2.8 days"
  },
  {
    id: "ASTRA-HAN-401",
    name: "MV Coromandel Trader",
    category: "Handysize",
    dwt: 35000,
    origin: "Samarinda, Indonesia",
    destination: "Haldia",
    cargo: "32,000 MT Petcoke",
    speedKnots: 12.5,
    progress: 0.88,
    routeStartX: 920,
    routeStartY: 480,
    routeMidX: 810,
    routeMidY: 260,
    destPortId: "Haldia",
    status: "Pilot Station Awaited",
    fuelBurn: "18.5 MT/day VLSFO",
    eta: "In 6 hours"
  },
  {
    id: "ASTRA-CON-505",
    name: "MV Asian Express",
    category: "Container",
    dwt: 65000,
    origin: "Singapore",
    destination: "Krishnapatnam",
    cargo: "3,850 TEU Dry & Reefer",
    speedKnots: 18.2,
    progress: 0.65,
    routeStartX: 960,
    routeStartY: 740,
    routeMidX: 680,
    routeMidY: 620,
    destPortId: "Krishnapatnam",
    status: "Underway at Transit Speed",
    fuelBurn: "62.0 MT/day VLSFO",
    eta: "In 14 hours"
  },
  {
    id: "ASTRA-PAN-214",
    name: "MV Indus Fortune",
    category: "Panamax",
    dwt: 76000,
    origin: "Richards Bay, South Africa",
    destination: "Dhamra",
    cargo: "72,000 MT Coal",
    speedKnots: 13.5,
    progress: 0.78,
    routeStartX: 200,
    routeStartY: 780,
    routeMidX: 480,
    routeMidY: 420,
    destPortId: "Dhamra",
    status: "Underway",
    fuelBurn: "30.0 MT/day VLSFO",
    eta: "In 22 hours"
  },
  {
    id: "ASTRA-SUP-312",
    name: "MV Southern Cross",
    category: "Supramax",
    dwt: 57000,
    origin: "Durban, South Africa",
    destination: "V.O. Chidambaranar",
    cargo: "52,000 MT Minerals",
    speedKnots: 13.2,
    progress: 0.92,
    routeStartX: 180,
    routeStartY: 770,
    routeMidX: 220,
    routeMidY: 720,
    destPortId: "V.O. Chidambaranar",
    status: "Anchored / Waiting Berth",
    fuelBurn: "4.2 MT/day (Aux Engine)",
    eta: "Berthed Soon"
  }
];

export default function EastCoastMap({ 
  activePort: propActivePort, 
  highlightedPorts = [], 
  onPortClick: propOnPortClick,
  originPort: propOriginPort,
  showRoute = false,
  showSimulation = false,
  bookedVessel = null,
  simProgress: propSimProgress,
  isPlaying: propIsPlaying,
  simSpeed: propSimSpeed,
  onTogglePlay,
  onResetSimulation,
  onSetSimSpeed,
  weatherDelayActive: propWeatherDelayActive,
  berthReallocated: propBerthReallocated,
  portCongestionActive: propPortCongestionActive,
  portDiverted: propPortDiverted,
  onTriggerWeatherDelay,
  onApproveBerthReallocation,
  onTriggerPortCongestion,
  onApprovePortDiversion,
  waitingForTruckGateScan: propWaitingGate,
  gateCleared: propGateCleared,
  onScanGatePass
}) {
  const flow = useFlow?.() || {};
  const requirement = flow.requirement;

  // Use props if passed, otherwise fallback to flow context
  const isPlaying = propIsPlaying !== undefined ? propIsPlaying : flow.isPlaying;
  const togglePlay = onTogglePlay || flow.togglePlay;
  const simProgress = propSimProgress !== undefined ? propSimProgress : (flow.simProgress || 0);
  const simSpeed = propSimSpeed !== undefined ? propSimSpeed : (flow.simSpeed || 1);
  const setSimSpeed = onSetSimSpeed || flow.setSimSpeed;
  const resetSimulation = onResetSimulation || flow.resetSimulation;
  const weatherDelayActive = propWeatherDelayActive !== undefined ? propWeatherDelayActive : flow.weatherDelayActive;
  const berthReallocated = propBerthReallocated !== undefined ? propBerthReallocated : flow.berthReallocated;
  const portCongestionActive = propPortCongestionActive !== undefined ? propPortCongestionActive : flow.portCongestionActive;
  const portDiverted = propPortDiverted !== undefined ? propPortDiverted : flow.portDiverted;
  const triggerWeatherDelay = onTriggerWeatherDelay || flow.triggerWeatherDelay;
  const approveBerthReallocation = onApproveBerthReallocation || flow.approveBerthReallocation;
  const triggerPortCongestion = onTriggerPortCongestion || flow.triggerPortCongestion;
  const approvePortDiversion = onApprovePortDiversion || flow.approvePortDiversion;
  const waitingForTruckGateScan = propWaitingGate !== undefined ? propWaitingGate : flow.waitingForTruckGateScan;
  const gateCleared = propGateCleared !== undefined ? propGateCleared : flow.gateCleared;
  const scanGatePass = onScanGatePass || flow.scanGatePass;
  const currentLeg = flow.getCurrentLeg ? flow.getCurrentLeg() : { name: "Ocean Transit" };
  const effectiveBookedVessel = bookedVessel || requirement?.selectedVessel;

  const totalHoursElapsed = Math.floor((simProgress / 100) * 72);
  const simulatedDay = Math.floor(totalHoursElapsed / 24) + 1;
  const simulatedHour = totalHoursElapsed % 24;
  const formattedSimTime = `DAY 0${simulatedDay} · ${simulatedHour < 10 ? `0${simulatedHour}` : simulatedHour}:00 HRS`;

  const flowOrigin = requirement?.originPort;
  const flowDest = portDiverted ? "Krishnapatnam" : requirement?.destinationPort;

  const [selectedPort, setSelectedPort] = useState(propActivePort || flowDest || "Dhamra");
  const [selectedOrigin, setSelectedOrigin] = useState(propOriginPort || flowOrigin || "Singapore");
  const [mapEngine, setMapEngine] = useState("leaflet"); // 'leaflet' | 'tactical'
  const [hoveredPort, setHoveredPort] = useState(null);
  const [selectedVessel, setSelectedVessel] = useState(null);
  const [vessels, setVessels] = useState(INITIAL_FLEET);
  const [apiHealth, setApiHealth] = useState(null);
  const [liveTelemetrySource, setLiveTelemetrySource] = useState(null);
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [mapTheme, setMapTheme] = useState("nautical"); // 'nautical' | 'satellite' | 'tactical'
  const [showShippingLanes, setShowShippingLanes] = useState(true);
  const [showWeatherZones, setShowWeatherZones] = useState(true);

  // Sync external activePort & originPort props or flow requirement if changed
  useEffect(() => {
    const nextDest = propActivePort || flowDest;
    if (nextDest) setSelectedPort(nextDest);
  }, [propActivePort, flowDest]);

  useEffect(() => {
    const nextOrigin = propOriginPort || flowOrigin;
    if (nextOrigin) setSelectedOrigin(nextOrigin);
  }, [propOriginPort, flowOrigin]);

  // Fetch Live Fleet from VesselAPI & System Health
  useEffect(() => {
    let isMounted = true;
    const fetchLiveFleet = async () => {
      try {
        const [fleetRes, healthRes] = await Promise.allSettled([
          axios.get("/live/vessels"),
          axios.get("/system/api-health")
        ]);

        if (!isMounted) return;

        if (fleetRes.status === "fulfilled" && fleetRes.value.data?.vessels?.length > 0) {
          const apiVessels = fleetRes.value.data.vessels.map((v, idx) => {
            const destPortId = v.destinationPort || v.destPortId || "Paradip";
            const port = EAST_COAST_PORTS.find(p => p.id === destPortId) || EAST_COAST_PORTS[3];
            return {
              ...v,
              destPortId: port.id,
              progress: v.progress ?? (0.2 + (idx * 0.12)),
              routeStartX: v.routeStartX || (930 + (idx * 5)),
              routeStartY: v.routeStartY || (580 + (idx * 20)),
              routeMidX: v.routeMidX || (750 + (idx * 15)),
              routeMidY: v.routeMidY || (420 + (idx * 25))
            };
          });
          setVessels(apiVessels);
          if (fleetRes.value.data.source) {
            setLiveTelemetrySource(fleetRes.value.data.source);
          }
        }

        if (healthRes.status === "fulfilled" && healthRes.value.data) {
          setApiHealth(healthRes.value.data);
        }
      } catch (err) {
        console.warn("[EastCoastMap] Using initial fleet fallback:", err.message);
      }
    };

    fetchLiveFleet();
    const syncTimer = setInterval(fetchLiveFleet, 45000);
    return () => {
      isMounted = false;
      clearInterval(syncTimer);
    };
  }, []);

  // Live simulation tick
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setVessels((prev) =>
        prev.map((v) => {
          let newProgress = (v.progress || 0.1) + 0.0018 * simSpeed;
          if (newProgress > 0.98) newProgress = 0.05; // loop route smoothly
          return { ...v, progress: newProgress };
        })
      );
    }, 50);
    return () => clearInterval(interval);
  }, [isPlaying, simSpeed]);

  const activePortObj = EAST_COAST_PORTS.find((p) => p.id === selectedPort) || EAST_COAST_PORTS[3];

  const handlePortClick = (port) => {
    setSelectedPort(port.id);
    setSelectedVessel(null);
    if (propOnPortClick) propOnPortClick(port.id);
  };

  // Helper to compute bezier position and heading angle for moving vessels
  const getVesselState = (vessel) => {
    const port = EAST_COAST_PORTS.find((p) => p.id === vessel.destPortId) || EAST_COAST_PORTS[3];
    const t = vessel.progress || 0.1;
    
    // Quadratic Bezier interpolation: P(t) = (1-t)^2 * P0 + 2(1-t)t * P1 + t^2 * P2
    const p0 = { x: vessel.routeStartX || 940, y: vessel.routeStartY || 600 };
    const p1 = { x: vessel.routeMidX || 760, y: vessel.routeMidY || 400 };
    const p2 = { x: port.x, y: port.y };

    const x = Math.pow(1 - t, 2) * p0.x + 2 * (1 - t) * t * p1.x + Math.pow(t, 2) * p2.x;
    const y = Math.pow(1 - t, 2) * p0.y + 2 * (1 - t) * t * p1.y + Math.pow(t, 2) * p2.y;

    // Tangent derivative for exact bow rotation
    const dx = 2 * (1 - t) * (p1.x - p0.x) + 2 * t * (p2.x - p1.x);
    const dy = 2 * (1 - t) * (p1.y - p0.y) + 2 * t * (p2.y - p1.y);
    const angleRad = Math.atan2(dy, dx);
    const angleDeg = (angleRad * 180) / Math.PI + 90; // +90 because vessel SVG is drawn vertically pointing North

    return { x, y, angle: angleDeg };
  };

  const filteredVessels = filterCategory === "ALL" 
    ? vessels 
    : vessels.filter(v => v.category === filterCategory);

  return (
    <div className="astra-card overflow-hidden relative shadow-sm border border-slate-200">
      {/* Map Header with Simulation Controls */}
      <div className="bg-slate-900 text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-blue-600/30 border border-blue-400/40 text-blue-400 grid place-items-center">
            <Compass size={18} className="animate-spin" style={{ animationDuration: "20s" }} />
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-blue-300 font-mono font-bold flex items-center gap-2">
              <span>ASTRA Real-Time Maritime GIS</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-sm font-extrabold text-white" style={{ fontFamily: "Manrope" }}>
              East Coast India & Bay of Bengal Simulation Engine
            </div>
          </div>
        </div>

        {/* Live VesselAPI Status Badge */}
        <div className="flex items-center gap-2 bg-slate-800/90 border border-emerald-500/40 px-3 py-1.5 rounded-xl text-xs font-mono text-emerald-300 shadow-sm" title="VesselAPI Live AIS feed active">
          <span className="relative flex h-2 w-2">
            <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-bold text-slate-200">VesselAPI AIS:</span>
          <span className="text-emerald-400">{apiHealth?.apiKey || "2fa60d...aebf"}</span>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold">
            {vessels.length} Active Vessels
          </span>
        </div>

        {/* Engine Switcher */}
        <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 gap-1">
          <button
            onClick={() => setMapEngine("leaflet")}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all ${
              mapEngine === "leaflet"
                ? "bg-cyan-600 text-white shadow-md shadow-cyan-900/50"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Globe size={14} className={mapEngine === "leaflet" ? "animate-spin-slow text-cyan-200" : ""} />
            <span>Live AIS Nautical Chart</span>
          </button>
          <button
            onClick={() => setMapEngine("tactical")}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all ${
              mapEngine === "tactical"
                ? "bg-blue-600 text-white shadow-md shadow-blue-900/50"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Radio size={14} />
            <span>Tactical Radar HUD</span>
          </button>
        </div>

        {/* Tactical Control Bar */}
        <div className="flex items-center gap-2 text-xs">
          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors font-medium"
            title={isPlaying ? "Pause Simulation" : "Resume Simulation"}
          >
            {isPlaying ? <Pause size={14} className="text-amber-400" /> : <Play size={14} className="text-emerald-400" />}
            <span>{isPlaying ? "Live" : "Paused"}</span>
          </button>

          {/* Speed Selector */}
          <div className="flex items-center bg-slate-800 rounded border border-slate-700 p-0.5">
            {[1, 2, 5].map((s) => (
              <button
                key={s}
                onClick={() => setSimSpeed(s)}
                className={`px-2 py-1 rounded text-[11px] font-mono font-bold ${
                  simSpeed === s ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-slate-800 text-slate-200 border border-slate-700 rounded px-2.5 py-1.5 text-xs outline-none focus:border-blue-500 font-medium"
          >
            <option value="ALL">All Vessels ({vessels.length})</option>
            <option value="Capesize">Capesize (180k DWT)</option>
            <option value="Panamax">Panamax (75k DWT)</option>
            <option value="Supramax">Supramax (58k DWT)</option>
            <option value="Handysize">Handysize (35k DWT)</option>
            <option value="Container">Container Vessels</option>
          </select>

          {/* Layers Toggle */}
          <button
            onClick={() => setShowShippingLanes(!showShippingLanes)}
            className={`px-2.5 py-1.5 rounded border text-xs flex items-center gap-1 font-medium ${
              showShippingLanes ? "bg-blue-950/80 border-blue-500 text-blue-300" : "bg-slate-800 border-slate-700 text-slate-400"
            }`}
            title="Toggle Shipping Corridors"
          >
            <Navigation size={12} /> Lanes
          </button>
        </div>
      </div>

      {/* IN-MAP REAL-TIME MULTIMODAL SIMULATION HUD (ONLY WHEN BOOKED & ACCEPTED BY CONTRACTOR) */}
      {showSimulation && showRoute && (
        <div className="bg-slate-950 text-white px-5 py-3 border-b border-blue-900/60 flex flex-wrap items-center justify-between gap-4 font-mono text-xs shadow-inner">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-400 text-blue-300 grid place-items-center font-bold text-xs">
              ASTRA
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                  LIVE VOYAGE SIMULATION RADAR
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="text-sm font-extrabold text-white flex items-center gap-2">
                <span>{formattedSimTime}</span>
                <span className="text-slate-500">·</span>
                <span className="text-cyan-300">{currentLeg.name}</span>
              </div>
            </div>
          </div>

          {/* Progress Bar & Percentage */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Transit Progress</span>
            <div className="w-32 md:w-48 h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/80">
              <div 
                className="h-full bg-gradient-to-r from-amber-400 via-cyan-400 to-emerald-400 transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, simProgress))}%` }}
              />
            </div>
            <span className="font-extrabold text-amber-300 text-xs">{Math.round(simProgress)}%</span>
          </div>

          {/* Simulation Controls & What-If Scenario Triggers */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                if (simProgress >= 100) {
                  if (onResetSimulation) onResetSimulation();
                  else resetSimulation();
                  setTimeout(() => {
                    if (onTogglePlay) onTogglePlay();
                    else togglePlay();
                  }, 50);
                } else {
                  if (onTogglePlay) onTogglePlay();
                  else togglePlay();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white font-bold transition-all shadow bg-blue-600 hover:bg-blue-500 active:scale-95 text-xs"
              title={simProgress >= 100 ? "Replay voyage from origin port" : isPlaying ? "Pause simulation" : "Play simulation"}
            >
              {simProgress >= 100 ? (
                <>
                  <RotateCcw size={13} className="text-emerald-300" />
                  <span>Replay Voyage</span>
                </>
              ) : isPlaying ? (
                <>
                  <Pause size={13} />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play size={13} />
                  <span>Play</span>
                </>
              )}
            </button>

            <button
              onClick={resetSimulation}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 transition-colors"
              title="Reset Simulation"
            >
              <RotateCcw size={14} />
            </button>

            <div className="flex bg-white/10 rounded-lg p-0.5 font-bold">
              {[1, 2, 5].map(s => (
                <button
                  key={s}
                  onClick={() => setSimSpeed(s)}
                  className={`px-2 py-0.5 rounded transition-colors ${simSpeed === s ? "bg-amber-400 text-slate-950 font-extrabold" : "text-slate-300 hover:text-white"}`}
                >
                  {s}x
                </button>
              ))}
            </div>

            {/* Scenario 1 & 2 Triggers */}
            <button
              onClick={triggerWeatherDelay}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${
                weatherDelayActive
                  ? "bg-amber-500 text-slate-950 border-amber-300 shadow-md ring-1 ring-amber-400"
                  : "bg-white/10 hover:bg-white/20 text-white border-white/20"
              }`}
            >
              ⚡ Swell Delay (+10h)
            </button>

            <button
              onClick={triggerPortCongestion}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${
                portCongestionActive
                  ? "bg-red-600 text-white border-red-400 shadow-md ring-1 ring-red-400 animate-pulse"
                  : "bg-white/10 hover:bg-white/20 text-white border-white/20"
              }`}
            >
              🚨 Congestion (Divert)
            </button>
          </div>

          {/* Gate scan notice when vessel berthed at port */}
          {(waitingForTruckGateScan || (simProgress >= 75 && !gateCleared)) && (
            <div className="w-full flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-lg bg-amber-950/80 border border-amber-400 text-amber-200 animate-pulse">
              <div className="flex items-center gap-2">
                <span className="text-lg">⚓</span>
                <span>Vessel berthed at {selectedPort} · Quayside unloading paused until Road Fleet scans QR gate pass.</span>
              </div>
              <button
                onClick={() => scanGatePass && scanGatePass()}
                className="px-3 py-1 rounded bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold shadow text-xs"
              >
                Scan QR Gate Pass & Raise Barrier ➔
              </button>
            </div>
          )}
        </div>
      )}

      {mapEngine === "leaflet" ? (
        <div className="w-full h-[620px]">
          <NauticalLeafletMap 
            selectedOrigin={selectedOrigin}
            selectedDestination={selectedPort}
            showRoute={showRoute}
            showSimulation={showSimulation}
            bookedVessel={effectiveBookedVessel}
            simProgress={simProgress}
            isPlaying={isPlaying}
            simSpeed={simSpeed}
            weatherDelayActive={weatherDelayActive}
            berthReallocated={berthReallocated}
            portCongestionActive={portCongestionActive}
            portDiverted={portDiverted}
            waitingForTruckGateScan={waitingForTruckGateScan}
            gateCleared={gateCleared}
            onPortSelect={(port) => handlePortClick(port)}
            onVesselSelect={(vessel) => setSelectedVessel(vessel)}
          />
        </div>
      ) : (
        <>
          {/* Main Map Canvas Area */}
          <div className="relative w-full min-h-[560px] lg:min-h-[620px] aspect-[16/10] bg-[#0A1628] overflow-hidden select-none">
        <svg 
          viewBox="0 0 1000 840" 
          className="w-full h-full cursor-crosshair"
          onClick={() => { setSelectedVessel(null); }}
        >
          <defs>
            {/* Deep Ocean Nautical Gradient */}
            <radialGradient id="oceanBathymetry" cx="70%" cy="50%" r="80%">
              <stop offset="0%" stopColor="#0B1E3B" />
              <stop offset="50%" stopColor="#091830" />
              <stop offset="100%" stopColor="#050E1D" />
            </radialGradient>

            {/* Coastal Water Glow */}
            <linearGradient id="coastalShelf" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1E3A8A" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0284C7" stopOpacity="0.0" />
            </linearGradient>

            {/* Landmass Pattern */}
            <pattern id="landGrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1E293B" strokeWidth="0.5" opacity="0.6" />
            </pattern>

            {/* Inbound Trajectory Animated Dash Gradient */}
            <linearGradient id="routeGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="50%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>

            {/* Radar Sweep Effect */}
            <radialGradient id="radarPing" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.8" />
              <stop offset="70%" stopColor="#0284C7" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#0369A1" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Base Ocean Canvas */}
          <rect x="0" y="0" width="1000" height="840" fill="url(#oceanBathymetry)" />

          {/* Nautical Latitude & Longitude Grid Lines */}
          <g stroke="#1E293B" strokeWidth="0.75" strokeDasharray="3 3" opacity="0.7">
            {/* Latitudes */}
            <line x1="0" y1="120" x2="1000" y2="120" />
            <text x="960" y="115" fill="#475569" fontSize="9" fontFamily="monospace">22°N</text>

            <line x1="0" y1="270" x2="1000" y2="270" />
            <text x="960" y="265" fill="#475569" fontSize="9" fontFamily="monospace">19°N</text>

            <line x1="0" y1="430" x2="1000" y2="430" />
            <text x="960" y="425" fill="#475569" fontSize="9" fontFamily="monospace">16°N</text>

            <line x1="0" y1="590" x2="1000" y2="590" />
            <text x="960" y="585" fill="#475569" fontSize="9" fontFamily="monospace">13°N</text>

            <line x1="0" y1="750" x2="1000" y2="750" />
            <text x="960" y="745" fill="#475569" fontSize="9" fontFamily="monospace">9°N</text>

            {/* Longitudes */}
            <line x1="300" y1="0" x2="300" y2="840" />
            <text x="305" y="825" fill="#475569" fontSize="9" fontFamily="monospace">80°E</text>

            <line x1="550" y1="0" x2="550" y2="840" />
            <text x="555" y="825" fill="#475569" fontSize="9" fontFamily="monospace">84°E</text>

            <line x1="800" y1="0" x2="800" y2="840" />
            <text x="805" y="825" fill="#475569" fontSize="9" fontFamily="monospace">88°E</text>
          </g>

          {/* Oceanic Depth Contours (Bathymetric shelves in Bay of Bengal) */}
          <path
            d="M 750,50 Q 720,200 660,320 Q 560,460 420,580 Q 300,680 200,840 L 1000,840 L 1000,0 L 750,0 Z"
            fill="#08182B"
            opacity="0.5"
          />
          <path
            d="M 850,50 Q 800,220 720,380 Q 620,520 480,680 L 1000,840 L 1000,0 Z"
            fill="#061222"
            opacity="0.7"
          />

          {/* REAL GEOGRAPHICAL PENINSULAR INDIA LANDMASS (WEST / LEFT) */}
          {/* High-accuracy coastline following West Bengal, Odisha, Andhra Pradesh & Tamil Nadu */}
          <path
            d="M 0,0 
               L 800,0 
               L 770,30 
               L 745,60 
               L 730,85 
               L 722,110 
               L 715,125 
               L 695,145 
               L 678,165 
               L 672,175 
               L 662,195 
               L 655,215 
               L 625,245 
               L 595,265 
               L 585,275 
               L 545,310 
               L 520,330 
               L 512,340 
               L 504,378 
               L 485,405 
               L 465,425 
               L 435,460 
               L 405,495 
               L 388,515 
               L 378,525 
               L 360,550 
               L 352,570 
               L 342,608 
               L 325,635 
               L 305,665 
               L 275,700 
               L 250,715 
               L 240,725 
               L 215,770 
               L 195,800 
               L 175,840 
               L 0,840 Z"
            fill="#0F172A"
            stroke="#334155"
            strokeWidth="1.5"
          />

          {/* Land Texture Grid */}
          <path
            d="M 0,0 L 800,0 L 730,85 L 715,125 L 672,175 L 655,215 L 585,275 L 512,340 L 504,378 L 465,425 L 378,525 L 352,570 L 342,608 L 240,725 L 175,840 L 0,840 Z"
            fill="url(#landGrid)"
          />

          {/* SRI LANKA LANDMASS (SOUTH) */}
          <path
            d="M 280,740 C 315,730 330,760 325,795 C 318,815 285,810 270,785 C 265,765 270,745 280,740 Z"
            fill="#0F172A"
            stroke="#334155"
            strokeWidth="1.2"
          />
          <text x="295" y="775" fill="#475569" fontSize="8" fontFamily="Manrope" fontWeight="bold" textAnchor="middle">SRI LANKA</text>

          {/* State Boundary Reference Annotations on Landmass */}
          <g fill="#475569" fontSize="10" fontFamily="Manrope" fontWeight="700" letterSpacing="1.5" opacity="0.6">
            <text x="520" y="80">WEST BENGAL</text>
            <text x="440" y="190">ODISHA</text>
            <text x="320" y="340">ANDHRA PRADESH</text>
            <text x="180" y="560">TAMIL NADU</text>
            <text x="80" y="420" fontSize="16" fill="#1E293B" fontWeight="800">INDIA</text>
          </g>

          {/* Ocean Water Labeling */}
          <g fill="#38BDF8" opacity="0.3" fontFamily="Manrope" fontWeight="800" letterSpacing="4">
            <text x="680" y="440" fontSize="22" textAnchor="middle">BAY OF BENGAL</text>
            <text x="680" y="470" fontSize="11" fill="#94A3B8" letterSpacing="2" textAnchor="middle">
              MAJOR INTERNATIONAL MARITIME CORRIDOR
            </text>
          </g>

          {/* Shipping Lanes Fairway Overlays */}
          {showShippingLanes && (
            <g stroke="#0284C7" strokeWidth="1.5" strokeDasharray="6 6" opacity="0.35">
              {/* Primary East Coast Coastal TSS Corridor */}
              <path d="M 745,80 L 685,170 L 670,210 L 530,335 L 485,420 L 390,520 L 360,570 L 260,720 L 210,830" fill="none" />
              {/* Deepwater Inbound Ocean Traces from Australia / Malacca */}
              <path d="M 980,520 Q 820,380 672,210" fill="none" stroke="#F59E0B" opacity="0.4" />
              <path d="M 980,680 Q 750,560 380,520" fill="none" stroke="#F59E0B" opacity="0.4" />
              <path d="M 980,740 Q 620,660 342,608" fill="none" stroke="#F59E0B" opacity="0.4" />
            </g>
          )}

          {/* Active Port Route Inbound Glow & Animation (Hidden when showRoute is false) */}
          {activePortObj && showRoute && (
            <g>
              {/* Pulsing Target Ring around active destination port */}
              <circle cx={activePortObj.x} cy={activePortObj.y} r="8" fill="#10B981" fillOpacity="0.4" />
              <circle cx={activePortObj.x} cy={activePortObj.y} r="22" fill="none" stroke="#10B981" strokeWidth="1.5">
                <animate attributeName="r" values="8;32;8" dur="2.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;0;0.8" dur="2.5s" repeatCount="indefinite" />
              </circle>

              {(() => {
                const originPortObj = EAST_COAST_PORTS.find(p => p.id === selectedOrigin || (selectedOrigin && selectedOrigin.toLowerCase().includes(p.id.toLowerCase())));
                const p0 = originPortObj ? { x: originPortObj.x, y: originPortObj.y } : { x: 980, y: 600 };
                const p2 = { x: activePortObj.x, y: activePortObj.y };
                const p1 = originPortObj ? { x: Math.max(p0.x, p2.x) + 70, y: (p0.y + p2.y) / 2 } : { x: 820, y: activePortObj.y + 100 };
                const pathD = `M ${p0.x},${p0.y} Q ${p1.x},${p1.y} ${p2.x},${p2.y}`;

                const t = Math.max(0, Math.min(1, simProgress / 100));
                const bx = Math.pow(1 - t, 2) * p0.x + 2 * (1 - t) * t * p1.x + Math.pow(t, 2) * p2.x;
                const by = Math.pow(1 - t, 2) * p0.y + 2 * (1 - t) * t * p1.y + Math.pow(t, 2) * p2.y;
                const bdx = 2 * (1 - t) * (p1.x - p0.x) + 2 * t * (p2.x - p1.x);
                const bdy = 2 * (1 - t) * (p1.y - p0.y) + 2 * t * (p2.y - p1.y);
                const bAngle = (Math.atan2(bdy, bdx) * 180) / Math.PI + 90;
                const vesselName = effectiveBookedVessel?.name || "MV Bengal Voyager";
                const routePct = Math.min(100, Math.round(simProgress));

                return (
                  <>
                    {/* Inbound Trajectory Vector Lines from Origin to Destination */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke="url(#routeGlow)"
                      strokeWidth="2.5"
                      strokeDasharray="8 6"
                    >
                      <animate attributeName="stroke-dashoffset" values="100;0" dur="2s" repeatCount="indefinite" />
                    </path>

                    {/* Waypoint origin marker */}
                    <g transform={`translate(${p0.x}, ${p0.y})`}>
                      <circle cx="0" cy="0" r="6" fill="#F59E0B" />
                      <circle cx="0" cy="0" r="14" fill="none" stroke="#F59E0B" strokeWidth="1.5" opacity="0.7">
                        <animate attributeName="r" values="6;16;6" dur="2s" repeatCount="indefinite" />
                      </circle>
                      <text x="-12" y="-10" fill="#FDE68A" fontSize="9" fontFamily="JetBrains Mono" fontWeight="bold" textAnchor={p0.x > 700 ? "end" : "start"}>
                        ORIGIN: {selectedOrigin}
                      </text>
                    </g>

                    {/* Live Booked Vessel Navigating Route in Tactical Mode */}
                    {showSimulation && (
                      <g transform={`translate(${bx}, ${by}) rotate(${bAngle})`}>
                        <circle cx="0" cy="0" r="22" fill="none" stroke="#10B981" strokeWidth="2" strokeDasharray="4 2">
                          <animate attributeName="r" values="16;28;16" dur="2s" repeatCount="indefinite" />
                        </circle>
                        <g transform="translate(-18, -45)">
                          <TopDownVesselIcon category={effectiveBookedVessel?.category || "Panamax"} size={36} />
                        </g>
                        <g transform={`rotate(${-bAngle}) translate(22, -12)`}>
                          <rect x="0" y="-10" width={vesselName.length * 6.5 + 24} height="20" rx="3" fill="#020617" stroke="#10B981" strokeWidth="1" />
                          <text x="6" y="3.5" fill="#6EE7B7" fontSize="9" fontFamily="JetBrains Mono" fontWeight="bold">
                            🚢 {vesselName} ({routePct}%)
                          </text>
                        </g>
                      </g>
                    )}
                  </>
                );
              })()}
            </g>
          )}

          {/* 12 EAST COAST PORTS (Interactive Nodes with High-Contrast Badges & No Overlap) */}
          {EAST_COAST_PORTS.map((port) => {
            const isSelected = selectedPort === port.id;
            const isHovered = hoveredPort?.id === port.id;
            const isHighCong = port.congestion === "High";
            const isMedCong = port.congestion === "Medium";
            const portColor = isSelected ? "#10B981" : isHighCong ? "#EF4444" : isMedCong ? "#F59E0B" : "#38BDF8";
            const labelDy = port.labelDy || 0;
            const portDisplayName = port.name.replace(" Port", "").replace(" Dock Complex", "").replace(" Deepwater", "");

            return (
              <g
                key={port.id}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePortClick(port);
                }}
                onMouseEnter={() => setHoveredPort(port)}
                onMouseLeave={() => setHoveredPort(null)}
                className="cursor-pointer group"
              >
                {/* Outer Glow Halo on Hover / Select */}
                {(isSelected || isHovered) && (
                  <circle cx={port.x} cy={port.y} r={isSelected ? 16 : 12} fill={portColor} fillOpacity="0.25" />
                )}

                {/* Base Anchor Marker Node */}
                <circle
                  cx={port.x}
                  cy={port.y}
                  r={isSelected ? 6.5 : 4.5}
                  fill={portColor}
                  stroke="#FFFFFF"
                  strokeWidth={isSelected ? 2 : 1.2}
                />

                {/* Port Name Label Badge */}
                <g transform={`translate(${port.x + 9}, ${port.y + 3.5 + labelDy})`}>
                  {/* Label Background Pill for 100% clean readability */}
                  <rect
                    x="-2"
                    y="-9"
                    width={portDisplayName.length * 6.5 + 16}
                    height="14"
                    rx="3"
                    fill="#0A1128"
                    fillOpacity="0.92"
                    stroke={isSelected ? "#10B981" : isHovered ? "#60A5FA" : isHighCong ? "#EF4444" : "#334155"}
                    strokeWidth={isSelected || isHovered ? "1.2" : "0.7"}
                  />
                  <circle cx="4" cy="-2" r="2.5" fill={portColor} />
                  <text
                    x="10"
                    y="1"
                    fill={isSelected ? "#34D399" : isHovered ? "#FFFFFF" : "#F1F5F9"}
                    fontSize="9"
                    fontFamily="Manrope"
                    fontWeight={isSelected || isHovered ? "800" : "700"}
                  >
                    {portDisplayName}
                  </text>
                </g>
              </g>
            );
          })}

          {/* SIMULATED VESSELS CRUISING ACROSS THE OCEAN */}
          {filteredVessels.map((vessel) => {
            const state = getVesselState(vessel);
            const isVesselSelected = selectedVessel?.id === vessel.id;

            return (
              <g
                key={vessel.id}
                transform={`translate(${state.x}, ${state.y}) rotate(${state.angle})`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedVessel(vessel);
                }}
                className="cursor-pointer"
              >
                {/* Selected Reticle Target */}
                {isVesselSelected && (
                  <g>
                    <circle cx="0" cy="0" r="28" fill="none" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="4 2">
                      <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="8s" repeatCount="indefinite" />
                    </circle>
                    <line x1="-32" y1="0" x2="32" y2="0" stroke="#38BDF8" strokeWidth="1" strokeOpacity="0.6" />
                    <line x1="0" y1="-32" x2="0" y2="32" stroke="#38BDF8" strokeWidth="1" strokeOpacity="0.6" />
                  </g>
                )}

                {/* Top-Down Detailed Scaled Ship SVG Icon */}
                <g transform="translate(-18, -45)">
                  <TopDownVesselIcon category={vessel.category} size={vessel.category === "Capesize" ? 36 : vessel.category === "Panamax" ? 30 : 26} />
                </g>

                {/* Mini AIS Vessel Callout Tag on Hover / Active */}
                <g transform={`rotate(${-state.angle}) translate(16, -10)`}>
                  <rect x="0" y="-8" width={vessel.name.length * 5.2 + 8} height="13" rx="2" fill="#020617" fillOpacity="0.88" stroke="#38BDF8" strokeWidth="0.6" />
                  <text x="4" y="1.5" fill="#E0F2FE" fontSize="8" fontFamily="JetBrains Mono" fontWeight="bold">
                    {vessel.name}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>

        {/* FLOATING HOVER TOOLTIP FOR PORTS */}
        {hoveredPort && !selectedVessel && (
          <div 
            className="absolute z-20 pointer-events-none bg-slate-900/95 backdrop-blur-md text-white p-3 rounded-lg border border-slate-700 shadow-2xl w-64 text-xs space-y-1.5"
            style={{
              left: `${Math.min(75, Math.max(10, (hoveredPort.x / 1000) * 100))}%`,
              top: `${Math.min(70, Math.max(10, (hoveredPort.y / 780) * 100))}%`,
              transform: "translate(-50%, -115%)"
            }}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <div className="font-bold text-sm text-white" style={{ fontFamily: "Manrope" }}>{hoveredPort.name}</div>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                hoveredPort.congestion === "High" ? "bg-red-500/20 text-red-400 border border-red-500/40" :
                hoveredPort.congestion === "Medium" ? "bg-amber-500/20 text-amber-400 border border-amber-500/40" :
                "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
              }`}>
                {hoveredPort.congestion.toUpperCase()} CONGESTION
              </span>
            </div>
            <div className="text-[11px] text-slate-300">{hoveredPort.state} · East Coast India</div>
            <div className="grid grid-cols-3 gap-1 pt-1 text-center font-mono">
              <div className="bg-slate-800/80 p-1 rounded">
                <div className="text-[9px] text-slate-400">MAX DRAFT</div>
                <div className="font-bold text-blue-400">{hoveredPort.maxDraft}m</div>
              </div>
              <div className="bg-slate-800/80 p-1 rounded">
                <div className="text-[9px] text-slate-400">MAX LOA</div>
                <div className="font-bold text-blue-400">{hoveredPort.maxLoa}m</div>
              </div>
              <div className="bg-slate-800/80 p-1 rounded">
                <div className="text-[9px] text-slate-400">WAIT QUEUE</div>
                <div className="font-bold text-amber-400">{hoveredPort.vesselsWaiting} vessels</div>
              </div>
            </div>
            <div className="text-[10px] text-emerald-400 pt-0.5 flex items-center gap-1 font-medium">
              <span>👉 Click port to view overseas supply corridors</span>
            </div>
          </div>
        )}

        {/* SELECTED VESSEL TELEMETRY HUD MODAL / SIDE OVERLAY */}
        {selectedVessel && (
          <div className="absolute top-4 right-4 z-30 w-80 bg-slate-900/95 backdrop-blur-md border border-slate-700 text-white rounded-xl shadow-2xl p-4 text-xs space-y-3 animate-in fade-in slide-in-from-right-4 duration-200">
            <div className="flex items-start justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-blue-600/30 border border-blue-400/50 text-blue-400 grid place-items-center">
                  <Ship size={16} />
                </div>
                <div>
                  <div className="font-extrabold text-sm text-white" style={{ fontFamily: "Manrope" }}>{selectedVessel.name}</div>
                  <div className="text-[10px] text-blue-400 font-mono">{selectedVessel.id} · {selectedVessel.category}</div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedVessel(null)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
              >
                <X size={16} />
              </button>
            </div>

            {/* Top-down graphic preview */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-2 flex items-center justify-center gap-4">
              <TopDownVesselIcon category={selectedVessel.category} size={28} />
              <div className="space-y-0.5">
                <div className="text-[11px] font-bold text-slate-200">{selectedVessel.dwt.toLocaleString()} DWT Bulk Carrier</div>
                <div className="text-[10px] text-slate-400">Cargo: <span className="text-amber-300 font-semibold">{selectedVessel.cargo}</span></div>
                <div className="text-[10px] text-emerald-400 font-mono">Status: {selectedVessel.status}</div>
              </div>
            </div>

            {/* Voyage Corridor Route */}
            <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/60 space-y-1.5">
              <div className="text-[10px] uppercase font-mono text-slate-400 font-bold">Active Cargo Voyage Track</div>
              <div className="flex items-center justify-between font-semibold text-slate-200">
                <span className="text-amber-400 font-mono">{selectedVessel.origin}</span>
                <ChevronRight size={14} className="text-slate-500" />
                <span className="text-emerald-400 font-mono">{selectedVessel.destination} (IND)</span>
              </div>
            </div>

            {/* Real-time Telemetry Metrics */}
            <div className="grid grid-cols-2 gap-2 text-center font-mono">
              <div className="bg-slate-800/80 p-2 rounded border border-slate-700/50">
                <div className="text-[9px] text-slate-400">SPEED (SOG)</div>
                <div className="text-sm font-bold text-blue-400">{selectedVessel.speedKnots} kts</div>
              </div>
              <div className="bg-slate-800/80 p-2 rounded border border-slate-700/50">
                <div className="text-[9px] text-slate-400">ESTIMATED ETA</div>
                <div className="text-sm font-bold text-emerald-400">{selectedVessel.eta}</div>
              </div>
              <div className="bg-slate-800/80 p-2 rounded border border-slate-700/50 col-span-2">
                <div className="text-[9px] text-slate-400">DAILY BUNKER CONSUMPTION</div>
                <div className="text-xs font-bold text-slate-300">{selectedVessel.fuelBurn}</div>
              </div>
            </div>
          </div>
        )}

        {/* BOTTOM CORRIDOR SUMMARY OVERLAY WHEN PORT IS SELECTED */}
        {activePortObj && !selectedVessel && (
          <div className="absolute bottom-3 left-3 right-3 z-10 bg-slate-900/90 backdrop-blur-md border border-slate-700 text-white rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 grid place-items-center">
                <Anchor size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-extrabold text-white" style={{ fontFamily: "Manrope" }}>
                    {activePortObj.name}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    activePortObj.congestion === "High" ? "bg-red-500/20 text-red-300 border-red-500/40" :
                    activePortObj.congestion === "Medium" ? "bg-amber-500/20 text-amber-300 border-amber-500/40" :
                    "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                  }`}>
                    {activePortObj.congestion.toUpperCase()} CONGESTION
                  </span>
                </div>
                <div className="text-xs text-slate-300 mt-0.5">
                  Max Draft: <span className="font-mono text-emerald-400 font-bold">{activePortObj.maxDraft}m</span> · 
                  Max LOA: <span className="font-mono text-emerald-400 font-bold">{activePortObj.maxLoa}m</span> · 
                  Anchor Queue: <span className="font-mono text-amber-400 font-bold">{activePortObj.vesselsWaiting} Vessels</span> (Avg Wait {activePortObj.avgWaitHours}h)
                </div>
              </div>
            </div>

            {/* Overseas Primary Origins for this Port */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider hidden md:inline">
                Primary Corridors:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activePortObj.originRoutes.map((route, i) => (
                  <div key={i} className="bg-slate-800 border border-slate-700 px-2.5 py-1 rounded text-xs flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span className="text-slate-200 font-medium">{route.origin}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({route.transitDays}d · {route.cargo})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

        {/* Map Footer Explanatory Legend */}
        <div className="bg-slate-50 px-5 py-2.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Low Congestion
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Medium Congestion
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> High Congestion
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <span className="w-3 h-0.5 bg-blue-500 inline-block" /> Shipping Lane TSS
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <span className="w-3 h-0.5 bg-amber-400 inline-block border-dashed" /> Active Inbound Corridor
            </div>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Interactive Maritime GIS · 12 Ports · {vessels.length} Simulated Vessels Live
          </div>
        </div>
        </>
      )}
    </div>
  );
}