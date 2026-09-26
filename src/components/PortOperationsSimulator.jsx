import React, { useState, useEffect, useRef } from "react";
import { 
  Anchor, Ship, Navigation, Wind, Layers, Play, Pause, FastForward, 
  RotateCcw, Compass, MapPin, Activity, CheckCircle2, 
  X, Globe, Radio, Clock, AlertTriangle, ArrowRight,
  TrendingUp, Sparkles, Filter, Eye, Cpu, Wrench, ShieldCheck,
  ShieldAlert, AlertOctagon, CheckCircle, ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import { useFlow } from "../lib/flow";
import TopDownVesselIcon, { 
  CapesizeShipSvg, 
  PanamaxShipSvg, 
  SupramaxShipSvg, 
  HandysizeShipSvg,
  ContainerShipSvg 
} from "./VesselIcons";

// ============================================================================
// 12 EAST COAST INDIAN PORTS DATA REPOSITORY
// ============================================================================
export const EAST_COAST_PORT_DATABASE = {
  Paradip: {
    id: "Paradip",
    name: "Paradip Port Authority",
    locode: "INPPT",
    state: "Odisha",
    lat: 20.2644,
    lon: 86.6685,
    harborType: "Deepwater Artificial Basin with Breakwaters",
    maxDraftM: 14.5,
    channelDepthM: 17.1,
    tideStatus: "+2.4m High Tide",
    berths: [
      {
        id: "BERTH-01",
        code: "B-01",
        name: "Mechanized Import Quay",
        category: "Panamax",
        status: "OCCUPIED",
        maxDraft: 14.5,
        x: 180,
        y: 245,
        vessel: {
          name: "MV Bengal Voyager",
          category: "Panamax",
          cargo: "2,800 TEU Imports",
          carrier: "Tata NYK",
          operationType: "DISCHARGE",
          progressPct: 65,
          draftM: 12.8,
          turnaroundHoursRemaining: 6.8,
          dischargeRate: 0.22
        }
      },
      {
        id: "BERTH-02",
        code: "B-02",
        name: "Deepwater Container Terminal Quay",
        category: "Capesize",
        status: "FREE",
        maxDraft: 16.5,
        x: 365,
        y: 245,
        vessel: null,
        nextAllocated: "MV Pacific Horizon (Inbound · Discharging)",
        turnaroundHoursRemaining: 0
      },
      {
        id: "BERTH-03",
        code: "B-03",
        name: "Multi-Purpose General Cargo Berth",
        category: "Supramax",
        status: "OCCUPIED",
        maxDraft: 14.0,
        x: 550,
        y: 245,
        vessel: {
          name: "MV Coastal Pride",
          category: "Supramax",
          cargo: "2,400 TEU Freight",
          carrier: "Adani Shipping",
          operationType: "DISCHARGE",
          progressPct: 55,
          draftM: 10.4,
          turnaroundHoursRemaining: 3.5,
          dischargeRate: 0.40
        }
      },
      {
        id: "BERTH-04",
        code: "B-04",
        name: "Agri-Bulk & Clean Cargo Jetty",
        category: "Handysize",
        status: "FREE",
        maxDraft: 12.5,
        x: 735,
        y: 245,
        vessel: null,
        nextAllocated: "MV Rotterdam Bridge (Import · Discharging)",
        turnaroundHoursRemaining: 0
      },
      {
        id: "BERTH-05",
        code: "B-05",
        name: "Container Pier",
        category: "Container",
        status: "OCCUPIED",
        maxDraft: 15.0,
        x: 920,
        y: 245,
        vessel: {
          name: "MV Ocean Splendor",
          category: "Container",
          cargo: "3,200 TEU Freight",
          carrier: "Maersk Line",
          operationType: "DISCHARGE",
          progressPct: 35,
          draftM: 13.0,
          turnaroundHoursRemaining: 13.5,
          dischargeRate: 0.25
        }
      }
    ],
    waitingVessel: {
      name: "MV Pacific Horizon",
      category: "Capesize",
      cargo: "3,600 TEU Freight",
      operationType: "DISCHARGE",
      draftM: 15.2
    }
  },

  Visakhapatnam: {
    id: "Visakhapatnam",
    name: "Visakhapatnam Port Authority (VPA)",
    locode: "INVTZ",
    state: "Andhra Pradesh",
    lat: 17.6868,
    lon: 83.2185,
    harborType: "Natural Sheltered Outer & Inner Harbor",
    maxDraftM: 18.1,
    channelDepthM: 20.0,
    tideStatus: "+1.6m Normal Tide",
    berths: [
      {
        id: "BERTH-01",
        code: "OB-01",
        name: "Outer Harbor Capesize Ore Quay",
        category: "Capesize",
        status: "OCCUPIED",
        maxDraft: 18.1,
        x: 180,
        y: 245,
        vessel: {
          name: "MV Vizag Pioneer",
          category: "Capesize",
          cargo: "180,000 MT Iron Ore",
          carrier: "NMDC / Essar",
          progressPct: 75,
          draftM: 16.5,
          turnaroundHoursRemaining: 6.5,
          dischargeRate: 0.28
        }
      },
      {
        id: "BERTH-02",
        code: "OB-02",
        name: "Outer Harbor POL Supertanker Quay",
        category: "Container",
        status: "FREE",
        maxDraft: 17.5,
        x: 365,
        y: 245,
        vessel: null,
        nextAllocated: "Crude Carrier Desh Shanti",
        turnaroundHoursRemaining: 0
      },
      {
        id: "BERTH-03",
        code: "EQ-01",
        name: "East Quay Mechanized Coking Coal",
        category: "Panamax",
        status: "OCCUPIED",
        maxDraft: 14.5,
        x: 550,
        y: 245,
        vessel: {
          name: "MV Godavari Star",
          category: "Panamax",
          cargo: "75,000 MT Met Coal",
          carrier: "RINL Steel",
          progressPct: 85,
          draftM: 13.2,
          turnaroundHoursRemaining: 2.8,
          dischargeRate: 0.42
        }
      },
      {
        id: "BERTH-04",
        code: "WQ-05",
        name: "West Quay Clean Cargo",
        category: "Supramax",
        status: "FREE",
        maxDraft: 14.0,
        x: 735,
        y: 245,
        vessel: null,
        nextAllocated: "Feeder Coastal Trader",
        turnaroundHoursRemaining: 0
      },
      {
        id: "BERTH-05",
        code: "VCT-01",
        name: "Visakha Container Terminal",
        category: "Container",
        status: "OCCUPIED",
        maxDraft: 16.0,
        x: 920,
        y: 245,
        vessel: {
          name: "MSC Anisha R",
          category: "Container",
          cargo: "4,500 TEU Freight",
          carrier: "MSC",
          progressPct: 32,
          draftM: 14.2,
          turnaroundHoursRemaining: 15.0,
          dischargeRate: 0.18
        }
      }
    ],
    waitingVessel: {
      name: "MV Australian Trader",
      category: "Capesize",
      cargo: "150,000 MT Coal",
      draftM: 16.0
    }
  },

  Dhamra: {
    id: "Dhamra",
    name: "Dhamra Port (Adani Ports)",
    locode: "INDHM",
    state: "Odisha",
    lat: 20.8266,
    lon: 86.9744,
    harborType: "Ultra-Deepwater All-Weather Port",
    maxDraftM: 18.0,
    channelDepthM: 19.5,
    tideStatus: "+3.1m Tidal Window",
    berths: [
      {
        id: "BERTH-01",
        code: "DH-01",
        name: "Capesize Coking Coal Import Quay",
        category: "Capesize",
        status: "OCCUPIED",
        maxDraft: 18.0,
        x: 180,
        y: 245,
        vessel: {
          name: "MV Cape Osprey",
          category: "Capesize",
          cargo: "160,000 MT Coal",
          carrier: "Tata Steel",
          progressPct: 78,
          draftM: 14.8,
          turnaroundHoursRemaining: 5.5,
          dischargeRate: 0.35
        }
      },
      {
        id: "BERTH-02",
        code: "DH-02",
        name: "Mechanized Ore Shiploader Berth",
        category: "Capesize",
        status: "FREE",
        maxDraft: 18.0,
        x: 365,
        y: 245,
        vessel: null,
        nextAllocated: "MV Kalinganagar Express",
        turnaroundHoursRemaining: 0
      },
      {
        id: "BERTH-03",
        code: "DH-03",
        name: "Secondary Deep Draught Berth",
        category: "Panamax",
        status: "FREE",
        maxDraft: 17.5,
        x: 550,
        y: 245,
        vessel: null,
        nextAllocated: "Ready for Allocation",
        turnaroundHoursRemaining: 0
      },
      {
        id: "BERTH-04",
        code: "DH-04",
        name: "Multi-Purpose Clean Bulk Quay",
        category: "Supramax",
        status: "OCCUPIED",
        maxDraft: 15.0,
        x: 735,
        y: 245,
        vessel: {
          name: "MV Dhamra Glory",
          category: "Supramax",
          cargo: "55,000 MT Limestone",
          carrier: "Adani Shipping",
          progressPct: 45,
          draftM: 11.2,
          turnaroundHoursRemaining: 14.0,
          dischargeRate: 0.22
        }
      },
      {
        id: "BERTH-05",
        code: "DH-LNG",
        name: "Cryogenic LNG Regas Terminal",
        category: "Container",
        status: "FREE",
        maxDraft: 14.5,
        x: 920,
        y: 245,
        vessel: null,
        nextAllocated: "LNG Carrier Al Rayyan",
        turnaroundHoursRemaining: 0
      }
    ],
    waitingVessel: {
      name: "MV Kalinganagar Express",
      category: "Capesize",
      cargo: "155,000 MT Coal",
      draftM: 16.5
    }
  },

  Haldia: {
    id: "Haldia",
    name: "Haldia Dock Complex (SMP)",
    locode: "INHAL",
    state: "West Bengal",
    lat: 22.0232,
    lon: 88.0645,
    harborType: "Impounded Lock-Gate Estuary Docks",
    maxDraftM: 9.0,
    channelDepthM: 11.2,
    tideStatus: "+4.2m Bore Tide Window",
    berths: [
      {
        id: "BERTH-01",
        code: "HDC-04",
        name: "Berth 4 Mechanized Coal Berth",
        category: "Handysize",
        status: "OCCUPIED",
        maxDraft: 9.0,
        x: 180,
        y: 245,
        vessel: {
          name: "MV Bengal Pioneer",
          category: "Handysize",
          cargo: "32,000 MT Steam Coal",
          carrier: "Durgapur Power",
          progressPct: 82,
          draftM: 7.2,
          turnaroundHoursRemaining: 3.8,
          dischargeRate: 0.38
        }
      },
      {
        id: "BERTH-02",
        code: "HDC-4B",
        name: "Berth 4B Container & Bulk",
        category: "Handysize",
        status: "FREE",
        maxDraft: 8.8,
        x: 365,
        y: 245,
        vessel: null,
        nextAllocated: "MV Hooghly Star",
        turnaroundHoursRemaining: 0
      },
      {
        id: "BERTH-03",
        code: "HDC-08",
        name: "Berth 8 Multi-Purpose Clean",
        category: "Supramax",
        status: "OCCUPIED",
        maxDraft: 8.9,
        x: 550,
        y: 245,
        vessel: {
          name: "MV Ganga Pride",
          category: "Supramax",
          cargo: "28,000 MT Petcoke",
          carrier: "Haldia Petrochem",
          progressPct: 60,
          draftM: 7.5,
          turnaroundHoursRemaining: 8.0,
          dischargeRate: 0.25
        }
      },
      {
        id: "BERTH-04",
        code: "HDC-09",
        name: "Berth 9 POL Products Jetty",
        category: "Handysize",
        status: "FREE",
        maxDraft: 8.5,
        x: 735,
        y: 245,
        vessel: null,
        nextAllocated: "Coastal Tanker Narmada",
        turnaroundHoursRemaining: 0
      },
      {
        id: "BERTH-05",
        code: "HDC-12",
        name: "Berth 12 Container & Steel",
        category: "Container",
        status: "OCCUPIED",
        maxDraft: 8.5,
        x: 920,
        y: 245,
        vessel: {
          name: "TCI Express",
          category: "Container",
          cargo: "1,100 TEU Feeder",
          carrier: "TCI Seaways",
          progressPct: 90,
          draftM: 6.8,
          turnaroundHoursRemaining: 1.5,
          dischargeRate: 0.5
        }
      }
    ],
    waitingVessel: {
      name: "MV Hooghly Star",
      category: "Handysize",
      cargo: "30,000 MT Coal",
      draftM: 7.4
    }
  },

  Chennai: {
    id: "Chennai",
    name: "Chennai Port Authority",
    locode: "INMAA",
    state: "Tamil Nadu",
    lat: 13.0827,
    lon: 80.2707,
    harborType: "Artificial Sheltered Coastal Basin",
    maxDraftM: 15.5,
    channelDepthM: 16.5,
    tideStatus: "+1.2m Calm Sea",
    berths: [
      {
        id: "BERTH-01",
        code: "CCT-01",
        name: "Chennai Container Terminal (DP World)",
        category: "Container",
        status: "OCCUPIED",
        maxDraft: 15.5,
        x: 180,
        y: 245,
        vessel: {
          name: "CMA CGM Figaro",
          category: "Container",
          cargo: "4,200 TEU Freight",
          carrier: "CMA CGM",
          progressPct: 70,
          draftM: 13.4,
          turnaroundHoursRemaining: 8.0,
          dischargeRate: 0.3
        }
      },
      {
        id: "BERTH-02",
        code: "CIT-02",
        name: "Chennai International Terminal",
        category: "Container",
        status: "FREE",
        maxDraft: 15.0,
        x: 365,
        y: 245,
        vessel: null,
        nextAllocated: "Wan Hai 502",
        turnaroundHoursRemaining: 0
      },
      {
        id: "BERTH-03",
        code: "JD-01",
        name: "Jawahar Dock Bulk Cargo Quay",
        category: "Panamax",
        status: "OCCUPIED",
        maxDraft: 13.5,
        x: 550,
        y: 245,
        vessel: {
          name: "MV Coromandel",
          category: "Panamax",
          cargo: "65,000 MT Fertilizers",
          carrier: "Coromandel Int.",
          progressPct: 50,
          draftM: 11.5,
          turnaroundHoursRemaining: 12.0,
          dischargeRate: 0.22
        }
      },
      {
        id: "BERTH-04",
        code: "BD-02",
        name: "Bharathi Dock Deepwater Ore",
        category: "Capesize",
        status: "FREE",
        maxDraft: 15.5,
        x: 735,
        y: 245,
        vessel: null,
        nextAllocated: "MV Marina Pearl",
        turnaroundHoursRemaining: 0
      },
      {
        id: "BERTH-05",
        code: "SQ-01",
        name: "South Quay Ro-Ro Auto Terminal",
        category: "Handysize",
        status: "OCCUPIED",
        maxDraft: 11.0,
        x: 920,
        y: 245,
        vessel: {
          name: "Glovis Symphony",
          category: "Handysize",
          cargo: "2,400 Export Cars",
          carrier: "Hyundai Glovis",
          progressPct: 82,
          draftM: 8.4,
          turnaroundHoursRemaining: 3.2,
          dischargeRate: 0.4
        }
      }
    ],
    waitingVessel: {
      name: "Wan Hai 502",
      category: "Container",
      cargo: "3,800 TEU Components",
      draftM: 13.8
    }
  },

  Krishnapatnam: {
    id: "Krishnapatnam",
    name: "Krishnapatnam Port (KPCL)",
    locode: "INKRI",
    state: "Andhra Pradesh",
    lat: 14.2500,
    lon: 80.1200,
    harborType: "Deepwater Multipurpose Commercial Port",
    maxDraftM: 18.5,
    channelDepthM: 19.5,
    tideStatus: "+1.8m High Tide",
    berths: [
      {
        id: "BERTH-01",
        code: "KP-01",
        name: "Deepwater Capesize Coal Quay",
        category: "Capesize",
        status: "FREE",
        maxDraft: 18.5,
        x: 180,
        y: 245,
        vessel: null,
        nextAllocated: "Ready for Capesize Diversion",
        turnaroundHoursRemaining: 0
      },
      {
        id: "BERTH-02",
        code: "KP-02",
        name: "Capesize Multi-Cargo Import Quay",
        category: "Capesize",
        status: "OCCUPIED",
        maxDraft: 18.0,
        x: 365,
        y: 245,
        vessel: {
          name: "MV Andhra Star",
          category: "Capesize",
          cargo: "155,000 MT Coal",
          carrier: "APGENCO",
          progressPct: 62,
          draftM: 16.0,
          turnaroundHoursRemaining: 9.5,
          dischargeRate: 0.25
        }
      },
      {
        id: "BERTH-03",
        code: "KP-03",
        name: "Clean Fertilizer & Grain Terminal",
        category: "Panamax",
        status: "FREE",
        maxDraft: 15.5,
        x: 550,
        y: 245,
        vessel: null,
        nextAllocated: "Open Buffer",
        turnaroundHoursRemaining: 0
      },
      {
        id: "BERTH-04",
        code: "KP-04",
        name: "Container Terminal Quay 1",
        category: "Container",
        status: "OCCUPIED",
        maxDraft: 16.0,
        x: 735,
        y: 245,
        vessel: {
          name: "OOCL Rotterdam",
          category: "Container",
          cargo: "3,500 TEU Solar Cargo",
          carrier: "OOCL",
          progressPct: 86,
          draftM: 12.8,
          turnaroundHoursRemaining: 2.8,
          dischargeRate: 0.38
        }
      },
      {
        id: "BERTH-05",
        code: "KP-05",
        name: "Liquid POL & Edible Oil Jetty",
        category: "Handysize",
        status: "FREE",
        maxDraft: 13.5,
        x: 920,
        y: 245,
        vessel: null,
        nextAllocated: "Palm Oil Tanker Samudra",
        turnaroundHoursRemaining: 0
      }
    ],
    waitingVessel: {
      name: "MV Southern Ocean",
      category: "Capesize",
      cargo: "150,000 MT Coal",
      draftM: 16.2
    }
  }
};

const EAST_COAST_PORT_LIST = [
  { id: "Paradip", name: "Paradip Port", locode: "INPPT", state: "Odisha" },
  { id: "Visakhapatnam", name: "Visakhapatnam Port", locode: "INVTZ", state: "Andhra Pradesh" },
  { id: "Dhamra", name: "Dhamra Port", locode: "INDHM", state: "Odisha" },
  { id: "Haldia", name: "Haldia Dock Complex", locode: "INHAL", state: "West Bengal" },
  { id: "Chennai", name: "Chennai Port", locode: "INMAA", state: "Tamil Nadu" },
  { id: "Krishnapatnam", name: "Krishnapatnam Port", locode: "INKRI", state: "Andhra Pradesh" }
];

// ============================================================================
// CLEAN TOP-DOWN SHIP GRAPHIC (NO WEIRD WAKES OR BLURS)
// ============================================================================
function CenteredShipGraphic({
  category = "Panamax",
  size = 38,
  heading = 90, // 0 = North, 90 = East, 180 = South, 270 = West
  x = 0,
  y = 0,
  isMoving = false,
  showTugs = false,
  cargoProgress = null,
  operationType = "DISCHARGE",
  onClick
}) {
  const offsets = {
    Capesize: { cx: 20, cy: 56, scale: 0.72 },
    Panamax: { cx: 17, cy: 47, scale: 0.70 },
    Supramax: { cx: 15, cy: 42, scale: 0.68 },
    Handysize: { cx: 13, cy: 35, scale: 0.65 },
    Container: { cx: 18, cy: 50, scale: 0.72 }
  };

  const meta = offsets[category] || offsets.Panamax;

  return (
    <g
      transform={`translate(${x}, ${y}) rotate(${heading})`}
      className={onClick ? "cursor-pointer" : ""}
      onClick={onClick}
    >
      {/* HARBOR TUGBOATS (SHOWN ONLY DURING TERMINAL TURNING & BERTHING MANEUVERS) */}
      {showTugs && (
        <g pointerEvents="none">
          {/* Bow Tug */}
          <g transform={`translate(-26, -${meta.cy - 12}) rotate(-15) scale(0.38)`}>
            <polygon points="0,-12 16,0 0,12 -12,8 -12,-8" fill="#F59E0B" stroke="#0F172A" strokeWidth="1.5" />
            <circle cx="2" cy="0" r="4" fill="#0284C7" />
          </g>
          {/* Stern Tug */}
          <g transform={`translate(26, ${meta.cy - 15}) rotate(20) scale(0.38)`}>
            <polygon points="0,-12 16,0 0,12 -12,8 -12,-8" fill="#F59E0B" stroke="#0F172A" strokeWidth="1.5" />
            <circle cx="2" cy="0" r="4" fill="#0284C7" />
          </g>
        </g>
      )}

      {/* CENTERED TOP-DOWN SHIP SVG (DYNAMIC MULTICOLOR BOXES LOADING OR DISCHARGE) */}
      <g transform={`scale(${meta.scale}) translate(-${meta.cx}, -${meta.cy})`}>
        {category === "Capesize" && <CapesizeShipSvg size={size} cargoProgress={cargoProgress} operationType={operationType} />}
        {category === "Panamax" && <PanamaxShipSvg size={size} cargoProgress={cargoProgress} operationType={operationType} />}
        {category === "Supramax" && <SupramaxShipSvg size={size} cargoProgress={cargoProgress} operationType={operationType} />}
        {category === "Handysize" && <HandysizeShipSvg size={size} cargoProgress={cargoProgress} operationType={operationType} />}
        {category === "Container" && <ContainerShipSvg size={size} cargoProgress={cargoProgress} operationType={operationType} />}
        {!["Capesize", "Panamax", "Supramax", "Handysize", "Container"].includes(category) && (
          <ContainerShipSvg size={size} cargoProgress={cargoProgress} operationType={operationType} />
        )}
      </g>

      {/* RED AIS TRACKING DOTS */}
      <g filter="url(#aisDotGlow)" pointerEvents="none">
        <circle cx="0" cy={-meta.cy + 18} r="2.8" fill="#EF4444" />
        <circle cx="0" cy={meta.cy - 18} r="2.5" fill="#EF4444" />
        {isMoving && (
          <circle cx="0" cy={-meta.cy + 18} r="6" fill="none" stroke="#EF4444" strokeWidth="1.2" opacity="0.6">
            <animate attributeName="r" values="3;9;3" dur="1.5s" repeatCount="indefinite" />
          </circle>
        )}
      </g>
    </g>
  );
}

// ============================================================================
// MAIN SIMULATOR COMPONENT
// ============================================================================
export default function PortOperationsSimulator({
  defaultPort = "Paradip",
  onPortChange
}) {
  const { 
    requirement, 
    simProgress, 
    vesselArrivedAtPort, 
    waitingForTruckGateScan, 
    gateCleared, 
    scanGatePass 
  } = useFlow();

  const [selectedPortId, setSelectedPortId] = useState(requirement?.destinationPort || defaultPort);
  const activePort = EAST_COAST_PORT_DATABASE[selectedPortId] || EAST_COAST_PORT_DATABASE.Paradip;

  // Selected Berth for Inspection Modal
  const [selectedBerth, setSelectedBerth] = useState(null);
  const [hoveredBerth, setHoveredBerth] = useState(null);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(true);
  const [simSpeed, setSimSpeed] = useState(1);
  const [simTick, setSimTick] = useState(0);

  // Live berths state
  const [liveBerths, setLiveBerths] = useState(activePort.berths);

  const hasTriggeredArrivalRef = useRef(false);
  const hasTriggeredDepartureRef = useRef(false);

  // Automatically update Berth B-01 when multimodal vessel arrives & gate clearance occurs
  useEffect(() => {
    if (vesselArrivedAtPort) {
      setLiveBerths(prev => prev.map((b, i) => {
        if (i === 0) { // Berth B-01
          const vName = requirement?.selectedVessel?.name || "MV Bengal Voyager";
          const vCat = requirement?.selectedVessel?.category || "Panamax";
          const cQty = requirement?.cargoQuantity ? `${requirement.cargoQuantity.toLocaleString()} MT Coal` : "70,000 MT Imports";
          const prog = !gateCleared ? 0 : Math.min(100, Math.max(15, Math.round(((simProgress - 75) / 10) * 100)));
          return {
            ...b,
            status: "OCCUPIED",
            vessel: {
              ...b.vessel,
              name: vName,
              category: vCat,
              cargo: cQty,
              carrier: requirement?.companyName || "Tata Steel",
              operationType: "DISCHARGE",
              progressPct: prog,
              turnaroundHoursRemaining: !gateCleared ? 8.5 : Math.max(0.5, parseFloat((8.5 * (1 - prog / 100)).toFixed(1)))
            }
          };
        }
        return b;
      }));
    }
  }, [vesselArrivedAtPort, gateCleared, simProgress, requirement]);

  // When vessel reaches destination port (75%), launch INBOUND berthing transit simulation
  useEffect(() => {
    if (vesselArrivedAtPort && !hasTriggeredArrivalRef.current) {
      hasTriggeredArrivalRef.current = true;
      const vName = requirement?.selectedVessel?.name || "MV Bengal Voyager";
      const vCat = requirement?.selectedVessel?.category || "Panamax";
      const cQty = requirement?.cargoQuantity ? `${requirement.cargoQuantity.toLocaleString()} MT Coal` : "70,000 MT Imports";

      setActiveTransit({
        type: "INBOUND",
        vessel: {
          name: vName,
          category: vCat,
          cargo: cQty,
          carrier: requirement?.companyName || "Tata Steel",
          operationType: "DISCHARGE",
          draftM: 13.5
        },
        berthIndex: 0,
        progress: 0.0
      });
      toast.info(`🚢 Telemetry Arrival: ${vName} entering destination fairway to Berth B-01.`);
    }
  }, [vesselArrivedAtPort, requirement]);

  // When truck leaves berth for plant (simProgress >= 90), launch OUTBOUND unberthing departure
  useEffect(() => {
    if (gateCleared && simProgress >= 90 && !hasTriggeredDepartureRef.current) {
      hasTriggeredDepartureRef.current = true;
      const departingVessel = liveBerths[0]?.vessel || {
        name: requirement?.selectedVessel?.name || "MV Bengal Voyager",
        category: "Panamax",
        operationType: "DISCHARGE"
      };

      setLiveBerths(prev => {
        const copy = [...prev];
        copy[0] = {
          ...copy[0],
          status: "FREE",
          vessel: null,
          nextAllocated: "Unberthing · Ready for Next Arrival",
          turnaroundHoursRemaining: 0
        };
        return copy;
      });

      setActiveTransit({
        type: "OUTBOUND",
        vessel: departingVessel,
        berthIndex: 0,
        progress: 0.0
      });
      toast.success(`🏁 Unloading Completed! ${departingVessel.name} unberthed from B-01 and steaming out to sea.`);
    }
  }, [gateCleared, simProgress, requirement, liveBerths]);

  // Discrete Physical Vessel Transit: exactly ONE ship moving at any time
  // transit = null | { type: "INBOUND"|"OUTBOUND"|"DIVERTING", vessel, berthIndex, progress: 0..1 }
  const [activeTransit, setActiveTransit] = useState(null);

  // Queued vessels waiting at outer anchorage (Mix of Export Loading & Import Discharge)
  const [anchoredQueue, setAnchoredQueue] = useState([
    activePort.waitingVessel || { name: "MV Pacific Horizon", category: "Capesize", cargo: "3,600 TEU Exports", operationType: "LOADING" },
    { name: "MV Indian Star", category: "Panamax", cargo: "2,800 TEU Imports", operationType: "DISCHARGE" },
    { name: "MV Singapore Express", category: "Container", cargo: "3,200 TEU Exports", operationType: "LOADING" }
  ]);

  // Scenario 1: Port Congestion & Diversion
  const [congestionScenarioActive, setCongestionScenarioActive] = useState(false);
  const [diversionExecuted, setDiversionExecuted] = useState(false);
  const [congestedVessel, setCongestedVessel] = useState(null);

  // Scenario 2: Vessel Breakdown & Queue Swap
  const [delayScenarioActive, setDelayScenarioActive] = useState(false);
  const [swapExecuted, setSwapExecuted] = useState(false);
  const [feederFinished, setFeederFinished] = useState(false);
  const [primaryRepaired, setPrimaryRepaired] = useState(false);
  const [primaryRepairHours, setPrimaryRepairHours] = useState(8.0);
  const [feederTurnaroundHours, setFeederTurnaroundHours] = useState(4.5);

  // Reset function
  const resetSimulation = () => {
    hasTriggeredArrivalRef.current = false;
    hasTriggeredDepartureRef.current = false;
    const p = EAST_COAST_PORT_DATABASE[selectedPortId] || EAST_COAST_PORT_DATABASE.Paradip;
    setLiveBerths(p.berths);
    setActiveTransit(null);
    setAnchoredQueue([
      p.waitingVessel || { name: "MV Pacific Horizon", category: "Capesize", cargo: "165,000 MT Freight", operationType: "DISCHARGE" },
      { name: "MV Indian Star", category: "Panamax", cargo: "72,000 MT Freight", operationType: "DISCHARGE" }
    ]);
    setCongestionScenarioActive(false);
    setDiversionExecuted(false);
    setCongestedVessel(null);
    setDelayScenarioActive(false);
    setSwapExecuted(false);
    setFeederFinished(false);
    setPrimaryRepaired(false);
    setPrimaryRepairHours(8.0);
    setFeederTurnaroundHours(4.5);
    toast.info("Simulation reset to default baseline.");
  };

  useEffect(() => {
    resetSimulation();
    if (onPortChange) onPortChange(selectedPortId);
  }, [selectedPortId]);

  // =========================================================================
  // SYMMETRICAL CENTRAL FAIRWAY TRANSIT & INDEPENDENT BERTH CARGO ENGINE
  // =========================================================================
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setSimTick((prev) => prev + 1);

      // 1. Advance Active Transit (Inbound / Outbound / Diverting Ship)
      // Vessels sailing do NOT freeze berth cargo discharge!
      if (activeTransit) {
        const speedStep = 0.018 * simSpeed;
        const nextProgress = activeTransit.progress + speedStep;

        if (nextProgress >= 1.0) {
          // Transit Finished
          if (activeTransit.type === "INBOUND") {
            const bIdx = activeTransit.berthIndex;
            setLiveBerths((prev) => {
              const copy = [...prev];
              copy[bIdx] = {
                ...copy[bIdx],
                status: "OCCUPIED",
                vessel: {
                  ...activeTransit.vessel,
                  progressPct: 0,
                  turnaroundHoursRemaining: 12.0,
                  dischargeRate: 0.35,
                  operationType: "DISCHARGE"
                }
              };
              return copy;
            });
            toast.success(`⚓ ${activeTransit.vessel.name} berthed at ${liveBerths[bIdx].code}! Unloading cargo active.`);
            setActiveTransit(null);
          } else if (activeTransit.type === "OUTBOUND") {
            toast.info(`🌊 ${activeTransit.vessel.name} cleared fairway channel into open sea.`);
            setActiveTransit(null);
          } else if (activeTransit.type === "DIVERTING") {
            toast.success(`🧭 ${activeTransit.vessel.name} departed south-west towards Krishnapatnam Port.`);
            setActiveTransit(null);
          }
        } else {
          setActiveTransit((curr) => (curr ? { ...curr, progress: nextProgress } : null));
        }
      }

      // 2. Scenario 2 Dual Countdown Timers (Fully Decoupled)
      if (delayScenarioActive && swapExecuted) {
        // Feeder countdown (4.5h turnaround at Berth B-02)
        if (!feederFinished) {
          setFeederTurnaroundHours((h) => {
            const nextH = Math.max(0, h - 0.22 * simSpeed);
            if (nextH <= 0) {
              setFeederFinished(true);
              toast.success("🔔 Feeder MV Coastal Express completed discharge in 4.5h! Unberthing from B-02.");
              setLiveBerths((bList) => {
                const copy = [...bList];
                copy[1] = {
                  ...copy[1],
                  status: "FREE",
                  vessel: null,
                  nextAllocated: "MV Bengal Titan (Repairing at Anchorage)",
                  turnaroundHoursRemaining: 0
                };
                return copy;
              });
              setActiveTransit({
                type: "OUTBOUND",
                vessel: { name: "MV Coastal Express", category: "Supramax", operationType: "DISCHARGE" },
                berthIndex: 1,
                progress: 0.0
              });
              return 0;
            }
            return parseFloat(nextH.toFixed(1));
          });
        }

        // Primary Repair countdown (8.0h down to 0.0h) - Continues independently after Feeder departs!
        if (!primaryRepaired) {
          setPrimaryRepairHours((r) => {
            const nextR = Math.max(0, r - 0.13 * simSpeed);
            if (nextR <= 0) {
              setPrimaryRepaired(true);
              toast.success("🔧 MV Bengal Titan problem solved! Breakdown repaired. Inbound to Berth B-02.");
              setLiveBerths((bList) => {
                const copy = [...bList];
                copy[1] = {
                  ...copy[1],
                  status: "FREE",
                  vessel: null,
                  nextAllocated: "MV Bengal Titan (Inbound · Docking)",
                  turnaroundHoursRemaining: 0
                };
                return copy;
              });
              setActiveTransit({
                type: "INBOUND",
                vessel: {
                  name: "MV Bengal Titan",
                  category: "Panamax",
                  cargo: "75,000 MT Coking Coal",
                  carrier: "Tata NYK",
                  operationType: "DISCHARGE",
                  draftM: 13.5
                },
                berthIndex: 1,
                progress: 0.0
              });
              return 0;
            }
            return parseFloat(nextR.toFixed(1));
          });
        }
      }

      // 3. Outbound Departure: When a docked vessel finishes discharge (100%), smoothly launch OUTBOUND transit
      if (!activeTransit) {
        const finishedIdx = liveBerths.findIndex(
          (b) => b.status === "OCCUPIED" && b.vessel && (b.vessel.progressPct >= 100 || b.vessel.turnaroundHoursRemaining <= 0)
        );

        if (finishedIdx !== -1) {
          const departingVessel = liveBerths[finishedIdx].vessel;
          toast.info(`🔔 ${departingVessel.name} completed cargo discharge! Unberthing and departing out to sea.`);

          // Mark berth free
          setLiveBerths((prev) => {
            const copy = [...prev];
            copy[finishedIdx] = {
              ...copy[finishedIdx],
              status: "FREE",
              vessel: null,
              nextAllocated: "Unberthing · Ready for Next Arrival",
              turnaroundHoursRemaining: 0
            };
            return copy;
          });

          // Launch full OUTBOUND departure motion starting from dock (progress: 0.0)
          setActiveTransit({
            type: "OUTBOUND",
            vessel: departingVessel,
            berthIndex: finishedIdx,
            progress: 0.0
          });
        }
      }

      // 4. Dynamic Cargo Discharge (Independent continuous rates per berth)
      // Stored with 2 decimal places to prevent Math.round from freezing at low discharge rates!
      setLiveBerths((prevBerths) => {
        return prevBerths.map((berth) => {
          if (berth.status !== "OCCUPIED" || !berth.vessel) return berth;

          const currentProg = berth.vessel.progressPct || 0;
          const currentHours = berth.vessel.turnaroundHoursRemaining || 8.0;

          const rate = berth.vessel.dischargeRate || 0.35;
          const stepProg = rate * simSpeed;
          const newProg = Math.min(100, currentProg + stepProg);
          const newHours = Math.max(0, currentHours - stepProg * 0.08);

          return {
            ...berth,
            vessel: {
              ...berth.vessel,
              progressPct: parseFloat(newProg.toFixed(2)),
              turnaroundHoursRemaining: parseFloat(newHours.toFixed(1))
            }
          };
        });
      });

      // 5. Inbound allocation when berth is free & queue waiting
      if (!activeTransit && !congestionScenarioActive && !delayScenarioActive) {
        const freeIndex = liveBerths.findIndex((b) => b.status === "FREE");
        if (freeIndex !== -1 && anchoredQueue.length > 0) {
          const nextVessel = anchoredQueue[0];
          setAnchoredQueue((q) => q.slice(1));

          const pool = [
            { name: "MV Pacific Pioneer", category: "Capesize", cargo: "3,600 TEU Freight", operationType: "DISCHARGE" },
            { name: "MV Indian Ocean", category: "Panamax", cargo: "2,800 TEU Freight", operationType: "DISCHARGE" },
            { name: "MV Bengal Pride", category: "Supramax", cargo: "2,400 TEU Freight", operationType: "DISCHARGE" },
            { name: "MV Eastern Star", category: "Handysize", cargo: "1,600 TEU Freight", operationType: "DISCHARGE" }
          ];
          const newArrival = pool[Math.floor(Math.random() * pool.length)];
          setAnchoredQueue((q) => [...q, newArrival]);

          setActiveTransit({
            type: "INBOUND",
            vessel: { ...nextVessel, operationType: "DISCHARGE" },
            berthIndex: freeIndex,
            progress: 0.0
          });
        }
      }
    }, 250 / simSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, simSpeed, activeTransit, liveBerths, anchoredQueue, congestionScenarioActive, delayScenarioActive, swapExecuted, feederFinished, primaryRepaired]);

  const freeCount = liveBerths.filter((b) => b.status === "FREE").length;
  const occupiedCount = liveBerths.filter((b) => b.status === "OCCUPIED").length;

  // Toggle Scenario 1
  const togglePortCongestion = () => {
    if (congestionScenarioActive) {
      resetSimulation();
      return;
    }
    // Close scenario 2 if active
    setDelayScenarioActive(false);

    setLiveBerths((prev) =>
      prev.map((b, idx) => ({
        ...b,
        status: "OCCUPIED",
        vessel: b.vessel || {
          name: `MV Quayside Carrier 0${idx + 1}`,
          category: b.category,
          cargo: "65,000 MT Bulk Cargo",
          carrier: "Coastal Fleet",
          progressPct: 50,
          draftM: 12.5,
          turnaroundHoursRemaining: 15.0,
          dischargeRate: 0.2
        }
      }))
    );

    setActiveTransit(null);
    setCongestedVessel({
      name: "MV Atlantic Pioneer",
      category: "Capesize",
      cargo: "165,000 MT Coal",
      draftM: 15.8,
      waitingHours: 24.0,
      demurragePerDay: 34000
    });
    setCongestionScenarioActive(true);
    setDiversionExecuted(false);
    toast.error("🚨 Scenario 1: All 5 berths full. Inbound Capesize waiting at fairway!");
  };

  // Authorize Diversion
  const handleAuthorizeDiversion = () => {
    setDiversionExecuted(true);
    toast.success("🧭 AIS Diversion Authorized: MV Atlantic Pioneer rerouted to Krishnapatnam Port ($34k Saved)!");
    setActiveTransit({
      type: "DIVERTING",
      vessel: congestedVessel || { name: "MV Atlantic Pioneer", category: "Capesize" },
      berthIndex: -1,
      progress: 0.0
    });
  };

  // Toggle Scenario 2
  const toggleVesselGlitch = () => {
    if (delayScenarioActive) {
      resetSimulation();
      return;
    }
    // Close scenario 1 if active
    setCongestionScenarioActive(false);

    // Free Berth B-02
    setLiveBerths((prev) => {
      const copy = [...prev];
      copy[1] = {
        ...copy[1],
        status: "FREE",
        vessel: null,
        nextAllocated: "RESERVED: MV Bengal Titan (TECHNICAL DELAY)",
        turnaroundHoursRemaining: 0
      };
      return copy;
    });

    setActiveTransit(null);
    setDelayScenarioActive(true);
    setSwapExecuted(false);
    setFeederFinished(false);
    setPrimaryRepaired(false);
    setPrimaryRepairHours(8.0);
    setFeederTurnaroundHours(4.5);
    toast.warning("⚡ Scenario 2: MV Bengal Titan has 8.0h breakdown. Berth B-02 idle risk!");
  };

  // Authorize Swap
  const handleAuthorizeSwap = () => {
    setSwapExecuted(true);
    setPrimaryRepaired(false);
    toast.success("✅ Dynamic Swap Authorized: Feeder MV Coastal Express docking at B-02 (Turnaround: 4.5h < 8.0h window)!");
    setLiveBerths((prev) => {
      const copy = [...prev];
      copy[1] = {
        ...copy[1],
        status: "OCCUPIED",
        vessel: {
          name: "MV Coastal Express (Swapped)",
          category: "Supramax",
          cargo: "28,000 MT Limestone",
          carrier: "Coastal Fleet",
          progressPct: 0,
          draftM: 10.0,
          turnaroundHoursRemaining: 4.5,
          dischargeRate: 0.55,
          operationType: "DISCHARGE"
        }
      };
      return copy;
    });
  };

  // =========================================================================
  // REALISTIC MULTI-DIRECTIONAL GEODESIC TRANSIT (DIRECT SHORTEST ROUTES)
  // In real ports, vessels do NOT all funnel down a single straight line.
  // Ships steam on their direct navigational heading across the open sea
  // to/from their specific assigned berth.
  // =========================================================================
  let transitX = 550;
  let transitY = 600;
  let transitAngle = 0;
  let transitShowTugs = false;

  if (activeTransit) {
    const p = activeTransit.progress;
    if (activeTransit.type === "INBOUND") {
      const targetX = liveBerths[activeTransit.berthIndex]?.x || 550;
      // Natural open sea point along direct shortest approach corridor:
      // Vessels targeting Western berths (B-01, B-02) approach from South-West;
      // vessels targeting Eastern berths (B-04, B-05) approach from South-East;
      // center berth (B-03) approaches from South.
      const seaEntryX = targetX + (targetX < 450 ? -80 : targetX > 650 ? 80 : 0);
      const seaEntryY = 620;
      const approachY = 285; // Point off the berth where tugs assist final berthing

      // Calculate the true direct navigation compass heading (0 = North)
      const dx = targetX - seaEntryX;
      const dy = approachY - seaEntryY;
      const cruiseHeading = Math.atan2(dx, -dy) * (180 / Math.PI);

      if (p < 0.70) {
        // Leg 1: Direct shortest straight ocean steam from open sea -> berth approach
        const t = p / 0.70;
        transitX = seaEntryX + t * (targetX - seaEntryX);
        transitY = seaEntryY + t * (approachY - seaEntryY);
        transitAngle = cruiseHeading;
        transitShowTugs = false;
      } else {
        // Leg 2: Tugs assist final berthing alongside quay wall at (targetX, 245)
        const t = (p - 0.70) / 0.30;
        transitX = targetX;
        transitY = approachY + t * (245 - approachY); // 285 -> 245
        // Smoothly rotate parallel to dock from approach cruise angle to 90 degrees
        transitAngle = cruiseHeading + t * (90 - cruiseHeading);
        transitShowTugs = true;
      }
    } else if (activeTransit.type === "OUTBOUND") {
      const fromX = liveBerths[activeTransit.berthIndex]?.x || 550;
      // Outbound vessels push off and steam on direct shortest heading toward their destination:
      // SW outbound (heading ~205°) for Western berths, SE outbound (heading ~155°) for Eastern berths, South (180°) for Center
      const seaExitX = fromX + (fromX < 450 ? -110 : fromX > 650 ? 110 : 0);
      const seaExitY = 620;
      const departureHeading = fromX < 450 ? 205 : fromX > 650 ? 155 : 180;

      if (p < 0.25) {
        // Leg 1: Tugs pull vessel off quay into clear water (fromX, 290) and swing onto departure heading
        const t = p / 0.25;
        transitX = fromX;
        transitY = 245 + t * 45;
        transitAngle = 90 + t * (departureHeading - 90);
        transitShowTugs = true;
      } else {
        // Leg 2: Direct shortest route steaming out to sea along departure heading
        const t = (p - 0.25) / 0.75;
        transitX = fromX + t * (seaExitX - fromX);
        transitY = 290 + t * (seaExitY - 290);
        transitAngle = departureHeading;
        transitShowTugs = false;
      }
    } else if (activeTransit.type === "DIVERTING") {
      // Diverting: direct geodesic heading across Bay of Bengal toward Krishnapatnam Port (SW heading 215°)
      transitX = 550 - p * 380;
      transitY = 520 + p * 100;
      transitAngle = 215;
      transitShowTugs = false;
    }
  }

  return (
    <div className="astra-card p-4 space-y-3 bg-white border border-slate-200 shadow-sm" data-testid="port-operations-simulator">
      {/* ========================================================================= */}
      {/* 1. CLEAN EXECUTIVE HEADER */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-900 text-white flex items-center justify-center font-black shadow-sm shrink-0">
            ⚓
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-900 tracking-tight" style={{ fontFamily: "Manrope" }}>
                {activePort.name}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                LIVE AIS
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-mono">
              Draft: <strong className="text-slate-700">{activePort.maxDraftM}m</strong> · Channel: <strong className="text-slate-700">{activePort.channelDepthM}m</strong> · Tide: <strong className="text-blue-700">{activePort.tideStatus}</strong>
            </p>
          </div>
        </div>

        {/* Port Selector Dropdown */}
        <div className="flex items-center gap-2 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-300 shadow-sm shrink-0">
          <MapPin size={13} className="text-blue-900" />
          <span className="text-xs font-mono font-bold text-slate-600">PORT:</span>
          <select
            id="port-selector"
            value={selectedPortId}
            onChange={(e) => setSelectedPortId(e.target.value)}
            className="bg-transparent text-xs font-mono font-black text-slate-900 focus:outline-none cursor-pointer"
          >
            {EAST_COAST_PORT_LIST.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.locode})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. COMPACT CONTROLS & SCENARIO BUTTONS ROW */}
      {/* ========================================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-slate-900 text-white px-3 py-2 rounded-lg font-mono text-xs shadow-inner">
        {/* Left: Playback & Speed */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1 rounded bg-blue-600 hover:bg-blue-500 text-white"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause size={12} /> : <Play size={12} />}
          </button>

          {[1, 2, 5, 10].map((s) => (
            <button
              key={s}
              onClick={() => setSimSpeed(s)}
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                simSpeed === s ? "bg-amber-400 text-slate-950" : "text-slate-300 hover:bg-white/10"
              }`}
            >
              {s}X
            </button>
          ))}

          <button
            onClick={resetSimulation}
            className="p-1 text-slate-400 hover:text-white"
            title="Reset Simulation"
          >
            <RotateCcw size={12} />
          </button>

          <span className="text-[11px] text-slate-400 ml-1">+{simTick}s</span>
        </div>

        {/* Right: Clean Scenario Trigger Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={togglePortCongestion}
            className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
              congestionScenarioActive
                ? "bg-rose-600 text-white shadow"
                : "bg-slate-800 text-rose-300 border border-slate-700 hover:bg-slate-700"
            }`}
          >
            🚨 Scenario 1: Port Congestion
          </button>

          <button
            onClick={toggleVesselGlitch}
            className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
              delayScenarioActive
                ? "bg-amber-600 text-white shadow"
                : "bg-slate-800 text-amber-300 border border-slate-700 hover:bg-slate-700"
            }`}
          >
            ⚡ Scenario 2: Smart Queue Swap
          </button>
        </div>
      </div>

      {/* Multimodal Live Vessel Arrival & Gate Clearance Banners */}
      {(vesselArrivedAtPort || waitingForTruckGateScan || (simProgress >= 75 && !gateCleared)) && (
        <div className="p-4 rounded-xl border border-amber-400 bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 text-white shadow-xl flex flex-wrap items-center justify-between gap-4 font-mono animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-400 text-amber-300 grid place-items-center text-xl shrink-0">
              🚢
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-mono">
                  LIVE MULTIMODAL VESSEL ARRIVAL
                </span>
                <span className="text-amber-300 font-bold text-xs">{requirement?.selectedVessel?.name || "MV Bengal Voyager"} berthed at B-01 ({activePort.name})</span>
              </div>
              <div className="text-xs text-slate-200 mt-1">
                Moored safely at <strong>Berth B-01 (Mechanized Import Quay)</strong>. Direct-discharge quay cranes on standby.
              </div>
              <div className="text-[11px] text-amber-300 mt-0.5">
                🛑 <strong>Discharge Blocked:</strong> Waiting for Road Fleet to scan PCS 1x Digital QR Gate Pass at Port In-Gate 01 before STS cranes can discharge coal into tipper trucks.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500 text-xs font-bold animate-pulse flex items-center gap-1.5">
              <Clock size={13} />
              <span>Waiting for Road Fleet In-Gate QR Scan</span>
            </span>
            <span className="px-2.5 py-1 rounded bg-slate-800 text-amber-300 border border-slate-700 text-[10px] font-bold">
              Cranes On Hold
            </span>
          </div>
        </div>
      )}

      {gateCleared && simProgress >= 75 && (
        <div className="p-3.5 rounded-xl border border-emerald-500/80 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white shadow-xl flex flex-wrap items-center justify-between gap-4 font-mono">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 grid place-items-center text-lg shrink-0">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-emerald-400 text-slate-950 font-mono">
                  GATE PASS CLEARED & TRUCK ADMITTED
                </span>
                <span className="text-emerald-300 font-bold text-xs">Berth B-01 STS Cranes Discharging</span>
              </div>
              <div className="text-xs text-slate-200 mt-0.5">
                Boom barrier raised. Truck OD-05-AX-4821 positioned under gantry. Direct discharge active ({Math.min(100, Math.max(15, Math.round(((simProgress - 75) / 10) * 100)))}% loaded).
              </div>
            </div>
          </div>
          <span className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 text-xs font-black shadow">
            STS CRANES DISCHARGING
          </span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SLEEK SCENARIO 1 ALERT CARD (MINIMAL, ZERO CLUTTER) */}
      {/* ========================================================================= */}
      {congestionScenarioActive && (
        <div className="bg-slate-900 text-white px-4 py-2.5 rounded-lg border border-rose-500/70 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <AlertOctagon size={16} className="text-rose-400 shrink-0" />
            <div>
              <span className="font-extrabold text-rose-300">All 5 Berths Occupied:</span>{" "}
              <span className="text-slate-200">Inbound MV Atlantic Pioneer waiting at anchorage ($34k/day demurrage).</span>
            </div>
          </div>
          <div>
            {!diversionExecuted ? (
              <button
                onClick={handleAuthorizeDiversion}
                className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 shadow"
              >
                <Navigation size={13} />
                <span>Suggest Diversion: Krishnapatnam Port (0h Wait)</span>
              </button>
            ) : (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle size={14} /> Diverted to Krishnapatnam Port ($34k Saved)
              </span>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SLEEK SCENARIO 2 ALERT CARD (MINIMAL, ZERO CLUTTER) */}
      {/* ========================================================================= */}
      {delayScenarioActive && (
        <div className="bg-slate-900 text-white px-4 py-2.5 rounded-lg border border-amber-500/70 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <Wrench size={16} className="text-amber-400 shrink-0" />
            <div>
              <span className="font-extrabold text-amber-300">MV Bengal Titan 8.0h Breakdown:</span>{" "}
              <span className="text-slate-200">
                {swapExecuted
                  ? feederFinished
                    ? primaryRepaired
                      ? "Breakdown resolved! MV Bengal Titan berthing at B-02."
                      : `Feeder departed. MV Bengal Titan repair in progress (${primaryRepairHours}h remaining)...`
                    : `Feeder turnaround active (${feederTurnaroundHours}h). Primary repair waiting (${primaryRepairHours}h).`
                  : "Feeder MV Coastal Express turnaround is 4.5h (< 8.0h wait). Zero berth idle time!"}
              </span>
            </div>
          </div>
          <div>
            {!swapExecuted ? (
              <button
                onClick={handleAuthorizeSwap}
                className="px-3 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-black flex items-center gap-1.5 shadow cursor-pointer"
              >
                <Sparkles size={13} />
                <span>Authorize Dynamic Queue Swap</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                  feederFinished 
                    ? "bg-slate-800 text-slate-400 border-slate-700" 
                    : "bg-emerald-950 text-emerald-300 border-emerald-500"
                }`}>
                  {feederFinished ? "Feeder: Completed (4.5h)" : `Feeder Turnaround: ${feederTurnaroundHours}h`}
                </span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                  primaryRepaired 
                    ? "bg-blue-950 text-blue-300 border-blue-500" 
                    : "bg-amber-950 text-amber-300 border-amber-500 animate-pulse"
                }`}>
                  {primaryRepaired ? "Primary: Repaired · Inbound" : `Primary Repair: ${primaryRepairHours}h`}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. REALISTIC SATELLITE MAP: CENTRAL FAIRWAY + TURNING BASIN + 5 BERTHS */}
      {/* ========================================================================= */}
      <div className="relative w-full rounded-xl overflow-hidden border border-slate-300 bg-[#041724] shadow-xl select-none">
        {/* Subtle Map Legend */}
        <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-3 font-mono text-[10px] bg-slate-950/85 backdrop-blur px-2.5 py-1 rounded-md border border-slate-700 text-slate-200">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded border border-emerald-400 bg-emerald-500/20" />
            <span>Free ({freeCount})</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded border border-blue-400 bg-blue-500/20" />
            <span>Working ({occupiedCount})</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
            <span>AIS Live</span>
          </div>
        </div>

        {/* Hover Tooltip */}
        {hoveredBerth && (
          <div className="absolute bottom-3 left-3 z-20 bg-slate-950/90 backdrop-blur text-white p-2.5 rounded-lg border border-slate-700 text-xs font-mono shadow-2xl pointer-events-none">
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.2 rounded bg-blue-600 font-bold text-[10px]">{hoveredBerth.code}</span>
              <strong className="text-slate-100">{hoveredBerth.name}</strong>
              <span className={`px-1.5 py-0.2 rounded text-[9px] font-black ${hoveredBerth.status === "FREE" ? "bg-emerald-600 text-white" : "bg-blue-600 text-white"}`}>
                {hoveredBerth.status === "FREE" ? "🟢 FREE" : "🟡 WORKING"}
              </span>
            </div>
            {hoveredBerth.status === "OCCUPIED" && hoveredBerth.vessel ? (
              <div className="text-[11px] text-slate-300 mt-1">
                <div>Moored: <strong className="text-amber-300">{hoveredBerth.vessel.name}</strong> ({hoveredBerth.vessel.category})</div>
                <div>Cargo: {hoveredBerth.vessel.cargo} · Draft: {hoveredBerth.vessel.draftM}m</div>
                <div className="text-emerald-300 font-bold">Progress: {hoveredBerth.vessel.progressPct}% · SLA: {hoveredBerth.vessel.turnaroundHoursRemaining}h left</div>
              </div>
            ) : (
              <div className="text-[11px] text-emerald-300 mt-0.5">
                Max Draft: <strong>{hoveredBerth.maxDraft}m</strong> · Depth Verified
              </div>
            )}
          </div>
        )}

        {/* SVG HARBOR VIEWBOX: 0 0 1100 620 */}
        <svg viewBox="0 0 1100 620" className="w-full h-auto block">
          <defs>
            <radialGradient id="deepOceanWaterGrad" cx="50%" cy="65%" r="85%">
              <stop offset="0%" stopColor="#0B3E56" />
              <stop offset="45%" stopColor="#072C3E" />
              <stop offset="75%" stopColor="#041B28" />
              <stop offset="100%" stopColor="#021019" />
            </radialGradient>

            <linearGradient id="beachSandGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#DFC399" />
              <stop offset="60%" stopColor="#C8A572" />
              <stop offset="100%" stopColor="#B38F5B" />
            </linearGradient>

            <linearGradient id="quaysideConcreteGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="70%" stopColor="#334155" />
              <stop offset="100%" stopColor="#1E293B" />
            </linearGradient>

            <filter id="emeraldBerthGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="aisDotGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* 1. DEEP OCEAN WATER */}
          <rect width="1100" height="620" fill="url(#deepOceanWaterGrad)" />

          {/* 2. BEACH SHORELINE (TOP: y = 0 to 52) */}
          <path
            d="M 0 52 Q 300 66 600 50 T 1100 44 L 1100 0 L 0 0 Z"
            fill="url(#beachSandGrad)"
          />
          <path
            d="M 0 53 Q 300 67 600 51 T 1100 45"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            opacity="0.8"
          />

          {/* 3. CONCRETE TERMINAL LANDMASS (y = 50 to y = 210) */}
          <polygon
            points="0,52 1100,44 1100,210 0,210"
            fill="url(#quaysideConcreteGrad)"
            stroke="#0F172A"
            strokeWidth="2"
          />

          {/* Subtle Container Stacks */}
          <g opacity="0.8">
            {[140, 200, 260, 320, 500, 560, 620, 780, 840, 900].map((cx) => (
              <rect key={cx} x={cx} y={75} width="46" height="22" rx="1" fill={cx % 120 === 0 ? "#0284C7" : cx % 80 === 0 ? "#D97706" : "#059669"} stroke="#0F172A" strokeWidth="0.6" />
            ))}
            {[160, 220, 280, 520, 580, 800, 860].map((cx) => (
              <rect key={cx} x={cx} y={102} width="44" height="20" rx="1" fill={cx % 100 === 0 ? "#DC2626" : "#475569"} stroke="#0F172A" strokeWidth="0.6" />
            ))}
            <line x1="0" y1="140" x2="1100" y2="140" stroke="#94A3B8" strokeWidth="1.2" strokeDasharray="4 3" />
            <line x1="0" y1="144" x2="1100" y2="144" stroke="#94A3B8" strokeWidth="1.2" strokeDasharray="4 3" />
          </g>

          {/* Yellow Hazard Line at Waterfront Quay Edge (y = 210) */}
          <line
            x1="0"
            y1="210"
            x2="1100"
            y2="210"
            stroke="#F59E0B"
            strokeWidth="2.5"
            strokeDasharray="10 5"
          />

          {/* Mooring Bollards along Quay Line */}
          {[100, 180, 270, 365, 455, 550, 645, 735, 825, 920, 1010].map((bx) => (
            <circle key={bx} cx={bx} cy={208} r="2.8" fill="#F8FAFC" stroke="#0F172A" strokeWidth="1.2" />
          ))}

          {/* 5 STS Rail Gantry Cranes (Clean, Over the 5 Berths with Active Cargo Handling) */}
          {[180, 365, 550, 735, 920].map((cx, cIdx) => {
            const berthAtCrane = liveBerths[cIdx];
            const isBerthActive = berthAtCrane && berthAtCrane.status === "OCCUPIED" && berthAtCrane.vessel;
            const containerPalette = ["#EF4444", "#3B82F6", "#10B981", "#F59E0B", "#6366F1"];
            const craneBoxColor = containerPalette[cIdx % containerPalette.length];

            return (
              <g key={cx} transform={`translate(${cx}, 200)`}>
                <line x1="-12" y1="0" x2="-16" y2="-26" stroke="#F59E0B" strokeWidth="2.5" />
                <line x1="12" y1="0" x2="16" y2="-26" stroke="#F59E0B" strokeWidth="2.5" />
                <line x1="-16" y1="-26" x2="16" y2="-26" stroke="#D97706" strokeWidth="3" />
                <rect x="-9" y="-34" width="18" height="10" fill="#D97706" rx="1.5" stroke="#78350F" strokeWidth="0.8" />
                {/* Clean Boom Arm extending over berth */}
                <line x1="0" y1="-30" x2="0" y2="26" stroke="#F59E0B" strokeWidth="2.5" />
                <rect x="-4" y="22" width="8" height="3.5" fill="#0F172A" rx="1" />
                {/* Active Multicolor Small Box Lifted on Spreader */}
                {isBerthActive && (
                  <rect
                    x="-3.5"
                    y="25.5"
                    width="7"
                    height="4"
                    rx="0.5"
                    fill={craneBoxColor}
                    stroke="#0F172A"
                    strokeWidth="0.4"
                  />
                )}
              </g>
            );
          })}

          {/* ========================================================================= */}
          {/* NATURAL OPEN-SEA NAVIGATION CONTOURS & MULTI-DIRECTIONAL FAIRWAYS */}
          {/* Vessels navigate freely along shortest direct routes across open water */}
          {/* ========================================================================= */}
          {/* Open Deepwater Harbor Bathymetry Contours */}
          <path
            d="M 40 430 Q 550 380 1060 430"
            fill="none"
            stroke="#0284C7"
            strokeWidth="1.2"
            strokeDasharray="8 6"
            opacity="0.3"
          />
          <text x="75" y="424" fill="#38BDF8" fontSize="8" fontFamily="monospace" opacity="0.45">
            CONTOUR: 18.0m DEEPWATER BASIN
          </text>

          <path
            d="M 30 530 Q 550 480 1070 530"
            fill="none"
            stroke="#0284C7"
            strokeWidth="1.2"
            strokeDasharray="10 8"
            opacity="0.22"
          />
          <text x="75" y="524" fill="#38BDF8" fontSize="8" fontFamily="monospace" opacity="0.4">
            CONTOUR: 20.0m OUTER ROADSTEAD
          </text>

          {/* Nautical Depth Soundings across the open water (ECDIS Style) */}
          {[
            { x: 180, y: 380, d: "17.4m" },
            { x: 365, y: 440, d: "18.2m" },
            { x: 550, y: 360, d: "18.8m" },
            { x: 735, y: 440, d: "18.1m" },
            { x: 920, y: 380, d: "17.6m" },
            { x: 340, y: 560, d: "20.4m" },
            { x: 760, y: 560, d: "20.2m" }
          ].map((snd, idx) => (
            <text
              key={`snd-${idx}`}
              x={snd.x}
              y={snd.y}
              fill="#38BDF8"
              fontSize="7.5"
              fontFamily="monospace"
              opacity="0.35"
              textAnchor="middle"
            >
              + {snd.d}
            </text>
          ))}

          {/* Multi-Directional Direct Shortest Approach Radials to each Berth */}
          {[
            { bx: 180, sx: 100, label: "SW APPROACH" },
            { bx: 365, sx: 285, label: "SSW APPROACH" },
            { bx: 550, sx: 550, label: "SOUTH APPROACH" },
            { bx: 735, sx: 815, label: "SSE APPROACH" },
            { bx: 920, sx: 1000, label: "SE APPROACH" }
          ].map((corridor, idx) => (
            <g key={`corridor-${idx}`} opacity="0.22">
              <line
                x1={corridor.sx}
                y1="615"
                x2={corridor.bx}
                y2="285"
                stroke="#38BDF8"
                strokeWidth="0.8"
                strokeDasharray="4 6"
              />
            </g>
          ))}

          {/* Outer Seaward Perimeter Buoys (Port & Starboard Outer Roadstead Beacons) */}
          {/* Western Outer Approach Beacon (Red) */}
          <g transform="translate(100, 580)">
            <rect x="-4" y="-5" width="8" height="9" fill="#EF4444" stroke="#FFFFFF" strokeWidth="0.6" />
            <circle cx="0" cy="-5" r="2" fill="#F87171" />
            <circle cx="0" cy="-5" r="6" fill="none" stroke="#F87171" strokeWidth="0.8" opacity="0.6">
              <animate attributeName="r" values="2;8;2" dur="2s" repeatCount="indefinite" />
            </circle>
            <text x="0" y="14" fill="#F87171" fontSize="7" fontFamily="monospace" textAnchor="middle" opacity="0.6">PORT BEACON</text>
          </g>

          {/* Center Safe Water Fairway Marker (Red/White Spherical) */}
          <g transform="translate(550, 595)">
            <circle cx="0" cy="0" r="5" fill="#EF4444" stroke="#FFFFFF" strokeWidth="1" />
            <line x1="-5" y1="0" x2="5" y2="0" stroke="#FFFFFF" strokeWidth="1.2" />
            <circle cx="0" cy="0" r="9" fill="none" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.5">
              <animate attributeName="r" values="4;10;4" dur="2s" repeatCount="indefinite" />
            </circle>
            <text x="0" y="14" fill="#E2E8F0" fontSize="7" fontFamily="monospace" textAnchor="middle" opacity="0.6">SAFE WATER</text>
          </g>

          {/* Eastern Outer Approach Beacon (Green) */}
          <g transform="translate(1000, 580)">
            <polygon points="0,-6 5,4 -5,4" fill="#10B981" stroke="#FFFFFF" strokeWidth="0.6" />
            <circle cx="0" cy="-6" r="2" fill="#34D399" />
            <circle cx="0" cy="-6" r="6" fill="none" stroke="#34D399" strokeWidth="0.8" opacity="0.6">
              <animate attributeName="r" values="2;8;2" dur="2s" repeatCount="indefinite" />
            </circle>
            <text x="0" y="14" fill="#34D399" fontSize="7" fontFamily="monospace" textAnchor="middle" opacity="0.6">STBD BEACON</text>
          </g>

          {/* Fairway Anchorage Ground (West: x = 160, y = 500) */}
          <g transform="translate(160, 500)">
            <circle cx="0" cy="0" r="26" fill="rgba(2, 132, 199, 0.06)" stroke="#0284C7" strokeWidth="0.8" strokeDasharray="3 3" />
            <text x="0" y="34" fill="#38BDF8" fontSize="8" fontFamily="monospace" textAnchor="middle" opacity="0.6">
              WEST ANCHORAGE
            </text>
          </g>

          {/* Coastal Anchorage Ground (East: x = 940, y = 500) */}
          <g transform="translate(940, 500)">
            <circle cx="0" cy="0" r="26" fill="rgba(2, 132, 199, 0.06)" stroke="#0284C7" strokeWidth="0.8" strokeDasharray="3 3" />
            <text x="0" y="34" fill="#38BDF8" fontSize="8" fontFamily="monospace" textAnchor="middle" opacity="0.6">
              EAST ANCHORAGE
            </text>
          </g>

          {/* Nautical Compass Rose (Bottom-Right corner) */}
          <g transform="translate(1040, 545)" opacity="0.35" pointerEvents="none">
            <circle cx="0" cy="0" r="18" fill="none" stroke="#38BDF8" strokeWidth="0.8" />
            <circle cx="0" cy="0" r="2" fill="#38BDF8" />
            <polygon points="0,-16 3,-3 0,0 -3,-3" fill="#EF4444" />
            <polygon points="0,16 3,3 0,0 -3,3" fill="#94A3B8" />
            <polygon points="16,0 3,3 0,0 3,-3" fill="#94A3B8" />
            <polygon points="-16,0 -3,3 0,0 -3,-3" fill="#94A3B8" />
            <text x="0" y="-19" fill="#EF4444" fontSize="7" fontWeight="bold" textAnchor="middle">N</text>
          </g>

          {/* ========================================================================= */}
          {/* 4. EXACTLY 5 PROMINENT, WELL-SPACED BERTHS (y = 245) */}
          {/* ========================================================================= */}
          {liveBerths.map((berth) => {
            const isFree = berth.status === "FREE";
            const isOccupied = berth.status === "OCCUPIED";
            const bw = 140;
            const bh = 56;
            const isContainer = berth.category === "Container" || berth.vessel?.category === "Container";
            const progress = berth.vessel?.progressPct || 0;

            return (
              <g
                key={berth.id}
                className="cursor-pointer"
                onClick={() => setSelectedBerth(berth)}
                onMouseEnter={() => setHoveredBerth(berth)}
                onMouseLeave={() => setHoveredBerth(null)}
              >
                {/* Berth Rectangle */}
                <rect
                  x={berth.x - bw / 2}
                  y={berth.y - bh / 2}
                  width={bw}
                  height={bh}
                  rx="4"
                  fill={isFree ? "rgba(16, 185, 129, 0.08)" : "rgba(2, 132, 199, 0.12)"}
                  stroke={isFree ? "#10B981" : "#0284C7"}
                  strokeWidth={isFree ? "2.2" : "1.8"}
                  strokeDasharray={isFree ? "5 2.5" : "none"}
                  filter={isFree ? "url(#emeraldBerthGlow)" : "none"}
                />

                {/* Rubber Fenders along Quay Line */}
                {[-35, 0, 35].map((fx) => (
                  <circle
                    key={fx}
                    cx={berth.x + fx}
                    cy={212}
                    r="3"
                    fill="#1E293B"
                    stroke="#475569"
                    strokeWidth="0.8"
                  />
                ))}

                {/* Mooring Lines */}
                {isOccupied && (
                  <g stroke="#E2E8F0" strokeWidth="0.8" opacity="0.6">
                    <line x1={berth.x - 40} y1={berth.y - 10} x2={berth.x - 40} y2={210} />
                    <line x1={berth.x + 40} y1={berth.y - 10} x2={berth.x + 40} y2={210} />
                  </g>
                )}

                {/* DOCKED VESSEL (DYNAMIC MULTICOLOR SMALL BOXES LOADING/UNLOADING IN REAL TIME) */}
                {isOccupied && berth.vessel && (
                  <CenteredShipGraphic
                    category={berth.vessel.category}
                    heading={90}
                    x={berth.x}
                    y={berth.y}
                    isMoving={false}
                    showTugs={false}
                    cargoProgress={progress}
                    operationType={berth.vessel.operationType || "DISCHARGE"}
                  />
                )}

                {/* QUAYSIDE APRON: MULTICOLOR SMALL BOX STAGING (SHIP <-> SHORE TRANSFER) */}
                {isOccupied && berth.vessel && (
                  <g transform={`translate(${berth.x - 24}, 173)`} pointerEvents="none">
                    <g>
                      {[0, 1, 2, 3, 4, 5, 6, 7].map((boxIdx) => {
                        const isExport = berth.vessel.operationType === "LOADING";
                        // If Export Loading: quayside boxes decrease as they are loaded onto the ship!
                        // If Import Unloading: quayside boxes increase as they are unloaded from the ship!
                        const isBoxOnQuay = isExport
                          ? boxIdx >= Math.round((progress / 100) * 8)
                          : boxIdx < Math.round((progress / 100) * 8);

                        const bx = (boxIdx % 4) * 12;
                        const by = Math.floor(boxIdx / 4) * 6;
                        const boxColors = ["#EF4444", "#3B82F6", "#10B981", "#F59E0B"];
                        return isBoxOnQuay ? (
                          <rect
                            key={`qbox-${boxIdx}`}
                            x={bx}
                            y={by}
                            width="10.5"
                            height="5"
                            rx="0.5"
                            fill={boxColors[boxIdx % boxColors.length]}
                            stroke="#0F172A"
                            strokeWidth="0.5"
                          />
                        ) : (
                          <rect
                            key={`qbox-${boxIdx}`}
                            x={bx}
                            y={by}
                            width="10.5"
                            height="5"
                            rx="0.5"
                            fill="none"
                            stroke="#475569"
                            strokeWidth="0.4"
                            strokeDasharray="1.5 1.5"
                            opacity="0.3"
                          />
                        );
                      })}
                    </g>
                  </g>
                )}

                {/* Dynamic Cargo Progress Bar inside berth */}
                {isOccupied && berth.vessel && (
                  <g transform={`translate(${berth.x - bw / 2 + 10}, ${berth.y + bh / 2 - 5})`}>
                    <rect x="0" y="0" width="120" height="3" rx="1.5" fill="#0F172A" />
                    <rect
                      x="0"
                      y="0"
                      width={(120 * progress) / 100}
                      height="3"
                      rx="1.5"
                      fill={berth.vessel.operationType === "LOADING" ? "#38BDF8" : "#F59E0B"}
                    />
                  </g>
                )}

                {/* DOWN SIDE OF VESSEL: BERTH NUMBER, STATUS & DISCHARGED / LOADED % (ZERO OVERLAP!) */}
                <g transform={`translate(${berth.x}, ${berth.y + bh / 2 + 13})`} pointerEvents="none">
                  <rect
                    x={-bw / 2}
                    y="-9"
                    width={bw}
                    height="15"
                    rx="3"
                    fill="#0B132B"
                    stroke={isFree ? "#10B981" : "#0284C7"}
                    strokeWidth="0.8"
                    opacity="0.95"
                  />
                  <text
                    x={-bw / 2 + 6}
                    y="1.5"
                    fill={isFree ? "#34D399" : "#38BDF8"}
                    fontSize="8.5"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {berth.code} {isFree ? "· FREE" : "· WORKING"}
                  </text>

                  {isOccupied && berth.vessel && (
                    <text
                      x={bw / 2 - 6}
                      y="1.5"
                      fill={berth.vessel.operationType === "LOADING" ? "#38BDF8" : "#F59E0B"}
                      fontSize="8"
                      fontFamily="monospace"
                      fontWeight="bold"
                      textAnchor="end"
                    >
                      {berth.vessel.operationType === "LOADING" ? `📦 ${progress}% LOADED` : `⚡ ${progress}% UNLOADED`}
                    </text>
                  )}
                </g>
              </g>
            );
          })}

          {/* ========================================================================= */}
          {/* 5. PHYSICAL TRANSIT SHIP: DIRECT SHORTEST-ROUTE STEAMING (NO DUPLICATES!) */}
          {/* ========================================================================= */}
          {activeTransit && (
            <g>
              <CenteredShipGraphic
                category={activeTransit.vessel.category || "Panamax"}
                heading={transitAngle}
                x={transitX}
                y={transitY}
                isMoving={true}
                showTugs={transitShowTugs}
                cargoProgress={activeTransit.type === "INBOUND" ? 0 : 100}
                operationType={activeTransit.vessel.operationType || "DISCHARGE"}
              />
              <text
                x={transitX}
                y={transitY + 24}
                fill="#FFFFFF"
                fontSize="8.5"
                fontFamily="monospace"
                fontWeight="bold"
                textAnchor="middle"
                style={{ textShadow: "0 1px 3px rgba(0,0,0,0.9)" }}
              >
                {activeTransit.vessel.name} ({activeTransit.type} · {activeTransit.type === "INBOUND" ? "WITH CARGO" : "UNLOADED"})
              </text>
            </g>
          )}

          {/* 6. WAITING VESSEL AT WEST ANCHORAGE */}
          {!activeTransit && anchoredQueue.length > 0 && !congestionScenarioActive && (
            <g transform="translate(160, 520)">
              <CenteredShipGraphic
                category={anchoredQueue[0].category || "Capesize"}
                heading={45}
                x={0}
                y={0}
                isMoving={false}
                showTugs={false}
              />
              <text
                x="0"
                y="26"
                fill="#38BDF8"
                fontSize="8"
                fontFamily="monospace"
                fontWeight="bold"
                textAnchor="middle"
                style={{ textShadow: "0 1px 3px rgba(0,0,0,0.9)" }}
              >
                {anchoredQueue[0].name} (ANCHORED)
              </text>
            </g>
          )}

          {/* Scenario 1: Capesize waiting in Fairway Entrance */}
          {congestionScenarioActive && congestedVessel && !diversionExecuted && (
            <g transform="translate(550, 520)">
              <CenteredShipGraphic
                category={congestedVessel.category}
                heading={0}
                x={0}
                y={0}
                isMoving={false}
                showTugs={false}
              />
              <text
                x="0"
                y="28"
                fill="#F87171"
                fontSize="8.5"
                fontFamily="monospace"
                fontWeight="bold"
                textAnchor="middle"
                style={{ textShadow: "0 1px 3px rgba(0,0,0,0.9)" }}
              >
                {congestedVessel.name} (0 BERTHS FREE)
              </text>
            </g>
          )}

          {/* Scenario 2: Primary Vessel Waiting / Repairing at Anchorage (Decoupled from Feeder) */}
          {delayScenarioActive && !primaryRepaired && (!activeTransit || activeTransit.vessel?.name !== "MV Bengal Titan") && (
            <g transform="translate(180, 520)">
              <CenteredShipGraphic
                category="Panamax"
                heading={50}
                x={0}
                y={0}
                isMoving={false}
                showTugs={false}
                cargoProgress={0}
                operationType="DISCHARGE"
              />
              <text
                x="0"
                y="26"
                fill="#FBBF24"
                fontSize="8"
                fontFamily="monospace"
                fontWeight="bold"
                textAnchor="middle"
                style={{ textShadow: "0 1px 3px rgba(0,0,0,0.9)" }}
              >
                MV Bengal Titan (WAIT/REPAIR: {primaryRepairHours}h)
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* ========================================================================= */}
      {/* 4. CLEAN 5-BERTH MATRIX CARDS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 font-mono text-xs">
        {liveBerths.map((b) => {
          const isFree = b.status === "FREE";
          return (
            <div
              key={b.id}
              onClick={() => setSelectedBerth(b)}
              className={`p-2.5 rounded-lg border transition-all cursor-pointer hover:shadow-md flex flex-col justify-between ${
                isFree 
                  ? "bg-emerald-50/60 border-emerald-300 hover:border-emerald-500" 
                  : "bg-slate-50 border-slate-300 hover:border-blue-900"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-900 text-xs">{b.code}</span>
                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-black ${isFree ? "bg-emerald-600 text-white" : "bg-blue-600 text-white"}`}>
                    {isFree ? "FREE" : "WORKING"}
                  </span>
                </div>

                <div className="text-[11px] font-bold text-slate-700 mt-1 truncate" title={b.name}>
                  {b.name}
                </div>
              </div>

              <div className="mt-2 pt-1.5 border-t border-slate-200/80">
                {isFree ? (
                  <div className="text-[10px] text-emerald-700 font-semibold truncate">
                    Ready · {b.maxDraft}m Draft
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="text-[10px] text-blue-900 font-bold truncate">
                      {b.vessel?.name}
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-500">
                      <span>Progress:</span>
                      <strong>{b.vessel?.progressPct}%</strong>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full transition-all duration-200" style={{ width: `${b.vessel?.progressPct}%` }} />
                    </div>
                    <div className="text-[9px] text-amber-700 font-bold">
                      SLA: {b.vessel?.turnaroundHoursRemaining}h left
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 5. BERTH INSPECTION MODAL */}
      {/* ========================================================================= */}
      {selectedBerth && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-300 w-full max-w-md overflow-hidden animate-in zoom-in-95 font-mono text-xs">
            <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-blue-600 font-black text-xs">
                  {selectedBerth.code}
                </span>
                <h4 className="font-extrabold text-base tracking-tight" style={{ fontFamily: "Manrope" }}>
                  {selectedBerth.name}
                </h4>
              </div>
              <button
                onClick={() => setSelectedBerth(null)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-500 text-[10px]">STATUS</span>
                  <div className="font-bold text-xs text-slate-900 mt-0.5">
                    {selectedBerth.status === "FREE" ? "🟢 FREE SLOT" : "🟡 WORKING"}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 text-[10px]">MAX DRAFT</span>
                  <div className="font-bold text-xs text-slate-900 mt-0.5">
                    {selectedBerth.maxDraft}m
                  </div>
                </div>
              </div>

              {selectedBerth.status === "OCCUPIED" && selectedBerth.vessel ? (
                <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-200 space-y-1.5">
                  <div className="flex justify-between items-center border-b border-blue-200 pb-1.5">
                    <strong className="text-xs text-blue-950">{selectedBerth.vessel.name}</strong>
                    <span className="px-1.5 py-0.2 rounded bg-blue-900 text-white text-[9px] font-bold">
                      {selectedBerth.vessel.category}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-700">Cargo: <strong>{selectedBerth.vessel.cargo}</strong></div>
                  <div className="text-[11px] text-slate-700">Carrier: <strong>{selectedBerth.vessel.carrier}</strong></div>
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Unloading:</span>
                      <strong>{selectedBerth.vessel.progressPct}%</strong>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full" style={{ width: `${selectedBerth.vessel.progressPct}%` }} />
                    </div>
                    <div className="text-[10px] text-amber-800 font-bold pt-0.5">
                      Turnaround SLA: {selectedBerth.vessel.turnaroundHoursRemaining} hours left
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-900">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 size={15} className="text-emerald-600" />
                    Berth Open for Inbound
                  </div>
                  <p className="text-[10px] text-emerald-800 mt-0.5">
                    Dredged channel depth verified at {activePort.channelDepthM}m. Mooring bollards on standby.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-end pt-1">
                <button
                  onClick={() => setSelectedBerth(null)}
                  className="px-3.5 py-1.5 rounded bg-slate-900 text-white font-bold hover:bg-slate-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
