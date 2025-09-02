import React, { useEffect, useState } from 'react';
import { useLanguage } from './LanguageContext';

const premiumOptions = [
    { label: 'Premium 1 mes (4.59€)', months: 1 },
    { label: 'Premium 3 meses (11.99€)', months: 3 },
    { label: 'Premium 12 meses (39.99€)', months: 12 },
];
const tscreditOptions = [
    { label: '10 TScredits (3€)', amount: 10 },
    { label: '25 TScredits (5€)', amount: 25 },
    { label: '50 TScredits (8€)', amount: 50 },
    { label: '100 TScredits (14€)', amount: 100 },
];

function Store({ token, user }) {
    const { t } = useLanguage();
    const [status, setStatus] = useState({});
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        if (!token) return;
        fetch('http://localhost:5000/api/store/status', {
            headers: { 'Authorization': 'Bearer ' + token }
        })
            .then(res => res.json())
            .then(data => { setStatus(data); setLoading(false); });
    }, [token, msg]);

    const handleBuyPremium = async (months) => {
        setMsg('');
        const res = await fetch('http://localhost:5000/api/store/premium', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
            body: JSON.stringify({ months })
        });
        const data = await res.json();
        if (res.ok) setMsg('¡Premium activado!');
        else setMsg(data.error);
    };

    const handleFreePremium = async () => {
        setMsg('');
        const res = await fetch('http://localhost:5000/api/store/premium-free', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + token }
        });
        const data = await res.json();
        if (res.ok) setMsg('¡Premium gratis activado!');
        else setMsg(data.error);
    };

    const handleBuyTS = async (amount) => {
        setMsg('');
        const res = await fetch('http://localhost:5000/api/store/tscredits', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
            body: JSON.stringify({ amount })
        });
        const data = await res.json();
        if (res.ok) setMsg('¡TScredits añadidos!');
        else setMsg(data.error);
    };

    return (
        <div>
            <h2>{t.premiumStore || 'TIENDA PREMIUM'}</h2>
            {loading ? <p>{t.loading || 'Cargando...'}</p> : (
                <>
                    <p><b>{t.premiumStatus || 'Estado premium'}:</b> {status.premium ? (t.active || 'Activo') : (t.notActive || 'No activo')}</p>
                    <p><b>{t.validUntil || 'Válido hasta'}:</b> {status.premiumUntil ? new Date(status.premiumUntil).toLocaleString() : '-'}</p>
                    <p><b>TScredits:</b> {status.tscredits || 0}</p>
                    {user?.premium && user?.flags && (
                        <div style={{ margin: '10px 0' }}>
                            <b>{t.flagCollection || 'Colección de banderas'}:</b>
                            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                                {user.flags.length === 0 && <span>{t.noFlags || 'No tienes banderas aún. Juega amistosos en otros países.'}</span>}
                                {user.flags.map(flag => (
                                    <div key={flag} style={{ margin: 4, padding: 4, border: '1px solid #ccc', borderRadius: 4 }}>
                                        <span role="img" aria-label={flag}>{getFlagEmoji(flag)}</span> {flag}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    <button onClick={handleFreePremium}>{t.freePremium || 'Premium Gratis 15 días (solo nuevos)'}</button>
                    <h3>{t.buyPremium || 'Comprar Premium'}</h3>
                    {premiumOptions.map(opt => (
                        <button key={opt.months} onClick={() => handleBuyPremium(opt.months)}>{t[opt.label] || opt.label}</button>
                    ))}
                    <h3>{t.buyTScredits || 'Comprar TScredits'}</h3>
                    {tscreditOptions.map(opt => (
                        <button key={opt.amount} onClick={() => handleBuyTS(opt.amount)}>{t[opt.label] || opt.label}</button>
                    ))}
                    <h3>{t.premiumBenefits || 'Ventajas Premium'}</h3>
                    <ul>
                        <li>{t.teamLogo || 'Logo de equipo'}</li>
                        <li>{t.trophyCabinet || 'Vitrina de trofeos'}</li>
                        <li>{t.autoTraining || 'Auto-entrenamiento'}</li>
                        <li>{t.createRooms || 'Crear salas'}</li>
                        <li>{t.customMatchTimes || 'Horas de partido personalizadas'}</li>
                        <li>{t.flagCollection || 'Colección de banderas'}</li>
                        <li>{t.autoBids || 'Pujas automáticas en subastas'}</li>
                        <li>{t.detailedStats || 'Estadísticas detalladas'}</li>
                        <li>{t.multiMatchViewer || 'Multi/Match Viewer'}</li>
                        <li>{t.customTournaments || 'Torneos personalizados'}</li>
                        <li>{t.premiumCup || 'Copa Premium'}</li>
                        <li>{t.giftTScredits || '25 TScredits de regalo'}</li>
                    </ul>
                    {msg && <div style={{ color: 'green', marginTop: 10 }}>{msg}</div>}
                </>
            )}
        </div>
    );

    // Utilidad para mostrar emoji de bandera (simplificado)
    function getFlagEmoji(country) {
        const flags = {
            España: '🇪🇸', Francia: '🇫🇷', Italia: '🇮🇹', Alemania: '🇩🇪', Inglaterra: '🇬🇧', Portugal: '🇵🇹', Brasil: '🇧🇷', Argentina: '🇦🇷', México: '🇲🇽', Chile: '🇨🇱', Uruguay: '🇺🇾', USA: '🇺🇸', Japón: '🇯🇵', China: '🇨🇳', Marruecos: '🇲🇦', Nigeria: '🇳🇬', Camerún: '🇨🇲', Australia: '🇦🇺', Holanda: '🇳🇱', Bélgica: '🇧🇪', Suiza: '🇨🇭', Croacia: '🇭🇷', Polonia: '🇵🇱', Dinamarca: '🇩🇰', Suecia: '🇸🇪', Noruega: '🇳🇴', Finlandia: '🇫🇮', Rusia: '🇷🇺', Turquía: '🇹🇷', Grecia: '🇬🇷', Egipto: '🇪🇬', Sudáfrica: '🇿🇦', Colombia: '🇨🇴', Perú: '🇵🇪', Ecuador: '🇪🇨', Venezuela: '🇻🇪', Paraguay: '🇵🇾', Bolivia: '🇧🇴', CostaRica: '🇨🇷', Arabia: '🇸🇦', Irán: '🇮🇷', Corea: '🇰🇷', Serbia: '🇷🇸', Rumanía: '🇷🇴', Hungría: '🇭🇺', Austria: '🇦🇹', Escocia: '🏴', Irlanda: '🇮🇪', Islandia: '🇮🇸', Israel: '🇮🇱', Canadá: '🇨🇦', Qatar: '🇶🇦', Emiratos: '🇦🇪', India: '🇮🇳', Indonesia: '🇮🇩', Malasia: '🇲🇾', Tailandia: '🇹🇭', Vietnam: '🇻🇳', NuevaZelanda: '🇳🇿',
        };
        return flags[country] || '🏳️';
    }
}

export default Store;
