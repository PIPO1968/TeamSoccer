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
        <div className="main-content-with-sidebar">
            <main className="club-main club-main-wide">
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
        </div>
    );
}

export default Home;
