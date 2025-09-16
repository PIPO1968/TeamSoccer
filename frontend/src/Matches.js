import React, { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';

function Matches({ token }) {
    const { t } = useLanguage();
    const [teams, setTeams] = useState([]);
    const [matches, setMatches] = useState([]);
    const [form, setForm] = useState({ homeTeamId: '', awayTeamId: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/teams`)
            .then(res => res.json())
            .then(data => setTeams(data));
    fetch(`${process.env.REACT_APP_API_URL}/api/matches`)
            .then(res => res.json())
            .then(data => setMatches(data));
    }, [success]);

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setError(''); setSuccess('');
        if (form.homeTeamId === form.awayTeamId) {
            setError('Debes elegir dos equipos diferentes');
            return;
        }
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/matches`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify(form)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Error al jugar partido');
            setSuccess('Partido jugado');
            setForm({ homeTeamId: '', awayTeamId: '' });
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div>
            <h3>{t.playMatch || 'Jugar partido'}</h3>
            <form onSubmit={handleSubmit}>
                <select name="homeTeamId" value={form.homeTeamId} onChange={handleChange} required>
                    <option value="">{t.homeTeam || 'Equipo local'}</option>
                    {teams.map(team => <option key={team._id} value={team._id}>{team.name}</option>)}
                </select>
                <select name="awayTeamId" value={form.awayTeamId} onChange={handleChange} required>
                    <option value="">{t.awayTeam || 'Equipo visitante'}</option>
                    {teams.map(team => <option key={team._id} value={team._id}>{team.name}</option>)}
                </select>
                <button type="submit">{t.play || 'Jugar'}</button>
            </form>
            {error && <div style={{ color: 'red' }}>{error}</div>}
            {success && <div style={{ color: 'green' }}>{success}</div>}
            <h3>{t.playedMatches || 'Partidos jugados'}</h3>
            <ul>
                {matches.map(match => (
                    <li key={match._id}>
                        {match.homeTeam?.name || (t.team || 'Equipo')} {match.homeGoals} - {match.awayGoals} {match.awayTeam?.name || (t.team || 'Equipo')}
                        <span style={{ fontSize: '0.8em', color: '#888' }}> ({new Date(match.playedAt).toLocaleString()})</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Matches;
