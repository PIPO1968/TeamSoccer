import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from './LanguageContext';


function MultiMatchViewer({ token, user }) {
    const { t } = useLanguage();

    const [mainMatchId, setMainMatchId] = useState('');
    const [rivalMatchIds, setRivalMatchIds] = useState('');
    const [mainMatch, setMainMatch] = useState(null);
    const [rivalMatches, setRivalMatches] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [highlighted, setHighlighted] = useState({}); // {matchId: true}
    const prevScores = useRef({});
    const intervalRef = useRef();

    // Función para cargar partidos (principal y rivales)
    const fetchMatches = async (auto = false) => {
        if (!mainMatchId.trim() && !rivalMatchIds.trim()) return;
        setError('');
        if (!auto) { setMainMatch(null); setRivalMatches([]); setLoading(true); }
        try {
            const ids = [];
            if (mainMatchId.trim()) ids.push(mainMatchId.trim());
            const rivals = rivalMatchIds.split(',').map(id => id.trim()).filter(Boolean);
            ids.push(...rivals);
            if (ids.length === 0) throw new Error('Debes indicar al menos un partido');
            const res = await fetch('http://localhost:5000/api/premium/viewer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                body: JSON.stringify({ matchIds: ids })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Error al obtener partidos');
            setMainMatch(data.matches.find(m => m._id === mainMatchId.trim()) || null);
            // Detectar cambios de marcador en rivales
            const newHighlights = {};
            data.matches.filter(m => m._id !== mainMatchId.trim()).forEach(match => {
                const prev = prevScores.current[match._id];
                const currScore = `${match.homeGoals}-${match.awayGoals}`;
                if (prev && prev !== currScore) {
                    newHighlights[match._id] = true;
                    setTimeout(() => {
                        setHighlighted(h => ({ ...h, [match._id]: false }));
                    }, 2500);
                }
                prevScores.current[match._id] = currScore;
            });
            setHighlighted(h => ({ ...h, ...newHighlights }));
            setRivalMatches(data.matches.filter(m => m._id !== mainMatchId.trim()));
        } catch (err) {
            setError(err.message);
        }
        if (!auto) setLoading(false);
    };

    // Auto-actualización de resultados rivales cada 5 segundos
    useEffect(() => {
        if (!rivalMatchIds.trim()) return;
        if (intervalRef.current) clearInterval(intervalRef.current);
        fetchMatches(true); // Primera carga
        intervalRef.current = setInterval(() => {
            fetchMatches(true);
        }, 5000);
        return () => clearInterval(intervalRef.current);
        // eslint-disable-next-line
    }, [rivalMatchIds, mainMatchId]);

    if (!user?.premium) return <div style={{ color: 'gray' }}>{t.onlyPremiumMultiMatch || 'Solo los usuarios premium pueden usar el Multi/Match Viewer.'}</div>;

    if (!user?.premium) return <div style={{ color: 'gray' }}>Solo los usuarios premium pueden usar el Multi/Match Viewer.</div>;

    return (
        <div>
            <h2>{t.multiMatchViewer || 'Multi/Match Viewer (Premium)'}</h2>
            <div style={{ marginBottom: 10 }}>
                <label>{t.mainMatch || 'Partido principal'}:&nbsp;</label>
                <input value={mainMatchId} onChange={e => setMainMatchId(e.target.value)} placeholder={t.mainMatchId || 'ID de tu partido'} style={{ width: 180 }} />
            </div>
            <div style={{ marginBottom: 10 }}>
                <label>{t.rivalMatches || 'Partidos rivales (IDs separados por coma)'}:&nbsp;</label>
                <input value={rivalMatchIds} onChange={e => setRivalMatchIds(e.target.value)} placeholder={t.rivalMatchIds || 'IDs de partidos rivales'} style={{ width: 300 }} />
            </div>
            <button onClick={() => fetchMatches(false)} disabled={loading}>{t.viewMatches || 'Ver partidos'}</button>
            {error && <div style={{ color: 'red' }}>{error}</div>}

            {/* Resultados rivales en directo en la parte superior */}
            {rivalMatches.length > 0 && (
                <div style={{ margin: '18px 0', padding: '10px', background: '#fffbe6', border: '1.5px solid #e6c200', borderRadius: 6 }}>
                    <b>{t.liveRivalResults || 'Resultados en directo de rivales'}:&nbsp;</b>
                    {rivalMatches.map(match => (
                        <span
                            key={match._id}
                            style={{
                                marginRight: 18,
                                transition: 'background 0.4s',
                                background: highlighted[match._id] ? '#ffe066' : 'transparent',
                                borderRadius: '4px',
                                padding: highlighted[match._id] ? '2px 6px' : '2px 6px'
                            }}
                        >
                            {match.homeTeam} {match.homeGoals} - {match.awayGoals} {match.awayTeam}
                        </span>
                    ))}
                </div>
            )}

            <div style={{ marginTop: 20, display: 'flex', gap: 30 }}>
                {mainMatch && (
                    <div style={{ border: '2px solid #007bff', padding: 12, minWidth: 260, background: '#f0f8ff' }}>
                        <b>{t.mainMatchUpper || 'PARTIDO PRINCIPAL'}</b><br />
                        <b>{mainMatch.homeTeam} vs {mainMatch.awayTeam}</b><br />
                        {t.type || 'Tipo'}: {mainMatch.type}<br />
                        {t.date || 'Fecha'}: {new Date(mainMatch.scheduledFor).toLocaleString()}<br />
                        {t.goals || 'Goles'}: {mainMatch.homeGoals} - {mainMatch.awayGoals}<br />
                        {/* Aquí se pueden mostrar más detalles o comentarios en vivo */}
                    </div>
                )}
            </div>
        </div>
    );
}

export default MultiMatchViewer;
