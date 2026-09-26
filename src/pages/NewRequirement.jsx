import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Badge from "../components/Badge";
import TopDownVesselIcon, { TopDownTruckSvg } from "../components/VesselIcons";
import { useFlow } from "../lib/flow";
import { useAuth } from "../lib/auth";
import { 
  ResponsiveContainer, ComposedChart, Line, Area, BarChart, Bar, XAxis, YAxis, 
  Tooltip, Legend, CartesianGrid, Cell, ReferenceLine 
} from "recharts";
import { 
  Ship, TrendingUp, Anchor, CheckCircle2, ArrowRight, ArrowLeft, 
  Sparkles, ShieldCheck, HeartPulse, Truck, Factory, MapPin, 
  Award, Clock, DollarSign, FileCheck, Layers, AlertTriangle, Calendar, Sliders, Info,
  BarChart3, LineChart as LineIcon, PieChart as PieIcon, Cpu
} from "lucide-react";
import { toast } from "sonner";

// 12 Major East Coast of India Deepwater & Major Ports
const EAST_COAST_DESTINATIONS = [
  { port: "Paradip", state: "Odisha", maxDraft: 14.5, maxLoa: 260, maxBeam: 40, plant: "Angul Integrated Steel Complex", waitHours: 12, congestion: "Low" },
  { port: "Visakhapatnam", state: "Andhra Pradesh", maxDraft: 16.5, maxLoa: 280, maxBeam: 45, plant: "Vizag Steel & Energy Plant", waitHours: 16, congestion: "Medium" },
  { port: "Haldia", state: "West Bengal", maxDraft: 9.0, maxLoa: 200, maxBeam: 32, plant: "Durgapur Steel Hub", waitHours: 32, congestion: "High" },
  { port: "Krishnapatnam", state: "Andhra Pradesh", maxDraft: 18.0, maxLoa: 320, maxBeam: 50, plant: "Ballari Metal Siding", waitHours: 4, congestion: "Low" },
  { port: "Chennai", state: "Tamil Nadu", maxDraft: 14.0, maxLoa: 250, maxBeam: 38, plant: "Sri City Manufacturing Zone", waitHours: 20, congestion: "Medium" },
  { port: "Dhamra", state: "Odisha", maxDraft: 18.0, maxLoa: 320, maxBeam: 48, plant: "Kalinganagar Industrial Hub", waitHours: 10, congestion: "Low" },
  { port: "Gangavaram", state: "Andhra Pradesh", maxDraft: 18.5, maxLoa: 330, maxBeam: 52, plant: "Raipur Sponge Iron Complex", waitHours: 14, congestion: "Medium" },
  { port: "Ennore (Kamarajar)", state: "Tamil Nadu", maxDraft: 15.0, maxLoa: 270, maxBeam: 42, plant: "North Chennai Thermal Station", waitHours: 18, congestion: "Medium" },
  { port: "Kakinada", state: "Andhra Pradesh", maxDraft: 12.5, maxLoa: 230, maxBeam: 36, plant: "Rajahmundry Industrial Belt", waitHours: 22, congestion: "High" },
  { port: "Tuticorin (V.O.C)", state: "Tamil Nadu", maxDraft: 14.0, maxLoa: 240, maxBeam: 38, plant: "Madurai Logistics Park", waitHours: 12, congestion: "Low" },
  { port: "Gopalpur", state: "Odisha", maxDraft: 13.5, maxLoa: 225, maxBeam: 34, plant: "Tata Steel SEZ Gopalpur", waitHours: 8, congestion: "Low" },
  { port: "Kolkata (SMP)", state: "West Bengal", maxDraft: 8.5, maxLoa: 190, maxBeam: 30, plant: "Howrah Heavy Foundry", waitHours: 36, congestion: "High" },
];

const ORIGIN_OPTIONS = [
  { port: "Newcastle", country: "Australia", warehouse: "Hunter Valley Coal Mine Siding, NSW", distNm: 5080 },
  { port: "Taboneo", country: "Indonesia", warehouse: "South Kalimantan Open-Cast Siding", distNm: 2280 },
  { port: "Richards Bay", country: "South Africa", warehouse: "Mpumalanga Coal Terminal Siding", distNm: 4680 },
  { port: "Singapore", country: "Singapore", warehouse: "Jurong Island Transshipment Yard", distNm: 1540 },
  { port: "Port Hedland", country: "Australia", warehouse: "Pilbara Iron Siding, WA", distNm: 3650 },
];

// Exact Physical Specifications for all 4 Vessel Categories (DWT, Beam, LOA, Draft)
const VESSEL_SPECS = {
  Handysize: {
    dwt: 35000,
    avgPayload: 35000,
    beam: 28.0,
    loa: 180,
    draft: 10.0,
    speedKnots: 13.0,
    desc: "15k–39k DWT · Max Beam 28m · Max LOA 180m · Draft 10m",
    ratePerTon: 22.50,
    demurrage: 950
  },
  Supramax: {
    dwt: 58000,
    avgPayload: 55000,
    beam: 32.2,
    loa: 200,
    draft: 12.5,
    speedKnots: 14.0,
    desc: "40k–65k DWT · Max Beam 32.2m · Max LOA 200m · Draft 12.5m",
    ratePerTon: 18.40,
    demurrage: 1100
  },
  Panamax: {
    dwt: 74000,
    avgPayload: 70000,
    beam: 32.2,
    loa: 225,
    draft: 13.8,
    speedKnots: 14.2,
    desc: "65k–85k DWT · Max Beam 32.2m · Max LOA 225m · Draft 13.8m",
    ratePerTon: 16.90,
    demurrage: 1200
  },
  Capesize: {
    dwt: 180000,
    avgPayload: 160000,
    beam: 45.0,
    loa: 300,
    draft: 18.2,
    speedKnots: 14.5,
    desc: "100k–200k+ DWT · Max Beam 45m · Max LOA 300m · Draft 18.2m",
    ratePerTon: 11.40,
    demurrage: 1800
  }
};

