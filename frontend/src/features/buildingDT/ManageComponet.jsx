import { useState, createContext, useContext, useEffect, useRef } from "react";
import createCurrentState, { secondCreateCurrentState, dataMapperFunctions } from './metaData/constructionsStateMachine.js';
import {handleWithoutResponseRequest} from './BuildingDT.jsx';
import ComponentForm from "./ComponentForm.jsx"
import materialTypesEnum from "./metaData/materialTypesEnum.js";
import Library from "./formComponents/Library.jsx"
import TitleComponent from "./TitleComponent.jsx"
import ActionButtons from "./formComponents/ActionButtons.jsx"
import ConstructionSet from "./ConstructionSet.jsx"
import InputDetails from "./formComponents/InputDetails.jsx"
import ConstructionForm from "./formComponents/ConstructionForm.jsx"
import simulationFormSchema from "./metaData/simulationFormSchema.js"

const url = "http://localhost:8080/constructions/"

const MainData = createContext(null);

export function CreateComponentList({ currentState }) {
  const types = currentState.metaData;

  const { id } = useContext(MainData);
  const { setReload } = useContext(MainData);

  const materialNames = Object.values(types).map((type) => (

    <InputDetails type={type} category={"component"}>

      <div className="p-3">

        <ActionButtons type={type.enumValue} url={url} id={id} setReload={setReload} />

        {currentState.options.componentDescriptions && (
          <SelectableComponentList
            arrayOfOptions={currentState.options.componentDescriptions.componentParts.filter(
              (component) => component.type === type.enumValue
            )}
          />
        )}
      </div>

    </InputDetails>
  ));

  return (
    <aside className="flex flex-col rounded-2xl bg-white p-3 shadow-sm h-[calc(100vh-85px)] overflow-y-auto">
      <div className="mb-3">
        <h2 className="text-sm font-bold text-black">
          {currentState.category} Types
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto pr-1">
        {materialNames}
      </div>
    </aside>
  );
}

function SelectableComponentList({ arrayOfOptions }) {
  const { id } = useContext(MainData);
  const { setReload } = useContext(MainData);

  const listItems = arrayOfOptions.map((component) => (
    <li key={component.id} className="my-2">
      <div
        onClick={() => {
          id.current = component.id;
          setReload(true);
        }}
        role="button"
        tabIndex={0}
        className="
          flex min-h-[40px] cursor-pointer items-center
          rounded-lg border border-slate-200 bg-white
          px-3 py-2.5 text-left shadow-sm transition
          hover:border-blue-300 hover:bg-blue-50
          focus:outline-none focus:ring-2 focus:ring-blue-400
        "
      >
        <span className="min-w-0 break-words text-xs font-semibold leading-tight text-slate-800">
          {component.name}
        </span>
      </div>
    </li>
  ));

  return <ul className=" space-y-2">{listItems}</ul>;
}


export default function ManageComponet({currentState, goToNextState}){
  const id = useRef("0");
  const [reload, setReload] = useState(false);
  const category = currentState.category;

  const component = currentState.options.component;
  const libraryDescriptions = currentState.options.libraryDescriptions;

  const typesEnum = currentState.metaData;
  const formSchema = currentState.formData;

  console.log(currentState);

  // Reload Page
  useEffect(() => {
    if (!reload) {
      return;
    }
    async function runRequest() {
      await goToNextState(currentState.nextState, id.current);
      setReload(false);
    }
    runRequest();
  },[reload]);

    return(
        <>
          <MainData.Provider  value={{id, setReload}}>
            
              <div className="mx-auto space-y-6 pt-[80px]">

                {(currentState.dataType === "onlyForm") && 
                
                (<div className="bg-white rounded-xl shadow-sm border border-gray-200 mx-20 p-8 h-[calc(100vh-85px)] overflow-y-auto">
                  <ComponentForm 
                    currentState={currentState}
                    component={component}
                    category={category}
                    formSchema={formSchema} 
                  />
                </div>
                
                )}

                {(currentState.dataType !== "onlyForm") &&
                
                (<div className="grid grid-cols-1 gap-4 xl:grid-cols-[240px_minmax(0,1fr)_220px] xl:gap-6">

                  <CreateComponentList currentState={currentState} />

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-[calc(100vh-85px)] overflow-y-auto">
                  {
                  (currentState.componentDisplayer === "form") &&
                    id.current !== "0" &&
                    component !== null && 
                    component.type !== "CONSTRUCTION" &&
                    (
                      <ComponentForm
                      currentState={currentState}
                        component={component}
                        category={category}
                        formSchema={formSchema}
                      />
                    )
                }

                {
                  (currentState.componentDisplayer === "form") &&
                    id.current !== "0" &&
                    component !== null &&
                    component.type === "CONSTRUCTION" &&
                    (
                      <ConstructionForm
                        currentState={currentState}
                        component={component}
                        category={category}
                        setReload={setReload}
                      />
                    )
                }

                  {
                    id.current !== "0" && 
                    component !== null && 
                    currentState.componentDisplayer === "slots" && (
                      <ConstructionSet
                        currentState={currentState}
                      />
                    )
                  }
                </div>

                  <Library category={category} componentTypes={typesEnum} componentDescriptors={libraryDescriptions.componentParts} url={url} setReload={setReload} />

                </div>)}

              </div>
            </MainData.Provider>
        </>
    );
}

/*
 
*/