import { Building2, Check, MapPin, Settings2, AirVent, LayoutGrid, PanelsTopLeft } from "lucide-react";
import SpaceTypeAssignmentPage from "./SpaceTypeAssignmentPage.jsx"

function getIcon(type) {
  if (type === "building") return Building2;
  if (type === "construction") return PanelsTopLeft;
  if (type === "environment") return MapPin;
  if (type === "spaces") return LayoutGrid;
  if (type === "system") return AirVent;
  return Building2;
}

function OptionCardSelector({
  title,
  subtitle,
  badge,
  options = [],
  selectedValue,
  onSelect,
  type = "building",
  renderMeta,
  component,
  formData,
  selectedKey,
}) {
  const Icon = getIcon(type);

  console.log("OptionCardSelector");
  console.log(formData[formData.selectedKey]);

  return (
    <section className="flex min-h-0 flex-1 flex-col">
      {/* Fixed title/header */}
      <div className="mb-5 shrink-0 rounded-2xl border border-blue-100 bg-blue-50 p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white">
            <Icon size={21} />
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
              {badge}
            </div>

            <h3 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
              {title}
            </h3>

            <p className="mt-2 max-w-[650px] text-sm leading-6 text-slate-600">
              {subtitle}
            </p>
          </div>
        </div>
      </div>

      {(component === "ChoiceData") && 
        (<ChoiceData
          options={options}
          selectedValue={selectedValue}
          type={type}
          onSelect={onSelect}
          renderMeta={renderMeta}
        />)
      }

      {(component === "SpaceTypeAssignmentPage") && 
        (<SpaceTypeAssignmentPage 
          onSelect={onSelect}
          initialSpaces={formData[selectedKey] ?? {}}
        />)
      }

    </section>
  );
}

export default OptionCardSelector;


export function ChoiceData({
  options,
  selectedValue,
  type,
  onSelect,
  renderMeta,
}){
  return(
    <>
  {/* Only this part scrolls */}
      <div className="min-h-0 flex-1 overflow-y-auto pr-2">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {options.map((option) => {
            const isSelected = selectedValue === option.value;
            const CardIcon = getIcon(option.icon || type);

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onSelect(option.value)}
                className={`
                  group relative flex min-h-[86px] w-full items-center gap-4
                  rounded-2xl border px-4 py-3 text-left transition-colors
                  ${
                    isSelected
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/40"
                  }
                `}
              >
                <span
                  className={`
                    flex h-10 w-10 shrink-0 items-center justify-center rounded-xl
                    transition-colors
                    ${
                      isSelected
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600"
                    }
                  `}
                >
                  <CardIcon size={18} />
                </span>

                <div className="min-w-0 pr-8">
                  <div className="text-sm font-bold text-slate-950">
                    {option.label}
                  </div>

                  {option.description && (
                    <div className="mt-1 text-xs leading-5 text-slate-500">
                      {option.description}
                    </div>
                  )}

                  {renderMeta && (
                    <div className="mt-2">
                      {renderMeta(option)}
                    </div>
                  )}
                </div>

                {isSelected && (
                  <span className="absolute right-4 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-blue-600 text-white">
                    <Check size={14} strokeWidth={3} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      </>
  );
}