export default function NewRequirement() {
  const nav = useNavigate();
  const { user } = useAuth();
  const { setRequirement, setSelectedVessel, setIsPlaying, setSimProgress, setSimActive, addEvent } = useFlow();

  const [step, setStep] = useState(1);

  // Form State: Parameters in Step 1
  const [cargoType, setCargoType] = useState("Thermal Coal");
  const [preferredVesselCategory, setPreferredVesselCategory] = useState("Panamax");
  const [cargoQuantity, setCargoQuantity] = useState(70000);
  const [originPort, setOriginPort] = useState("Newcastle");
  const [destPort, setDestPort] = useState("Paradip");
  
  // Delivery & Contract Structure Parameters
  const todayStr = new Date().toISOString().split("T")[0];
  const [contractDuration, setContractDuration] = useState("1 voyage (Spot)");
  const [requiredArrivalDate, setRequiredArrivalDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split("T")[0];
  });
  const [expectedVoyages, setExpectedVoyages] = useState(1);

  const handleArrivalDateChange = (val) => {
    if (val < todayStr) {
      setRequiredArrivalDate(todayStr);
      toast.warning("Arrival date cannot be in the past. Automatically set to current date.");
    } else {
      setRequiredArrivalDate(val);
    }
  };

  // Strategy Preferences
  const [budgetPreference, setBudgetPreference] = useState("Balanced");
  const [riskTolerance, setRiskTolerance] = useState("Low (Avoid high-wait berths)");

  // AI Vessel Class Prediction Result (minimal state)
  const [aiPredictionResult, setAiPredictionResult] = useState(null);

  // AI Vessel Optimization Engine: Evaluates Sections 2 (Commodity, Qty, Ports) & 3 (Laycan, SLA, Contract)
  const handleAiVesselPredict = () => {
    const portInfo = EAST_COAST_DESTINATIONS.find(d => d.port === destPort) || EAST_COAST_DESTINATIONS[0];
    const originInfo = ORIGIN_OPTIONS.find(o => o.port === originPort) || ORIGIN_OPTIONS[0];
    const qty = Math.max(1000, Number(cargoQuantity) || 70000);
    const isSpot = contractDuration === "1 voyage (Spot)";
    const voyages = isSpot ? 1 : Math.max(1, expectedVoyages);
    const parcelSize = Math.round(qty / voyages);

    const portDraft = portInfo.maxDraft;
    const portLoa = portInfo.maxLoa;
    const distNm = originInfo.distNm || 5000;

    let chosenCategory = "Panamax";
    let rationale = "";

    // 1. HARD PHYSICAL BERTH & CHANNEL CONSTRAINTS
    if (portDraft < 10.5 || portLoa < 205) {
      // Shallow riverine ports (Kolkata 8.5m, Haldia 9.0m)
      chosenCategory = "Handysize";
      if (parcelSize > 40000) {
        rationale = `Handysize selected: ${portInfo.port}'s shallow ${portDraft}m draft restricts Supramax/Panamax (12.5m/13.8m); parcel must be split into ~35k MT loads to avoid grounding.`;
      } else {
        rationale = `Handysize (35k MT payload) selected: Matches ${qty.toLocaleString()} MT parcel and safely navigates ${portInfo.port}'s shallow ${portDraft}m river draft.`;
      }
    } else if (portDraft < 13.8 || portLoa < 235) {
      // Intermediate draft ports (Kakinada 12.5m, Gopalpur 13.5m)
      if (parcelSize <= 38000) {
        chosenCategory = "Handysize";
        rationale = `Handysize (35k MT) selected: Perfectly sized for ${parcelSize.toLocaleString()} MT without deadfreight, safely clearing ${portInfo.port}'s ${portDraft}m draft.`;
      } else {
        chosenCategory = "Supramax";
        rationale = `Supramax (55k MT payload) selected: Maximum allowable class for ${portInfo.port}'s ${portDraft}m draft; Panamax (13.8m) exceeds draft limits.`;
      }
    } else if (portDraft >= 17.5 && portLoa >= 300 && (parcelSize >= 95000 || (!isSpot && qty >= 250000 && parcelSize >= 85000))) {
      // Deepwater terminals (Dhamra 18m, Gangavaram 18.5m, Krishnapatnam 18m)
      chosenCategory = "Capesize";
      rationale = `Capesize (160k MT payload) selected: Deepwater ${portInfo.port} (${portDraft}m draft) easily berths 18.2m Capesize, unlocking scale economics at $11.40/t for ${parcelSize.toLocaleString()} MT.`;
    } else if (portDraft < 17.5 && parcelSize > 85000) {
      // High volume parcel, but port cannot berth Capesize (18.2m draft)
      chosenCategory = "Panamax";
      rationale = `Panamax selected: Capesize (18.2m draft) cannot berth at ${portInfo.port} (${portDraft}m limit); Panamax (74k MT) is the maximum permissible class (split into sequential voyages).`;
    } else {
      // Standard East Coast ports (Paradip 14.5m, Ennore 15m, Vizag 16.5m, Chennai 14m, Tuticorin 14m)
      if (parcelSize <= 40000) {
        chosenCategory = "Handysize";
        rationale = `Handysize (35k MT payload) selected: Exactly fits ${parcelSize.toLocaleString()} MT parcel, preventing deadfreight on underfilled holds.`;
      } else if (parcelSize <= 62000) {
        chosenCategory = "Supramax";
        rationale = `Supramax (55k MT payload) selected: Optimal capacity utilization for ${parcelSize.toLocaleString()} MT at ${portInfo.port} (${portDraft}m draft).`;
      } else {
        chosenCategory = "Panamax";
        rationale = `Panamax (70k MT payload) selected: Highest freight efficiency ($16.90/t) for ${parcelSize.toLocaleString()} MT, safely clearing ${portInfo.port}'s ${portDraft}m draft.`;
      }
    }

    // 2. SLA & TRANSIT TIME FEASIBILITY CHECK
    const vesselSpeed = VESSEL_SPECS[chosenCategory].speedKnots || 14.0;
    const transitDays = Math.ceil(distNm / (vesselSpeed * 24)) + 1; // +1 day clearance/pilotage
    const today = new Date(todayStr);
    const laycan = new Date(requiredArrivalDate);
    const daysAvailable = Math.max(0, Math.round((laycan.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

    if (daysAvailable < transitDays) {
      rationale += ` • ⚠️ Laycan tight: ${originPort} transit takes ~${transitDays}d vs ${daysAvailable}d available.`;
    } else {
      rationale += ` • SLA on track: ~${transitDays}d sailing from ${originPort} meets ${daysAvailable}d laycan.`;
    }

    setPreferredVesselCategory(chosenCategory);

    setAiPredictionResult({ 
      category: chosenCategory, 
      rationale,
      parcelSize,
      transitDays,
      daysAvailable
    });
    toast.success(`AI Selected ${chosenCategory} for ${qty.toLocaleString()} MT ${cargoType} to ${destPort}.`);
  };

  // 1. Manual Vessel Category Selection: Preserves user's custom cargo quantity so AI can evaluate true cargo intent
  const handleVesselCategoryChange = (vcat) => {
    setPreferredVesselCategory(vcat);
    const spec = VESSEL_SPECS[vcat];
    if (contractDuration === "1 voyage (Spot)") {
      setExpectedVoyages(1);
    } else {
      // For Period / COA contracts, recalculate voyage count needed based on vessel capacity
      const trips = Math.max(1, Math.ceil((cargoQuantity || spec.avgPayload) / spec.avgPayload));
      setExpectedVoyages(trips);
    }
  };

  // 2. Dynamic auto-adjustment: When Contract Duration changes
  const handleContractDurationChange = (cdur) => {
    setContractDuration(cdur);
    const spec = VESSEL_SPECS[preferredVesselCategory];
    if (cdur === "1 voyage (Spot)") {
      setExpectedVoyages(1);
    } else if (cdur === "3 months Period") {
      setExpectedVoyages(Math.max(2, Math.ceil(cargoQuantity / spec.avgPayload)));
    } else if (cdur === "6 months COA") {
      setExpectedVoyages(Math.max(4, Math.ceil(cargoQuantity / spec.avgPayload)));
    } else if (cdur === "12 months COA") {
      setExpectedVoyages(Math.max(8, Math.ceil(cargoQuantity / spec.avgPayload)));
    }
  };

  // 3. Dynamic auto-adjustment & validation: When Cargo Quantity changes (unclamped so AI can evaluate actual user intent)
  const handleQuantityChange = (qty) => {
    const num = Math.max(0, Number(qty));
    setCargoQuantity(num);
    if (contractDuration !== "1 voyage (Spot)") {
      const spec = VESSEL_SPECS[preferredVesselCategory];
      setExpectedVoyages(Math.max(1, Math.ceil(num / spec.avgPayload)));
    }
  };

  // Auto-inferred Hinterlands
  const activeOrigin = ORIGIN_OPTIONS.find(o => o.port === originPort) || ORIGIN_OPTIONS[0];
  const activeDest = EAST_COAST_DESTINATIONS.find(d => d.port === destPort) || EAST_COAST_DESTINATIONS[0];
  const currentSpec = VESSEL_SPECS[preferredVesselCategory];

  // Real-time verification of vessel selection against physical port limits and cargo volume
  const getVesselCompatibilityCheck = () => {
    const spec = VESSEL_SPECS[preferredVesselCategory] || VESSEL_SPECS.Panamax;
    const dest = activeDest || EAST_COAST_DESTINATIONS[0];
    const isDraftExceeded = spec.draft > dest.maxDraft;
    const isLoaExceeded = spec.loa > dest.maxLoa;
    const isSpot = contractDuration === "1 voyage (Spot)";
    const isOvercapacity = isSpot && cargoQuantity > spec.dwt;
    const isUnderutilized = isSpot && cargoQuantity < spec.avgPayload * 0.45;

    let warning = null;
    if (isDraftExceeded) {
      warning = `${preferredVesselCategory} draft (${spec.draft}m) exceeds ${destPort}'s max allowable depth (${dest.maxDraft}m). Vessel cannot berth safely!`;
    } else if (isLoaExceeded) {
      warning = `${preferredVesselCategory} LOA (${spec.loa}m) exceeds ${destPort}'s berth length (${dest.maxLoa}m).`;
    } else if (isOvercapacity) {
      warning = `Cargo (${Number(cargoQuantity).toLocaleString()} MT) exceeds ${preferredVesselCategory} max capacity (${spec.dwt.toLocaleString()} MT).`;
    } else if (isUnderutilized) {
      warning = `Cargo (${Number(cargoQuantity).toLocaleString()} MT) significantly underfills ${preferredVesselCategory} (~${spec.avgPayload.toLocaleString()} MT), incurring deadfreight.`;
    }

    return { isDraftExceeded, isLoaExceeded, isOvercapacity, isUnderutilized, warning };
  };

  // ==========================================
  // WAREHOUSE SELECTION & SUITABILITY REGISTRY
  // ==========================================
  const DEST_WAREHOUSES = {
    Paradip: [
      { code: "WH-07", name: "Angul Integrated Steel Complex", distanceKm: 82, transitHours: 3.1, capacityTons: 150000, utilizationPct: 68, inlandFreightUsd: 4.80, risk: "LOW", score: 98, mode: "NH-53 Road Truck", truckSlots: 120 },
      { code: "WH-12", name: "Kalinganagar Industrial Hub", distanceKm: 104, transitHours: 4.2, capacityTons: 120000, utilizationPct: 82, inlandFreightUsd: 5.60, risk: "MEDIUM", score: 88, mode: "Industrial Road/Rail", truckSlots: 85 },
      { code: "WH-03", name: "Rourkela Steel Siding Complex", distanceKm: 285, transitHours: 8.5, capacityTons: 200000, utilizationPct: 54, inlandFreightUsd: 11.20, risk: "MEDIUM", score: 79, mode: "Freight Rail / Truck", truckSlots: 140 },
      { code: "WH-09", name: "Choudwar Power & Coal Silo", distanceKm: 96, transitHours: 3.8, capacityTons: 80000, utilizationPct: 91, inlandFreightUsd: 5.20, risk: "HIGH", score: 62, mode: "Road Haulage", truckSlots: 45 }
    ],
    Visakhapatnam: [
      { code: "WH-21", name: "Vizag Steel & Energy Plant (RINL)", distanceKm: 18, transitHours: 0.8, capacityTons: 220000, utilizationPct: 62, inlandFreightUsd: 1.90, risk: "LOW", score: 99, mode: "Dedicated Conveyor / Tipper", truckSlots: 150 },
      { code: "WH-28", name: "Gajuwaka Multimodal Logistics Park", distanceKm: 24, transitHours: 1.2, capacityTons: 95000, utilizationPct: 75, inlandFreightUsd: 2.80, risk: "LOW", score: 91, mode: "6-Lane Bypass Road", truckSlots: 110 },
      { code: "WH-25", name: "Raipur Sponge Iron Complex", distanceKm: 520, transitHours: 14.0, capacityTons: 180000, utilizationPct: 58, inlandFreightUsd: 16.50, risk: "MEDIUM", score: 74, mode: "Heavy Freight Rail", truckSlots: 90 }
    ],
    Dhamra: [
      { code: "WH-31", name: "Kalinganagar Industrial Hub Siding", distanceKm: 118, transitHours: 4.0, capacityTons: 180000, utilizationPct: 55, inlandFreightUsd: 5.10, risk: "LOW", score: 97, mode: "Expressway & Rail", truckSlots: 130 },
      { code: "WH-34", name: "Tata Steel Jamshedpur Stockyard", distanceKm: 295, transitHours: 8.5, capacityTons: 250000, utilizationPct: 72, inlandFreightUsd: 10.20, risk: "LOW", score: 90, mode: "Freight Rail (BOXN)", truckSlots: 160 }
    ],
    Haldia: [
      { code: "WH-41", name: "Durgapur Steel Hub Depot", distanceKm: 210, transitHours: 7.0, capacityTons: 140000, utilizationPct: 84, inlandFreightUsd: 11.40, risk: "HIGH", score: 81, mode: "NH-19 Multi-Axle", truckSlots: 70 },
      { code: "WH-43", name: "Kharagpur Freight Logistics Yard", distanceKm: 135, transitHours: 4.8, capacityTons: 90000, utilizationPct: 70, inlandFreightUsd: 7.80, risk: "MEDIUM", score: 86, mode: "Rail / Road", truckSlots: 80 }
    ],
    Krishnapatnam: [
      { code: "WH-51", name: "Ballari Metal & Thermal Siding", distanceKm: 340, transitHours: 9.2, capacityTons: 210000, utilizationPct: 52, inlandFreightUsd: 12.80, risk: "LOW", score: 95, mode: "Dedicated Rail Corridor", truckSlots: 140 },
      { code: "WH-53", name: "Nellore Power & Logistics Siding", distanceKm: 35, transitHours: 1.2, capacityTons: 110000, utilizationPct: 60, inlandFreightUsd: 2.90, risk: "LOW", score: 94, mode: "Port Highway Corridor", truckSlots: 95 }
    ]
  };

  const getCandidateWarehouses = () => {
    return DEST_WAREHOUSES[destPort] || [
      { code: "WH-01", name: `${destPort} Primary Regional Stockyard`, distanceKm: 45, transitHours: 1.8, capacityTons: 100000, utilizationPct: 65, inlandFreightUsd: 3.50, risk: "LOW", score: 92, mode: "State Highway", truckSlots: 80 },
      { code: "WH-02", name: `${destPort} Inland Commodity Terminal`, distanceKm: 110, transitHours: 4.0, capacityTons: 85000, utilizationPct: 78, inlandFreightUsd: 6.20, risk: "MEDIUM", score: 82, mode: "Rail Siding", truckSlots: 60 }
    ];
  };

  const candidateWarehousesList = getCandidateWarehouses();

  // =========================================================================
  // AI EXECUTION RECOMMENDATIONS: PLAN 01, PLAN 02, PLAN 03
  // =========================================================================
  const getExecutionPlans = () => {
    const vcat = preferredVesselCategory;
    const spec = VESSEL_SPECS[vcat];
    const wh1 = candidateWarehousesList[0];
    const wh2 = candidateWarehousesList[1] || wh1;
    const wh3 = candidateWarehousesList[2] || wh1;

    // PLAN 01: OPTIMAL
    const firstMileCost1 = Math.round(cargoQuantity * 1.20);
    const oceanCost1 = Math.round(cargoQuantity * spec.ratePerTon);
    const portCost1 = Math.round(cargoQuantity * 0.60);
    const lastMileCost1 = Math.round(cargoQuantity * wh1.inlandFreightUsd);
    const landedTotal1 = firstMileCost1 + oceanCost1 + portCost1 + lastMileCost1;

    const plan01 = {
      planId: "PLAN-01",
      label: "PLAN 01",
      tag: "RECOMMENDED (OPTIMAL EXECUTION)",
      rank: 1,
      isRecommended: true,
      vessel: {
        name: vcat === "Capesize" ? "MV Tata Titan" : vcat === "Supramax" ? "MV Tata Pride" : vcat === "Handysize" ? "MV Tata Pearl" : "MV Bengal Voyager",
        category: vcat,
        dwt: spec.dwt,
        draftM: spec.draft,
        loaM: spec.loa,
        beamM: spec.beam,
        speedKnots: 13.8,
        engineEfficiency: "98.2%",
        healthScore: 96.8,
        ciiRating: "Grade A (Eco-Bulker)",
        age: "4.2 Years",
        rightShipRating: 5,
        flag: "Panama",
        dailyFuelBurn: vcat === "Capesize" ? "48.5 MT/day" : vcat === "Supramax" ? "24.2 MT/day" : "31.8 MT/day"
      },
      origin: `${originPort}, ${activeOrigin.country}`,
      originPort,
      originWarehouse: activeOrigin.warehouse,
      destinationPort: destPort,
      destinationWarehouse: wh1,
      contractor: {
        id: "TATA_NYK",
        name: "Tata NYK Shipping",
        roadTransporter: "Intermodal Road Express",
        reliability: "98.4%"
      },
      inlandRoute: `${activeOrigin.warehouse} ➔ ${originPort} Port ➔ ${destPort} Port ➔ ${wh1.name}`,
      estimatedOceanTransitDays: activeOrigin.distNm ? (activeOrigin.distNm / (13.8 * 24)).toFixed(1) : 15.5,
      eta: requiredArrivalDate,
      oceanFreightRatePerTon: spec.ratePerTon,
      totalLandedCostUsd: landedTotal1,
      landedCostPerTonUsd: (landedTotal1 / cargoQuantity).toFixed(2),
      savingsUsd: Math.round(cargoQuantity * 0.89),
      portWaiting: `${activeDest.waitHours || 12} hrs estimated queue`,
      portWaitingHours: activeDest.waitHours || 12,
      demurrageRisk: "LOW",
      logisticsRisk: "LOW",
      overallFeasibility: "FEASIBLE",
      feasibilityScore: 98,
      firstMileTrucks: Math.ceil(cargoQuantity / 1400),
      lastMileTrucks: Math.ceil(cargoQuantity / 1350),
      firstMileCostUsd: firstMileCost1,
      oceanFreightTotalUsd: oceanCost1,
      portHandlingCostUsd: portCost1,
      roadFreightCostUsd: lastMileCost1,
      demurragePerHourUsd: spec.demurrage,
      recommendationReason: `Top tier match for ${destPort} with Grade A Engine Health (98.2%), 5-Star RightShip Safety rating, top-ranked warehouse (${wh1.code}: ${wh1.score}%), and lowest landed cost.`
    };

    // PLAN 02: BALANCED ALTERNATIVE
    const firstMileCost2 = firstMileCost1;
    const oceanCost2 = Math.round(cargoQuantity * (spec.ratePerTon + 1.20));
    const portCost2 = Math.round(cargoQuantity * 0.65);
    const lastMileCost2 = Math.round(cargoQuantity * wh2.inlandFreightUsd);
    const landedTotal2 = firstMileCost2 + oceanCost2 + portCost2 + lastMileCost2;

    const plan02 = {
      planId: "PLAN-02",
      label: "PLAN 02",
      tag: "BALANCED ALTERNATIVE",
      rank: 2,
      isRecommended: false,
      vessel: {
        name: vcat === "Capesize" ? "MV JSW Steel Bulk" : vcat === "Supramax" ? "MV Coastal Pride" : vcat === "Handysize" ? "MV JSW Express" : "MV JSW Vamsi",
        category: vcat,
        dwt: spec.dwt,
        draftM: spec.draft - 0.4,
        loaM: spec.loa - 8,
        beamM: spec.beam,
        speedKnots: 13.5,
        engineEfficiency: "92.0%",
        healthScore: 91.2,
        ciiRating: "Grade B",
        age: "8.5 Years",
        rightShipRating: 4,
        flag: "Marshall Islands",
        dailyFuelBurn: vcat === "Capesize" ? "52.0 MT/day" : "33.5 MT/day"
      },
      origin: `${originPort}, ${activeOrigin.country}`,
      originPort,
      originWarehouse: activeOrigin.warehouse,
      destinationPort: destPort,
      destinationWarehouse: wh2,
      contractor: {
        id: "JSW_SHIPPING",
        name: "JSW Shipping Ltd",
        roadTransporter: "Eastern Coastal Fleet",
        reliability: "94.2%"
      },
      inlandRoute: `${activeOrigin.warehouse} ➔ ${originPort} Port ➔ ${destPort} Port ➔ ${wh2.name}`,
      estimatedOceanTransitDays: (Number(plan01.estimatedOceanTransitDays) + 0.6).toFixed(1),
      eta: requiredArrivalDate,
      oceanFreightRatePerTon: spec.ratePerTon + 1.20,
      totalLandedCostUsd: landedTotal2,
      landedCostPerTonUsd: (landedTotal2 / cargoQuantity).toFixed(2),
      savingsUsd: Math.round(cargoQuantity * 0.35),
      portWaiting: `${(activeDest.waitHours || 12) + 2} hrs queue`,
      portWaitingHours: (activeDest.waitHours || 12) + 2,
      demurrageRisk: "MEDIUM",
      logisticsRisk: "LOW",
      overallFeasibility: "FEASIBLE",
      feasibilityScore: 91,
      firstMileTrucks: Math.ceil(cargoQuantity / 1400),
      lastMileTrucks: Math.ceil(cargoQuantity / 1350),
      firstMileCostUsd: firstMileCost2,
      oceanFreightTotalUsd: oceanCost2,
      portHandlingCostUsd: portCost2,
      roadFreightCostUsd: lastMileCost2,
      demurragePerHourUsd: spec.demurrage + 150,
      recommendationReason: `Alternative route utilizing ${wh2.name} (${wh2.code}) with secondary fleet spot positioning and high storage capacity.`
    };

    // PLAN 03: CONTINGENCY BUFFER
    const firstMileCost3 = firstMileCost1;
    const oceanCost3 = Math.round(cargoQuantity * (spec.ratePerTon + 0.80));
    const portCost3 = Math.round(cargoQuantity * 0.62);
    const lastMileCost3 = Math.round(cargoQuantity * wh3.inlandFreightUsd);
    const landedTotal3 = firstMileCost3 + oceanCost3 + portCost3 + lastMileCost3;

    const plan03 = {
      planId: "PLAN-03",
      label: "PLAN 03",
      tag: "BUFFER CONTINGENCY",
      rank: 3,
      isRecommended: false,
      vessel: {
        name: vcat === "Capesize" ? "MV Ocean Giant" : vcat === "Supramax" ? "MV Ocean Leader" : vcat === "Handysize" ? "MV Island Trader" : "MV Ocean Pioneer",
        category: vcat,
        dwt: spec.dwt + 2000,
        draftM: spec.draft + 0.3,
        loaM: spec.loa + 5,
        beamM: spec.beam,
        speedKnots: 13.0,
        engineEfficiency: "89.0%",
        healthScore: 88.5,
        ciiRating: "Grade C",
        age: "11.8 Years",
        rightShipRating: 4,
        flag: "Liberia",
        dailyFuelBurn: vcat === "Capesize" ? "55.0 MT/day" : "35.2 MT/day"
      },
      origin: `${originPort}, ${activeOrigin.country}`,
      originPort,
      originWarehouse: activeOrigin.warehouse,
      destinationPort: destPort,
      destinationWarehouse: wh3,
      contractor: {
        id: "SYNERGY_MARINE",
        name: "Synergy Marine Group",
        roadTransporter: "National Highway Logistics",
        reliability: "91.8%"
      },
      inlandRoute: `${activeOrigin.warehouse} ➔ ${originPort} Port ➔ ${destPort} Port ➔ ${wh3.name}`,
      estimatedOceanTransitDays: (Number(plan01.estimatedOceanTransitDays) + 1.2).toFixed(1),
      eta: requiredArrivalDate,
      oceanFreightRatePerTon: spec.ratePerTon + 0.80,
      totalLandedCostUsd: landedTotal3,
      landedCostPerTonUsd: (landedTotal3 / cargoQuantity).toFixed(2),
      savingsUsd: Math.round(cargoQuantity * 0.42),
      portWaiting: `${(activeDest.waitHours || 12) + 4} hrs queue`,
      portWaitingHours: (activeDest.waitHours || 12) + 4,
      demurrageRisk: "MEDIUM",
      logisticsRisk: "MEDIUM",
      overallFeasibility: "FEASIBLE (CONTINGENT)",
      feasibilityScore: 84,
      firstMileTrucks: Math.ceil(cargoQuantity / 1400),
      lastMileTrucks: Math.ceil(cargoQuantity / 1350),
      firstMileCostUsd: firstMileCost3,
      oceanFreightTotalUsd: oceanCost3,
      portHandlingCostUsd: portCost3,
      roadFreightCostUsd: lastMileCost3,
      demurragePerHourUsd: spec.demurrage + 100,
      recommendationReason: `Contingency allocation with flexible laycan cancellation window and buffer warehousing at ${wh3.name}.`
    };

    return [plan01, plan02, plan03];
  };

  const executionPlans = getExecutionPlans();
  const [selectedPlanId, setSelectedPlanId] = useState("PLAN-01");
  const selectedPlan = executionPlans.find(p => p.planId === selectedPlanId) || executionPlans[0];
  const selectedContractor = selectedPlan; // for compatibility with subsequent steps


  // Visual Chart State for Step 3 AI Multi-Factor Analysis
  const [aiChartTab, setAiChartTab] = useState("freight_curve"); // 'freight_curve' | 'cost_breakdown' | 'port_queue' | 'shap_factors'
  const [hoveredCostCategory, setHoveredCostCategory] = useState(null);
  const [hoveredPortStage, setHoveredPortStage] = useState(null);
  const [hoveredShapFactor, setHoveredShapFactor] = useState(null);

  // Dynamic Chart 1: 14-Day Freight Rate Forward Curve
  const currentSpotRate = selectedContractor.oceanFreightRatePerTon;
  const freightCurveData = [];
  const now = new Date();
  for (let i = 5; i >= 1; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    const dateStr = d.toISOString().slice(5, 10);
    const historicalRate = parseFloat((currentSpotRate - (i * 0.06) + Math.sin(i * 0.5) * 0.05).toFixed(2));
    freightCurveData.push({
      date: dateStr,
      actual: historicalRate,
      lockedSpot: currentSpotRate,
      projected: null,
      confidenceUpper: null,
      confidenceLower: null
    });
  }
  // Day 0: Today
  freightCurveData.push({
    date: "Today (Lock)",
    actual: currentSpotRate,
    lockedSpot: currentSpotRate,
    projected: currentSpotRate,
    confidenceUpper: currentSpotRate + 0.15,
    confidenceLower: currentSpotRate - 0.15
  });
  // Forward 10 Days
  for (let i = 1; i <= 10; i++) {
    const d = new Date(now.getTime() + i * 86400000);
    const dateStr = d.toISOString().slice(5, 10);
    const projRate = parseFloat((currentSpotRate + (i * 0.08) + Math.sin(i * 0.4) * 0.04).toFixed(2));
    freightCurveData.push({
      date: `+${i}d (${dateStr})`,
      actual: null,
      lockedSpot: currentSpotRate,
      projected: projRate,
      confidenceUpper: parseFloat((projRate + 0.25 + i * 0.04).toFixed(2)),
      confidenceLower: parseFloat((projRate - 0.25 - i * 0.04).toFixed(2))
    });
  }

  // Dynamic Chart 2: Multimodal Cost Breakdown Comparison (Mapped directly from datasets)
  const costBreakdownData = [
    {
      category: "Ocean Freight",
      "Traditional Booking": Math.round(cargoQuantity * (currentSpotRate + 0.70)),
      "ASTRA Multimodal AI": Math.round(cargoQuantity * currentSpotRate),
      savings: Math.round(cargoQuantity * 0.70),
      dataset: "baltic_dry_freight_historical.csv",
      metric: `Spot Rate: $${currentSpotRate.toFixed(2)}/MT vs Spot Premium $${(currentSpotRate + 0.70).toFixed(2)}/MT`,
      whyCheaper: "Direct carrier fixture negotiated at forward spot rate curve, bypassing intermediary broker markup."
    },
    {
      category: "First-Mile Road",
      "Traditional Booking": Math.round(selectedContractor.roadFreightCostUsd * 0.58),
      "ASTRA Multimodal AI": Math.round(selectedContractor.roadFreightCostUsd * 0.50),
      savings: Math.round(selectedContractor.roadFreightCostUsd * 0.08),
      dataset: "inland_multimodal_corridors.csv",
      metric: `${selectedContractor.firstMileTrucks} dedicated 40T tippers on M15 corridor`,
      whyCheaper: "Bulk transporter contract with guaranteed backhaul rate instead of ad-hoc spot truck hire."
    },
    {
      category: "Last-Mile Road",
      "Traditional Booking": Math.round(selectedContractor.roadFreightCostUsd * 0.58),
      "ASTRA Multimodal AI": Math.round(selectedContractor.roadFreightCostUsd * 0.50),
      savings: Math.round(selectedContractor.roadFreightCostUsd * 0.08),
      dataset: "inland_multimodal_corridors.csv",
      metric: `${selectedContractor.lastMileTrucks} trucks on NH-53 heavy corridor`,
      whyCheaper: "Synchronized port gate dispatch prevents truck detention fees at destination plant hoppers."
    },
    {
      category: "Port Handling",
      "Traditional Booking": Math.round(selectedContractor.portHandlingCostUsd * 1.15),
      "ASTRA Multimodal AI": selectedContractor.portHandlingCostUsd,
      savings: Math.round(selectedContractor.portHandlingCostUsd * 0.15),
      dataset: "east_coast_india_port_telemetry.csv",
      metric: "2,800 MT/hr mechanized conveyor berth handling",
      whyCheaper: "Pre-allocated mechanized conveyor berth avoids conventional crane handling surcharges."
    },
    {
      category: "Demurrage Risk",
      "Traditional Booking": Math.round(selectedContractor.demurragePerHourUsd * (activeDest.waitHours || 12) * 0.8),
      "ASTRA Multimodal AI": 0, // Shielded by JIT pre-booking
      savings: Math.round(selectedContractor.demurragePerHourUsd * (activeDest.waitHours || 12) * 0.8),
      dataset: "east_coast_india_port_telemetry.csv",
      metric: `${activeDest.waitHours || 12}h historical queue at ${destPort} Port`,
      whyCheaper: "Zero demurrage: Just-In-Time (JIT) vessel arrival eliminates the average 12-hour anchorage wait."
    }
  ];

  // Dynamic Chart 3: Port Turnaround Stages (Mapped directly from east_coast_india_port_telemetry.csv)
  const dischargeHours = Math.max(16, Math.round(cargoQuantity / 2800));
  const queueHours = activeDest.waitHours || 12;
  const totalPortHours = (2.5 + queueHours + 1.5 + dischargeHours + 1.0).toFixed(1);

  const portQueueStages = [
    { 
      stage: "Pilotage & Fairway", 
      hours: 2.5, 
      type: "Navigation",
      dataset: "east_coast_india_port_telemetry.csv",
      status: "STANDARD NAV",
      desc: "Port pilot boards ship at outer fairway; safe pilotage through dredged channel at 4–6 knots.",
      whyItMatters: "Mandatory navigational procedure ensuring safe channel transit without grounding risk."
    },
    { 
      stage: "Anchorage Queue", 
      hours: queueHours, 
      type: "Waiting",
      dataset: "east_coast_india_port_telemetry.csv",
      status: "BOTTLENECK RISK",
      desc: `Vessel idles at outer anchorage waiting for empty berth. Historical wait time at ${destPort} Port.`,
      whyItMatters: `Every idle hour costs ~$1,200 in vessel demurrage. ASTRA's JIT schedule eliminates this wait.`
    },
    { 
      stage: "Tug & Mooring", 
      hours: 1.5, 
      type: "Berthing",
      dataset: "east_coast_india_port_telemetry.csv",
      status: "STANDARD BERTH",
      desc: "Twin tractor tugs guide and secure vessel alongside mechanized bulk jetty bollards.",
      whyItMatters: "Precision berthing operation safely securing the vessel alongside the discharge hopper."
    },
    { 
      stage: "Mechanized Discharge", 
      hours: dischargeHours, 
      type: "Operations",
      dataset: "east_coast_india_port_telemetry.csv",
      status: "CORE OPERATION",
      desc: `High-speed unloading of ${Number(cargoQuantity).toLocaleString()} MT cargo at 2,800 MT/hr via conveyor belts.`,
      whyItMatters: "Active physical discharge directly into waiting tipper trucks and plant railway siding."
    },
    { 
      stage: "Outward Clearance", 
      hours: 1.0, 
      type: "Documentation",
      dataset: "east_coast_india_port_telemetry.csv",
      status: "CLEARANCE",
      desc: "Port trust clearance, customs sign-off, draft survey validation, and outward unberthing.",
      whyItMatters: "Final regulatory sign-off releasing the vessel to depart for its next voyage."
    }
  ];

  // Dynamic Chart 4: SHAP Attribution (Mapped directly from datasets/baltic_dry_freight_historical.csv)
  const shapFeatures = [
    { 
      factor: "Baltic Dry Index (BDI) Momentum", 
      weight: 34.2, 
      impact: "Bullish (+)",
      column: "BDI_Index",
      dataset: "baltic_dry_freight_historical.csv",
      trend: "Upward trend across global dry bulk routes",
      companyExplanation: "Global charter demand is surging. Rates will climb, making today's rate a locked-in cost advantage."
    },
    { 
      factor: "Singapore VLSFO Bunker Fuel Index", 
      weight: 23.5, 
      impact: "Moderate (+)",
      column: "VLSFO_Bunker_USD_Per_Ton",
      dataset: "baltic_dry_freight_historical.csv",
      trend: "VLSFO fuel pricing around $540/ton",
      companyExplanation: "Higher marine fuel prices directly increase ship operating expenses; locking today caps bunker exposure."
    },
    { 
      factor: "Discharge Port Anchorage Congestion", 
      weight: 18.1, 
      impact: "Bullish (+)",
      column: "Current_Vessels_In_Queue",
      dataset: "east_coast_india_port_telemetry.csv",
      trend: `${activeDest.waitHours || 12}h queue at ${destPort} Port`,
      companyExplanation: "Congestion at the port increases market spot premiums; ASTRA shields you with pre-reserved berths."
    },
    { 
      factor: "Bay of Bengal Monsoon Wave Swell", 
      weight: 14.4, 
      impact: "Seasonal (+)",
      column: "Monsoon_Wave_Height_M",
      dataset: "baltic_dry_freight_historical.csv",
      trend: "Seasonal swell height 1.5m–2.2m",
      companyExplanation: "Rough sea weather adds voyage safety buffers; seasonal weather factors are factored into transit time."
    },
    { 
      factor: "Origin Terminal Loading Delays", 
      weight: 9.8, 
      impact: "Neutral",
      column: "Handling_TAT_Minutes",
      dataset: "inland_multimodal_corridors.csv",
      trend: "Pithead loading TAT: 45 min per rail/tipper unit",
      companyExplanation: "Mine pithead handling efficiency is stable; minimal friction at the export loading stage."
    }
  ];

  // Final Execution & Confirmation
  const handleConfirmAndDispatch = () => {
    const activePlan = executionPlans.find(p => p.planId === selectedPlanId) || executionPlans[0];
    const generatedId = `REQ-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const companyName = user?.name || "Jindal Steel & Power Ltd (Shipper)";

    const finalRequirement = {
      id: generatedId,
      companyName,
      companyCode: "JSPL",
      planId: activePlan.planId,
      cargoType,
      cargoQuantity,
      originWarehouse: activePlan.originWarehouse,
      originPort: activePlan.originPort,
      destinationPort: activePlan.destinationPort,
      destinationWarehouse: activePlan.destinationWarehouse.name,
      destinationWarehouseCode: activePlan.destinationWarehouse.code,
      warehouseSuitability: activePlan.destinationWarehouse,
      preferredVesselCategory,
      requiredArrivalDate,
      contractDuration,
      expectedVoyages,
      budgetPreference,
      riskTolerance,
      selectedContractor: activePlan.contractor.name || "Tata NYK Shipping",
      selectedVessel: activePlan.vessel,
      roadFleet: {
        firstMileTrucks: activePlan.firstMileTrucks,
        lastMileTrucks: activePlan.lastMileTrucks,
        transporterName: activePlan.contractor.roadTransporter,
        truckType: "40T Multi-Axle Container & Tipping Trucks"
      },
      costBreakdown: {
        oceanFreightRatePerTon: activePlan.oceanFreightRatePerTon,
        oceanFreightTotalUsd: activePlan.oceanFreightTotalUsd,
        firstMileCostUsd: activePlan.firstMileCostUsd,
        roadTransportUsd: activePlan.roadFreightCostUsd,
        portHandlingUsd: activePlan.portHandlingCostUsd,
        totalLandedCostUsd: activePlan.totalLandedCostUsd,
        netSavingsUsd: activePlan.savingsUsd
      },
      status: "PENDING_REVIEW",
      contractorAccepted: false,
      timestamp: new Date().toISOString()
    };

    setRequirement(finalRequirement);
    setSelectedVessel(activePlan.vessel);
    setSimProgress(0);
    setIsPlaying(false);
    if (setSimActive) setSimActive(false);

    // Notify Contractor Profile in Real-Time
    if (addEvent) {
      addEvent({
        id: `EV-${Date.now()}`,
        type: "NEW_REQUIREMENT_CREATED",
        severity: "INFO",
        title: `📦 New Company Requirement: ${cargoType} (${cargoQuantity.toLocaleString()} MT)`,
        detail: `${companyName} created a new shipping requirement for ${preferredVesselCategory} from ${activePlan.originPort} to ${activePlan.destinationPort}. Awaiting contractor review & fixture confirmation.`,
        requirementId: generatedId,
        roleRecipient: ["contractor", "company"]
      });
    }

    toast.success(`Requirement ${finalRequirement.id} Dispatched to Contractor Desk! Tata NYK Contractor notified in real time.`);
    nav("/");
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto" data-testid="new-requirement-page">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge kind="OPTIMIZATION" />
            <span className="astra-label">End-to-End Multimodal Logistics Wizard</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1" style={{ fontFamily: "Manrope" }}>
            New Multimodal Shipment
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure cargo, vessel size specs (Beam/LOA/Draft), East Coast ports, and contract structure.
          </p>
        </div>

        {/* 4-Step Progress Indicator */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200 text-xs font-mono font-bold">
          <span className={`px-3 py-1 rounded-lg ${step === 1 ? "bg-blue-900 text-white shadow" : "text-slate-600"}`}>1. Setup & Vessel Specs</span>
          <span className={`px-3 py-1 rounded-lg ${step === 2 ? "bg-blue-900 text-white shadow" : "text-slate-600"}`}>2. Contractor ({preferredVesselCategory})</span>
          <span className={`px-3 py-1 rounded-lg ${step === 3 ? "bg-blue-900 text-white shadow" : "text-slate-600"}`}>3. AI Analysis</span>
          <span className={`px-3 py-1 rounded-lg ${step === 4 ? "bg-blue-900 text-white shadow" : "text-slate-600"}`}>4. Confirm</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STEP 1: REQUIREMENT, VESSEL SPECS (BEAM/LOA/DRAFT) & CONTRACT PARAMETERS */}
      {/* ========================================================================= */}
      {step === 1 && (
        <div className="astra-card p-6 space-y-6 animate-in fade-in">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-lg font-extrabold text-slate-900" style={{ fontFamily: "Manrope" }}>
              Step 1: Cargo, Preferred Vessel Specifications & Contract Structure
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select vessel size class (includes Beam, LOA, Draft limits) and specify delivery contract parameters.
            </p>
          </div>

          {/* Section 1: Preferred Vessel Size with Real Beam, LOA, Draft Specs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold text-blue-900 uppercase">
                1. PREFERRED VESSEL SIZE CLASS (BEAM, LOA & DRAFT SPECIFICATIONS)
              </label>
              <span className="text-[11px] font-mono text-slate-500">
                Selected: <span className="font-bold text-blue-900">{preferredVesselCategory}</span> (Beam: {currentSpec.beam}m, LOA: {currentSpec.loa}m, Draft: {currentSpec.draft}m)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {Object.keys(VESSEL_SPECS).map((vcat) => {
                const spec = VESSEL_SPECS[vcat];
                const isSelected = preferredVesselCategory === vcat;

                return (
                  <button
                    key={vcat}
                    type="button"
                    onClick={() => handleVesselCategoryChange(vcat)}
                    className={`p-4 rounded-xl border-2 text-left transition-all relative ${
                      isSelected 
                        ? "border-blue-900 bg-blue-50/50 shadow-md ring-2 ring-blue-900/20" 
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-sm text-slate-900 font-mono">{vcat}</span>
                        {aiPredictionResult?.category === vcat && (
                          <span className="text-[9px] font-mono font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 px-1.5 py-0.5 rounded-full">
                            AI Best
                          </span>
                        )}
                      </div>
                      <TopDownVesselIcon category={vcat} size={20} />
                    </div>

                    <div className="text-[11px] font-mono text-slate-600 space-y-1">
                      <div>• Capacity: <span className="font-bold text-slate-900">~{(spec.avgPayload / 1000).toFixed(0)}k MT</span></div>
                      <div>• Max Beam: <span className="font-bold text-slate-900">{spec.beam}m</span></div>
                      <div>• Max LOA: <span className="font-bold text-slate-900">{spec.loa}m</span></div>
                      <div>• Max Draft: <span className="font-bold text-slate-900">{spec.draft}m</span></div>
                    </div>

                    {isSelected && (
                      <span className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-blue-900" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Minimal AI Vessel Prediction Bar: Positioned cleanly between Section 1 and Section 2 */}
          <div className="p-3.5 bg-gradient-to-r from-blue-50/90 via-slate-50 to-indigo-50/70 rounded-xl border border-blue-200/80 shadow-sm space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-blue-900 text-white grid place-items-center shrink-0 shadow-sm">
                  <Sparkles size={15} className="text-amber-300" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-2 flex-wrap">
                    <span>AI Vessel Recommendation Engine</span>
                    {aiPredictionResult ? (
                      <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 size={10} className="text-emerald-600" />
                        AI Optimal: {aiPredictionResult.category}
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded-full">
                        Ready to Optimize
                      </span>
                    )}
                    {getVesselCompatibilityCheck().warning && (
                      <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <AlertTriangle size={10} className="text-amber-600" />
                        Current Selection Conflict
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                    {aiPredictionResult ? (
                      <span className="font-medium text-slate-800">{aiPredictionResult.rationale}</span>
                    ) : (
                      <span className="text-slate-500">
                        Cross-analyzes cargo volume ({Number(cargoQuantity).toLocaleString()} MT), {destPort} port depth ({activeDest.maxDraft}m draft), and laycan SLA.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAiVesselPredict}
                className="shrink-0 px-3.5 py-2 rounded-lg bg-blue-900 hover:bg-blue-800 active:scale-95 text-white font-mono text-xs font-bold flex items-center gap-2 shadow-sm transition-all self-start sm:self-auto cursor-pointer"
                title="Click to automatically predict and select the best vessel class based on Sections 2 & 3"
              >
                <Sparkles size={13} className="text-amber-300 animate-pulse" />
                <span>AI Predict Best Vessel</span>
              </button>
            </div>

            {/* Quick 4-Parameter Visual Logic Pills */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-slate-200/60 text-[10.5px] font-mono">
              <div className="flex items-center gap-1.5 text-slate-700 bg-white/80 p-1.5 rounded-lg border border-slate-200/60">
                <span className="text-slate-400">Tons:</span>
                <span className="font-bold text-blue-900 truncate">
                  {Number(cargoQuantity).toLocaleString()} MT ({contractDuration === "1 voyage (Spot)" ? "Spot" : `${expectedVoyages}x trips`})
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700 bg-white/80 p-1.5 rounded-lg border border-slate-200/60">
                <span className="text-slate-400">Draft:</span>
                <span className={`font-bold truncate ${currentSpec.draft > activeDest.maxDraft ? "text-red-600" : "text-emerald-700"}`}>
                  {destPort} max {activeDest.maxDraft}m {currentSpec.draft > activeDest.maxDraft ? "❌ Too Deep" : "✓ Cleared"}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700 bg-white/80 p-1.5 rounded-lg border border-slate-200/60">
                <span className="text-slate-400">SLA:</span>
                <span className="font-bold text-slate-900 truncate">
                  ~{Math.ceil((activeOrigin.distNm || 5000) / (currentSpec.speedKnots * 24)) + 1}d sailing from {originPort}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700 bg-white/80 p-1.5 rounded-lg border border-slate-200/60">
                <span className="text-slate-400">Freight:</span>
                <span className="font-bold text-emerald-700 truncate">${currentSpec.ratePerTon.toFixed(2)}/t base</span>
              </div>
            </div>

            {/* Warning banner if current manual selection has physical or operational conflict */}
            {getVesselCompatibilityCheck().warning && (
              <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between text-xs text-amber-800">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle size={13} className="text-amber-600 shrink-0" />
                  <span>{getVesselCompatibilityCheck().warning}</span>
                </div>
                {aiPredictionResult?.category && aiPredictionResult.category !== preferredVesselCategory && (
                  <button
                    type="button"
                    onClick={() => handleVesselCategoryChange(aiPredictionResult.category)}
                    className="ml-2 px-2 py-0.5 bg-amber-200 hover:bg-amber-300 text-amber-900 font-mono text-[10px] font-bold rounded cursor-pointer"
                  >
                    Switch to {aiPredictionResult.category}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Section 2: Commodity & Corridor Ports */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="text-xs font-mono font-bold text-blue-900 uppercase">
              2. CARGO COMMODITY & EAST COAST PORTS
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="astra-label block mb-1.5">Cargo Commodity Type</label>
                <select
                  value={cargoType}
                  onChange={(e) => setCargoType(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border border-slate-200 bg-slate-50 font-bold text-sm text-slate-900 focus:ring-2 focus:ring-blue-900 outline-none"
                >
                  <option value="Thermal Coal">Thermal Coal</option>
                  <option value="Coking Coal">Coking Coal</option>
                  <option value="Iron Ore Fines">Iron Ore Fines</option>
                  <option value="Limestone Bulk">Limestone Bulk</option>
                  <option value="Bauxite">Bauxite Ore</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="astra-label">Cargo Quantity (Metric Tons)</label>
                  <span className="text-[10px] font-mono font-bold text-blue-900 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
                    {contractDuration === "1 voyage (Spot)" ? `Spot: ${Number(cargoQuantity).toLocaleString()} MT` : `${expectedVoyages} Voyages (~${Math.round(Number(cargoQuantity) / Math.max(1, expectedVoyages)).toLocaleString()} MT/trip)`}
                  </span>
                </div>
                <input
                  type="number"
                  value={cargoQuantity}
                  min="1000"
                  max="250000"
                  onChange={(e) => handleQuantityChange(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border border-slate-200 bg-slate-50 font-mono font-bold text-sm text-slate-900 focus:ring-2 focus:ring-blue-900 outline-none"
                  step="1000"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  {contractDuration === "1 voyage (Spot)"
                    ? `Single spot voyage · Evaluated against East Coast port depth and vessel payload limits`
                    : `Volume allocated across ${expectedVoyages} voyages (~${Math.round(Number(cargoQuantity) / Math.max(1, expectedVoyages)).toLocaleString()} MT per voyage)`}
                </span>
              </div>

              <div>
                <label className="astra-label block mb-1.5">Origin Port (Loading)</label>
                <select
                  value={originPort}
                  onChange={(e) => setOriginPort(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border border-slate-200 bg-slate-50 font-bold text-sm text-slate-900 focus:ring-2 focus:ring-blue-900 outline-none"
                >
                  {ORIGIN_OPTIONS.map(o => (
                    <option key={o.port} value={o.port}>{o.port} ({o.country})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="astra-label block mb-1.5">Destination Port (East Coast India)</label>
                <select
                  value={destPort}
                  onChange={(e) => setDestPort(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border border-slate-200 bg-slate-50 font-bold text-sm text-slate-900 focus:ring-2 focus:ring-blue-900 outline-none"
                >
                  {EAST_COAST_DESTINATIONS.map(d => (
                    <option key={d.port} value={d.port}>{d.port} Port ({d.state}) · Draft: {d.maxDraft}m</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Delivery Laycan & Contract Structure (Clearly Explained) */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div className="text-xs font-mono font-bold text-blue-900 uppercase">
                3. DELIVERY SLA & CONTRACT STRUCTURE
              </div>
              <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                {contractDuration === "1 voyage (Spot)" ? "Spot: Single 1-time delivery" : `COA / Period: Divided across ${expectedVoyages} sequential ${preferredVesselCategory} voyages`}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="astra-label block mb-1.5">
                  {contractDuration === "1 voyage (Spot)" ? "Target Arrival Laycan Date" : "First Voyage Laycan Date"}
                </label>
                <input
                  type="date"
                  min={todayStr}
                  value={requiredArrivalDate}
                  onChange={(e) => handleArrivalDateChange(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border border-slate-200 bg-slate-50 font-mono font-bold text-sm text-slate-900 focus:ring-2 focus:ring-blue-900 outline-none"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Select arrival laycan (Earliest selectable: Today {todayStr})
                </span>
              </div>

              <div>
                <label className="astra-label block mb-1.5">Contract Duration</label>
                <select
                  value={contractDuration}
                  onChange={(e) => handleContractDurationChange(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border border-slate-200 bg-slate-50 font-bold text-sm text-slate-900 focus:ring-2 focus:ring-blue-900 outline-none"
                >
                  <option value="1 voyage (Spot)">1 voyage (Spot Market Single Trip)</option>
                  <option value="3 months Period">3 months Period Contract (COA)</option>
                  <option value="6 months COA">6 months Long-Term COA</option>
                  <option value="12 months COA">12 months Annual Volume Contract</option>
                </select>
              </div>

              <div>
                <label className="astra-label block mb-1.5">Expected Voyage Count</label>
                <input
                  type="number"
                  min="1"
                  value={expectedVoyages}
                  onChange={(e) => setExpectedVoyages(Number(e.target.value))}
                  disabled={contractDuration === "1 voyage (Spot)"}
                  className="w-full h-11 px-3 rounded-lg border border-slate-200 bg-slate-50 font-mono font-bold text-sm text-slate-900 focus:ring-2 focus:ring-blue-900 outline-none disabled:opacity-60"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Auto-Inferred Hinterland Corridor (Zero Manual Typing) */}
          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 space-y-3">
            <div className="text-xs font-mono font-bold text-blue-900 uppercase flex items-center gap-2">
              <Info size={14} />
              <span>AUTO-INFERRED MULTIMODAL 4-POINT CORRIDOR</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 bg-white rounded-lg border border-blue-100">
                <div className="text-slate-400 text-[10px] uppercase font-bold">1. ORIGIN SIDING</div>
                <div className="font-bold text-slate-900 mt-1">{activeOrigin.warehouse}</div>
                <div className="text-emerald-700 text-[10px] mt-1 font-semibold">{Math.ceil(cargoQuantity / 1400)} First-Mile Trucks</div>
              </div>

              <div className="p-3 bg-white rounded-lg border border-blue-100">
                <div className="text-slate-400 text-[10px] uppercase font-bold">2. LOADING JETTY</div>
                <div className="font-bold text-slate-900 mt-1">{activeOrigin.port} Deepwater Berth</div>
                <div className="text-slate-500 text-[10px] mt-1">Conveyor Loading</div>
              </div>

              <div className="p-3 bg-white rounded-lg border border-blue-100">
                <div className="text-slate-400 text-[10px] uppercase font-bold">3. DISCHARGE TERMINAL</div>
                <div className="font-bold text-slate-900 mt-1">{activeDest.port} Port Bulk Jetty</div>
                <div className="text-blue-900 text-[10px] mt-1 font-semibold">Max Draft: {activeDest.maxDraft}m · Max LOA: {activeDest.maxLoa}m</div>
              </div>

              <div className="p-3 bg-white rounded-lg border border-blue-100">
                <div className="text-slate-400 text-[10px] uppercase font-bold">4. DESTINATION PLANT</div>
                <div className="font-bold text-slate-900 mt-1">{activeDest.plant}</div>
                <div className="text-amber-700 text-[10px] mt-1 font-semibold">{Math.ceil(cargoQuantity / 1350)} Last-Mile Trucks</div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => {
                if (requiredArrivalDate < todayStr) {
                  toast.error("Target arrival laycan date cannot be in the past.");
                  setRequiredArrivalDate(todayStr);
                  return;
                }
                const spec = VESSEL_SPECS[preferredVesselCategory];
                if (contractDuration === "1 voyage (Spot)" && cargoQuantity > spec.dwt) {
                  toast.error(`For Spot contract, cargo quantity (${cargoQuantity.toLocaleString()} MT) cannot exceed ${preferredVesselCategory} maximum capacity of ${spec.dwt.toLocaleString()} MT.`);
                  setCargoQuantity(spec.dwt);
                  return;
                }
                setStep(2);
              }}
              className="btn-primary px-8 h-12 text-sm font-bold gap-2"
            >
              <span>Proceed to AI Execution Recommendations (Plan 1/2/3)</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: AI EXECUTION RECOMMENDATIONS (PLAN 01, PLAN 02, PLAN 03) */}
      {/* ========================================================================= */}
      {step === 2 && (
        <div className="space-y-6 animate-in fade-in">
          {/* Header */}
          <div className="astra-card p-5 space-y-2 border-b border-slate-100">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Badge kind="OPTIMIZATION" />
                  <span className="text-[10px] font-mono font-bold text-blue-900 uppercase tracking-wider">
                    AI END-TO-END EXECUTION COMBINATIONS
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 mt-1" style={{ fontFamily: "Manrope" }}>
                  Step 2: AI Execution Recommendations (Plan 1 / 2 / 3)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Instead of recommending only a vessel operator, ASTRA combines <strong>Vessel + Origin Port + Destination Port + Contractor + Origin Warehouse + Best-Suited Destination Warehouse</strong> into ranked full-chain execution plans.
                </p>
              </div>
              <button onClick={() => setStep(1)} className="btn-secondary text-xs">
                <ArrowLeft size={14} /> Back to Setup & Specs
              </button>
            </div>
          </div>

          {/* Destination Warehouse Suitability Matrix */}
          <div className="astra-card p-5 space-y-3 bg-gradient-to-br from-slate-50 to-blue-50/40 border border-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
              <div>
                <div className="text-[10px] font-mono font-bold text-blue-900 uppercase">
                  DESTINATION HINTERLAND INTELLIGENCE · {destPort} PORT
                </div>
                <h3 className="text-base font-extrabold text-slate-900" style={{ fontFamily: "Manrope" }}>
                  Candidate Destination Warehouses & Suitability Ranking
                </h3>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-blue-100 text-blue-900">
                Top Suited: {candidateWarehousesList[0]?.code} ({candidateWarehousesList[0]?.score}% Score)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                    <th className="py-2 px-3">Warehouse / Plant</th>
                    <th className="py-2 px-3">Distance</th>
                    <th className="py-2 px-3">Transit Time</th>
                    <th className="py-2 px-3">Capacity Headroom</th>
                    <th className="py-2 px-3">Transport Mode</th>
                    <th className="py-2 px-3">Inland Rate</th>
                    <th className="py-2 px-3">Risk</th>
                    <th className="py-2 px-3 text-right">Suitability Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {candidateWarehousesList.map((wh, idx) => (
                    <tr 
                      key={wh.code}
                      className={idx === 0 ? "bg-emerald-50/60 font-semibold" : "hover:bg-slate-50/60"}
                    >
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${idx === 0 ? "bg-emerald-600" : "bg-slate-400"}`} />
                          <span className="font-bold text-slate-900">[{wh.code}] {wh.name}</span>
                          {idx === 0 && (
                            <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-bold">BEST FIT</span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">{wh.distanceKm} km</td>
                      <td className="py-2.5 px-3 text-slate-700">{wh.transitHours} hrs</td>
                      <td className="py-2.5 px-3 text-slate-700">{100 - wh.utilizationPct}% Available ({((wh.capacityTons * (100 - wh.utilizationPct)) / 100000).toFixed(0)}k MT)</td>
                      <td className="py-2.5 px-3 text-slate-600">{wh.mode}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">${wh.inlandFreightUsd.toFixed(2)}/t</td>
                      <td className="py-2.5 px-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${wh.risk === "LOW" ? "bg-emerald-100 text-emerald-800" : wh.risk === "MEDIUM" ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"}`}>
                          {wh.risk}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className={`font-extrabold text-sm ${idx === 0 ? "text-emerald-700" : "text-slate-800"}`}>
                          {wh.score}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between pt-1">
              <span>* Warehouse multi-criteria model evaluates distance, receiving throughput, cargo compatibility, and congestion risk.</span>
              <span className="font-bold text-blue-900">Feeds directly into Plan 01, Plan 02, and Plan 03 below ↓</span>
            </div>
          </div>

          {/* 3 Ranked AI Execution Plans */}
          <div className="space-y-4">
            {executionPlans.map((plan) => {
              const isSelected = selectedPlanId === plan.planId;
              const isDraftSafe = plan.vessel.draftM <= activeDest.maxDraft;
              const isLoaSafe = plan.vessel.loaM <= activeDest.maxLoa;

              return (
                <div
                  key={plan.planId}
                  onClick={() => setSelectedPlanId(plan.planId)}
                  className={`astra-card p-5 cursor-pointer transition-all border-2 relative ${
                    isSelected 
                      ? "border-blue-900 bg-blue-50/20 shadow-xl ring-2 ring-blue-900/30" 
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  {/* Top Status Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-3">
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded text-xs font-mono font-extrabold ${
                        plan.isRecommended ? "bg-blue-900 text-white" : "bg-slate-800 text-slate-200"
                      }`}>
                        {plan.label}
                      </span>
                      <span className="font-extrabold text-sm text-slate-900">{plan.tag}</span>
                      {plan.isRecommended && (
                        <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Award size={11} /> RANK #1 OPTIMAL COMBINATION
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 font-mono">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {plan.overallFeasibility} · Score {plan.feasibilityScore}%
                      </span>
                      <span className="text-xs font-extrabold text-blue-900">
                        {isSelected ? "● SELECTED PLAN" : "○ Click to Select"}
                      </span>
                    </div>
                  </div>

                  {/* Complete 3-Column Plan Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Col 1: Vessel & Contractor */}
                    <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 space-y-2.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-900 text-white grid place-items-center shrink-0">
                          <TopDownVesselIcon category={plan.vessel.category} size={22} />
                        </div>
                        <div>
                          <div className="text-[10px] uppercase font-mono font-bold text-slate-400">VESSEL & OPERATOR</div>
                          <div className="font-extrabold text-slate-900 text-sm">{plan.vessel.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{plan.contractor.name} ({plan.contractor.reliability})</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1">
                        <div>
                          <span className="text-slate-400 block text-[10px]">SPECS:</span>
                          <span className="font-bold text-slate-800">{plan.vessel.category} ({plan.vessel.dwt.toLocaleString()} DWT)</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">ENGINE & HEALTH:</span>
                          <span className="font-bold text-emerald-700">{plan.vessel.engineEfficiency} ({plan.vessel.ciiRating?.slice(0, 7)})</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">PORT DRAFT FIT:</span>
                          <span className={`font-bold ${isDraftSafe ? "text-emerald-700" : "text-red-600"}`}>
                            {plan.vessel.draftM}m vs {activeDest.maxDraft}m {isDraftSafe ? "✓ Safe" : "✕ Risk"}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">FLEET PARTNER:</span>
                          <span className="font-bold text-slate-800">{plan.contractor.roadTransporter}</span>
                        </div>
                      </div>
                    </div>

                    {/* Col 2: End-to-End Multimodal Route & Warehouse */}
                    <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 space-y-2.5">
                      <div className="text-[10px] uppercase font-mono font-bold text-slate-400">
                        END-TO-END SUPPLY CHAIN CORRIDOR
                      </div>
                      
                      <div className="space-y-1.5 text-xs font-mono">
                        <div className="flex items-start gap-2">
                          <span className="text-amber-600 font-bold">1. Origin:</span>
                          <span className="text-slate-800 font-semibold">{plan.originWarehouse} ➔ {plan.originPort} Port</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-blue-600 font-bold">2. Ocean:</span>
                          <span className="text-slate-800 font-semibold">{plan.originPort} ➔ {plan.destinationPort} Port ({plan.estimatedOceanTransitDays} days)</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-emerald-700 font-bold">3. Dest WH:</span>
                          <span className="text-slate-900 font-extrabold">[{plan.destinationWarehouse.code}] {plan.destinationWarehouse.name} ({plan.destinationWarehouse.distanceKm} km · {plan.destinationWarehouse.transitHours}h)</span>
                        </div>
                      </div>

                      <div className="p-2 bg-white rounded border border-slate-200 text-[11px] font-mono text-slate-600 flex justify-between">
                        <span>Dispatched Fleet:</span>
                        <span className="font-bold text-blue-900">{plan.firstMileTrucks} First-Mile + {plan.lastMileTrucks} Last-Mile Trucks</span>
                      </div>
                    </div>

                    {/* Col 3: Landed Cost & Risk Feasibility */}
                    <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 space-y-2.5">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-[10px] uppercase font-mono font-bold text-slate-400">TOTAL LANDED COST</div>
                          <div className="text-xl font-extrabold text-blue-900 font-mono">
                            ${(plan.totalLandedCostUsd).toLocaleString()}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            ${plan.landedCostPerTonUsd} / Metric Ton Landed
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] uppercase font-mono text-slate-400 block font-bold">AI SAVINGS</span>
                          <span className="text-sm font-extrabold text-emerald-700 font-mono">
                            +${plan.savingsUsd.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-1 pt-1 text-center font-mono text-[10px]">
                        <div className="p-1.5 rounded bg-white border border-slate-200">
                          <span className="text-slate-400 block">PORT WAIT</span>
                          <span className="font-bold text-slate-800">{plan.portWaitingHours}h</span>
                        </div>
                        <div className="p-1.5 rounded bg-white border border-slate-200">
                          <span className="text-slate-400 block">DEMURRAGE</span>
                          <span className={`font-bold ${plan.demurrageRisk === "LOW" ? "text-emerald-700" : "text-amber-700"}`}>{plan.demurrageRisk}</span>
                        </div>
                        <div className="p-1.5 rounded bg-white border border-slate-200">
                          <span className="text-slate-400 block">LOGISTICS</span>
                          <span className={`font-bold ${plan.logisticsRisk === "LOW" ? "text-emerald-700" : "text-amber-700"}`}>{plan.logisticsRisk}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Plan Advantage Reason */}
                  <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                    <span className="text-slate-600 font-mono">
                      💡 <strong>Execution Rationale:</strong> {plan.recommendationReason}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setSelectedPlanId(plan.planId); }}
                      className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all ${
                        isSelected 
                          ? "bg-blue-900 text-white shadow" 
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {isSelected ? "✓ Active Selected Plan" : "Select This Plan"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center pt-2">
            <button onClick={() => setStep(1)} className="btn-secondary">
              <ArrowLeft size={15} /> Back to Setup
            </button>
            <button
              onClick={() => setStep(3)}
              className="btn-primary px-8 h-12 text-sm font-bold gap-2"
            >
              <span>Proceed to AI Multi-Factor Analysis ({selectedPlan.label})</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: AI MULTI-FACTOR ANALYSIS (CLEAR, VISUAL & CHART-DRIVEN) */}
      {/* ========================================================================= */}
      {step === 3 && (
        <div className="space-y-6 animate-in fade-in">
          {/* Section Header */}
          <div className="astra-card p-5 space-y-2 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-blue-900 uppercase">STEP 3 OF 4: AI MULTI-FACTOR OPTIMIZATION</span>
                <h2 className="text-lg font-extrabold text-slate-900" style={{ fontFamily: "Manrope" }}>
                  AI Multi-Factor Route & Cost Optimization
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Comprehensive optimization analysis for <strong>{selectedContractor.name} ({selectedContractor.vessel.name})</strong> on corridor <strong>{originPort} ➔ {destPort}</strong>.
                </p>
              </div>
              <button onClick={() => setStep(2)} className="btn-secondary text-xs">
                <ArrowLeft size={14} /> Change Contractor
              </button>
            </div>
          </div>

          {/* 3 Core AI Optimization Pillar Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Pillar 1: Spot vs Future Freight Curve */}
            <div className="astra-card p-5 space-y-3 border-t-4 border-t-blue-900">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-blue-900 uppercase">PILLAR 1: FREIGHT RATE PREDICTION</span>
                <TrendingUp size={16} className="text-blue-900" />
              </div>
              <div className="font-mono">
                <div className="text-2xl font-extrabold text-slate-900">${selectedContractor.oceanFreightRatePerTon.toFixed(2)} / Ton</div>
                <div className="text-xs text-emerald-700 font-bold mt-0.5">Spot Price Timing Advantage: +$35,000 saved</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg text-xs font-mono space-y-1.5 text-slate-700">
                <div>• Current Spot Rate: <span className="font-bold text-slate-900">${selectedContractor.oceanFreightRatePerTon.toFixed(2)}/t</span></div>
                <div>• Forward 14-Day Curve: <span className="font-bold text-red-600">${(selectedContractor.oceanFreightRatePerTon + 0.50).toFixed(2)}/t (Upward Spike)</span></div>
                <div>• Recommendation: <span className="font-bold text-emerald-700">Lock Spot Rate Today</span></div>
              </div>
            </div>

            {/* Pillar 2: Port Waiting & Demurrage Shield */}
            <div className="astra-card p-5 space-y-3 border-t-4 border-t-amber-500">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-amber-700 uppercase">PILLAR 2: PORT ANCHORAGE & DEMURRAGE</span>
                <Anchor size={16} className="text-amber-500" />
              </div>
              <div className="font-mono">
                <div className="text-2xl font-extrabold text-slate-900">{activeDest.waitHours} Hours Queue</div>
                <div className="text-xs text-slate-500 mt-0.5">Historical anchorage queue at {destPort}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg text-xs font-mono space-y-1.5 text-slate-700">
                <div>• Terminal Assigned: <span className="font-bold text-slate-900">Mechanized Berth #2</span></div>
                <div>• Demurrage Rate: <span className="font-bold text-slate-900">${selectedContractor.demurragePerHourUsd} / hour</span></div>
                <div>• Delay Shield: <span className="font-bold text-emerald-700">JIT Truck & Crane Pre-booking</span></div>
              </div>
            </div>

            {/* Pillar 3: Total Landed Cost Optimization */}
            <div className="astra-card p-5 space-y-3 border-t-4 border-t-emerald-600">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase">PILLAR 3: TOTAL LANDED COST</span>
                <ShieldCheck size={16} className="text-emerald-600" />
              </div>
              <div className="font-mono">
                <div className="text-2xl font-extrabold text-emerald-700">${(selectedContractor.totalLandedCostUsd).toLocaleString()}</div>
                <div className="text-xs text-emerald-800 font-bold mt-0.5">Net Multimodal Savings: +${selectedContractor.savingsUsd.toLocaleString()}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg text-xs font-mono space-y-1.5 text-slate-700">
                <div>• Ocean Freight ({preferredVesselCategory}): <span className="font-bold">${(cargoQuantity * selectedContractor.oceanFreightRatePerTon).toLocaleString()}</span></div>
                <div>• Road Fleet ({selectedContractor.firstMileTrucks + selectedContractor.lastMileTrucks} Trucks): <span className="font-bold">${selectedContractor.roadFreightCostUsd.toLocaleString()}</span></div>
                <div>• Port Handling: <span className="font-bold">${selectedContractor.portHandlingCostUsd.toLocaleString()}</span></div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* VISUAL GRAPHS & INTERACTIVE CHARTS CONTAINER */}
          {/* ========================================================================= */}
          <div className="astra-card p-6 space-y-5 bg-white border-2 border-slate-200">
            {/* Visual Navigation Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <BarChart3 size={18} className="text-blue-900" />
                <h3 className="font-extrabold text-slate-900 text-base" style={{ fontFamily: "Manrope" }}>
                  Interactive AI Optimization Visualizations
                </h3>
              </div>

              <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-mono font-bold">
                <button
                  onClick={() => setAiChartTab("freight_curve")}
                  className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                    aiChartTab === "freight_curve" ? "bg-blue-900 text-white shadow" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <TrendingUp size={13} />
                  <span>14-Day Freight Curve</span>
                </button>

                <button
                  onClick={() => setAiChartTab("cost_breakdown")}
                  className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                    aiChartTab === "cost_breakdown" ? "bg-blue-900 text-white shadow" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <DollarSign size={13} />
                  <span>Cost vs Benchmark</span>
                </button>

                <button
                  onClick={() => setAiChartTab("port_queue")}
                  className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                    aiChartTab === "port_queue" ? "bg-blue-900 text-white shadow" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Anchor size={13} />
                  <span>Port Turnaround Stages</span>
                </button>

                <button
                  onClick={() => setAiChartTab("shap_factors")}
                  className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                    aiChartTab === "shap_factors" ? "bg-blue-900 text-white shadow" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Cpu size={13} />
                  <span>SHAP Feature Attribution</span>
                </button>
              </div>
            </div>

            {/* TAB 1: 14-DAY FREIGHT FORWARD CURVE & TIMING ADVANTAGE */}
            {aiChartTab === "freight_curve" && (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                  <div>
                    <span className="font-bold text-slate-900">Neural Freight Forward Curve (Newcastle ➔ {destPort}):</span>
                    <span className="text-slate-500 ml-2">Temporal Fusion Transformer + LightGBM (95% CI)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold">
                      <span className="w-3 h-0.5 bg-emerald-600 inline-block" /> Locked Spot Rate (${currentSpotRate.toFixed(2)}/t)
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-red-600 font-bold">
                      <span className="w-3 h-0.5 bg-red-600 inline-block" /> 14-Day Projected Spike
                    </span>
                  </div>
                </div>

                <div className="h-[280px] w-full bg-slate-50/50 p-2 rounded-xl border border-slate-100">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={freightCurveData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b" }} />
                      <YAxis domain={["auto", "auto"]} tick={{ fontSize: 10, fill: "#64748b" }} unit="$" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#0f172a", color: "#fff", borderRadius: "8px", fontSize: "11px", fontFamily: "monospace" }}
                        formatter={(val, name) => [`$${Number(val).toFixed(2)} / MT`, name]}
                      />
                      <Area type="monotone" dataKey="confidenceUpper" stroke="none" fill="#fecaca" fillOpacity={0.4} name="95% CI Upper" />
                      <Area type="monotone" dataKey="confidenceLower" stroke="none" fill="#fecaca" fillOpacity={0.4} name="95% CI Lower" />
                      <Line type="monotone" dataKey="actual" stroke="#1e3a8a" strokeWidth={2.5} dot={{ r: 3 }} name="Historical Spot" />
                      <Line type="monotone" dataKey="projected" stroke="#dc2626" strokeWidth={2.5} strokeDasharray="4 4" dot={{ r: 3 }} name="Projected Forward Spike" />
                      <Line type="monotone" dataKey="lockedSpot" stroke="#059669" strokeWidth={2} dot={false} name="Locked Spot Price" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>

                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs font-mono text-emerald-900 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-bold">
                    <TrendingUp size={15} className="text-emerald-700" /> Timing Recommendation: Lock Spot Rate Today
                  </span>
                  <span>Projected forward rise of +$0.50/t captures <strong>+${(cargoQuantity * 0.50).toLocaleString()} net cost avoidance</strong>.</span>
                </div>
              </div>
            )}

            {/* TAB 2: MULTIMODAL COST VS MARKET BENCHMARK */}
            {aiChartTab === "cost_breakdown" && (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                  <div>
                    <span className="font-bold text-slate-900">Multimodal Landed Cost Comparison (USD):</span>
                    <span className="text-slate-500 ml-2">Traditional Fragmented Booking vs ASTRA AI Multimodal Optimization</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                      Net Multimodal Savings: +${selectedContractor.savingsUsd.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-500 font-normal">
                      (Source: datasets/inland_multimodal_corridors.csv)
                    </span>
                  </div>
                </div>

                <div className="h-[280px] w-full bg-slate-50/50 p-2 rounded-xl border border-slate-100">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={costBreakdownData} margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="category" tick={{ fontSize: 10, fill: "#64748b" }} />
                      <YAxis tick={{ fontSize: 10, fill: "#64748b" }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                      <Tooltip 
                        content={({ active, payload, label }) => {
                          if (!active || !payload || !payload.length) return null;
                          const item = costBreakdownData.find(c => c.category === label);
                          const trad = payload.find(p => p.dataKey === "Traditional Booking")?.value || 0;
                          const astra = payload.find(p => p.dataKey === "ASTRA Multimodal AI")?.value || 0;
                          const saved = Math.max(0, trad - astra);
                          return (
                            <div className="bg-slate-950 text-white p-3 rounded-xl shadow-xl border border-slate-800 text-xs font-mono max-w-xs space-y-1.5 animate-in fade-in zoom-in-95 duration-150">
                              <div className="font-bold text-slate-200 border-b border-slate-800 pb-1 flex justify-between items-center">
                                <span>{label}</span>
                                <span className="text-[10px] text-emerald-400 font-normal">-$ {saved.toLocaleString()} Saved</span>
                              </div>
                              <div className="flex justify-between gap-4 text-slate-400">
                                <span>Traditional:</span>
                                <span className="text-slate-200 font-semibold">${Number(trad).toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between gap-4 text-emerald-400">
                                <span>ASTRA AI:</span>
                                <span className="font-bold text-emerald-300">${Number(astra).toLocaleString()}</span>
                              </div>
                              {item?.whyCheaper && (
                                <div className="text-[10px] text-slate-300 pt-1 border-t border-slate-800 leading-tight">
                                  💡 <span className="text-slate-400">Why cheaper:</span> {item.whyCheaper}
                                </div>
                              )}
                              <div className="text-[9px] text-slate-500 pt-0.5">
                                📁 Source: datasets/{item?.dataset}
                              </div>
                            </div>
                          );
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: "11px", fontFamily: "monospace" }} />
                      <Bar dataKey="Traditional Booking" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="ASTRA Multimodal AI" fill="#059669" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Interactive Explanatory Cards with Hover Effect */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-mono">
                  {costBreakdownData.slice(0, 4).map((c) => (
                    <div 
                      key={c.category}
                      onMouseEnter={() => setHoveredCostCategory(c.category)}
                      onMouseLeave={() => setHoveredCostCategory(null)}
                      className={`p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                        hoveredCostCategory === c.category
                          ? "bg-emerald-50/60 border-emerald-400 shadow-md -translate-y-1"
                          : "bg-slate-50 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-slate-500 text-[10px] uppercase font-bold">{c.category}</span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded">
                          Save ${c.savings.toLocaleString()}
                        </span>
                      </div>
                      <div className="font-extrabold text-slate-900 text-sm mt-1">
                        ${c["ASTRA Multimodal AI"].toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-600 mt-1 line-clamp-2">
                        {c.whyCheaper}
                      </div>
                      <div className="mt-2 pt-1 border-t border-slate-200/60 text-[9px] text-slate-400 flex items-center gap-1">
                        <span>📁</span>
                        <span className="truncate">{c.dataset}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Demurrage Risk Shield Highlight Box */}
                <div className="p-3 bg-emerald-50/80 rounded-lg border border-emerald-200 text-xs font-mono text-emerald-950 flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={18} className="text-emerald-700 shrink-0" />
                    <div>
                      <span className="font-bold">Demurrage Risk Protected ($0 Charge):</span>
                      <span className="text-slate-600 ml-1">
                        Traditional chartering risks <strong>${Math.round(selectedContractor.demurragePerHourUsd * (activeDest.waitHours || 12) * 0.8).toLocaleString()}</strong> in port waiting fees.
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-700 text-white text-[10px] font-bold self-start md:self-auto">
                    JIT Siding Alignment Active
                  </span>
                </div>
              </div>
            )}

            {/* TAB 3: PORT TURNAROUND STAGES & DEMURRAGE SHIELD */}
            {aiChartTab === "port_queue" && (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                  <div>
                    <span className="font-bold text-slate-900">Port Turnaround Pipeline & Queue Breakdown ({destPort} Port):</span>
                    <span className="text-slate-500 ml-2">Total Estimated Turnaround: <strong>{totalPortHours} Hours</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                      Historical Wait Queue: {activeDest.waitHours}h
                    </span>
                    <span className="text-[10px] text-slate-500 font-normal">
                      (Source: datasets/east_coast_india_port_telemetry.csv)
                    </span>
                  </div>
                </div>

                <div className="h-[280px] w-full bg-slate-50/50 p-2 rounded-xl border border-slate-100">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={portQueueStages} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis type="number" tick={{ fontSize: 10, fill: "#64748b" }} unit="h" />
                      <YAxis dataKey="stage" type="category" tick={{ fontSize: 10, fill: "#64748b" }} width={140} />
                      <Tooltip 
                        content={({ active, payload, label }) => {
                          if (!active || !payload || !payload.length) return null;
                          const stage = portQueueStages.find(s => s.stage === label);
                          return (
                            <div className="bg-slate-950 text-white p-3 rounded-xl shadow-xl border border-slate-800 text-xs font-mono max-w-xs space-y-1.5 animate-in fade-in zoom-in-95 duration-150">
                              <div className="font-bold text-slate-200 border-b border-slate-800 pb-1 flex justify-between items-center">
                                <span>{label}</span>
                                <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                                  stage?.type === "Waiting" ? "bg-amber-900/60 text-amber-300" :
                                  stage?.type === "Operations" ? "bg-blue-900/60 text-blue-300" : "bg-emerald-900/60 text-emerald-300"
                                }`}>
                                  {stage?.hours} Hours
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-300 leading-tight">
                                {stage?.desc}
                              </div>
                              <div className="text-[10px] text-amber-300 pt-1 border-t border-slate-800">
                                🎯 <span className="text-slate-400">Company impact:</span> {stage?.whyItMatters}
                              </div>
                              <div className="text-[9px] text-slate-500 pt-0.5">
                                📁 Source: datasets/{stage?.dataset}
                              </div>
                            </div>
                          );
                        }}
                      />
                      <Bar dataKey="hours" radius={[0, 4, 4, 0]}>
                        {portQueueStages.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.type === "Waiting" ? "#f59e0b" : entry.type === "Operations" ? "#1e3a8a" : "#059669"} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Interactive 5-Stage Step Breakdown with Hover Zoom */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-xs font-mono">
                  {portQueueStages.map((s, idx) => (
                    <div
                      key={s.stage}
                      onMouseEnter={() => setHoveredPortStage(s.stage)}
                      onMouseLeave={() => setHoveredPortStage(null)}
                      className={`p-2.5 rounded-lg border transition-all duration-200 cursor-pointer ${
                        hoveredPortStage === s.stage
                          ? s.type === "Waiting"
                            ? "bg-amber-50 border-amber-400 shadow-md -translate-y-1"
                            : s.type === "Operations"
                            ? "bg-blue-50 border-blue-400 shadow-md -translate-y-1"
                            : "bg-emerald-50 border-emerald-400 shadow-md -translate-y-1"
                          : "bg-slate-50 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-400">Stage {idx + 1}</span>
                        <span className={`px-1 py-0.2 rounded text-[9px] font-bold ${
                          s.type === "Waiting" ? "bg-amber-100 text-amber-800" :
                          s.type === "Operations" ? "bg-blue-100 text-blue-800" : "bg-emerald-100 text-emerald-800"
                        }`}>
                          {s.status}
                        </span>
                      </div>
                      <div className="font-bold text-slate-900 mt-1 truncate" title={s.stage}>
                        {s.stage}
                      </div>
                      <div className="text-sm font-extrabold text-slate-800 mt-0.5">
                        {s.hours}h <span className="text-[10px] text-slate-400 font-normal">({Math.round((s.hours / Number(totalPortHours)) * 100)}%)</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1 line-clamp-2" title={s.whyItMatters}>
                        {s.whyItMatters}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-xs font-mono text-blue-950 flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-blue-900 shrink-0" />
                    <span>
                      Mechanized Berth #2 Allocated: Discharge rate: <strong>2,800 MT/hr</strong> with automated conveyor to waiting road truck fleet.
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded self-start md:self-auto">
                    Formula: {cargoQuantity.toLocaleString()} MT ÷ 2,800 MT/hr = {dischargeHours}h
                  </span>
                </div>
              </div>
            )}

            {/* TAB 4: SHAP ATTRIBUTION FACTORS */}
            {aiChartTab === "shap_factors" && (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                  <div>
                    <span className="font-bold text-slate-900">SHAP Feature Importance & Attribution Matrix:</span>
                    <span className="text-slate-500 ml-2">Explains key drivers of the AI optimization decision</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-blue-900 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      Model Accuracy: 94.6% (180-Day Backtested)
                    </span>
                    <span className="text-[10px] text-slate-500 font-normal">
                      (Source: datasets/baltic_dry_freight_historical.csv)
                    </span>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  {shapFeatures.map((f) => {
                    const isHovered = hoveredShapFactor === f.factor;
                    return (
                      <div 
                        key={f.factor}
                        onMouseEnter={() => setHoveredShapFactor(f.factor)}
                        onMouseLeave={() => setHoveredShapFactor(null)}
                        className={`p-3 rounded-lg border transition-all duration-200 cursor-pointer text-xs font-mono space-y-1.5 ${
                          isHovered 
                            ? "bg-blue-50/70 border-blue-400 shadow-md -translate-y-0.5" 
                            : "bg-slate-50 border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{f.factor}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200/80 text-slate-600 font-semibold">
                              {f.impact}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] text-slate-500 hidden sm:inline">{f.trend}</span>
                            <span className="font-extrabold text-blue-900 text-sm">{f.weight}%</span>
                          </div>
                        </div>

                        {/* Animated Progress Bar */}
                        <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-300 ${
                              isHovered 
                                ? "bg-gradient-to-r from-blue-700 to-indigo-500 shadow-sm" 
                                : "bg-blue-900"
                            }`} 
                            style={{ width: `${f.weight * 2.5}%` }}
                          />
                        </div>

                        {/* Company Meaning and Dataset Source */}
                        <div className="flex flex-wrap items-center justify-between text-[11px] pt-1 border-t border-slate-200/50 gap-1">
                          <span className="text-slate-600">
                            💡 <strong className="text-slate-800">Company Impact:</strong> {f.companyExplanation}
                          </span>
                          <span className="text-[9px] text-slate-400 shrink-0">
                            📁 datasets/{f.dataset} ➔ [{f.column}]
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Procurement Strategic Takeaway Box */}
                <div className="p-3 bg-slate-900 text-white rounded-lg border border-slate-800 text-xs font-mono flex items-start gap-3">
                  <Sparkles size={16} className="text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-300">Executive Procurement Takeaway:</span>
                    <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                      57.7% of the freight price pressure is driven by macro shipping market forces (Baltic Dry Index + Fuel).
                      Locking today's contracted spot rate protects your company from the projected +$0.50/t forward spike, securing <strong>+$35,000 net cost avoidance</strong> for your 70,000 MT bulk cargo shipment.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-2">
            <button onClick={() => setStep(2)} className="btn-secondary">
              <ArrowLeft size={15} /> Back / Choose Different Contractor
            </button>
            <button
              onClick={() => setStep(4)}
              className="btn-primary px-8 h-12 text-sm font-bold gap-2"
            >
              <span>Accept AI Optimization & Proceed to Confirm</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 4: CONFIRMATION & DIGITAL CONTRACT DISPATCH */}
      {/* ========================================================================= */}
      {step === 4 && (
        <div className="astra-card p-6 space-y-6 animate-in fade-in">
          <div className="border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <FileCheck size={20} className="text-blue-900" />
              <h2 className="text-lg font-extrabold text-slate-900" style={{ fontFamily: "Manrope" }}>
                Step 4: Digital Smart Fixture Contract Confirmation
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Review finalized parameters. Dispatching will notify Ocean Contractor and Road Transporter, save to history, and initiate the live simulation.
            </p>
          </div>

          {/* Visual Digital Fixture Card */}
          <div className="border-2 border-slate-200 rounded-xl p-5 bg-slate-50/50 space-y-4 font-mono text-xs">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">FIXTURE IDENTIFIER</span>
                <div className="text-sm font-extrabold text-slate-900">ASTRA-MULTIMODAL-2026-FIXTURE</div>
              </div>
              <span className="px-3 py-1 rounded bg-emerald-100 text-emerald-900 font-bold text-xs">
                VERIFIED & READY TO EXECUTE
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div>• Shipper: <span className="font-bold text-slate-900">Tata Steel Logistics (Company)</span></div>
                <div>• Ocean Carrier: <span className="font-bold text-blue-900">{selectedContractor.name} ({selectedContractor.vessel.name})</span></div>
                <div>• Road Transporter: <span className="font-bold text-amber-700">{selectedContractor.roadTransporter} ({selectedContractor.firstMileTrucks + selectedContractor.lastMileTrucks} Trucks)</span></div>
                <div>• Cargo: <span className="font-bold text-slate-900">{cargoQuantity.toLocaleString()} MT {cargoType}</span></div>
                <div>• Vessel Class: <span className="font-bold text-slate-900">{preferredVesselCategory} (Beam: {currentSpec.beam}m, LOA: {currentSpec.loa}m, Draft: {currentSpec.draft}m)</span></div>
              </div>

              <div className="space-y-1.5">
                <div>• Route: <span className="font-bold text-slate-900">{activeOrigin.port} ({activeOrigin.country}) ➔ {destPort} Port</span></div>
                <div>• Laycan Date: <span className="font-bold text-slate-900">{requiredArrivalDate} ({contractDuration})</span></div>
                <div>• Hinterland Siding: <span className="font-bold text-slate-900">{activeOrigin.warehouse}</span></div>
                <div>• Destination Plant: <span className="font-bold text-slate-900">{activeDest.plant}</span></div>
                <div>• Total Landed Cost: <span className="font-bold text-emerald-700">${selectedContractor.totalLandedCostUsd.toLocaleString()} USD</span></div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <button onClick={() => setStep(3)} className="btn-secondary">
              <ArrowLeft size={15} /> Back
            </button>
            <button
              onClick={handleConfirmAndDispatch}
              className="btn-primary px-10 h-12 text-sm font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-lg"
            >
              <CheckCircle2 size={18} />
              <span>Confirm, Accept & Launch Live Simulation</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
