import MultiMatchViewer from './MultiMatchViewer';
import RoomMadnessViewer from './RoomMadnessViewer';
import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

import './App.css';

import Register from './Register';
import Login from './Login';
import Teams from './Teams';
import Matches from './Matches';
import Friendlies from './Friendlies';

import NationalDashboard from './NationalDashboard';
import Store from './Store';
import Rooms from './Rooms';
import Community from './Community';


function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [showLogin, setShowLogin] = useState(true);
  const [language, setLanguage] = useState('es');
  // Diccionario de traducciones básicas (ejemplo, solo portada y navegación)
  const translations = {
    es: {
      chooseLanguage: 'Elige idioma:',
      welcome: 'Bienvenido',
      register: 'Regístrate',
      login: 'Inicia sesión',
      noAccount: '¿No tienes cuenta?',
      haveAccount: '¿Ya tienes cuenta?',
      clubs: 'Gestión de Clubes',
      national: 'Selecciones Nacionales',
      store: 'Tienda',
      rooms: 'Salas',
      community: 'Comunidad',
      viewer: 'Multi/Match Viewer',
      madness: 'Room Madness',
      premium: 'Premium',
      logout: 'Cerrar sesión',
      mainSlogan: 'Team Soccer Juego de Manager | Únete al mundo del fútbol gratuito',
      buildTrain: 'Construye y entrena tu equipo',
      developTeam: 'Desarrolla tu equipo mediante entrenamiento. Gestiona tus finanzas. Elige tus mejores jugadores.',
      competeLeagues: 'Compite en ligas',
      joinLeagues: 'Únete a ligas competitivas y torneos. Asciende de división.',
      matchExperience: 'Experiencia de partido',
      liveMatches: 'Observa partidos en vivo con nuestro simulador en tiempo real.',
      communitySection: 'Comunidad',
      joinCommunity: 'Únete a una comunidad vibrante de managers de todo el mundo.'
    },
    en: {
      chooseLanguage: 'Choose language:',
      welcome: 'Welcome',
      register: 'Register',
      login: 'Login',
      // ...existing code...
      noAccount: 'Não tem conta?',
      haveAccount: 'Já tem conta?',
      clubs: 'Gestão de Clubes',
      national: 'Seleções Nacionais',
      store: 'Loja',
      rooms: 'Salas',
      community: 'Comunidade',
      viewer: 'Multi/Match Viewer',
      madness: 'Room Madness',
      premium: 'Premium',
      logout: 'Sair',
      mainSlogan: 'Team Soccer Jogo de Manager | Junte-se ao mundo do futebol gratuito',
      buildTrain: 'Construa e treine sua equipe',
      developTeam: 'Desenvolva sua equipe através do treinamento. Gerencie suas finanças. Escolha seus melhores jogadores.',
      competeLeagues: 'Compita em ligas',
      joinLeagues: 'Participe de ligas e torneios competitivos. Suba de divisão.',
      matchExperience: 'Experiência de partida',
      liveMatches: 'Assista a partidas ao vivo com nosso simulador em tempo real.',
      communitySection: 'Comunidade',
      joinCommunity: 'Junte-se a uma comunidade vibrante de managers de todo o mundo.'
    },
    // ...existing code...
    ru: { chooseLanguage: 'Выберите язык:', welcome: 'Добро пожаловать', register: 'Регистрация', login: 'Войти', noAccount: 'Нет аккаунта?', haveAccount: 'Уже есть аккаунт?', clubs: 'Управление клубом', national: 'Сборные', store: 'Магазин', rooms: 'Комнаты', community: 'Сообщество', viewer: 'Multi/Match Viewer', madness: 'Room Madness', premium: 'Премиум', logout: 'Выйти', mainSlogan: 'Team Soccer Менеджер | Присоединяйтесь к миру бесплатного футбола' },
    zh: { chooseLanguage: '选择语言:', welcome: '欢迎', register: '注册', login: '登录', noAccount: '没有账号?', haveAccount: '已有账号?', clubs: '俱乐部管理', national: '国家队', store: '商店', rooms: '房间', community: '社区', viewer: 'Multi/Match Viewer', madness: 'Room Madness', premium: '高级', logout: '退出', mainSlogan: 'Team Soccer 管理游戏 | 加入免费的足球世界' },
    ja: { chooseLanguage: '言語を選択:', welcome: 'ようこそ', register: '登録', login: 'ログイン', noAccount: 'アカウントをお持ちでない?', haveAccount: 'すでにアカウントをお持ちですか?', clubs: 'クラブ管理', national: 'ナショナルチーム', store: 'ストア', rooms: 'ルーム', community: 'コミュニティ', viewer: 'Multi/Match Viewer', madness: 'Room Madness', premium: 'プレミアム', logout: 'ログアウト', mainSlogan: 'Team Soccer マネージャーゲーム | 無料サッカーの世界に参加しよう' },
    ar: { chooseLanguage: 'اختر اللغة:', welcome: 'مرحبا', register: 'تسجيل', login: 'تسجيل الدخول', noAccount: 'ليس لديك حساب؟', haveAccount: 'هل لديك حساب؟', clubs: 'إدارة الأندية', national: 'المنتخبات الوطنية', store: 'المتجر', rooms: 'الغرف', community: 'المجتمع', viewer: 'Multi/Match Viewer', madness: 'Room Madness', premium: 'بريميوم', logout: 'تسجيل الخروج', mainSlogan: 'لعبة مدير فريق كرة القدم | انضم إلى عالم كرة القدم المجاني' },
    tr: { chooseLanguage: 'Dil seçin:', welcome: 'Hoşgeldiniz', register: 'Kayıt Ol', login: 'Giriş Yap', noAccount: 'Hesabınız yok mu?', haveAccount: 'Zaten hesabınız var mı?', clubs: 'Kulüp Yönetimi', national: 'Milli Takımlar', store: 'Mağaza', rooms: 'Odalar', community: 'Topluluk', viewer: 'Multi/Match Viewer', madness: 'Room Madness', premium: 'Premium', logout: 'Çıkış Yap', mainSlogan: 'Team Soccer Menajer Oyunu | Ücretsiz futbol dünyasına katıl' },
    hi: { chooseLanguage: 'भाषा चुनें:', welcome: 'स्वागत है', register: 'रजिस्टर करें', login: 'लॉगिन', noAccount: 'कोई खाता नहीं?', haveAccount: 'पहले से खाता है?', clubs: 'क्लब प्रबंधन', national: 'राष्ट्रीय टीमें', store: 'स्टोर', rooms: 'रूम्स', community: 'समुदाय', viewer: 'Multi/Match Viewer', madness: 'Room Madness', premium: 'प्रीमियम', logout: 'लॉगआउट', mainSlogan: 'टीम सॉकर प्रबंधक खेल | मुफ्त फुटबॉल दुनिया में शामिल हों' },
    ko: { chooseLanguage: '언어 선택:', welcome: '환영합니다', register: '가입하기', login: '로그인', noAccount: '계정이 없으신가요?', haveAccount: '이미 계정이 있으신가요?', clubs: '클럽 관리', national: '국가대표팀', store: '상점', rooms: '룸', community: '커뮤니티', viewer: 'Multi/Match Viewer', madness: 'Room Madness', premium: '프리미엄', logout: '로그아웃', mainSlogan: '팀 사커 매니저 게임 | 무료 축구 세계에 참여하세요' },
    nl: { chooseLanguage: 'Kies taal:', welcome: 'Welkom', register: 'Registreren', login: 'Inloggen', noAccount: 'Nog geen account?', haveAccount: 'Heb je al een account?', clubs: 'Clubbeheer', national: 'Nationale Teams', store: 'Winkel', rooms: 'Kamers', community: 'Community', viewer: 'Multi/Match Viewer', madness: 'Room Madness', premium: 'Premium', logout: 'Uitloggen', mainSlogan: 'Team Soccer Manager Spel | Word lid van de gratis voetbalwereld' },
    pl: { chooseLanguage: 'Wybierz język:', welcome: 'Witamy', register: 'Zarejestruj się', login: 'Zaloguj się', noAccount: 'Nie masz konta?', haveAccount: 'Masz już konto?', clubs: 'Zarządzanie Klubem', national: 'Reprezentacje', store: 'Sklep', rooms: 'Pokoje', community: 'Społeczność', viewer: 'Multi/Match Viewer', madness: 'Room Madness', premium: 'Premium', logout: 'Wyloguj się', mainSlogan: 'Team Soccer Gra Menedżerska | Dołącz do darmowego świata piłki nożnej' },
    id: { chooseLanguage: 'Pilih bahasa:', welcome: 'Selamat datang', register: 'Daftar', login: 'Masuk', noAccount: 'Belum punya akun?', haveAccount: 'Sudah punya akun?', clubs: 'Manajemen Klub', national: 'Tim Nasional', store: 'Toko', rooms: 'Ruang', community: 'Komunitas', viewer: 'Multi/Match Viewer', madness: 'Room Madness', premium: 'Premium', logout: 'Keluar', mainSlogan: 'Team Soccer Game Manajer | Bergabunglah dengan dunia sepak bola gratis' }
  };

  // Detectar idioma por IP (placeholder, requiere backend o servicio externo)
  useEffect(() => {
    // Aquí podrías usar un servicio externo para detectar país/idioma por IP
    // Por defecto: español
    setLanguage('es');
  }, []);

  const handleRegister = (user) => {
    setUser(user);
    setShowLogin(true);
  };

  const handleLogin = (data) => {
    setUser(data.user);
    setToken(data.token);
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
  };

  // Estado simulado para saber si el usuario sigue en copa (debería venir del backend en el futuro)
  // Eliminado: inCup ya no se usa
  // Estado para equipos (para pasar a Friendlies)
  const [teams, setTeams] = useState([]);

  // Función para actualizar equipos desde Teams
  const handleTeamsUpdate = (newTeams) => setTeams(newTeams);

  const [showNational, setShowNational] = useState(false);
  const [showStore, setShowStore] = useState(false);
  const [showRooms, setShowRooms] = useState(false);
  const [showCommunity, setShowCommunity] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [showRoomMadness, setShowRoomMadness] = useState(false);

  // Estado para fecha y hora actual
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Traducción de fecha y hora
  function getLocale(language) {
    // Mapear código de idioma a locale válido para Intl.DateTimeFormat
    const map = {
      es: 'es-ES', en: 'en-GB', fr: 'fr-FR', de: 'de-DE', it: 'it-IT', pt: 'pt-PT', ru: 'ru-RU', zh: 'zh-CN', ja: 'ja-JP', ar: 'ar-EG', tr: 'tr-TR', hi: 'hi-IN', ko: 'ko-KR', nl: 'nl-NL', pl: 'pl-PL', id: 'id-ID'
    };
    return map[language] || 'es-ES';
  }
  const locale = getLocale(language);
  const dateStr = now.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

  // Estado para managers activos y online
  const [activeManagers, setActiveManagers] = useState(0);
  const [onlineManagers, setOnlineManagers] = useState(0);
  useEffect(() => {
    async function fetchStats() {
      try {
        const resActive = await fetch('/api/user-stats/active');
        const dataActive = await resActive.json();
        setActiveManagers(dataActive.activeManagers || 0);
        const resOnline = await fetch('/api/user-stats/online');
        const dataOnline = await resOnline.json();
        setOnlineManagers(dataOnline.onlineManagers || 0);
      } catch { }
    }
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  // Estado para notificaciones
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    // Conexión a Socket.IO backend
  const socket = io(process.env.REACT_APP_API_URL);
    socket.on('connect', () => {
      setNotification('¡Conectado a notificaciones en tiempo real!');
    });
    socket.on('notificacion', (data) => {
      setNotification(data.mensaje);
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="App">
      {/* Notificación en tiempo real */}
      {notification && (
        <div style={{ position: 'fixed', top: 10, right: 10, background: '#1a2a44', color: '#fff', padding: '12px 20px', borderRadius: 8, zIndex: 9999, boxShadow: '0 2px 8px #0004' }}>
          {notification}
          <button style={{ marginLeft: 16, background: 'transparent', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => setNotification(null)}>X</button>
        </div>
      )}
      <header className="App-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', minHeight: 80 }}>
        {/* Logo a la izquierda y stats/fecha al centro */}
        <div style={{ display: 'flex', alignItems: 'center', flex: 1, justifyContent: 'flex-start' }}>
          <img src="https://www.teamsoccer.org/teamsoccer-assets/cbc230b4-3215-4a9f-9673-4064a3ad90c4.png" alt="Logo TeamSoccer" style={{ height: 64, marginRight: 32 }} />
          <div className="main-header-info" style={{ display: 'flex', alignItems: 'center', fontSize: '1rem', fontWeight: 'bold', color: '#fff', gap: 18 }}>
            <span className="main-stats">
              {translations[language]?.activeManagers || 'Managers activos'}: {activeManagers}
            </span>
            <span className="main-stats">
              {translations[language]?.onlineManagers || 'Managers online'}: {onlineManagers}
            </span>
            <span className="main-date">
              {dateStr} {timeStr}
            </span>
          </div>
        </div>
        {/* Selector de idioma a la derecha */}
        <div style={{ marginLeft: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="main-choose-language" style={{ fontWeight: 'bold', fontSize: '1rem' }}>{translations[language]?.chooseLanguage || 'Choose language:'}</span>
          <select value={language} onChange={e => setLanguage(e.target.value)} style={{ padding: '4px 8px', borderRadius: 4 }}>
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
        </div>
        {!user ? (
          <>
            <div style={{ marginBottom: 30 }}>
              <div className="main-slogan">
                {translations[language]?.mainSlogan || 'Team Soccer Juego de Manager | Únete al mundo del fútbol gratuito'}
              </div>
              <img
                src="https://www.teamsoccer.org/teamsoccer-assets/06dfc4b1-c0ea-4de3-af56-84bcea0a199e.png"
                alt="TeamSoccer"
                style={{ maxWidth: '90vw', maxHeight: 320, borderRadius: 12, boxShadow: '0 2px 12px #0002', cursor: 'pointer' }}
                onClick={() => window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank')}
                title="Haz clic para ver el video de presentación"
              />
            </div>
            {/* Textos informativos traducidos */}
            <div style={{
              background: '#f7faff',
              borderRadius: 10,
              boxShadow: '0 1px 8px #0001',
              padding: '18px 18px 10px 18px',
              margin: '0 auto 24px auto',
              maxWidth: 600,
              fontSize: '1.08rem',
              color: '#1a2a44',
              lineHeight: 1.6
            }}>
              <div style={{ marginBottom: 10, fontWeight: 600 }}>{
                translations[language]?.buildTrain || 'Construye y entrena tu equipo'
              }</div>
              <div style={{ marginBottom: 16 }}>{
                translations[language]?.developTeam || 'Desarrolla tu equipo mediante entrenamiento. Gestiona tus finanzas. Elige tus mejores jugadores.'
              }</div>
              <div style={{ marginBottom: 10, fontWeight: 600 }}>{
                translations[language]?.competeLeagues || 'Compite en ligas'
              }</div>
              <div style={{ marginBottom: 16 }}>{
                translations[language]?.joinLeagues || 'Únete a ligas competitivas y torneos. Asciende de división.'
              }</div>
              <div style={{ marginBottom: 10, fontWeight: 600 }}>{
                translations[language]?.matchExperience || 'Experiencia de partido'
              }</div>
              <div style={{ marginBottom: 16 }}>{
                translations[language]?.liveMatches || 'Observa partidos en vivo con nuestro simulador en tiempo real.'
              }</div>
              <div style={{ marginBottom: 10, fontWeight: 600 }}>{
                translations[language]?.communitySection || 'Comunidad'
              }</div>
              <div>{
                translations[language]?.joinCommunity || 'Únete a una comunidad vibrante de managers de todo el mundo.'
              }</div>
            </div>
            {showLogin ? (
              <>
                <Login onLogin={handleLogin} />
                <p>¿No tienes cuenta? <button onClick={() => setShowLogin(false)}>Regístrate</button></p>
              </>
            ) : (
              <>
                <Register onRegister={handleRegister} />
                <p>¿Ya tienes cuenta? <button onClick={() => setShowLogin(true)}>Inicia sesión</button></p>
              </>
            )}
          </>
        ) : (
          <>
            <h2>Bienvenido, {user.username}</h2>
            <button onClick={handleLogout}>Cerrar sesión</button>
            <nav style={{ marginBottom: 20 }}>
              <button onClick={() => { setShowNational(false); setShowStore(false); setShowRooms(false); setShowCommunity(false); setShowViewer(false); setShowRoomMadness(false); }}>Gestión de Clubes</button>
              <button onClick={() => { setShowNational(true); setShowStore(false); setShowRooms(false); setShowCommunity(false); setShowViewer(false); setShowRoomMadness(false); }}>Selecciones Nacionales</button>
              <button onClick={() => { setShowStore(true); setShowNational(false); setShowRooms(false); setShowCommunity(false); setShowViewer(false); setShowRoomMadness(false); }}>Tienda</button>
              <button onClick={() => { setShowRooms(true); setShowStore(false); setShowNational(false); setShowCommunity(false); setShowViewer(false); setShowRoomMadness(false); }}>Salas</button>
              <button onClick={() => { setShowCommunity(true); setShowRooms(false); setShowStore(false); setShowNational(false); setShowViewer(false); setShowRoomMadness(false); }}>Comunidad</button>
              <button onClick={() => { setShowViewer(true); setShowCommunity(false); setShowRooms(false); setShowStore(false); setShowNational(false); setShowRoomMadness(false); }}>Multi/Match Viewer</button>
              <button onClick={() => { setShowRoomMadness(true); setShowViewer(false); setShowCommunity(false); setShowRooms(false); setShowStore(false); setShowNational(false); }}>Room Madness</button>
              {user?.premium && <span style={{ marginLeft: 10, color: 'gold', fontWeight: 'bold' }}>👑 Premium</span>}
            </nav>
            {showRoomMadness ? (
              <RoomMadnessViewer />
            ) : showViewer ? (
              <MultiMatchViewer token={token} user={user} />
            ) : showCommunity ? (
              <Community token={token} user={user} />
            ) : showRooms ? (
              <Rooms token={token} user={user} />
            ) : showStore ? (
              <Store token={token} user={user} />
            ) : !showNational ? (
              <>
                <Teams token={token} onTeamsUpdate={handleTeamsUpdate} />
                <Friendlies token={token} userId={user._id} teams={teams} />
                <Matches token={token} />
              </>
            ) : (
              <NationalDashboard token={token} />
            )}
          </>
        )}
      </header>
    </div>
  );
}

export default App;
