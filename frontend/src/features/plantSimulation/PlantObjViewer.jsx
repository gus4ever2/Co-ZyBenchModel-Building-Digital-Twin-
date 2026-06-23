import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, Bounds, Center } from "@react-three/drei";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { Suspense } from "react";

function PlantObjModel({ plantId }) {
  const mtlUrl = `http://localhost:5000/plant_mtl/${plantId}`;
  const objUrl = `http://localhost:5000/plant_obj/${plantId}`;

  const materials = useLoader(MTLLoader, mtlUrl);
  materials.preload();

  const obj = useLoader(OBJLoader, objUrl, (loader) => {
    loader.setMaterials(materials);
  });

  return (
    <Center>
      <primitive object={obj} scale={1} />
    </Center>
  );
}

export default function PlantObjViewer({ plantId }) {
  if (!plantId) {
    return (
      <div className="flex h-[520px] items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-400">
        No plant model available
      </div>
    );
  }

  return (
    <div className="h-[520px] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 mt-16">
      <Canvas camera={{ position: [0, -3, 2], fov: 45 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[3, -4, 5]} intensity={1.2} />

        <Suspense fallback={null}>
          <Bounds fit clip observe margin={1.2}>
            <PlantObjModel plantId={plantId} />
          </Bounds>
        </Suspense>

        <OrbitControls enableDamping makeDefault />
      </Canvas>
    </div>
  );
}