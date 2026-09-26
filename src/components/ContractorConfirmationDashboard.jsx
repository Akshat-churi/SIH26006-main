import React, { useState } from "react";
import { useFlow } from "../lib/flow";
import { useAuth } from "../lib/auth";
import { toast } from "sonner";
import EastCoastMap from "./EastCoastMap";
import {
  Ship, CheckCircle2, XCircle, Clock, AlertTriangle,
  Building2, ArrowRight, ShieldCheck, Sparkles,
  Search, Filter, Send, MessageSquare, Wrench, RefreshCw,
  TrendingUp, Anchor, Check, X, FileText, ChevronRight
} from "lucide-react";

export default function ContractorConfirmationDashboard() {
  const { user } = useAuth();
  const {
    companyRequirements,
    updateContractorDecision,
    shipbuilderHulls,
    pingShipbuilderDesk,
    eventsList,
    requirement,
    isPlaying, togglePlay,
    simProgress, setSimProgress,
    simSpeed, setSimSpeed,
    weatherDelayActive, triggerWeatherDelay,
    berthReallocated, approveBerthReallocation,
    portCongestionActive, triggerPortCongestion,
    portDiverted, approvePortDiversion,
    resetSimulation,
    waitingForTruckGateScan,
    gateCleared,
    scanGatePass,
    simActive
  } = useFlow();

  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [showLiveMap, setShowLiveMap] = useState(false);

  // Modals state
  const [selectedReq, setSelectedReq] = useState(null);
  const [activeModal, setActiveModal] = useState(null); // 'ACCEPT' | 'REJECT' | 'WAIT' | 'DETAILS'

  // Accept Form state
  const [selectedVesselName, setSelectedVesselName] = useState("MV Bengal Voyager");
  const [acceptNote, setAcceptNote] = useState("Vessel confirmed from ballast fleet. Laycan window accepted.");

  // Reject Form state
  const [rejectReason, setRejectReason] = useState("Vessel class not available in requested laycan window (+7 days delay)");
  const [customReason, setCustomReason] = useState("");
  const [recommendedSolution, setRecommendedSolution] = useState("Recommend shifting laycan by +4 days to match incoming ballast vessel MV Bengal Titan.");
  const [customSolution, setCustomSolution] = useState("");
  const [rejectNote, setRejectNote] = useState("");

  // Wait Form state
  const [waitReason, setWaitReason] = useState("Checking with Cochin Shipyard & Fleet Dispatch for drydock hull survey clearance.");

  const requirements = companyRequirements || [];

  const pendingCount = requirements.filter(r => r.status === "PENDING_REVIEW").length;
  const acceptedCount = requirements.filter(r => r.status === "ACCEPTED" || r.status === "ACTIVE_IN_TRANSIT").length;
  const rejectedCount = requirements.filter(r => r.status === "REJECTED_WITH_SOLUTION").length;
  const waitCount = requirements.filter(r => r.status === "WAIT_SHIPBUILDER").length;

  const filteredRequirements = requirements.filter(r => {
    if (filterStatus === "PENDING" && r.status !== "PENDING_REVIEW") return false;
    if (filterStatus === "ACCEPTED" && r.status !== "ACCEPTED" && r.status !== "ACTIVE_IN_TRANSIT") return false;
    if (filterStatus === "REJECTED" && r.status !== "REJECTED_WITH_SOLUTION") return false;
    if (filterStatus === "WAIT" && r.status !== "WAIT_SHIPBUILDER") return false;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        r.companyName.toLowerCase().includes(q) ||
        r.cargoType.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        r.destinationPort.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Handle Accept
  const handleConfirmAccept = () => {
    if (!selectedReq) return;
    try {
      const vesselObj = (shipbuilderHulls || []).find(v => v.name === selectedVesselName) || {
        name: selectedVesselName || "MV Bengal Voyager",
        category: selectedReq.preferredVesselCategory || "Panamax",
        dwt: 74000,
        draftM: 13.8,
        laycan: selectedReq.requiredArrivalDate || "Immediate"
      };

      if (updateContractorDecision) {
        updateContractorDecision(selectedReq.id, {
          status: "ACCEPTED",
          assignedVessel: vesselObj,
          contractorNote: acceptNote || "Charter confirmed by Tata NYK Fleet Ops."
        });
      }
      setShowLiveMap(true);
      setTimeout(() => {
        document.getElementById("contractor-live-simulation")?.scrollIntoView({ behavior: "smooth" });
      }, 300);
      toast.success(`✅ Fixture Confirmed: Allocated ${vesselObj.name} for ${selectedReq.companyName}. Live voyage simulation active on map!`);
    } catch (err) {
      console.error("Error confirming accept fixture:", err);
      toast.error("Error confirming fixture: " + err.message);
    } finally {
      setActiveModal(null);
      setSelectedReq(null);
    }
  };

  // Handle Reject with Solution
  const handleConfirmReject = () => {
    if (!selectedReq) return;
    const finalReason = rejectReason === "OTHER" ? customReason : rejectReason;
    const finalSolution = recommendedSolution === "OTHER" ? customSolution : recommendedSolution;

    if (!finalReason) {
      toast.error("Please provide a reason for declining.");
      return;
    }
    if (!finalSolution) {
      toast.error("Please provide a recommended solution or counter-proposal.");
      return;
    }

    try {
      if (updateContractorDecision) {
        updateContractorDecision(selectedReq.id, {
          status: "REJECTED_WITH_SOLUTION",
          rejectionReason: finalReason,
          recommendedSolution: finalSolution,
          contractorNote: rejectNote
        });
      }
      toast.success(`Counter-solution submitted to ${selectedReq.companyName}`);
    } catch (err) {
      console.error("Error submitting reject:", err);
    } finally {
      setActiveModal(null);
      setSelectedReq(null);
    }
  };

  // Handle Wait
  const handleConfirmWait = () => {
    if (!selectedReq) return;
    try {
      if (updateContractorDecision) {
        updateContractorDecision(selectedReq.id, {
          status: "WAIT_SHIPBUILDER",
          contractorNote: waitReason
        });
      }
      toast.info(`Hold status updated for ${selectedReq.companyName}`);
    } catch (err) {
      console.error("Error submitting wait:", err);
    } finally {
      setActiveModal(null);
      setSelectedReq(null);
    }
  };

  return (
    <div className="space-y-6" data-testid="contractor-dashboard">
      {/* 1. WORKSPACE HEADER */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-blue-900 text-white uppercase font-mono tracking-wider flex items-center gap-1.5">
              <Ship size={12} />
              OCEAN CONTRACTOR WORKSPACE · TATA NYK SHIPPING
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              LIVE COMPANY TENDERS FEED
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1.5" style={{ fontFamily: "Manrope" }}>
            Company Shipping Requirements & Tenders Desk
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review incoming company requirements, verify shipbuilder & drydock availability, accept charters, or provide counter-solutions in real time.
          </p>
        </div>

        {/* Live Shipbuilder Ping Button */}
        <button
          onClick={pingShipbuilderDesk}
          className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono font-bold shadow flex items-center gap-2 transition-all cursor-pointer border border-slate-700"
        >
          <Wrench size={14} className="text-amber-400" />
          <span>Ping Shipbuilder Fleet Status</span>
        </button>
      </div>

      {/* 2. TOP 5 OPERATIONAL KPIS FOR CONTRACTOR */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono text-xs">
        <div className="p-3.5 rounded-xl border border-amber-300 bg-amber-50/70 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-800 font-bold">
            <span>PENDING REVIEW</span>
            <AlertTriangle size={15} className="text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-950 mt-1">{pendingCount} Tenders</div>
          <div className="text-[10px] text-amber-700 mt-0.5">Awaiting contractor reaction</div>
        </div>

        <div className="p-3.5 rounded-xl border border-emerald-300 bg-emerald-50/70 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-800 font-bold">
            <span>CONFIRMED FIXTURES</span>
            <CheckCircle2 size={15} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-950 mt-1">{acceptedCount} Active</div>
          <div className="text-[10px] text-emerald-700 mt-0.5">Vessels fixed & allocated</div>
        </div>

        <div className="p-3.5 rounded-xl border border-blue-300 bg-blue-50/70 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-blue-800 font-bold">
            <span>SHIPBUILDER READY</span>
            <Wrench size={15} className="text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-950 mt-1">4 Hulls Open</div>
          <div className="text-[10px] text-blue-700 mt-0.5">1 undergoing drydock survey</div>
        </div>

        <div className="p-3.5 rounded-xl border border-purple-300 bg-purple-50/70 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-purple-800 font-bold">
            <span>COUNTER-SOLUTIONS</span>
            <MessageSquare size={15} className="text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-950 mt-1">{rejectedCount} Proposed</div>
          <div className="text-[10px] text-purple-700 mt-0.5">Alternative plans offered</div>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-300 bg-slate-50 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-700 font-bold">
            <span>TOTAL VOLUME</span>
            <TrendingUp size={15} className="text-slate-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">378,000 MT</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Under tender negotiation</div>
        </div>
      </div>

      {/* 3. SHIPBUILDER & FLEET AVAILABILITY DECK */}
      <div className="astra-card p-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-md border border-slate-700 rounded-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700 pb-2.5">
          <div className="flex items-center gap-2">
            <Anchor size={16} className="text-amber-400" />
            <div>
              <span className="font-extrabold text-sm text-white">Tata NYK Fleet & Shipbuilder Yard Readiness</span>
              <span className="text-slate-400 text-xs ml-2 font-mono hidden sm:inline">· Direct Yard Communication Feed</span>
            </div>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500 font-bold">
            Cochin Shipyard & Ballast Positions: SYNCED
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 text-xs font-mono">
          {(shipbuilderHulls || [
            { name: "MV Bengal Voyager", category: "Panamax", dwt: "74,000 DWT", location: "Newcastle / Paradip", status: "READY_NOW", condition: "Survey Class A1", color: "text-emerald-400" },
            { name: "MV Jag Radha", category: "Panamax", dwt: "76,500 DWT", location: "Singapore Ballast", status: "BALLAST_TRANSIT", condition: "ETA 3 Days (Hull Certified)", color: "text-blue-400" },
            { name: "MV Coastal Pride", category: "Supramax", dwt: "58,000 DWT", location: "Visakhapatnam Harbor", status: "READY_NOW", condition: "Cranes 4x30T Active", color: "text-emerald-400" },
            { name: "MV Vishva Nidhi", category: "Capesize", dwt: "180,000 DWT", location: "Cochin Shipyard Drydock", status: "DRYDOCK_CHECK", condition: "Release in 5 Days", color: "text-amber-400" },
            { name: "MV Chennai Express", category: "Handysize", dwt: "35,000 DWT", location: "Chennai Anchorage", status: "READY_NOW", condition: "Coastal Shallow Draft", color: "text-emerald-400" }
          ]).map((hull, idx) => (
            <div key={idx} className="p-2.5 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <strong className="text-slate-100 font-bold">{hull.name}</strong>
                  <span className={`text-[9px] font-bold ${hull.color}`}>{hull.status.replace("_", " ")}</span>
                </div>
                <div className="text-slate-400 text-[11px] mt-0.5">{hull.category} · {hull.dwt}</div>
              </div>
              <div className="mt-2 pt-1.5 border-t border-white/10 text-[10px] text-slate-300">
                <div>📍 {hull.location}</div>
                <div className="text-amber-300/90 truncate">{hull.condition}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. CONFIRMATION LIST OF COMPANIES (REQUIREMENTS REVIEW & ACTION ENGINE) */}
      <div className="space-y-3.5">
        {/* Filter and Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 font-mono text-xs">
            {[
              { key: "ALL", label: `All Tenders (${requirements.length})` },
              { key: "PENDING", label: `Pending Action (${pendingCount})`, badge: pendingCount > 0 },
              { key: "ACCEPTED", label: `Confirmed (${acceptedCount})` },
              { key: "REJECTED", label: `Counter-Offered (${rejectedCount})` },
              { key: "WAIT", label: `Shipbuilder Check (${waitCount})` }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilterStatus(tab.key)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${filterStatus === tab.key
                  ? "bg-blue-900 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
              >
                <span>{tab.label}</span>
                {tab.badge && <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono w-full sm:w-64">
            <Search size={14} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search company, cargo, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent focus:outline-none w-full text-slate-800"
            />
          </div>
        </div>

        {/* Requirements Cards List */}
        <div className="space-y-3">
          {filteredRequirements.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-500 font-mono text-xs">
              <Building2 size={32} className="mx-auto text-slate-300 mb-2" />
              <div>No requirements found matching current filter.</div>
            </div>
          ) : (
            filteredRequirements.map((req) => {
              const isPending = req.status === "PENDING_REVIEW";
              const isAccepted = req.status === "ACCEPTED" || req.status === "ACTIVE_IN_TRANSIT";
              const isRejected = req.status === "REJECTED_WITH_SOLUTION";
              const isWait = req.status === "WAIT_SHIPBUILDER";

              return (
                <div
                  key={req.id}
                  className={`astra-card p-4 sm:p-5 transition-all border-l-4 rounded-xl shadow-sm ${isPending
                    ? "border-l-amber-500 bg-white hover:border-l-amber-600"
                    : isAccepted
                      ? "border-l-emerald-600 bg-white"
                      : isRejected
                        ? "border-l-purple-600 bg-white"
                        : "border-l-blue-600 bg-white"
                    }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: Company & Cargo Essentials */}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-bold border border-slate-300">
                          {req.id}
                        </span>
                        <strong className="text-sm text-slate-900 font-extrabold flex items-center gap-1.5" style={{ fontFamily: "Manrope" }}>
                          <Building2 size={15} className="text-blue-900 shrink-0" />
                          {req.companyName}
                        </strong>
                        <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-200 text-slate-700 font-bold">
                          Credit: {req.creditRating || "AAA"}
                        </span>
                        <span className="text-slate-400 text-[11px]">· {req.createdAt || "Recent"}</span>

                        {req.isNewlyCreated && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white animate-pulse">
                            🚨 NEW REQ FROM SHIPPER
                          </span>
                        )}
                      </div>

                      {/* Cargo, Route & Vessel Specs */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono pt-1">
                        <div>
                          <span className="text-slate-400 text-[10px] uppercase font-bold block">CARGO SPECIFICATION</span>
                          <div className="font-extrabold text-slate-900 mt-0.5">
                            {req.cargoQuantity?.toLocaleString()} MT · {req.cargoType}
                          </div>
                          <div className="text-[11px] text-slate-500">Stowage: {req.stowageFactor || "44 cu ft/MT"}</div>
                        </div>

                        <div>
                          <span className="text-slate-400 text-[10px] uppercase font-bold block">CORRIDOR & NODES</span>
                          <div className="font-extrabold text-blue-900 mt-0.5 flex items-center gap-1">
                            <span>{req.originPort}</span>
                            <ArrowRight size={12} />
                            <span>{req.destinationPort}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 truncate" title={req.destinationWarehouse}>
                            Plant: {req.destinationWarehouse}
                          </div>
                        </div>

                        <div>
                          <span className="text-slate-400 text-[10px] uppercase font-bold block">TARGET LAYCAN & BUDGET</span>
                          <div className="font-extrabold text-emerald-800 mt-0.5">
                            Arrival: {req.requiredArrivalDate}
                          </div>
                          <div className="text-[11px] text-slate-600">
                            Budget: <strong>${req.targetFreightRatePerTon || "16.90"}/MT</strong> Landed
                          </div>
                        </div>
                      </div>

                      {/* Preferred Vessel Specs */}
                      <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-slate-500 pt-1">
                        <span>Class: <strong className="text-slate-700">{req.preferredVesselCategory}</strong></span>
                        <span>· Draft Limit: <strong className="text-slate-700">{req.maxDraftM || "14.0"}m</strong></span>
                        <span>· Contact: <strong className="text-slate-700">{req.contactPerson || "Commercial Desk"}</strong></span>
                      </div>
                    </div>

                    {/* Right: Decision Status & Quick Action Buttons */}
                    <div className="flex flex-col sm:items-end justify-between gap-3 border-t lg:border-t-0 lg:border-l border-slate-100 pt-3 lg:pt-0 lg:pl-5 min-w-[280px]">
                      {/* Status Badge */}
                      <div>
                        {isPending && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-black font-mono bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5">
                            <Clock size={13} className="text-amber-600 animate-spin" />
                            Awaiting Contractor Action
                          </span>
                        )}
                        {isAccepted && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-black font-mono bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1.5">
                            <CheckCircle2 size={13} className="text-emerald-600" />
                            CONFIRMED & FIXED
                          </span>
                        )}
                        {isRejected && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-black font-mono bg-purple-100 text-purple-900 border border-purple-300 flex items-center gap-1.5">
                            <MessageSquare size={13} className="text-purple-600" />
                            COUNTER-SOLUTION PROVIDED
                          </span>
                        )}
                        {isWait && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-black font-mono bg-blue-100 text-blue-900 border border-blue-300 flex items-center gap-1.5">
                            <Wrench size={13} className="text-blue-600" />
                            CHECKING SHIPBUILDER / FLEET
                          </span>
                        )}
                      </div>

                      {/* Action Buttons for Contractor */}
                      <div className="flex flex-wrap items-center gap-2">
                        {isAccepted ? (
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 font-mono text-xs font-bold border border-emerald-300 flex items-center gap-1.5">
                              <CheckCircle2 size={13} className="text-emerald-600" />
                              <span>Allocated: {req.assignedVessel?.name || req.selectedVessel?.name || "Vessel"}</span>
                            </span>
                            <button
                              onClick={() => {
                                setShowLiveMap(true);
                                setTimeout(() => {
                                  document.getElementById("contractor-live-simulation")?.scrollIntoView({ behavior: "smooth" });
                                }, 100);
                              }}
                              className="px-3.5 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-mono text-xs font-bold flex items-center gap-1.5 shadow cursor-pointer transition-all"
                              title="View live multimodal transit simulation on AIS nautical map"
                            >
                              <Ship size={14} className="text-amber-300" />
                              <span>Track Live Voyage Radar ➔</span>
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setSelectedReq(req);
                                setSelectedVesselName(shipbuilderHulls?.[0]?.name || "MV Bengal Voyager");
                                setAcceptNote(`Laycan window confirmed for ${req.requiredArrivalDate}. Allocated from Tata NYK ballast fleet.`);
                                setActiveModal("ACCEPT");
                              }}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs font-black flex items-center gap-1 shadow cursor-pointer transition-all"
                              title="Accept and allocate vessel"
                            >
                              <Check size={13} />
                              <span>Accept</span>
                            </button>

                            <button
                              onClick={() => {
                                setSelectedReq(req);
                                setActiveModal("REJECT");
                              }}
                              className="px-3 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-mono text-xs font-black flex items-center gap-1 shadow cursor-pointer transition-all"
                              title="Decline with specific reason and provide counter-solution"
                            >
                              <MessageSquare size={13} />
                              <span>Reject & Counter</span>
                            </button>

                            <button
                              onClick={() => {
                                setSelectedReq(req);
                                setActiveModal("WAIT");
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-mono text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
                              title="Put in wait while verifying with shipbuilder"
                            >
                              <Clock size={13} />
                              <span>Wait</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Operational Notes / Solutions Callout Box */}
                  {isAccepted && req.assignedVessel && (
                    <div className="mt-3 p-3 rounded-lg bg-emerald-50/80 border border-emerald-200 font-mono text-xs text-emerald-900 flex items-center justify-between gap-3">
                      <div>
                        <strong>Assigned Vessel:</strong> {req.assignedVessel.name} ({req.assignedVessel.category} · {req.assignedVessel.dwt?.toLocaleString()} DWT). {req.contractorNote}
                      </div>
                      <span className="text-[10px] text-emerald-700 font-bold shrink-0">Charter Fixture Active</span>
                    </div>
                  )}

                  {isRejected && (
                    <div className="mt-3 p-3 rounded-lg bg-purple-50/90 border border-purple-200 font-mono text-xs space-y-1.5">
                      <div className="flex items-start gap-2">
                        <span className="px-1.5 py-0.2 rounded bg-purple-200 text-purple-900 font-bold text-[10px] shrink-0">
                          REASON
                        </span>
                        <span className="text-purple-950 font-semibold">{req.rejectionReason}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 font-bold text-[10px] shrink-0">
                          RECOMMENDED SOLUTION
                        </span>
                        <span className="text-slate-800 font-bold">{req.recommendedSolution}</span>
                      </div>
                      {req.contractorNote && (
                        <div className="text-slate-500 text-[11px] pt-1">Contractor Note: {req.contractorNote}</div>
                      )}
                    </div>
                  )}

                  {isWait && (
                    <div className="mt-3 p-3 rounded-lg bg-blue-50 border border-blue-200 font-mono text-xs text-blue-900 flex items-center justify-between gap-3">
                      <div>
                        <strong>Shipbuilder Inspection:</strong> {req.contractorNote || "Contacting Cochin Shipyard for hull inspection status."}
                      </div>
                      <span className="text-[10px] text-blue-700 font-bold shrink-0">ETA Decision &lt; 2h</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. INTERACTIVE CONTRACTOR DECISION MODALS */}
      {/* ========================================================================= */}

      {/* ACCEPT MODAL */}
      {activeModal === "ACCEPT" && selectedReq && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 font-mono text-xs animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 grid place-items-center">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900" style={{ fontFamily: "Manrope" }}>
                    Accept & Confirm Charter Fixture
                  </h3>
                  <p className="text-[11px] text-slate-500">{selectedReq.companyName} · {selectedReq.id}</p>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-slate-600 font-bold block mb-1">Select Available Vessel from Fleet / Shipbuilder:</label>
                <select
                  value={selectedVesselName}
                  onChange={(e) => setSelectedVesselName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-bold text-slate-900 focus:outline-none"
                >
                  {(shipbuilderHulls && shipbuilderHulls.length > 0 ? shipbuilderHulls : [
                    { name: "MV Bengal Voyager", category: "Panamax", dwt: "74,000 DWT", location: "Newcastle / Paradip" },
                    { name: "MV Jag Radha", category: "Panamax", dwt: "76,500 DWT", location: "Singapore Ballast" },
                    { name: "MV Coastal Pride", category: "Supramax", dwt: "58,000 DWT", location: "Visakhapatnam Harbor" },
                    { name: "MV Vishva Nidhi", category: "Capesize", dwt: "180,000 DWT", location: "Cochin Shipyard Drydock" },
                    { name: "MV Chennai Express", category: "Handysize", dwt: "35,000 DWT", location: "Chennai Anchorage" }
                  ]).map((h) => (
                    <option key={h.name} value={h.name}>
                      {h.name} ({h.category} · {h.dwt} · {h.location})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-600 font-bold block mb-1">Contractor Laycan Confirmation & Operational Note:</label>
                <textarea
                  rows={3}
                  value={acceptNote}
                  onChange={(e) => setAcceptNote(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none"
                  placeholder="Enter confirmation terms, arrival slot, and instructions..."
                />
              </div>

              <div className="p-3 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px]">
                ⚡ <strong>Real-time Synchronized Action:</strong> Accepting this requirement will automatically notify {selectedReq.companyName} and authorize the first-mile and ocean logistics corridor.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAccept}
                className="px-5 py-2.5 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-md cursor-pointer flex items-center gap-1.5 transition-all active:scale-95"
              >
                <Check size={15} />
                <span>Confirm & Authorize Fixture</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT & COUNTER-SOLUTION MODAL */}
      {activeModal === "REJECT" && selectedReq && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-4 font-mono text-xs animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 grid place-items-center">
                  <MessageSquare size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900" style={{ fontFamily: "Manrope" }}>
                    Decline Tender & Provide Strategic Solution
                  </h3>
                  <p className="text-[11px] text-slate-500">{selectedReq.companyName} · {selectedReq.id}</p>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
              {/* Reason Selection */}
              <div>
                <label className="text-slate-700 font-bold block mb-1">
                  1. Reason for Rejection / Challenge:
                </label>
                <select
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold text-slate-900 focus:outline-none"
                >
                  <option value="Vessel class not available in requested laycan window (+7 days delay)">
                    Vessel class not available in requested laycan window (+7 days delay)
                  </option>
                  <option value="Tidal draft (14.2m) exceeds Paradip spring limit (Max 13.8m)">
                    Tidal draft (14.2m) exceeds Paradip spring limit (Max 13.8m)
                  </option>
                  <option value="Cargo volume (90,000 MT) exceeds single Supramax capacity">
                    Cargo volume (90,000 MT) exceeds single Supramax capacity
                  </option>
                  <option value="Target freight rate below operating bunker breakeven ($18.50/MT required)">
                    Target freight rate below operating bunker breakeven ($18.50/MT required)
                  </option>
                  <option value="Terminal berth congestion buffer exceeds SLA threshold at destination port">
                    Terminal berth congestion buffer exceeds SLA threshold at destination port
                  </option>
                  <option value="OTHER">Other Custom Reason...</option>
                </select>

                {rejectReason === "OTHER" && (
                  <input
                    type="text"
                    placeholder="Specify exact operational or commercial reason..."
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 mt-1.5 focus:outline-none"
                  />
                )}
              </div>

              {/* Solution Counter-Proposal Selection */}
              <div>
                <label className="text-slate-700 font-bold block mb-1 text-purple-900">
                  2. Provide Recommended Solution / Counter-Proposal (Sent to Company):
                </label>
                <select
                  value={recommendedSolution}
                  onChange={(e) => setRecommendedSolution(e.target.value)}
                  className="w-full bg-purple-50/60 border border-purple-300 rounded-lg p-2 font-bold text-purple-950 focus:outline-none"
                >
                  <option value="Recommend shifting laycan by +4 days to match incoming ballast vessel MV Bengal Titan.">
                    Recommend shifting laycan by +4 days to match incoming ballast vessel MV Bengal Titan
                  </option>
                  <option value="Recommend splitting cargo into 2x 45,000 MT Supramax shipments for rapid berth turnaround.">
                    Recommend splitting cargo into 2x 45,000 MT Supramax shipments for rapid berth turnaround
                  </option>
                  <option value="Recommend diverting discharge to Krishnapatnam Port for 18.5m deepwater draft clearance.">
                    Recommend diverting discharge to Krishnapatnam Port for 18.5m deepwater draft clearance
                  </option>
                  <option value="Adjust target freight rate to $17.80/MT to account for low-sulfur ECA bunker surcharge.">
                    Adjust target freight rate to $17.80/MT to account for low-sulfur ECA bunker surcharge
                  </option>
                  <option value="OTHER">Other Custom Solution Recommendation...</option>
                </select>

                {recommendedSolution === "OTHER" && (
                  <input
                    type="text"
                    placeholder="Enter your actionable counter-solution for the shipper..."
                    value={customSolution}
                    onChange={(e) => setCustomSolution(e.target.value)}
                    className="w-full bg-white border border-purple-300 rounded-lg p-2 text-slate-900 mt-1.5 focus:outline-none"
                  />
                )}
              </div>

              {/* Additional Comments */}
              <div>
                <label className="text-slate-600 font-bold block mb-1">3. Additional Contractor Remarks / Commercial Guidance:</label>
                <textarea
                  rows={2}
                  value={rejectNote}
                  onChange={(e) => setRejectNote(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
                  placeholder="e.g., We have reserved the Newcastle berth slot until 17:00 HRS pending your decision..."
                />
              </div>

              <div className="p-3 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 text-[11px]">
                💬 <strong>Direct Shipper Notification:</strong> {selectedReq.companyName} will receive your reason and recommended counter-solution instantly with an option to apply your solution in 1 click!
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-lg bg-purple-700 text-white font-bold hover:bg-purple-800 shadow cursor-pointer flex items-center gap-1.5"
              >
                <Send size={13} />
                <span>Submit Counter-Solution</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WAIT (SHIPBUILDER CHECK) MODAL */}
      {activeModal === "WAIT" && selectedReq && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 font-mono text-xs animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 grid place-items-center">
                  <Clock size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900" style={{ fontFamily: "Manrope" }}>
                    Hold for Shipbuilder Hull Verification
                  </h3>
                  <p className="text-[11px] text-slate-500">{selectedReq.companyName} · {selectedReq.id}</p>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-slate-600 font-bold block mb-1">Status Note for Shipper:</label>
                <textarea
                  rows={3}
                  value={waitReason}
                  onChange={(e) => setWaitReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none"
                />
              </div>

              <div className="p-3 rounded-lg bg-blue-50 text-blue-900 border border-blue-200 text-[11px]">
                ℹ️ <strong>Status Notice:</strong> {selectedReq.companyName} will be informed that Tata NYK is contacting Cochin Shipyard & fleet dispatch. Decision expected within 2 hours.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmWait}
                className="px-4 py-2 rounded-lg bg-blue-900 text-white font-bold hover:bg-blue-800 shadow cursor-pointer flex items-center gap-1.5"
              >
                <Clock size={14} />
                <span>Set to Shipbuilder Hold</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LIVE VOYAGE SIMULATION RADAR FOR CONTRACTOR (Shown whenever an accepted fixture is active or contractor requests it) */}
      {(showLiveMap || Boolean(requirement && (requirement.status === "ACTIVE_IN_TRANSIT" || requirement.contractorAccepted))) && (
        <div id="contractor-live-simulation" className="space-y-4 pt-6 border-t-2 border-slate-200 animate-in fade-in duration-300">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 text-white p-4 rounded-xl shadow-md border border-blue-900">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-500/20 border border-emerald-400 text-emerald-400 font-bold">
                <Ship className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 font-mono">Carrier Real-Time Telemetry · Active Transit Corridor</div>
                <div className="text-sm font-bold text-white">
                  Live Voyage: {requirement?.originPort || "Singapore"} ➔ {portDiverted ? "Krishnapatnam" : (requirement?.destinationPort || "Dhamra")} ({requirement?.selectedVessel?.name || requirement?.assignedVessel?.name || "MV Bengal Voyager"})
                </div>
                <div className="text-xs text-slate-300 font-mono">
                  Laycan Active · Sea-Lane AIS Tracking · Real-Time Speed & Progress
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-lg bg-emerald-600/30 border border-emerald-400 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Active Transit: {Math.round(simProgress)}%</span>
              </span>
            </div>
          </div>

          <EastCoastMap
            originPort={requirement?.originPort || "Singapore"}
            activePort={portDiverted ? "Krishnapatnam" : (requirement?.destinationPort || "Dhamra")}
            highlightedPorts={[portDiverted ? "Krishnapatnam" : (requirement?.destinationPort || "Dhamra"), "Krishnapatnam", "Visakhapatnam"]}
            showRoute={true}
            showSimulation={true}
            bookedVessel={requirement?.selectedVessel || requirement?.assignedVessel}
            simProgress={simProgress}
            isPlaying={isPlaying}
            simSpeed={simSpeed}
            onTogglePlay={togglePlay}
            onResetSimulation={resetSimulation}
            onSetSimSpeed={setSimSpeed}
            weatherDelayActive={weatherDelayActive}
            berthReallocated={berthReallocated}
            portCongestionActive={portCongestionActive}
            portDiverted={portDiverted}
            onTriggerWeatherDelay={triggerWeatherDelay}
            onApproveBerthReallocation={approveBerthReallocation}
            onTriggerPortCongestion={triggerPortCongestion}
            onApprovePortDiversion={approvePortDiversion}
            waitingForTruckGateScan={waitingForTruckGateScan}
            gateCleared={gateCleared}
            onScanGatePass={scanGatePass}
          />
        </div>
      )}
    </div>
  );
}
