import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PublicLanding from './PublicLanding';
import Home from './Home';
import MultiMatchViewer from './MultiMatchViewer';
import RoomMadnessViewer from './RoomMadnessViewer';
import Login from './Login';
import Register from './Register';
import Teams from './Teams';
import Friendlies from './Friendlies';
import Matches from './Matches';
import Store from './Store';
import Rooms from './Rooms';
import Community from './Community';
import NationalDashboard from './NationalDashboard';
import Header from './Header';
import TopNavBar from './TopNavBar';
import Sidebar from './Sidebar';

const infoBoxStyle = {
  background: '#f7faff',
  borderRadius: '10px',
  boxShadow: '0 1px 8px #0001',
  padding: '18px 18px 10px 18px',
  margin: '0 auto 24px auto',
  maxWidth: '600px',
  fontSize: '1.08rem',
  color: '#1a2a44',
  lineHeight: 1.6
};

function App() {
  // Estados principales
  const [notification, setNotification] = useState(null);
  const [activeManagers, setActiveManagers] = useState(0);
  const [onlineManagers, setOnlineManagers] = useState(0);
  const [dateStr, setDateStr] = useState('');
  const [timeStr, setTimeStr] = useState('');
  const [language, setLanguage] = useState('es');
  const [translations, setTranslations] = useState({});
  const [user, setUser] = useState(null); // No usamos localStorage
  // Usar sessionStorage para persistir el token durante la sesión del navegador
  const [token, setToken] = useState(() => sessionStorage.getItem('token') || null);
  const [loading, setLoading] = useState(!!sessionStorage.getItem('token'));
  const [showLogin, setShowLogin] = useState(true);
  const [showNational, setShowNational] = useState(false);
  const [showStore, setShowStore] = useState(false);
  const [showRooms, setShowRooms] = useState(false);
  const [showCommunity, setShowCommunity] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [showRoomMadness, setShowRoomMadness] = useState(false);
  const [teams, setTeams] = useState([]);
  // Estado para saber si el club está configurado
  const [clubConfigured, setClubConfigured] = useState(false);
  const [clubData, setClubData] = useState(null);

  // Crear el club en el backend y actualizar estado
  // (No hay uso de localStorage aquí)

  // Efectos para cargar datos iniciales y validar sesión
  useEffect(() => {
    setTranslations({});
    const now = new Date();
    setDateStr(now.toLocaleDateString());
    setTimeStr(now.toLocaleTimeString());
    setActiveManagers(123);
    setOnlineManagers(45);

    // Validar sesión persistente con el backend
    if (token) {
      setLoading(true);
      fetch(`${process.env.REACT_APP_API_URL}/api/auth/me`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          console.log('[DEBUG] /api/auth/me status:', res.status);
          return res.ok ? res.json() : null;
        })
        .then(data => {
          console.log('[DEBUG] /api/auth/me data:', data);
          if (data && data.user) {
            setUser(data.user);
            setNotification('Sesión restaurada');
            // Consultar club solo si hay clubId válido
            if (data.user.clubId && data.user.clubId !== 'undefined' && data.user.clubId !== 'null') {
              fetch(`${process.env.REACT_APP_API_URL}/api/teams/${data.user.clubId}`, {
                headers: { Authorization: `Bearer ${token}` }
              })
                .then(res => {
                  console.log('[DEBUG] /api/teams/clubId status:', res.status);
                  return res.ok ? res.json() : null;
                })
                .then(club => {
                  console.log('[DEBUG] /api/teams/clubId data:', club);
                  if (club && club.name) {
                    setClubConfigured(true);
                    setClubData({
                      teamName: club.name,
                      stadiumName: club.stadiumName,
                      city: club.city,
                      country: club.country
                    });
                  } else {
                    setClubConfigured(false);
                    setClubData(null);
                  }
                  setLoading(false);
                });
            } else {
              setClubConfigured(false);
              setClubData(null);
              setLoading(false);
            }
          } else {
            setUser(null);
            setToken(null);
            setLoading(false);
          }
        })
        .catch((err) => {
          console.log('[DEBUG] /api/auth/me error:', err);
          setUser(null);
          setToken(null);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [token]);

  // Funciones de login/register/logout
  // Eliminado cualquier uso de localStorage. El estado solo vive en memoria.
  const handleLogin = async (data) => {
    console.log('[DEBUG] handleLogin data:', data);
    setUser(data.user);
    setToken(data.token);
    sessionStorage.setItem('token', data.token);
    setShowLogin(false);
    setNotification('¡Bienvenido!');
    // Consultar al backend si el club ya está configurado
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/teams/${data.user.clubId}`, {
        headers: { Authorization: `Bearer ${data.token}` }
      });
      console.log('[DEBUG] /api/teams/clubId (login) status:', res.status);
      if (res.ok) {
        const club = await res.json();
        console.log('[DEBUG] /api/teams/clubId (login) data:', club);
        if (club && club.name) {
          setClubConfigured(true);
          setClubData({
            teamName: club.name,
            stadiumName: club.stadiumName,
            city: club.city,
            country: club.country
          });
        } else {
          setClubConfigured(false);
          setClubData(null);
        }
      } else {
        setClubConfigured(false);
        setClubData(null);
      }
    } catch (err) {
      console.log('[DEBUG] /api/teams/clubId (login) error:', err);
      setClubConfigured(false);
      setClubData(null);
    }
  };
  const handleRegister = (data) => {
    console.log('[DEBUG] handleRegister data:', data);
    setUser(data.user);
    setToken(data.token);
    sessionStorage.setItem('token', data.token);
    setShowLogin(false);
    setNotification('¡Registro exitoso!');
  };
  const handleLogout = () => {
    setUser(null);
    setToken(null);
    sessionStorage.removeItem('token');
    setShowLogin(true);
    setNotification('Sesión cerrada');
  };
  const handleTeamsUpdate = (teamsList) => {
    setTeams(teamsList);
  };


  return (
    <Router>
      <Header />
      {user && <TopNavBar />}
      <div style={{ paddingTop: 64 + (user ? 48 : 0), display: 'flex', flexDirection: 'row', minHeight: '100vh', background: '#495057' }}>
        {user && <Sidebar clubData={clubData} />}
        <div style={{ flex: 1, minWidth: 0 }}>
          {loading ? (
            <div style={{ textAlign: 'center', marginTop: 80, fontSize: 22, color: '#1a2a44' }}>Validando sesión...</div>
          ) : (
            <Routes>
              <Route path="/" element={<PublicLanding />} />
              <Route path="/login" element={
                <div style={{ width: '100%', maxWidth: 420, margin: '0 auto', paddingTop: 48 }}>
                  {/* Notificación en tiempo real */}
                  {notification && (
                    <div style={{ position: 'fixed', top: 10, right: 10, background: '#1a2a44', color: '#fff', padding: '12px 20px', borderRadius: 8, zIndex: 9999, boxShadow: '0 2px 8px #0004' }}>
                      {notification}
                      <button style={{ marginLeft: 16, background: 'transparent', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => setNotification(null)}>X</button>
                    </div>
                  )}
                  {!user ? (
                    <div>
                      {showLogin ? (
                        <div>
                          <Login onLogin={handleLogin} />
                          <p style={{ textAlign: 'center', marginTop: 18 }}>¿No tienes cuenta? <button style={{ background: '#eaeaea', color: '#1a2a44', border: 'none', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setShowLogin(false)}>Regístrate</button></p>
                        </div>
                      ) : (
                        <Register onRegister={handleRegister} />
                      )}
                    </div>
                  ) : (
                    <Home user={user} clubData={clubData} onLogout={handleLogout} />
                  )}
                </div>
              } />
              <Route path="/register" element={
                <div style={{ width: '100%', maxWidth: 420, margin: '0 auto', paddingTop: 48 }}>
                  <Register onRegister={handleRegister} />
                  <p style={{ textAlign: 'center', marginTop: 18 }}>¿Ya tienes cuenta? <a href="/login" style={{ color: '#1a2a44', textDecoration: 'underline', fontWeight: 'bold' }}>Inicia sesión</a></p>
                </div>
              } />
            </Routes>
          )}
        </div>
      </div>
    </Router>
  );
}

export default App;
