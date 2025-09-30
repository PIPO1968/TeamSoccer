import React from 'react';

function TopNavBar() {
    return (
        <nav style={{ position: 'fixed', top: 64, left: 0, width: '100%', background: '#1a2a44', height: 48, zIndex: 999, display: 'flex', alignItems: 'center', boxShadow: '0 1px 6px #0002' }}>
            <ul style={{ display: 'flex', listStyle: 'none', margin: 0, padding: '0 24px', gap: 32 }}>
                <li><a href="/home" style={navStyle}>Inicio</a></li>
                <li><a href="/teams" style={navStyle}>Club</a></li>
                <li><a href="/matches" style={navStyle}>Partidos</a></li>
                <li><a href="/friendlies" style={navStyle}>Amistosos</a></li>
                <li><a href="/store" style={navStyle}>Tienda</a></li>
                <li><a href="/rooms" style={navStyle}>Salas</a></li>
                <li><a href="/community" style={navStyle}>Comunidad</a></li>
                <li><a href="/national" style={navStyle}>Selección</a></li>
                <li><a href="/viewer" style={navStyle}>MultiViewer</a></li>
            </ul>
        </nav>
    );
}

const navStyle = {
    color: '#fff',
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: '1rem',
    padding: '8px 0',
    transition: 'color 0.2s',
};

export default TopNavBar;
