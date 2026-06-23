import { useState, useEffect } from "react";
import axios from "axios";

const groups = [
  {
    id: "exteriorSurfaces",
    title: "Exterior Surface Constructions",
    fields: [
      { key: "exteriorWall", label: "Walls" },
      { key: "exteriorFloor", label: "Floors" },
      { key: "exteriorRoof", label: "Roofs" },
    ],
  },
  {
    id: "interiorSurfaces",
    title: "Interior Surface Constructions",
    fields: [
      { key: "interiorWall", label: "Walls" },
      { key: "interiorFloor", label: "Floors" },
      { key: "interiorCeiling", label: "Ceilings" },
    ],
  },
  {
    id: "groundContactSurfaces",
    title: "Ground Contact Surface Constructions",
    fields: [
      { key: "groundContactWall", label: "Walls" },
      { key: "groundContactFloor", label: "Floors" },
      { key: "groundContactCeiling", label: "Ceilings" },
    ],
  },
  {
    id: "exteriorSubSurfaces",
    title: "Exterior Sub Surface Constructions",
    fields: [
      { key: "exteriorFixedWindow", label: "Fixed Windows" },
      { key: "exteriorOperableWindow", label: "Operable Windows" },
      { key: "exteriorDoor", label: "Doors" },
      { key: "exteriorGlassDoor", label: "Glass Doors" },
      { key: "exteriorOverheadDoor", label: "Overhead Doors" },
      { key: "exteriorSkylight", label: "Skylights" },
      { key: "exteriorTubularDaylightDome", label: "Tubular Daylight Domes" },
      { key: "exteriorTubularDaylightDiffuser", label: "Tubular Daylight Diffusers" },
    ],
  },
  {
    id: "interiorSubSurfaces",
    title: "Interior Sub Surface Constructions",
    fields: [
      { key: "interiorFixedWindow", label: "Fixed Windows" },
      { key: "interiorOperableWindow", label: "Operable Windows" },
      { key: "interiorDoor", label: "Doors" },
    ],
  },
  {
    id: "otherConstructions",
    title: "Other Constructions",
    fields: [
      { key: "spaceShading", label: "Space Shading" },
      { key: "buildingShading", label: "Building Shading" },
      { key: "siteShading", label: "Site Shading" },
      { key: "interiorPartition", label: "Interior Partition" },
      { key: "adiabaticSurface", label: "Adiabatic Surface" },
    ],
  },
];

function ConstructionChip({ construction, onRemove }) {
  if (!construction) return null;

  return (
    <div className="flex w-full items-center justify-between gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 shadow-sm">
      <div className="min-w-0 flex-1">
        <div
          title={construction}
          className="break-words text-[11px] font-semibold leading-tight text-blue-950 sm:text-xs"
        >
          {construction}
        </div>
      </div>

      <button
        type="button"
        onClick={onRemove}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 font-semibold leading-none text-white shadow-sm transition hover:bg-blue-700 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-300"
       >
        <span className="flex h-full w-full items-center justify-center text-[20px] font-semibold leading-none -translate-y-[1px]">
          ×
        </span>
      </button>
    </div>
  );
}

