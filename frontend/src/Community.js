import React, { useEffect, useState } from 'react';
import { useLanguage } from './LanguageContext';

function Community({ token, user }) {
    const { t } = useLanguage();
    const [view, setView] = useState('salas');

    return (
        <div>
            <h2>{t.community || 'Comunidad'}</h2>
            <nav style={{ marginBottom: 20 }}>
                <button onClick={() => setView('salas')}>{t.rooms || 'Salas'}</button>
                {/* Aquí puedes añadir más sub-secciones: foros generales, rankings, etc. */}
            </nav>
            {view === 'salas' && <CommunityRooms token={token} user={user} />}
        </div>
    );
}

function CommunityRooms({ token, user }) {
    const { t } = useLanguage();
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [msg, setMsg] = useState('');
    const [input, setInput] = useState('');

    useEffect(() => {
        fetch('http://localhost:5000/api/rooms')
            .then(res => res.json())
            .then(data => setRooms(data));
    }, []);

    useEffect(() => {
        if (!selectedRoom) return;
        fetch(`http://localhost:5000/api/rooms/${selectedRoom._id}/messages`)
            .then(res => res.json())
            .then(data => setMessages(data.messages || []));
    }, [selectedRoom, msg]);

    const handleSend = async e => {
        e.preventDefault();
        if (!input.trim()) return;
        const res = await fetch(`http://localhost:5000/api/rooms/${selectedRoom._id}/messages`, {
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
                        <button onClick={() => setSelectedRoom(room)}>{room.name}</button>
                    </li>
                ))}
            </ul>
            {selectedRoom && (
                <div style={{ border: '1px solid #ccc', padding: 10, marginTop: 10 }}>
                    <h4>{selectedRoom.name}</h4>
                    <div style={{ maxHeight: 200, overflowY: 'auto', background: '#f9f9f9', padding: 5 }}>
                        {messages.map((m, i) => (
                            <div key={i}><b>{m.user?.username || (t.anonymous || 'Anónimo')}:</b> {m.text}</div>
                        ))}
                    </div>
                    <form onSubmit={handleSend} style={{ marginTop: 10 }}>
                        <input value={input} onChange={e => setInput(e.target.value)} placeholder={t.writeMessage || 'Escribe un mensaje...'} />
                        <button type="submit">{t.send || 'Enviar'}</button>
                    </form>
                </div>
            )}
        </div>
    );
}

export default Community;
