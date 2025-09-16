import React, { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';

function Teams({ token, onTeamsUpdate, user }) {
    const { t } = useLanguage();
    const [teams, setTeams] = useState([]);
    const [trophies, setTrophies] = useState({}); // { teamId: [trofeos] }
    const [form, setForm] = useState({ name: '', players: '' });
    const [detailedStats, setDetailedStats] = useState(null);
    const [statsError, setStatsError] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/teams`)
            .then(res => res.json())
            .then(async data => {
                setTeams(data);
                if (onTeamsUpdate) onTeamsUpdate(data);
                // Cargar trofeos de cada equipo
                const trophiesObj = {};
                for (const team of data) {
                    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/teams/${team._id}/trophies`);
                    const trof = await res.json();
                    trophiesObj[team._id] = trof.trophies || [];
                }
                setTrophies(trophiesObj);
            });
    }, [success, onTeamsUpdate]);

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setError(''); setSuccess('');
        try {
            const playersArr = form.players.split(',').map(p => ({ name: p.trim(), position: '', rating: 50 }));
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/teams`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({ name: form.name, players: playersArr })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Error al crear equipo');
            setSuccess('Equipo creado');
            setForm({ name: '', players: '' });
        } catch (err) {
            setError(err.message);
        }
    };

    const handleShowStats = async (teamId) => {
        setStatsError('');
        setDetailedStats(null);
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/premium/team/${teamId}/detailed-stats`, {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Error al obtener estadísticas');
            setDetailedStats({ teamId, ...data.stats });
        } catch (err) {
            setStatsError(err.message);
        }
    }

    // Utilidad para mostrar emoji de trofeo
    function getTrophyEmoji(type) {
        if (type === 'oro') return '🥇';
        if (type === 'plata') return '🥈';
        if (type === 'bronce') return '🥉';
        return '🏆';
    }

    // Componente para cambiar la hora personalizada de partido
    function MatchTimeSetter({ team, token }) {
        const [value, setValue] = useState(team.preferredMatchTime || '');
        const [msg, setMsg] = useState('');
        const [loading, setLoading] = useState(false);
        const handleSave = async () => {
            setMsg('');
            setLoading(true);
            try {
                const res = await fetch(`${process.env.REACT_APP_API_URL}/api/teams/${team._id}/match-time`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                    body: JSON.stringify({ preferredMatchTime: value })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || (t.errorSaving || 'Error al guardar'));
                setMsg(t.timeSaved || 'Hora guardada');
            } catch (err) {
                setMsg(err.message);
            }
            setLoading(false);
        };
        return (
            <div style={{ margin: '8px 0' }}>
                <label>{t.customMatchTime || 'Hora personalizada de partido'}: </label>
                <input type="time" value={value} onChange={e => setValue(e.target.value)} />
                <button onClick={handleSave} disabled={loading}>{t.save || 'Guardar'}</button>
                {msg && <span style={{ marginLeft: 8, color: msg === (t.timeSaved || 'Hora guardada') ? 'green' : 'red' }}>{msg}</span>}
                {/* Fin del bloque principal */}
                );
                return (
                <div>
                    <h3>{t.createTeam || 'Crear equipo'}</h3>
                    <form onSubmit={handleSubmit}>
                        <input name="name" placeholder={t.teamName || 'Nombre del equipo'} value={form.name} onChange={handleChange} required />
                        <input name="players" placeholder={t.playersComma || 'Jugadores (separados por coma)'} value={form.players} onChange={handleChange} required />
                        <button type="submit">{t.create || 'Crear'}</button>
                    </form>
                    {error && <div style={{ color: 'red' }}>{error}</div>}
                    {success && <div style={{ color: 'green' }}>{success}</div>}
                    <h3>{t.existingTeams || 'Equipos existentes'}</h3>
                    <ul>
                        {teams.map(team => (
                            <li key={team._id}>
                                <b>{team.name}</b> ({t.owner || 'Dueño'}: {team.owner?.username || 'N/A'})<br />
                                {t.players || 'Jugadores'}: {team.players.map(p => p.name).join(', ')}
                                <br />
                                <b>{t.trophyCabinet || 'Vitrina de trofeos'}:</b>
                                <ul style={{ display: 'flex', flexWrap: 'wrap', listStyle: 'none', padding: 0 }}>
                                    {(trophies[team._id] && trophies[team._id].length > 0) ? trophies[team._id].map((trophy, i) => (
                                        <li key={i} style={{ marginRight: 8 }}>
                                            {getTrophyEmoji(trophy.type)} {trophy.type} (T{trophy.season}) {trophy.division ? `- ${trophy.division}` : ''} {trophy.competition ? `- ${trophy.competition}` : ''}
                                        </li>
                                    )) : <li>{t.noTrophies || 'Sin trofeos'}</li>}
                                </ul>
                                {/* Cambiar hora personalizada de partido (solo premium y dueño) */}
                                {user?.premium && team.owner?._id === user._id && (
                                    <MatchTimeSetter team={team} token={token} />
                                )}
                                {user?.premium && (
                                    <button onClick={() => handleShowStats(team._id)} style={{ marginTop: 4 }}>{t.viewDetailedStats || 'Ver estadísticas detalladas'}</button>
                                )}
                                {detailedStats && detailedStats.teamId === team._id && (
                                    <div style={{ background: '#f9f9f9', padding: 8, marginTop: 6, border: '1px solid #ccc' }}>
                                        <b>{t.detailedStats || 'Estadísticas detalladas'}:</b><br />
                                        {t.avgRating || 'Media rating'}: {detailedStats.mediaRating.toFixed(2)}<br />
                                        {t.maxRating || 'Máximo rating'}: {detailedStats.maxRating}<br />
                                        {t.minRating || 'Mínimo rating'}: {detailedStats.minRating}<br />
                                        <b>{t.players || 'Jugadores'}:</b>
                                        <ul>
                                            {detailedStats.jugadores.map((j, i) => (
                                                <li key={i}>{j.nombre} ({j.posicion}) - {j.rating}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                    {statsError && <div style={{ color: 'red' }}>{statsError}</div>}
                </div>
                )
            </div >
        );
    }
}

export default Teams;
