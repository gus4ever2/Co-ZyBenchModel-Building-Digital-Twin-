import { useEffect, useMemo, useState, useRef } from "react";
import AddMaterialToConstruction from "./AddMaterialToConstruction.jsx"
import materialTypesEnum from "../metaData/materialTypesEnum.js"
import constructionTypesEnum from "../metaData/constructionTypesEnum.js"
import axios from 'axios';

function categorizeMaterialByName(materialName, materialDescriptors, materialTypesEnum) {
  const descriptor = materialDescriptors.find(
    (material) => material.name === materialName
  );

  return categorizeMaterial(descriptor, materialTypesEnum);
}

function categorizeMaterial(descriptor, materialTypesEnum) {

  if (!descriptor) {
    return null;
  }

  const typeData = materialTypesEnum[descriptor.type];

  if (!typeData) {
    return null;
  }

  return typeData.materialCategory;
}


function filterDescriptorsByCategory(category, materialDescriptors, materialTypesEnum) {
  return materialDescriptors.filter(
    (descriptor) => categorizeMaterial(descriptor, materialTypesEnum) === category
  );
}

function getMaterialNameById(materialId, materialDescriptors) {
  const material = materialDescriptors.find(
    (descriptor) => String(descriptor.id) === String(materialId)
  );

  return material ? material.name : "";
}

const visibleMaterials = {
  category:"",
  types:"",
  materials:""
};

const layerTags = [
  "Outside_Layer",
  "Layer_2",
  "Layer_3",
  "Layer_4",
  "Layer_5",
  "Layer_6",
  "Layer_7",
  "Layer_8",
  "Layer_9",
  "Layer_10"
]

function createInitialArray(component) {
  const properties = component.properties;

  const materials = [];

  for (const layer of layerTags) {

    const materialName = properties[layer];

    if (materialName !== null && materialName !== undefined && materialName !== "") {
      materials.push(materialName);
    }
    else{
      break;
    }
  }

  return materials;
}

