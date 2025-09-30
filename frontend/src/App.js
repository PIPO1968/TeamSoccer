import Home from './Home';
import ClubSetup from './ClubSetup';
// Estado para saber si el club está configurado
const [clubConfigured, setClubConfigured] = useState(false);
const [clubData, setClubData] = useState(null);

// Simulación: tras login, si no hay club configurado, mostrar ClubSetup
const handleClubSetup = (data) => {
  setClubConfigured(true);
  setClubData(data);
  setNotification('¡Club configurado!');
};
import React, { useState, useEffect } from 'react';
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
  const handleLogin = (data) => {
    setUser(data.user);
    setToken(data.token);
    setShowLogin(false);
    setNotification('¡Bienvenido!');
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
    <div className="App">
      {/* Notificación en tiempo real */}
      {notification && (
        <div style={{ position: 'fixed', top: 10, right: 10, background: '#1a2a44', color: '#fff', padding: '12px 20px', borderRadius: 8, zIndex: 9999, boxShadow: '0 2px 8px #0004' }}>
          {notification}
          <button style={{ marginLeft: 16, background: 'transparent', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => setNotification(null)}>X</button>
        </div>
      )}
      <header className="App-header">
        <div className="header-logo-container">
          <img src="https://www.teamsoccer.org/teamsoccer-assets/cbc230b4-3215-4a9f-9673-4064a3ad90c4.png" alt="Logo TeamSoccer" className="header-logo-img" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, minWidth: 180 }}>
          <div className="main-header-info" style={{ display: 'flex', alignItems: 'center', fontSize: '1rem', fontWeight: 'bold', color: '#fff', gap: 32, justifyContent: 'center', width: '100%' }}>
            <span className="main-stats">Usuarios: {activeManagers}</span>
            <span className="main-stats">Online: {onlineManagers}</span>
            <span className="main-date">{dateStr} {timeStr}</span>
          </div>
        </div>
        <div style={{ minWidth: 120, maxWidth: 180, marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, flex: '0 0 auto', justifyContent: 'flex-end' }}>
          <span className="main-choose-language" style={{ fontWeight: 'bold', fontSize: '1rem', color: '#fff' }}>{translations[language]?.chooseLanguage || 'Choose language:'}</span>
          <select value={language} onChange={e => setLanguage(e.target.value)} style={{ padding: '4px 8px', borderRadius: 4, maxWidth: 120 }}>
            <option value="es">Español</option>
            <option value="en">English</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
            <option value="it">Italiano</option>
            <option value="pt">Português</option>
            <option value="ru">Русский</option>
            <option value="zh">中文</option>
            <option value="ja">日本語</option>
            <option value="ar">العربية</option>
            <option value="tr">Türkçe</option>
            <option value="hi">हिन्दी</option>
            <option value="ko">한국어</option>
            <option value="nl">Nederlands</option>
            <option value="pl">Polski</option>
            <option value="id">Bahasa Indonesia</option>
          </select>
        </div>
      </header>
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
  );
}

export default App;
