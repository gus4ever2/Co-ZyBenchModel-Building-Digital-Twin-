import { useState, createContext, useContext, useEffect, useRef } from "react";
import createCurrentStatePlant from './plantStateMachine.js';
import ManageState from "../buildingDT/ManageState"
import plantStateMachine from "./plantStateMachine.js"

export default function PlantSimulation(){
  const [currentState, setCurrentState] = useState(createCurrentStatePlant("initialState"));

  return (
    <>
      <ManageState currentState={currentState} setCurrentState={setCurrentState} createCurrentState={createCurrentStatePlant} />
    </>
  );
}