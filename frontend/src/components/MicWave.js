import React, { useEffect, useRef } from 'react';
import './MicWave.css';

const MicWave = ({ isRecording }) => {
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameIdRef = useRef(null);
  const dataArrayRef = useRef(null);

  useEffect(() => {
    if (!isRecording) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = 350;

    const turbulenceFactor = 0.25;
    const maxAmplitude = canvas.height / 3.5; // Max amplitude of the wave
    const baseLine = canvas.height / 2; // Vertical center of the canvas
    const numberOfWaves = 10;
    let globalTime = 0;

    function createGradient() {
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, 'rgba(255, 25, 255, 0.2)');
      gradient.addColorStop(0.5, 'rgba(25, 255, 255, 0.75)');
      gradient.addColorStop(1, 'rgba(255, 255, 25, 0.2');
      return gradient;
    }

    const gradient = createGradient();

    const drawWave = (dataArray) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      globalTime += 0.05;

      for (let j = 0; j < numberOfWaves; j++) {
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = gradient;

        let x = 0;
        const sliceWidth = (canvas.width * 1.0) / dataArray.length;
        let lastX = 0;
        let lastY = baseLine;

        for (let i = 0; i < dataArray.length; i++) {
          const v = dataArray[i] / 128.0; // Normalize value between 0 and 1
          const mid = dataArray.length / 2;
          const distanceFromMid = Math.abs(i - mid) / mid;
          const dampFactor = 1 - Math.pow((2 * i) / dataArray.length - 1, 2); // Parabolic falloff
          const amplitude = maxAmplitude * dampFactor * (1 - distanceFromMid);
          const isWaveInverted = j % 2 ? 1 : -1;
          const frequency = isWaveInverted * (0.05 + turbulenceFactor);
          const y = baseLine + Math.sin(i * frequency + globalTime + j) * amplitude * v;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            let xc = (x + lastX) / 2;
            let yc = (y + lastY) / 2;
            ctx.quadraticCurveTo(lastX, lastY, xc, yc);
          }

          lastX = x;
          lastY = y;
          x += sliceWidth;
        }

        ctx.lineTo(canvas.width, lastY);
        ctx.stroke();
      }
    };

    const animate = () => {
      const analyser = analyserRef.current;
      const dataArray = dataArrayRef.current;

      analyser.getByteFrequencyData(dataArray);
      drawWave(dataArray);

      animationFrameIdRef.current = requestAnimationFrame(animate);
    };

    navigator.mediaDevices
      .getUserMedia({ audio: true, video: false })
      .then((stream) => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        audioContextRef.current = audioContext;

        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyserRef.current = analyser;

        const microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        dataArrayRef.current = dataArray;

        animate();
      })
      .catch((error) => {
        console.error('Access to microphone denied', error);
      });

    return () => {
      cancelAnimationFrame(animationFrameIdRef.current);
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [isRecording]);

  return (
    <div className="MicWcontainer">
      <canvas ref={canvasRef} id="waveCanvas"></canvas>
    </div>
  );
};

export default MicWave;


