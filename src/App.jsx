import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Settings from './pages/Settings';

function App() {

  useEffect(() => {
    const root = document.documentElement;
    const savedPrimary = localStorage.getItem('theme-primary');
    const savedBgType = localStorage.getItem('theme-bg-type');
    const savedBg = localStorage.getItem('theme-bg');
    const savedBgUrl = localStorage.getItem('theme-bg-url');

    if (savedPrimary) root.style.setProperty('--navy-dark', savedPrimary);
    
    if (savedBgType === 'image' && savedBgUrl) {
      root.style.setProperty('--bg-image', `url('${savedBgUrl}')`);
    } else if (savedBg) {
      root.style.setProperty('--bg-color', savedBg);
    }
  }, []);

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/settings" element={<Settings />} /> 
      </Routes>
    </div>
  );
}

export default App;