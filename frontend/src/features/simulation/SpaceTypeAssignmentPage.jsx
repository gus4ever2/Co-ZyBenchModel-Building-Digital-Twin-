import { useEffect, useState } from "react";
import { Check, ChevronDown, Layers } from "lucide-react";

const spaceTypeOptions = [
  {
    internalName: "BREAKROOM_CZ1_3",
    displayName: "189.1-2009 - Office - BreakRoom - CZ1-3",
  },
  {
    internalName: "BREAKROOM_CZ4_8",
    displayName: "189.1-2009 - Office - BreakRoom - CZ4-8",
  },
  {
    internalName: "CLOSEDOFFICE_CZ1_3",
    displayName: "189.1-2009 - Office - ClosedOffice - CZ1-3",
  },
  {
    internalName: "CLOSEDOFFICE_CZ4_8",
    displayName: "189.1-2009 - Office - ClosedOffice - CZ4-8",
  },
  {
    internalName: "CONFERENCE_CZ1_3",
    displayName: "189.1-2009 - Office - Conference - CZ1-3",
  },
  {
    internalName: "CONFERENCE_CZ4_8",
    displayName: "189.1-2009 - Office - Conference - CZ4-8",
  },
  {
    internalName: "LOBBY_CZ1_3",
    displayName: "189.1-2009 - Office - Lobby - CZ1-3",
  },
  {
    internalName: "LOBBY_CZ4_8",
    displayName: "189.1-2009 - Office - Lobby - CZ4-8",
  },
  {
    internalName: "OPENOFFICE_CZ1_3",
    displayName: "189.1-2009 - Office - OpenOffice - CZ1-3",
  },
  {
    internalName: "OPENOFFICE_CZ4_8",
    displayName: "189.1-2009 - Office - OpenOffice - CZ4-8",
  },
];

const initialSpacesCZ4 = {
  "Space OfficeL": "",
  "Space OfficeS": "",
  "Space Conference": "",
  "Space Kitchen": "",
  "Space OfficeM": "",
  "Space BreakRoom": "",
  "Space no hvac 1": "",
  "Space no hvac 2": "",
  "Space no hvac 3": "",
};

function SpaceAssignmentRow({ spaceName, value, options, onChange }) {
  const [open, setOpen] = useState(false);

  const selectedOption = options.find(
    (option) => option.internalName === value
  );

  const hasValue = Boolean(selectedOption);

  return (
    <div
      className={`
        grid grid-cols-[220px_1fr] items-center gap-4 border-b border-slate-100 px-4 py-3
        ${hasValue ? "bg-blue-50/40" : "bg-white"}
      `}
    >
      {/* Left: space name */}
      <div className="flex items-center gap-3">
        <span
          className={`
            h-2.5 w-2.5 rounded-full
            ${hasValue ? "bg-blue-600" : "bg-slate-300"}
          `}
        />

        <div>
          <div className="text-sm font-bold text-slate-950">
            {spaceName}
          </div>

          <div className="text-xs text-slate-400">
            Building space
          </div>
        </div>
      </div>

      {/* Right: custom dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((previous) => !previous)}
          className={`
            flex h-11 w-full items-center justify-between rounded-xl border px-4
            text-left text-sm font-medium outline-none transition-colors
            ${
              hasValue
                ? "border-blue-300 bg-white text-slate-800"
                : "border-slate-200 bg-slate-50 text-slate-500 hover:border-blue-300"
            }
          `}
        >
          <span className="line-clamp-1">
            {hasValue
              ? selectedOption.displayName
              : "Select space type"}
          </span>

          <ChevronDown
            size={17}
            className={`shrink-0 text-slate-400 transition ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>

        {open && (
          <div className="absolute left-0 right-0 top-[50px] z-50 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
            <div className="max-h-[230px] space-y-1 overflow-y-auto pr-1">
              {options.map((option) => {
                const isSelected = option.internalName === value;

                return (
                  <button
                    key={option.internalName}
                    type="button"
                    onClick={() => {
                      onChange(spaceName, option.internalName);
                      setOpen(false);
                    }}
                    className={`
                      flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5
                      text-left text-sm transition-colors
                      ${
                        isSelected
                          ? "bg-blue-50 font-semibold text-blue-700"
                          : "text-slate-700 hover:bg-slate-50"
                      }
                    `}
                  >
                    <span className="line-clamp-1">
                      {option.displayName}
                    </span>

                    {isSelected && (
                      <Check size={16} strokeWidth={3} className="shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


export default function SpaceTypeAssignmentPage({
  onSelect,
  initialSpaces
}) {
  const [spaces, setSpaces] = useState(
    initialSpaces && Object.keys(initialSpaces).length > 0
      ? initialSpaces
      : initialSpacesCZ4
  );

  function hasBlankSpaces(spaces) {
    return Object.values(spaces).some((value) => value.trim() === "");
  }

  function updateSpaceType(spaceName, selectedInternalName) {
    setSpaces((previous) => ({
      ...previous,
      [spaceName]: selectedInternalName,
    }));
  }

  useEffect(() => {
    if (!hasBlankSpaces(spaces)){
        onSelect(spaces);
      }
  }, [spaces]);

  return (
    <section className="mx-auto flex min-h-0 w-full max-w-[920px] flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto rounded-2xl border border-slate-200 bg-white">
            <div className="sticky top-0 z-10 grid grid-cols-[220px_1fr] gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                <div>Space</div>
                <div>Assigned space type</div>
            </div>

            {Object.entries(spaces).map(([spaceName, selectedValue]) => (
                <SpaceAssignmentRow
                  key={spaceName}
                  spaceName={spaceName}
                  value={selectedValue}
                  options={spaceTypeOptions}
                  onChange={updateSpaceType}
                />
            ))}

        </div>        
    </section>
  );
}