export default function ConstructionBuilder({currentState, component, category, setReload}) {
  const constructionName = useRef(component.properties.Name);
  const activeConstructionType = useRef("OPAQUE");
  const visibleMaterialGroup = useRef(visibleMaterials);
  const [layers, setLayers] = useState([]);
  const [error, setError] = useState("");
  const outsideLayer = useRef(component ? component.properties.Outside_Layer : null);
  const selectedType = useRef(visibleMaterialGroup.current.category);
  const maxLayers = useRef((selectedType.current === "opaque") ? 10 : 8);

  const materialDescriptors = currentState.options.selectableComponentDescriptions.componentParts;
 
  useEffect(() => {
    if (!component) {
      return;
    }

    selectCategory(component ? component.properties.Outside_Layer : null);

    constructionName.current = component.properties.Name;

    const initialLayers = createInitialArray(component);

    setLayers(initialLayers);

    setError("");
  }, [component.id]);

  function selectCategory(outside_Layer) {

    const constructionCategory = categorizeMaterialByName(
      outside_Layer,
      materialDescriptors,
      materialTypesEnum
    );

    activeConstructionType.current = constructionCategory;

    const newTypes = outside_Layer ? 
     Object.fromEntries(
      Object.entries(materialTypesEnum).filter(
        ([_, type]) => type.materialCategory === constructionCategory
      ) 
    ): materialTypesEnum;

    const newMaterials = outside_Layer ? filterDescriptorsByCategory(
      constructionCategory,
      materialDescriptors,
      materialTypesEnum
    ) : materialDescriptors;

    visibleMaterialGroup.current = {
      category: constructionCategory,
      types: newTypes,
      materials: newMaterials,
    };

    selectedType.current = visibleMaterialGroup.current.category;
    maxLayers.current = (selectedType.current === "opaque") ? 10 : 8;
  }


  function getLayerLabel(index) {
    if (index === 0) {
      return "Outside Layer";
    }

    return `Layer ${index + 1}`;
  }

  function addMaterial(materialId) {
    setError("");

    // validation
    if (layers.length >= maxLayers.current) {
      setError(
        `${
          (selectedType.current === "opaque") ? "Opaque Material" : "Window Material"
        } can have maximum ${maxLayers.current} layers.`
      );
      return;
    }
    
    // arg a material by ID but the it's name displayed 
    const materialName = getMaterialNameById(materialId, materialDescriptors);

     if (layers.length < 1) {
      selectCategory(materialName);
      outsideLayer.current = materialName;
    }  

    setLayers((previousLayers) => [...previousLayers, materialName]);
  }

  function removeLayer(indexToRemove) {
    setLayers((previousLayers) => {
      const newLayers = previousLayers.filter(
        (_, index) => index !== indexToRemove
      );

      if (newLayers.length < 1) {
        selectCategory(null);
        outsideLayer.current = null;
      } 

      return newLayers;
    });

    setError("");
  }

  

  async function saveConstruction() {
    setError("");

    if (!constructionName.current.trim()) {
      setError("Construction name is required.");
      return;
    }

    if (layers.length === 0) {
      setError("Add at least one material layer.");
      return;
    }

    const properties = {
      Name: constructionName.current,
      Outside_Layer: layers[0] ? layers[0] : null,
      ...Object.fromEntries(
        layers.slice(1).map((layer, index) => [
          `Layer_${index + 2}`,
          layer,
        ])
      ),
    };

     // Create Response JSON
    const responseFormJson = {};
    responseFormJson["id"] = component.id;
    responseFormJson["type"] = component.type;
    responseFormJson["properties"] = properties;

    // Find Token
    const token = localStorage.getItem("token");

    const response = await axios.put(
      "http://localhost:8080/constructions/update",
      responseFormJson,
      {
        params: {
          type: component.type,
          className: constructionTypesEnum[component.type].enumClass,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

  }

  return (
  <>
    <section className="grid h-full min-h-0 grid-cols-[280px_1fr] gap-6">
      <AddMaterialToConstruction
        category="Material"
        componentTypes={visibleMaterialGroup.current.types}
        componentDescriptors={visibleMaterialGroup.current.materials}
        url={null}
        setReload={setReload}
        addMaterial={addMaterial}
      />

      <div className="flex h-full min-h-0 flex-col">
        <div className="mb-5 shrink-0">
          <h2 className="text-sm font-bold text-gray-950">
            Create Construction
          </h2>
        </div>

        <div className="mb-5 shrink-0">
          <label className="mb-2 block text-xs font-semibold text-gray-700">
            Construction Name
          </label>

          <input
            key = {component.properties.Name}
            defaultValue={component.properties.Name}
            onChange={(event) => {
              constructionName.current = event.target.value;
            }}
            placeholder="Name"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <main className="flex min-h-0 flex-1 flex-col rounded-xl border border-slate-200 bg-slate-100 p-4">
          <div className="mb-4 flex shrink-0 items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-950">
                Construction Layers
              </h3>

              <p className="text-xs text-gray-500">
                Outside to inside order
              </p>
            </div>

            <div className="flex items-center gap-2">
              {(outsideLayer.current) && (<span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700 shadow-sm">
                {layers.length}/{maxLayers.current}
              </span>)}

              <button
                type="button"
                onClick={saveConstruction}
                className={`rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98]
                  ${ (!outsideLayer.current) ? "cursor-not-allowed bg-blue-600 hover:bg-blue-700" : "" } `}
              >
                Save
              </button>
            </div>
          </div>

          <section className="min-h-0 flex-1 overflow-y-auto pr-1">
            {layers.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-xs text-gray-500">
                No layers added.
              </div>
            ) : (
              <div className="space-y-2">
                {layers.map((material, index) => (
                  <div
                    key={`${material}-${index}`}
                    className="grid grid-cols-[18px_105px_1fr_28px] items-center rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm transition hover:border-blue-200 hover:bg-white"
                  >
                    <div className="flex justify-center">
                      <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                    </div>

                    <div className="text-xs font-bold text-gray-800">
                      {getLayerLabel(index)}
                    </div>

                    <div className="min-w-0 border-l border-gray-200 pl-4">
                      <p className="truncate text-xs font-bold text-gray-950">
                        {material}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeLayer(index)}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 font-semibold leading-none text-white shadow-sm transition hover:bg-blue-700 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    >
                      <span className="flex h-full w-full items-center justify-center text-[20px] font-semibold leading-none -translate-y-[1px]">
                        ×
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>

        {error && (
          <div className="mt-5 shrink-0 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
            {error}
          </div>
        )}
      </div>
    </section>
  </>
);
}


/*

<aside className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
          <div className="mb-3 px-2">
            <h3 className="text-sm font-bold text-gray-900">
              Material Types
            </h3>

            <p className="text-xs text-gray-500">
              Showing only {selectedType.label.toLowerCase()} types.
            </p>
          </div>

          <div className="space-y-2">
            {visibleMaterialGroups.map((group) => {
              const open = openGroupId === group.id;

              return (
                <div key={group.id}>
                  <button
                    type="button"
                    onClick={() => setOpenGroupId(open ? null : group.id)}
                    className={
                      open
                        ? "flex w-full items-center justify-between rounded-lg bg-blue-50 px-3 py-2 text-left text-xs font-bold text-gray-950 ring-1 ring-blue-200"
                        : "flex w-full items-center justify-between rounded-lg bg-gray-100 px-3 py-2 text-left text-xs font-bold text-gray-900 hover:bg-gray-200"
                    }
                  >
                    <span className="pr-2 leading-4">{group.title}</span>
                    <span className="text-xs text-gray-500">▼</span>
                  </button>

                  {open && (
                    <div className="mt-2 space-y-2 rounded-xl bg-gray-50 p-2">
                      {group.materials.map((material) => (
                        <button
                          key={material.id}
                          type="button"
                          onClick={() => addMaterial(material)}
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-left hover:border-blue-300 hover:bg-blue-50"
                        >
                          <div className="text-xs font-semibold text-gray-900">
                            {material.name}
                          </div>

                          <div className="mt-0.5 text-[11px] text-gray-500">
                            {material.type}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        
      <div className="mb-6 rounded-2xl bg-gray-100 p-2">
        <div className="flex flex-wrap gap-2">
          {constructionTypes.map((type) => {
            const active = activeConstructionType === type.id;

            return (
              <button
                key={type.id}
                type="button"
                onClick={() => changeConstructionType(type.id)}
                className={
                  active
                    ? "rounded-xl bg-white px-5 py-2 text-sm font-semibold text-gray-950 shadow-sm"
                    : "rounded-xl px-5 py-2 text-sm font-semibold text-gray-500 hover:bg-white/70 hover:text-gray-900"
                }
              >
                {type.label}
              </button>
            );
          })}
        </div>
      </div>

*/