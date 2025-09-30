import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PublicLanding from './PublicLanding';
import Home from './Home';
import ClubSetup from './ClubSetup';
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
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
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

  // Simulación: tras login, si no hay club configurado, mostrar ClubSetup
  const handleClubSetup = (data) => {
    setClubConfigured(true);
    setClubData(data);
    setNotification('¡Club configurado!');
    // Redirigir a Home automáticamente
    window.location.href = '/login';
  };

  // Efectos para cargar datos iniciales
  useEffect(() => {
    // Simulación de carga de traducciones
    setTranslations({});
    // Simulación de fecha/hora
    const now = new Date();
    setDateStr(now.toLocaleDateString());
    setTimeStr(now.toLocaleTimeString());
    // Simulación de stats
    setActiveManagers(123);
    setOnlineManagers(45);
  }, []);

  // Funciones de login/register/logout
  const handleLogin = async (data) => {
    setUser(data.user);
    setToken(data.token);
    setShowLogin(false);
    setNotification('¡Bienvenido!');
    // Consultar al backend si el club ya está configurado
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/teams/${data.user.clubId}`, {
        headers: { Authorization: `Bearer ${data.token}` }
      });
      if (res.ok) {
        const club = await res.json();
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
      setClubConfigured(false);
      setClubData(null);
    }
  };
  const handleRegister = (data) => {
    setUser(data.user);
    setToken(data.token);
    setShowLogin(false);
    setNotification('¡Registro exitoso!');
  };
  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setShowLogin(true);
    setNotification('Sesión cerrada');
  };
  const handleTeamsUpdate = (teamsList) => {
    setTeams(teamsList);
  };


  return (
    <Router>
      <Header />
      <TopNavBar />
      <div style={{ paddingTop: 112 }}>
        <Routes>
          <Route path="/" element={<PublicLanding />} />
          <Route path="/login" element={
            <div className="App">
              {/* Notificación en tiempo real */}
              {notification && (
                <div style={{ position: 'fixed', top: 10, right: 10, background: '#1a2a44', color: '#fff', padding: '12px 20px', borderRadius: 8, zIndex: 9999, boxShadow: '0 2px 8px #0004' }}>
                  {notification}
                  <button style={{ marginLeft: 16, background: 'transparent', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => setNotification(null)}>X</button>
                </div>
              )}
              <div className="main-content">
                {!user ? (
                  <div>
                    {showLogin ? (
                      <div>
                        <Login onLogin={handleLogin} />
                        <p>¿No tienes cuenta? <button onClick={() => setShowLogin(false)}>Regístrate</button></p>
                      </div>
                    ) : (
                      <div>
                        <Register onRegister={handleRegister} />
                        <p>¿Ya tienes cuenta? <button onClick={() => setShowLogin(true)}>Inicia sesión</button></p>
                      </div>
                    )}
                  </div>
                ) : !clubConfigured ? (
                  <ClubSetup onSetup={handleClubSetup} onLogout={handleLogout} />
                ) : (
                  <Home user={user} clubData={clubData} onLogout={handleLogout} />
                )}
              </div>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
