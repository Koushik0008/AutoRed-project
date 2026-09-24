import { useEffect, useState } from "react";
import axios from "axios";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Bot,
  Bug,
  CheckCircle2,
  FileText,
  LayoutDashboard,
  Play,
  Radar,
  RefreshCw,
  Search,
  Shield,
  Target,
  Terminal,
  XCircle,
  Zap,
  Trash2,
  Brain,
  GitBranch,
  ChevronDown,
  ChevronUp,
  CircleDot,
  Clock3,
} from "lucide-react";

const API_BASE_URL = "http://127.0.0.1:8000";

/* =========================================================
   SMALL REUSABLE COMPONENTS
========================================================= */

function StatCard({ icon: Icon, title, value, description }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            {title}
          </p>

          <p className="mt-3 text-3xl font-bold text-white">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {description}
          </p>
        </div>

        <div className="rounded-xl bg-cyan-500/10 p-3">
          <Icon size={21} className="text-cyan-400" />
        </div>
      </div>
    </div>
  );
}


function SeverityBar({ label, value, total }) {
  const percentage =
    total === 0
      ? 0
      : Math.round((value / total) * 100);

  return (
    <div className="mb-5">
      <div className="mb-2 flex justify-between text-sm">
        <span className="text-slate-300">
          {label}
        </span>

        <span className="text-slate-400">
          {value}
        </span>
      </div>

      <div className="h-2 rounded-full bg-slate-800">
        <div
          className="h-2 rounded-full bg-cyan-500 transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}


function ErrorBox({ message }) {
  if (!message) return null;

  return (
    <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
      <XCircle
        size={18}
        className="mt-0.5 shrink-0"
      />

      <span>{message}</span>
    </div>
  );
}


function SuccessBox({ message }) {
  if (!message) return null;

  return (
    <div className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-400">
      <CheckCircle2
        size={18}
        className="mt-0.5 shrink-0"
      />

      <span>{message}</span>
    </div>
  );
}


function LoadingState({ text = "Loading..." }) {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="text-center">
        <RefreshCw
          size={30}
          className="mx-auto animate-spin text-cyan-400"
        />

        <p className="mt-4 text-sm text-slate-400">
          {text}
        </p>
      </div>
    </div>
  );
}


function StatusBadge({ status }) {
  const normalized =
    String(status || "UNKNOWN").toUpperCase();

  const isGood =
    normalized === "COMPLETED" ||
    normalized === "SAFE" ||
    normalized === "ACTIVE" ||
    normalized === "NONE";

  const isDanger =
    normalized === "VULNERABLE" ||
    normalized === "FAILED" ||
    normalized === "CRITICAL" ||
    normalized === "HIGH";

  const className = isGood
    ? "bg-emerald-500/10 text-emerald-400"
    : isDanger
      ? "bg-red-500/10 text-red-400"
      : "bg-amber-500/10 text-amber-400";

  return (
    <span
      className={`rounded-lg px-3 py-1 text-xs font-semibold ${className}`}
    >
      {normalized}
    </span>
  );
}


/* =========================================================
   ADAPTIVE ITERATION CARD
========================================================= */

function AdaptiveIterationCard({
  item,
  index,
  total,
  expanded,
  onToggle,
}) {
  const vulnerable =
    String(item?.status || "").toUpperCase() ===
    "VULNERABLE";

  const safe =
    String(item?.status || "").toUpperCase() ===
    "SAFE";

  const adaptationReason =
    item?.adaptation_reason ||
    item?.adaptationReason ||
    "No adaptation explanation was returned for this iteration.";

  return (
    <div className="relative">
      {/* Connector */}
      {index < total - 1 && (
        <div className="absolute left-[23px] top-[58px] h-[calc(100%-25px)] w-px bg-slate-700" />
      )}

      <div className="relative flex gap-4">
        {/* Iteration node */}
        <div
          className={`relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border ${
            vulnerable
              ? "border-red-500/40 bg-red-500/10"
              : safe
                ? "border-emerald-500/30 bg-emerald-500/10"
                : "border-cyan-500/30 bg-cyan-500/10"
          }`}
        >
          {vulnerable ? (
            <Bug
              size={19}
              className="text-red-400"
            />
          ) : safe ? (
            <CheckCircle2
              size={19}
              className="text-emerald-400"
            />
          ) : (
            <CircleDot
              size={19}
              className="text-cyan-400"
            />
          )}
        </div>

        {/* Main card */}
        <div className="min-w-0 flex-1 pb-7">
          <div
            className={`overflow-hidden rounded-2xl border ${
              vulnerable
                ? "border-red-500/20 bg-red-500/[0.04]"
                : "border-slate-800 bg-slate-900/70"
            }`}
          >
            {/* Header */}
            <div className="border-b border-slate-800 p-5">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-lg bg-slate-800 px-3 py-1 text-xs font-semibold text-white">
                      Iteration {item?.iteration ?? index + 1}
                    </span>

                    <span className="flex items-center gap-1.5 rounded-lg bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-400">
                      <GitBranch size={13} />
                      {item?.strategy || "UNKNOWN"}
                    </span>

                    <StatusBadge
                      status={
                        item?.status ||
                        "UNKNOWN"
                      }
                    />

                    <StatusBadge
                      status={
                        item?.severity ||
                        "NONE"
                      }
                    />
                  </div>

                  <p className="mt-3 text-xs uppercase tracking-wider text-slate-600">
                    {item?.category ||
                      "SECURITY TEST"}
                  </p>
                </div>

                <button
                  onClick={onToggle}
                  className="flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  {expanded ? (
                    <>
                      <ChevronUp size={15} />
                      Collapse
                    </>
                  ) : (
                    <>
                      <ChevronDown size={15} />
                      View Details
                    </>
                  )}
                </button>
              </div>

              {/* Evaluator metrics */}
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-slate-950 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-slate-600">
                    Evaluator
                  </p>

                  <p
                    className={`mt-1 text-sm font-semibold ${
                      vulnerable
                        ? "text-red-400"
                        : "text-emerald-400"
                    }`}
                  >
                    {item?.status ||
                      "UNKNOWN"}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-950 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-slate-600">
                    Severity
                  </p>

                  <p className="mt-1 text-sm font-semibold text-white">
                    {item?.severity ||
                      "NONE"}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-950 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-slate-600">
                    Confidence
                  </p>

                  <p className="mt-1 text-sm font-semibold text-cyan-400">
                    {item?.confidence ??
                      "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Adaptation reason */}
            <div className="border-b border-slate-800 bg-cyan-500/[0.025] p-5">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-cyan-500/10 p-2">
                  <Brain
                    size={17}
                    className="text-cyan-400"
                  />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                    Adaptive Feedback
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {adaptationReason}
                  </p>
                </div>
              </div>
            </div>

            {/* Expanded details */}
            {expanded && (
              <div className="space-y-5 p-5">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs uppercase tracking-wider text-slate-500">
                      Generated Adversarial Prompt
                    </p>

                    <span className="text-[10px] text-slate-700">
                      AUTO-GENERATED
                    </span>
                  </div>

                  <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm leading-6 text-slate-300">
                    {item?.prompt ||
                      "Prompt unavailable."}
                  </pre>
                </div>

                <div>
                  <p className="mb-2 text-xs uppercase tracking-wider text-slate-500">
                    Target Response
                  </p>

                  <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm leading-6 text-slate-300">
                    {item?.target_response ||
                      "Response unavailable."}
                  </pre>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <div className="flex items-center gap-2">
                    <Shield
                      size={16}
                      className="text-cyan-400"
                    />

                    <p className="text-xs uppercase tracking-wider text-slate-500">
                      Policy Evaluator Analysis
                    </p>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    {item?.reason ||
                      "No evaluator explanation returned."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard({ onNewCampaign }) {
  const [summary, setSummary] =
    useState(null);

  const [findings, setFindings] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        summaryResponse,
        findingsResponse,
      ] = await Promise.all([
        axios.get(
          `${API_BASE_URL}/dashboard/summary`
        ),

        axios.get(
          `${API_BASE_URL}/findings`
        ),
      ]);

      setSummary(
        summaryResponse.data
      );

      setFindings(
        findingsResponse.data.findings ||
          []
      );
    } catch (err) {
      console.error(
        "Dashboard loading failed:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Unable to load dashboard data. Make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <LoadingState
        text="Loading dashboard..."
      />
    );
  }

  if (!summary) {
    return (
      <div className="space-y-5">
        <ErrorBox
          message={
            error ||
            "Dashboard data is unavailable."
          }
        />

        <button
          onClick={loadDashboard}
          className="rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-400"
        >
          Retry
        </button>
      </div>
    );
  }

  const severity =
    summary.severity || {};

  const critical =
    severity.critical || 0;

  const high =
    severity.high || 0;

  const medium =
    severity.medium || 0;

  const low =
    severity.low || 0;

  const severityTotal =
    critical +
    high +
    medium +
    low;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-medium text-cyan-400">
            SECURITY OPERATIONS CENTER
          </p>

          <h1 className="mt-1 text-3xl font-bold text-white">
            AutoRed Dashboard
          </h1>

          <p className="mt-2 text-slate-400">
            Autonomous LLM security testing and vulnerability discovery.
          </p>
        </div>

        <button
          onClick={onNewCampaign}
          className="flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400"
        >
          <Zap size={18} />
          New Campaign
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Radar}
          title="Total Campaigns"
          value={
            summary.total_campaigns ??
            0
          }
          description="Security campaigns created"
        />

        <StatCard
          icon={Terminal}
          title="Total Attacks"
          value={
            summary.total_attacks ??
            0
          }
          description="Prompts executed"
        />

        <StatCard
          icon={Bug}
          title="Vulnerabilities"
          value={
            summary.total_findings ??
            0
          }
          description="Security findings discovered"
        />

        <StatCard
          icon={AlertTriangle}
          title="Vulnerable Attacks"
          value={
            summary.vulnerable_attacks ??
            0
          }
          description="Successful security tests"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-lg bg-slate-800 p-2">
              <Shield
                size={19}
                className="text-cyan-400"
              />
            </div>

            <div>
              <h2 className="font-semibold text-white">
                Risk Distribution
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Findings grouped by severity
              </p>
            </div>
          </div>

          <SeverityBar
            label="Critical"
            value={critical}
            total={severityTotal}
          />

          <SeverityBar
            label="High"
            value={high}
            total={severityTotal}
          />

          <SeverityBar
            label="Medium"
            value={medium}
            total={severityTotal}
          />

          <SeverityBar
            label="Low"
            value={low}
            total={severityTotal}
          />

          {severityTotal === 0 && (
            <p className="text-sm text-slate-500">
              No findings have been recorded yet.
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70">
          <div className="flex items-center justify-between border-b border-slate-800 p-6">
            <div>
              <h2 className="font-semibold text-white">
                Recent Findings
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Latest vulnerabilities discovered
              </p>
            </div>

            <button
              onClick={loadDashboard}
              className="rounded-lg border border-slate-700 p-2 text-slate-400 hover:text-white"
              title="Refresh"
            >
              <RefreshCw size={17} />
            </button>
          </div>

          {findings.length === 0 ? (
            <div className="p-10 text-center">
              <Shield
                size={36}
                className="mx-auto text-slate-700"
              />

              <p className="mt-3 text-sm text-slate-400">
                No findings discovered yet.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {findings
                .slice(0, 5)
                .map((finding) => (
                  <div
                    key={finding.id}
                    className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-white">
                        {finding.title}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Campaign #
                        {finding.campaign_id}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <StatusBadge
                        status={
                          finding.severity
                        }
                      />

                      <span className="text-xs text-slate-500">
                        Confidence{" "}
                        {finding.confidence}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {error && (
        <ErrorBox message={error} />
      )}
    </div>
  );
}


/* =========================================================
   TARGETS
========================================================= */

function Targets() {
  const [targets, setTargets] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [showAddTarget, setShowAddTarget] =
    useState(false);

  const [name, setName] =
    useState("");

  const [targetType, setTargetType] =
    useState("MOCK");

  const [endpoint, setEndpoint] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [creating, setCreating] =
    useState(false);

  const loadTargets = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await axios.get(
          `${API_BASE_URL}/targets`
        );

      setTargets(
        response.data.targets || []
      );
    } catch (err) {
      console.error(
        "Failed to load targets:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Unable to load targets. Make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTargets();
  }, []);

  const resetForm = () => {
    setName("");
    setTargetType("MOCK");
    setEndpoint("");
    setDescription("");
  };

  const handleCreateTarget = async (
    event
  ) => {
    event.preventDefault();

    if (!name.trim()) return;

    try {
      setCreating(true);
      setError("");

      await axios.post(
        `${API_BASE_URL}/targets`,
        {
          name: name.trim(),
          target_type: targetType,
          endpoint_url:
            endpoint.trim() || null,
          description:
            description.trim() || null,
        }
      );

      resetForm();
      setShowAddTarget(false);

      await loadTargets();
    } catch (err) {
      console.error(
        "Failed to create target:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Failed to create target."
      );
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteTarget = async (
    targetId
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this target?"
      );

    if (!confirmed) return;

    try {
      setError("");

      await axios.delete(
        `${API_BASE_URL}/targets/${targetId}`
      );

      await loadTargets();
    } catch (err) {
      console.error(
        "Failed to delete target:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Failed to delete target."
      );
    }
  };

  if (loading) {
    return (
      <LoadingState
        text="Loading targets..."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-medium text-cyan-400">
            TARGET MANAGEMENT
          </p>

          <h1 className="mt-1 text-3xl font-bold text-white">
            Authorized Targets
          </h1>

          <p className="mt-2 text-slate-400">
            Manage AI systems authorized for AutoRed security testing.
          </p>
        </div>

        <button
          onClick={() =>
            setShowAddTarget(true)
          }
          className="flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-400"
        >
          <Target size={18} />
          Add Target
        </button>
      </div>

      <ErrorBox message={error} />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={Target}
          title="Total Targets"
          value={targets.length}
          description="Registered AI targets"
        />

        <StatCard
          icon={CheckCircle2}
          title="Active Targets"
          value={
            targets.filter(
              (t) =>
                t.status === "ACTIVE"
            ).length
          }
          description="Currently available"
        />

        <StatCard
          icon={Shield}
          title="Authorized Testing"
          value="ENABLED"
          description="Controlled security environment"
        />
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/70">
        <div className="flex items-center justify-between border-b border-slate-800 p-6">
          <div>
            <h2 className="font-semibold text-white">
              Registered Targets
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              AI systems available for security campaigns
            </p>
          </div>

          <button
            onClick={loadTargets}
            className="rounded-lg border border-slate-700 p-2 text-slate-400 hover:text-white"
            title="Refresh"
          >
            <RefreshCw size={17} />
          </button>
        </div>

        {targets.length === 0 ? (
          <div className="p-12 text-center">
            <Target
              size={40}
              className="mx-auto text-slate-700"
            />

            <h3 className="mt-4 font-semibold text-white">
              No targets registered
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Add an authorized AI target to begin security testing.
            </p>

            <button
              onClick={() =>
                setShowAddTarget(true)
              }
              className="mt-5 rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
            >
              Add Your First Target
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {targets.map((target) => (
              <div
                key={target.id}
                className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-semibold text-white">
                      {target.name}
                    </h3>

                    <StatusBadge
                      status={target.status}
                    />

                    <span className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs text-slate-400">
                      {target.target_type}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-slate-500">
                    {target.description ||
                      "No description provided."}
                  </p>

                  {target.endpoint && (
                    <p className="mt-1 truncate text-xs text-slate-600">
                      {target.endpoint}
                    </p>
                  )}
                </div>

                <button
                  onClick={() =>
                    handleDeleteTarget(
                      target.id
                    )
                  }
                  className="flex items-center justify-center gap-2 rounded-xl border border-red-500/20 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 p-6">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-cyan-400">
                  TARGET REGISTRATION
                </p>

                <h2 className="mt-1 text-xl font-bold text-white">
                  Add New Target
                </h2>
              </div>

              <button
                onClick={() =>
                  setShowAddTarget(false)
                }
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-800 hover:text-white"
              >
                <XCircle size={21} />
              </button>
            </div>

            <form
              onSubmit={
                handleCreateTarget
              }
              className="space-y-5 p-6"
            >
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Target Name
                </label>

                <input
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  required
                  placeholder="e.g. Customer Support AI"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Target Type
                </label>

                <select
                  value={targetType}
                  onChange={(e) =>
                    setTargetType(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
                >
                  <option value="MOCK">
                    Mock Target — Local Testing
                  </option>

                  <option
                    value="API"
                    disabled
                  >
                    API Target — Coming Soon
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Endpoint
                  <span className="ml-2 text-xs text-slate-600">
                    Optional
                  </span>
                </label>

                <input
                  value={endpoint}
                  onChange={(e) =>
                    setEndpoint(
                      e.target.value
                    )
                  }
                  placeholder="https://example.com/api/chat"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(e) =>
                    setDescription(
                      e.target.value
                    )
                  }
                  rows={4}
                  placeholder="Describe the authorized target..."
                  className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-800 pt-5">
                <button
                  type="button"
                  onClick={() =>
                    setShowAddTarget(false)
                  }
                  className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-medium text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creating}
                  className="flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {creating ? (
                    <>
                      <RefreshCw
                        size={16}
                        className="animate-spin"
                      />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Target size={16} />
                      Create Target
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


/* =========================================================
   NEW CAMPAIGN
========================================================= */

function NewCampaign({
  onBack,
  onCampaignCreated,
}) {
  const [targets, setTargets] =
    useState([]);

  const [objective, setObjective] =
    useState(
      "Test whether the target discloses restricted information"
    );

  const [category, setCategory] =
    useState(
      "SENSITIVE_INFORMATION_DISCLOSURE"
    );

  const [maxIterations, setMaxIterations] =
    useState(3);

  const [targetId, setTargetId] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadTargets = async () => {
      try {
        setError("");

        const response =
          await axios.get(
            `${API_BASE_URL}/targets`
          );

        const targetList =
          response.data.targets || [];

        setTargets(targetList);

        if (targetList.length > 0) {
          setTargetId(
            String(targetList[0].id)
          );
        }
      } catch (err) {
        console.error(
          "Failed to load targets:",
          err
        );

        setError(
          err.response?.data?.detail ||
            "Unable to load targets. Make sure the backend is running."
        );
      }
    };

    loadTargets();
  }, []);

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (!targetId) {
      setError(
        "Please create/select a target before creating a campaign."
      );

      return;
    }

    try {
      setLoading(true);
      setMessage("");
      setError("");

      const response =
        await axios.post(
          `${API_BASE_URL}/campaigns`,
          {
            objective:
              objective.trim(),

            category,

            max_iterations:
              Number(maxIterations),

            target_id:
              Number(targetId),
          }
        );

      const campaign =
        response.data.campaign;

      setMessage(
        `Campaign #${campaign.id} created successfully.`
      );

      window.setTimeout(() => {
        onCampaignCreated(
          campaign.id
        );
      }, 500);
    } catch (err) {
      console.error(
        "Campaign creation failed:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Failed to create campaign."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-sm text-slate-400 hover:text-white"
      >
        <ArrowLeft size={17} />
        Back
      </button>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-8">
        <div className="mb-8">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10">
            <Radar
              size={25}
              className="text-cyan-400"
            />
          </div>

          <p className="text-xs font-medium uppercase tracking-wider text-cyan-400">
            CAMPAIGN CONFIGURATION
          </p>

          <h1 className="mt-1 text-3xl font-bold text-white">
            Create Security Campaign
          </h1>

          <p className="mt-2 text-slate-400">
            Configure an autonomous AutoRed security testing campaign.
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Authorized Target
            </label>

            <select
              value={targetId}
              onChange={(e) =>
                setTargetId(
                  e.target.value
                )
              }
              disabled={
                targets.length === 0
              }
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500 disabled:opacity-50"
            >
              {targets.length === 0 ? (
                <option value="">
                  No targets available
                </option>
              ) : (
                targets.map(
                  (target) => (
                    <option
                      key={target.id}
                      value={target.id}
                    >
                      {target.name} —{" "}
                      {target.target_type}
                    </option>
                  )
                )
              )}
            </select>

            {targets.length === 0 && (
              <p className="mt-2 text-xs text-amber-400">
                Go to Targets and create an authorized target first.
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Security Objective
            </label>

            <textarea
              value={objective}
              onChange={(e) =>
                setObjective(
                  e.target.value
                )
              }
              rows={4}
              required
              className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Security Category
            </label>

            <select
              value={category}
              onChange={(e) =>
                setCategory(
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
            >
              <option value="SENSITIVE_INFORMATION_DISCLOSURE">
                Sensitive Information Disclosure
              </option>

              <option value="PROMPT_INJECTION">
                Prompt Injection
              </option>

              <option value="JAILBREAK">
                Jailbreak
              </option>

              <option value="SYSTEM_PROMPT_LEAKAGE">
                System Prompt Leakage
              </option>

              <option value="AUTHORIZATION_BYPASS">
                Authorization Bypass
              </option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Maximum Iterations
            </label>

            <input
              type="number"
              min="1"
              max="20"
              value={maxIterations}
              onChange={(e) =>
                setMaxIterations(
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
            />

            <p className="mt-2 text-xs text-slate-500">
              AutoRed can stop early when a vulnerability is discovered.
            </p>
          </div>

          <SuccessBox
            message={message}
          />

          <ErrorBox message={error} />

          <button
            onClick={handleSubmit}
            disabled={
              loading ||
              targets.length === 0 ||
              !objective.trim()
            }
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw
                  size={18}
                  className="animate-spin"
                />
                Creating Campaign...
              </>
            ) : (
              <>
                <Play size={18} />
                Create Campaign
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}


/* =========================================================
   CAMPAIGNS
========================================================= */

function Campaigns({
  onOpenCampaign,
  onNewCampaign,
}) {
  const [campaigns, setCampaigns] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await axios.get(
          `${API_BASE_URL}/campaigns`
        );

      setCampaigns(
        response.data.campaigns ||
          []
      );
    } catch (err) {
      console.error(
        "Failed to load campaigns:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Unable to load campaigns. Make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  if (loading) {
    return (
      <LoadingState
        text="Loading campaigns..."
      />
    );
  }

  const completedCount =
    campaigns.filter(
      (campaign) =>
        campaign.status ===
        "COMPLETED"
    ).length;

  const activeCount =
    campaigns.filter(
      (campaign) =>
        campaign.status ===
          "RUNNING" ||
        campaign.status ===
          "CREATED"
    ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-medium text-cyan-400">
            CAMPAIGN MANAGEMENT
          </p>

          <h1 className="mt-1 text-3xl font-bold text-white">
            Security Campaigns
          </h1>

          <p className="mt-2 text-slate-400">
            View and execute authorized AutoRed security campaigns.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={loadCampaigns}
            className="flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-3 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <RefreshCw size={17} />
            Refresh
          </button>

          <button
            onClick={onNewCampaign}
            className="flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-400"
          >
            <Radar size={18} />
            New Campaign
          </button>
        </div>
      </div>

      <ErrorBox message={error} />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={Activity}
          title="Total Campaigns"
          value={campaigns.length}
          description="Security campaigns created"
        />

        <StatCard
          icon={CheckCircle2}
          title="Completed"
          value={completedCount}
          description="Completed campaigns"
        />

        <StatCard
          icon={Radar}
          title="Active / Ready"
          value={activeCount}
          description="Campaigns available for execution"
        />
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/70">
        <div className="border-b border-slate-800 p-6">
          <h2 className="font-semibold text-white">
            Campaign History
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            All security testing campaigns stored by AutoRed.
          </p>
        </div>

        {campaigns.length === 0 ? (
          <div className="p-12 text-center">
            <Radar
              size={40}
              className="mx-auto text-slate-700"
            />

            <h3 className="mt-4 font-semibold text-white">
              No campaigns yet
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Create your first security testing campaign to begin.
            </p>

            <button
              onClick={onNewCampaign}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
            >
              <Play size={17} />
              Create Campaign
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {campaigns.map(
              (campaign) => (
                <div
                  key={campaign.id}
                  className="p-6 transition hover:bg-slate-800/30"
                >
                  <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-lg bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
                          Campaign #
                          {campaign.id}
                        </span>

                        <StatusBadge
                          status={
                            campaign.status
                          }
                        />
                      </div>

                      <h3 className="mt-4 font-semibold text-white">
                        {campaign.objective}
                      </h3>

                      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                          <p className="text-xs text-slate-600">
                            Target
                          </p>

                          <p className="mt-1 text-slate-300">
                            {campaign.target_name ||
                              `Target #${campaign.target_id}`}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-600">
                            Category
                          </p>

                          <p className="mt-1 text-slate-300">
                            {campaign.category}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-600">
                            Iterations
                          </p>

                          <p className="mt-1 text-slate-300">
                            {
                              campaign.total_iterations
                            }{" "}
                            /{" "}
                            {
                              campaign.max_iterations
                            }
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-600">
                            Created
                          </p>

                          <p className="mt-1 text-slate-300">
                            {campaign.created_at
                              ? new Date(
                                  campaign.created_at
                                ).toLocaleString()
                              : "—"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        onOpenCampaign(
                          campaign.id
                        )
                      }
                      className="flex shrink-0 items-center justify-center gap-2 rounded-xl border border-cyan-500/30 px-5 py-3 text-sm font-semibold text-cyan-400 hover:bg-cyan-500/10"
                    >
                      <Terminal size={17} />
                      Open Campaign
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}


/* =========================================================
   LIVE CAMPAIGN
========================================================= */

function LiveCampaign({
  campaignId,
  onBack,
  onCompleted,
}) {
  const [running, setRunning] =
    useState(false);

  const [result, setResult] =
    useState(null);

  const [campaign, setCampaign] =
    useState(null);

  const [error, setError] =
    useState("");

  const [completed, setCompleted] =
    useState(false);

  const [expandedIterations, setExpandedIterations] =
    useState({});

  const loadCampaign = async () => {
    try {
      const response =
        await axios.get(
          `${API_BASE_URL}/campaigns/${campaignId}`
        );

      setCampaign(
        response.data.campaign ||
          response.data
      );
    } catch (err) {
      console.error(
        "Failed to load campaign:",
        err
      );
    }
  };

  useEffect(() => {
    setResult(null);
    setCompleted(false);
    setError("");
    setExpandedIterations({});
    loadCampaign();
  }, [campaignId]);

  const runCampaign = async () => {
    try {
      setRunning(true);
      setError("");
      setResult(null);
      setCompleted(false);
      setExpandedIterations({});

      const response =
        await axios.post(
          `${API_BASE_URL}/campaigns/${campaignId}/run`
        );

      setResult(
        response.data
      );

      setCompleted(true);

      if (onCompleted) {
        onCompleted();
      }

      await loadCampaign();
    } catch (err) {
      console.error(
        "Campaign execution failed:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Campaign execution failed."
      );
    } finally {
      setRunning(false);
    }
  };

  const results =
    result?.results || [];

  const vulnerabilityCount =
    results.filter(
      (item) =>
        item.status ===
        "VULNERABLE"
    ).length;

  const safeCount =
    results.filter(
      (item) =>
        item.status === "SAFE"
    ).length;

  const toggleIteration = (
    index
  ) => {
    setExpandedIterations(
      (previous) => ({
        ...previous,
        [index]:
          !previous[index],
      })
    );
  };

  const expandAll = () => {
    const expanded = {};

    results.forEach(
      (_, index) => {
        expanded[index] = true;
      }
    );

    setExpandedIterations(
      expanded
    );
  };

  const collapseAll = () => {
    setExpandedIterations({});
  };

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-white"
      >
        <ArrowLeft size={17} />
        Back to Campaigns
      </button>

      {/* Campaign header */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-7">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-cyan-500/10 p-3">
                <Radar
                  size={25}
                  className="text-cyan-400"
                />
              </div>

              <div>
                <p className="text-xs font-medium text-cyan-400">
                  AUTONOMOUS SECURITY CAMPAIGN
                </p>

                <h1 className="text-2xl font-bold text-white">
                  Campaign #
                  {campaignId}
                </h1>
              </div>
            </div>

            {campaign && (
              <p className="mt-4 max-w-3xl text-sm text-slate-400">
                {campaign.objective}
              </p>
            )}

            {!campaign && (
              <p className="mt-4 text-sm text-slate-500">
                AutoRed will generate security tests, send them to the authorized target, evaluate responses, and record findings.
              </p>
            )}
          </div>

          {!running && (
            <button
              onClick={runCampaign}
              disabled={completed}
              className="flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Play size={18} />

              {completed
                ? "Campaign Completed"
                : "Run Campaign"}
            </button>
          )}

          {running && (
            <div className="flex items-center gap-3 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-5 py-3 text-sm text-cyan-400">
              <RefreshCw
                size={18}
                className="animate-spin"
              />

              AutoRed is testing the target...
            </div>
          )}
        </div>
      </div>

      <ErrorBox message={error} />

      {/* Campaign execution results */}
      {result && (
        <>
          {/* Summary cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard
              icon={Terminal}
              title="Tests Executed"
              value={results.length}
              description="Security iterations performed"
            />

            <StatCard
              icon={Bug}
              title="Vulnerabilities"
              value={vulnerabilityCount}
              description="Detected during execution"
            />

            <StatCard
              icon={Shield}
              title="Safe Tests"
              value={safeCount}
              description="Tests without detected violation"
            />

            <StatCard
              icon={Brain}
              title="Adaptive Mode"
              value="ACTIVE"
              description="Feedback-driven generation"
            />
          </div>

          {/* Adaptive engine banner */}
          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.04] p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-cyan-500/10 p-3">
                <Brain
                  size={24}
                  className="text-cyan-400"
                />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                  AUTONOMOUS ADAPTIVE ENGINE
                </p>

                <h2 className="mt-1 text-lg font-bold text-white">
                  Feedback-driven attack generation
                </h2>

                <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-400">
                  AutoRed evaluates each target response and uses the result to influence the next security test. Strategy, prompt construction, and attack approach can change between iterations.
                </p>
              </div>
            </div>
          </div>

          {/* Timeline heading */}
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-cyan-400">
                AUTONOMOUS REASONING TRACE
              </p>

              <h2 className="mt-1 text-2xl font-bold text-white">
                Adaptive Attack Timeline
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Follow how AutoRed changed its testing strategy based on evaluator feedback.
              </p>
            </div>

            {results.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={expandAll}
                  className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  Expand All
                </button>

                <button
                  onClick={collapseAll}
                  className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  Collapse All
                </button>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 md:p-7">
            {results.length === 0 ? (
              <div className="p-10 text-center">
                <Radar
                  size={42}
                  className="mx-auto text-slate-700"
                />

                <p className="mt-4 text-sm text-slate-500">
                  The campaign completed but returned no iteration results.
                </p>
              </div>
            ) : (
              <div>
                {results.map(
                  (item, index) => (
                    <AdaptiveIterationCard
                      key={
                        item.iteration ??
                        index
                      }
                      item={item}
                      index={index}
                      total={
                        results.length
                      }
                      expanded={
                        !!expandedIterations[
                          index
                        ]
                      }
                      onToggle={() =>
                        toggleIteration(
                          index
                        )
                      }
                    />
                  )
                )}
              </div>
            )}
          </div>

          {/* Final campaign result */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-slate-800 p-3">
                {vulnerabilityCount >
                0 ? (
                  <AlertTriangle
                    size={22}
                    className="text-red-400"
                  />
                ) : (
                  <CheckCircle2
                    size={22}
                    className="text-emerald-400"
                  />
                )}
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  CAMPAIGN OUTCOME
                </p>

                <h2 className="mt-1 text-lg font-bold text-white">
                  {vulnerabilityCount >
                  0
                    ? `${vulnerabilityCount} vulnerability detected`
                    : "No vulnerability detected"}
                  {vulnerabilityCount !==
                    1 &&
                    vulnerabilityCount >
                      0
                    ? "ies"
                    : ""}
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  AutoRed completed{" "}
                  {results.length}{" "}
                  security iteration
                  {results.length === 1
                    ? ""
                    : "s"}{" "}
                  for this campaign.
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {!result && !running && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-10 text-center">
          <Radar
            size={42}
            className="mx-auto text-slate-700"
          />

          <h2 className="mt-4 font-semibold text-white">
            Ready for execution
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Start the campaign to generate attacks, evaluate responses, and record vulnerabilities.
          </p>
        </div>
      )}
    </div>
  );
}


/* =========================================================
   ATTACK EXPLORER
========================================================= */

function AttackExplorer() {
  const [attacks, setAttacks] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [severityFilter, setSeverityFilter] =
    useState("ALL");

  const [categoryFilter, setCategoryFilter] =
    useState("ALL");

  const [selectedAttack, setSelectedAttack] =
    useState(null);

  const loadAttacks = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await axios.get(
          `${API_BASE_URL}/attacks`
        );

      setAttacks(
        response.data.attacks || []
      );
    } catch (err) {
      console.error(
        "Failed to load attacks:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Unable to load attacks. Make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttacks();
  }, []);

  const categories = [
    ...new Set(
      attacks
        .map(
          (attack) =>
            attack.category
        )
        .filter(Boolean)
    ),
  ];

  const filteredAttacks =
    attacks.filter(
      (attack) => {
        const matchesStatus =
          statusFilter === "ALL" ||
          attack.status ===
            statusFilter;

        const matchesSeverity =
          severityFilter === "ALL" ||
          attack.severity ===
            severityFilter;

        const matchesCategory =
          categoryFilter === "ALL" ||
          attack.category ===
            categoryFilter;

        return (
          matchesStatus &&
          matchesSeverity &&
          matchesCategory
        );
      }
    );

  if (loading) {
    return (
      <LoadingState
        text="Loading attack history..."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-medium text-cyan-400">
            SECURITY TELEMETRY
          </p>

          <h1 className="mt-1 text-3xl font-bold text-white">
            Attack Explorer
          </h1>

          <p className="mt-2 text-slate-400">
            Inspect every adversarial test generated and evaluated by AutoRed.
          </p>
        </div>

        <button
          onClick={loadAttacks}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-3 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      <ErrorBox message={error} />

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          icon={Terminal}
          title="Total Attacks"
          value={attacks.length}
          description="Stored security tests"
        />

        <StatCard
          icon={Bug}
          title="Vulnerable"
          value={
            attacks.filter(
              (a) =>
                a.status ===
                "VULNERABLE"
            ).length
          }
          description="Tests that exposed a policy issue"
        />

        <StatCard
          icon={Shield}
          title="Safe"
          value={
            attacks.filter(
              (a) =>
                a.status === "SAFE"
            ).length
          }
          description="Tests without a detected violation"
        />

        <StatCard
          icon={Search}
          title="Showing"
          value={
            filteredAttacks.length
          }
          description="Matching current filters"
        />
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <div className="mb-4 flex items-center gap-2">
          <Search
            size={17}
            className="text-cyan-400"
          />

          <h2 className="font-semibold text-white">
            Attack Filters
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500">
              Status
            </label>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
            >
              <option value="ALL">
                All Statuses
              </option>

              <option value="VULNERABLE">
                Vulnerable
              </option>

              <option value="SAFE">
                Safe
              </option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500">
              Severity
            </label>

            <select
              value={severityFilter}
              onChange={(e) =>
                setSeverityFilter(
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
            >
              <option value="ALL">
                All Severities
              </option>

              <option value="CRITICAL">
                Critical
              </option>

              <option value="HIGH">
                High
              </option>

              <option value="MEDIUM">
                Medium
              </option>

              <option value="LOW">
                Low
              </option>

              <option value="NONE">
                None
              </option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500">
              Category
            </label>

            <select
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
            >
              <option value="ALL">
                All Categories
              </option>

              {categories.map(
                (category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category}
                  </option>
                )
              )}
            </select>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/70">
        <div className="border-b border-slate-800 p-6">
          <h2 className="font-semibold text-white">
            Attack History
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            {filteredAttacks.length}{" "}
            attack
            {filteredAttacks.length ===
            1
              ? ""
              : "s"}{" "}
            match the selected filters.
          </p>
        </div>

        {filteredAttacks.length ===
        0 ? (
          <div className="p-12 text-center">
            <Terminal
              size={42}
              className="mx-auto text-slate-700"
            />

            <h3 className="mt-4 font-semibold text-white">
              No matching attacks
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Run a campaign or change the filters.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {filteredAttacks.map(
              (attack) => (
                <div
                  key={attack.id}
                  className="p-6 transition hover:bg-slate-800/20"
                >
                  <div className="flex flex-col justify-between gap-5 lg:flex-row">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-lg bg-slate-800 px-3 py-1 text-xs text-slate-300">
                          Attack #
                          {attack.id}
                        </span>

                        <span className="rounded-lg bg-slate-800 px-3 py-1 text-xs text-slate-400">
                          Campaign #
                          {
                            attack.campaign_id
                          }
                        </span>

                        <span className="rounded-lg bg-slate-800 px-3 py-1 text-xs text-slate-400">
                          Iteration{" "}
                          {
                            attack.iteration
                          }
                        </span>

                        <StatusBadge
                          status={
                            attack.status
                          }
                        />

                        <StatusBadge
                          status={
                            attack.severity
                          }
                        />
                      </div>

                      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                        <div>
                          <span className="text-slate-600">
                            Strategy:{" "}
                          </span>

                          <span className="text-cyan-400">
                            {
                              attack.strategy
                            }
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-600">
                            Category:{" "}
                          </span>

                          <span className="text-slate-300">
                            {
                              attack.category
                            }
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-600">
                            Confidence:{" "}
                          </span>

                          <span className="text-slate-300">
                            {
                              attack.confidence
                            }
                          </span>
                        </div>
                      </div>

                      {/* Adaptive feedback preview */}
                      {attack.adaptation_reason && (
                        <div className="mt-4 flex items-start gap-3 rounded-xl border border-cyan-500/10 bg-cyan-500/[0.03] p-4">
                          <Brain
                            size={16}
                            className="mt-0.5 shrink-0 text-cyan-400"
                          />

                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400">
                              Adaptive Feedback
                            </p>

                            <p className="mt-1 text-xs leading-5 text-slate-400">
                              {
                                attack.adaptation_reason
                              }
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="mt-5 grid gap-4 lg:grid-cols-2">
                        <div>
                          <p className="mb-2 text-xs uppercase tracking-wider text-slate-600">
                            Generated Prompt
                          </p>

                          <div className="max-h-32 overflow-auto rounded-xl bg-slate-950 p-4 text-sm leading-6 text-slate-300">
                            {
                              attack.prompt
                            }
                          </div>
                        </div>

                        <div>
                          <p className="mb-2 text-xs uppercase tracking-wider text-slate-600">
                            Target Response
                          </p>

                          <div className="max-h-32 overflow-auto rounded-xl bg-slate-950 p-4 text-sm leading-6 text-slate-300">
                            {
                              attack.target_response
                            }
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        setSelectedAttack(
                          attack
                        )
                      }
                      className="flex h-fit shrink-0 items-center justify-center gap-2 rounded-xl border border-cyan-500/30 px-5 py-3 text-sm font-semibold text-cyan-400 hover:bg-cyan-500/10"
                    >
                      <Search size={17} />
                      Inspect
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {selectedAttack && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-800 bg-slate-900 p-6">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-cyan-400">
                  ATTACK DETAIL
                </p>

                <h2 className="mt-1 text-xl font-bold text-white">
                  Attack #
                  {
                    selectedAttack.id
                  }
                </h2>
              </div>

              <button
                onClick={() =>
                  setSelectedAttack(
                    null
                  )
                }
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-800 hover:text-white"
              >
                <XCircle size={22} />
              </button>
            </div>

            <div className="space-y-6 p-6">
              <div className="flex flex-wrap gap-3">
                <StatusBadge
                  status={
                    selectedAttack.status
                  }
                />

                <StatusBadge
                  status={
                    selectedAttack.severity
                  }
                />

                <span className="rounded-lg bg-slate-800 px-3 py-1 text-xs text-slate-400">
                  {
                    selectedAttack.category
                  }
                </span>

                <span className="rounded-lg bg-slate-800 px-3 py-1 text-xs text-slate-400">
                  {
                    selectedAttack.strategy
                  }
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-xl bg-slate-950 p-4">
                  <p className="text-xs text-slate-600">
                    Campaign
                  </p>

                  <p className="mt-1 text-sm text-white">
                    #
                    {
                      selectedAttack.campaign_id
                    }
                  </p>
                </div>

                <div className="rounded-xl bg-slate-950 p-4">
                  <p className="text-xs text-slate-600">
                    Iteration
                  </p>

                  <p className="mt-1 text-sm text-white">
                    {
                      selectedAttack.iteration
                    }
                  </p>
                </div>

                <div className="rounded-xl bg-slate-950 p-4">
                  <p className="text-xs text-slate-600">
                    Severity
                  </p>

                  <p className="mt-1 text-sm text-white">
                    {
                      selectedAttack.severity
                    }
                  </p>
                </div>

                <div className="rounded-xl bg-slate-950 p-4">
                  <p className="text-xs text-slate-600">
                    Confidence
                  </p>

                  <p className="mt-1 text-sm text-white">
                    {
                      selectedAttack.confidence
                    }
                  </p>
                </div>
              </div>

              {/* Adaptive feedback */}
              <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/[0.04] p-5">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-cyan-500/10 p-2">
                    <Brain
                      size={17}
                      className="text-cyan-400"
                    />
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-cyan-400">
                      Why This Attack Was Generated
                    </p>

                    <p className="mt-3 text-sm leading-7 text-slate-300">
                      {selectedAttack.adaptation_reason ||
                        "No adaptation reason was recorded for this attack."}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs uppercase tracking-wider text-slate-500">
                  Generated Adversarial Prompt
                </p>

                <pre className="whitespace-pre-wrap rounded-xl bg-slate-950 p-5 text-sm leading-7 text-slate-300">
                  {
                    selectedAttack.prompt
                  }
                </pre>
              </div>

              <div>
                <p className="mb-2 text-xs uppercase tracking-wider text-slate-500">
                  Target Response
                </p>

                <pre className="whitespace-pre-wrap rounded-xl bg-slate-950 p-5 text-sm leading-7 text-slate-300">
                  {
                    selectedAttack.target_response
                  }
                </pre>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Policy Evaluator Analysis
                </p>

                <p className="mt-3 text-sm leading-7 text-slate-300">
                  {
                    selectedAttack.reason
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


/* =========================================================
   FINDINGS
========================================================= */

function Findings() {
  const [findings, setFindings] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadFindings = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await axios.get(
          `${API_BASE_URL}/findings`
        );

      setFindings(
        response.data.findings ||
          []
      );
    } catch (err) {
      console.error(
        "Failed to load findings:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Unable to load findings. Make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFindings();
  }, []);

  if (loading) {
    return (
      <LoadingState
        text="Loading findings..."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-medium text-cyan-400">
            SECURITY FINDINGS
          </p>

          <h1 className="mt-1 text-3xl font-bold text-white">
            Vulnerability Findings
          </h1>

          <p className="mt-2 text-slate-400">
            Findings recorded by the AutoRed evaluator.
          </p>
        </div>

        <button
          onClick={loadFindings}
          className="flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      <ErrorBox message={error} />

      <div className="rounded-2xl border border-slate-800 bg-slate-900/70">
        {findings.length === 0 ? (
          <div className="p-12 text-center">
            <Bug
              size={42}
              className="mx-auto text-slate-700"
            />

            <h2 className="mt-4 font-semibold text-white">
              No findings yet
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Run a security campaign to populate this page.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {findings.map(
              (finding) => (
                <div
                  key={finding.id}
                  className="p-6"
                >
                  <div className="flex flex-col justify-between gap-4 lg:flex-row">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-lg bg-slate-800 px-3 py-1 text-xs text-slate-300">
                          Finding #
                          {finding.id}
                        </span>

                        <StatusBadge
                          status={
                            finding.severity
                          }
                        />
                      </div>

                      <h2 className="mt-4 text-lg font-semibold text-white">
                        {
                          finding.title
                        }
                      </h2>

                      <p className="mt-2 text-sm text-cyan-400">
                        {
                          finding.category
                        }
                      </p>
                    </div>

                    <div className="text-sm text-slate-500">
                      Campaign #
                      {
                        finding.campaign_id
                      }
                    </div>
                  </div>

                  <div className="mt-5 grid gap-5 lg:grid-cols-2">
                    <div className="rounded-xl bg-slate-950 p-4">
                      <p className="text-xs uppercase tracking-wider text-slate-500">
                        Reason
                      </p>

                      <p className="mt-2 text-sm leading-6 text-slate-300">
                        {
                          finding.reason
                        }
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-950 p-4">
                      <p className="text-xs uppercase tracking-wider text-slate-500">
                        Evidence
                      </p>

                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-300">
                        {
                          finding.evidence
                        }
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 text-xs text-slate-600">
                    Confidence:{" "}
                    {
                      finding.confidence
                    }
                  </p>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}


/* =========================================================
   PLACEHOLDER
========================================================= */

function PlaceholderPage({
  title,
  description,
  icon: Icon,
}) {
  return (
    <div className="flex min-h-[500px] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800">
          <Icon
            size={30}
            className="text-cyan-400"
          />
        </div>

        <h1 className="mt-5 text-2xl font-bold text-white">
          {title}
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          {description}
        </p>

        <p className="mt-4 text-xs text-slate-600">
          This module is planned for the next AutoRed development phase.
        </p>
      </div>
    </div>
  );
}


/* =========================================================
   MAIN APP
========================================================= */

function App() {
  const [page, setPage] =
    useState("dashboard");

  const [campaignId, setCampaignId] =
    useState(null);

  const openNewCampaign = () => {
    setPage("new-campaign");
  };

  const openCampaign = (id) => {
    setCampaignId(id);
    setPage("live-campaign");
  };

  const handleCampaignCreated = (
    id
  ) => {
    setCampaignId(id);
    setPage("live-campaign");
  };

  const goDashboard = () => {
    setPage("dashboard");
  };

  const goCampaigns = () => {
    setPage("campaigns");
  };

  const navigationItems = [
    {
      key: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      action: goDashboard,
    },

    {
      key: "new-campaign",
      label: "New Campaign",
      icon: Radar,
      action: openNewCampaign,
    },

    {
      key: "targets",
      label: "Targets",
      icon: Target,
      action: () =>
        setPage("targets"),
    },

    {
      key: "campaigns",
      label: "Campaigns",
      icon: Activity,
      action: goCampaigns,
    },

    {
      key: "attack-explorer",
      label: "Attack Explorer",
      icon: Terminal,
      action: () =>
        setPage(
          "attack-explorer"
        ),
    },

    {
      key: "findings",
      label: "Findings",
      icon: Bug,
      action: () =>
        setPage("findings"),
    },

    {
      key: "reports",
      label: "Reports",
      icon: FileText,
      action: () =>
        setPage("reports"),
    },
  ];

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-200">
      <div className="flex min-h-screen">

        {/* =================================================
            SIDEBAR
        ================================================= */}

        <aside className="hidden w-64 shrink-0 border-r border-slate-800 bg-[#090e18] lg:flex lg:flex-col">
          <div className="flex h-20 items-center gap-3 border-b border-slate-800 px-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10">
              <Bot
                size={23}
                className="text-cyan-400"
              />
            </div>

            <div>
              <h1 className="font-bold tracking-wide text-white">
                AutoRed
              </h1>

              <p className="text-[10px] tracking-widest text-slate-500">
                LLM RED-TEAMING
              </p>
            </div>
          </div>

          <nav className="flex-1 space-y-2 p-4">
            {navigationItems.map(
              (item) => {
                const Icon =
                  item.icon;

                return (
                  <button
                    key={item.key}
                    onClick={
                      item.action
                    }
                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                      page === item.key
                        ? "bg-cyan-500/10 text-cyan-400"
                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <Icon size={18} />

                    {item.label}
                  </button>
                );
              }
            )}
          </nav>

          <div className="border-t border-slate-800 p-5">
            <div className="rounded-xl bg-slate-950 p-4">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />

                <span className="text-xs font-medium text-emerald-400">
                  ENGINE ONLINE
                </span>
              </div>

              <p className="mt-2 text-[11px] text-slate-600">
                Autonomous security testing ready
              </p>
            </div>
          </div>
        </aside>

        {/* =================================================
            MAIN CONTENT
        ================================================= */}

        <main className="min-w-0 flex-1">
          <header className="flex h-20 items-center justify-between border-b border-slate-800 bg-[#080d17] px-5 md:px-8">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                AutoRed Security Platform
              </p>

              <p className="mt-1 text-sm text-slate-300">
                Autonomous LLM Red-Teaming
              </p>
            </div>

            <div className="hidden items-center gap-2 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 sm:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />

              <span className="text-xs text-slate-400">
                System Operational
              </span>
            </div>
          </header>

          <div className="p-5 md:p-8">
            {page ===
              "dashboard" && (
              <Dashboard
                onNewCampaign={
                  openNewCampaign
                }
              />
            )}

            {page ===
              "new-campaign" && (
              <NewCampaign
                onBack={
                  goDashboard
                }
                onCampaignCreated={
                  handleCampaignCreated
                }
              />
            )}

            {page === "targets" && (
              <Targets />
            )}

            {page === "campaigns" && (
              <Campaigns
                onOpenCampaign={
                  openCampaign
                }
                onNewCampaign={
                  openNewCampaign
                }
              />
            )}

            {page ===
              "live-campaign" &&
              campaignId && (
                <LiveCampaign
                  campaignId={
                    campaignId
                  }
                  onBack={
                    goCampaigns
                  }
                  onCompleted={() => {}}
                />
              )}

            {page ===
              "attack-explorer" && (
              <AttackExplorer />
            )}

            {page === "findings" && (
              <Findings />
            )}

            {page === "reports" && (
              <PlaceholderPage
                title="Reports"
                description="Generate and review security assessment reports."
                icon={FileText}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;