import React from 'react';
import { Player } from '@lottiefiles/react-lottie-player'; // Import Lottie Player

const CustomOrb = () => {
  return (
    <div className='customOrb'
      style={{
        width: '500px',
        height: '500px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'none', // Ensure transparent background
      }}
    >
      <Player
        autoplay
        loop
        src="/animations.json" // Correctly reference the JSON file in the public folder
        style={{
          width: '100%',
          height: '100%',
          background: 'none', // Remove white background
        }}
      />
    </div>
  );
};

export default CustomOrb;



