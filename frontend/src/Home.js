import React from 'react';

function Home({ user, clubData, onLogout }) {
    // Simulación de datos extra
    const escudoUrl = '';
    const liga = 'Primera División';
    const rankingNacional = 12;
    const rankingMundial = 134;
    const trofeos = ['Liga 2023', 'Copa 2024'];
    const seguidores = 321;
    const ultimasVisitas = ['manager1', 'manager2', 'manager3'];

    return (
        <div style={{ display: 'flex', gap: 32, padding: 32 }}>
            {/* Columna principal */}
            <div style={{ flex: 2 }}>
                <h2>Bienvenido, {user.username} (ID: {user._id})</h2>
                <div>Nombre del club: {clubData?.teamName} (ID: {user.clubId})</div>
                <div>Nombre del estadio: {clubData?.stadiumName} (ID: {user.stadiumId})</div>
                <div>País: {clubData?.country}</div>
                <div>Ciudad: {clubData?.city}</div>
                <div>Escudo: <input type="file" /></div>
                <div>Liga: {liga}</div>
                <div>Ranking nacional: {rankingNacional}</div>
                <div>Ranking mundial: {rankingMundial}</div>
                <button style={{ marginTop: 16 }}>Retar a partido amistoso</button>
                <button style={{ marginLeft: 8 }}>Enviar mensaje</button>
                <div style={{ marginTop: 24 }}>
                    <h3>Libro de visitas</h3>
                    <textarea rows={3} style={{ width: '100%' }} placeholder="Escribe un mensaje..." />
                </div>
            </div>
            {/* Columna derecha: trofeos y stats */}
            <div style={{ flex: 1 }}>
                <button onClick={onLogout} style={{ float: 'right', background: '#c00', color: '#fff', padding: '8px 16px', borderRadius: 6, border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Cerrar sesión</button>
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
        </div>
    );
}

export default Home;
