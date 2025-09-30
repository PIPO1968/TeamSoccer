import React from 'react';
import ClubInfoBlock from './ClubInfoBlock';

function Home({ user, clubData, onLogout }) {
    // Simulación de datos extra
    const liga = 'Primera División';
    const rankingNacional = 12;
    const rankingMundial = 134;
    const trofeos = ['Liga 2023', 'Copa 2024'];
    const seguidores = 321;
    const ultimasVisitas = ['manager1', 'manager2', 'manager3'];

    return (
        <div style={{ display: 'flex', gap: 32, padding: 32, marginTop: 16 }}>
            {/* Columna izquierda: bloque de datos del club */}
            <div style={{ flex: '0 0 320px', minWidth: 320 }}>
                <ClubInfoBlock clubData={clubData} liga={liga} rankingNacional={rankingNacional} rankingMundial={rankingMundial} />
            </div>
            {/* Columna principal */}
            <div style={{ flex: 2 }}>
                <h2>Bienvenido, {user.username} (ID: {user._id})</h2>
                <button style={{ marginTop: 16 }}>Retar a partido amistoso</button>
                <button style={{ marginLeft: 8 }}>Enviar mensaje</button>
                <div style={{ marginTop: 24 }}>
                    <h3>Libro de visitas</h3>
                    <textarea rows={3} style={{ width: '100%' }} placeholder="Escribe un mensaje..." />
                </div>
                <div style={{ marginTop: 40 }}>
                    <h3>Trofeos</h3>
                    <ul>
                        {trofeos.map((t, i) => <li key={i}>{t}</li>)}
                    </ul>
                </div>
                <div style={{ marginTop: 24 }}>
                    <h3>Estadísticas del club y manager</h3>
                    <div>Seguidores: {seguidores}</div>
                    <div>Últimas visitas:</div>
                    <ul>
                        {ultimasVisitas.map((v, i) => <li key={i}>{v}</li>)}
                    </ul>
                </div>
            </div>
            {/* Columna derecha: botón logout */}
            <div style={{ flex: '0 0 120px', minWidth: 120, textAlign: 'right' }}>
                <button onClick={onLogout} style={{ background: '#c00', color: '#fff', padding: '8px 16px', borderRadius: 6, border: 'none', fontWeight: 'bold', cursor: 'pointer', marginTop: 16 }}>Cerrar sesión</button>
            </div>
        </div>
    );
}

export default Home;
