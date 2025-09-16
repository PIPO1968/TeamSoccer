import React, { useEffect, useState } from 'react';
import { useLanguage } from './LanguageContext';

import Forum from './Forum';
import GlobalCompetitions from './GlobalCompetitions';

function Community({ token, user }) {
    const { t } = useLanguage();
    const [view, setView] = useState('foro');

    return (
        <div>
            <h2>{t.community || 'Comunidad'}</h2>
            <nav style={{ marginBottom: 20 }}>
                <button onClick={() => setView('foro')}>{t.forum || 'Foro'}</button>
                <button onClick={() => setView('salas')}>{t.rooms || 'Salas'}</button>
                <button onClick={() => setView('competiciones')}>{t.globalCompetitions || 'Competiciones de Salas'}</button>
            </nav>
            {view === 'foro' && <Forum token={token} user={user} />}
            {view === 'salas' && <CommunityRooms token={token} user={user} />}
            {view === 'competiciones' && <GlobalCompetitions token={token} user={user} />}
        </div>
    );
}
// ...existing code...

function CommunityRooms({ token, user }) {
    const { t } = useLanguage();
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [msg, setMsg] = useState('');
    const [input, setInput] = useState('');
    const [roomTab, setRoomTab] = useState('mensajes');
    const [competitions, setCompetitions] = useState([]);
    const [compName, setCompName] = useState('');
    const [compDesc, setCompDesc] = useState('');
    const [compMsg, setCompMsg] = useState('');
    const [statistics, setStatistics] = useState(null);

    useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/rooms`)
            .then(res => res.json())
            .then(data => setRooms(data));
    }, []);

    useEffect(() => {
        if (!selectedRoom) return;
    fetch(`${process.env.REACT_APP_API_URL}/api/rooms/${selectedRoom._id}/messages`)
            .then(res => res.json())
            .then(data => setMessages(data.messages || []));
        fetch(`/api/competitions/room/${selectedRoom._id}`)
            .then(res => res.json())
            .then(data => setCompetitions(data));
        fetch(`/api/room-statistics/${selectedRoom._id}/statistics`)
            .then(res => res.json())
            .then(data => setStatistics(data));
    }, [selectedRoom, msg, compMsg]);

    const handleSend = async e => {
        e.preventDefault();
        if (!input.trim()) return;
    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/rooms/${selectedRoom._id}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({ text: input })
        });
        const data = await res.json();
        if (res.ok) {
            setMsg('Mensaje enviado');
            setInput('');
        }
    };

    return (
        <div>
            <h3>{t.communityRooms || 'Salas de la comunidad'}</h3>
            <ul>
                {rooms.map(room => (
                    <li key={room._id}>
                        <button onClick={() => { setSelectedRoom(room); setRoomTab('mensajes'); }}>{room.name}</button>
                    </li>
                ))}
            </ul>
            {selectedRoom && (
                <div style={{ border: '1px solid #ccc', padding: 10, marginTop: 10 }}>
                    <h4>{selectedRoom.name}</h4>
                    <nav style={{ marginBottom: 10 }}>
                        <button onClick={() => setRoomTab('mensajes')}>{t.messages || 'Mensajes'}</button>
                        <button onClick={() => setRoomTab('competiciones')}>{t.competitions || 'Competiciones'}</button>
                        <button onClick={() => setRoomTab('estadisticas')}>{t.statistics || 'Estadísticas'}</button>
                    </nav>
                    {roomTab === 'mensajes' && (
                        <>
                            <div style={{ maxHeight: 200, overflowY: 'auto', background: '#f9f9f9', padding: 5 }}>
                                {messages.map((m, i) => (
                                    <div key={i}><b>{m.user?.username || (t.anonymous || 'Anónimo')}:</b> {m.text}</div>
                                ))}
                            </div>
                            <form onSubmit={handleSend} style={{ marginTop: 10 }}>
                                <input value={input} onChange={e => setInput(e.target.value)} placeholder={t.writeMessage || 'Escribe un mensaje...'} />
                                <button type="submit">{t.send || 'Enviar'}</button>
                            </form>
                        </>
                    )}
                    {roomTab === 'competiciones' && (
                        <div>
                            <h5>{t.competitions || 'Competiciones'}</h5>
                            <ul>
                                {competitions.length === 0 && <li>{t.noCompetitions || 'No hay competiciones aún.'}</li>}
                                {competitions.map(c => (
                                    <li key={c._id}><b>{c.name}</b> - {c.description}</li>
                                ))}
                            </ul>
                            <form onSubmit={async e => {
                                e.preventDefault();
                                setCompMsg('');
                                try {
                                    const res = await fetch(`/api/competitions/room/${selectedRoom._id}`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                                        body: JSON.stringify({ name: compName, description: compDesc })
                                    });
                                    if (!res.ok) throw new Error((await res.json()).error);
                                    setCompName(''); setCompDesc(''); setCompMsg(t.competitionCreated || 'Competición creada');
                                } catch (err) {
                                    setCompMsg(err.message);
                                }
                            }} style={{ marginTop: 10 }}>
                                <input value={compName} onChange={e => setCompName(e.target.value)} placeholder={t.competitionName || 'Nombre de la competición'} required />
                                <input value={compDesc} onChange={e => setCompDesc(e.target.value)} placeholder={t.competitionDesc || 'Descripción'} />
                                <button type="submit">{t.createCompetition || 'Crear competición'}</button>
                            </form>
                            {compMsg && <div style={{ color: 'green' }}>{compMsg}</div>}
                        </div>
                    )}
                    {roomTab === 'estadisticas' && (
                        <div>
                            <h5>{t.statistics || 'Estadísticas'}</h5>
                            {statistics ? (
                                <ul>
                                    <li>{t.totalMessages || 'Mensajes'}: {statistics.totalMessages}</li>
                                    <li>{t.totalMembers || 'Miembros'}: {statistics.totalMembers}</li>
                                    <li>{t.points || 'Puntos'}: {statistics.points}</li>
                                    <li>{t.leaders || 'Líderes'}: {statistics.leaders}</li>
                                    <li>{t.createdAt || 'Creada'}: {new Date(statistics.createdAt).toLocaleString()}</li>
                                    <li>{t.isPremium || 'Premium'}: {statistics.isPremium ? t.yes || 'Sí' : t.no || 'No'}</li>
                                </ul>
                            ) : (
                                <div>{t.noStatistics || 'No hay estadísticas aún.'}</div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default Community;
