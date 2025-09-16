import React, { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';

function Friendlies({ token, userId, teams, inCup }) {
    const { t } = useLanguage();
    const [friendlies, setFriendlies] = useState([]);
    const [users, setUsers] = useState([]);
    const [form, setForm] = useState({ opponentId: '', teamRequesterId: '', teamOpponentId: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!token) return;
    fetch(`${process.env.REACT_APP_API_URL}/api/friendlies`, {
            headers: { 'Authorization': 'Bearer ' + token }
        })
            .then(res => res.json())
            .then(data => setFriendlies(data));
    fetch(`${process.env.REACT_APP_API_URL}/api/users`)
            .then(res => res.json())
            .then(data => setUsers(data));
    }, [token, success]);

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleRequest = async e => {
        e.preventDefault();
        setError(''); setSuccess(''); setLoading(true);
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/friendlies/request`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify(form)
            });
            const data = await res.json();
            setLoading(false);
            if (!res.ok) throw new Error(data.error || 'Error al solicitar amistoso');
            setSuccess('Solicitud enviada');
            setForm({ opponentId: '', teamRequesterId: '', teamOpponentId: '' });
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const handleAccept = async (id) => {
        setError(''); setSuccess(''); setLoading(true);
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/friendlies/accept/${id}`, {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + token }
            });
            const data = await res.json();
            setLoading(false);
            if (!res.ok) throw new Error(data.error || 'Error al aceptar amistoso');
            setSuccess('Amistoso aceptado');
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    // Solo puede solicitar si no está en copa y tiene equipo
    const canRequest = !inCup && teams.length > 0;

    return (
        <div>
            <h3>{t.friendlies || 'Partidos Amistosos'}</h3>
            {!canRequest && <div style={{ color: 'orange' }}>{t.cannotRequestFriendly || 'No puedes solicitar amistosos mientras sigas en la copa de la liga.'}</div>}
            {canRequest && (
                <form onSubmit={handleRequest}>
                    <select name="teamRequesterId" value={form.teamRequesterId} onChange={handleChange} required>
                        <option value="">{t.yourTeam || 'Tu equipo'}</option>
                        {teams.filter(t => t.owner === userId).map(team => (
                            <option key={team._id} value={team._id}>{team.name}</option>
                        ))}
                    </select>
                    <select name="opponentId" value={form.opponentId} onChange={handleChange} required>
                        <option value="">{t.rivalManager || 'Manager rival'}</option>
                        {users.filter(u => u._id !== userId).map(user => (
                            <option key={user._id} value={user._id}>{user.username}</option>
                        ))}
                    </select>
                    <select name="teamOpponentId" value={form.teamOpponentId} onChange={handleChange} required>
                        <option value="">{t.rivalTeam || 'Equipo rival'}</option>
                        {teams.filter(t => t.owner !== userId).map(team => (
                            <option key={team._id} value={team._id}>{team.name}</option>
                        ))}
                    </select>
                    <button type="submit" disabled={loading}>{t.requestFriendly || 'Solicitar amistoso'}</button>
                </form>
            )}
            {error && <div style={{ color: 'red' }}>{error}</div>}
            {success && <div style={{ color: 'green' }}>{success}</div>}
            <h4>{t.myFriendlies || 'Mis amistosos'}</h4>
            <ul>
                {friendlies.map(f => (
                    <li key={f._id}>
                        {f.teamRequester?.name} vs {f.teamOpponent?.name} - {t.status || 'Estado'}: {f.status} - {t.scheduledFor || 'Programado para'}: {new Date(f.scheduledFor).toLocaleDateString()}
                        {f.status === 'pendiente' && f.opponent?._id === userId && (
                            <button onClick={() => handleAccept(f._id)} disabled={loading}>{t.accept || 'Aceptar'}</button>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Friendlies;
