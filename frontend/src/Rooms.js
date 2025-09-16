import React, { useEffect, useState } from 'react';
import { useLanguage } from './LanguageContext';

function Rooms({ token, user }) {
    const { t } = useLanguage();
    const [rooms, setRooms] = useState([]);
    const [name, setName] = useState('');
    const [type, setType] = useState('amistoso');
    const [msg, setMsg] = useState('');
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [trophyCabinet, setTrophyCabinet] = useState(null);
    const [loadingTrophy, setLoadingTrophy] = useState(false);

    useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/rooms`)
            .then(res => res.json())
            .then(data => setRooms(data));
    }, [msg]);

    const handleCreate = async e => {
        e.preventDefault();
        setMsg('');
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/rooms`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({ name, type })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Error al crear sala');
            setMsg('Sala creada');
            setName('');
            setType('amistoso');
        } catch (err) {
            setMsg(err.message);
        }
    };

    // Visualizar vitrina de una sala
    const handleShowTrophyCabinet = async (roomId) => {
        setSelectedRoom(roomId);
        setTrophyCabinet(null);
        setLoadingTrophy(true);
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/room-premium/${roomId}/trophy-cabinet`);
            const data = await res.json();
            setTrophyCabinet(data);
        } catch (err) {
            setTrophyCabinet({ error: 'No se pudo cargar la vitrina.' });
        }
        setLoadingTrophy(false);
    };

    return (
        <div>
            <h2>{t.rooms || 'Salas (Rooms)'}</h2>
            {user?.premium && (
                <form onSubmit={handleCreate} style={{ marginBottom: 20 }}>
                    <input value={name} onChange={e => setName(e.target.value)} placeholder={t.roomName || 'Nombre de la sala'} required />
                    <select value={type} onChange={e => setType(e.target.value)}>
                        <option value="amistoso">{t.friendly || 'Amistoso'}</option>
                        <option value="torneo">{t.tournament || 'Torneo'}</option>
                    </select>
                    <button type="submit">{t.createRoom || 'Crear sala'}</button>
                </form>
            )}
            {!user?.premium && <div style={{ color: 'gray' }}>{t.onlyPremiumCreateRoom || 'Solo los usuarios premium pueden crear salas.'}</div>}
            {msg && <div style={{ color: msg === (t.roomCreated || 'Sala creada') ? 'green' : 'red' }}>{msg}</div>}
            <h3>{t.existingRooms || 'Salas existentes'}</h3>
            <ul>
                {rooms.map(room => (
                    <li key={room._id}>
                        <b>{room.name}</b> ({room.type}) - {t.creator || 'Creador'}: {room.owner?.username || 'N/A'}
                        <button style={{ marginLeft: 10 }} onClick={() => handleShowTrophyCabinet(room._id)}>{t.viewTrophyCabinet || 'Ver vitrina'}</button>
                    </li>
                ))}
            </ul>
            {selectedRoom && (
                <div style={{ marginTop: 20, border: '1px solid #ccc', padding: 16, borderRadius: 8, background: '#f9f9f9' }}>
                    <h4>{t.trophyCabinet || 'Vitrina de la sala'}</h4>
                    {loadingTrophy ? (
                        <div>{t.loadingTrophy || 'Cargando vitrina...'}</div>
                    ) : trophyCabinet && !trophyCabinet.error ? (
                        <>
                            <div><b>{t.roomLogo || 'Logo de la sala'}:</b><br />{trophyCabinet.logo ? <img src={trophyCabinet.logo} alt="logo" style={{ height: 60 }} /> : t.noLogo || 'Sin logo'}</div>
                            <div style={{ marginTop: 10 }}><b>{t.logosWon || 'Logos conseguidos'}:</b><br />
                                {trophyCabinet.logosWon && trophyCabinet.logosWon.length > 0 ? (
                                    trophyCabinet.logosWon.map((logo, i) => (
                                        <img key={i} src={logo} alt="logo rival" style={{ height: 40, marginRight: 8 }} />
                                    ))
                                ) : t.none || 'Ninguno'}
                            </div>
                            <div style={{ marginTop: 10 }}><b>{t.vipLogos || 'Logos VIP Room Madness'}:</b> {trophyCabinet.vipLogos || 0}</div>
                        </>
                    ) : (
                        <div style={{ color: 'red' }}>{trophyCabinet?.error || t.errorLoadingTrophy || 'Error al cargar vitrina.'}</div>
                    )}
                </div>
            )}
        </div>
    );
}

export default Rooms;
