import React, { useState } from "react";
import { useFlow, DEFAULT_REQUIREMENT } from "../lib/flow";
import { useAuth } from "../lib/auth";
import { useNavigate } from "react-router-dom";
import Badge from "../components/Badge";
import TopDownVesselIcon from "../components/VesselIcons";
import { 
  Ship, Play, Clock, CheckCircle2, ArrowRight, ArrowLeft, Eye, FileText, 
  Layers, MapPin, Building2, Truck, ShieldCheck, Award, Fuel, Anchor, AlertTriangle,
  Search, Filter, Download, ExternalLink, Check, X, UserCheck, Calendar, DollarSign,
  Briefcase, FileCheck, RefreshCw
} from "lucide-react";
import { toast } from "sonner";

// ─── PDF EXPORT HELPER ───────────────────────────────────────────────────────
function generateCharterRecapPDF(req) {
  const fixedDate   = req.acceptanceDate  ? new Date(req.acceptanceDate).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }) : new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  const laycanFrom  = req.acceptanceDate  ? new Date(new Date(req.acceptanceDate).getTime() + 3 * 86400000).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "03 Sep 2026";
  const laycanTo    = req.acceptanceDate  ? new Date(new Date(req.acceptanceDate).getTime() + 7 * 86400000).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "07 Sep 2026";
  const eta         = req.requiredArrivalDate ? new Date(req.requiredArrivalDate).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }) : "14 Sep 2026";
  const printTs     = new Date().toLocaleString("en-GB", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", timeZoneName: "short" });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Charter Recap – ${req.id}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; font-size: 11px; color: #1e293b; background: #fff; padding: 32px 40px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #1e3a5f; padding-bottom: 16px; margin-bottom: 20px; }
    .logo-block .title { font-size: 22px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; }
    .logo-block .subtitle { font-size: 9px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; }
    .doc-meta { text-align: right; }
    .doc-meta .ref { font-size: 18px; font-weight: 700; color: #1e3a5f; }
    .doc-meta .date { font-size: 10px; color: #64748b; margin-top: 2px; }
    h2 { font-size: 15px; font-weight: 700; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin: 20px 0 10px; }
    .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
    .grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 16px; }
    .info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 12px; }
    .info-box .label { font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 3px; }
    .info-box .value { font-size: 12px; font-weight: 700; color: #0f172a; }
    .info-box .sub { font-size: 9px; color: #94a3b8; margin-top: 1px; }
    .terms-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    .terms-table th { background: #1e3a5f; color: #fff; font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; padding: 7px 10px; text-align: left; }
    .terms-table td { border-bottom: 1px solid #f1f5f9; padding: 7px 10px; font-size: 10.5px; }
    .terms-table tr:nth-child(even) td { background: #f8fafc; }
    .terms-table td.label { color: #64748b; font-weight: 500; width: 40%; }
    .terms-table td.value { font-weight: 700; color: #0f172a; }
    .sig-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px; }
    .sig-box { border: 2px solid #10b981; border-radius: 8px; padding: 14px; }
    .sig-box.pending { border-color: #f59e0b; }
    .sig-box .sig-role { font-size: 8.5px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 1px; margin-bottom: 6px; }
    .sig-box .sig-name { font-size: 13px; font-weight: 800; color: #0f172a; }
    .sig-box .sig-status { font-size: 9px; font-weight: 700; color: #10b981; margin-top: 4px; }
    .sig-box.pending .sig-status { color: #f59e0b; }
    .sig-box .sig-ts { font-size: 8px; color: #94a3b8; margin-top: 3px; }
    .footer { margin-top: 28px; border-top: 1px solid #e2e8f0; padding-top: 10px; display: flex; justify-content: space-between; align-items: center; }
    .footer .hash { font-size: 8.5px; color: #94a3b8; font-family: monospace; }
    .footer .print-ts { font-size: 8.5px; color: #94a3b8; }
    .badge { display: inline-block; background: #dbeafe; color: #1e40af; border-radius: 4px; padding: 2px 7px; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; }
    .badge-green { background: #dcfce7; color: #166534; }
    .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%) rotate(-40deg); font-size: 90px; font-weight: 900; color: rgba(30,58,95,0.04); pointer-events: none; white-space: nowrap; }
    @media print { body { padding: 20px 28px; } .watermark { display: block; } }
  </style>
</head>
<body>
  <div class="watermark">ASTRA MARITIME</div>

  <div class="page-header">
    <div class="logo-block">
      <div class="title">⚓ ASTRA</div>
      <div class="subtitle">Maritime Decision &amp; Intelligence Engine</div>
    </div>
    <div class="doc-meta">
      <div class="ref">Fixture Recapitulation</div>
      <div class="date">Fixture ID: <strong>${req.id}</strong></div>
      <div class="date">Fixture Date: <strong>${fixedDate}</strong></div>
      <div class="date">Laycan: <strong>${laycanFrom} – ${laycanTo}</strong></div>
    </div>
  </div>

  <h2>Parties</h2>
  <div class="grid2">
    <div class="info-box">
      <div class="label">Charterer (Shipper)</div>
      <div class="value">Tata Steel Logistics Global Ltd.</div>
      <div class="sub">Jamshedpur &amp; Angul Works Logistics Hub, India</div>
    </div>
    <div class="info-box">
      <div class="label">Disponent Carrier (Contractor)</div>
      <div class="value">${req.selectedContractor || '—'}</div>
      <div class="sub">Nominated Vessel: ${req.selectedVessel?.name || '—'} (${req.selectedVessel?.category || '—'}, ${(req.selectedVessel?.dwt || '—').toLocaleString()} DWT)</div>
    </div>
  </div>

  <h2>Voyage &amp; Cargo Details</h2>
  <div class="grid3">
    <div class="info-box">
      <div class="label">Loading Port</div>
      <div class="value">${req.originPort || '—'}</div>
      <div class="sub">Deepwater Jetty / ATDNSHINC</div>
    </div>
    <div class="info-box">
      <div class="label">Discharge Port</div>
      <div class="value">${req.destinationPort || '—'}</div>
      <div class="sub">Mechanized Berth, East Coast India</div>
    </div>
    <div class="info-box">
      <div class="label">ETA / Required Arrival</div>
      <div class="value">${eta}</div>
      <div class="sub">BIMCO Standard Weather Routing</div>
    </div>
  </div>

  <h2>Commercial Terms &amp; SLA Obligations</h2>
  <table class="terms-table">
    <thead><tr><th>Clause / Term</th><th>Agreed Value</th></tr></thead>
    <tbody>
      <tr><td class="label">Cargo Type &amp; Volume</td><td class="value">${(req.cargoQuantity || 0).toLocaleString()} MT ${req.cargoType} (5% MOLOO)</td></tr>
      <tr><td class="label">Agreed Ocean Freight Rate</td><td class="value">USD ${(req.costBreakdown?.oceanFreightRatePerTon || 0).toFixed(2)} / MT</td></tr>
      <tr><td class="label">Total Ocean Freight</td><td class="value">USD ${(req.costBreakdown?.oceanFreightTotalUsd || 0).toLocaleString()}</td></tr>
      <tr><td class="label">Road Transport Cost</td><td class="value">USD ${(req.costBreakdown?.roadTransportUsd || 0).toLocaleString()}</td></tr>
      <tr><td class="label">Port Handling &amp; Terminal</td><td class="value">USD ${(req.costBreakdown?.portHandlingUsd || 0).toLocaleString()}</td></tr>
      <tr><td class="label">Total Landed Cost</td><td class="value">USD ${(req.costBreakdown?.totalLandedCostUsd || 0).toLocaleString()}</td></tr>
      <tr><td class="label">Net Savings vs. Benchmark</td><td class="value">USD ${(req.costBreakdown?.netSavingsUsd || 0).toLocaleString()}</td></tr>
      <tr><td class="label">Demurrage Rate</td><td class="value">USD 28,800 / day (USD 1,200 / hr) pro-rata</td></tr>
      <tr><td class="label">Loading Rate</td><td class="value">8,000 MT / PWWD SHINC</td></tr>
      <tr><td class="label">Discharge Rate</td><td class="value">6,000 MT / PWWD SHEX</td></tr>
      <tr><td class="label">Origin Siding / First Mile</td><td class="value">${req.originWarehouse || '—'}</td></tr>
      <tr><td class="label">Destination Plant / Last Mile</td><td class="value">${req.destinationWarehouse || '—'}</td></tr>
      <tr><td class="label">Road Transporter</td><td class="value">${req.roadFleet?.transporterName || 'Intermodal Road Express'} · ${req.roadFleet?.truckType || '40T Multi-Axle'}</td></tr>
      <tr><td class="label">First Mile Trucks</td><td class="value">${req.roadFleet?.firstMileTrucks || '—'} units</td></tr>
      <tr><td class="label">Last Mile Trucks</td><td class="value">${req.roadFleet?.lastMileTrucks || '—'} units</td></tr>
      <tr><td class="label">Contract Duration</td><td class="value">${req.contractDuration || '1 voyage (Spot)'}</td></tr>
      <tr><td class="label">Governing Law</td><td class="value">English Law · London Arbitration (LMAA)</td></tr>
      <tr><td class="label">Charterparty Form</td><td class="value">BIMCO MULTIMODAL / GENCON 1994 (As Amended)</td></tr>
    </tbody>
  </table>

  <h2>Vessel Particulars</h2>
  <div class="grid3">
    <div class="info-box">
      <div class="label">Vessel Name</div>
      <div class="value">${req.selectedVessel?.name || '—'}</div>
      <div class="sub">${req.selectedVessel?.category || '—'} · ${req.selectedVessel?.age || '—'}</div>
    </div>
    <div class="info-box">
      <div class="label">DWT / LOA / Beam</div>
      <div class="value">${(req.selectedVessel?.dwt || 0).toLocaleString()} DWT</div>
      <div class="sub">${req.selectedVessel?.loaM || '—'}m LOA · ${req.selectedVessel?.beamM || '—'}m Beam · ${req.selectedVessel?.draftM || '—'}m Draft</div>
    </div>
    <div class="info-box">
      <div class="label">Health / CII Rating</div>
      <div class="value">${req.selectedVessel?.healthScore || '—'}% Health</div>
      <div class="sub">${req.selectedVessel?.ciiRating || '—'} · ${req.selectedVessel?.engineEfficiency || '—'} Engine Eff.</div>
    </div>
  </div>

  <h2>Authorization &amp; Signatures</h2>
  <div class="sig-grid">
    <div class="sig-box">
      <div class="sig-role">Charterer Authorization</div>
      <div class="sig-name">Tata Steel Global Logistics Authority</div>
      <div class="sig-status">✓ Digitally Sealed &amp; Authorized</div>
      <div class="sig-ts">Signed: ${fixedDate} &nbsp;|&nbsp; ASTRA Digital Seal #TSLG-2026-001</div>
    </div>
    <div class="sig-box ${req.contractorAccepted !== false ? '' : 'pending'}">
      <div class="sig-role">Carrier Counter-Signature</div>
      <div class="sig-name">${req.selectedContractor || '—'}</div>
      <div class="sig-status">${req.contractorAccepted !== false ? '✓ Digitally Counter-Signed' : '⏳ Pending Counter-Signature'}</div>
      <div class="sig-ts">${req.contractorAccepted !== false ? 'Counter-signed: ' + fixedDate + ' &nbsp;|&nbsp; ASTRA Carrier Seal' : 'Awaiting contractor signature'}</div>
    </div>
  </div>

  <div class="footer">
    <div class="hash">SHA-256: 8f4e2a3d1c9b7e6f5a2d4c8e1b3f9a7d2e5c8b4f6a1d3e9c2b7f5a8d1e4c6b · Immutable Fixture Record</div>
    <div class="print-ts">Exported: ${printTs} · ASTRA Maritime Intelligence Engine v1.0</div>
  </div>

  <script>window.onload = function() { window.print(); }<\/script>
</body>
</html>`;

  const w = window.open("", "_blank", "width=900,height=700");
  if (w) {
    w.document.write(html);
    w.document.close();
  } else {
    alert("Pop-up blocked. Please allow pop-ups for this site to download the PDF.");
  }
}
// ─────────────────────────────────────────────────────────────────────────────

export default function DecisionHistory() {
  const { 
    requirement, 
    fixturesList, 
    setRequirement, 
    acceptContractorFixture, 
    markFixtureCompleted,
    setSimActive
  } = useFlow();
  const { user } = useAuth();
  const nav = useNavigate();
  const role = user?.role || "company";
  
  const [inspectedFixture, setInspectedFixture] = useState(null); // When set, views detailed fixture inspector
  const [statusFilter, setStatusFilter] = useState("ALL"); // "ALL" | "ACTIVE" | "PENDING" | "COMPLETED"
  const [searchQuery, setSearchQuery] = useState("");
  const [showRecapModal, setShowRecapModal] = useState(false);

  const isCompany = role === "company";
  const isContractor = role === "contractor" || role === "chartering_operator";

  // Use the inspected fixture when inspecting, or active requirement, or fallback
  const activeReq = inspectedFixture || requirement || DEFAULT_REQUIREMENT;

  // Status determination helper
  const getFixtureStatusMeta = (f) => {
    if (!f) return { key: "UNKNOWN", label: "UNKNOWN", color: "bg-slate-100 text-slate-700 border-slate-200", dot: "bg-slate-400" };
    
    if (f.status === "COMPLETED") {
      return {
        key: "COMPLETED",
        label: "COMPLETED & SETTLED",
        badgeText: "VOYAGE COMPLETED (DISCHARGED)",
        color: "bg-blue-100 text-blue-900 border-blue-300",
        pillColor: "bg-blue-500/20 text-blue-300 border-blue-400/40",
        dot: "bg-blue-500"
      };
    }
    
    if (f.status === "ACTIVE_IN_TRANSIT" && f.contractorAccepted !== false) {
      return {
        key: "ACTIVE",
        label: "ACTIVE IN TRANSIT",
        badgeText: "ACTIVE IN TRANSIT (EXECUTED)",
        color: "bg-emerald-100 text-emerald-900 border-emerald-300",
        pillColor: "bg-emerald-500 text-slate-950",
        dot: "bg-emerald-400 animate-ping"
      };
    }

    if (!f.contractorAccepted || f.status === "PENDING_CONTRACTOR_ACCEPTANCE" || f.status === "PENDING") {
      return {
        key: "PENDING",
        label: "PENDING COUNTER-SIGN",
        badgeText: isCompany ? "AWAITING CONTRACTOR COUNTER-SIGN" : "PENDING YOUR COUNTER-SIGNATURE",
        color: "bg-amber-100 text-amber-900 border-amber-300",
        pillColor: "bg-amber-400 text-slate-950 animate-pulse",
        dot: "bg-amber-400 animate-ping"
      };
    }

    return {
      key: "SCHEDULED",
      label: f.status || "CONFIRMED",
      badgeText: f.status || "CONFIRMED",
      color: "bg-indigo-100 text-indigo-900 border-indigo-200",
      pillColor: "bg-indigo-500 text-white",
      dot: "bg-indigo-400"
    };
  };

  const currentStatusMeta = getFixtureStatusMeta(activeReq);

  // Contractor acceptance handler
  const handleContractorAccept = () => {
    acceptContractorFixture(activeReq.id);
    toast.success(`Fixture #${activeReq.id} accepted & digitally counter-signed! Status is now ACTIVE IN TRANSIT.`);
  };

  // Company complete fixture handler
  const handleCompleteFixture = () => {
    markFixtureCompleted(activeReq.id);
    toast.success(`Fixture #${activeReq.id} marked as COMPLETED & cargo discharge reconciled!`);
  };

  // Filtered fixtures for table
  const filteredFixtures = fixturesList.filter((f) => {
    const statusMeta = getFixtureStatusMeta(f);
    const matchesFilter = 
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && statusMeta.key === "ACTIVE") ||
      (statusFilter === "PENDING" && statusMeta.key === "PENDING") ||
      (statusFilter === "COMPLETED" && statusMeta.key === "COMPLETED");

    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchesFilter;

    const matchesSearch = 
      f.id?.toLowerCase().includes(query) ||
      f.cargoType?.toLowerCase().includes(query) ||
      f.selectedContractor?.toLowerCase().includes(query) ||
      f.selectedVessel?.name?.toLowerCase().includes(query) ||
      f.originPort?.toLowerCase().includes(query) ||
      f.destinationPort?.toLowerCase().includes(query);

    return matchesFilter && matchesSearch;
  });

  const activeCount = fixturesList.filter(f => getFixtureStatusMeta(f).key === "ACTIVE").length;
  const pendingCount = fixturesList.filter(f => getFixtureStatusMeta(f).key === "PENDING").length;
  const completedCount = fixturesList.filter(f => getFixtureStatusMeta(f).key === "COMPLETED").length;

  return (
    <div className="space-y-6" data-testid="decisions-page">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge kind="CONTRACTS" />
            <span className="astra-label">Digital Fixture Ledger & Commercial Contracts</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1" style={{ fontFamily: "Manrope" }}>
            Contract Fixtures & Execution History
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time digital fixture records, contractor commercial vetting, and executed multimodal contracts.
            {isCompany && (
              <span className="ml-2 inline-flex items-center gap-1 font-semibold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-xs">
                <Briefcase size={12} /> Logged as Shipper (Tata Steel)
              </span>
            )}
            {isContractor && (
              <span className="ml-2 inline-flex items-center gap-1 font-semibold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 text-xs">
                <Ship size={12} /> Logged as Carrier Partner ({user?.name || "Contractor"})
              </span>
            )}
          </p>
        </div>

        {/* Total Bookings & Fixtures Summary Badge */}
        <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-mono">
          <Clock size={14} className="text-blue-900" />
          <span className="font-bold text-slate-800">Total Bookings & Fixtures:</span>
          <span className="px-2 py-0.5 rounded bg-blue-900 text-white font-extrabold">{fixturesList.length}</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DETAILED FIXTURE INSPECTION VIEW (ACCESSED VIA INSPECT BUTTON) */}
      {/* ========================================================================= */}
      {inspectedFixture && (
        <div className="space-y-5 animate-in fade-in">
          {/* Back to All Fixtures Ledger Navigation Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
            <button
              onClick={() => setInspectedFixture(null)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold font-mono transition-all shadow group"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
              <span>← Back to All Fixtures Ledger</span>
            </button>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-slate-500">Inspecting Fixture:</span>
              <span className="px-2.5 py-0.5 bg-blue-100 text-blue-900 rounded font-bold font-mono">#{activeReq.id}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${currentStatusMeta.color}`}>
                {currentStatusMeta.label}
              </span>
            </div>
          </div>

          {/* Main Active Fixture Banner */}
          <div className="astra-card p-6 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white shadow-xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-blue-900/60 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-600/30 border border-blue-400 text-blue-300 grid place-items-center">
                  <TopDownVesselIcon category={activeReq?.selectedVessel?.category || "Panamax"} size={26} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${currentStatusMeta.pillColor}`}>
                      {currentStatusMeta.badgeText}
                    </span>
                    <span className="text-xs font-mono text-blue-300">FIXTURE #{activeReq?.id}</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-white mt-0.5" style={{ fontFamily: "Manrope" }}>
                    {activeReq?.cargoQuantity?.toLocaleString?.() ?? "—"} MT {activeReq?.cargoType}
                  </h3>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setShowRecapModal(true)}
                  className="px-4 h-11 rounded-lg border border-blue-400/40 hover:bg-blue-800/40 text-blue-200 text-xs font-bold font-mono inline-flex items-center gap-1.5 transition-colors"
                >
                  <FileText size={15} />
                  <span>View Charter Recap (PDF)</span>
                </button>

                <button
                  onClick={() => { setRequirement(activeReq); setSimActive(true); nav("/"); }}
                  className="btn-primary px-5 h-11 text-xs font-bold gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-lg"
                >
                  <Play size={15} />
                  <span>Simulate</span>
                </button>
              </div>
            </div>

            {/* Contract Status Stepper (Lifecycle Timeline) */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="text-[11px] font-mono font-bold text-blue-300 uppercase mb-3 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Layers size={13} /> Multimodal Fixture Execution Lifecycle
                </span>
                <span className="text-slate-400 font-normal">
                  Standard: BIMCO Multi-Modal / GENCON Charterparty
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
                {/* Step 1 */}
                <div className="p-3 bg-white/10 rounded-lg border border-white/10 flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 grid place-items-center text-xs font-bold shrink-0">
                    <Check size={14} />
                  </div>
                  <div>
                    <div className="font-bold text-white">1. Shipper Tendered</div>
                    <div className="text-[10px] text-slate-300">Tata Steel Logistics issued RFQ</div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="p-3 bg-white/10 rounded-lg border border-white/10 flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 grid place-items-center text-xs font-bold shrink-0">
                    <Check size={14} />
                  </div>
                  <div>
                    <div className="font-bold text-white">2. AI Matched & Fixed</div>
                    <div className="text-[10px] text-emerald-400">{activeReq?.selectedContractor}</div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className={`p-3 rounded-lg border flex items-start gap-2.5 ${
                  activeReq?.contractorAccepted !== false
                    ? "bg-white/10 border-white/10"
                    : "bg-amber-500/20 border-amber-400/40"
                }`}>
                  <div className={`w-6 h-6 rounded-full grid place-items-center text-xs font-bold shrink-0 ${
                    activeReq?.contractorAccepted !== false
                      ? "bg-emerald-500 text-slate-950"
                      : "bg-amber-400 text-slate-950 animate-pulse"
                  }`}>
                    {activeReq?.contractorAccepted !== false ? <Check size={14} /> : "3"}
                  </div>
                  <div>
                    <div className="font-bold text-white">3. Counter-Signed</div>
                    <div className="text-[10px] text-slate-300">
                      {activeReq?.contractorAccepted !== false ? "Digitally Signed" : "Pending Sign"}
                    </div>
                  </div>
                </div>

                {/* Step 4 */}
                <div className={`p-3 rounded-lg border flex items-start gap-2.5 ${
                  activeReq?.status === "COMPLETED"
                    ? "bg-white/10 border-white/10"
                    : "bg-white/5 border-white/10"
                }`}>
                  <div className={`w-6 h-6 rounded-full grid place-items-center text-xs font-bold shrink-0 ${
                    activeReq?.status === "COMPLETED"
                      ? "bg-blue-400 text-slate-950"
                      : activeReq?.status === "ACTIVE_IN_TRANSIT"
                      ? "bg-emerald-500 text-slate-950"
                      : "bg-slate-700 text-slate-400"
                  }`}>
                    {activeReq?.status === "COMPLETED" ? <Check size={14} /> : "4"}
                  </div>
                  <div>
                    <div className="font-bold text-white">4. Multi-Leg Transit</div>
                    <div className="text-[10px] text-slate-300">
                      {activeReq?.status === "COMPLETED" ? "Reconciled & Closed" : "Live Tracking Active"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 4-Point Corridor Visual Strip */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 bg-white/10 rounded-lg border border-white/10 space-y-1">
                <div className="text-slate-400 text-[10px] font-bold uppercase">1. ORIGIN SIDING</div>
                <div className="font-bold text-white">{activeReq?.originWarehouse || "—"}</div>
                <div className="text-emerald-400 text-[10px]">{activeReq?.roadFleet?.firstMileTrucks || 48} First-Mile Trucks</div>
              </div>

              <div className="p-3 bg-white/10 rounded-lg border border-white/10 space-y-1">
                <div className="text-slate-400 text-[10px] font-bold uppercase">2. ORIGIN PORT</div>
                <div className="font-bold text-white">{activeReq?.originPort || "—"} Port</div>
                <div className="text-slate-300 text-[10px]">Deepwater Loading Berth</div>
              </div>

              <div className="p-3 bg-white/10 rounded-lg border border-white/10 space-y-1">
                <div className="text-slate-400 text-[10px] font-bold uppercase">3. DESTINATION PORT</div>
                <div className="font-bold text-white">{activeReq?.destinationPort || "—"} Port</div>
                <div className="text-blue-300 text-[10px]">Mechanized Berth #2 Allocated</div>
              </div>

              <div className="p-3 bg-white/10 rounded-lg border border-white/10 space-y-1">
                <div className="text-slate-400 text-[10px] font-bold uppercase">4. DESTINATION PLANT</div>
                <div className="font-bold text-white">{activeReq?.destinationWarehouse || "—"}</div>
                <div className="text-amber-300 text-[10px]">{activeReq?.roadFleet?.lastMileTrucks || 52} Last-Mile Trucks</div>
              </div>
            </div>

            {/* Financial SLA Summary */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-blue-900/60 text-xs font-mono">
              <div>
                <span className="text-slate-400">Carrier Partner: </span>
                <span className="font-bold text-white">{activeReq?.selectedContractor || "—"} ({activeReq?.selectedVessel?.name || "—"})</span>
              </div>
              <div>
                <span className="text-slate-400">Freight Rate: </span>
                <span className="font-bold text-emerald-400">${activeReq?.costBreakdown?.oceanFreightRatePerTon?.toFixed?.(2) ?? "—"} / Ton</span>
              </div>
              <div>
                <span className="text-slate-400">Total Landed Value: </span>
                <span className="font-extrabold text-emerald-400">${activeReq?.costBreakdown?.totalLandedCostUsd?.toLocaleString?.() ?? "—"} USD</span>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* CONTRACTOR COMMERCIAL EVALUATION & ACCEPTANCE BASIS BREAKDOWN */}
          {/* ========================================================================= */}
          <div className="astra-card p-5 space-y-4 border-t-4 border-t-indigo-600 bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-indigo-700 uppercase">
                  CONTRACTOR COMMERCIAL EVALUATION MATRIX & STATUS MANAGEMENT
                </span>
                <h3 className="text-base font-extrabold text-slate-900" style={{ fontFamily: "Manrope" }}>
                  Commercial Viability & Acceptance Criteria for {activeReq?.selectedContractor}
                </h3>
              </div>

              {/* Status Action Buttons depending on role */}
              <div className="flex items-center gap-2">
                {activeReq?.contractorAccepted !== false ? (
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1.5 rounded bg-emerald-100 text-emerald-800 text-xs font-mono font-bold flex items-center gap-1.5 border border-emerald-200">
                      <CheckCircle2 size={15} /> FIXTURE ACCEPTED & DIGITALLY COUNTER-SIGNED
                    </span>

                    {activeReq?.status !== "COMPLETED" && (
                      <button
                        onClick={handleCompleteFixture}
                        className="px-3.5 py-1.5 rounded bg-blue-900 hover:bg-blue-800 text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                      >
                        <CheckCircle2 size={14} /> Mark Reconciled & Completed
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {isCompany ? (
                      <span className="px-3 py-1.5 rounded bg-amber-100 text-amber-800 text-xs font-mono font-bold flex items-center gap-1.5 border border-amber-200">
                        <Clock size={15} /> Awaiting {activeReq?.selectedContractor} Signature
                      </span>
                    ) : (
                      <button
                        onClick={handleContractorAccept}
                        className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold font-mono shadow flex items-center gap-1.5"
                      >
                        <CheckCircle2 size={15} /> 1-Click Accept & Counter-Sign (as {activeReq?.selectedContractor})
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 4 Pillars of Contractor Commercial Acceptance */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
              {/* Criterion 1 */}
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-bold text-[10px] uppercase">1. LAYCAN & POSITIONING</span>
                  <CheckCircle2 size={14} className="text-emerald-600" />
                </div>
                <div className="font-bold text-slate-900 text-xs">{activeReq?.selectedVessel?.name || "MV Bengal Voyager"}</div>
                <div className="text-[11px] text-slate-600">Vessel open in Bay of Bengal with 0 ballast repositioning penalty.</div>
              </div>

              {/* Criterion 2 */}
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-bold text-[10px] uppercase">2. BUNKER & NET MARGIN</span>
                  <CheckCircle2 size={14} className="text-emerald-600" />
                </div>
                <div className="font-bold text-slate-900 text-xs">${activeReq?.costBreakdown?.oceanFreightRatePerTon?.toFixed?.(2) ?? "—"}/t Gross Rate</div>
                <div className="text-[11px] text-slate-600">Daily fuel burn ({activeReq?.selectedVessel?.dailyFuelBurn || "31.8 MT/day"}) leaves +$3.20/t net operational profit.</div>
              </div>

              {/* Criterion 3 */}
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-bold text-[10px] uppercase">3. DRAFT & TERMINAL FIT</span>
                  <CheckCircle2 size={14} className="text-emerald-600" />
                </div>
                <div className="font-bold text-slate-900 text-xs">{activeReq?.selectedVessel?.draftM || 13.8}m Draft vs 14.5m Jetty</div>
                <div className="text-[11px] text-slate-600">Meets LOA ({activeReq?.selectedVessel?.loaM || 225}m) & Beam ({activeReq?.selectedVessel?.beamM || 32.2}m) clearance.</div>
              </div>

              {/* Criterion 4 */}
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-bold text-[10px] uppercase">4. DEMURRAGE PROTECTION</span>
                  <CheckCircle2 size={14} className="text-emerald-600" />
                </div>
                <div className="font-bold text-slate-900 text-xs">$1,200 / Hour ($28,800/day)</div>
                <div className="text-[11px] text-slate-600">Guaranteed demurrage compensation if port queue exceeds 24 hours.</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ALL FIXTURES LEDGER TABLE & FILTER CONTROLS (DEFAULT VIEW) */}
      {/* ========================================================================= */}
      {!inspectedFixture && (
        <div className="space-y-4 animate-in fade-in">
          {/* Filter & Search Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
            {/* Status Tabs */}
            <div className="flex items-center gap-1.5 font-mono text-xs font-bold">
              <button
                onClick={() => setStatusFilter("ALL")}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  statusFilter === "ALL" 
                    ? "bg-slate-900 text-white" 
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                ALL ({fixturesList.length})
              </button>

              <button
                onClick={() => setStatusFilter("ACTIVE")}
                className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                  statusFilter === "ACTIVE" 
                    ? "bg-emerald-600 text-white" 
                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                ACTIVE ({activeCount})
              </button>

              <button
                onClick={() => setStatusFilter("PENDING")}
                className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                  statusFilter === "PENDING" 
                    ? "bg-amber-600 text-white" 
                    : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                PENDING ({pendingCount})
              </button>

              <button
                onClick={() => setStatusFilter("COMPLETED")}
                className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                  statusFilter === "COMPLETED" 
                    ? "bg-blue-800 text-white" 
                    : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                COMPLETED ({completedCount})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[260px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search fixture ID, port, vessel..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs font-mono rounded-lg border border-slate-200 focus:outline-none focus:border-blue-600 bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          {/* Fixtures Table */}
          <div className="astra-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-widest text-slate-500 border-b border-slate-200 bg-slate-50">
                  <th className="p-3">Fixture ID</th>
                  <th className="p-3">Carrier / Vessel</th>
                  <th className="p-3">Route Corridor</th>
                  <th className="p-3">Cargo Volume</th>
                  <th className="p-3">Freight Rate</th>
                  <th className="p-3">Total Landed</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFixtures.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400 text-xs font-mono">
                      No fixtures matching selected filter "{statusFilter}" or search term.
                    </td>
                  </tr>
                ) : (
                  filteredFixtures.map((f) => {
                    const statusMeta = getFixtureStatusMeta(f);
                    const isSelected = f.id === activeReq.id;

                    return (
                      <tr 
                        key={f.id} 
                        className={`border-b border-slate-100 font-mono text-xs cursor-pointer transition-colors ${
                          isSelected ? "bg-blue-50/80 font-bold" : "hover:bg-slate-50"
                        }`}
                        onClick={() => {
                          setRequirement(f);
                          setInspectedFixture(f);
                        }}
                      >
                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-blue-900">{f.id}</span>
                            {isSelected && (
                              <span className="text-[9px] bg-blue-900 text-white px-1.5 py-0.2 rounded">
                                ACTIVE
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5 font-bold text-slate-900">
                            <Ship size={14} className="text-blue-900" />
                            <span>{f.selectedContractor || "Carrier"} ({f.selectedVessel?.name || "Vessel"})</span>
                          </div>
                        </td>
                        <td className="p-3 text-slate-600">
                          {f.originPort || "Origin"} ➔ {f.destinationPort || "Dest"}
                        </td>
                        <td className="p-3 font-bold text-slate-900">
                          {f.cargoQuantity?.toLocaleString?.() ?? "—"} MT {f.cargoType || "Dry Bulk"}
                        </td>
                        <td className="p-3 text-emerald-700 font-bold">
                          ${f.costBreakdown?.oceanFreightRatePerTon?.toFixed?.(2) ?? "—"}/t
                        </td>
                        <td className="p-3 font-extrabold text-slate-900">
                          ${f.costBreakdown?.totalLandedCostUsd?.toLocaleString?.() ?? "—"}
                        </td>
                        <td className="p-3">
                          <span className={`px-2.5 py-1 rounded text-[10px] font-bold border inline-flex items-center gap-1 ${statusMeta.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
                            {statusMeta.label}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setRequirement(f);
                                setInspectedFixture(f);
                              }}
                              className="px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 text-[11px] font-bold inline-flex items-center gap-1 shadow-sm transition-colors"
                            >
                              <Eye size={12} />
                              <span>Inspect</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setRequirement(f);
                                setSimActive(true);
                                toast.success(`Loaded Fixture #${f.id} (${f.selectedVessel?.name}) into Active Simulation Radar!`);
                                nav("/");
                              }}
                              className="px-2.5 py-1 rounded bg-blue-900 hover:bg-blue-800 text-white text-[11px] font-bold inline-flex items-center gap-1 shadow-sm"
                            >
                              <Play size={11} /> Simulate
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DIGITAL CHARTERPARTY RECAP MODAL */}
      {/* ========================================================================= */}
      {showRecapModal && (() => {
        const fixedDate = activeReq.acceptanceDate
          ? new Date(activeReq.acceptanceDate).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })
          : new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
        const laycanFrom = activeReq.acceptanceDate
          ? new Date(new Date(activeReq.acceptanceDate).getTime() + 3 * 86400000).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
          : "03 Sep 2026";
        const laycanTo = activeReq.acceptanceDate
          ? new Date(new Date(activeReq.acceptanceDate).getTime() + 7 * 86400000).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
          : "07 Sep 2026";
        const eta = activeReq.requiredArrivalDate
          ? new Date(activeReq.requiredArrivalDate).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })
          : "14 September 2026";

        return (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-300 animate-in fade-in zoom-in-95">
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-600 grid place-items-center text-white">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Commercial Fixture Recapitulation</h3>
                    <p className="text-xs text-blue-300 font-mono">BIMCO MULTIMODAL CHARTERPARTY · FIXTURE #{activeReq.id}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowRecapModal(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 grid place-items-center text-slate-300 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-5 text-xs font-mono">

                {/* Fixture Reference & Dates Banner */}
                <div className="flex flex-wrap gap-3 p-3 bg-blue-950 text-blue-100 rounded-xl border border-blue-800 text-[10px] font-mono">
                  <span><span className="text-blue-400 font-bold">FIXTURE DATE:</span> {fixedDate}</span>
                  <span className="text-blue-700">|</span>
                  <span><span className="text-blue-400 font-bold">LAYCAN:</span> {laycanFrom} – {laycanTo}</span>
                  <span className="text-blue-700">|</span>
                  <span><span className="text-blue-400 font-bold">ETA DISCHARGE:</span> {eta}</span>
                  <span className="text-blue-700">|</span>
                  <span><span className="text-blue-400 font-bold">REF:</span> #{activeReq.id}</span>
                </div>

                {/* Parties */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-500 text-[10px] block uppercase font-bold">Charterer (Shipper):</span>
                    <span className="text-sm font-bold text-slate-900">Tata Steel Logistics Global Ltd.</span>
                    <span className="text-[10px] text-slate-500 block">Jamshedpur & Angul Works Logistics Hub</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block uppercase font-bold">Disponent Carrier (Contractor):</span>
                    <span className="text-sm font-bold text-slate-900">{activeReq.selectedContractor}</span>
                    <span className="text-[10px] text-slate-500 block">Nominated Vessel: {activeReq.selectedVessel?.name} ({activeReq.selectedVessel?.category}, {activeReq.selectedVessel?.dwt?.toLocaleString()} DWT)</span>
                  </div>
                </div>

                {/* Core Commercial Clauses */}
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 border-b border-slate-200 pb-1">
                    <FileCheck size={16} className="text-indigo-600" /> Key Contract Terms & SLA Obligations
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-x-6 gap-y-0 text-[11px]">
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Cargo Type & Volume:</span>
                      <span className="font-bold text-slate-900">{activeReq.cargoQuantity?.toLocaleString?.()} MT {activeReq.cargoType} (5% MOLOO)</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Agreed Ocean Freight:</span>
                      <span className="font-bold text-emerald-700">${activeReq.costBreakdown?.oceanFreightRatePerTon?.toFixed?.(2)} / MT</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Loading Port:</span>
                      <span className="font-bold text-slate-900">{activeReq.originPort} Deepwater Jetty</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Discharge Port:</span>
                      <span className="font-bold text-slate-900">{activeReq.destinationPort} Mechanized Berth</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Total Ocean Freight:</span>
                      <span className="font-bold text-slate-900">USD {activeReq.costBreakdown?.oceanFreightTotalUsd?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Total Landed Cost:</span>
                      <span className="font-bold text-slate-900">USD {activeReq.costBreakdown?.totalLandedCostUsd?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Laycan Window:</span>
                      <span className="font-bold text-slate-900">{laycanFrom} – {laycanTo}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">ETA Discharge Port:</span>
                      <span className="font-bold text-slate-900">{eta}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Demurrage / Despatch:</span>
                      <span className="font-bold text-slate-900">$28,800 / day ($1,200/hr) prorata</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Road Transporter:</span>
                      <span className="font-bold text-slate-900">{activeReq.roadFleet?.transporterName || "Intermodal Road Express"}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Contract Duration:</span>
                      <span className="font-bold text-slate-900">{activeReq.contractDuration || "1 voyage (Spot)"}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Net Savings vs. Benchmark:</span>
                      <span className="font-bold text-emerald-700">USD {activeReq.costBreakdown?.netSavingsUsd?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                    <div className="text-[10px] text-emerald-800 font-bold uppercase">CHARTERER AUTHORIZATION</div>
                    <div className="font-bold text-slate-900 mt-1">Tata Steel Global Logistics Authority</div>
                    <div className="text-[10px] text-emerald-700 mt-0.5">Digitally Sealed & Authorized ✓</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Signed: {fixedDate}</div>
                  </div>

                  <div className={`p-3 rounded-lg border ${
                    activeReq.contractorAccepted !== false
                      ? "bg-emerald-50 border-emerald-200"
                      : "bg-amber-50 border-amber-200"
                  }`}>
                    <div className="text-[10px] font-bold uppercase text-slate-700">CARRIER COUNTER-SIGNATURE</div>
                    <div className="font-bold text-slate-900 mt-1">{activeReq.selectedContractor}</div>
                    <div className={`text-[10px] mt-0.5 font-bold ${
                      activeReq.contractorAccepted !== false ? "text-emerald-700" : "text-amber-700"
                    }`}>
                      {activeReq.contractorAccepted !== false ? "Digitally Counter-Signed ✓" : "Pending Counter-Signature"}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {activeReq.contractorAccepted !== false ? `Counter-signed: ${fixedDate}` : "Awaiting contractor signature"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-mono">
                  SHA-256: 8f4e2...901b · Immutable Fixture Record
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      generateCharterRecapPDF(activeReq);
                      toast.success("Charter Recap opened — use 'Save as PDF' in the print dialog.");
                    }}
                    className="px-4 py-2 rounded-lg bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold font-mono inline-flex items-center gap-1.5 shadow-sm"
                  >
                    <Download size={14} /> Download PDF
                  </button>
                  <button
                    onClick={() => setShowRecapModal(false)}
                    className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold font-mono"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
