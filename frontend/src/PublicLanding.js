import React from 'react';

function PublicLanding() {
  return (
    <div style={{ minHeight: '100vh', background: '#1a2a44' }}>
      <div className="login-register-layout" style={{ minHeight: '100vh', paddingTop: 96, flexDirection: 'row' }}>
        {/* Bloque izquierdo: login y registro */}
        <div className="login-block">
          <h2 style={{ color: '#1a2a44', fontWeight: 'bold', fontSize: '1.5rem', marginBottom: 18, textAlign: 'center' }}>Acceso</h2>
          <a href="/login"><button style={{ width: 180, marginBottom: 12, padding: '12px 0', fontSize: '1.1rem', borderRadius: 8, background: '#1a2a44', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Iniciar sesión</button></a>
          <a href="/register"><button style={{ width: 180, padding: '12px 0', fontSize: '1.1rem', borderRadius: 8, background: '#eaeaea', color: '#1a2a44', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Registrarse</button></a>
        </div>
        {/* Bloque derecho: logo y presentación */}
        <div className="presentation-block">
          <img src="https://www.teamsoccer.org/teamsoccer-assets/06dfc4b1-c0ea-4de3-af56-84bcea0a199e.png" alt="Logo TeamSoccer" style={{ width: 180, marginBottom: 32 }} />
          <h2 style={{ color: '#1a2a44', fontWeight: 'bold', fontSize: '2.5rem', marginBottom: 18, textAlign: 'center' }}>Team Soccer Manager</h2>
          <p style={{ color: '#1a2a44', fontSize: '1.25rem', textAlign: 'center', maxWidth: 480, marginBottom: 0 }}>¡Crea tu club, compite y conviértete en leyenda! Vive la experiencia de gestión futbolística más completa y desafía a miles de managers en línea.</p>
        </div>
      </div>
    </div>
  );
}

export default PublicLanding;
