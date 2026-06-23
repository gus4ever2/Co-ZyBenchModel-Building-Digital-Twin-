import axios from "axios";
import LibraryPanel from "./LibraryPanel.jsx";

export default function AddMaterialToConstruction({
  category,
  componentTypes,
  componentDescriptors,
  url,
  setReload,
  addMaterial
}) {

  // add material
  function handleSubmit(e, url, type, choice, setReload) {
    e.preventDefault();

    addMaterial(choice);

    setReload((previous) => !previous);
  }


  return (
    
    <aside className="flex h-full min-h-0 flex-col overflow-y-auto pr-1">
        <LibraryPanel
        category={category}
        componentTypes={componentTypes}
        componentDescriptors={componentDescriptors}
        url={url}
        setReload={setReload}
        handleSubmit={handleSubmit}
        />
    </aside>
  );
}