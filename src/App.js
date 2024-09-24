// src/App.js
// src/App.js
// src/App.js

import React, { useEffect } from 'react';
import JarvisInput from './components/JarvisInput';
import Title from './components/Title';
import './App.css';

function App() {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <div className="App">
      <Title />
      <JarvisInput />
    </div>
  );
}

export default App;

