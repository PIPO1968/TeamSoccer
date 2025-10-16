import React, { useState, useEffect } from 'react';

function PublicLanding() {
  const [activeManagers, setActiveManagers] = useState(123);
  const [onlineManagers, setOnlineManagers] = useState(45);
  const [dateStr, setDateStr] = useState('');
  const [timeStr, setTimeStr] = useState('');
  const [language, setLanguage] = useState('es');
  useEffect(() => {
    const now = new Date();
    // Día de la semana en español
    const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const diaSemana = dias[now.getDay()];
    // Fecha en formato dd/mm/yyyy
    const fecha = now.toLocaleDateString('es-ES');
    // Hora en formato 24h
    const hora = now.toLocaleTimeString('es-ES', { hour12: false });
    setDateStr(`${diaSemana}, ${fecha}`);
    setTimeStr(hora);
    setActiveManagers(123);
    setOnlineManagers(45);
  }, []);
  return (
    <div style={{ minHeight: '100vh', background: '#1a2a44' }}>
      <header style={{ position: 'fixed', top: 0, left: 0, width: '100%', background: '#eaeaea', padding: '16px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, boxShadow: '0 2px 8px #0002' }}>
        <div style={{ display: 'flex', alignItems: 'center', width: '100%', maxWidth: 1200 }}>
          <div style={{ minWidth: 120, display: 'flex', alignItems: 'center' }}>
            <img src="https://www.teamsoccer.org/teamsoccer-assets/06dfc4b1-c0ea-4de3-af56-84bcea0a199e.png" alt="Logo TeamSoccer" style={{ width: 60, marginRight: 16 }} />
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
      <div className="login-register-layout" style={{ minHeight: '100vh', paddingTop: 96 }}>
        {/* Bloque izquierdo: login y registro */}
        <div className="login-block" style={{ background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: 220, padding: '40px 20px', boxShadow: '2px 0 8px #0001' }}>
          <h2 style={{ color: '#1a2a44', fontWeight: 'bold', fontSize: '1.5rem', marginBottom: 18, textAlign: 'center' }}>Acceso</h2>
          <a href="/login"><button style={{ width: 180, marginBottom: 12, padding: '12px 0', fontSize: '1.1rem', borderRadius: 8, background: '#1a2a44', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Iniciar sesión</button></a>
          <a href="/register"><button style={{ width: 180, padding: '12px 0', fontSize: '1.1rem', borderRadius: 8, background: '#eaeaea', color: '#1a2a44', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Registrarse</button></a>
        </div>
        {/* Bloque derecho: logo y presentación */}
        <div className="presentation-block" style={{ background: '#eaeaea', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: 320, padding: '40px 20px' }}>
          <img src="https://www.teamsoccer.org/teamsoccer-assets/06dfc4b1-c0ea-4de3-af56-84bcea0a199e.png" alt="Logo TeamSoccer" style={{ width: 180, marginBottom: 32 }} />
          <h2 style={{ color: '#1a2a44', fontWeight: 'bold', fontSize: '2.5rem', marginBottom: 18, textAlign: 'center' }}>Team Soccer Manager</h2>
          <p style={{ color: '#1a2a44', fontSize: '1.25rem', textAlign: 'center', maxWidth: 480, marginBottom: 0 }}>¡Crea tu club, compite y conviértete en leyenda! Vive la experiencia de gestión futbolística más completa y desafía a miles de managers en línea.</p>
        </div>
      </div>
    </div>
  );
}

export default PublicLanding;
