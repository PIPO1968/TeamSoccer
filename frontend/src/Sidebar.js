
import React from 'react';
import { Link } from 'react-router-dom';

function Sidebar({ clubData }) {
    return (
        <aside className="global-sidebar">
            {/* Encabezado del sidebar sin escudo ni división */}
            <div style={{ textAlign: 'center', marginBottom: 18 }}>
                <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#1a2a44' }}>{clubData?.teamName || 'Nombre del club'}</div>
            </div>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
                <Link to="/liga" style={{ color: '#1a2a44', fontWeight: 'bold', textDecoration: 'none' }}>Liga</Link>
                <Link to="/jugadores" style={{ color: '#1a2a44', fontWeight: 'bold', textDecoration: 'none' }}>Jugadores</Link>
                <Link to="/partidos" style={{ color: '#1a2a44', fontWeight: 'bold', textDecoration: 'none' }}>Partidos</Link>
                <Link to="/estadio" style={{ color: '#1a2a44', fontWeight: 'bold', textDecoration: 'none' }}>Estadio</Link>
                <Link to="/entrenamientos" style={{ color: '#1a2a44', fontWeight: 'bold', textDecoration: 'none' }}>Entrenamientos</Link>
                <Link to="/pais" style={{ color: '#1a2a44', fontWeight: 'bold', textDecoration: 'none' }}>País</Link>
                {/* Puedes añadir más enlaces aquí según crezcan las secciones */}
            </nav>
            {/* Eliminados duplicados de País y Estadio */}
        </aside>
    );
}

export default Sidebar;
