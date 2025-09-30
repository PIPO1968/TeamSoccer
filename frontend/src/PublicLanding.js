import React, { useState, useEffect } from 'react';

function PublicLanding() {
  const [activeManagers, setActiveManagers] = useState(123);
  const [onlineManagers, setOnlineManagers] = useState(45);
  const [dateStr, setDateStr] = useState('');
  const [timeStr, setTimeStr] = useState('');
  const [language, setLanguage] = useState('es');
  useEffect(() => {
    const now = new Date();
    setDateStr(now.toLocaleDateString());
    setTimeStr(now.toLocaleTimeString());
    setActiveManagers(123);
    setOnlineManagers(45);
  }, []);
  return (
    <div style={{ minHeight: '100vh', background: '#1a2a44' }}>
      <header style={{ background: '#eaeaea', padding: '16px 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', width: '100%', maxWidth: 1200 }}>
          <div style={{ minWidth: 120, display: 'flex', alignItems: 'center' }}>
            <img src="https://www.teamsoccer.org/teamsoccer-assets/cbc230b4-3215-4a9f-9673-4064a3ad90c4.png" alt="Logo TeamSoccer" style={{ width: 60, marginRight: 16 }} />
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 32, justifyContent: 'center', fontWeight: 'bold', fontSize: '1rem', color: '#1a2a44' }}>
            <span>Usuarios: {activeManagers}</span>
            <span>Online: {onlineManagers}</span>
            <span>{dateStr} {timeStr}</span>
          </div>
          <div style={{ minWidth: 120, maxWidth: 180, marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, flex: '0 0 auto', justifyContent: 'flex-end' }}>
            <span style={{ fontWeight: 'bold', fontSize: '1rem', color: '#1a2a44' }}>Idioma:</span>
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
        </div>
      </header>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 80px)' }}>
        <img src="https://www.teamsoccer.org/teamsoccer-assets/cbc230b4-3215-4a9f-9673-4064a3ad90c4.png" alt="Logo TeamSoccer" style={{ width: 180, margin: '48px 0 24px 0' }} />
        <h2 style={{ color: '#1a2a44', marginBottom: 16 }}>Bienvenido a TeamSoccer</h2>
        <p style={{ color: '#1a2a44', fontSize: '1.1rem', marginBottom: 24 }}>¡Regístrate o inicia sesión para crear tu club y empezar a competir!</p>
        <a href="/login"><button style={{ width: '100%', marginBottom: 12, padding: '12px 0', fontSize: '1.1rem', borderRadius: 8, background: '#1a2a44', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Iniciar sesión</button></a>
        <a href="/register"><button style={{ width: '100%', padding: '12px 0', fontSize: '1.1rem', borderRadius: 8, background: '#eaeaea', color: '#1a2a44', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Registrarse</button></a>
      </div>
    </div>
  );
}

export default PublicLanding;
