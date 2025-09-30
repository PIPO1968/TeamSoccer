import MultiMatchViewer from './MultiMatchViewer';
import RoomMadnessViewer from './RoomMadnessViewer';
import React, { useState, useEffect } from 'react';

import './App.css';

import Register from './Register';
import Login from './Login';
import Teams from './Teams';
import Matches from './Matches';
import Friendlies from './Friendlies';

import NationalDashboard from './NationalDashboard';
import Store from './Store';
import Rooms from './Rooms';
import Community from './Community';


function App() {
  // Inicializar token y user desde localStorage
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [showLogin, setShowLogin] = useState(!localStorage.getItem('token'));
  const [language, setLanguage] = useState('es');
  // Diccionario de traducciones básicas (ejemplo, solo portada y navegación)
  const translations = {
    es: {
      chooseLanguage: 'Elige idioma:',
      welcome: 'Bienvenido',
      register: 'Regístrate',
      login: 'Inicia sesión',
      noAccount: '¿No tienes cuenta?',
      haveAccount: '¿Ya tienes cuenta?',
      clubs: 'Gestión de Clubes',
      national: 'Selecciones Nacionales',
      store: 'Tienda',
      rooms: 'Salas',
      community: 'Comunidad',
      viewer: 'Multi/Match Viewer',
      madness: 'Room Madness',
      premium: 'Premium',
      logout: 'Cerrar sesión',
      mainSlogan: 'Team Soccer Juego de Manager | Únete al mundo del fútbol gratuito',
      buildTrain: 'Construye y entrena tu equipo',
      developTeam: 'Desarrolla tu equipo mediante entrenamiento. Gestiona tus finanzas. Elige tus mejores jugadores.',
      competeLeagues: 'Compite en ligas',
      joinLeagues: 'Únete a ligas competitivas y torneos. Asciende de división.',
      matchExperience: 'Experiencia de partido',
      liveMatches: 'Observa partidos en vivo con nuestro simulador en tiempo real.',
      communitySection: 'Comunidad',
      joinCommunity: 'Únete a una comunidad vibrante de managers de todo el mundo.'
    },
    en: {
      chooseLanguage: 'Choose language:',
      welcome: 'Welcome',
      register: 'Register',
      // ...resto de traducciones...
    },
  };

  useEffect(() => {
    // Aquí podrías usar un servicio externo para detectar país/idioma por IP
    // Por defecto: español
    setLanguage('es');
  }, []);
  useEffect(() => {
    // Aquí podrías usar un servicio externo para detectar país/idioma por IP
    // Por defecto: español
    setLanguage('es');
  }, []);

  // Funciones de login/logout/register al nivel superior
  const handleRegister = (user) => {
    setUser(user);
    setShowLogin(true);
  };
  const handleLogin = ({ token, user }) => {
    setToken(token);
    setUser(user);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setShowLogin(false);
  };
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setShowLogin(true);
  };
  <div className="App">
    {/* Notificación en tiempo real */}
    {notification && (
      <div style={{ position: 'fixed', top: 10, right: 10, background: '#1a2a44', color: '#fff', padding: '12px 20px', borderRadius: 8, zIndex: 9999, boxShadow: '0 2px 8px #0004' }}>
        {notification}
        <button style={{ marginLeft: 16, background: 'transparent', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => setNotification(null)}>X</button>
      </div>
    )}
    <header className="App-header">
      {/* Logo completamente a la izquierda */}
      <div className="header-logo-container">
        <img src="https://www.teamsoccer.org/teamsoccer-assets/cbc230b4-3215-4a9f-9673-4064a3ad90c4.png" alt="Logo TeamSoccer" className="header-logo-img" />
      </div>
      {/* Info y stats centrados */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, minWidth: 180 }}>
        <div className="main-header-info" style={{ display: 'flex', alignItems: 'center', fontSize: '1rem', fontWeight: 'bold', color: '#fff', gap: 32, justifyContent: 'center', width: '100%' }}>
          <span className="main-stats">
            Usuarios: {activeManagers}
          </span>
          <span className="main-stats">
            Online: {onlineManagers}
          </span>
          <span className="main-date">
            {dateStr} {timeStr}
          </span>
        </div>
      </div>
      {/* Selector de idioma a la derecha */}
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

    {/* Contenido principal fuera del header */}
    {!user ? (
      <div className="main-content">
        <div style={{ marginBottom: 30 }}>
          <div className="main-slogan">
            {translations[language]?.mainSlogan || 'Team Soccer Juego de Manager | Únete al mundo del fútbol gratuito'}
          </div>
          <img
            src="https://www.teamsoccer.org/teamsoccer-assets/06dfc4b1-c0ea-4de3-af56-84bcea0a199e.png"
            alt="TeamSoccer"
            style={{ maxWidth: '90vw', maxHeight: 320, borderRadius: 12, boxShadow: '0 2px 12px #0002', cursor: 'pointer' }}
            onClick={() => window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank')}
            title="Haz clic para ver el video de presentación"
          />
        </div>
        {/* Textos informativos traducidos */}
        <div style={{
          background: '#f7faff',
          borderRadius: 10,
          boxShadow: '0 1px 8px #0001',
          padding: '18px 18px 10px 18px',
          margin: '0 auto 24px auto',
          maxWidth: 600,
          fontSize: '1.08rem',
          color: '#1a2a44',
          lineHeight: 1.6
        }}>
          <div style={{ marginBottom: 10, fontWeight: 600 }}>{
            translations[language]?.buildTrain || 'Construye y entrena tu equipo'
          }</div>
          <div style={{ marginBottom: 16 }}>{
            translations[language]?.developTeam || 'Desarrolla tu equipo mediante entrenamiento. Gestiona tus finanzas. Elige tus mejores jugadores.'
          }</div>
          <div style={{ marginBottom: 10, fontWeight: 600 }}>{
            translations[language]?.competeLeagues || 'Compite en ligas'
          }</div>
          <div style={{ marginBottom: 16 }}>{
            translations[language]?.joinLeagues || 'Únete a ligas competitivas y torneos. Asciende de división.'
          }</div>
          <div style={{ marginBottom: 10, fontWeight: 600 }}>{
            translations[language]?.matchExperience || 'Experiencia de partido'
          }</div>
          <div style={{ marginBottom: 16 }}>{
            translations[language]?.liveMatches || 'Observa partidos en vivo con nuestro simulador en tiempo real.'
          }</div>
          <div style={{ marginBottom: 10, fontWeight: 600 }}>{
            translations[language]?.communitySection || 'Comunidad'
          }</div>
          <div>{
            translations[language]?.joinCommunity || 'Únete a una comunidad vibrante de managers de todo el mundo.'
          }</div>
        </div>
        {showLogin ? (
          <>
            <Login onLogin={handleLogin} />
            <p>¿No tienes cuenta? <button onClick={() => setShowLogin(false)}>Regístrate</button></p>
          </>
        ) : (
          <>
            <Register onRegister={handleRegister} />
            <p>¿Ya tienes cuenta? <button onClick={() => setShowLogin(true)}>Inicia sesión</button></p>
          </>
        )}
      </div>
    ) : (
      <>
        <h2>Bienvenido, {user.username}</h2>
        <button onClick={handleLogout}>Cerrar sesión</button>
        <nav style={{ marginBottom: 20 }}>
          <button onClick={() => { setShowNational(false); setShowStore(false); setShowRooms(false); setShowCommunity(false); setShowViewer(false); setShowRoomMadness(false); }}>Gestión de Clubes</button>
          <button onClick={() => { setShowNational(true); setShowStore(false); setShowRooms(false); setShowCommunity(false); setShowViewer(false); setShowRoomMadness(false); }}>Selecciones Nacionales</button>
          <button onClick={() => { setShowStore(true); setShowNational(false); setShowRooms(false); setShowCommunity(false); setShowViewer(false); setShowRoomMadness(false); }}>Tienda</button>
          <button onClick={() => { setShowRooms(true); setShowStore(false); setShowNational(false); setShowCommunity(false); setShowViewer(false); setShowRoomMadness(false); }}>Salas</button>
          <button onClick={() => { setShowCommunity(true); setShowRooms(false); setShowStore(false); setShowNational(false); setShowViewer(false); setShowRoomMadness(false); }}>Comunidad</button>
          <button onClick={() => { setShowViewer(true); setShowCommunity(false); setShowRooms(false); setShowStore(false); setShowNational(false); setShowRoomMadness(false); }}>Multi/Match Viewer</button>
          <button onClick={() => { setShowRoomMadness(true); setShowViewer(false); setShowCommunity(false); setShowRooms(false); setShowStore(false); setShowNational(false); }}>Room Madness</button>
          {user?.premium && <span style={{ marginLeft: 10, color: 'gold', fontWeight: 'bold' }}>👑 Premium</span>}
        </nav>
        {showRoomMadness ? (
          <RoomMadnessViewer />
        ) : showViewer ? (
          <MultiMatchViewer token={token} user={user} />
        ) : showCommunity ? (
          <Community token={token} user={user} />
        ) : showRooms ? (
          <Rooms token={token} user={user} />
        ) : showStore ? (
          <Store token={token} user={user} />
        ) : !showNational ? (
          <>
            <Teams token={token} onTeamsUpdate={handleTeamsUpdate} />
            <Friendlies token={token} userId={user._id} teams={teams} />
            <Matches token={token} />
          </>
        ) : (
          <NationalDashboard token={token} />
        )}
      </>
    )}
  </div>
  );
}

export default App;
