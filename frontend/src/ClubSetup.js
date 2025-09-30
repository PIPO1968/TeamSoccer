import React, { useState } from 'react';

function ClubSetup({ onSetup, onLogout }) {
    const [teamName, setTeamName] = useState('');
    const [stadiumName, setStadiumName] = useState('');
    const [city, setCity] = useState('');
    const [country, setCountry] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = e => {
        e.preventDefault();
        if (!teamName || !stadiumName || !country) {
            setError('Completa todos los campos obligatorios');
            return;
        }
        onSetup({ teamName, stadiumName, city, country });
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: 32 }}>
            <form onSubmit={handleSubmit} style={{ flex: 1, maxWidth: 400 }}>
                <h2>Configuración de tu club</h2>
                <label>Nombre del equipo*</label>
                <input value={teamName} onChange={e => setTeamName(e.target.value)} required />
                <label>Nombre del estadio*</label>
                <input value={stadiumName} onChange={e => setStadiumName(e.target.value)} required />
                <label>Ciudad</label>
                <input value={city} onChange={e => setCity(e.target.value)} />
                <label>País*</label>
                <input value={country} onChange={e => setCountry(e.target.value)} required />
                <button type="submit" style={{ marginTop: 16 }}>Enviar</button>
                {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
            </form>
            <div style={{ minWidth: 120, textAlign: 'right' }}>
                <button onClick={onLogout} style={{ background: '#c00', color: '#fff', padding: '8px 16px', borderRadius: 6, border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Cerrar sesión</button>
            </div>
        </div>
    );
}

export default ClubSetup;
