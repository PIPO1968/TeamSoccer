import React from 'react';

function Header() {
    return (
        <header style={{ position: 'fixed', top: 0, left: 0, width: '100%', background: '#eaeaea', height: 64, zIndex: 1000, display: 'flex', alignItems: 'center', boxShadow: '0 2px 8px #0002' }}>
            <img src="/logoTS.png" alt="Logo TeamSoccer" style={{ height: 32, marginLeft: 8, marginRight: 8 }} />
            <h1 style={{ marginLeft: 0, color: '#1a2a44', fontWeight: 'bold', fontSize: '1.5rem' }}>Team Soccer Manager</h1>
        </header>
    );
}

export default Header;
