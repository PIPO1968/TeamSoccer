import React from 'react';
import ClubInfoBlock from './ClubInfoBlock';

function Home({ user, clubData, onLogout }) {
    // Datos simulados para el diseño visual
    const liga = 'Primera División';
    const division = 'División de Honor';
    const rankingNacional = 1234;
    const rankingMundial = 5678;
    const ultimasVisitas = [
        { name: 'manager1', link: '/manager/1' },
        { name: 'manager2', link: '/manager/2' },
        { name: 'manager3', link: '/manager/3' },
        { name: 'manager4', link: '/manager/4' },
        { name: 'manager5', link: '/manager/5' }
    ];
    const retadores = [
        { name: 'Equipo A', link: '/club/a' },
        { name: 'Equipo B', link: '/club/b' }
    ];
    const visitasLibro = [
        { name: 'manager1', link: '/manager/1', mensaje: '¡Buen partido!' },
        { name: 'manager2', link: '/manager/2', mensaje: 'Suerte en la liga.' }
    ];
    const jugadoresLink = '/jugadores';
    const paisLink = '/pais';
    const divisionLink = '/liga';
    const estadioLink = '/estadio';
    const partidosLink = '/partidos';
    const entrenamientosLink = '/entrenamientos';

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f7faff' }}>
            {/* Sidebar izquierdo fijo */}
            <aside style={{ flex: '1 1 20%', maxWidth: 320, background: '#fff', boxShadow: '2px 0 8px #0001', padding: 32, display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div style={{ textAlign: 'center', marginBottom: 18 }}>
                    <img src={clubData?.escudoUrl || 'https://www.teamsoccer.org/teamsoccer-assets/default-escudo.png'} alt="Escudo del club" style={{ width: 80, height: 80, borderRadius: 8, objectFit: 'cover', marginBottom: 8 }} />
                    <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#1a2a44' }}>{clubData?.teamName || 'Nombre del club'}</div>
                </div>
                <div><b>País:</b> <a href={paisLink} style={{ color: '#1a2a44', textDecoration: 'underline' }}>{clubData?.country || 'España'} <img src="https://flagcdn.com/es.svg" alt="Bandera" style={{ width: 24, verticalAlign: 'middle', marginLeft: 4 }} /></a></div>
                <div><b>Jugadores:</b> <a href={jugadoresLink} style={{ color: '#1a2a44', textDecoration: 'underline' }}>Ver plantilla</a></div>
                <div><b>División:</b> <a href={divisionLink} style={{ color: '#1a2a44', textDecoration: 'underline' }}>{division}</a></div>
                <div><b>Estadio:</b> <a href={estadioLink} style={{ color: '#1a2a44', textDecoration: 'underline' }}>{clubData?.stadiumName || 'Estadio Nacional'}</a></div>
                <div><b>Partidos:</b> <a href={partidosLink} style={{ color: '#1a2a44', textDecoration: 'underline' }}>Ver partidos</a></div>
                <div><b>Entrenamientos:</b> <a href={entrenamientosLink} style={{ color: '#1a2a44', textDecoration: 'underline' }}>Ver entrenamientos</a></div>
            </aside>
            {/* Bloque central */}
            <main style={{ flex: '3 1 60%', padding: '32px 24px', background: '#eaeaea', display: 'flex', flexDirection: 'column', gap: 24 }}>
                <h2 style={{ fontWeight: 'bold', fontSize: '2rem', color: '#1a2a44', marginBottom: 8 }}>{clubData?.teamName || 'Nombre del club'}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                    <input type="file" style={{ marginRight: 12 }} />
                    <img src={clubData?.escudoUrl || 'https://www.teamsoccer.org/teamsoccer-assets/default-escudo.png'} alt="Escudo generado" style={{ width: 64, height: 64, borderRadius: 8, objectFit: 'cover' }} />
                </div>
                <div style={{ display: 'flex', gap: 32, marginTop: 12 }}>
                    <div><b>Ranking nacional:</b> {rankingNacional}</div>
                    <div><b>Ranking mundial:</b> {rankingMundial}</div>
                </div>
                {/* Libro de visitas */}
                <section style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 8px #0001', padding: 18, marginTop: 24 }}>
                    <h3 style={{ color: '#1a2a44', marginBottom: 8 }}>Libro de visitas</h3>
                    <textarea rows={2} style={{ width: '100%', marginBottom: 12 }} placeholder="Escribe un mensaje..." />
                    <div style={{ marginBottom: 8, color: '#888' }}>Visitas totales: {visitasLibro.length}</div>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {visitasLibro.map((v, i) => (
                            <li key={i} style={{ marginBottom: 6 }}>
                                <a href={v.link} style={{ color: '#1a2a44', fontWeight: 'bold', textDecoration: 'underline' }}>{v.name}</a>: {v.mensaje}
                            </li>
                        ))}
                    </ul>
                </section>
            </main>
            {/* Bloque derecho */}
            <aside style={{ flex: '1 1 20%', maxWidth: 320, background: '#fff', boxShadow: '-2px 0 8px #0001', padding: 32, display: 'flex', flexDirection: 'column', gap: 18 }}>
                <button style={{ background: '#1a2a44', color: '#fff', fontWeight: 'bold', borderRadius: 8, padding: '12px 0', marginBottom: 18 }}>Retar a amistoso</button>
                <div>
                    <b>Retadores:</b>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {retadores.map((r, i) => (
                            <li key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                <a href={r.link} style={{ color: '#1a2a44', textDecoration: 'underline', fontWeight: 'bold' }}>{r.name}</a>
                                <span>
                                    <button style={{ background: '#4caf50', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px', marginRight: 4 }}>Aceptar</button>
                                    <button style={{ background: '#c00', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px' }}>Denegar</button>
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <b>Últimas visitas:</b>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {ultimasVisitas.map((v, i) => (
                            <li key={i} style={{ marginBottom: 6 }}>
                                <a href={v.link} style={{ color: '#1a2a44', textDecoration: 'underline', fontWeight: 'bold' }}>{v.name}</a>
                            </li>
                        ))}
                    </ul>
                </div>
                <button onClick={onLogout} style={{ background: '#c00', color: '#fff', padding: '8px 16px', borderRadius: 6, border: 'none', fontWeight: 'bold', cursor: 'pointer', marginTop: 24 }}>Cerrar sesión</button>
            </aside>
        </div>
    );
}

export default Home;
