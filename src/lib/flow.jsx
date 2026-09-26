import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import api from "./api";

const FlowContext = createContext(null);

export const DEFAULT_REQUIREMENT = {
  id: "ASTRA-REQ-001",
  planId: "PLAN-01",
  cargoType: "Thermal Coal",
  cargoQuantity: 70000,
  originWarehouse: "Hunter Valley Mine Siding, NSW",
  originPort: "Newcastle",
  destinationPort: "Paradip",
  destinationWarehouse: "Angul Integrated Steel Complex",
  destinationWarehouseCode: "WH-07",
  preferredVesselCategory: "Panamax",
  requiredArrivalDate: "2026-09-14",
  contractDuration: "1 voyage (Spot)",
  expectedVoyages: 1,
  budgetPreference: "Balanced",
  riskTolerance: "Low (Avoid high-wait berths)",
  selectedContractor: "Tata NYK Shipping",
  contractorAccepted: true,
  acceptanceDate: "2026-08-29T10:30:00Z",
  selectedVessel: {
    name: "MV Bengal Voyager",
    dwt: 74000,
    category: "Panamax",
    draftM: 13.8,
    loaM: 225,
    beamM: 32.2,
    healthScore: 96.8,
    engineEfficiency: "98.2%",
    ciiRating: "Grade A (Eco-Bulker)",
    age: "4.5 Years",
    rightShipRating: 5,
    dailyFuelBurn: "31.8 MT/day",
    captain: "Capt. Arvind Sharma"
  },
  roadFleet: {
    firstMileTrucks: 48,
    lastMileTrucks: 52,
    transporterName: "Intermodal Road Express",
    truckType: "40T Multi-Axle Tipping Trailers"
  },
  costBreakdown: {
    oceanFreightRatePerTon: 16.90,
    oceanFreightTotalUsd: 1183000,
    firstMileCostUsd: 62400,
    roadTransportUsd: 94000,
    portHandlingUsd: 42000,
    totalLandedCostUsd: 1319000,
    netSavingsUsd: 62400
  },
  warehouseSuitability: {
    code: "WH-07",
    name: "Angul Integrated Steel Complex",
    distanceKm: 82,
    transitHours: 3.1,
    utilizationPct: 68,
    suitabilityScore: 98,
    rating: "EXCELLENT"
  },
  status: "ACTIVE_IN_TRANSIT"
};

export const SINGAPORE_DHAMRA_REQUIREMENT = {
  id: "REQ-2026-8820",
  companyName: "Tata Steel Logistics (Shipper)",
  companyCode: "TATA",
  planId: "PLAN-02",
  cargoType: "Imported Metallurgical Coal",
  cargoQuantity: 70000,
  originWarehouse: "Jurong Island Terminal Silos",
  originPort: "Singapore",
  destinationPort: "Dhamra",
  destinationWarehouse: "Dhamra Bulk Storage Complex (WH-02)",
  destinationWarehouseCode: "WH-02",
  preferredVesselCategory: "Panamax",
  requiredArrivalDate: "2026-09-18",
  contractDuration: "1 voyage (Spot)",
  expectedVoyages: 1,
  budgetPreference: "Fastest Transit",
  riskTolerance: "Low",
  selectedContractor: "Tata NYK Shipping",
  contractorAccepted: true,
  acceptanceDate: "2026-08-30T10:00:00Z",
  selectedVessel: {
    name: "MV Asian Express",
    dwt: 75000,
    category: "Panamax",
    draftM: 13.5,
    loaM: 225,
    beamM: 32.2,
    healthScore: 97.4,
    engineEfficiency: "98.5%",
    ciiRating: "Grade A",
    age: "3.5 Years",
    rightShipRating: 5,
    dailyFuelBurn: "29.5 MT/day",
    captain: "Capt. K. Mohan"
  },
  roadFleet: {
    firstMileTrucks: 42,
    lastMileTrucks: 48,
    transporterName: "Intermodal Road Express",
    truckType: "40T Multi-Axle Tipping Trailers"
  },
  costBreakdown: {
    oceanFreightRatePerTon: 11.40,
    oceanFreightTotalUsd: 798000,
    firstMileCostUsd: 45000,
    roadTransportUsd: 65000,
    portHandlingUsd: 32000,
    totalLandedCostUsd: 940000,
    netSavingsUsd: 58000
  },
  warehouseSuitability: {
    code: "WH-02",
    name: "Dhamra Bulk Storage Complex",
    distanceKm: 45,
    transitHours: 1.8,
    utilizationPct: 62,
    suitabilityScore: 99,
    rating: "EXCELLENT"
  },
  status: "ACTIVE_IN_TRANSIT"
};

export const INITIAL_FIXTURES = [
  SINGAPORE_DHAMRA_REQUIREMENT,
  DEFAULT_REQUIREMENT,
  {
    id: "REQ-2026-8794",
    cargoType: "Coking Coal",
    cargoQuantity: 55000,
    originWarehouse: "Queensland Bowen Basin Siding",
    originPort: "Hay Point",
    destinationPort: "Visakhapatnam",
    destinationWarehouse: "Vizag Steel & Energy Plant",
    preferredVesselCategory: "Supramax",
    requiredArrivalDate: "2026-08-15",
    contractDuration: "1 voyage (Spot)",
    expectedVoyages: 1,
    selectedContractor: "JSW Shipping Ltd",
    contractorAccepted: true,
    acceptanceDate: "2026-08-01T08:00:00Z",
    selectedVessel: {
      name: "MV Coastal Pride",
      dwt: 58000,
      category: "Supramax",
      draftM: 12.2,
      loaM: 190,
      beamM: 32.2,
      healthScore: 91.2,
      engineEfficiency: "92.0%",
      ciiRating: "Grade B",
      age: "8.0 Years",
      rightShipRating: 4
    },
    roadFleet: {
      firstMileTrucks: 38,
      lastMileTrucks: 42,
      transporterName: "Eastern Coastal Fleet"
    },
    costBreakdown: {
      oceanFreightRatePerTon: 18.40,
      oceanFreightTotalUsd: 1012000,
      roadTransportUsd: 82000,
      portHandlingUsd: 38000,
      totalLandedCostUsd: 1132000,
      netSavingsUsd: 28000
    },
    status: "COMPLETED"
  }
];

