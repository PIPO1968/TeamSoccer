import React, { useEffect, useState } from 'react';
import { useLanguage } from './LanguageContext';

function NationalDashboard({ token }) {
    const { t } = useLanguage();
    const [matches, setMatches] = useState([]);
    const [nationalTeams, setNationalTeams] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            // Obtener partidos de selecciones nacionales
            const resMatches = await fetch(`${process.env.REACT_APP_API_URL}/api/matches`);
            const allMatches = await resMatches.json();
            const natMatches = allMatches.filter(m => m.type === 'mundial' || m.type === 'intercontinental');
            setMatches(natMatches);
            // Obtener selecciones nacionales
            const resNat = await fetch(`${process.env.REACT_APP_API_URL}/api/national-teams`);
            const natTeams = await resNat.json();
            setNationalTeams(natTeams);
            setLoading(false);
        }
        fetchData();
    }, []);

    return (
        <div>
            <h2>{t.nationalCompetitions || 'Competiciones de Selecciones Nacionales'}</h2>
            {loading ? <p>{t.loading || 'Cargando...'}</p> : (
                <>
                    <h3>{t.playedMatches || 'Partidos jugados'}</h3>
                    <ul>
                        {matches.map(m => (
                            <li key={m._id}>
                                {m.homeTeam?.name || m.homeTeam} vs {m.awayTeam?.name || m.awayTeam} - {typeof m.homeGoals === 'number' ? m.homeGoals : '-'} : {typeof m.awayGoals === 'number' ? m.awayGoals : '-'}
                            </li>
                        ))}
                    </ul>
                    <h3>{t.nationalTeams || 'Selecciones nacionales'}</h3>
                    <ul>
                        {nationalTeams.map(nt => (
                            <li key={nt._id}>
                                <b>{nt.country}</b> | {t.manager || 'Manager'}: {nt.manager?.username || nt.manager} | {t.players || 'Jugadores'}: {nt.players.length} | {t.trophies || 'Trofeos'}: {nt.trophies ? nt.trophies.map(t => t.type).join(', ') : (t.none || 'Ninguno')}
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
}

export default NationalDashboard;
