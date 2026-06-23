import { useState, createContext, useContext, useEffect, useRef } from "react";

export function mapResponseComponentTypesToButtonOptions({responseDataJSON, targetState}){

  const displayNames = responseDataJSON.displayNames;
  const enumNames = responseDataJSON.enumNames;

  return displayNames.map( (fd, index) =>
    ({
        displayName:fd,
        key:enumNames[index],
        nextState:(targetState.nextState)}),
    );
}


export function mapResponseComponentNamesToButtonOptions({responseDataJSON, targetState}){

  return responseDataJSON;
}

function CreateButton({HandleClick, text}){
  return (
    <button 
    onClick={HandleClick}
    >
      {text}
    </button>
  );
}

export function ButtonNamesCreator({goToNextState, arrayOfOptions}){

  //const  useRef

  

  const materialNames = arrayOfOptions.displayNames.map((type, index) => (
  <details
    name="component"
    key={type}
    className="w-full my-2 bg-white border border-gray-300 rounded-lg shadow-sm"
  >
    <summary className="list-none cursor-pointer">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-200 hover:bg-gray-300 border-b border-gray-300 rounded-t-lg">
        <div>
          <h3 className="text-sm font-bold text-gray-900">
            {type}
          </h3>
        </div>

        <span className="text-gray-600 text-sm">
          ▼
        </span>
      </div>
    </summary>

    <div className="p-4">

    <ActionButtons
        id={null}
        category="materials"
        type={type}
      />

    
      {arrayOfOptions.namesMap[type] !== undefined && (
        <ButtonCreator
          goToNextState={goToNextState}
          arrayOfOptions={arrayOfOptions.namesMap[type]}
        />
      )}
    </div>
  </details>
));  

  return(
    <>
      {materialNames}
    </>
  );
}

export default function ButtonCreator({goToNextState, arrayOfOptions}){

  const listItems = arrayOfOptions.map((option, index) => (
  <li key={option.internalKey ?? option.key ?? index} className="my-2">
    <div
      onClick={() => goToNextState(option.nextState, option.key)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === " ") {
          goToNextState(option.nextState, option.key);
        }
      }}
      className="
        min-h-[50px]
        flex items-center justify-between
        px-3 py-2
        bg-[#d0d0d0]
        hover:bg-[#bdbdbd]
        rounded-lg
        border border-gray-500
        cursor-pointer
        transition-colors
      "
    >
      <span className="text-sm font-bold text-black leading-tight">
        {option.displayName}
      </span>
    </div>
  </li>
));

  return (
    <>
      <ul>
        {listItems}
      </ul>
    </>
  );
}



function ActionButtons({id, category, type}){

  const [func, setFunc] = useState("");

  useEffect(()=>{
    //dataMapperFunctions[func]({id, category});
    console.log(id + "_" + type + "_" + func);
    },[func]
  );

  const onCreate = () => {setFunc(category + "_" + "create")};
  const onDuplicate = () => {setFunc(category +  "_" + "duplicate")};
  const onDelete = () => {setFunc(category + "_" + "delete")};

  return(
    <>
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCreate}
          className="px-3 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          Create
        </button>

        <button
          type="button"
          onClick={onDuplicate}
          className="px-3 py-2 text-sm font-medium rounded-md bg-gray-700 text-white hover:bg-gray-800 transition-colors"
        >
          Duplicate
        </button>

        <button
          type="button"
          onClick={onDelete}
          className="px-3 py-2 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
        >
          Delete
        </button>
      </div>
    </>
  );
}


