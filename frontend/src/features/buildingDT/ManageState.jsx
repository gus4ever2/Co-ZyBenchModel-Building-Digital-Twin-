import { useState, createContext, useContext, useEffect, useRef } from "react";
import ManageComponet from "./ManageComponet.jsx"
import ChoiceButtonsCreator from "./ChoiceButtonsCreator.jsx"
import axios from 'axios';
import TitleComponent from "./TitleComponent.jsx"
import UploadFiles from "../plantSimulation/UploadFiles.jsx"

async function handleWithResponseRequest({targetState}, parameterValue){

  // Create a URL base on the current State
  const url = targetState.url;
  const parameterName = targetState.parameterName
  const finalParameterValue = parameterValue ?? targetState.parameterValue;

  // Find Token
    const token = localStorage.getItem("token");

    // Make update Request
    const response = await axios.get(
      url,
      {
        params: {
          [parameterName] : finalParameterValue,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

  // return options
  return response.data;
}

export default function ManageState({currentState, setCurrentState, createCurrentState}){

  async function goToNextState(nextStateString, optionName){

    const targetState = createCurrentState(nextStateString);

    // checks if the 
    if (targetState.options === null){
      targetState.options = await handleWithResponseRequest({targetState}, optionName);
    }

    setCurrentState(targetState);
    console.log(targetState);
  }

  

  return(
    <>
      <div className="ml-64 h-screen overflow-auto bg-slate-50 px-6 ">
      <TitleComponent category={currentState.category} goToNextState={goToNextState} previousState={currentState.previousState} />
      
        {(currentState.dataType === "button") && (<ChoiceButtonsCreator category={currentState.category} goToNextState={goToNextState} arrayOfOptions={currentState.options} previousState={currentState.previousState}/>)}
        {(currentState.dataType === "ManageComponet" || currentState.dataType === "onlyForm") && (<ManageComponet currentState={currentState} goToNextState={goToNextState} />)}
        {(currentState.dataType === "UploadFiles") && (<UploadFiles />)}
      </div>
    </>
  );
}