import React from 'react';

function Header() {
    return (
        <header style={{ position: 'fixed', top: 0, left: 0, width: '100%', background: '#eaeaea', height: 64, zIndex: 1000, display: 'flex', alignItems: 'center', boxShadow: '0 2px 8px #0002' }}>
            <img src="https://www.teamsoccer.org/teamsoccer-assets/cbc230b4-3215-4a9f-9673-4064a3ad90c4.png" alt="Logo TeamSoccer" style={{ height: 48, marginLeft: 24 }} />
            <h1 style={{ marginLeft: 24, color: '#1a2a44', fontWeight: 'bold', fontSize: '1.5rem' }}>Team Soccer Manager</h1>
        </header>
    );
}

export default Header;
