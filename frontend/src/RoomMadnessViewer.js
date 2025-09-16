import React, { useEffect, useState } from 'react';
import { useLanguage } from './LanguageContext';

function RoomMadnessViewer() {
    const { t } = useLanguage();
    const [status, setStatus] = useState(null);
    const [matches, setMatches] = useState([]);
    const [selectedRound, setSelectedRound] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch(`${process.env.REACT_APP_API_URL}/api/room-premium/room-madness/status`)
            .then(res => res.json())
            .then(data => setStatus(data));
    }, []);

    useEffect(() => {
        if (!selectedRound) return;
        setLoading(true);
        fetch(`${process.env.REACT_APP_API_URL}/api/room-premium/room-madness/matches/${selectedRound}`)
            .then(res => res.json())
            .then(data => {
                setMatches(data.matches || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [selectedRound]);

    if (!status) return <div>{t.loadingRoomMadness || 'Cargando Room Madness...'}</div>;
    if (status.error) return <div style={{ color: 'red' }}>{status.error}</div>;

    return (
        <div style={{ marginTop: 20 }}>
            <h2>{t.roomMadness || 'Room Madness'}</h2>
            <div>
                <b>{t.season || 'Temporada'}:</b> {status.season} <br />
                <b>{t.currentRound || 'Ronda actual'}:</b> {status.currentRound} <br />
                <b>{t.participants || 'Participantes'}:</b> {status.rooms.map(r => r.name).join(', ')}
            </div>
            <div style={{ marginTop: 16 }}>
                <label>{t.viewRound || 'Ver ronda'}: </label>
                <input type="number" min={1} value={selectedRound} onChange={e => setSelectedRound(Number(e.target.value))} style={{ width: 50 }} />
            </div>
            {loading ? <div>{t.loadingMatches || 'Cargando partidos...'}</div> : (
                <table style={{ marginTop: 10, borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={{ border: '1px solid #ccc', padding: 4 }}>{t.homeRoom || 'Sala Local'}</th>
                            <th style={{ border: '1px solid #ccc', padding: 4 }}>{t.awayRoom || 'Sala Visitante'}</th>
                            <th style={{ border: '1px solid #ccc', padding: 4 }}>{t.homeGoals || 'Goles Local'}</th>
                            <th style={{ border: '1px solid #ccc', padding: 4 }}>{t.awayGoals || 'Goles Visitante'}</th>
                            <th style={{ border: '1px solid #ccc', padding: 4 }}>{t.winner || 'Ganador'}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {matches.map((m, i) => (
                            <tr key={i}>
                                <td style={{ border: '1px solid #ccc', padding: 4 }}>{m.homeRoom}</td>
                                <td style={{ border: '1px solid #ccc', padding: 4 }}>{m.awayRoom}</td>
                                <td style={{ border: '1px solid #ccc', padding: 4 }}>{m.homeGoals !== null ? m.homeGoals : '-'}</td>
                                <td style={{ border: '1px solid #ccc', padding: 4 }}>{m.awayGoals !== null ? m.awayGoals : '-'}</td>
                                <td style={{ border: '1px solid #ccc', padding: 4 }}>{m.winner ? m.winner : '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            {status.winner && (
                <div style={{ marginTop: 20, color: 'green' }}>
                    <b>{t.roomMadnessWinner || '¡Ganador de la Room Madness'}:</b> {status.winner.name} <b>!</b>
                </div>
            )}
        </div>
    );
}

export default RoomMadnessViewer;
