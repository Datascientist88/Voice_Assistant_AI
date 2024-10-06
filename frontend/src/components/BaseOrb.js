import React, { useEffect, useRef } from 'react';
import { createNoise4D } from 'simplex-noise';
import './BaseOrb.scss';

const BaseOrb = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const c = canvasRef.current;
    const ctx = c.getContext('2d');
    const w = 50;
    const h = 50;
    const cols = 50;
    const rows = 50;
    const scale = 0.03;
    const size = 1;
    const TWO_PI = Math.PI * 2;
    const simplex = createNoise4D();
    let t = 0;
    let frameCount = 0;
    const frameTotal = 256;

    c.width = w;
    c.height = h;

    const loop = () => {
      t = frameCount / frameTotal;

      for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
          let x2 = x * size;
          let y2 = y * size;
          let lightness = (simplex(
            x * scale,
            y * scale,
            0.2 * Math.cos(TWO_PI * t),
            0.2 * Math.sin(TWO_PI * t)
          ) + 1) / 2;
          let hue = (simplex(
            x * scale + 1000,
            y * scale + 1000,
            0.2 * Math.cos(TWO_PI * t),
            0.2 * Math.sin(TWO_PI * t)
          ) + 1) / 2;
          ctx.fillStyle = `hsla(${360 - hue * 120}, 100%, ${100 - lightness * 100}%, 1)`;
          ctx.fillRect(x2, y2, size, size);
        }
      }

      if (frameCount < frameTotal) {
        frameCount++;
      } else {
        frameCount = 0;
      }

      requestAnimationFrame(loop);
    };

    loop();

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(loop);
    };
  }, []);

  return <canvas ref={canvasRef} className="container"></canvas>;
};

export default BaseOrb;



