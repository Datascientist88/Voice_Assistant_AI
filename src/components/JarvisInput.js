import React, { useState, useEffect } from "react";
import { IoMdSend } from "react-icons/io";
import CustomOrb from "./CustomOrb";
import Orb from "./Orb";
import AudioWave from "./AudioWave";
import MicWave from "./MicWave";
import MicRecorder from "./MicRecorder"; // Import the new MicRecorder component
import axios from "axios";
import "./JarvisInput.css";

const JarvisInput = () => {
  const [inputValue, setInputValue] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCustomOrbVisible, setIsCustomOrbVisible] = useState(true);
  const [audioResponseUrl, setAudioResponseUrl] = useState(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [micWaveVisible, setMicWaveVisible] = useState(false);

  // Handle text input changes
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  // Generate response (text or transcribed audio)
  const handleGenerateResponse = async (text) => {
    try {
      setIsProcessing(true);
      setIsCustomOrbVisible(false); // Show processing Orb

      const response = await axios.post("http://localhost:5000/generate", {
        input: text,
      });

      const fileUrl = `http://localhost:5000/audio/${response.data.audio_file}`;
      setAudioResponseUrl(fileUrl); // Set the AI-generated audio URL
      setIsAudioPlaying(true); // Mark AI response as playing
    } catch (error) {
      console.error("Error generating response:", error);
      alert("Failed to generate response.");
    } finally {
      setIsProcessing(false);
      setIsCustomOrbVisible(true); // Restore CustomOrb after processing
    }
  };

  // Transcribe audio and generate response
  const handleTranscribeAudio = async (audioBlob) => {
    try {
      setIsProcessing(true);
      setIsCustomOrbVisible(false); // Show processing Orb

      const formData = new FormData();
      formData.append("audio", audioBlob, "audio-recording.wav"); // Append audio as a .wav file

      console.log("Sending audio to backend for transcription...");
      const transcribeResponse = await axios.post(
        "http://localhost:5000/transcribe",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const transcribedText = transcribeResponse.data.transcript;
      await handleGenerateResponse(transcribedText); // Generate response based on transcribed text
    } catch (error) {
      console.error("Error transcribing audio:", error);
      alert("Failed to transcribe audio.");
    } finally {
      setIsProcessing(false);
      setMicWaveVisible(false); // Hide micwave after recording ends
    }
  };

  // Handle playing the AI response audio
  const handleAudioPlay = () => {
    setIsAudioPlaying(true);
  };

  const handleAudioEnd = () => {
    setIsAudioPlaying(false); // Hide AudioWave after the audio finishes
    setAudioResponseUrl(null); // Reset the audio URL
  };

  // Auto-play the AI response audio when available
  useEffect(() => {
    if (audioResponseUrl) {
      handleAudioPlay();
    }
  }, [audioResponseUrl]);

  return (
    <div className="container">
      {/* Toggle between CustomOrb and processing Orb */}
      <div className="orb-container">
        {isProcessing ? <Orb /> : isCustomOrbVisible ? <CustomOrb /> : null}
      </div>

      {/* Render MicWave when recording */}
      {micWaveVisible && <MicWave isRecording={micWaveVisible} />}

      {/* Render AudioWave when AI response is playing */}
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
          disabled={isProcessing}
        />

        {/* Toggle between MicRecorder and Send button */}
        {!inputValue ? (
          <MicRecorder
            handleTranscribeAudio={handleTranscribeAudio}
            setMicWaveVisible={setMicWaveVisible}
          />
        ) : (
          <button
            onClick={async () => {
              await handleGenerateResponse(inputValue);
              setInputValue(""); // Clear the input field after sending
            }}
            disabled={isProcessing}
          >
            <IoMdSend />
          </button>
        )}
      </div>
    </div>
  );
};

export default JarvisInput;



