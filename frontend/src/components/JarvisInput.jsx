import React, { useState } from "react";
import Chat from "./Chat";
import CustomOrb from "./CustomOrb";
import Orb from "./Orb";
import MicWave from "./MicWave";
import "./JarvisInput.css";

const JarvisInput = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCustomOrbVisible, setIsCustomOrbVisible] = useState(true);
  const [micWaveVisible, setMicWaveVisible] = useState(false);

  const handleProcessing = (status) => {
    setIsProcessing(status);
    setIsCustomOrbVisible(!status);
  };

  const handleMicWaveVisibility = (status) => {
    setMicWaveVisible(status);
  };

  return (
    <div className="jarvis-container">
      <div className="orb-container">
        {isProcessing ? <Orb /> : isCustomOrbVisible ? <CustomOrb /> : null}
      </div>

      {micWaveVisible && <MicWave isRecording={micWaveVisible} />}

      <Chat
        handleProcessing={handleProcessing}
        handleMicWaveVisibility={handleMicWaveVisibility}
      />
    </div>
  );
};

export default JarvisInput;
