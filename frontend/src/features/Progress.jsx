import { Check, ChevronLeft } from "lucide-react";

export default function ProgressStepper({
  title = "Create Plant Digital Twin",
  steps = ["UPLOAD", "CONSTRUCTION", "PREVIEW", "FINISH"],
  currentStep = "CONSTRUCTION",
  onBack,
}) {
  
  return (
    <div className="w-full px-2 py-1">
      <div className="flex h-[48px] items-center rounded-full bg-slate-950 px-7 shadow-md">
        {/* Left side */}
        <div className="flex min-w-[340px] items-center">
          <button
            type="button"
            onClick={onBack}
            className="
              mr-4 flex h-8 w-8 items-center justify-center rounded-full
              bg-blue-600 text-white shadow-[0_0_14px_rgba(59,130,246,0.55)]
              transition hover:bg-blue-700
            "
          >
            <ChevronLeft size={20} />
          </button>

          <h1 className="text-base font-bold text-white">
            {title}
          </h1>
        </div>

        <Progress steps={steps} currentStep={currentStep} />
        
    </div>
    </div>
  );
}

export function Progress({ steps, currentStep }) {
  const currentStepIndex = Math.max(steps.indexOf(currentStep), 0);

  const progressPercent =
    steps.length <= 1
      ? 0
      : (currentStepIndex / (steps.length - 1)) * 100;

  return (
    <div className="ml-auto w-[620px] max-w-[60%]">
      <div className="relative grid h-[36px] grid-rows-[16px_20px]">
        {/* Labels */}
        <div
          className="grid"
          style={{ gridTemplateColumns: `repeat(${steps.length}, 1fr)` }}
        >
          {steps.map((step, index) => {
            const isActive = index <= currentStepIndex;

            return (
              <div
                key={step}
                className={`
                  flex items-center justify-center text-center
                  text-[8px] font-bold uppercase leading-none tracking-[0.08em]
                  ${isActive ? "text-white" : "text-slate-400"}
                `}
              >
                {step}
              </div>
            );
          })}
        </div>

        {/* Circles + line */}
        <div className="relative flex items-center">
          {/* Background line - no outer lines */}
          <div
            className="
              absolute left-[10%] right-[10%] top-1/2 h-[3px]
              -translate-y-1/2 rounded-full bg-slate-700
            "
          />

          {/* Active line - no outer lines */}
          <div
            className="
              absolute left-[10%] top-1/2 h-[3px]
              -translate-y-1/2 rounded-full bg-blue-500
              transition-all duration-300
            "
            style={{
              width: `calc(80% * ${progressPercent / 100})`,
            }}
          />

          {/* Circles */}
          <div
            className="relative z-10 grid w-full"
            style={{ gridTemplateColumns: `repeat(${steps.length}, 1fr)` }}
          >
            {steps.map((step, index) => {
              const isActive = index <= currentStepIndex;

              return (
                <div key={step} className="flex justify-center">
                  <div
                    className={`
                      flex h-5 w-5 items-center justify-center rounded-full border-2
                      shadow-[0_0_10px_rgba(59,130,246,0.5)]
                      ${
                        isActive
                          ? "border-blue-500 bg-blue-600 text-white"
                          : "border-blue-500 bg-slate-950 text-blue-500"
                      }
                    `}
                  >
                    {isActive && <Check size={11} strokeWidth={3} />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}