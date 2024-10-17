import React, { useState, useEffect } from "react";
import { IoMdSend } from "react-icons/io";
import CustomOrb from "./CustomOrb";
import Orb from "./Orb";
import AudioWave from "./AudioWave";
import MicWave from "./MicWave";
import MicRecorder from "./MicRecorder";
import axios from "axios";
import "./JarvisInput.css";

const JarvisInput = () => {
  const [inputValue, setInputValue] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCustomOrbVisible, setIsCustomOrbVisible] = useState(true);
  const [audioResponseUrl, setAudioResponseUrl] = useState(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [micWaveVisible, setMicWaveVisible] = useState(false);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleGenerateResponse = async (text) => {
    try {
      setIsProcessing(true);
      setIsCustomOrbVisible(false);

      const response = await axios.post("https://endpointvoice-assistant-ai.onrender.com/generate", {
        input: text,
      });

      const fileUrl = `https://endpointvoice-assistant-ai.onrender.com/audio/${response.data.audio_file}`;
      setAudioResponseUrl(fileUrl);
    } catch (error) {
      console.error("Error generating response:", error);
      alert("Failed to generate response.");
    } finally {
      setIsProcessing(false);
      setIsCustomOrbVisible(true);
    }
  };

  const handleTranscribeAudio = async (audioBlob) => {
    try {
      setIsProcessing(true);
      setIsCustomOrbVisible(false);

      const formData = new FormData();
      formData.append("audio", audioBlob, "audio-recording.wav");

      const transcribeResponse = await axios.post(
       "https://endpointvoice-assistant-ai.onrender.com/transcribe",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const transcribedText = transcribeResponse.data.transcript;
      await handleGenerateResponse(transcribedText);
    } catch (error) {
      console.error("Error transcribing audio:", error);
      alert("Failed to transcribe audio.");
    } finally {
      setIsProcessing(false);
      setMicWaveVisible(false);
    }
  };

  const handleAudioEnd = () => {
    setIsAudioPlaying(false);
    setAudioResponseUrl(null);
  };

  useEffect(() => {
    if (audioResponseUrl) {
      // Set audio playing state only for UI feedback; playback should be user-triggered
      setIsAudioPlaying(true);
    }
  }, [audioResponseUrl]);

  return (
    <div className="container">
      <div className="orb-container">
        {isProcessing ? <Orb /> : isCustomOrbVisible ? <CustomOrb /> : null}
      </div>

      {micWaveVisible && <MicWave isRecording={micWaveVisible} />}
      {isAudioPlaying && (
        <AudioWave audioUrl={audioResponseUrl} onEnded={handleAudioEnd} />
      )}

      <p>Ask me anything</p>

      <div className="input-container">
        <input
          type="text"
          placeholder="type here..."
          value={inputValue}
          onChange={handleInputChange}
          disabled={isProcessing || isAudioPlaying}
        />

        {!inputValue ? (
          <MicRecorder
            handleTranscribeAudio={handleTranscribeAudio}
            setMicWaveVisible={setMicWaveVisible}
            isProcessing={isProcessing || isAudioPlaying}
          />
        ) : (
          <button
            onClick={async () => {
              await handleGenerateResponse(inputValue);
              setInputValue("");
            }}
            disabled={isProcessing || isAudioPlaying}
          >
            <IoMdSend />
          </button>
        )}
      </div>

      {audioResponseUrl && (
        <button onClick={() => new Audio(audioResponseUrl).play()}>
          Play Response
        </button>
      )}
    </div>
  );
};

export default JarvisInput;




