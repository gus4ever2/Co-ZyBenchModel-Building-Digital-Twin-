import { Leaf, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

function PlantSimulationCard({ percentage = 0, status = "IDLE", message }) {
  const safePercentage = Math.min(100, Math.max(0, Number(percentage) || 0));
  const displayPercentage = safePercentage.toFixed(2);

  const normalizedStatus = status?.toUpperCase();

  const statusConfig = {
    RUNNING: {
      label: "Running",
      icon: <Loader2 className="h-4 w-4 animate-spin" />,
      badge: "bg-blue-50 text-blue-700 border-blue-100",
      bar: "bg-blue-600",
      iconBox: "bg-blue-600",
    },
    COMPLETED: {
      label: "Completed",
      icon: <CheckCircle2 className="h-4 w-4" />,
      badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
      bar: "bg-emerald-600",
      iconBox: "bg-emerald-700",
    },
    ERROR: {
      label: "Error",
      icon: <AlertCircle className="h-4 w-4" />,
      badge: "bg-red-50 text-red-700 border-red-100",
      bar: "bg-red-600",
      iconBox: "bg-red-600",
    },
  };

  const config = statusConfig[normalizedStatus] ?? {
    label: normalizedStatus,
    icon: <Leaf className="h-4 w-4" />,
    badge: "bg-slate-50 text-slate-700 border-slate-100",
    bar: "bg-slate-600",
    iconBox: "bg-slate-800",
  };

  return (
    
      <div className="flex items-center gap-4 mt-5">
        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm ${config.iconBox}`}
        >
          <Leaf className="h-7 w-7" strokeWidth={1.8} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-start justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-950">
                Plant creation
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Creating plant structure with YplantQMC
              </p>
            </div>

            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${config.badge}`}
            >
              {config.icon}
              {config.label}
            </span>
          </div>

          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                Progress
              </span>

              <span className="text-sm font-bold text-slate-900">
                {displayPercentage}%
              </span>
            </div>

            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${config.bar}`}
                style={{ width: `${safePercentage}%` }}
              />
            </div>

            {message && (
              <p className="mt-3 text-xs font-medium text-slate-500">
                {message}
              </p>
            )}
          </div>
        </div>
      </div>
   
  );
}

export default PlantSimulationCard;