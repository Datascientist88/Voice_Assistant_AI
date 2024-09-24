import React, { useEffect, useRef } from 'react';
import './CustomOrb.css'; // Import your CSS file

const CustomOrb = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const MAX = 50;
    let canvas = canvasRef.current;
    let ctx = canvas.getContext('2d');
    let count = 0;
    let points = [];

    // Set canvas dimensions to match CSS scaling
    canvas.width = canvas.height = 300; // Reduce size for a smaller orb

    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let r = 0;
    for (let a = 0; a < MAX; a++) {
      points.push([Math.cos(r), Math.sin(r), 0]);
      r += (Math.PI * 2) / MAX;
    }

    for (let a = 0; a < MAX; a++) {
      points.push([0, points[a][0], points[a][1]]);
    }

    for (let a = 0; a < MAX; a++) {
      points.push([points[a][1], 0, points[a][0]]);
    }

    const animate = () => {
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(0,0,0,0.03)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "lighter";

      let tim = count / 5;

      for (let e = 0; e < 3; e++) {
        tim *= 1.7;
        let s = 1 - e / 3;
        let a = tim / 59;
        let yp = Math.cos(a);
        let yp2 = Math.sin(a);
        a = tim / 23;
        let xp = Math.cos(a);
        let xp2 = Math.sin(a);
        let p2 = [];

        for (let a = 0; a < points.length; a++) {
          let x = points[a][0];
          let y = points[a][1];
          let z = points[a][2];

          let y1 = y * yp + z * yp2;
          let z1 = y * yp2 - z * yp;
          let x1 = x * xp + z1 * xp2;

          z = x * xp2 - z1 * xp;
          z1 = Math.pow(2, z * s);
          x = x1 * z1;
          y = y1 * z1;
          p2.push([x, y, z]);
        }

        s *= 90; // Reduce the scale to fit the smaller canvas
        for (let d = 0; d < 3; d++) {
          for (let a = 0; a < MAX; a++) {
            const b = p2[d * MAX + a];
            const c = p2[((a + 1) % MAX) + d * MAX];
            ctx.beginPath();
            ctx.strokeStyle = "hsla(" + (((a / MAX) * 360) | 0) + ",70%,60%,0.15)";
            ctx.lineWidth = Math.pow(6, b[2]);
            ctx.lineTo(b[0] * s + 150, b[1] * s + 150); // Adjust for smaller canvas
            ctx.lineTo(c[0] * s + 150, c[1] * s + 150); // Adjust for smaller canvas
            ctx.stroke();
          }
        }
      }
      count++;
      requestAnimationFrame(animate);
    };

    // Start the animation
    animate();

    return () => {
      // Clean up animation on component unmount
      cancelAnimationFrame(animate);
    };
  }, []);

  return <canvas ref={canvasRef}></canvas>;
};

export default CustomOrb;
