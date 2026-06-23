import { useState, createContext, useContext, useEffect, useRef } from "react";
import axios from 'axios';
import InputNumber from "./formComponents/InputNumber.jsx"
import InputText from "./formComponents/InputText.jsx"
import FormErrorBox from "./formComponents/FormErrorBox.jsx"
import InputSelect from "./formComponents/InputSelect.jsx"
import validateForm from "./validateForm.js"
import LibraryPanel from "./formComponents/Library.jsx"
import InputDate from "./formComponents/InputDate.jsx"

function createEmptyJSON(componentType, properties, componentFormSchema){
  const responseFormJson = {};
  Object.keys(componentFormSchema[componentType]).forEach((fieldName) => {
    responseFormJson[fieldName] = properties[fieldName];
  });
  return responseFormJson
}

export default function ComponentForm({ currentState, category, component, formSchema }) {
  const formProperties = useRef(createEmptyJSON(component.type, component.properties, formSchema));
  const [errors, setErrors] = useState(null);
  const id = useRef("0");

  if (id.current !== component.id) {
    id.current = component.id
    formProperties.current = createEmptyJSON(component.type, component.properties, formSchema);
    setErrors(null);
  }

  // unpack component DTO
  const componentType = component.type;
  const properties = component.properties;
  const selectedSchema = formSchema[component.type];
  const typeEnum = currentState.metaData[componentType];

  // check if the component type exists
  if (!selectedSchema) {
    return (
      <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">
        Unknown material type: {componentType}
      </div>
    );
  }

  // Handle Submit
  async function handleSubmit(e) {
    
    // Prevent the browser from reloading the page
    e.preventDefault();

    // START: validation
    
    const result = validateForm(
      componentType,
      formProperties.current,
      formSchema
    );

    setErrors(result);

    if (result !== null) {
      console.log(result);
      return;
    }
    // END: validation

    // Create Response JSON
    const responseFormJson = {};
    responseFormJson["id"] = id.current;
    responseFormJson["type"] = componentType;
    responseFormJson["properties"] = formProperties.current;

    // Find Token
    const token = localStorage.getItem("token");

    console.log(responseFormJson);

   const response = await axios.put(
    "http://localhost:8080/constructions/update",
    responseFormJson,
    {
      params: {
        type: componentType,
        className: typeEnum.enumClass,
      },
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  }
  
  function updateField(fieldName, value) {
    const properties = formProperties.current;
    properties[fieldName] = value;
    formProperties.current = properties;
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {(errors) && <FormErrorBox errors={errors} />}
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          {typeEnum.displayName}
        </h2>

        <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
          {Object.entries(selectedSchema).map(([fieldName, fieldConfig]) => (
            <div key={fieldName + properties[fieldName]} className="flex flex-col gap-2">
              <label className="font-medium text-gray-700">
                {fieldConfig.display}

                {fieldConfig.unit && (
                  <span className="text-sm text-gray-500">
                    {" "}({fieldConfig.unit})
                  </span>
                )}
              </label>
              {(fieldConfig.type === "date") && (<InputDate fieldName={fieldName} fieldConfig={fieldConfig} value={formProperties.current[fieldName]} updateField={updateField} />)}
              {(fieldConfig.type === "select") && (<InputSelect fieldName={fieldName} fieldConfig={fieldConfig} value={formProperties.current[fieldName]} updateField={updateField} />)}
              {(fieldConfig.type === "text") && (<InputText fieldName={fieldName} fieldConfig={fieldConfig} value={formProperties.current[fieldName]} updateField={updateField} />)}
              {(fieldConfig.type === "number") && (<InputNumber fieldName={fieldName} fieldConfig={fieldConfig} value={formProperties.current[fieldName]} updateField={updateField}/>)}
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98]"
        >
          Save {category}
        </button>
      </form>
    </>
  );
}