import axios from "axios";
import LibraryPanel from "./LibraryPanel.jsx";

async function handleSubmit(e, url, type, choice, setReload) {
  e.preventDefault();

  if (!choice) {
    alert("Please select one item first.");
    return;
  }

  try {
    const token = localStorage.getItem("token");

    await axios.post(
      `${url}add`,
      null,
      {
        params: {
          id: choice,
          className: type.enumClass,
          type: type.enumValue,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    setReload((previous) => !previous);
  } catch (error) {
    console.error("Failed to add component:", error);
    alert("Failed to add component.");
  }
}

export default function Library({
  category,
  componentTypes,
  componentDescriptors,
  url,
  setReload,
}) {
  return (
    <aside className="flex flex-col rounded-2xl bg-white p-3 shadow-sm h-[calc(100vh-85px)] overflow-y-auto">
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