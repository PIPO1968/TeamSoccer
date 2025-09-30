import React from 'react';

function PublicLanding() {
  return (
    <div className="public-landing" style={{ padding: 40, textAlign: 'center' }}>
      <img src="https://www.teamsoccer.org/teamsoccer-assets/cbc230b4-3215-4a9f-9673-4064a3ad90c4.png" alt="Logo TeamSoccer" style={{ width: 180, marginBottom: 24 }} />
      <h1>Bienvenido a TeamSoccer</h1>
      <p>¡El manager de fútbol online más completo!<br />Crea tu club, compite y haz historia.</p>
      <a href="/login"><button style={{ marginTop: 32, padding: '12px 32px', fontSize: '1.2rem', borderRadius: 8, background: '#1a2a44', color: '#fff', border: 'none', cursor: 'pointer' }}>Iniciar sesión</button></a>
    </div>
  );
}

export default PublicLanding;
