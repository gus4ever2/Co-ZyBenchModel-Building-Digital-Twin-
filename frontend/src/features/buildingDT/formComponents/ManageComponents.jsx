import { useState, createContext, useContext, useEffect, useRef } from "react";

const MainData = createContext(null);

export function CreateComponentList({ currentState }) {
  const types = currentState.metaData;

  const materialNames = types.map((type) => (
    <details
      name="component"
      key={type.enumValue}
      className="my-1 w-full overflow-hidden rounded-md border border-gray-400 bg-white shadow-sm"
    >
      <summary className="list-none cursor-pointer">
        <div className="flex items-center justify-between bg-gray-300 px-3 py-2 hover:bg-gray-400">
          <h3 className="text-xs font-bold leading-tight text-black">
            {type.displayName}
          </h3>

          <span className="ml-2 text-xs text-gray-700">
            ▼
          </span>
        </div>
      </summary>

      <div className="p-3">
        <ActionButtons
          id={null}
          category={currentState.category}
          type={type.enumValue}
          currentState={currentState}
        />

        {currentState.options.componentDescriptions && (
          <SelectableComponentList
            arrayOfOptions={currentState.options.componentDescriptions.componentParts.filter(
              (component) => component.type === type.enumValue
            )}
          />
        )}
      </div>
    </details>
  ));

  return (
    <section className="flex h-[calc(100vh-85px)] flex-col rounded-2xl bg-white p-3 shadow-sm">
      <div className="mb-3">
        <h2 className="text-sm font-bold text-black">
          {currentState.category} Types
        </h2>

        <p className="mt-0.5 text-xs text-slate-500">
          Available {currentState.category}s.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto pr-1">
        {materialNames}
      </div>
    </section>
  );
}

function SelectableComponentList({ arrayOfOptions }) {
  const { id } = useContext(MainData);
  const { setReload } = useContext(MainData);

  const listItems = arrayOfOptions.map((component) => (
    <li key={component.id} className="my-1">
      <div
        onClick={() => {
          id.current = component.id;
          setReload(true);
        }}
        role="button"
        tabIndex={0}
        className="
          flex min-h-[38px] cursor-pointer items-center
          rounded-md border border-gray-500 bg-[#d0d0d0]
          px-2 py-1 transition-colors hover:bg-[#bdbdbd]
        "
      >
        <span className="text-xs font-bold leading-tight text-black">
          {component.name}
        </span>
      </div>
    </li>
  ));

  return <ul className="mt-2">{listItems}</ul>;
}

function ActionButtons({ category, type, goToNextState, currentState,  url}) {
  const { id } = useContext(MainData);
  const { setReload } = useContext(MainData);


  const onCreate = () => {

        const response = await axios.post(
            url + "create?type=" + type.internalName,
            null,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        setReload(true);

    };

  const onDuplicate = () => {

        const response = await axios.post(
            url + "dublicate?id=" + id,
            null,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        setReload(true);

    };

    const onDelete = () => {

        const response = await axios.post(
            url + "delete?id=" + id,
            null,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        setReload(true);

    };


  return (
    <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-gray-300 pt-3">
      <button
        type="button"
        onClick={onCreate}
        className="rounded bg-blue-600 px-2 py-1 text-xs font-bold text-white transition-colors hover:bg-blue-700"
      >
        Create
      </button>

      <button
        type="button"
        onClick={onDuplicate}
        className="rounded bg-gray-700 px-2 py-1 text-xs font-bold text-white transition-colors hover:bg-gray-800"
      >
        Duplicate
      </button>

      <button
        type="button"
        onClick={onDelete}
        className="rounded bg-red-600 px-2 py-1 text-xs font-bold text-white transition-colors hover:bg-red-700"
      >
        Delete
      </button>
    </div>
  );
}


function CreateRadioForm({type, componentDescriptors}) {
  
  const [choice, setChoice] = useState("");

  // Handle Submit
  async function handleSubmit(e) {
    
    // Prevent the browser from reloading the page
    e.preventDefault();

    console.log(choice);

    // Find Token
    const token = localStorage.getItem("token");

    // Make update Request
    const response = await axios.post(
        "http://localhost:8080/constructions/add" + type.internalName,
        null,
        {
            name: { choice },
            headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            },
        }
    );
  }
  
  function updateField(name) {
    setChoice(name);
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="grid grid-cols-1 gap-2">
          {componentDescriptors.map((descriptor) => (
            <label
              key={descriptor.id}
              className={`flex cursor-pointer items-start rounded-lg border p-4 hover:bg-gray-50 ${
                choice === String(descriptor.id)
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200"
              }`}
            >
              <input
                type="radio"
                name="addComponent"
                value={descriptor.id}
                checked={choice === String(descriptor.id)}
                onChange={(e) => setChoice(e.target.value)}
                className="mt-1 mr-3"
                required
              />

              <div>
                <div className="font-semibold text-slate-900">{descriptor.name}</div>
              </div>
            </label>
          ))}
        </div>

        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
        >
          Add {type.displayName}
        </button>
      </form>
    </>
  );
}