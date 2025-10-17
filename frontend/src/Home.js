
import React, { useRef, useState } from 'react';

function Home({ user, clubData, onLogout }) {
    // Simulación de datos
    const [escudo, setEscudo] = useState(clubData?.escudoUrl || 'https://www.teamsoccer.org/teamsoccer-assets/default-escudo.png');
    const fileInputRef = useRef();
    const [followers] = useState(['Hett1337']);
    const [recentVisitors] = useState([
        { name: 'Hett1337', time: 'hace 10 horas' },
        { name: 'PIPO68', time: 'hace 1 minuto' }
    ]);
    const [guestbook] = useState([
        { name: 'Hett1337', message: 'Hello my friend...', time: 'hace 10 horas' }
    ]);
    const [trophies] = useState(['Liga I.1', 'Copa Nacional']);
    const [flags] = useState({ total: 254, conseguidas: 69 });
    const [mapPlaceholder] = useState(true);

    // Subida de escudo
    const handleEscudoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => setEscudo(ev.target.result);
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="main-content-with-sidebar" style={{ display: 'flex', flexDirection: 'row', minHeight: '100vh' }}>
            {/* Escudo en la esquina izquierda, debajo del sidebar horizontal y pegado al sidebar vertical */}
            <div style={{ minWidth: 120, maxWidth: 140, marginTop: 0, marginLeft: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#fff', borderRadius: 12, boxShadow: '0 1px 8px #0001', padding: '18px 12px', position: 'fixed', top: 112, left: 220, zIndex: 950 }}>
                <input type="file" ref={fileInputRef} accept="image/*" onChange={handleEscudoChange} style={{ marginBottom: 8 }} />
                <img src={escudo} alt="Escudo del club" style={{ width: 80, height: 80, borderRadius: 8, objectFit: 'cover', boxShadow: '0 1px 8px #0002' }} />
            </div>
            {/* Bloque principal centrado */}
            <main className="club-main club-main-wide" style={{ flex: 1, marginLeft: 180, paddingTop: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={{ textAlign: 'center' }}>
                    <h2 style={{ fontWeight: 'bold', fontSize: '2rem', color: '#1a2a44', marginBottom: 8 }}>{clubData?.teamName || 'Spain Soccer Club-id100'}</h2>
                    <div style={{ fontSize: '1.1rem', color: '#495057', marginBottom: 8 }}>Club Details:</div>
                    <div style={{ fontSize: '1rem', color: '#495057', marginBottom: 4 }}>
                        Competes in {clubData?.country || 'Spain'} - division: <a href="/liga" style={{ color: '#1a2a44', textDecoration: 'underline', fontWeight: 'bold' }}>{clubData?.division || 'I.1'}</a>
                    </div>
                    <div style={{ fontSize: '1rem', color: '#495057', marginBottom: 4 }}>Managed by: <b>{user?.username || 'PIPO68'}</b></div>
                    <div style={{ fontSize: '1rem', color: '#495057', marginBottom: 4 }}>Stadium: {clubData?.stadiumName || 'Spain Soccer Club Stadium'} (capacity {clubData?.stadiumCapacity || '15,000'})</div>
                    <div style={{ fontSize: '1rem', color: '#495057', marginBottom: 4 }}>National ranking ({clubData?.nationalRanking || 2})</div>
                    <div style={{ fontSize: '1rem', color: '#495057', marginBottom: 4 }}>World ranking ({clubData?.worldRanking || 187})</div>
                    <div style={{ display: 'flex', gap: 12, marginTop: 12, justifyContent: 'center' }}>
                        <button style={{ background: '#1a2a44', color: '#fff', borderRadius: 8, padding: '8px 18px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Challenge to Friendly Match</button>
                        <button style={{ background: '#eaeaea', color: '#1a2a44', borderRadius: 8, padding: '8px 18px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Send Message</button>
                    </div>
                </div>
                <section style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 8px #0001', padding: 18 }}>
                    <h3 style={{ color: '#1a2a44', marginBottom: 8 }}>Awards: Team trophies</h3>
                    <ul style={{ display: 'flex', gap: 18, listStyle: 'none', padding: 0 }}>
                        {trophies.map((t, i) => (
                            <li key={i} style={{ background: '#eaeaea', borderRadius: 8, padding: '8px 16px', fontWeight: 'bold', color: '#1a2a44' }}>{t}</li>
                        ))}
                    </ul>
                </section>
                <section style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 8px #0001', padding: 18 }}>
                    <h3 style={{ color: '#1a2a44', marginBottom: 8 }}>WESTBOOCK:</h3>
                    {guestbook.length === 0 ? (
                        <div style={{ color: '#888', marginBottom: 8 }}>You cannot leave messages on your own team's guestbook.</div>
                    ) : (
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {guestbook.map((msg, i) => (
                                <li key={i} style={{ marginBottom: 6 }}>
                                    <b>{msg.name}</b>: {msg.message} <span style={{ color: '#888' }}>{msg.time}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
                <section style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 8px #0001', padding: 18 }}>
                    <h3 style={{ color: '#1a2a44', marginBottom: 8 }}>Team Followers</h3>
                    <div style={{ color: '#495057', marginBottom: 8 }}>This team has {followers.length} follower{followers.length !== 1 ? 's' : ''}:</div>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {followers.map((f, i) => (
                            <li key={i} style={{ fontWeight: 'bold', color: '#1a2a44' }}>{f}</li>
                        ))}
                    </ul>
                </section>
                <section style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 8px #0001', padding: 18 }}>
                    <h3 style={{ color: '#1a2a44', marginBottom: 8 }}>Recent Visitors</h3>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {recentVisitors.map((v, i) => (
                            <li key={i} style={{ color: '#495057', marginBottom: 6 }}><b>{v.name}</b> <span style={{ color: '#888' }}>{v.time}</span></li>
                        ))}
                    </ul>
                </section>
                <section style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 8px #0001', padding: 18 }}>
                    <h3 style={{ color: '#1a2a44', marginBottom: 8 }}>FLAG COLLECTION</h3>
                    <div style={{ color: '#495057', marginBottom: 8 }}>{flags.conseguidas} ({flags.total}): total de banderas + banderas conseguidas</div>
                    <div style={{ width: '100%', height: 180, background: '#eaeaea', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontWeight: 'bold', fontSize: '1.2rem' }}>
                        {/* Placeholder de mapa mundial iluminado */}
                        {mapPlaceholder ? 'Mapa mundial (aquí se iluminarán los países conseguidos)' : null}
                    </div>
                </section>
            </main>
        </div>
    );
}

export default Home;
