import React from 'react';

function Sidebar({ clubData }) {
    // Puedes personalizar el contenido del sidebar aquí o hacerlo dinámico
    return (
        <aside className="global-sidebar">
            <div style={{ textAlign: 'center', marginBottom: 18 }}>
                <img src={clubData?.escudoUrl || 'https://www.teamsoccer.org/teamsoccer-assets/default-escudo.png'} alt="Escudo del club" style={{ width: 80, height: 80, borderRadius: 8, objectFit: 'cover', marginBottom: 8 }} />
                <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#1a2a44' }}>{clubData?.teamName || 'Nombre del club'}</div>
            </div>
            <div><b>País:</b> {clubData?.country || 'España'}</div>
            <div><b>Estadio:</b> {clubData?.stadiumName || 'Estadio Nacional'}</div>
            {/* Puedes añadir más enlaces o secciones globales aquí */}
        </aside>
    );
}

export default Sidebar;