function EmptySlot({ field, onAssign, constructionLibrary }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredConstructions = constructionLibrary.filter((construction) =>
    construction.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative rounded-xl border border-slate-200 bg-slate-50 p-3">
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        className="
          flex w-full items-center justify-between rounded-lg
          border border-slate-200 bg-white px-3 py-2.5
          text-left text-xs font-semibold text-slate-700 shadow-sm
          transition hover:border-blue-300 hover:bg-blue-50
          focus:outline-none focus:ring-2 focus:ring-blue-100
        "
      >
        <span>Select construction</span>
        <span className="text-slate-400">+</span>
      </button>

      {open && (
        <div
          className="
            absolute left-0 right-0 top-[52px] z-50
            rounded-xl border border-slate-200 bg-white p-3
            shadow-xl
          "
        >
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search construction..."
            className="
              mb-2 w-full rounded-lg border border-slate-300
              px-3 py-2 text-xs outline-none
              focus:border-blue-500 focus:ring-2 focus:ring-blue-100
            "
          />

          <div className="max-h-48 space-y-1 overflow-y-auto pr-1">
            {filteredConstructions.map((construction) => (
              <button
                key={construction.id}
                type="button"
                onClick={() => {
                  onAssign(field.key, construction.name);
                  setOpen(false);
                  setSearch("");
                }}
                className="
                  flex w-full items-center gap-2 rounded-lg px-3 py-2
                  text-left text-xs font-semibold text-slate-700 transition
                  hover:bg-blue-50 hover:text-blue-700
                "
              >
                <span className="h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                <span className="min-w-0 truncate">
                  {construction.name}
                </span>
              </button>
            ))}

            {filteredConstructions.length === 0 && (
              <div className="rounded-lg bg-slate-50 px-3 py-3 text-center text-xs text-slate-500">
                No constructions found.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ConstructionSlot({
  field,
  assignedConstruction,
  onAssign,
  onRemove,
  constructionLibrary,
}) {
  return (
    <div className="min-h-[145px] rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-xs font-bold text-slate-950 sm:text-sm">
        {field.label}
      </h3>

      {assignedConstruction ? (
        <ConstructionChip
          construction={assignedConstruction}
          onRemove={() => onRemove(field.key)}
        />
      ) : (
        <EmptySlot
          field={field}
          onAssign={onAssign}
          constructionLibrary={constructionLibrary}
        />
      )}
    </div>
  );
}

export default function ConstructionSet({ currentState }) {
  const component = currentState.options.component;

  const category = currentState.category;

  const [constructionSetName, setConstructionSetName] = useState(
    component.properties.Name
  );

  const [assignments, setAssignments] = useState(
    component.properties ?? {}
  );

  const [activeTab, setActiveTab] = useState(groups[0].id);

  const constructionLibrary =
    currentState.options.selectableComponentDescriptions.componentParts ?? [];

  useEffect(() => {
    setConstructionSetName(component.Name ?? component.name ?? "");
    setAssignments(component.properties ?? {});
  }, [component.id]);

  function assignConstruction(fieldKey, constructionName) {
    setAssignments((previousAssignments) => ({
      ...previousAssignments,
      [fieldKey]: constructionName,
    }));
  }

  function removeConstruction(fieldKey) {
    setAssignments((previousAssignments) => {
      const nextAssignments = { ...previousAssignments };
      nextAssignments[fieldKey] = null;
      return nextAssignments;
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const token = localStorage.getItem("token");

    try {
      // Create Response JSON
    const responseFormJson = {};
    responseFormJson["id"] = component.id;
    responseFormJson["type"] = component.type;
    assignments.Name = component.properties.Name;
    responseFormJson["properties"] = assignments;

    console.log("Update response:", responseFormJson);

    // Find Token
    const token = localStorage.getItem("token");

    const response = await axios.put(
      "http://localhost:8080/constructions/update",
      responseFormJson,
      {
        params: {
          type: component.type,
          className: currentState.metaData[component.type].enumClass,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

      
    } catch (error) {
      console.error("Failed to update construction set:", error);
    }
  }

  const activeGroup = groups.find((group) => group.id === activeTab);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="mx-auto w-full max-w-7xl space-y-4 px-2 py-6 sm:space-y-6 sm:px-4 lg:px-6">
        <div className="mb-5 flex gap-2 overflow-x-auto rounded-2xl bg-slate-100 p-2 sm:flex-wrap">
          {groups.map((group) => (
            <button
              key={group.id}
              type="button"
              onClick={() => setActiveTab(group.id)}
              className={`shrink-0 rounded-xl px-3 py-2 text-[11px] font-semibold transition sm:text-xs ${
                activeTab === group.id
                  ? "bg-white text-slate-950 shadow-sm"
                  : "text-slate-500 hover:bg-white/70 hover:text-slate-800"
              }`}
            >
              {group.title}
            </button>
          ))}
        </div>

        <div className="mb-5">
          <h2 className="text-base font-bold text-slate-950 md:text-lg">
            {activeGroup.title}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {activeGroup.fields.map((field) => (
            <ConstructionSlot
              key={field.key}
              field={field}
              assignedConstruction={assignments[field.key]}
              onAssign={assignConstruction}
              onRemove={removeConstruction}
              constructionLibrary={constructionLibrary}
            />
          ))}
        </div>

        <button
          type="submit"
          className={`rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98]`}
        >
          Save {category}
        </button>

      </div>
    </form>
  );
}