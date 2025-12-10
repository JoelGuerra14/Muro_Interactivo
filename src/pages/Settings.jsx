import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

function Settings() {
  const navigate = useNavigate();
  const user = auth.currentUser;

  const [currentMode, setCurrentMode] = useState('light');
  const [primaryColor, setPrimaryColor] = useState('#0a192f');
  const [bgUrl, setBgUrl] = useState('');

    const [photoURL, setPhotoURL] = useState('');

  useEffect(() => {
    const savedMode = localStorage.getItem('theme-mode') || 'light';
    const savedColor = localStorage.getItem('theme-primary') || '#0a192f';
    const savedBg = localStorage.getItem('theme-bg-url') || '';
    
    setCurrentMode(savedMode);
    setPrimaryColor(savedColor);
    setBgUrl(savedBg);

    const fetchUserData = async () => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().photoURL) {
          setPhotoURL(docSnap.data().photoURL);
        }
      }
    };
    fetchUserData();
  }, [user]);

  const handleSaveVisuals = () => {
    const root = document.documentElement;

    localStorage.setItem('theme-mode', currentMode);
    if (currentMode === 'dark') {
      root.style.setProperty('--bg-color', '#020c1b');
      root.style.setProperty('--card-bg', '#112240');
      root.style.setProperty('--text-main', '#e6f1ff');
    } else {
      root.style.setProperty('--bg-color', '#f4f6f8');
      root.style.setProperty('--card-bg', '#ffffff');
      root.style.setProperty('--text-main', '#333333');
    }

    root.style.setProperty('--navy-dark', primaryColor);
    localStorage.setItem('theme-primary', primaryColor);

    if (bgUrl) {
      root.style.setProperty('--bg-image', `url('${bgUrl}')`);
      localStorage.setItem('theme-bg-url', bgUrl);
    } else {
      root.style.setProperty('--bg-image', 'none');
      localStorage.setItem('theme-bg-url', '');
    }

    alert('¡Diseño actualizado!');
  };

  const handleSavePhoto = async () => {
    if (!user) return;
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        photoURL: photoURL
      });
      alert('¡Foto de perfil actualizada!');
    } catch (error) {
      console.error(error);
      alert('Error al guardar la foto');
    }
  };

  return (
    <div className="main-container">
      <div className="settings-card" style={{padding: '30px'}}>
        <h2 style={{color: primaryColor, borderBottom: '1px solid #ccc'}}>Configuración</h2>

        <div style={{marginBottom: '30px'}}>
          <h3>Tu Perfil</h3>
          <label>URL de tu Foto:</label>
          <input 
            type="text" 
            placeholder="https://ejemplo.com/mifoto.jpg"
            value={photoURL}
            onChange={(e) => setPhotoURL(e.target.value)}
            style={{width: '100%', padding: '10px', marginTop: '5px', marginBottom: '10px'}}
          />
          <div style={{fontSize: '0.8rem', color: 'gray', marginBottom: '10px'}}>
            Tip: Puedes copiar el link de una imagen de Google, Instagram o Pinterest.
          </div>
          <button onClick={handleSavePhoto} className="btn-primary" style={{backgroundColor: primaryColor}}>
            Guardar Foto
          </button>
        </div>

        <hr />

        <div style={{marginTop: '30px'}}>
          <h3>Apariencia</h3>
          
          <div style={{display: 'flex', gap: '10px', marginBottom: '20px'}}>
            <button onClick={() => setCurrentMode('light')} style={{padding: '10px', border: currentMode==='light'?'2px solid blue':'1px solid gray'}}>☀️ Claro</button>
            <button onClick={() => setCurrentMode('dark')} style={{padding: '10px', background:'#0a192f', color:'white', border: currentMode==='dark'?'2px solid cyan':'1px solid gray'}}>🌙 Oscuro</button>
          </div>

          <label>Color Principal:</label>
          <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} style={{marginLeft: '10px'}} />
          
          <br /><br />

          <label>Fondo de Pantalla (URL):</label>
          <input 
            type="text" 
            placeholder="Pegar link de imagen de fondo..." 
            value={bgUrl} 
            onChange={(e) => setBgUrl(e.target.value)} 
            style={{width: '100%', padding: '10px', marginTop: '5px'}}
          />

          <button onClick={handleSaveVisuals} className="btn-primary" style={{marginTop: '20px', width: '100%', backgroundColor: primaryColor}}>
            Aplicar Cambios Visuales
          </button>
        </div>

        <button onClick={() => navigate('/')} style={{marginTop: '20px', background:'transparent', border:'none', cursor:'pointer', color: 'gray'}}>
          ← Volver al Muro
        </button>
      </div>
    </div>
  );
}

export default Settings;