export const INITIAL_COMPANY_REQUIREMENTS = [
  {
    id: "REQ-2026-8820",
    companyName: "Tata Steel Logistics (Shipper)",
    companyCode: "TATA",
    cargoType: "Imported Metallurgical Coal",
    cargoQuantity: 70000,
    originWarehouse: "Jurong Island Terminal Silos",
    originPort: "Singapore",
    destinationPort: "Dhamra",
    destinationWarehouse: "Dhamra Bulk Storage Complex (WH-02)",
    preferredVesselCategory: "Panamax",
    maxDraftM: 14.5,
    maxLoaM: 229,
    maxBeamM: 32.5,
    requiredArrivalDate: "2026-09-18",
    targetFreightRatePerTon: 11.40,
    status: "ACCEPTED",
    contractorAccepted: true,
    createdAt: "10 mins ago",
    assignedVessel: {
      name: "MV Asian Express",
      category: "Panamax",
      dwt: 75000,
      draftM: 13.5,
      laycan: "Sep 15–Sep 18"
    },
    contractorNote: "Direct deep-water fairway via Malacca Strait & Ten Degree Channel to Dhamra.",
    rejectionReason: null,
    recommendedSolution: null,
    creditRating: "AAA",
    stowageFactor: "44 cu ft/MT",
    contactPerson: "Arunabha Sengupta (Chartering Lead)"
  },
  {
    id: "ASTRA-REQ-001",
    companyName: "Jindal Steel & Power Ltd (JSPL)",
    companyCode: "JSPL",
    cargoType: "Thermal Coal (High GCV)",
    cargoQuantity: 70000,
    originWarehouse: "Hunter Valley Mine Siding, NSW",
    originPort: "Newcastle",
    destinationPort: "Paradip",
    destinationWarehouse: "Angul Integrated Steel Complex (WH-07)",
    preferredVesselCategory: "Panamax",
    maxDraftM: 14.0,
    maxLoaM: 229,
    maxBeamM: 32.5,
    requiredArrivalDate: "2026-09-14",
    targetFreightRatePerTon: 16.90,
    status: "PENDING_REVIEW",
    createdAt: "15 mins ago",
    assignedVessel: null,
    contractorNote: null,
    rejectionReason: null,
    recommendedSolution: null,
    creditRating: "AAA",
    stowageFactor: "44 cu ft/MT",
    contactPerson: "Rajesh Varma (VP Logistics)"
  },
  {
    id: "REQ-2026-9102",
    companyName: "Tata Steel Kalinganagar",
    companyCode: "TATA",
    cargoType: "Hard Coking Coal (Peak Low Vol)",
    cargoQuantity: 75000,
    originWarehouse: "Queensland Bowen Basin Siding",
    originPort: "Hay Point",
    destinationPort: "Paradip",
    destinationWarehouse: "Kalinganagar Bulk Siding (WH-04)",
    preferredVesselCategory: "Panamax",
    maxDraftM: 14.5,
    maxLoaM: 230,
    maxBeamM: 32.5,
    requiredArrivalDate: "2026-09-19",
    targetFreightRatePerTon: 17.40,
    status: "PENDING_REVIEW",
    createdAt: "35 mins ago",
    assignedVessel: null,
    contractorNote: null,
    rejectionReason: null,
    recommendedSolution: null,
    creditRating: "AAA",
    stowageFactor: "46 cu ft/MT",
    contactPerson: "Arunabha Sengupta (Chartering Lead)"
  },
  {
    id: "REQ-2026-9103",
    companyName: "NMDC Mineral Logistics",
    companyCode: "NMDC",
    cargoType: "High-Grade Iron Ore Pellets (65% Fe)",
    cargoQuantity: 120000,
    originWarehouse: "Bailadila Iron Ore Complex",
    originPort: "Visakhapatnam Outer Harbor",
    destinationPort: "Haldia / Paradip",
    destinationWarehouse: "Eastern Coastal Steel Works",
    preferredVesselCategory: "Capesize",
    maxDraftM: 16.5,
    maxLoaM: 280,
    maxBeamM: 45.0,
    requiredArrivalDate: "2026-09-24",
    targetFreightRatePerTon: 12.80,
    status: "PENDING_REVIEW",
    createdAt: "1 hour ago",
    assignedVessel: null,
    contractorNote: null,
    rejectionReason: null,
    recommendedSolution: null,
    creditRating: "A1+",
    stowageFactor: "22 cu ft/MT (Dense Heavy Bulk)",
    contactPerson: "S. K. Murthy (Director Logistics)"
  },
  {
    id: "REQ-2026-9104",
    companyName: "Vedanta Aluminium & Power",
    companyCode: "VEDANTA",
    cargoType: "Metallurgical Alumina & Calcined Coke",
    cargoQuantity: 45000,
    originWarehouse: "Lanjigarh Alumina Refinery",
    originPort: "Dhamra Port Bulk Berth",
    destinationPort: "Visakhapatnam",
    destinationWarehouse: "Jharsuguda Smelter Complex",
    preferredVesselCategory: "Supramax",
    maxDraftM: 12.0,
    maxLoaM: 190,
    maxBeamM: 32.2,
    requiredArrivalDate: "2026-09-26",
    targetFreightRatePerTon: 15.20,
    status: "WAIT_SHIPBUILDER",
    createdAt: "2 hours ago",
    assignedVessel: null,
    contractorNote: "Verifying drydock clearance with Cochin Shipyard for geared Supramax.",
    rejectionReason: null,
    recommendedSolution: null,
    creditRating: "AA+",
    stowageFactor: "38 cu ft/MT",
    contactPerson: "Pooja Chhabra (Materials Manager)"
  },
  {
    id: "REQ-2026-9105",
    companyName: "SAIL (Steel Authority of India)",
    companyCode: "SAIL",
    cargoType: "Prime Coking Coal",
    cargoQuantity: 68000,
    originWarehouse: "Gladstone Terminal Silos",
    originPort: "Gladstone",
    destinationPort: "Visakhapatnam Outer Harbor",
    destinationWarehouse: "Rourkela Steel Plant via Vizag",
    preferredVesselCategory: "Panamax",
    maxDraftM: 14.2,
    maxLoaM: 225,
    maxBeamM: 32.2,
    requiredArrivalDate: "2026-09-30",
    targetFreightRatePerTon: 16.60,
    status: "ACCEPTED",
    createdAt: "3 hours ago",
    assignedVessel: {
      name: "MV Jag Radha",
      category: "Panamax",
      dwt: 76500,
      draftM: 13.9,
      laycan: "Sep 28–Oct 02"
    },
    contractorNote: "Vessel allocated from ballast fleet. Laycan confirmed.",
    rejectionReason: null,
    recommendedSolution: null,
    creditRating: "Govt Enterprise / AAA",
    stowageFactor: "45 cu ft/MT",
    contactPerson: "Dr. K. Rath (GM Commercial Shipping)"
  }
];

