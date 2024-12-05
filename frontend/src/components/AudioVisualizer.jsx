import React, { useEffect, useRef } from "react";
import useAudioStore from "./store/audioStore";
import "./AudioVisualizer.css";

const AudioVisualizer = () => {
  const { audioUrl, stopAudio } = useAudioStore();
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const audioContextRef = useRef(null); // Keep a reference to the AudioContext

  useEffect(() => {
    if (!audioUrl) return;

    const canvas = canvasRef.current;
    const audio = new Audio(audioUrl); // Create a new Audio element dynamically
    audioRef.current = audio;

    // Create a new AudioContext if it doesn't already exist
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    audioContextRef.current = audioContext;

    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaElementSource(audio);

    source.connect(analyser);
    analyser.connect(audioContext.destination);

    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    canvas.width = 400; // Fixed size for orb-like circle
    canvas.height = 400;

    const ctx = canvas.getContext("2d");
    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;

    const barWidth = (WIDTH / bufferLength) * 2.5;

    let animationFrameId;

    const renderFrame = () => {
      animationFrameId = requestAnimationFrame(renderFrame);

      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, WIDTH, HEIGHT);

      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i];

        // Create a linear gradient for each bar
        const gradient = ctx.createLinearGradient(
          x,
          HEIGHT - barHeight,
          x,
          HEIGHT
        );
        gradient.addColorStop(0, "violet"); // Start color
        gradient.addColorStop(1, "pink");  // End color

        ctx.fillStyle = gradient;
        ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
    };

    renderFrame();

    // Play audio and handle cleanup on end
    audio.play().catch((err) => {
      console.error("Audio play failed:", err);
    });

    audio.onended = () => {
      stopAudio();
      cancelAnimationFrame(animationFrameId);
      if (audioContext.state !== "closed") {
        audioContext.close();
      }
    };

    return () => {
      // Cleanup the animation and audio resources
      cancelAnimationFrame(animationFrameId);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close();
      }
    };
  }, [audioUrl, stopAudio]);

  return (
    <div className="audio-visualizer">
      <canvas ref={canvasRef}></canvas>
    </div>
  );
};

export default AudioVisualizer;




