import { useDropzone } from "react-dropzone";
import { X, Leaf } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import PlantSimulationCard from "./PlantSimulationCard.jsx";
import PlantObjViewer from "./PlantObjViewer.jsx"

function PlantDTFiles({ plantName, setPlantId, setIsCompleted }) {
  const [layers, setLayers] = useState([
    { tag: "Leaf", expectedExtension: ".l", file: null },
    { tag: "Branches", expectedExtension: ".p", file: null },
  ]);

  const updateLayer = (index, file) => {
    const expected = layers[index].expectedExtension;

    if (!file.name.toLowerCase().endsWith(expected)) {
      alert(`${layers[index].tag} file must be ${expected}`);
      return;
    }

    setLayers((prev) =>
      prev.map((layer, i) => (i === index ? { ...layer, file } : layer))
    );
  };

  const removeLayer = (index) => {
    setLayers((prev) =>
      prev.map((layer, i) => (i === index ? { ...layer, file: null } : layer))
    );
  };

  const leafFile = layers.find((layer) => layer.tag === "Leaf")?.file;
  const branchesFile = layers.find((layer) => layer.tag === "Branches")?.file;
  const filledCount = layers.filter((layer) => layer.file !== null).length;

  const canCreatePlant = plantName.trim() && leafFile && branchesFile;

  const uploadPlantDTFiles = async () => {
    if (!plantName.trim()) {
      alert("Please enter a plant name");
      return;
    }

    if (!leafFile || !branchesFile) {
      alert("Please add both leaf.l and branches.p files");
      return;
    }

    const formData = new FormData();

    formData.append("plantName", plantName);
    formData.append("leafFile", leafFile);
    formData.append("branchesFile", branchesFile);

    const token = localStorage.getItem("token");

    const response = await axios.post(
      "http://localhost:8080/constructions/uploadPlantDT",
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log(response.data);

    const newPlantId = response.data.id ?? response.data;

    setPlantId(newPlantId);
    localStorage.setItem("plantId", newPlantId);
    setIsCompleted(false);
  };

  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-slate-100 p-4">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-950">
            Plant Digital Twin Files
          </h3>
          <p className="text-xs text-slate-500">
            Upload the required YplantQMC leaf and branch files.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-900 shadow-sm">
            {filledCount}/2 files
          </span>

          <button
            type="button"
            disabled={!canCreatePlant}
            onClick={uploadPlantDTFiles}
            className={`rounded-lg px-5 py-2 text-sm font-bold transition ${
              canCreatePlant
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "cursor-not-allowed bg-slate-200 text-slate-400"
            }`}
          >
            Create Plant
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {layers.map((layer, index) => (
          <PlantFileSlot
            key={layer.tag}
            layer={layer}
            index={index}
            onDropFile={updateLayer}
            onRemove={removeLayer}
          />
        ))}
      </div>
    </div>
  );
}

function PlantFileSlot({ layer, index, onDropFile, onRemove }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: false,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        onDropFile(index, acceptedFiles[0]);
      }
    },
  });

  if (!layer.file) {
    return (
      <div
        {...getRootProps()}
        className={`flex h-14 cursor-pointer items-center rounded-lg border border-dashed bg-white px-5 shadow-sm transition ${
          isDragActive
            ? "border-blue-500 bg-blue-50"
            : "border-slate-300 hover:border-blue-500 hover:bg-blue-50"
        }`}
      >
        <input {...getInputProps()} />

        <div className="flex w-full items-center">
          <div className="flex min-w-[130px] items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
            <span className="text-sm font-bold text-slate-950">
              {layer.tag}
            </span>
          </div>

          <div className="mx-5 h-5 w-px bg-slate-200" />

          <span className="text-sm font-semibold text-slate-400">
            Drop {layer.tag.toLowerCase()} file {layer.expectedExtension} here
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-14 items-center justify-between rounded-lg border border-slate-200 bg-white px-5 shadow-sm">
      <div className="flex min-w-0 items-center">
        <div className="flex min-w-[130px] items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
          <span className="text-sm font-bold text-slate-950">
            {layer.tag}
          </span>
        </div>

        <div className="mx-5 h-5 w-px bg-slate-200" />

        <span className="truncate text-sm font-bold text-slate-950">
          {layer.file.name}
        </span>
      </div>

      <button
        type="button"
        onClick={() => onRemove(index)}
        className="ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700"
      >
        <X size={16} />
      </button>
    </div>
  );
}

function PlantWebGLViewer() {
  return (
    <div className="mt-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-3">
        <h2 className="text-sm font-bold text-slate-950">
          Plant WebGL Viewer
        </h2>
        <p className="text-xs text-slate-500">
          Preview of the generated plant structure.
        </p>
      </div>

      <div className="overflow-hidden rounded-b-2xl">
        <iframe
          src="/webgl/spathiphyllum_webgl.html"
          title="Plant WebGL"
          className="h-[520px] w-full border-0"
        />
      </div>
    </div>
  );
}

function PlantName({ plantName, setPlantName }) {
  return (
    <>
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Leaf size={20} />
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-950">
            Create Plant Digital Twin
          </h2>
          <p className="text-sm text-slate-500">
            Add a plant name and upload the required YplantQMC files.
          </p>
        </div>
      </div>

      <div className="mb-5 max-w-[520px]">
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Plant Name
        </label>

        <input
          type="text"
          name="plantName"
          value={plantName}
          onChange={(e) => setPlantName(e.target.value)}
          placeholder="Example: Sugar Maple"
          className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
        />
      </div>
    </>
  );
}

export default function UploadFiles() {
  const [plantName, setPlantName] = useState("");
  const [plantId, setPlantId] = useState(localStorage.getItem("plantId") ?? null);
  const [isCompleted, setIsCompleted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("unknown");

  useEffect(() => {
    if (!plantId){
      setStatus("idle");
      return;
    }
      
    const eventSource = new EventSource(
      `http://localhost:5000/real_time_create_plant/${plantId}`
    );

    eventSource.onopen = () => {
      console.log("SSE opened");
      localStorage.setItem("plantId", plantId);
    };

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      console.log(data);

      if (data.progress !== undefined) {
        setProgress(data.progress);
      }

      if (data.status !== undefined) {
        setStatus(data.status);
      }

      if (data.status === "COMPLETED" || data.status === "ERROR") {
        setStatus("idle");
        setIsCompleted(true);
        eventSource.close();
      }
    };

    eventSource.onerror = () => {
      console.log("SSE error");
      setStatus("idle");
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [plantId]);

  return (
    <div className="mx-auto space-y-6">
      <div className="mx-auto mt-[120px] h-[calc(100vh-180px)] w-full max-w-[1100px] overflow-y-auto rounded-2xl border border-slate-200 bg-white px-8 py-6 shadow-sm">
        {status !== "unknown" && (
          <>
            {status === "idle" && (
              <>
                <PlantName plantName={plantName} setPlantName={setPlantName} />

                <PlantDTFiles
                  plantName={plantName}
                  setPlantId={setPlantId}
                  setIsCompleted={setIsCompleted}
                />
              </>
            )}

            {status !== "idle" && (
              <>
                <PlantSimulationCard percentage={progress} status={status} />
                <PlantObjViewer plantId={plantId} />
              </>
            )}
          </>
        )}        
      </div>
    </div>
  );
}