export function FlowProvider({ children }) {
  // Check if page is freshly reloaded
  const isPageReload = (() => {
    try {
      const navEntries = typeof performance !== "undefined" && performance.getEntriesByType ? performance.getEntriesByType("navigation") : [];
      if (navEntries.length > 0) return navEntries[0].type === "reload";
      return typeof performance !== "undefined" && performance.navigation ? performance.navigation.type === 1 : false;
    } catch (e) {
      return false;
    }
  })();

  // simActive: true only within current active session after contractor accepts.
  // On reload/refresh, always resets to false.
  const [simActive, setSimActiveState] = useState(() => {
    if (isPageReload) {
      try { sessionStorage.removeItem("astra_sim_active"); } catch (e) {}
      return false;
    }
    try { return sessionStorage.getItem("astra_sim_active") === "true"; } catch (e) { return false; }
  });

  const setSimActive = (val) => {
    setSimActiveState(val);
    try { 
      if (val) sessionStorage.setItem("astra_sim_active", "true");
      else sessionStorage.removeItem("astra_sim_active");
    } catch (e) {}
  };

  // Requirement initializes as null on refresh/reload so that dashboard shows only the map with no routes.
  const [requirement, setRequirementState] = useState(() => {
    if (isPageReload) {
      try {
        sessionStorage.removeItem("astra_sim_active");
        localStorage.removeItem("astra_requirement");
      } catch (e) {}
      return null;
    }
    try {
      const saved = localStorage.getItem("astra_requirement");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.status === "COMPLETED") return null;
        return parsed;
      }
    } catch (e) {}
    return null;
  });

  // Fixtures ledger initialized from localStorage or defaults, ensuring completed fixtures persist in history
  const [fixturesList, setFixturesListState] = useState(() => {
    try {
      const saved = localStorage.getItem("astra_fixtures_list");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_FIXTURES;
  });

  const setFixturesList = (updater) => {
    setFixturesListState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      try {
        localStorage.setItem("astra_fixtures_list", JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  // Multi-modal Supply Chain Relay State (Vessel Port Arrival ➔ Gate QR Scan ➔ Truck Delivery)
  const [vesselArrivedAtPort, setVesselArrivedAtPort] = useState(false);
  const [waitingForTruckGateScan, setWaitingForTruckGateScan] = useState(false);
  const [gateCleared, setGateCleared] = useState(false);

  // Scan QR gate pass action: sets gateCleared to true, notifies server, raises boom barrier
  const scanGatePass = async (plate = "OD-05-AX-4821", gatePassId = "GP-TATA-8801") => {
    setGateCleared(true);
    setWaitingForTruckGateScan(false);
    toast.success(`✅ QR Gate Pass Verified: ${plate}! Boom barrier raised. Cargo discharge to truck initiated.`);

    try {
      await api.post('/supply-chain/gate-scan', { plate, gatePassId });
    } catch (e) {}

    try {
      const bc = new BroadcastChannel("astra_supply_chain");
      bc.postMessage({ type: "GATE_CLEARED", plate, gatePassId });
      bc.close();
    } catch (e) {}
  };

  // Multi-laptop real-time synchronization poller
  useEffect(() => {
    let isMounted = true;
    const syncState = async () => {
      try {
        const res = await api.get('/supply-chain/state');
        const s = res.data;
        if (!s || !isMounted) return;

        // If requirement updated on server (e.g. booked on laptop 1, accepted on laptop 2)
        if (s.requirement) {
          setRequirementState(prev => {
            if (!prev || prev.id !== s.requirement.id || prev.status !== s.requirement.status || prev.contractorAccepted !== s.requirement.contractorAccepted) {
              return s.requirement;
            }
            return prev;
          });
          if (s.simActive) {
            setSimActiveState(true);
          }
        }

        if (s.vesselArrivedAtPort !== undefined) {
          setVesselArrivedAtPort(s.vesselArrivedAtPort);
        }
        if (s.gateCleared !== undefined) {
          setGateCleared(s.gateCleared);
        }
        if (s.waitingForTruckGateScan !== undefined) {
          setWaitingForTruckGateScan(s.waitingForTruckGateScan && !s.gateCleared);
        }

        // Client-side simulation drives progress smoothly; avoid server polling jitter
      } catch (err) {}
    };

    syncState();
    const interval = setInterval(syncState, 800);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // BroadcastChannel for instant 0ms sync across tabs on same machine
  useEffect(() => {
    let bc;
    try {
      bc = new BroadcastChannel("astra_supply_chain");
      bc.onmessage = (ev) => {
        const msg = ev.data;
        if (!msg) return;
        if (msg.type === "CONTRACTOR_ACCEPTED") {
          setRequirementState(msg.requirement);
          setSimActiveState(true);
          setSimProgress(0);
          setIsPlaying(true);
          setVesselArrivedAtPort(false);
          setWaitingForTruckGateScan(false);
          setGateCleared(false);
        } else if (msg.type === "VESSEL_ARRIVED") {
          setVesselArrivedAtPort(true);
          setWaitingForTruckGateScan(true);
        } else if (msg.type === "GATE_CLEARED") {
          setGateCleared(true);
          setWaitingForTruckGateScan(false);
        }
      };
    } catch (e) {}
    return () => {
      try { bc && bc.close(); } catch (e) {}
    };
  }, []);

  // Central company requirements for Contractor Confirmation Dashboard
  const [companyRequirements, setCompanyRequirements] = useState(INITIAL_COMPANY_REQUIREMENTS);

  // Shipbuilder & Fleet Readiness
  const [shipbuilderHulls, setShipbuilderHulls] = useState([
    { name: "MV Bengal Voyager", category: "Panamax", dwt: "74,000 DWT", location: "Newcastle / Paradip", status: "READY_NOW", condition: "Survey Class A1", color: "text-emerald-400" },
    { name: "MV Jag Radha", category: "Panamax", dwt: "76,500 DWT", location: "Singapore Ballast", status: "BALLAST_TRANSIT", condition: "ETA 3 Days (Hull Certified)", color: "text-blue-400" },
    { name: "MV Coastal Pride", category: "Supramax", dwt: "58,000 DWT", location: "Visakhapatnam Harbor", status: "READY_NOW", condition: "Cranes 4x30T Active", color: "text-emerald-400" },
    { name: "MV Vishva Nidhi", category: "Capesize", dwt: "180,000 DWT", location: "Cochin Shipyard Drydock", status: "DRYDOCK_CHECK", condition: "Release in 5 Days", color: "text-amber-400" },
    { name: "MV Chennai Express", category: "Handysize", dwt: "35,000 DWT", location: "Chennai Anchorage", status: "READY_NOW", condition: "Coastal Shallow Draft", color: "text-emerald-400" }
  ]);

  const pingShipbuilderDesk = () => {
    // Proactive simulated update of shipyard telemetry
    setShipbuilderHulls(prev => prev.map(h => {
      if (h.name === "MV Vishva Nidhi") {
        return { ...h, condition: "Hull survey complete · Available in 48h" };
      }
      return h;
    }));
    toast.success("📡 Cochin Shipyard & L&T Kattupalli Telemetry Synced: 4 hulls ready, 1 in survey clearance.");
  };

  const setRequirement = (req) => {
    setRequirementState(req);
    try {
      if (req) {
        localStorage.setItem("astra_requirement", JSON.stringify(req));
      } else {
        localStorage.removeItem("astra_requirement");
      }
    } catch (e) {}

    if (req) {
      setFixturesList((prev) => {
        const filtered = prev.filter(p => p.id !== req.id);
        return [req, ...filtered];
      });

      setCompanyRequirements((prev) => {
        const existing = prev.find(p => p.id === req.id);
        if (existing) {
          return prev.map(p => p.id === req.id ? { ...p, ...req } : p);
        }
        const newEntry = {
          id: req.id,
          companyName: req.companyName || "Tata Steel Logistics (Shipper)",
          companyCode: req.companyCode || "TATA",
          cargoType: req.cargoType || "Thermal Coal",
          cargoQuantity: req.cargoQuantity || 70000,
          originWarehouse: req.originWarehouse || "Jurong Logistics Hub",
          originPort: req.originPort || "Singapore",
          destinationPort: req.destinationPort || "Dhamra",
          destinationWarehouse: req.destinationWarehouse || "Dhamra Storage Complex",
          preferredVesselCategory: req.preferredVesselCategory || "Panamax",
          maxDraftM: 14.0,
          requiredArrivalDate: req.requiredArrivalDate || "2026-09-18",
          targetFreightRatePerTon: req.costBreakdown?.oceanFreightRatePerTon || 11.40,
          status: req.status === "ACTIVE_IN_TRANSIT" ? "ACCEPTED" : (req.status || "PENDING_REVIEW"),
          contractorAccepted: Boolean(req.contractorAccepted),
          createdAt: "Just now",
          assignedVessel: req.selectedVessel,
          isNewlyCreated: true
        };
        return [newEntry, ...prev];
      });
    }
  };

  const updateContractorDecision = (reqId, decision) => {
    setCompanyRequirements(prev => prev.map(item => {
      if (item.id === reqId) {
        return {
          ...item,
          ...decision,
          updatedAt: "Just now"
        };
      }
      return item;
    }));

    const target = companyRequirements.find(r => r.id === reqId);
    const company = target?.companyName || "Company";

    if (decision.status === "ACCEPTED") {
      addEvent({
        type: "CONTRACTOR_ACCEPTED",
        severity: "SUCCESS",
        title: `✅ Tata NYK Accepted Fixture: ${company} (${reqId})`,
        detail: `Vessel ${decision.assignedVessel?.name || "Assigned"} confirmed. Laycan active. ${decision.contractorNote || ""}`,
        requirementId: reqId,
        roleRecipient: ["company", "contractor"]
      });
      toast.success(`✅ Fixture Confirmed for ${company}! Vessel ${decision.assignedVessel?.name} allocated.`);

      const baseReq = (requirement && requirement.id === reqId)
        ? requirement
        : (companyRequirements.find(r => r.id === reqId) || fixturesList.find(f => f.id === reqId));
      if (baseReq) {
        const assignedVesselObj = decision.assignedVessel || baseReq.selectedVessel || baseReq.assignedVessel || {
          name: "MV Bengal Voyager",
          category: baseReq.preferredVesselCategory || "Panamax",
          dwt: 74000
        };
        const updated = {
          ...baseReq,
          status: "ACTIVE_IN_TRANSIT",
          contractorAccepted: true,
          acceptanceDate: new Date().toISOString(),
          selectedVessel: assignedVesselObj,
          assignedVessel: assignedVesselObj,
          contractorNote: decision.contractorNote
        };
        setSelectedVessel(assignedVesselObj);
        setRequirement(updated);
        setSimProgress(0);
        setIsPlaying(true);
        setSimActive(true);
        setVesselArrivedAtPort(false);
        setWaitingForTruckGateScan(false);
        setGateCleared(false);

        try {
          api.post('/supply-chain/state', {
            requirement: updated,
            simActive: true,
            simProgress: 0,
            isPlaying: true,
            vesselArrivedAtPort: false,
            waitingForTruckGateScan: false,
            gateCleared: false
          });
          const bc = new BroadcastChannel("astra_supply_chain");
          bc.postMessage({ type: "CONTRACTOR_ACCEPTED", requirement: updated });
          bc.close();
        } catch (e) {}
      }
    } else if (decision.status === "REJECTED_WITH_SOLUTION") {
      addEvent({
        type: "CONTRACTOR_REJECTED_WITH_SOLUTION",
        severity: "WARNING",
        title: `⚠️ Tata NYK Counter-Proposal for ${company} (${reqId})`,
        detail: `Declined: ${decision.rejectionReason}. Counter Solution: ${decision.recommendedSolution}`,
        requirementId: reqId,
        roleRecipient: ["company", "contractor"]
      });
      toast.error(`⚠️ Tender Declined for ${company}. Strategic solution provided to shipper.`);

      if (requirement && requirement.id === reqId) {
        setRequirement({
          ...requirement,
          status: "CONTRACTOR_COUNTERED",
          contractorAccepted: false,
          rejectionReason: decision.rejectionReason,
          recommendedSolution: decision.recommendedSolution,
          contractorNote: decision.contractorNote
        });
      }
    } else if (decision.status === "WAIT_SHIPBUILDER") {
      addEvent({
        type: "CONTRACTOR_WAIT_SHIPBUILDER",
        severity: "INFO",
        title: `⏳ Tata NYK Contacting Shipbuilder for ${company} (${reqId})`,
        detail: `Checking fleet hull availability & drydock schedule with Cochin Shipyard. Decision pending within 2h.`,
        requirementId: reqId,
        roleRecipient: ["company", "contractor"]
      });
      toast.info(`⏳ Hold notice sent to ${company} while checking with shipbuilder.`);

      if (requirement && requirement.id === reqId) {
        setRequirement({
          ...requirement,
          status: "WAIT_SHIPBUILDER",
          contractorAccepted: false,
          contractorNote: decision.contractorNote
        });
      }
    }
  };

  const acceptContractorFixture = async (reqId) => {
    const target = (requirement?.id === reqId ? requirement : null)
      || companyRequirements.find(c => c.id === reqId) 
      || fixturesList.find(f => f.id === reqId) 
      || requirement 
      || SINGAPORE_DHAMRA_REQUIREMENT;

    const vesselObj = target.selectedVessel || target.assignedVessel || {
      name: "MV Asian Express",
      category: target.preferredVesselCategory || "Panamax",
      dwt: 75000
    };

    const updated = {
      ...target,
      contractorAccepted: true,
      acceptanceDate: new Date().toISOString(),
      status: "ACTIVE_IN_TRANSIT",
      selectedVessel: vesselObj,
      assignedVessel: vesselObj
    };
    setSelectedVessel(vesselObj);
    setRequirement(updated);
    setSimProgress(0);
    setIsPlaying(true);
    setSimActive(true);
    setVesselArrivedAtPort(false);
    setWaitingForTruckGateScan(false);
    setGateCleared(false);
    toast.success(`✅ Fixture #${updated.id} Accepted & Confirmed! Vessel dispatched on sea lane.`);

    try {
      await api.post('/supply-chain/state', {
        requirement: updated,
        simActive: true,
        simProgress: 0,
        isPlaying: true,
        vesselArrivedAtPort: false,
        waitingForTruckGateScan: false,
        gateCleared: false
      });
    } catch (e) {}

    try {
      const bc = new BroadcastChannel("astra_supply_chain");
      bc.postMessage({ type: "CONTRACTOR_ACCEPTED", requirement: updated });
      bc.close();
    } catch (e) {}
  };

  const markFixtureCompleted = (reqId) => {
    const target = (requirement?.id === reqId ? requirement : null)
      || fixturesList.find(f => f.id === reqId)
      || companyRequirements.find(c => c.id === reqId)
      || requirement
      || SINGAPORE_DHAMRA_REQUIREMENT;
    const targetId = reqId || target?.id || "REQ-2026-8820";

    const updated = {
      ...target,
      id: targetId,
      status: "COMPLETED",
      completedDate: new Date().toISOString()
    };

    setRequirementState(updated);
    try {
      localStorage.setItem("astra_requirement", JSON.stringify(updated));
    } catch (e) {}

    setFixturesList((prev) => {
      const exists = prev.some(f => f.id === targetId);
      if (exists) {
        return prev.map(f => f.id === targetId ? { ...f, ...updated } : f);
      }
      return [updated, ...prev];
    });

    setCompanyRequirements((prev) => {
      return prev.map(c => c.id === targetId ? { ...c, ...updated } : c);
    });

    addEvent({
      type: "VOYAGE_COMPLETED",
      severity: "SUCCESS",
      title: `🏁 Multimodal Transit Completed (${targetId})`,
      detail: `Vessel ${updated.selectedVessel?.name || "Vessel"} cleared berth at ${updated.destinationPort}. Road fleet delivered 100% of material to plant.`,
      requirementId: targetId,
      roleRecipient: ["company", "contractor", "road_transporter", "port_operator"]
    });
  };

  // Quick book helper for Singapore -> Dhamra shipment
  const bookSampleSingaporeDhamra = async () => {
    const booking = {
      ...SINGAPORE_DHAMRA_REQUIREMENT,
      id: `REQ-${Date.now().toString().slice(-4)}`,
      status: "PENDING_REVIEW",
      contractorAccepted: false,
      timestamp: new Date().toISOString()
    };
    setRequirement(booking);
    setSimActive(false);
    setSimProgress(0);
    setIsPlaying(false);
    setVesselArrivedAtPort(false);
    setWaitingForTruckGateScan(false);
    setGateCleared(false);

    try {
      await api.post('/supply-chain/state', {
        requirement: booking,
        simActive: false,
        simProgress: 0,
        isPlaying: false,
        vesselArrivedAtPort: false,
        waitingForTruckGateScan: false,
        gateCleared: false
      });
    } catch (e) {}

    addEvent({
      id: `EV-${Date.now()}`,
      type: "NEW_REQUIREMENT_CREATED",
      severity: "INFO",
      title: `📦 Booking Created: Singapore ➔ Dhamra (${booking.cargoQuantity.toLocaleString()} MT Coal)`,
      detail: `Shipping requirement booked. Awaiting contractor review & fixture confirmation.`,
      requirementId: booking.id,
      roleRecipient: ["contractor", "company"]
    });
    toast.success(`Booking #${booking.id} created! Active sea-lane route displayed on nautical map. Awaiting contractor acceptance.`);
    return booking;
  };

  const [forecast, setForecast] = useState(null);
  const [waiting, setWaiting] = useState(null);
  const [risk, setRisk] = useState(null);
  const [matching, setMatching] = useState(null);
  const [selectedVessel, setSelectedVessel] = useState(requirement?.selectedVessel || DEFAULT_REQUIREMENT.selectedVessel);

  // AI Execution Recommendations (Plan 01, Plan 02, Plan 03)
  const [executionPlans, setExecutionPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState("PLAN-01");

  // Candidate Destination Warehouses & Suitability Rankings
  const [candidateWarehouses, setCandidateWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(DEFAULT_REQUIREMENT.warehouseSuitability);

  // Inland Logistics Truck Fleet State (First-Mile & Last-Mile)
  const [trucks, setTrucks] = useState([
    {
      id: "TRK-FM-101",
      leg: "first-mile",
      plate: "NSW-48-TX-101",
      driver: "David Miller",
      phone: "+61 412 882 101",
      trailer: "40T Multi-Axle Tipper",
      cargoQuantityMt: 40.0,
      cargoType: "Thermal Coal",
      originWarehouse: "Hunter Valley Mine Siding, NSW",
      targetPort: "Newcastle Port Jetty Berth #2",
      status: "IN TRANSIT",
      speedKmh: 54,
      headingDeg: 125,
      etaMinutes: 28,
      etaFormatted: "14:32 HRS",
      fuelPct: 88,
      gatePassId: "GP-NSW-8801",
      routeCorridor: "Hunter Valley Expressway ➔ Port Jetty",
      plannedDistanceKm: 120,
      distanceCoveredKm: 92,
      lastUpdateSecondsAgo: 12,
      trackingType: "GPS",
      exception: null
    },
    {
      id: "TRK-FM-102",
      leg: "first-mile",
      plate: "NSW-48-TX-102",
      driver: "Liam Cooper",
      phone: "+61 412 882 102",
      trailer: "40T Multi-Axle Tipper",
      cargoQuantityMt: 39.8,
      cargoType: "Thermal Coal",
      originWarehouse: "Hunter Valley Mine Siding, NSW",
      targetPort: "Newcastle Port Jetty Berth #2",
      status: "DISPATCHED",
      speedKmh: 48,
      headingDeg: 130,
      etaMinutes: 65,
      etaFormatted: "15:10 HRS",
      fuelPct: 92,
      gatePassId: "GP-NSW-8802",
      routeCorridor: "Hunter Valley Expressway",
      plannedDistanceKm: 120,
      distanceCoveredKm: 55,
      lastUpdateSecondsAgo: 24,
      trackingType: "FASTag",
      exception: null
    },
    {
      id: "TRK-LM-201",
      leg: "last-mile",
      plate: "OD-05-AX-4821",
      driver: "Ramesh Kumar",
      phone: "+91 98451 22801",
      trailer: "40T Hydraulic Tipper",
      cargoQuantityMt: 40.2,
      cargoType: "Thermal Coal",
      originPort: "Paradip Port Bulk Jetty",
      destPlant: "Angul Integrated Steel Complex (WH-07)",
      status: "IN TRANSIT",
      speedKmh: 52,
      headingDeg: 285,
      lat: 20.4800,
      lon: 86.1200,
      etaMinutes: 75,
      etaFormatted: "15:45 HRS",
      fuelPct: 84,
      gatePassId: "GP-2026-9041",
      routeCorridor: "NH-53 Heavy Industrial Corridor",
      plannedDistanceKm: 82,
      distanceCoveredKm: 34,
      lastUpdateSecondsAgo: 14,
      trackingType: "GPS",
      exception: null
    },
    {
      id: "TRK-LM-202",
      leg: "last-mile",
      plate: "OD-05-AX-4822",
      driver: "Satish Jena",
      phone: "+91 98451 22802",
      trailer: "40T Hydraulic Tipper",
      cargoQuantityMt: 39.8,
      cargoType: "Thermal Coal",
      originPort: "Paradip Port Bulk Jetty",
      destPlant: "Angul Integrated Steel Complex (WH-07)",
      status: "IN TRANSIT",
      speedKmh: 46,
      headingDeg: 290,
      lat: 20.6500,
      lon: 85.6200,
      etaMinutes: 38,
      etaFormatted: "15:05 HRS",
      fuelPct: 78,
      gatePassId: "GP-2026-9042",
      routeCorridor: "NH-53 Expressway",
      plannedDistanceKm: 82,
      distanceCoveredKm: 58,
      lastUpdateSecondsAgo: 18,
      trackingType: "FASTag",
      exception: null
    },
    {
      id: "TRK-LM-203",
      leg: "last-mile",
      plate: "OD-05-AX-4823",
      driver: "Manoj Pradhan",
      phone: "+91 98451 22803",
      trailer: "40T Hydraulic Tipper",
      cargoQuantityMt: 40.0,
      cargoType: "Thermal Coal",
      originPort: "Paradip Port Bulk Jetty",
      destPlant: "Angul Integrated Steel Complex (WH-07)",
      status: "APPROACHING PORT",
      speedKmh: 14,
      headingDeg: 95,
      lat: 20.3200,
      lon: 86.6300,
      etaMinutes: 8,
      etaFormatted: "14:35 HRS",
      fuelPct: 91,
      gatePassId: "GP-2026-9043",
      routeCorridor: "Paradip Port In-Gate Buffer",
      plannedDistanceKm: 82,
      distanceCoveredKm: 4,
      lastUpdateSecondsAgo: 6,
      trackingType: "SIM",
      exception: null
    },
    {
      id: "TRK-LM-204",
      leg: "last-mile",
      plate: "OD-05-AX-4824",
      driver: "Deepak Mohanty",
      phone: "+91 98451 22804",
      trailer: "40T Hydraulic Tipper",
      cargoQuantityMt: 40.1,
      cargoType: "Thermal Coal",
      originPort: "Paradip Port Bulk Jetty",
      destPlant: "Angul Integrated Steel Complex (WH-07)",
      status: "AT WAREHOUSE",
      speedKmh: 0,
      headingDeg: 0,
      lat: 20.8380,
      lon: 85.1450,
      etaMinutes: 0,
      etaFormatted: "DELIVERED",
      fuelPct: 69,
      gatePassId: "GP-2026-9044",
      routeCorridor: "Angul Steel Plant Unloading Bay",
      plannedDistanceKm: 82,
      distanceCoveredKm: 82,
      lastUpdateSecondsAgo: 50,
      trackingType: "GPS",
      exception: null
    }
  ]);

  // Unified Event System
  const [eventsList, setEventsList] = useState([
    {
      id: "EVT-8801",
      requirementId: "ASTRA-REQ-001",
      type: "TRUCK_DISPATCHED",
      severity: "INFO",
      title: "First-Mile Fleet Dispatched from Mine Siding",
      detail: "48x 40T multi-axle tipper trucks dispatched from Hunter Valley Mine Siding to Newcastle Port Jetty.",
      timestamp: "10 mins ago",
      entityId: "TRK-FM-101",
      roleRecipient: ["company", "road_transporter"]
    },
    {
      id: "EVT-8802",
      requirementId: "ASTRA-REQ-001",
      type: "CARGO_LOADING_COMPLETED",
      severity: "INFO",
      title: "Conveyor Jetty Loading Completed at Newcastle",
      detail: "70,000 MT Thermal Coal successfully loaded onto MV Bengal Voyager. Draft verified at 13.8m.",
      timestamp: "1 hour ago",
      entityId: "VESSEL-001",
      roleRecipient: ["company", "contractor", "port_operator"]
    },
    {
      id: "EVT-8803",
      requirementId: "ASTRA-REQ-001",
      type: "VESSEL_DEPARTED",
      severity: "INFO",
      title: "Vessel Departed Origin Port on Deepsea Transit",
      detail: "MV Bengal Voyager cleared outer fairway at Newcastle, steaming towards Paradip Port via Sunda Strait.",
      timestamp: "2 hours ago",
      entityId: "VESSEL-001",
      roleRecipient: ["company", "contractor"]
    }
  ]);

  const addEvent = (event) => {
    const newEvt = {
      id: `EVT-${Date.now().toString().slice(-4)}`,
      requirementId: requirement?.id || "ASTRA-REQ-001",
      timestamp: "Just now",
      ...event
    };
    setEventsList(prev => [newEvt, ...prev]);
  };

  // Truck Status Mutators & Exception Triggers
  const updateTruckStatus = (truckId, newStatus) => {
    setTrucks(prev => prev.map(t => {
      if (t.id === truckId) {
        return { ...t, status: newStatus, lastUpdateSecondsAgo: 0 };
      }
      return t;
    }));
    addEvent({
      type: "TRUCK_STATUS_UPDATED",
      severity: "INFO",
      title: `Truck ${truckId} Status: ${newStatus}`,
      detail: `Operational status updated to ${newStatus}.`,
      entityId: truckId,
      roleRecipient: ["road_transporter", "company"]
    });
  };

  const triggerTruckDelay = (truckId = "TRK-LM-201", delayMinutes = 42) => {
    setTrucks(prev => prev.map(t => {
      if (t.id === truckId) {
        return {
          ...t,
          status: "DELAYED",
          etaMinutes: t.etaMinutes + delayMinutes,
          etaFormatted: "16:27 HRS (DELAYED)",
          exception: {
            type: "TRUCK_DELAY",
            delayMinutes,
            impact: "Port gate arrival may miss planned slot. Gate pass window rescheduled."
          }
        };
      }
      return t;
    }));
    addEvent({
      type: "TRUCK_DELAYED",
      severity: "HIGH",
      title: `Truck Delay Alert: ${truckId} (+${delayMinutes} min)`,
      detail: `Highway toll bottleneck delayed truck. Revised ETA: 16:27 HRS. Port gate slot rescheduled.`,
      entityId: truckId,
      roleRecipient: ["road_transporter", "company"]
    });
  };

  const triggerRouteDeviation = (truckId = "TRK-LM-202") => {
    setTrucks(prev => prev.map(t => {
      if (t.id === truckId) {
        return {
          ...t,
          exception: {
            type: "ROUTE_DEVIATION",
            deviationKm: 4.8,
            impact: "Truck deviated 4.8 km outside designated NH-53 corridor. Driver alerted."
          }
        };
      }
      return t;
    }));
    addEvent({
      type: "ROUTE_DEVIATION",
      severity: "HIGH",
      title: `Route Deviation Detected: ${truckId}`,
      detail: `Vehicle moved 4.8 km outside approved geofence corridor onto secondary bypass road.`,
      entityId: truckId,
      roleRecipient: ["road_transporter", "company"]
    });
  };

  const triggerVehicleIdle = (truckId = "TRK-LM-203") => {
    setTrucks(prev => prev.map(t => {
      if (t.id === truckId) {
        return {
          ...t,
          speedKmh: 0,
          exception: {
            type: "VEHICLE_IDLE",
            idleMinutes: 48,
            impact: "Vehicle stationary >45 min near port approach gate. Driver contacted."
          }
        };
      }
      return t;
    }));
    addEvent({
      type: "VEHICLE_IDLE",
      severity: "HIGH",
      title: `Vehicle Idle Alert: ${truckId} (48 min stationary)`,
      detail: `Telemetry indicates zero motion for 48 minutes at Paradip Port in-gate queue.`,
      entityId: truckId,
      roleRecipient: ["road_transporter"]
    });
  };

  const resetAllExceptions = () => {
    setTrucks(prev => prev.map(t => ({
      ...t,
      status: t.status === "DELAYED" ? "IN TRANSIT" : t.status,
      speedKmh: t.speedKmh === 0 && t.status === "IN TRANSIT" ? 48 : t.speedKmh,
      exception: null
    })));
  };

  // Live vs Simulation data source tag state
  const [isLiveTruckData, setIsLiveTruckData] = useState(false);
  const [isLiveVesselData, setIsLiveVesselData] = useState(true);

  // Sync live inland truck telemetry from server (powered by TomTom API)
  useEffect(() => {
    fetch('/api/logistics/trucks')
      .then(res => res.json())
      .then(data => {
        if (data && data.trucks && data.trucks.length > 0) {
          setTrucks(data.trucks);
          if (data.isLive !== undefined) {
            setIsLiveTruckData(Boolean(data.isLive));
          }
        }
      })
      .catch(err => console.log("Truck telematics sync notice:", err.message));
  }, []);

  // Simulation Engine State — isPlaying starts FALSE; only true after contractor accepts fixture
  const [isPlaying, setIsPlaying] = useState(false);
  const [simProgress, setSimProgress] = useState(0); // 0 to 100%
  const [simSpeed, setSimSpeed] = useState(1); // 1x, 2x, 5x
  const [activeScenario, setActiveScenario] = useState("normal"); // "normal" | "weather_delay" | "port_congestion"
  
  // Scenario 1: Weather delay (+10h) & Port Berth Reallocation
  const [weatherDelayActive, setWeatherDelayActive] = useState(false);
  const [berthReallocated, setBerthReallocated] = useState(false);
  // feederProgress: 0-100 = feeder approaching berth, feederDeparting: true = feeder leaving after berth cleared
  const [feederProgress, setFeederProgress] = useState(0);   // 0→100 approach
  const [feederDeparting, setFeederDeparting] = useState(false);
  const [feederDepartProgress, setFeederDepartProgress] = useState(0); // 0→100 departure

  // Scenario 2: Port Congestion & Alternate Port Diversion
  const [portCongestionActive, setPortCongestionActive] = useState(false);
  const [portDiverted, setPortDiverted] = useState(false);


  // Ticker for fast-forward simulation: stops at 100% and does NOT repeat in a cycle
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setSimProgress((prev) => {
        if (prev >= 100) {
          setIsPlaying(false);
          return 100;
        }
        // ── Scenario 1 guard: freeze simProgress while vessel is held in swell ──
        // Clamped at 57% so last-mile delivery never triggers while main vessel is held in sea
        if (weatherDelayActive && !berthReallocated && prev >= 57) return prev;

        // Approaching destination port notice (at 85%)
        if (prev >= 85 && !vesselArrivedAtPort) {
          setVesselArrivedAtPort(true);
          try {
            api.post('/supply-chain/state', {
              vesselArrivedAtPort: true,
              waitingForTruckGateScan: true
            });
            const bc = new BroadcastChannel("astra_supply_chain");
            bc.postMessage({ type: "VESSEL_ARRIVED", vesselArrivedAtPort: true, waitingForTruckGateScan: true });
            bc.close();
          } catch (e) {}
        }

        // Continuous smooth, realistic maritime progression along assigned corridor
        // Slowed down to ~0.12% per 100ms tick (~80s total voyage at 1x) for clear, smooth observation
        const baseStep = (weatherDelayActive && berthReallocated) ? 0.08 : 0.12;
        const step = baseStep * (simSpeed || 1);
        const next = prev + step;
        if (next >= 100) {
          setIsPlaying(false);
          return 100;
        }
        return next;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying, simSpeed, weatherDelayActive, berthReallocated, vesselArrivedAtPort]);

  // When simProgress reaches 100%, stop simulation and notify completion, keeping vessel safely berthed
  useEffect(() => {
    if (simProgress >= 100) {
      setIsPlaying(false);
      if (requirement && requirement.status === "ACTIVE_IN_TRANSIT") {
        toast.success("⚓ Sea transit complete! Vessel safely berthed at discharge port for quayside handling.", { duration: 4000 });
      }
    }
  }, [simProgress, requirement]);

  // Secondary vessel approach animation ticker (runs when weatherDelayActive & not yet reallocated)
  useEffect(() => {
    if (!weatherDelayActive || berthReallocated) return;
    const interval = setInterval(() => {
      setFeederProgress((prev) => Math.min(100, prev + 0.12 * (simSpeed || 1)));
    }, 100);
    return () => clearInterval(interval);
  }, [weatherDelayActive, berthReallocated, simSpeed]);

  // Secondary vessel departure animation ticker (runs after berth cleared)
  useEffect(() => {
    if (!feederDeparting) return;
    const interval = setInterval(() => {
      setFeederDepartProgress((prev) => Math.min(100, prev + 0.16 * (simSpeed || 1)));
    }, 100);
    return () => clearInterval(interval);
  }, [feederDeparting, simSpeed]);

  const togglePlay = () => setIsPlaying(p => !p);

  const resetSimulation = () => {
    setSimProgress(0);
    setIsPlaying(false);
    setActiveScenario("normal");
    setWeatherDelayActive(false);
    setBerthReallocated(false);
    setFeederProgress(0);
    setFeederDeparting(false);
    setFeederDepartProgress(0);
    setPortCongestionActive(false);
    setPortDiverted(false);
    setVesselArrivedAtPort(false);
    setWaitingForTruckGateScan(false);
    setGateCleared(false);
    try {
      api.post('/supply-chain/reset');
      const bc = new BroadcastChannel("astra_supply_chain");
      bc.postMessage({ type: "SIM_RESET" });
      bc.close();
    } catch (e) {}
  };

  const triggerWeatherDelay = () => {
    setSimProgress(0);
    setIsPlaying(true);
    setWeatherDelayActive(true);
    setActiveScenario("weather_delay");
    setBerthReallocated(false);
    setFeederProgress(0);
    setFeederDeparting(false);
    setFeederDepartProgress(0);
    setPortCongestionActive(false);
    setPortDiverted(false);
  };

  const approveBerthReallocation = () => {
    setBerthReallocated(true);
    setFeederDeparting(true);
    setFeederDepartProgress(0);
  };

  const triggerPortCongestion = () => {
    setPortCongestionActive(true);
    setActiveScenario("port_congestion");
    setWeatherDelayActive(false);
    setBerthReallocated(false);
  };

  const approvePortDiversion = () => {
    setPortDiverted(true);
  };

  // Helper to get active multimodal leg name
  const getCurrentLeg = () => {
    const origWh = requirement?.originWarehouse || "Hunter Valley Mine Siding, NSW";
    const origPort = requirement?.originPort || "Newcastle";
    const destPort = portDiverted ? "Krishnapatnam" : (requirement?.destinationPort || "Paradip");
    const destWh = requirement?.destinationWarehouse || "Angul Integrated Steel Complex";
    const vesselName = requirement?.selectedVessel?.name || "MV Bengal Voyager";
    const vesselCat = requirement?.selectedVessel?.category || "Panamax";
    const cargoQty = requirement?.cargoQuantity ? requirement.cargoQuantity.toLocaleString() : "70,000";

    if (simProgress < 20) {
      return { 
        stage: 1, 
        name: "First-Mile Road Transport", 
        mode: "TRUCK", 
        location: `${origWh} ➔ ${origPort} Port`,
        details: `${requirement?.roadFleet?.firstMileTrucks || 48} Trucks hauling coal from mine siding to port stockyard`
      };
    }
    if (simProgress < 35) {
      return { 
        stage: 2, 
        name: "Origin Port Jetty Loading", 
        mode: "PORT", 
        location: `${origPort} Deepwater Mechanized Jetty`,
        details: `Conveyor loading ${cargoQty} MT onto ${vesselName}`
      };
    }
    if (simProgress < 75) {
      return { 
        stage: 3, 
        name: "Ocean Transit (High Seas)", 
        mode: "VESSEL", 
        location: `Bay of Bengal ➔ ${destPort} Port`,
        details: `${vesselName} (${vesselCat}) cruising at 13.8 kts`
      };
    }
    if (waitingForTruckGateScan || (simProgress >= 75 && !gateCleared)) {
      return {
        stage: 4,
        name: "Vessel Berthed · Awaiting Truck QR Gate Scan",
        mode: "PORT",
        location: `${destPort} Mechanized Berth #01`,
        details: `${vesselName} berthed at quay. Unloading paused until Road Fleet scans PCS 1x Digital Gate Pass at Port Gate 01.`
      };
    }
    if (simProgress < 85) {
      return { 
        stage: 4, 
        name: "Port Berth Discharge & Truck Loading", 
        mode: "PORT", 
        location: portDiverted ? "Krishnapatnam Port Berth #4" : `${destPort} Bulk Berth #2`,
        details: `Gate cleared! Mobile cranes discharging directly into road fleet tippers`
      };
    }
    return { 
      stage: 5, 
      name: "Last-Mile Road Delivery", 
      mode: "TRUCK", 
      location: `${destPort} ➔ ${destWh}`,
      details: `${requirement?.roadFleet?.lastMileTrucks || 52} Trucks delivering directly to ${destWh}`
    };
  };

  return (
    <FlowContext.Provider
      value={{
        requirement, setRequirement,
        fixturesList, setFixturesList,
        acceptContractorFixture, markFixtureCompleted,
        companyRequirements, setCompanyRequirements,
        shipbuilderHulls, setShipbuilderHulls,
        pingShipbuilderDesk, updateContractorDecision,
        forecast, setForecast,
        waiting, setWaiting,
        risk, setRisk,
        matching, setMatching,
        selectedVessel, setSelectedVessel,

        // AI Execution Recommendations & Warehouse Selection
        executionPlans, setExecutionPlans,
        selectedPlanId, setSelectedPlanId,
        candidateWarehouses, setCandidateWarehouses,
        selectedWarehouse, setSelectedWarehouse,

        // Inland Truck Fleet & Exceptions
        trucks, setTrucks,
        updateTruckStatus,
        triggerTruckDelay,
        triggerRouteDeviation,
        triggerVehicleIdle,
        resetAllExceptions,

        // Unified Event System
        eventsList, setEventsList, addEvent,

        // Provider Telemetry Flags
        isLiveTruckData, setIsLiveTruckData,
        isLiveVesselData, setIsLiveVesselData,
        
        // Multi-modal Relay State & Synchronized Gate Passing
        vesselArrivedAtPort, setVesselArrivedAtPort,
        waitingForTruckGateScan, setWaitingForTruckGateScan,
        gateCleared, setGateCleared,
        scanGatePass,

        // Simulation Engine
        isPlaying, setIsPlaying, togglePlay,
        simProgress, setSimProgress,
        simSpeed, setSimSpeed,
        activeScenario, setActiveScenario,
        weatherDelayActive, triggerWeatherDelay,
        berthReallocated, approveBerthReallocation,
        feederProgress, feederDeparting, feederDepartProgress,
        portCongestionActive, triggerPortCongestion,
        portDiverted, approvePortDiversion,
        resetSimulation,
        getCurrentLeg,

        // Simulation visibility flag (sessionStorage-backed, clears on page refresh)
        simActive, setSimActive,

        // Quick booking helper
        bookSampleSingaporeDhamra,
      }}
    >
      {children}
    </FlowContext.Provider>
  );
}

export function useFlow() {
  return useContext(FlowContext);
}
