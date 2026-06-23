// src/components/BuildingObjViewer.jsx

import { Suspense, useEffect, useMemo } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, Center } from "@react-three/drei";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";
import * as THREE from "three";

function BuildingModel({
  objUrl = "/models/building.obj",
  mtlUrl = "/models/building.mtl",
}) {
  const materials = useLoader(MTLLoader, mtlUrl);

  const obj = useLoader(
    OBJLoader,
    objUrl,
    (loader) => {
      materials.preload();
      loader.setMaterials(materials);
    }
  );

  const model = useMemo(() => obj.clone(), [obj]);

  useEffect(() => {
    model.traverse((child) => {
      if (child.isMesh) {
        child.geometry.computeVertexNormals();

        child.material.side = THREE.DoubleSide;
        child.material.needsUpdate = true;

        child.castShadow = false;
        child.receiveShadow = true;
      }
    });
  }, [model]);

  return (
    <Center>
      <primitive object={model} />
    </Center>
  );
}

export default function BuildingObjViewer() {
  return (
    <div
      style={{
        width: "100%",
        height: "700px",
        borderRadius: "16px",
        overflow: "hidden",
        background: "#f8fafc",
        border: "1px solid #e5e7eb",
      }}
    >
      <Canvas
        camera={{
          position: [8, 6, 8],
          fov: 35,
          near: 0.1,
          far: 1000,
        }}
      >
        <color attach="background" args={["#f8fafc"]} />

        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 12, 8]} intensity={1.2} />
        <directionalLight position={[-8, 6, -10]} intensity={0.5} />

        <Suspense fallback={null}>
          <BuildingModel />
        </Suspense>

        <gridHelper args={[14, 14, "#d1d5db", "#e5e7eb"]} />

        <OrbitControls
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          minDistance={4}
          maxDistance={30}
          maxPolarAngle={Math.PI / 2.05}
          target={[0, 0, 0]}
        />
      </Canvas>
    </div>
  );
}