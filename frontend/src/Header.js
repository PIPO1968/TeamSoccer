
import React, { useState, useEffect, useContext } from 'react';
import { LanguageContext, translations } from './LanguageContext';

function Header() {
    const { language, setLanguage } = useContext(LanguageContext);
    const t = translations[language] || translations['es'];
    const [activeManagers, setActiveManagers] = useState(123);
    const [onlineManagers, setOnlineManagers] = useState(45);
    const [dateStr, setDateStr] = useState('');
    const [timeStr, setTimeStr] = useState('');

    useEffect(() => {
        const updateDateTime = () => {
            const now = new Date();
            // Día de la semana en el idioma seleccionado
            const dias = {
                es: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
                en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                fr: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
                de: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
                it: ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'],
                pt: ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'],
                ru: ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'],
                pl: ['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota'],
                ja: ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'],
                zh: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
                ar: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
                tr: ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'],
                hi: ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'],
                ko: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
                nl: ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'],
                id: ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
            };
            const diasSemana = dias[language] || dias['es'];
            const diaSemana = diasSemana[now.getDay()];
            // Fecha y hora local
            const fecha = now.toLocaleDateString(language);
            const hora = now.toLocaleTimeString(language, { hour12: false });
            setDateStr(`${diaSemana}, ${fecha}`);
            setTimeStr(hora);
        };
        updateDateTime();
        const interval = setInterval(updateDateTime, 1000);
        return () => clearInterval(interval);
    }, [language]);

    // Simulación de estadísticas (puedes conectar a backend si lo deseas)
    useEffect(() => {
        const fetchStats = () => {
            fetch(process.env.REACT_APP_API_URL + '/api/user-stats/active')
                .then(res => res.json())
                .then(data => setActiveManagers(data.activeManagers))
                .catch(() => setActiveManagers(0));
            fetch(process.env.REACT_APP_API_URL + '/api/user-stats/online')
                .then(res => res.json())
                .then(data => setOnlineManagers(data.onlineManagers))
                .catch(() => setOnlineManagers(0));
        };
        fetchStats();
        const interval = setInterval(fetchStats, 10000); // refresca cada 10 segundos
        return () => clearInterval(interval);
    }, []);

    return (
        <header
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                zIndex: 1000,
                background: '#1a237e', // color de fondo header
                color: '#fff', // color de texto
                display: 'flex',
                alignItems: 'center',
                padding: '8px 24px',
                fontSize: '1.1rem',
                fontWeight: 500,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}
        >
            <img src="/logoTS.png" alt="Logo TeamSoccer" style={{ height: 36, marginRight: 18 }} />
            <span style={{ marginRight: 32 }}>Agers activos: {activeManagers}</span>
            <span style={{ marginRight: 32 }}>Managers online: {onlineManagers}</span>
            <span style={{ marginRight: 32 }}>{dateStr}&nbsp;&nbsp;{timeStr}</span>
            <span style={{ marginRight: 12 }}>Elige idioma:</span>
            <select value={language} onChange={e => setLanguage(e.target.value)} style={{ padding: '4px 8px', borderRadius: 4, maxWidth: 120, fontWeight: 500 }}>
                <option value="es">Español</option>
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="it">Italiano</option>
                <option value="pt">Português</option>
                <option value="ru">Русский</option>
                <option value="zh">中文</option>
                <option value="ja">日本語</option>
                <option value="ar">العربية</option>
                <option value="tr">Türkçe</option>
                <option value="hi">हिन्दी</option>
                <option value="ko">한국어</option>
                <option value="nl">Nederlands</option>
                <option value="pl">Polski</option>
                <option value="id">Bahasa Indonesia</option>
            </select>
        </header>
    );
}

export default Header;
