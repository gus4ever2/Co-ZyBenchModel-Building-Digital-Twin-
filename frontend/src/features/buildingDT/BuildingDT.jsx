import { useState } from "react";
import createCurrentState from "./metaData/constructionsStateMachine.js";
import ManageState from "../buildingDT/ManageState.jsx"

export default function BuildingDT() {
  const [currentState, setCurrentState] = useState(
    createCurrentState("initialState")
  );

  return (
    <ManageState currentState={currentState} setCurrentState={setCurrentState} createCurrentState={createCurrentState} />
  );
}

/*
<div style={{ padding: "24px" }}>
      <h2>Building Viewer</h2>
      <BuildingObjViewer />
    </div>
<ManageState currentState={currentState} setCurrentState={setCurrentState} createCurrentState={createCurrentState} />
*/