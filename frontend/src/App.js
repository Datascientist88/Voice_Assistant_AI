import React, { useEffect } from 'react';
import JarvisInput from './components/JarvisInput';
import Title from './components/Title';
import './App.css';
import LanguageSelector from './components/LanguageSelector';
import useLanguageStore from './components/store/useLanguageStore';
function App() {
  const { selectedLanguage, setSelectedLanguage } = useLanguageStore();
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
      <LanguageSelector
           selectedLanguage={selectedLanguage}
           setSelectedLanguage={setSelectedLanguage}
      />
    </div>
  );
}

export default App;

