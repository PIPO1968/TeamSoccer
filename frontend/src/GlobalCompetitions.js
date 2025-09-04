import React, { useEffect, useState } from 'react';
import { useLanguage } from './LanguageContext';

function GlobalCompetitions({ token, user }) {
    const { t } = useLanguage();
    const [competitions, setCompetitions] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [compName, setCompName] = useState('');
    const [compDesc, setCompDesc] = useState('');
    const [roomId, setRoomId] = useState('');
    const [msg, setMsg] = useState('');

    useEffect(() => {
        fetch('/api/competitions')
            .then(res => res.json())
            .then(setCompetitions);
        fetch('/api/rooms')
            .then(res => res.json())
            .then(setRooms);
    }, [msg]);

    const handleCreate = async e => {
        e.preventDefault();
        setMsg('');
        if (!user?.premium) {
            setMsg(t.onlyPremium || 'Solo managers premium pueden crear competiciones.');
            return;
        }
        try {
            const res = await fetch(`/api/competitions/room/${roomId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                body: JSON.stringify({ name: compName, description: compDesc })
            });
            if (!res.ok) throw new Error((await res.json()).error);
            setCompName(''); setCompDesc(''); setRoomId(''); setMsg(t.competitionCreated || 'Competición creada');
        } catch (err) {
            setMsg(err.message);
        }
    };

    return (
        <div>
            <h3>{t.globalCompetitions || 'Competiciones de Salas'}</h3>
            <ul>
                {competitions.length === 0 && <li>{t.noCompetitions || 'No hay competiciones aún.'}</li>}
                {competitions.map(c => (
                    <li key={c._id}>
                        <b>{c.name}</b> - {c.description} <br />
                        {t.room || 'Sala'}: {rooms.find(r => r._id === c.room)?.name || '-'}
                    </li>
                ))}
            </ul>
            {user?.premium && (
                <form onSubmit={handleCreate} style={{ marginTop: 10 }}>
                    <select value={roomId} onChange={e => setRoomId(e.target.value)} required>
                        <option value="">{t.selectRoom || 'Selecciona una sala'}</option>
                        {rooms.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
                    </select>
                    <input value={compName} onChange={e => setCompName(e.target.value)} placeholder={t.competitionName || 'Nombre de la competición'} required />
                    <input value={compDesc} onChange={e => setCompDesc(e.target.value)} placeholder={t.competitionDesc || 'Descripción'} />
                    <button type="submit">{t.createCompetition || 'Crear competición'}</button>
                </form>
            )}
            {!user?.premium && <div style={{ color: 'red' }}>{t.onlyPremium || 'Solo managers premium pueden crear o participar.'}</div>}
            {msg && <div style={{ color: msg.includes('creada') ? 'green' : 'red' }}>{msg}</div>}
        </div>
    );
}

export default GlobalCompetitions;
