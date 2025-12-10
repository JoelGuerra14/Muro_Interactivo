import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (isRegistering) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await setDoc(doc(db, "users", user.uid), {
          nombre, apellido, email, uid: user.uid
        });
        alert("¡Bienvenido! Cuenta creada.");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate('/');
    } catch (error) {
      console.error(error);
      alert("Error: " + error.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">{isRegistering ? 'Crear Cuenta' : 'Bienvenido'}</h2>
        
        <form onSubmit={handleAuth} className="auth-form">
          {isRegistering && (
            <>
              <input type="text" className="custom-input" placeholder="Nombre" 
                value={nombre} onChange={(e) => setNombre(e.target.value)} required />
              <input type="text" className="custom-input" placeholder="Apellido" 
                value={apellido} onChange={(e) => setApellido(e.target.value)} required />
            </>
          )}

          <input type="email" className="custom-input" placeholder="Correo electrónico" 
            value={email} onChange={(e) => setEmail(e.target.value)} required />
          
          <input type="password" className="custom-input" placeholder="Contraseña" 
            value={password} onChange={(e) => setPassword(e.target.value)} required />

          <button type="submit" className="btn-primary">
            {isRegistering ? 'Registrarse' : 'Iniciar Sesión'}
          </button>
        </form>

        <p className="toggle-text">
          {isRegistering ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
          <button onClick={() => setIsRegistering(!isRegistering)} className="toggle-btn">
            {isRegistering ? 'Inicia aquí' : 'Regístrate aquí'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;