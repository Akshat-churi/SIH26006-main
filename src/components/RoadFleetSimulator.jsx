import React, { useState, useEffect, useMemo } from "react";
import { useFlow } from "../lib/flow";
import { useAuth } from "../lib/auth";
import { toast } from "sonner";
import { 
  Truck, Navigation, ShieldCheck, CheckCircle2, AlertTriangle, 
  Clock, RefreshCw, Fuel, User, Gauge, MapPin, Building2, Anchor, 
  QrCode, Play, Pause, RotateCcw, Zap, Sparkles, Camera, Check, 
  X, ArrowRight, Eye, Radio, AlertOctagon, Layers, ArrowLeftRight,
  Sliders, Cpu, FileText, CheckSquare, Calendar, ChevronRight
} from "lucide-react";

// Corridors configuration
const CORRIDORS = {
  paradip_angul: {
    id: "COR-01",
    name: "Paradip Bulk Terminal ➔ NH-53 Heavy Corridor ➔ Angul Integrated Steel Complex",
    shortName: "Paradip ➔ Angul Steel",
    portName: "Paradip Port",
    portTerminal: "Bulk Quay #02 (MV Star Orient)",
    warehouseName: "Angul Integrated Steel Complex",
    warehouseCode: "WH-07",
    distanceKm: 82,
    transitTimeHrs: "2.8h",
    activeUnits: 52,
    cargoType: "Thermal & Coking Coal",
    defaultPayload: "40.0 MT"
  },
  vizag_pellet: {
    id: "COR-02",
    name: "Visakhapatnam Outer Harbor ➔ NH-16 Coastal Arterial ➔ Vizag Pellet Plant Depot",
    shortName: "Vizag ➔ Pellet Plant",
    portName: "Visakhapatnam Port",
    portTerminal: "Outer Harbor Ore Jetty",
    warehouseName: "Vizag Pellet Plant Depot",
    warehouseCode: "WH-02",
    distanceKm: 38,
    transitTimeHrs: "1.4h",
    activeUnits: 38,
    cargoType: "Iron Ore Fines",
    defaultPayload: "42.5 MT"
  },
  dhamra_kalinga: {
    id: "COR-03",
    name: "Dhamra Port Bulk Terminal ➔ State Industrial Arterial ➔ Kalinganagar ICD Hub",
    shortName: "Dhamra ➔ Kalinganagar",
    portName: "Dhamra Port",
    portTerminal: "Deepwater Jetty #01",
    warehouseName: "Kalinganagar Industrial ICD",
    warehouseCode: "WH-04",
    distanceKm: 64,
    transitTimeHrs: "2.1h",
    activeUnits: 44,
    cargoType: "Prime Coking Coal & Alumina",
    defaultPayload: "40.0 MT"
  }
};

// 6 Distinct Trucks representing different companies, models, liveries, and specific warehouse discharge points
const INITIAL_SIM_TRUCKS = [
  {
    id: "TRK-01",
    company: "Tata Steel Logistics",
    companyCode: "TATA",
    model: "Tata Signa 4825.TK Heavy Tipper",
    truckType: "TIPPER",
    cabColor: "#1E3A8A", // Deep Tata Royal Blue
    trailerColor: "#334155",
    cargoType: "Metallurgical Coking Coal",
    cargoVisual: "COAL",
    plate: "OD-05-AX-4821",
    driver: "Ramesh Kumar",
    // Lifecycle states:
    stage: "HIGHWAY_TO_WH", // "AT_PORT_GATE" | "ENTERING_PORT" | "BERTH_LOADING" | "EXITING_PORT" | "HIGHWAY_TO_WH" | "ENTERING_WH" | "WH_UNLOADING" | "EXITING_WH" | "HIGHWAY_TO_PORT"
    progress: 74,
    subProgress: 0,
    direction: "TO_WAREHOUSE",
    speedKmh: 52,
    cargoQuantityMt: 40.2,
    targetPayloadMt: 40.2,
    currentCargoPct: 100,
    loadingPct: 100,
    unloadingPct: 0,
    tareWeightMt: 14.2,
    grossWeightMt: 54.4,
    gatePassId: "GP-TATA-8801",
    assignedSlot: "14:00 - 14:30 HRS",
    etaWindow: "ON-TIME (14:12)",
    gateApprovalStatus: "APPROVED",
    gateHeldReason: null,
    fuelPct: 84,
    tpmsOk: true,
    designatedBay: "Rotary Tippler #01 (Coal Stockpile)",
    designatedBayPos: { x: 1045, y: 235 }
  },
  {
    id: "TRK-02",
    company: "Jindal Steel & Power (JSPL)",
    companyCode: "JSPL",
    model: "BharatBenz 4228R Multi-Axle",
    truckType: "TIPPER_HEAVY",
    cabColor: "#EA580C", // JSPL Flame Orange
    trailerColor: "#D97706",
    cargoType: "Thermal Coal (High GCV)",
    cargoVisual: "COAL",
    plate: "OD-05-AX-4822",
    driver: "Satish Jena",
    stage: "HIGHWAY_TO_WH",
    progress: 36,
    subProgress: 0,
    direction: "TO_WAREHOUSE",
    speedKmh: 48,
    cargoQuantityMt: 39.8,
    targetPayloadMt: 39.8,
    currentCargoPct: 100,
    loadingPct: 100,
    unloadingPct: 0,
    tareWeightMt: 14.1,
    grossWeightMt: 53.9,
    gatePassId: "GP-JSPL-8802",
    assignedSlot: "14:30 - 15:00 HRS",
    etaWindow: "ON-TIME (14:38)",
    gateApprovalStatus: "APPROVED",
    gateHeldReason: null,
    fuelPct: 76,
    tpmsOk: true,
    designatedBay: "Rotary Tippler #02 (Boiler Feed)",
    designatedBayPos: { x: 1045, y: 255 }
  },
  {
    id: "TRK-03",
    company: "JSW Steel Logistics",
    companyCode: "JSW",
    model: "Volvo FMX 460 Mining Tipper",
    truckType: "ORE_HAULER",
    cabColor: "#DC2626", // JSW Crimson Red
    trailerColor: "#991B1B",
    cargoType: "High-Grade Iron Ore Fines",
    cargoVisual: "IRON_ORE",
    plate: "OD-05-AX-4823",
    driver: "Manoj Pradhan",
    stage: "AT_PORT_GATE", // Stopped outside Port Gate 01 awaiting machine acceptance!
    progress: 95,
    subProgress: 0,
    direction: "TO_PORT",
    speedKmh: 0,
    cargoQuantityMt: 0,
    targetPayloadMt: 42.5,
    currentCargoPct: 0,
    loadingPct: 0,
    unloadingPct: 0,
    tareWeightMt: 14.2,
    grossWeightMt: 14.2,
    gatePassId: "GP-JSW-8803",
    assignedSlot: "14:45 - 15:15 HRS",
    etaWindow: "ON-TIME (Scheduled 14:50)",
    gateApprovalStatus: "PENDING_MACHINE_ACCEPTANCE",
    gateHeldReason: "Awaiting Port Gate 01 Automated ANPR & Slot Verification",
    fuelPct: 92,
    tpmsOk: true,
    designatedBay: "Blast Furnace Stock Bunker #01",
    designatedBayPos: { x: 1050, y: 370 }
  },
  {
    id: "TRK-04",
    company: "Vedanta Aluminium & Power",
    companyCode: "VEDANTA",
    model: "Ashok Leyland 4220 Tanker",
    truckType: "BULK_TANKER",
    cabColor: "#0D9488", // Vedanta Teal
    trailerColor: "#64748B",
    cargoType: "Calcined Alumina Powder",
    cargoVisual: "TANKER",
    plate: "OD-05-BX-9914",
    driver: "Pradeep Sahoo",
    stage: "AT_PORT_GATE",
    progress: 98,
    subProgress: 0,
    direction: "TO_PORT",
    speedKmh: 0,
    cargoQuantityMt: 0,
    targetPayloadMt: 35.0,
    currentCargoPct: 0,
    loadingPct: 0,
    unloadingPct: 0,
    tareWeightMt: 14.3,
    grossWeightMt: 14.3,
    gatePassId: "GP-VED-8804",
    assignedSlot: "15:15 - 15:45 HRS",
    etaWindow: "EARLY ARRIVAL (Slot 15:15)",
    gateApprovalStatus: "HELD_EARLY_ARRIVAL",
    gateHeldReason: "Arrived 25m early for slot. Staged in pre-gate buffer to prevent port congestion.",
    fuelPct: 68,
    tpmsOk: false,
    designatedBay: "Pneumatic Alumina Silo Bay",
    designatedBayPos: { x: 1040, y: 120 }
  },
  {
    id: "TRK-05",
    company: "Intermodal Container Express",
    companyCode: "CONCOR",
    model: "Scania G410 Flatbed Carrier",
    truckType: "CONTAINER_CARRIER",
    cabColor: "#2563EB", // Cobalt Blue
    trailerColor: "#1E293B",
    cargoType: "40ft ISO Marine Container",
    cargoVisual: "CONTAINER",
    plate: "OD-05-BX-9915",
    driver: "Kailash Nayak",
    stage: "WH_UNLOADING", // At Warehouse unloading container!
    progress: 100,
    subProgress: 0.5,
    direction: "TO_WAREHOUSE",
    speedKmh: 0,
    cargoQuantityMt: 14.2,
    targetPayloadMt: 28.5,
    currentCargoPct: 50,
    loadingPct: 100,
    unloadingPct: 50,
    tareWeightMt: 15.0,
    grossWeightMt: 29.2,
    gatePassId: "GP-CON-8805",
    assignedSlot: "13:30 - 14:00 HRS",
    etaWindow: "ON-TIME (13:35)",
    gateApprovalStatus: "APPROVED",
    gateHeldReason: null,
    fuelPct: 62,
    tpmsOk: true,
    designatedBay: "Container Freight Dock 02",
    designatedBayPos: { x: 1085, y: 120 }
  },
  {
    id: "TRK-06",
    company: "Tata Steel Logistics",
    companyCode: "TATA",
    model: "Tata Prima 4028.S Tipper",
    truckType: "TIPPER",
    cabColor: "#1E3A8A",
    trailerColor: "#334155",
    cargoType: "Metallurgical Coking Coal",
    cargoVisual: "COAL",
    plate: "OD-05-AX-3108",
    driver: "Deepak Mohanty",
    stage: "BERTH_LOADING", // Inside Port at Berth loading coal from the cargo ship!
    progress: 0,
    subProgress: 0.65,
    direction: "TO_WAREHOUSE",
    speedKmh: 0,
    cargoQuantityMt: 26.1,
    targetPayloadMt: 40.0,
    currentCargoPct: 65,
    loadingPct: 65,
    unloadingPct: 0,
    tareWeightMt: 14.1,
    grossWeightMt: 40.2,
    gatePassId: "GP-TATA-8806",
    assignedSlot: "14:15 - 14:45 HRS",
    etaWindow: "ON-TIME",
    gateApprovalStatus: "APPROVED",
    gateHeldReason: null,
    fuelPct: 88,
    tpmsOk: true,
    designatedBay: "Rotary Tippler #01 (Coal Stockpile)",
    designatedBayPos: { x: 1045, y: 235 }
  }
];

