import { useState, createContext, useContext, useEffect, useRef, useMemo } from "react";
import axios from 'axios';
import InputDetails from "./InputDetails.jsx"

function CreateComponentList({category, componentTypes, componentDescriptors, url, setReload, handleSubmit}){

  const detailsComponents = Object.entries(componentTypes).map(([_, type]) => 
    (
      <InputDetails type={type} category={"library"}>

        <div className="p-2">

          <CreateRadioForm
            category={category}
            type={type}
            url={url}
            setReload={setReload}
            componentDescriptors={componentDescriptors.map(componentDescriptorObject => 
              (componentDescriptorObject.type === type.enumValue) ? componentDescriptorObject : null
            ).filter(value => value !== null)}
            handleSubmit={handleSubmit}
          />
                    
        </div>
      </InputDetails>
    )
  )

  return(
    <>
      <div className="flex-1 overflow-y-auto pr-1">
        {detailsComponents}
      </div>
    </>
  );
}

// static meta data
// componentTypes
// componetDescriptors
function CreateRadioForm({
  type,
  componentDescriptors,
  url,
  setReload,
  handleSubmit,
}) {
  const [choice, setChoice] = useState("");

  return (
    <form
      onSubmit={(e) => handleSubmit(e, url, type, choice, setReload)}
      className="space-y-1.5"
    >
      <div className="space-y-1.5">
        {componentDescriptors.map((item) => (
          <label
            key={item.id}
            className={`flex cursor-pointer items-center rounded-lg border px-3 py-2 text-xs font-semibold shadow-sm transition ${
              choice === String(item.id)
                ? "border-blue-500 bg-blue-50 text-blue-900"
                : "border-slate-200 bg-white text-slate-800 hover:border-blue-300 hover:bg-blue-50"
            }`}
          >
            <input
              type="radio"
              name="selectedComponent"
              value={item.id}
              checked={choice === String(item.id)}
              onChange={(e) => setChoice(e.target.value)}
              className="mr-2 h-3 w-3 shrink-0"
            />

            <span className="min-w-0 break-words leading-tight">
              {item.name}
            </span>
          </label>
        ))}
      </div>

      <button
        type="submit"
        disabled={!choice}
        className={`rounded-md px-3 py-1.5 text-xs font-semibold leading-tight text-white bg-blue-600 hover:bg-blue-700 ${
          !choice
            ? "cursor-not-allowed bg-blue-600 hover:bg-blue-700":""
            
        }`}
      >
        Add {type.displayName}
      </button>
    </form>
  );
}

export default function LibraryPanel({category, componentTypes, componentDescriptors, url, setReload, handleSubmit}) {
  return (
    <>
      <div className="mb-3">
        <h2 className="text-sm font-bold text-black">
          {category}s Library
        </h2>
      </div>

        <CreateComponentList
          category={category}
          url={url}
          componentTypes={componentTypes}
          componentDescriptors={componentDescriptors}
          setReload={setReload}
          handleSubmit={handleSubmit}
        />
    </>
  );
}