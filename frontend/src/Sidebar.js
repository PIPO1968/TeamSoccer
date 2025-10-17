
import React from 'react';
import { Link } from 'react-router-dom';

function Sidebar({ clubData }) {
    return (
        <aside className="global-sidebar">
            <div style={{ textAlign: 'center', marginBottom: 18 }}>
                <img src={clubData?.escudoUrl || 'https://www.teamsoccer.org/teamsoccer-assets/default-escudo.png'} alt="Escudo del club" style={{ width: 80, height: 80, borderRadius: 8, objectFit: 'cover', marginBottom: 8 }} />
                <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#1a2a44' }}>{clubData?.teamName || 'Nombre del club'}</div>
                <div style={{ color: '#495057', fontSize: '1rem', marginTop: 4 }}>{clubData?.division || 'División'}</div>
            </div>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
                <Link to="/jugadores" style={{ color: '#1a2a44', fontWeight: 'bold', textDecoration: 'none' }}>Jugadores</Link>
                <Link to="/partidos" style={{ color: '#1a2a44', fontWeight: 'bold', textDecoration: 'none' }}>Partidos</Link>
                <Link to="/estadio" style={{ color: '#1a2a44', fontWeight: 'bold', textDecoration: 'none' }}>Estadio</Link>
                <Link to="/entrenamientos" style={{ color: '#1a2a44', fontWeight: 'bold', textDecoration: 'none' }}>Entrenamientos</Link>
                <Link to="/pais" style={{ color: '#1a2a44', fontWeight: 'bold', textDecoration: 'none' }}>País</Link>
                <Link to="/liga" style={{ color: '#1a2a44', fontWeight: 'bold', textDecoration: 'none' }}>Liga</Link>
                {/* Puedes añadir más enlaces aquí según crezcan las secciones */}
            </nav>
            <div><b>País:</b> {clubData?.country || 'España'}</div>
            <div><b>Estadio:</b> {clubData?.stadiumName || 'Estadio Nacional'}</div>
        </aside>
    );
}

export default Sidebar;