// Mathematical Cubic Bezier highway centerline
// Highway starts at Gate boundary (X = 230) and ends at Warehouse entry (X = 970)
const P0 = { x: 230, y: 260 };
const P1 = { x: 450, y: 220 };
const P2 = { x: 750, y: 300 };
const P3 = { x: 970, y: 260 };

function getBezierPointAndDerivative(t) {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const t2 = t * t;

  const x = mt2 * mt * P0.x + 3 * mt2 * t * P1.x + 3 * mt * t2 * P2.x + t2 * t * P3.x;
  const y = mt2 * mt * P0.y + 3 * mt2 * t * P1.y + 3 * mt * t2 * P2.y + t2 * t * P3.y;

  const dx = 3 * mt2 * (P1.x - P0.x) + 6 * mt * t * (P2.x - P1.x) + 3 * t2 * (P3.x - P2.x);
  const dy = 3 * mt2 * (P1.y - P0.y) + 6 * mt * t * (P2.y - P1.y) + 3 * t2 * (P3.y - P2.y);

  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;

  return { x, y, dx, dy, nx, ny };
}

export default function RoadFleetSimulator() {
  const { 
    addEvent, 
    requirement, 
    simProgress, 
    vesselArrivedAtPort, 
    waitingForTruckGateScan, 
    gateCleared, 
    scanGatePass 
  } = useFlow();

  const [selectedCorridorKey, setSelectedCorridorKey] = useState("paradip_angul");
  const activeCorridor = CORRIDORS[selectedCorridorKey] || CORRIDORS.paradip_angul;

  const [isPlaying, setIsPlaying] = useState(true);
  const [simSpeed, setSimSpeed] = useState(1);
  const [autoGateAdmission, setAutoGateAdmission] = useState(false); // Autonomous 24/7 port ops mode
  const [trucksState, setTrucksState] = useState(INITIAL_SIM_TRUCKS);
  const [selectedTruckId, setSelectedTruckId] = useState("TRK-03"); // TRK-03 at Port Gate by default

  // Interactive Gate Machine Acceptance State
  const [gateBoomOpen, setGateBoomOpen] = useState(false);
  const [gateScanning, setGateScanning] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);

  // Synchronize corridor and dedicated truck to active booked shipment
  useEffect(() => {
    if (requirement) {
      if (requirement.destinationPort === "Dhamra") {
        setSelectedCorridorKey("dhamra_kalinga");
      } else if (requirement.destinationPort === "Visakhapatnam") {
        setSelectedCorridorKey("vizag_pellet");
      } else {
        setSelectedCorridorKey("paradip_angul");
      }

      setTrucksState(prev => prev.map(t => {
        if (t.id === "TRK-03") {
          return {
            ...t,
            company: requirement.companyName || t.company,
            companyCode: requirement.companyCode || t.companyCode,
            cargoType: requirement.cargoType || t.cargoType,
            plate: "OD-05-AX-4821",
            gatePassId: "GP-TATA-8801",
            designatedBay: requirement.destinationWarehouse ? `${requirement.destinationWarehouse} Silos` : t.designatedBay
          };
        }
        return t;
      }));
    }
  }, [requirement]);

  // When gateCleared is triggered from server / other laptop, open boom barrier and admit truck
  useEffect(() => {
    if (gateCleared && !gateBoomOpen) {
      setGateBoomOpen(true);
      setTrucksState(prev => prev.map(t => {
        if (t.stage === "AT_PORT_GATE" || t.id === "TRK-03") {
          return {
            ...t,
            gateApprovalStatus: "APPROVED",
            gateHeldReason: null
          };
        }
        return t;
      }));
      const timer = setTimeout(() => {
        setGateBoomOpen(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [gateCleared]);

  const activeTruck = useMemo(() => {
    return trucksState.find(t => t.id === selectedTruckId) || trucksState[0];
  }, [trucksState, selectedTruckId]);

  // Smooth 60fps simulation timer (35ms ticks) with complete Port & Warehouse Physical Lifecycle
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setTrucksState(prev => prev.map(trk => {
        const copy = { ...trk };
        const stepDelta = 0.012 * simSpeed;

        switch (copy.stage) {
          // 1. STOPPED AT PORT GATE 01
          case "AT_PORT_GATE": {
            copy.speedKmh = 0;
            // If boom barrier is open and truck is approved, begin driving inside!
            if (copy.gateApprovalStatus === "APPROVED" && gateBoomOpen) {
              copy.stage = "ENTERING_PORT";
              copy.subProgress = 0;
              copy.speedKmh = 22;
            }
            break;
          }

          // 2. DRIVING PAST GATE 01 TO BERTH QUAY
          case "ENTERING_PORT": {
            copy.subProgress = (copy.subProgress || 0) + stepDelta;
            copy.speedKmh = 24;
            if (copy.subProgress >= 1) {
              copy.stage = "BERTH_LOADING";
              copy.subProgress = 0;
              copy.loadingPct = 0;
              copy.currentCargoPct = 0;
              copy.cargoQuantityMt = 0;
              copy.speedKmh = 0;
            }
            break;
          }

          // 3. AT BERTH: ACTIVE LOADING FROM MOORED VESSEL VIA STS CRANE
          case "BERTH_LOADING": {
            copy.speedKmh = 0;
            // Increment loading progress smoothly
            const newLoad = Math.min(100, (copy.loadingPct || 0) + 0.9 * simSpeed);
            copy.loadingPct = newLoad;
            copy.currentCargoPct = newLoad;
            copy.cargoQuantityMt = Number(((copy.targetPayloadMt * newLoad) / 100).toFixed(1));
            copy.grossWeightMt = Number((copy.tareWeightMt + copy.cargoQuantityMt).toFixed(1));

            if (newLoad >= 100) {
              copy.stage = "EXITING_PORT";
              copy.subProgress = 0;
              copy.speedKmh = 30;
            }
            break;
          }

          // 4. DEPARTING BERTH THROUGH OUT-GATE ONTO HIGHWAY
          case "EXITING_PORT": {
            copy.subProgress = (copy.subProgress || 0) + stepDelta;
            copy.speedKmh = 32;
            if (copy.subProgress >= 1) {
              copy.stage = "HIGHWAY_TO_WH";
              copy.progress = 0;
              copy.subProgress = 0;
              copy.direction = "TO_WAREHOUSE";
              copy.speedKmh = 50 + (copy.id === "TRK-01" ? 4 : copy.id === "TRK-02" ? -2 : 2);
            }
            break;
          }

          // 5. CRUISING ON TOP LANE OF HIGHWAY TOWARDS WAREHOUSE
          case "HIGHWAY_TO_WH": {
            const hwyDelta = (copy.speedKmh / 70) * 0.15 * simSpeed;
            copy.progress = (copy.progress || 0) + hwyDelta;
            if (copy.progress >= 100) {
              copy.stage = "ENTERING_WH";
              copy.progress = 100;
              copy.subProgress = 0;
              copy.speedKmh = 24;
            }
            break;
          }

          // 6. ENTERING WAREHOUSE COMPLEX TOWARDS DESIGNATED UNLOADING BAY
          case "ENTERING_WH": {
            copy.subProgress = (copy.subProgress || 0) + stepDelta;
            copy.speedKmh = 24;
            if (copy.subProgress >= 1) {
              copy.stage = "WH_UNLOADING";
              copy.subProgress = 0;
              copy.unloadingPct = 0;
              copy.speedKmh = 0;
            }
            break;
          }

          // 7. AT DESIGNATED BAY: ACTIVE CARGO UNLOADING / ROTARY DISCHARGE
          case "WH_UNLOADING": {
            copy.speedKmh = 0;
            const newUnload = Math.min(100, (copy.unloadingPct || 0) + 0.9 * simSpeed);
            copy.unloadingPct = newUnload;
            copy.currentCargoPct = Math.max(0, 100 - newUnload);
            copy.cargoQuantityMt = Number(((copy.targetPayloadMt * copy.currentCargoPct) / 100).toFixed(1));
            copy.grossWeightMt = Number((copy.tareWeightMt + copy.cargoQuantityMt).toFixed(1));

            if (newUnload >= 100) {
              copy.stage = "EXITING_WH";
              copy.subProgress = 0;
              copy.speedKmh = 30;
            }
            break;
          }

          // 8. DEPARTING WAREHOUSE BAY TOWARDS INBOUND HIGHWAY
          case "EXITING_WH": {
            copy.subProgress = (copy.subProgress || 0) + stepDelta;
            copy.speedKmh = 32;
            if (copy.subProgress >= 1) {
              copy.stage = "HIGHWAY_TO_PORT";
              copy.progress = 0;
              copy.subProgress = 0;
              copy.direction = "TO_PORT";
              copy.speedKmh = 56;
              copy.gateApprovalStatus = "IN_TRANSIT";
            }
            break;
          }

          // 9. CRUISING ON BOTTOM LANE OF HIGHWAY TOWARDS PORT GATE 01
          case "HIGHWAY_TO_PORT": {
            const hwyDelta = (copy.speedKmh / 70) * 0.15 * simSpeed;
            copy.progress = (copy.progress || 0) + hwyDelta;
            if (copy.progress >= 95) {
              // Reached Gate 01 stop line!
              copy.stage = "AT_PORT_GATE";
              copy.progress = 95;
              copy.speedKmh = 0;
              copy.gateApprovalStatus = copy.assignedSlot.includes("15:15") ? "HELD_EARLY_ARRIVAL" : "PENDING_MACHINE_ACCEPTANCE";
              copy.gateHeldReason = copy.assignedSlot.includes("15:15")
                ? "Arrived 25m early for slot. Staged in pre-gate buffer to prevent port congestion."
                : "Awaiting Port Gate 01 Automated ANPR & Slot Verification";
            }
            break;
          }

          default:
            break;
        }

        return copy;
      }));
    }, 35);

    return () => clearInterval(interval);
  }, [isPlaying, simSpeed, gateBoomOpen]);

  // Autonomous Gate Controller: If autoGateAdmission is ON and a truck is at gate, auto-process it
  useEffect(() => {
    if (!autoGateAdmission || gateScanning || gateBoomOpen) return;

    const truckAtGate = trucksState.find(t => t.stage === "AT_PORT_GATE" && t.gateApprovalStatus === "PENDING_MACHINE_ACCEPTANCE");
    if (truckAtGate) {
      handleMachineAcceptance(truckAtGate);
    }
  }, [autoGateAdmission, trucksState, gateScanning, gateBoomOpen]);

  // Operational KPI stats
  const stats = useMemo(() => {
    const total = trucksState.length;
    const moving = trucksState.filter(t => t.speedKmh > 0).length;
    const loadingAtPort = trucksState.filter(t => t.stage === "BERTH_LOADING" || t.stage === "ENTERING_PORT").length;
    const unloadingAtWh = trucksState.filter(t => t.stage === "WH_UNLOADING" || t.stage === "ENTERING_WH").length;
    const atGate = trucksState.filter(t => t.stage === "AT_PORT_GATE").length;
    const earlyHeld = trucksState.filter(t => t.gateApprovalStatus === "HELD_EARLY_ARRIVAL").length;

    return { total, moving, loadingAtPort, unloadingAtWh, atGate, earlyHeld };
  }, [trucksState]);

  // STRICT PORT GATE ACCEPTANCE ACTION
  const handleMachineAcceptance = (trk = activeTruck) => {
    setGateScanning(true);
    toast.info(`Machine scanning ANPR plate & verifying ETA slot for ${trk.company} (${trk.plate})...`, { duration: 1200 });

    setTimeout(() => {
      setGateScanning(false);
      setGateBoomOpen(true);

      setTrucksState(prev => prev.map(t => {
        if (t.id === trk.id) {
          return {
            ...t,
            gateApprovalStatus: "APPROVED",
            gateHeldReason: null
          };
        }
        return t;
      }));

      toast.success(`✅ PORT GATE ACCEPTED: Boom Barrier RAISED for ${trk.company} (${trk.plate})! Authorized to enter berth.`);

      // Sync with server and all other laptops
      if (scanGatePass) {
        scanGatePass(trk.plate, trk.gatePassId);
      }

      if (addEvent) {
        addEvent({
          id: `EV-GATE-${Date.now()}`,
          type: "PORT_GATE_CLEARED",
          severity: "SUCCESS",
          title: `Port In-Gate Cleared: ${trk.company} (${trk.plate})`,
          detail: `Machine verified appointment slot ${trk.assignedSlot}. Boom barrier raised at ${activeCorridor.portName} In-Gate. En route to ${activeCorridor.portTerminal}.`,
          roleRecipient: ["road_transporter", "company", "port_operator"]
        });
      }

      // Lower barrier after vehicle moves inside
      setTimeout(() => {
        setGateBoomOpen(false);
      }, 4000);
    }, 1100);
  };

  const handleHoldEarlyTruck = (trk = activeTruck) => {
    setTrucksState(prev => prev.map(t => {
      if (t.id === trk.id) {
        return {
          ...t,
          gateApprovalStatus: "HELD_EARLY_ARRIVAL",
          speedKmh: 0,
          gateHeldReason: "Held in pre-gate holding yard: Truck arrived earlier than assigned slot window. Prevents quay congestion."
        };
      }
      return t;
    }));
    toast.warning(`⏳ Staging Hold: ${trk.plate} held in buffer yard until slot ${trk.assignedSlot}.`);
  };

  // Mathematical Coordinate Mapping for Every Lifecycle Stage
  const getTruckTransform = (trk) => {
    const sub = trk.subProgress || 0;

    // 1. AT PORT GATE STOP LINE
    if (trk.stage === "AT_PORT_GATE") {
      // Offset slightly if multiple trucks are in line
      const offset = trk.id === "TRK-04" ? 32 : 0;
      return { x: 226 + offset, y: 275, angle: 180 };
    }

    // 2. ENTERING PORT: From Gate 01 (220, 275) to Berth Quay (140, 195)
    if (trk.stage === "ENTERING_PORT") {
      if (sub <= 0.5) {
        const p = sub / 0.5;
        return { x: 220 - p * 70, y: 275, angle: 180 };
      } else {
        const p = (sub - 0.5) / 0.5;
        return { x: 150 - p * 10, y: 275 - p * 80, angle: 180 + p * 90 };
      }
    }

    // 3. PARKED AT BERTH: Alongside Vessel & STS Crane
    if (trk.stage === "BERTH_LOADING") {
      return { x: 140, y: 195, angle: -90 };
    }

    // 4. EXITING PORT: From Berth (140, 195) through Out-Gate (210, 245) to Highway (230, 245)
    if (trk.stage === "EXITING_PORT") {
      if (sub <= 0.5) {
        const p = sub / 0.5;
        return { x: 140 + p * 30, y: 195 + p * 50, angle: -90 + p * 90 };
      } else {
        const p = (sub - 0.5) / 0.5;
        return { x: 170 + p * 60, y: 245, angle: 0 };
      }
    }

    // 5. HIGHWAY OUTBOUND TO WAREHOUSE
    if (trk.stage === "HIGHWAY_TO_WH") {
      const rawT = Math.min(1, Math.max(0, (trk.progress || 0) / 100));
      const { x, y, dx, dy, nx, ny } = getBezierPointAndDerivative(rawT);
      const posX = x + nx * -15;
      const posY = y + ny * -15;
      const headingDeg = (Math.atan2(dy, dx) * 180) / Math.PI;
      return { x: posX, y: posY, angle: headingDeg };
    }

    // 6. ENTERING WAREHOUSE COMPLEX: From Entrance (970, 245) to Designated Bay
    if (trk.stage === "ENTERING_WH") {
      const target = trk.designatedBayPos || { x: 1045, y: 235 };
      const curX = 970 + sub * (target.x - 970);
      const curY = 245 + sub * (target.y - 245);
      return { x: curX, y: curY, angle: 0 };
    }

    // 7. PARKED AT DESIGNATED WAREHOUSE UNLOADING BAY
    if (trk.stage === "WH_UNLOADING") {
      const target = trk.designatedBayPos || { x: 1045, y: 235 };
      return { x: target.x, y: target.y, angle: 0 };
    }

    // 8. EXITING WAREHOUSE COMPLEX: From Designated Bay to Highway Return (970, 275)
    if (trk.stage === "EXITING_WH") {
      const target = trk.designatedBayPos || { x: 1045, y: 235 };
      const curX = target.x - sub * (target.x - 970);
      const curY = target.y + sub * (275 - target.y);
      return { x: curX, y: curY, angle: 180 };
    }

    // 9. HIGHWAY INBOUND RETURN TO PORT GATE 01
    if (trk.stage === "HIGHWAY_TO_PORT") {
      const rawT = Math.min(1, Math.max(0, (trk.progress || 0) / 100));
      const { x, y, dx, dy, nx, ny } = getBezierPointAndDerivative(1 - rawT);
      const posX = x + nx * 15;
      const posY = y + ny * 15;
      const headingDeg = (Math.atan2(-dy, -dx) * 180) / Math.PI;
      return { x: posX, y: posY, angle: headingDeg };
    }

    return { x: 230, y: 275, angle: 180 };
  };

  return (
    <div className="space-y-6" data-testid="road-fleet-simulator">
      {/* 1. TOP HEADER & INTERACTIVE CONTROLS */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-blue-900 text-white uppercase font-mono tracking-wider flex items-center gap-1.5">
              <Truck size={12} />
              PORT GATE & PHYSICAL FREIGHT CORRIDOR RADAR
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              VESSEL LOADING ➔ HIGHWAY ➔ WAREHOUSE UNLOADING
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1" style={{ fontFamily: "Manrope" }}>
            Real-Time Port Gate, Vessel Loading & Warehouse Radar
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Strict machine gate verification: Trucks stop outside until scanned & accepted. Once admitted, trucks drive to the berth crane to load cargo from the ship, transport it to the warehouse bay to discharge, and return empty.
          </p>
        </div>

        {/* Corridor Buttons & Player Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Corridor Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-mono font-bold">
            {Object.keys(CORRIDORS).map(key => (
              <button
                key={key}
                onClick={() => setSelectedCorridorKey(key)}
                className={`px-3 py-1.5 rounded-lg transition-all ${selectedCorridorKey === key ? "bg-blue-900 text-white shadow-sm font-black" : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"}`}
              >
                {CORRIDORS[key].shortName}
              </button>
            ))}
          </div>

          {/* Autonomous Gate Admission Toggle */}
          <button
            onClick={() => setAutoGateAdmission(!autoGateAdmission)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm ${
              autoGateAdmission 
                ? "bg-emerald-600 text-white border-emerald-700 shadow-emerald-200" 
                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
            }`}
          >
            <Zap size={14} className={autoGateAdmission ? "text-amber-300 animate-bounce" : "text-slate-400"} />
            <span>Auto Gate Admission: {autoGateAdmission ? "ON" : "MANUAL"}</span>
          </button>

          {/* Simulation Controls */}
          <div className="flex items-center gap-1 bg-slate-900 text-white p-1 rounded-xl text-xs font-mono shadow">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-2.5 py-1.5 rounded-lg hover:bg-slate-800 flex items-center gap-1 font-bold text-amber-400"
            >
              {isPlaying ? <Pause size={13} /> : <Play size={13} />}
              <span>{isPlaying ? "Pause" : "Resume"}</span>
            </button>
            <button
              onClick={() => setSimSpeed(s => (s === 1 ? 2 : s === 2 ? 3 : 1))}
              className="px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-300 font-bold"
            >
              {simSpeed}x Speed
            </button>
            <button
              onClick={() => {
                setTrucksState(INITIAL_SIM_TRUCKS);
                toast.info("Simulation reset to initial state");
              }}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              title="Reset Simulator"
            >
              <RotateCcw size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Synchronized Multimodal Vessel Arrival & Gate Action Banner */}
      {(vesselArrivedAtPort || waitingForTruckGateScan || (simProgress >= 75 && !gateCleared)) && (
        <div className="p-4 rounded-2xl border-2 border-amber-500 bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 text-white shadow-xl flex flex-wrap items-center justify-between gap-4 font-mono animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 grid place-items-center text-2xl font-black shrink-0 shadow-lg">
              🚢
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-mono">
                  LIVE MULTIMODAL ARRIVAL · IN-GATE CLEARANCE REQUIRED
                </span>
                <span className="text-amber-300 font-bold text-xs">{requirement?.selectedVessel?.name || "MV Bengal Voyager"} berthed at {activeCorridor.portName}</span>
              </div>
              <div className="text-sm font-extrabold text-white mt-1">
                Vessel waiting at berth for Road Fleet. Scan PCS 1x Digital QR Gate Pass to begin vessel-to-truck discharge!
              </div>
              <div className="text-xs text-amber-200 mt-0.5">
                Truck <strong>{activeTruck.plate}</strong> ({activeTruck.company}) is stopped at Port Gate 01. Boom barrier will raise upon QR authorization.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => handleMachineAcceptance(activeTruck)}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer scale-105"
            >
              <QrCode size={16} />
              <span>⚡ Scan QR Gate Pass & Raise Barrier ➔</span>
            </button>
            <button
              onClick={() => setShowPassModal(true)}
              className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 font-bold text-xs border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Eye size={14} />
              <span>View Pass</span>
            </button>
          </div>
        </div>
      )}

      {gateCleared && simProgress >= 75 && (
        <div className="p-3.5 rounded-xl border border-emerald-500/80 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white shadow-xl flex flex-wrap items-center justify-between gap-4 font-mono">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 grid place-items-center text-lg font-black shrink-0">
              ✓
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-emerald-400 text-slate-950 font-mono">
                  PORT IN-GATE AUTHORIZED
                </span>
                <span className="text-emerald-300 font-bold text-xs">Vessel Unloading & Road Transit Active</span>
              </div>
              <div className="text-xs text-slate-200 mt-0.5">
                PCS 1x QR Pass verified. Road Fleet hauliers entering berth, loading coal, and departing for {activeCorridor.warehouseName}.
              </div>
            </div>
          </div>
          <span className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 text-xs font-black shadow">
            CORRIDOR DISCHARGE ACTIVE
          </span>
        </div>
      )}

      {/* 2. OPERATIONAL KPI METRICS STRIP */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 font-mono">
        <div className="p-3 rounded-xl border border-slate-200 bg-white shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-900 grid place-items-center shrink-0">
            <Truck size={18} />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-bold uppercase">Corridor Fleet</div>
            <div className="text-lg font-black text-slate-900">{stats.total} Units Active</div>
          </div>
        </div>

        <div className="p-3 rounded-xl border border-amber-300 bg-amber-50/80 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500 text-slate-950 grid place-items-center shrink-0 font-black">
            <Camera size={18} />
          </div>
          <div>
            <div className="text-[10px] text-amber-800 font-bold uppercase">At Gate 01 Weighbridge</div>
            <div className="text-lg font-black text-amber-950">{stats.atGate} Held Outside</div>
          </div>
        </div>

        <div className="p-3 rounded-xl border border-blue-200 bg-blue-50/80 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600 text-white grid place-items-center shrink-0 font-black">
            <Anchor size={18} />
          </div>
          <div>
            <div className="text-[10px] text-blue-800 font-bold uppercase">Port Vessel Loading</div>
            <div className="text-lg font-black text-blue-950">{stats.loadingAtPort} Units at Quay</div>
          </div>
        </div>

        <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/80 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white grid place-items-center shrink-0 font-black">
            <Building2 size={18} />
          </div>
          <div>
            <div className="text-[10px] text-emerald-800 font-bold uppercase">Warehouse Unloading</div>
            <div className="text-lg font-black text-emerald-950">{stats.unloadingAtWh} Units in Bay</div>
          </div>
        </div>

        <div className="p-3 rounded-xl border border-purple-200 bg-purple-50/50 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-900 grid place-items-center shrink-0">
            <Clock size={18} />
          </div>
          <div>
            <div className="text-[10px] text-purple-800 font-bold uppercase">Early Buffer Staged</div>
            <div className="text-lg font-black text-purple-950">{stats.earlyHeld} Units Buffer</div>
          </div>
        </div>
      </div>

      {/* 3. 2D VECTOR SIMULATION CANVAS */}
      <div className="astra-card p-4 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white shadow-2xl rounded-2xl border border-slate-800 space-y-3">
        {/* Radar Status Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-2.5 font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <strong className="text-amber-400 font-bold tracking-wide">{activeCorridor.name}</strong>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span className={`px-2.5 py-0.5 rounded font-bold ${gateBoomOpen ? "bg-emerald-950 text-emerald-300 border border-emerald-500" : "bg-amber-950 text-amber-300 border border-amber-500"}`}>
              {gateBoomOpen ? "🟢 GATE 01 BARRIER: OPEN (ADMISSION GRANTED)" : "🔴 GATE 01 BARRIER: DOWN (TRUCKS HELD OUTSIDE)"}
            </span>
          </div>
        </div>

        {/* 2D CANVAS CONTAINER */}
        <div className="relative w-full h-[520px] rounded-xl overflow-hidden shadow-inner border border-slate-800 select-none bg-[#0a1120]">
          <svg viewBox="0 0 1200 500" className="w-full h-full">
            <defs>
              <linearGradient id="oceanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#082f49" />
                <stop offset="80%" stopColor="#0369a1" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>

              <pattern id="roofRidges" width="6" height="6" patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2="6" y2="0" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
              </pattern>

              <pattern id="coalTexture" width="8" height="8" patternUnits="userSpaceOnUse">
                <rect width="8" height="8" fill="#18181b" />
                <circle cx="2" cy="2" r="1.5" fill="#27272a" />
                <circle cx="6" cy="5" r="1.8" fill="#09090b" />
              </pattern>

              <radialGradient id="truckBeam" cx="0%" cy="50%" r="70%">
                <stop offset="0%" stopColor="rgba(254, 240, 138, 0.7)" />
                <stop offset="70%" stopColor="rgba(254, 240, 138, 0.15)" />
                <stop offset="100%" stopColor="rgba(254, 240, 138, 0)" />
              </radialGradient>
            </defs>

            {/* Terrain Background */}
            <rect width="1200" height="500" fill="#0f172a" />
            
            {/* Topography belts */}
            <path d="M 210 0 Q 400 60 700 40 T 1000 20 L 1000 130 Q 650 140 400 110 T 210 130 Z" fill="#14532d" fillOpacity="0.25" />
            <path d="M 210 370 Q 500 350 750 380 T 1000 360 L 1000 500 L 210 500 Z" fill="#14532d" fillOpacity="0.2" />

            {/* Roadside Trees */}
            {[
              { x: 320, y: 160 }, { x: 340, y: 150 }, { x: 480, y: 155 }, { x: 510, y: 145 },
              { x: 720, y: 175 }, { x: 750, y: 165 }, { x: 860, y: 160 },
              { x: 330, y: 360 }, { x: 360, y: 375 }, { x: 540, y: 385 }, { x: 740, y: 395 }, { x: 880, y: 380 }
            ].map((t, idx) => (
              <g key={idx} transform={`translate(${t.x}, ${t.y})`}>
                <circle cx="0" cy="0" r="7" fill="#166534" fillOpacity="0.8" />
                <circle cx="2" cy="-2" r="5" fill="#22c55e" fillOpacity="0.6" />
              </g>
            ))}

            {/* ========================================================================= */}
            {/* 1. SEAPORT DOCK & BERTHED VESSEL (INSIDE PORT: X: 0 to 205)               */}
            {/* ========================================================================= */}
            {/* Ocean Basin */}
            <rect x="0" y="0" width="95" height="500" fill="url(#oceanGrad)" />
            <rect x="90" y="20" width="10" height="460" fill="#475569" stroke="#334155" />
            <line x1="90" y1="20" x2="90" y2="480" stroke="#f59e0b" strokeWidth="2" strokeDasharray="5 3" />

            {/* Moored Cargo Ship (MV Star Orient) */}
            <g transform="translate(45, 140)">
              <path d="M 20 -80 C 36 -50 38 -10 38 65 L 38 150 C 38 165 32 175 20 175 C 8 175 2 165 2 150 L 2 65 C 2 -10 4 -50 20 -80 Z" fill="#1e3a8a" stroke="#0f172a" strokeWidth="1.5" />
              <path d="M 20 -70 C 32 -40 34 -5 34 60 L 34 140 C 34 155 28 165 20 165 C 12 165 6 155 6 140 L 6 60 C 6 -5 8 -40 20 -70 Z" fill="#334155" />
              {[-30, 15, 60, 100].map((hy, hidx) => (
                <g key={hidx}>
                  <rect x="9" y={hy} width="22" height="30" rx="2" fill="#0f172a" stroke="#64748b" strokeWidth="0.8" />
                  <ellipse cx="20" cy={hy + 15} rx="8" ry="10" fill="url(#coalTexture)" />
                </g>
              ))}
              <rect x="8" y="140" width="24" height="20" rx="2" fill="#f8fafc" stroke="#94a3b8" />
              <circle cx="20" cy="150" r="3" fill="#e11d48" />
              <text x="20" y="-85" fill="#38bdf8" fontSize="6.5" fontFamily="monospace" textAnchor="middle" fontWeight="bold">MV STAR ORIENT</text>
            </g>

            {/* Quayside STS Gantry Crane loading cargo */}
            <g transform="translate(92, 185)">
              <line x1="-50" y1="0" x2="52" y2="0" stroke="#f59e0b" strokeWidth="3.5" />
              <line x1="-50" y1="0" x2="-20" y2="-16" stroke="#f59e0b" strokeWidth="1.5" />
              <line x1="52" y1="0" x2="25" y2="-16" stroke="#f59e0b" strokeWidth="1.5" />
              <line x1="-20" y1="-16" x2="25" y2="-16" stroke="#f59e0b" strokeWidth="2" />
              <rect x="2" y="-12" width="12" height="24" fill="#d97706" rx="2" />
              {/* Crane Trolley over Truck Loading Quay */}
              <rect x="44" y="-3" width="8" height="6" fill="#0f172a" stroke="#f59e0b" strokeWidth="0.8" />
              <line x1="48" y1="3" x2="48" y2="20" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="2 1" />
              {/* Grab bucket hovering over truck bed */}
              <path d="M 43 20 L 48 26 L 53 20 Z" fill="#b45309" stroke="#78350f" />
            </g>

            {/* Internal Port Loading Yard (X: 100 to 205) */}
            <rect x="100" y="20" width="105" height="460" fill="#1e293b" stroke="#334155" />

            {/* Quayside Truck Loading Berth Bay (Where Truck Parks at X: 140, Y: 195) */}
            <g transform="translate(118, 165)">
              <rect x="0" y="0" width="44" height="65" rx="3" fill="#0f172a" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 2" />
              <text x="22" y="12" fill="#fde047" fontSize="5.5" fontFamily="monospace" textAnchor="middle" fontWeight="bold">BERTH #02</text>
              <text x="22" y="22" fill="#38bdf8" fontSize="5" fontFamily="monospace" textAnchor="middle">CARGO HOIST</text>
            </g>

            {/* Port Silo Loading Hopper (X: 125, Y: 75) */}
            <g transform="translate(125, 65)">
              <rect x="0" y="0" width="45" height="45" rx="3" fill="#334155" stroke="#64748b" strokeWidth="1.2" />
              <ellipse cx="22" cy="0" rx="22" ry="6" fill="#475569" stroke="#64748b" />
              <text x="22" y="25" fill="#e2e8f0" fontSize="6.5" fontFamily="monospace" textAnchor="middle" fontWeight="bold">PORT SILO</text>
              <polygon points="4,45 41,45 26,58 19,58" fill="#1e293b" stroke="#64748b" />
              <rect x="19" y="58" width="7" height="6" fill="#f59e0b" />
            </g>

            {/* Port Internal Tarmac Lanes */}
            <rect x="100" y="228" width="110" height="64" fill="#0f172a" />
            {/* Lane from Berth down to Out-Gate */}
            <path d="M 140 195 L 140 245 L 210 245" fill="none" stroke="#334155" strokeWidth="24" strokeLinecap="round" />
            {/* Lane from In-Gate into Berth */}
            <path d="M 210 275 L 150 275 L 140 205" fill="none" stroke="#334155" strokeWidth="24" strokeLinecap="round" />
            <line x1="100" y1="260" x2="210" y2="260" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 4" />

            {/* ========================================================================= */}
            {/* 2. PORT SECURITY GATE 01 COMPLEX (X: 205 to 230) - CLEAN BUTT TERMINATION! */}
            {/* ========================================================================= */}
            {/* Security Perimeter Fence / Wall */}
            <line x1="210" y1="20" x2="210" y2="215" stroke="#94a3b8" strokeWidth="2.5" strokeDasharray="4 2" />
            <line x1="210" y1="305" x2="210" y2="480" stroke="#94a3b8" strokeWidth="2.5" strokeDasharray="4 2" />

            {/* Port Gatehouse Operator Booth */}
            <g transform="translate(205, 210)">
              <rect x="0" y="0" width="22" height="18" rx="2" fill="#0f172a" stroke="#f59e0b" strokeWidth="1.5" />
              <rect x="2" y="2" width="18" height="6" rx="1" fill="#38bdf8" opacity="0.85" />
              <text x="11" y="14" fill="#fde68a" fontSize="5.5" fontFamily="monospace" textAnchor="middle" fontWeight="bold">GATE 01</text>
            </g>

            {/* Inbound Gate (Bottom Lane, Y: 275) - WHERE TRUCKS MUST STOP! */}
            <g transform="translate(210, 275)">
              {/* Weighbridge Plate on Asphalt */}
              <rect x="10" y="-12" width="24" height="24" fill="#1e293b" stroke="#f59e0b" strokeWidth="1" strokeDasharray="2 1" />
              <text x="22" y="2" fill="#fde68a" fontSize="5.5" fontFamily="monospace" textAnchor="middle" fontWeight="bold">WEIGH</text>

              {/* Optical ANPR Camera Pole with Laser Scan Effect */}
              <g transform="translate(25, -20)">
                <line x1="0" y1="8" x2="0" y2="0" stroke="#cbd5e1" strokeWidth="2" />
                <rect x="-3" y="-5" width="8" height="6" rx="1" fill="#f59e0b" />
                <circle cx="3" cy="-2" r="2" fill={gateScanning ? "#ef4444" : "#10b981"} className="animate-pulse" />
                {gateScanning && (
                  <line x1="3" y1="0" x2="-15" y2="15" stroke="#f59e0b" strokeWidth="2" strokeDasharray="2 2" className="animate-pulse" />
                )}
              </g>

              {/* Physical Boom Barrier crossing the Inbound lane */}
              <circle cx="0" cy="-14" r="3.5" fill="#0f172a" stroke="#f59e0b" strokeWidth="1.2" />
              <g transform={gateBoomOpen ? "rotate(-75, 0, -14)" : "rotate(0, 0, -14)"} className="transition-transform duration-700">
                <line x1="0" y1="-14" x2="0" y2="14" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" />
                <line x1="0" y1="-12" x2="0" y2="-6" stroke="#dc2626" strokeWidth="3.5" />
                <line x1="0" y1="-2" x2="0" y2="4" stroke="#dc2626" strokeWidth="3.5" />
                <line x1="0" y1="8" x2="0" y2="12" stroke="#dc2626" strokeWidth="3.5" />
                <circle cx="0" cy="14" r="2" fill={gateBoomOpen ? "#10b981" : "#ef4444"} />
              </g>

              {/* Yellow Stop Bar on Asphalt */}
              <line x1="4" y1="-12" x2="4" y2="12" stroke="#facc15" strokeWidth="2" strokeDasharray="3 2" />
              <text x="-6" y="-18" fill="#f87171" fontSize="6" fontFamily="monospace" fontWeight="bold">STOP LINE</text>
            </g>

            {/* Outbound Gate (Top Lane, Y: 245) */}
            <g transform="translate(210, 245)">
              <line x1="0" y1="-12" x2="0" y2="12" stroke="#10b981" strokeWidth="2" strokeDasharray="2 1" />
              <text x="-12" y="-16" fill="#4ade80" fontSize="5.5" fontFamily="monospace">OUT-GATE</text>
            </g>

            {/* ========================================================================= */}
            {/* 3. 4-LANE ARTERIAL FREIGHT HIGHWAY (X: 230 to 970)                        */}
            {/* ========================================================================= */}
            {/* Tarmac starts CLEANLY at X: 230 with BUTT linecap (ZERO BULB OVERLAP!) */}
            <path
              d="M 230 260 C 450 220, 750 300, 970 260"
              fill="none"
              stroke="#1e293b"
              strokeWidth="64"
              strokeLinecap="butt"
            />

            {/* Highway White Outer Edge Lines */}
            <path d="M 230 228 C 450 188, 750 268, 970 228" fill="none" stroke="#64748b" strokeWidth="1.5" opacity="0.8" />
            <path d="M 230 292 C 450 252, 750 332, 970 292" fill="none" stroke="#64748b" strokeWidth="1.5" opacity="0.8" />

            {/* Center Median Divider (Yellow with reflectors) */}
            <path d="M 230 260 C 450 220, 750 300, 970 260" fill="none" stroke="#f59e0b" strokeWidth="2.5" />
            <path d="M 230 260 C 450 220, 750 300, 970 260" fill="none" stroke="#ffffff" strokeWidth="1" strokeDasharray="4 8" />

            {/* Dashed White Lane Dividers */}
            <path d="M 230 244 C 450 204, 750 284, 970 244" fill="none" stroke="#f8fafc" strokeWidth="1" strokeDasharray="14 12" opacity="0.35" />
            <path d="M 230 276 C 450 236, 750 316, 970 276" fill="none" stroke="#f8fafc" strokeWidth="1" strokeDasharray="14 12" opacity="0.35" />

            {/* Pavement Directional Arrows */}
            <g fill="#94a3b8" opacity="0.35">
              <polygon points="360,241 374,244 360,247 364,244" />
              <polygon points="720,257 734,260 720,263 724,260" />
              <polygon points="734,297 720,300 734,303 730,300" />
              <polygon points="374,277 360,280 374,283 370,280" />
            </g>

            {/* Roadside Distance Mileposts */}
            <g fill="#94a3b8" fontSize="7" fontFamily="monospace" opacity="0.7">
              <text x="380" y="218">KM 15 ➔</text>
              <text x="640" y="248">KM 42 ➔</text>
              <text x="860" y="242">KM 74 ➔</text>
            </g>

            {/* ========================================================================= */}
            {/* 4. INDUSTRIAL WAREHOUSE COMPLEX WITH SPECIFIC UNLOADING BAYS (X: 970-1200) */}
            {/* ========================================================================= */}
            <rect x="970" y="20" width="225" height="460" rx="8" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />

            {/* Main Warehouse Structure with Roll-up Bays (X: 995, Y: 45) */}
            <g transform="translate(995, 35)">
              <polygon points="0,30 85,10 170,30 170,55 85,35 0,55" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="1" />
              <polygon points="0,30 85,10 170,30 170,33 85,13 0,33" fill="url(#roofRidges)" />
              <rect x="0" y="55" width="170" height="55" fill="#0f172a" stroke="#334155" />
              <text x="85" y="70" fill="#38bdf8" fontSize="7" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                {activeCorridor.warehouseName.toUpperCase()}
              </text>
              <text x="85" y="80" fill="#94a3b8" fontSize="6" fontFamily="monospace" textAnchor="middle">
                RAW MATERIAL DEPOT ({activeCorridor.warehouseCode})
              </text>

              {/* Designated Warehouse Bays with specific company destinations */}
              <g transform="translate(10, 85)">
                {/* Bay 01: Alumina Silo Hopper (Vedanta) at (1040, 120) */}
                <g transform="translate(0, 0)">
                  <rect x="0" y="0" width="46" height="22" rx="2" fill="#0f172a" stroke="#0d9488" strokeWidth="1.2" />
                  <text x="23" y="11" fill="#2dd4bf" fontSize="5.5" fontFamily="monospace" textAnchor="middle" fontWeight="bold">BAY 01 SILO</text>
                  <text x="23" y="19" fill="#94a3b8" fontSize="4.5" fontFamily="monospace" textAnchor="middle">VEDANTA ALUMINA</text>
                </g>

                {/* Bay 02: Container Freight Yard (CONCOR) at (1085, 120) */}
                <g transform="translate(52, 0)">
                  <rect x="0" y="0" width="46" height="22" rx="2" fill="#0f172a" stroke="#2563eb" strokeWidth="1.2" />
                  <text x="23" y="11" fill="#60a5fa" fontSize="5.5" fontFamily="monospace" textAnchor="middle" fontWeight="bold">BAY 02 DOCK</text>
                  <text x="23" y="19" fill="#94a3b8" fontSize="4.5" fontFamily="monospace" textAnchor="middle">CONCOR ISO BOX</text>
                </g>

                {/* Bay 03: General Heavy Cargo */}
                <g transform="translate(104, 0)">
                  <rect x="0" y="0" width="46" height="22" rx="2" fill="#0f172a" stroke="#64748b" strokeWidth="1" />
                  <text x="23" y="11" fill="#cbd5e1" fontSize="5.5" fontFamily="monospace" textAnchor="middle" fontWeight="bold">BAY 03 DOCK</text>
                  <text x="23" y="19" fill="#94a3b8" fontSize="4.5" fontFamily="monospace" textAnchor="middle">BULK INBOUND</text>
                </g>
              </g>
            </g>

            {/* Rotary Truck Tippler Station (X: 995, Y: 185) - TATA & JSPL Coal Discharge Point */}
            <g transform="translate(995, 185)">
              <rect x="0" y="0" width="95" height="75" rx="3" fill="#0f172a" stroke="#eab308" strokeWidth="1.5" />
              <text x="47" y="15" fill="#facc15" fontSize="7" fontFamily="monospace" textAnchor="middle" fontWeight="bold">ROTARY TIPPLER #01</text>
              <text x="47" y="25" fill="#94a3b8" fontSize="5.5" fontFamily="monospace" textAnchor="middle">TATA & JSPL COAL DISCHARGE</text>
              {/* Unloading Grate Hopper */}
              <rect x="10" y="32" width="75" height="35" fill="#18181b" stroke="#71717a" strokeWidth="1" />
              {[18, 26, 34, 42, 50, 58, 66, 74].map((gx, gidx) => (
                <line key={gidx} x1={gx} y1="32" x2={gx} y2="67" stroke="#3f3f46" strokeWidth="1" />
              ))}
              {/* Active Tipping Indicator */}
              <circle cx="47" cy="50" r="10" fill="#f59e0b" fillOpacity="0.15" />
            </g>

            {/* Volumetric Coal Stockpile Mound (X: 1095, Y: 200) */}
            <g transform="translate(1095, 195)">
              <ellipse cx="40" cy="40" rx="36" ry="24" fill="#09090b" stroke="#27272a" />
              <ellipse cx="40" cy="38" rx="28" ry="18" fill="#18181b" />
              <ellipse cx="40" cy="36" rx="18" ry="12" fill="#27272a" />
              <ellipse cx="40" cy="34" rx="8" ry="6" fill="#3f3f46" />
              <text x="40" y="42" fill="#e2e8f0" fontSize="6.5" fontFamily="monospace" textAnchor="middle" fontWeight="bold">COAL STOCKPILE</text>
            </g>

            {/* Factory Blast Furnace Towers (X: 1005, Y: 330) - JSW Iron Ore Discharge Point */}
            <g transform="translate(1005, 330)">
              {/* Ore Bunker Discharge Pad (Where JSW TRK-03 parks at X: 1050, Y: 370) */}
              <rect x="35" y="30" width="55" height="32" rx="3" fill="#0f172a" stroke="#dc2626" strokeWidth="1.2" />
              <text x="62" y="44" fill="#f87171" fontSize="6" fontFamily="monospace" textAnchor="middle" fontWeight="bold">ORE BUNKER</text>
              <text x="62" y="54" fill="#94a3b8" fontSize="5" fontFamily="monospace" textAnchor="middle">JSW HEMATITE</text>

              {/* Blast Furnace Towers */}
              <rect x="0" y="25" width="30" height="95" fill="#334155" stroke="#64748b" />
              <polygon points="0,25 15,5 30,25" fill="#475569" stroke="#64748b" />
              <text x="15" y="75" fill="#f87171" fontSize="6" fontFamily="monospace" textAnchor="middle" fontWeight="bold">BLAST</text>
              <text x="15" y="86" fill="#f87171" fontSize="6" fontFamily="monospace" textAnchor="middle" fontWeight="bold">FURNACE</text>
              <rect x="95" y="40" width="18" height="80" rx="2" fill="#1e293b" stroke="#64748b" />
              <ellipse cx="104" cy="40" rx="9" ry="6" fill="#475569" />
              <rect x="120" y="10" width="10" height="110" fill="#1e293b" stroke="#64748b" />
              <ellipse cx="125" cy="5" rx="5" ry="2" fill="#ef4444" opacity="0.8" className="animate-pulse" />
            </g>

            {/* Internal Warehouse Tarmac Driveways */}
            <path d="M 970 245 C 1000 245, 1020 235, 1045 235" fill="none" stroke="#334155" strokeWidth="20" strokeLinecap="round" />
            <path d="M 970 245 C 1000 245, 1020 370, 1050 370" fill="none" stroke="#334155" strokeWidth="20" strokeLinecap="round" />
            <path d="M 970 245 C 1000 245, 1020 120, 1060 120" fill="none" stroke="#334155" strokeWidth="20" strokeLinecap="round" />

            {/* ========================================================================= */}
            {/* 5. MULTI-COMPANY TRUCK FLEET (DISTINCT DESIGNS, COLORED LIVERIES & SHAPES) */}
            {/* ========================================================================= */}
            {trucksState.map(trk => {
              const { x, y, angle } = getTruckTransform(trk);
              const isSelected = activeTruck?.id === trk.id;
              const isAtGate = trk.stage === "AT_PORT_GATE";
              const isLoadingAtBerth = trk.stage === "BERTH_LOADING";
              const isUnloadingAtWh = trk.stage === "WH_UNLOADING";
              const fillPct = trk.currentCargoPct || 0;

              return (
                <g key={trk.id}>
                  {/* TRUCK BODY (Rotated precisely along lane or bay heading) */}
                  <g
                    transform={`translate(${x}, ${y}) rotate(${angle})`}
                    className="cursor-pointer"
                    onClick={() => setSelectedTruckId(trk.id)}
                  >
                    {/* Selection Glow Ring */}
                    {isSelected && (
                      <circle cx="0" cy="0" r="28" fill="none" stroke="#38bdf8" strokeWidth="2.2" strokeDasharray="4 2" className="animate-pulse" />
                    )}

                    {/* Headlight Beams */}
                    {trk.speedKmh > 0 && (
                      <path d="M 18 -6 L 55 -18 L 55 18 L 18 6 Z" fill="url(#truckBeam)" opacity="0.85" />
                    )}

                    {/* Truck Ground Shadow */}
                    <rect x="-18" y="-9" width="36" height="18" rx="3" fill="#000000" fillOpacity="0.65" />

                    {/* 4 Tandem Axle Heavy Wheels */}
                    {[-15, -6, 4, 11].map((wx, widx) => (
                      <React.Fragment key={widx}>
                        <rect x={wx} y="-11" width="5" height="3" rx="0.8" fill="#09090b" />
                        <line x1={wx + 2.5} y1="-11" x2={wx + 2.5} y2="-8" stroke="#cbd5e1" strokeWidth="0.6" />
                        <rect x={wx} y="8" width="5" height="3" rx="0.8" fill="#09090b" />
                        <line x1={wx + 2.5} y1="8" x2={wx + 2.5} y2="11" stroke="#cbd5e1" strokeWidth="0.6" />
                      </React.Fragment>
                    ))}

                    {/* DISTINCT TRAILER & PAYLOAD DYNAMICS (FILLS & EMPTIES IN REAL-TIME!) */}
                    {/* 1. Coal Tipper (Tata Steel & JSPL) */}
                    {trk.cargoVisual === "COAL" && (
                      <g>
                        <rect x="-17" y="-7.5" width="22" height="15" rx="1.5" fill={trk.trailerColor} stroke="#78350f" strokeWidth="0.8" />
                        {fillPct > 0 ? (
                          <g opacity={Math.max(0.2, fillPct / 100)}>
                            <ellipse cx="-6" cy="0" rx={(8 * fillPct) / 100} ry={(5 * fillPct) / 100} fill="#09090b" />
                            <ellipse cx="-11" cy="0" rx={(4 * fillPct) / 100} ry={(4 * fillPct) / 100} fill="#18181b" />
                            <ellipse cx="-6" cy="-1.5" rx={(4 * fillPct) / 100} ry={(2.5 * fillPct) / 100} fill="#27272a" />
                          </g>
                        ) : (
                          /* Empty Bed Ribs */
                          <g opacity="0.4">
                            <line x1="-13" y1="-6" x2="-13" y2="6" stroke="#0f172a" strokeWidth="0.8" />
                            <line x1="-8" y1="-6" x2="-8" y2="6" stroke="#0f172a" strokeWidth="0.8" />
                            <line x1="-3" y1="-6" x2="-3" y2="6" stroke="#0f172a" strokeWidth="0.8" />
                          </g>
                        )}
                      </g>
                    )}

                    {/* 2. JSW Steel Mining Tipper (Iron Ore Hematite) */}
                    {trk.cargoVisual === "IRON_ORE" && (
                      <g>
                        <rect x="-17" y="-7.5" width="22" height="15" rx="1.5" fill="#7f1d1d" stroke="#450a0a" strokeWidth="0.8" />
                        {fillPct > 0 ? (
                          <g opacity={Math.max(0.2, fillPct / 100)}>
                            <ellipse cx="-6" cy="0" rx={(8.5 * fillPct) / 100} ry={(5.5 * fillPct) / 100} fill="#991b1b" />
                            <ellipse cx="-11" cy="0" rx={(4.5 * fillPct) / 100} ry={(4 * fillPct) / 100} fill="#b91c1c" />
                            <ellipse cx="-6" cy="-1.5" rx={(5 * fillPct) / 100} ry={(2.5 * fillPct) / 100} fill="#ef4444" opacity="0.6" />
                          </g>
                        ) : (
                          <g opacity="0.4">
                            <line x1="-13" y1="-6" x2="-13" y2="6" stroke="#450a0a" strokeWidth="0.8" />
                            <line x1="-8" y1="-6" x2="-8" y2="6" stroke="#450a0a" strokeWidth="0.8" />
                          </g>
                        )}
                      </g>
                    )}

                    {/* 3. Vedanta Bulk Alumina Tanker (Pneumatic Cylinder) */}
                    {trk.cargoVisual === "TANKER" && (
                      <g>
                        <rect x="-17" y="-7" width="22" height="14" rx="5" fill="#94a3b8" stroke="#475569" strokeWidth="0.8" />
                        <line x1="-15" y1="-2" x2="3" y2="-2" stroke="#f8fafc" strokeWidth="1" />
                        {/* Fill Level Dot */}
                        <circle cx="-12" cy="0" r="2.2" fill={fillPct > 0 ? "#0d9488" : "#475569"} />
                        <circle cx="-2" cy="0" r="2.2" fill={fillPct > 0 ? "#0d9488" : "#475569"} />
                        {fillPct > 0 && (
                          <rect x="-14" y="-1" width={(16 * fillPct) / 100} height="2" fill="#2dd4bf" rx="0.5" />
                        )}
                      </g>
                    )}

                    {/* 4. CONCOR ISO Marine Container (Corrugated Blue Box) */}
                    {trk.cargoVisual === "CONTAINER" && (
                      <g>
                        {/* Flatbed Trailer Base */}
                        <rect x="-17" y="-7.5" width="22" height="15" rx="1" fill="#1e293b" stroke="#0f172a" strokeWidth="0.8" />
                        {fillPct > 0 && (
                          <g opacity={Math.max(0.3, fillPct / 100)}>
                            <rect x="-17" y="-7" width="22" height="14" rx="1" fill="#0284c7" stroke="#0369a1" strokeWidth="0.8" />
                            <line x1="-13" y1="-7" x2="-13" y2="7" stroke="#38bdf8" strokeWidth="0.8" />
                            <line x1="-9" y1="-7" x2="-9" y2="7" stroke="#38bdf8" strokeWidth="0.8" />
                            <line x1="-5" y1="-7" x2="-5" y2="7" stroke="#38bdf8" strokeWidth="0.8" />
                            <line x1="-1" y1="-7" x2="-1" y2="7" stroke="#38bdf8" strokeWidth="0.8" />
                          </g>
                        )}
                      </g>
                    )}

                    {/* Truck Driver Cabin with Company Livery */}
                    <rect x="6" y="-7" width="10" height="14" rx="2" fill={trk.cabColor} stroke="#0f172a" strokeWidth="0.8" />
                    {/* Front Curved Windshield */}
                    <rect x="11" y="-5.5" width="4" height="11" rx="1" fill="#38bdf8" opacity="0.9" />
                    {/* Amber Side Mirrors */}
                    <rect x="9" y="-9" width="2" height="1.5" fill="#facc15" />
                    <rect x="9" y="7.5" width="2" height="1.5" fill="#facc15" />
                  </g>

                  {/* ALWAYS-UPRIGHT DYNAMIC STATUS BADGE (Counter-rotated, never flips upside-down!) */}
                  <g transform={`translate(${x}, ${y - 20})`} pointerEvents="none">
                    {/* If Loading at Berth: Show Glowing Vessel Loading Badge */}
                    {isLoadingAtBerth ? (
                      <g>
                        <rect x="-42" y="-9" width="84" height="18" rx="4" fill="#0c4a6e" stroke="#38bdf8" strokeWidth="1.2" />
                        <text x="0" y="-1" fill="#f0f9ff" fontSize="6.5" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                          ⚓ LOADING: {Math.round(trk.loadingPct || 0)}%
                        </text>
                        {/* Mini Progress Bar inside badge */}
                        <rect x="-36" y="2" width="72" height="3" rx="1.5" fill="#0369a1" />
                        <rect x="-36" y="2" width={(72 * (trk.loadingPct || 0)) / 100} height="3" rx="1.5" fill="#38bdf8" />
                      </g>
                    ) : isUnloadingAtWh ? (
                      /* If Unloading at Warehouse Bay: Show Discharge Badge */
                      <g>
                        <rect x="-42" y="-9" width="84" height="18" rx="4" fill="#064e3b" stroke="#34d399" strokeWidth="1.2" />
                        <text x="0" y="-1" fill="#ecfdf5" fontSize="6.5" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                          🏭 DISCHARGING: {Math.round(trk.unloadingPct || 0)}%
                        </text>
                        <rect x="-36" y="2" width="72" height="3" rx="1.5" fill="#047857" />
                        <rect x="-36" y="2" width={(72 * (trk.unloadingPct || 0)) / 100} height="3" rx="1.5" fill="#34d399" />
                      </g>
                    ) : (
                      /* Standard Road / Gate Status Badge */
                      <g>
                        <rect
                          x="-28"
                          y="-7"
                          width="56"
                          height="14"
                          rx="3"
                          fill={isAtGate ? "#7f1d1d" : "#0f172a"}
                          stroke={isAtGate ? "#ef4444" : isSelected ? "#38bdf8" : "#475569"}
                          strokeWidth="0.8"
                        />
                        <text x="0" y="2.5" fill="#ffffff" fontSize="6.5" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                          {isAtGate ? "🛑 GATE 01" : `${trk.companyCode} · ${trk.plate.split("-")[2]}`}
                        </text>
                      </g>
                    )}
                  </g>
                </g>
              );
            })}
          </svg>

          {/* Quick HUD Legend */}
          <div className="absolute top-3 left-3 bg-slate-900/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-slate-700/80 font-mono text-[11px] shadow-lg flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-blue-300">
              <Anchor size={13} className="text-blue-400" />
              {activeCorridor.portName} (Vessel Berth)
            </span>
            <span className="text-slate-500">➔</span>
            <span className="flex items-center gap-1.5 text-amber-300">
              <Camera size={13} className="text-amber-400" />
              Gate 01 Weighbridge
            </span>
            <span className="text-slate-500">➔</span>
            <span className="flex items-center gap-1.5 text-emerald-300">
              <Building2 size={13} className="text-emerald-400" />
              {activeCorridor.warehouseCode} (Rotary Tippler & Silos)
            </span>
          </div>
        </div>
      </div>

      {/* 4. DEDICATED PORT IN-GATE ACCEPTANCE & APPOINTMENT CONSOLE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Machine Gate Acceptance Terminal */}
        <div className="lg:col-span-2 space-y-4">
          <div className="astra-card p-5 bg-white border border-slate-200 shadow-sm rounded-2xl space-y-4 font-mono text-xs">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 grid place-items-center font-black shadow-sm">
                  <Camera size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-extrabold text-slate-900" style={{ fontFamily: "Manrope" }}>
                      Gate 01 Automated ANPR & Slot Acceptance Terminal
                    </h2>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                      STRICT ACCESS CONTROL
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-sans">
                    Trucks must be verified by machine and accepted before entering port. Prevents queue choke, berth congestion, and quay demurrage.
                  </p>
                </div>
              </div>

              {/* Truck Selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 text-[11px]">Inspect Truck:</span>
                {trucksState.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTruckId(t.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${activeTruck?.id === t.id ? "bg-blue-900 text-white shadow-sm" : "bg-slate-100 hover:bg-slate-200 text-slate-700"}`}
                  >
                    {t.companyCode}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Gate Verification & Appointment Check Box */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Optical ANPR Scanner Box */}
              <div className="p-4 rounded-xl bg-slate-950 text-white space-y-3 relative overflow-hidden border border-slate-800">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    ANPR OCR READOUT
                  </span>
                  <span className="text-slate-400 text-[10px]">{activeTruck?.company}</span>
                </div>

                {/* HSRP License Plate */}
                <div className="p-3 bg-amber-400 text-slate-950 rounded-lg text-center border-4 border-slate-900 shadow-md">
                  <div className="flex items-center justify-between px-2 text-[9px] font-black text-slate-800">
                    <span>IND</span>
                    <span>{activeTruck?.companyCode} LOGISTICS</span>
                  </div>
                  <div className="text-2xl font-black tracking-widest my-0.5">{activeTruck?.plate}</div>
                  <div className="text-[9px] font-bold text-slate-800">{activeTruck?.model}</div>
                </div>

                {/* Machine Gate Status */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Gate Access Status:</span>
                  <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                    activeTruck?.gateApprovalStatus === "APPROVED" 
                      ? "bg-emerald-950 text-emerald-300 border border-emerald-500" 
                      : activeTruck?.gateApprovalStatus === "HELD_EARLY_ARRIVAL"
                        ? "bg-purple-950 text-purple-300 border border-purple-500"
                        : "bg-amber-950 text-amber-300 border border-amber-500"
                  }`}>
                    {activeTruck?.gateApprovalStatus === "APPROVED" ? "✓ CLEARED TO ENTER PORT" : "⏳ STOPPED OUTSIDE BARRIER"}
                  </span>
                </div>
              </div>

              {/* Scheduled Appointment Slot & Congestion Control Card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-700 font-bold flex items-center gap-1.5">
                    <Calendar size={14} className="text-blue-900" />
                    TRUCK APPOINTMENT SYSTEM (TAS)
                  </span>
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 text-[10px] font-bold">
                    PORT IN-GATE SLOT
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">Allocated Slot Window:</span>
                    <strong className="text-slate-900">{activeTruck?.assignedSlot}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">ETA Status:</span>
                    <strong className="text-emerald-700">{activeTruck?.etaWindow}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">Gross Weight:</span>
                    <strong className="text-slate-900">{activeTruck?.grossWeightMt} MT (Tare: {activeTruck?.tareWeightMt} MT)</strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Designated Bay:</span>
                    <strong className="text-blue-700">{activeTruck?.designatedBay}</strong>
                  </div>
                </div>

                {activeTruck?.gateHeldReason && (
                  <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900">
                    <strong>Hold Notice:</strong> {activeTruck.gateHeldReason}
                  </div>
                )}
              </div>
            </div>

            {/* Machine Acceptance Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200">
              <button
                onClick={() => setShowPassModal(true)}
                className="px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
              >
                <QrCode size={15} className="text-blue-900" />
                <span>View PCS 1x Digital Gate Pass</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleHoldEarlyTruck(activeTruck)}
                  className="px-4 py-2.5 rounded-xl bg-purple-50 border border-purple-300 hover:bg-purple-100 text-purple-900 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Clock size={14} />
                  <span>Hold in Buffer Yard</span>
                </button>

                <button
                  onClick={() => handleMachineAcceptance(activeTruck)}
                  disabled={gateScanning || activeTruck?.gateApprovalStatus === "APPROVED"}
                  className={`px-5 py-2.5 rounded-xl text-white font-black text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer ${
                    activeTruck?.gateApprovalStatus === "APPROVED" 
                      ? "bg-slate-400 cursor-not-allowed" 
                      : "bg-emerald-600 hover:bg-emerald-700"
                  }`}
                >
                  <Check size={16} />
                  <span>{gateScanning ? "Scanning Machine..." : activeTruck?.gateApprovalStatus === "APPROVED" ? "✓ Barrier Open (Admitted)" : "Machine Accept & Raise Barrier ➔"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Active Vehicle, Cargo Lifecycle & Live Telemetry */}
        <div className="space-y-4">
          <div className="astra-card p-5 bg-white border border-slate-200 shadow-sm rounded-2xl space-y-3.5 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <span className="font-extrabold text-sm text-slate-900 flex items-center gap-2" style={{ fontFamily: "Manrope" }}>
                <User size={16} className="text-blue-900" />
                Live Mission Telemetry
              </span>
              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 text-[10px] font-bold">
                {activeTruck?.gatePassId}
              </span>
            </div>

            {/* Current Lifecycle Stage Banner */}
            <div className="p-3 rounded-xl bg-slate-900 text-white space-y-2 border border-slate-800">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Current Phase:</span>
                <span className="text-amber-400 font-bold uppercase">{activeTruck?.stage.replace(/_/g, " ")}</span>
              </div>
              <div className="text-sm font-bold text-slate-100 flex items-center gap-2">
                {activeTruck?.stage === "BERTH_LOADING" && (
                  <>
                    <Anchor size={15} className="text-blue-400 animate-spin" />
                    <span>Loading Cargo from MV Star Orient ({activeTruck?.cargoQuantityMt} MT)</span>
                  </>
                )}
                {activeTruck?.stage === "WH_UNLOADING" && (
                  <>
                    <Building2 size={15} className="text-emerald-400 animate-pulse" />
                    <span>Discharging Cargo at {activeTruck?.designatedBay}</span>
                  </>
                )}
                {activeTruck?.stage === "AT_PORT_GATE" && (
                  <>
                    <Camera size={15} className="text-amber-400 animate-pulse" />
                    <span>Stopped Outside Port Gate 01 (Weighbridge)</span>
                  </>
                )}
                {activeTruck?.stage.includes("HIGHWAY") && (
                  <>
                    <Truck size={15} className="text-emerald-400" />
                    <span>Transit on Highway ({activeTruck?.speedKmh} km/h)</span>
                  </>
                )}
                {(activeTruck?.stage === "ENTERING_PORT" || activeTruck?.stage === "EXITING_PORT" || activeTruck?.stage === "ENTERING_WH" || activeTruck?.stage === "EXITING_WH") && (
                  <>
                    <Navigation size={15} className="text-blue-400 animate-bounce" />
                    <span>Maneuvering in Terminal ({activeTruck?.speedKmh} km/h)</span>
                  </>
                )}
              </div>

              {/* Live Payload Meter */}
              <div className="pt-2 border-t border-slate-800 space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-400">Payload Fill:</span>
                  <span className="text-emerald-400 font-bold">{activeTruck?.cargoQuantityMt} MT / {activeTruck?.targetPayloadMt} MT ({Math.round(activeTruck?.currentCargoPct || 0)}%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 via-amber-400 to-emerald-400 transition-all duration-300"
                    style={{ width: `${activeTruck?.currentCargoPct || 0}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Company & Vehicle Specs */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-xl text-white grid place-items-center font-bold text-sm shadow-sm shrink-0"
                style={{ backgroundColor: activeTruck?.cabColor }}
              >
                {activeTruck?.companyCode.slice(0, 4)}
              </div>
              <div>
                <div className="font-extrabold text-slate-900 text-sm">{activeTruck?.company}</div>
                <div className="text-[11px] text-slate-500">{activeTruck?.model}</div>
                <div className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 mt-0.5">
                  <CheckCircle2 size={12} /> Driver: {activeTruck?.driver}
                </div>
              </div>
            </div>

            {/* Telemetry Specs */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Cargo Type:</span>
                <strong className="text-slate-900">{activeTruck?.cargoType}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Assigned Slot:</span>
                <strong className="text-blue-700">{activeTruck?.assignedSlot}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Current Speed:</span>
                <strong className="text-slate-900">{activeTruck?.speedKmh} km/h</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Diesel Fuel Level:</span>
                <strong className="text-emerald-700 flex items-center gap-1">
                  <Fuel size={12} /> {activeTruck?.fuelPct}% Full
                </strong>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Gate Status:</span>
                <strong className={activeTruck?.gateApprovalStatus === "APPROVED" ? "text-emerald-700" : "text-amber-600"}>
                  {activeTruck?.gateApprovalStatus}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. DIGITAL PCS 1X GATE PASS MODAL */}
      {showPassModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="astra-card bg-white rounded-2xl max-w-md w-full border border-slate-300 shadow-2xl p-6 font-mono space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <QrCode size={20} className="text-blue-900" />
                <span className="font-extrabold text-base text-slate-900" style={{ fontFamily: "Manrope" }}>
                  Digital PCS 1x Gate Pass
                </span>
              </div>
              <button onClick={() => setShowPassModal(false)} className="p-1 rounded-md text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
              <div className="w-28 h-28 mx-auto bg-white p-2 rounded-lg border border-slate-300 shadow-inner grid place-items-center">
                <svg viewBox="0 0 100 100" width="90" height="90">
                  <rect width="100" height="100" fill="#FFFFFF" />
                  <rect x="10" y="10" width="25" height="25" fill="#0F172A" />
                  <rect x="15" y="15" width="15" height="15" fill="#FFFFFF" />
                  <rect x="18" y="18" width="9" height="9" fill="#0F172A" />
                  <rect x="65" y="10" width="25" height="25" fill="#0F172A" />
                  <rect x="70" y="15" width="15" height="15" fill="#FFFFFF" />
                  <rect x="73" y="18" width="9" height="9" fill="#0F172A" />
                  <rect x="10" y="65" width="25" height="25" fill="#0F172A" />
                  <rect x="15" y="70" width="15" height="15" fill="#FFFFFF" />
                  <rect x="18" y="73" width="9" height="9" fill="#0F172A" />
                  <rect x="42" y="15" width="14" height="20" fill="#0F172A" />
                  <rect x="42" y="45" width="22" height="12" fill="#0F172A" />
                  <rect x="68" y="65" width="20" height="22" fill="#0F172A" />
                  <rect x="45" y="75" width="15" height="12" fill="#0F172A" />
                </svg>
              </div>
              <div className="font-extrabold text-slate-900 text-sm">{activeTruck?.gatePassId}</div>
              <div className="text-[11px] text-slate-500">Port Community System Verified · Slot: {activeTruck?.assignedSlot}</div>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Company:</span>
                <strong className="text-slate-900">{activeTruck?.company}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Registration Plate:</span>
                <strong className="text-slate-900">{activeTruck?.plate}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Scheduled Slot:</span>
                <strong className="text-blue-700">{activeTruck?.assignedSlot}</strong>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Cargo:</span>
                <strong className="text-slate-900">{activeTruck?.cargoType}</strong>
              </div>
            </div>

            <button
              onClick={() => {
                handleMachineAcceptance(activeTruck);
                setShowPassModal(false);
              }}
              disabled={gateScanning || activeTruck?.gateApprovalStatus === "APPROVED"}
              className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${
                activeTruck?.gateApprovalStatus === "APPROVED"
                  ? "bg-slate-300 text-slate-600 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
            >
              <QrCode size={15} />
              <span>{activeTruck?.gateApprovalStatus === "APPROVED" ? "✓ Already Authorized at Gate" : "Scan & Authorize at Port Gate 01 ➔"}</span>
            </button>

            <button
              onClick={() => setShowPassModal(false)}
              className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
            >
              Close Pass
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
