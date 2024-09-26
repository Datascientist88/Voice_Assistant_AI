import React, { useState } from "react";
import { IoMdSend } from "react-icons/io";
import { FaMicrophone } from "react-icons/fa"; // Import mic icon
import "./MicRecorder.scss";

const recordAudio = () =>
  new Promise(async (resolve) => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    const audioChunks = [];

    mediaRecorder.addEventListener("dataavailable", (event) => {
      audioChunks.push(event.data);
    });

    const start = () => mediaRecorder.start();

    const stop = () =>
      new Promise((resolve) => {
        mediaRecorder.addEventListener("stop", () => {
          const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
          resolve({ audioBlob });
        });
        mediaRecorder.stop();
      });

    resolve({ start, stop });
  });

const MicRecorder = ({ handleTranscribeAudio, setMicWaveVisible, isProcessing }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingInstance, setRecordingInstance] = useState(null);

  const startRecording = async () => {
    if (!isRecording && !isProcessing) {
      const recording = await recordAudio();
      setRecordingInstance(recording);
      setIsRecording(true);
      setMicWaveVisible(true);
      recording.start();
    }
  };

  const stopRecording = async () => {
    if (isRecording && recordingInstance) {
      setIsRecording(false);
      setMicWaveVisible(false);
      const audio = await recordingInstance.stop();
      await handleTranscribeAudio(audio.audioBlob);
    }
  };

  return (
    <div
      id="recorder"
      className={isRecording ? "recording" : ""}
      onClick={isRecording ? stopRecording : startRecording}
    >
      {isRecording ? (
        <IoMdSend style={{ fontSize: "1.5rem" }} /> // Show send icon during recording
      ) : (
        <FaMicrophone style={{ fontSize: "1.5rem" }} /> // Show mic icon initially
      )}
    </div>
  );
};

export default MicRecorder;


