
import React from 'react';
import { Link } from 'react-router-dom';

function Sidebar({ clubData }) {
    return (
        <aside className="global-sidebar">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#1a2a44', whiteSpace: 'nowrap' }}>{clubData?.teamName || 'Nombre del club'}</div>
                <img src={clubData?.escudoUrl || 'https://www.teamsoccer.org/teamsoccer-assets/default-escudo.png'} alt="Escudo del club" style={{ width: 54, height: 54, borderRadius: 8, objectFit: 'cover', boxShadow: '0 2px 8px #0002', background: '#eaeaea' }} />
            </div>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
                <Link to="/liga" style={{ color: '#1a2a44', fontWeight: 'bold', textDecoration: 'none' }}>Liga</Link>
                <Link to="/jugadores" style={{ color: '#1a2a44', fontWeight: 'bold', textDecoration: 'none' }}>Jugadores</Link>
                <Link to="/partidos" style={{ color: '#1a2a44', fontWeight: 'bold', textDecoration: 'none' }}>Partidos</Link>
                <Link to="/estadio" style={{ color: '#1a2a44', fontWeight: 'bold', textDecoration: 'none' }}>Estadio</Link>
                <Link to="/entrenamientos" style={{ color: '#1a2a44', fontWeight: 'bold', textDecoration: 'none' }}>Entrenamientos</Link>
                <Link to="/pais" style={{ color: '#1a2a44', fontWeight: 'bold', textDecoration: 'none' }}>País</Link>
            </nav>
        </aside>
    );
}

export default Sidebar;
