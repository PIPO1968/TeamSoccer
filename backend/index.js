// Commit de prueba para forzar despliegue Render
const mongoose = require('mongoose');
const auth = require('./middleware/auth');
const express = require('express');
const cors = require('cors');



const app = express();
app.use(cors());
app.use(express.json());

// Integración de Socket.IO
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// Ejemplo de evento de conexión
io.on('connection', (socket) => {
    console.log('Usuario conectado a Socket.IO');
    // Puedes emitir notificaciones así:
    // socket.emit('notificacion', { mensaje: '¡Bienvenido a TeamSoccer!' });
});


const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/teamsoccer';

// Solo arrancar el servidor después de conectar a MongoDB
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('MongoDB conectado');

        app.get('/', (req, res) => {
            res.send('API TeamSoccer funcionando');
        });

        // Ruta para registrar usuario
        app.post('/api/users', async (req, res) => {
            try {
                const { username, email, password, country } = req.body;
                const existingUser = await User.findOne({ $or: [{ email }, { username }] });
                if (existingUser) {
                    return res.status(400).json({ error: 'Usuario o email ya existe' });
                }
                const hashedPassword = await bcrypt.hash(password, 10);
                const user = new User({ username, email, password: hashedPassword });
                await user.save();

                // Buscar el mejor equipo BOT disponible del país (1ª división primero, luego inferiores)
                const botTeam = await Team.findOne({ owner: null, country }).sort({ division: 1, group: 1 });
                if (botTeam) {
                    botTeam.owner = user._id;
                    await botTeam.save();
                }

                res.status(201).json({ message: 'Usuario registrado', user: { username, email, _id: user._id }, team: botTeam });
            } catch (error) {
                res.status(400).json({ error: error.message });
            }
        });

        // Login de usuario
        app.post('/api/login', async (req, res) => {
            try {
                const { email, password } = req.body;
                const user = await User.findOne({ email });
                if (!user) {
                    return res.status(400).json({ error: 'Usuario o contraseña incorrectos' });
                }
                const isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch) {
                    return res.status(400).json({ error: 'Usuario o contraseña incorrectos' });
                }
                const token = jwt.sign({ userId: user._id, username: user.username }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
                res.json({ token, user: { username: user.username, email: user.email, _id: user._id } });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        server.listen(PORT, () => {
            console.log(`Servidor backend escuchando en puerto ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Error conectando a MongoDB:', err);
        process.exit(1); // Detener el proceso si no conecta
    });

// Modelos
const User = require('./models/User');
const Team = require('./models/Team');
const NationalTeam = require('./models/NationalTeam');
// const NationalCandidacy = require('./models/NationalCandidacy');
// const NationalVote = require('./models/NationalVote');
// const auth = require('./middleware/auth');
const Match = require('./models/Match');
// const FriendlyMatch = require('./models/FriendlyMatch');

// =====================
// PAGOS Y ACTIVACIÓN PREMIUM
// =====================
const paymentRoutes = require('./routes/payment');
app.use('/api/payment', paymentRoutes);
// =====================
// ESTADÍSTICAS DE SALA
// =====================
const roomStatisticsRoutes = require('./routes/roomStatistics');
app.use('/api/room-statistics', roomStatisticsRoutes);
// =====================
// COMPETICIONES POR SALA
// =====================
const competitionsRoutes = require('./routes/competitions');
app.use('/api/competitions', competitionsRoutes);
// Middleware para actualizar lastOnline en cada request autenticada
app.use(async (req, res, next) => {
    if (req.user && req.user.userId) {
        try {
            await User.findByIdAndUpdate(req.user.userId, { lastOnline: new Date() });
        } catch { }
    }
    next();
});
// Multi/Match Viewer premium
const premiumViewer = require('./routes/premiumViewer');
app.use('/api/premium', auth, premiumViewer);
// Estadísticas detalladas premium
const premiumStats = require('./routes/premiumStats');
app.use('/api/premium', auth, premiumStats);
// Managers activos y online
const userStats = require('./routes/userStats');
app.use('/api/user-stats', userStats);
// Configurar hora personalizada de partido (solo premium)
app.put('/api/teams/:id/match-time', auth, async (req, res) => {
    try {
        // const Team = require('./models/Team');
        const user = await User.findById(req.user.userId);
        if (!user || !user.premium) {
            return res.status(403).json({ error: 'Esto es una opcion premium' });
        }
        const team = await Team.findById(req.params.id);
        if (!team || String(team.owner) !== req.user.userId) {
            return res.status(403).json({ error: 'No autorizado' });
        }
        const { preferredMatchTime } = req.body;
        if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(preferredMatchTime)) {
            return res.status(400).json({ error: 'Formato de hora inválido (hh:mm)' });
        }
        // Buscar el próximo partido en casa (cualquier tipo)
        // const Match = require('./models/Match');
        const now = new Date();
        const nextHomeMatch = await Match.findOne({
            homeTeam: team._id,
            scheduledFor: { $gte: now }
        }).sort({ scheduledFor: 1 });
        if (nextHomeMatch) {
            const diffMs = new Date(nextHomeMatch.scheduledFor) - now;
            if (diffMs < 24 * 60 * 60 * 1000) {
                return res.status(400).json({ error: 'Solo puedes cambiar la hora si faltan más de 24h para tu próximo partido en casa.' });
            }
        }
        team.preferredMatchTime = preferredMatchTime;
        await team.save();
        res.json({ message: 'Hora personalizada de partido guardada', preferredMatchTime });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// Mensajes en salas (foro privado)
// Obtener mensajes de una sala
app.get('/api/rooms/:id/messages', async (req, res) => {
    try {
        const Room = require('./models/Room');
        const room = await Room.findById(req.params.id).populate('messages.user', 'username');
        if (!room) return res.status(404).json({ error: 'Sala no encontrada' });
        res.json({ messages: room.messages || [] });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Enviar mensaje a una sala (solo miembros, pero por ahora abierto a cualquier logueado)
app.post('/api/rooms/:id/messages', auth, async (req, res) => {
    try {
        const Room = require('./models/Room');
        // const User = require('./models/User');
        const room = await Room.findById(req.params.id);
        if (!room) return res.status(404).json({ error: 'Sala no encontrada' });
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(403).json({ error: 'No autorizado' });
        const { text } = req.body;
        const msg = { user: user._id, text, createdAt: new Date() };
        room.messages.push(msg);
        await room.save();
        res.status(201).json({ message: 'Mensaje enviado' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// =====================
// SALAS (ROOMS) PREMIUM
// =====================
const roomPremiumRoutes = require('./routes/roomPremium');
app.use('/api/room-premium', auth, roomPremiumRoutes);
// =====================
// FORO GENERAL
// =====================
const forumRoutes = require('./routes/forum');
app.use('/api/forum', forumRoutes);
// Endpoint para consultar la vitrina de trofeos de un equipo (solo club, no selecciones)
app.get('/api/teams/:id/trophies', async (req, res) => {
    try {
        const Team = require('./models/Team');
        const team = await Team.findById(req.params.id);
        if (!team) return res.status(404).json({ error: 'Equipo no encontrado' });
        // Solo trofeos de club, nunca de selecciones
        res.json({ trophies: team.trophies || [] });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// =====================
// AUTO-ENTRENAMIENTO PREMIUM (lógica automática)
// =====================
// Si el usuario premium no realiza entrenamiento manual en la semana, se le aplica uno por defecto automáticamente.
// Esta lógica debe integrarse en el script semanal de entrenamiento o en el endpoint correspondiente.
// =====================
// TIENDA PREMIUM Y TSCREDITS
// =====================

// Ver estado premium y TScredits
app.get('/api/store/status', auth, async (req, res) => {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ premium: user.premium, premiumUntil: user.premiumUntil, tscredits: user.tscredits });
});

// Activar o renovar premium (simulado)
app.post('/api/store/premium', auth, async (req, res) => {
    try {
        const { months } = req.body; // 1, 3, 12
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
        const now = new Date();
        let base = user.premiumUntil && user.premiumUntil > now ? user.premiumUntil : now;
        user.premiumUntil = new Date(base.getTime() + months * 30 * 24 * 60 * 60 * 1000);
        user.premium = true;
        await user.save();
        res.json({ message: 'Premium activado/renovado', premiumUntil: user.premiumUntil });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Premium gratis 15 días (solo si nunca ha sido premium)
app.post('/api/store/premium-free', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
        if (user.premiumUntil) return res.status(400).json({ error: 'Ya has usado el premium gratis' });
        const now = new Date();
        user.premiumUntil = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);
        user.premium = true;
        await user.save();
        res.json({ message: 'Premium gratis activado', premiumUntil: user.premiumUntil });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Comprar TScredits
app.post('/api/store/tscredits', auth, async (req, res) => {
    try {
        const { amount } = req.body; // 10, 25, 50, 100
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
        user.tscredits += amount;
        await user.save();
        res.json({ message: 'TScredits añadidos', tscredits: user.tscredits });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// Vender jugador al banco (solo el banco puede poner en venta, no entre managers)
app.post('/api/transfers/sell', auth, async (req, res) => {
    try {
        const { teamId, playerIndex } = req.body;
        const Team = require('./models/Team');
        const team = await Team.findById(teamId);
        if (!team || String(team.owner) !== req.user.userId) return res.status(403).json({ error: 'No autorizado' });
        if (typeof playerIndex !== 'number' || playerIndex < 0 || playerIndex >= team.players.length) return res.status(400).json({ error: 'Índice de jugador inválido' });
        const player = team.players[playerIndex];
        // Calcular precio según habilidades y edad
        const age = player.age || 25;
        const rating = player.rating || Object.values(player.skills || {}).reduce((a, b) => a + b, 0) || 50;
        const price = 100000 + rating * 1000 - age * 500;
        // El banco compra el jugador
        team.players.splice(playerIndex, 1);
        team.economy = (team.economy || 0) + price;
        await team.save();
        // Poner en venta en el mercado
        await Transfer.create({
            player: { ...player, fromClub: team._id },
            price,
            currentBid: null,
            currentBidder: null,
            bids: [],
            status: 'open',
            listedAt: new Date(),
            expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000),
            lastBidAt: null
        });
        res.json({ message: 'Jugador vendido al banco y puesto en el mercado', price });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Ver historial de transferencias (vendidos y cerrados)
app.get('/api/transfers/history', async (req, res) => {
    try {
        const transfers = await Transfer.find({ status: { $in: ['closed', 'sold'] } });
        res.json(transfers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// =====================
// TRANSFER MARKET: ENDPOINTS Y SUBASTAS
// =====================
const Transfer = require('./models/Transfer');

// Ver jugadores en el mercado de transferencias
app.get('/api/transfers', async (req, res) => {
    try {
        const transfers = await Transfer.find({ status: 'open' });
        res.json(transfers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Pujar por un jugador
app.post('/api/transfers/:id/bid', auth, async (req, res) => {
    try {
        const transfer = await Transfer.findById(req.params.id);
        if (!transfer || transfer.status !== 'open') return res.status(404).json({ error: 'Transferencia no disponible' });
        const { amount, teamId } = req.body;
        // Comprobar economía del club
        const Team = require('./models/Team');
        const team = await Team.findById(teamId);
        if (!team || String(team.owner) !== req.user.userId) return res.status(403).json({ error: 'No autorizado' });
        if ((team.economy || 0) < amount) return res.status(400).json({ error: 'Fondos insuficientes' });
        // La puja debe ser mayor que la actual o igual al precio de salida
        if (transfer.currentBid && amount <= transfer.currentBid) return res.status(400).json({ error: 'La puja debe ser mayor que la actual' });
        if (!transfer.currentBid && amount < transfer.price) return res.status(400).json({ error: 'La puja debe ser al menos igual al precio de salida' });
        // Registrar puja
        transfer.currentBid = amount;
        transfer.currentBidder = team._id;
        transfer.bids.push({ team: team._id, amount, time: new Date() });
        transfer.lastBidAt = new Date();
        // Extensión de tiempo si la puja es en los últimos 2 minutos
        const now = new Date();
        const msToExpire = transfer.expiresAt - now;
        if (msToExpire <= 2 * 60 * 1000) {
            transfer.expiresAt = new Date(transfer.expiresAt.getTime() + 5 * 60 * 1000);
        }
        await transfer.save();
        res.json({ message: 'Puja realizada', transfer });
        // Programar adjudicación si no está ya programada
        setTimeout(async () => {
            const t = await Transfer.findById(transfer._id);
            if (t.status === 'open' && t.expiresAt <= new Date()) {
                t.status = 'sold';
                await t.save();
                // Traspaso automático tras 2 minutos
                setTimeout(async () => {
                    const Team = require('./models/Team');
                    const team = await Team.findById(t.currentBidder);
                    if (team && (team.economy || 0) >= t.currentBid) {
                        // Añadir jugador al club
                        team.players.push({ ...t.player, club: undefined });
                        team.economy = (team.economy || 0) - t.currentBid;
                        await team.save();
                        // Marcar transfer como cerrado
                        t.status = 'closed';
                        await t.save();
                    }
                }, 2 * 60 * 1000);
            }
        }, transfer.expiresAt - now);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// Programar eliminatorias de selecciones nacionales tras la fase de grupos
async function scheduleNationalTeamKnockouts(season, type) {
    // type: 'mundial' o 'intercontinental'
    // const Match = require('./models/Match');
    // const NationalTeam = require('./models/NationalTeam');
    // Obtener todos los grupos (por cómo se crearon los partidos de grupos)
    // Suponemos que los partidos de grupos ya se han jugado y standings están disponibles
    // 1. Obtener los dos primeros de cada grupo
    // 2. Emparejar para cuartos, semifinales, final y tercer puesto
    // 3. Programar partidos directos

    // Obtener selecciones participantes
    const nationalTeams = await NationalTeam.find({ season, locked: true, manager: { $ne: null } });
    if (nationalTeams.length < 8) return;
    // Repetir el mismo agrupamiento que en la fase de grupos
    const shuffled = nationalTeams.sort(() => Math.random() - 0.5);
    const groups = [];
    for (let i = 0; i < shuffled.length; i += 8) {
        groups.push(shuffled.slice(i, i + 8));
    }
    // Obtener standings de cada grupo
    const groupWinners = [];
    for (const group of groups) {
        // Buscar partidos de grupo
        const teamIds = group.map(t => t._id.toString());
        const matches = await Match.find({
            type,
            homeTeam: { $in: teamIds },
            awayTeam: { $in: teamIds }
        });
        // Calcular standings
        const table = {};
        for (const tid of teamIds) {
            table[tid] = { team: tid, points: 0, goalDiff: 0, goalsFor: 0 };
        }
        for (const m of matches) {
            if (typeof m.homeGoals === 'number' && typeof m.awayGoals === 'number') {
                table[m.homeTeam.toString()].goalsFor += m.homeGoals;
                table[m.homeTeam.toString()].goalDiff += m.homeGoals - m.awayGoals;
                table[m.awayTeam.toString()].goalsFor += m.awayGoals;
                table[m.awayTeam.toString()].goalDiff += m.awayGoals - m.homeGoals;
                if (m.homeGoals > m.awayGoals) {
                    table[m.homeTeam.toString()].points += 3;
                } else if (m.homeGoals < m.awayGoals) {
                    table[m.awayTeam.toString()].points += 3;
                } else {
                    table[m.homeTeam.toString()].points += 1;
                    table[m.awayTeam.toString()].points += 1;
                }
            }
        }
        const standings = Object.values(table).sort((a, b) =>
            b.points - a.points || b.goalDiff - a.goalDiff || b.goalsFor - a.goalsFor
        );
        if (standings[0]) groupWinners.push(standings[0].team);
        if (standings[1]) groupWinners.push(standings[1].team);
    }
    // Emparejar para cuartos de final (8 equipos)
    if (groupWinners.length < 8) return;
    const quarterPairs = [
        [groupWinners[0], groupWinners[7]],
        [groupWinners[1], groupWinners[6]],
        [groupWinners[2], groupWinners[5]],
        [groupWinners[3], groupWinners[4]]
    ];
    const nextMatchDate = getNextMatchDate(type);
    // Cuartos de final
    const quarterMatches = [];
    for (const [a, b] of quarterPairs) {
        const match = await Match.create({
            homeTeam: a,
            awayTeam: b,
            homeGoals: null,
            awayGoals: null,
            type,
            scheduledFor: nextMatchDate,
            lockedLineup: false,
            comments: []
        });
        quarterMatches.push(match);
    }

    // Automatizar semifinales, final y tercer puesto tras cada ronda
    // Esperar a que se jueguen los cuartos (simulación: 7 días después)
    setTimeout(async () => {
        // Obtener ganadores de cuartos
        const playedQuarters = await Match.find({
            _id: { $in: quarterMatches.map(m => m._id) },
            homeGoals: { $ne: null },
            awayGoals: { $ne: null }
        });
        if (playedQuarters.length < 4) return; // Asegura que todos se jugaron
        const semiTeams = [];
        for (const m of playedQuarters) {
            if (m.homeGoals > m.awayGoals) semiTeams.push(m.homeTeam);
            else semiTeams.push(m.awayTeam);
        }
        // Semifinales
        const semiPairs = [
            [semiTeams[0], semiTeams[1]],
            [semiTeams[2], semiTeams[3]]
        ];
        const semiDate = getNextMatchDate(type);
        const semiMatches = [];
        for (const [a, b] of semiPairs) {
            const match = await Match.create({
                homeTeam: a,
                awayTeam: b,
                homeGoals: null,
                awayGoals: null,
                type,
                scheduledFor: semiDate,
                lockedLineup: false,
                comments: []
            });
            semiMatches.push(match);
        }
        // Esperar a que se jueguen las semifinales (simulación: 7 días después)
        setTimeout(async () => {
            const playedSemis = await Match.find({
                _id: { $in: semiMatches.map(m => m._id) },
                homeGoals: { $ne: null },
                awayGoals: { $ne: null }
            });
            if (playedSemis.length < 2) return;
            const finalists = [];
            const thirdPlace = [];
            for (const m of playedSemis) {
                if (m.homeGoals > m.awayGoals) finalists.push(m.homeTeam);
                else finalists.push(m.awayTeam);
                if (m.homeGoals > m.awayGoals) thirdPlace.push(m.awayTeam);
                else thirdPlace.push(m.homeTeam);
            }
            // Final
            const finalMatch = await Match.create({
                homeTeam: finalists[0],
                awayTeam: finalists[1],
                homeGoals: null,
                awayGoals: null,
                type,
                scheduledFor: getNextMatchDate(type),
                lockedLineup: false,
                comments: []
            });
            // Tercer puesto
            const thirdMatch = await Match.create({
                homeTeam: thirdPlace[0],
                awayTeam: thirdPlace[1],
                homeGoals: null,
                awayGoals: null,
                type,
                scheduledFor: getNextMatchDate(type),
                lockedLineup: false,
                comments: []
            });

            // Otorgar trofeos automáticamente tras la final y tercer puesto (simulación: 7 días después)
            setTimeout(async () => {
                const final = await Match.findById(finalMatch._id);
                const third = await Match.findById(thirdMatch._id);
                if (!final || !third) return;
                // Oro y plata
                let oro = null, plata = null;
                if (final.homeGoals > final.awayGoals) {
                    oro = final.homeTeam;
                    plata = final.awayTeam;
                } else {
                    oro = final.awayTeam;
                    plata = final.homeTeam;
                }
                // Bronce (ambos perdedores de semifinales)
                let bronces = [third.homeTeam, third.awayTeam];
                // Actualizar selecciones nacionales con trofeos
                await NationalTeam.findByIdAndUpdate(oro, { $push: { trophies: { type: 'oro', season, competition: type } } });
                await NationalTeam.findByIdAndUpdate(plata, { $push: { trophies: { type: 'plata', season, competition: type } } });
                for (const b of bronces) {
                    await NationalTeam.findByIdAndUpdate(b, { $push: { trophies: { type: 'bronce', season, competition: type } } });
                }
            }, 1000 * 60 * 60 * 24 * 7); // 7 días después de la final
        }, 1000 * 60 * 60 * 24 * 7); // 7 días después de semifinales
    }, 1000 * 60 * 60 * 24 * 7); // 7 días después de cuartos
}
// =====================
// GENERACIÓN Y PROGRAMACIÓN DE COMPETICIONES DE SELECCIONES NACIONALES
// =====================

// Llama esto al inicio de cada temporada
async function scheduleNationalTeamCompetitions(season) {
    // Solo a partir de la temporada 4
    if (season < 4) return;
    // Temporadas pares: alternar Mundial e Intercontinental
    let type = null;
    if (season % 2 === 0) {
        if ((season - 4) % 4 === 0) {
            type = 'mundial';
        } else if ((season - 6) % 4 === 0) {
            type = 'intercontinental';
        }
    }
    if (!type) return;
    // Selecciones nacionales cerradas y con manager
    const nationalTeams = await NationalTeam.find({ season, locked: true, manager: { $ne: null } });
    if (nationalTeams.length < 8) return; // Mínimo 8 selecciones
    // Mezclar y agrupar en grupos de 8
    const shuffled = nationalTeams.sort(() => Math.random() - 0.5);
    const groups = [];
    for (let i = 0; i < shuffled.length; i += 8) {
        groups.push(shuffled.slice(i, i + 8));
    }
    // Crear partidos de grupos (todos contra todos)
    const Match = require('./models/Match');
    for (const group of groups) {
        for (let i = 0; i < group.length; i++) {
            for (let j = i + 1; j < group.length; j++) {
                const home = group[i];
                const away = group[j];
                const fecha = getNextMatchDate(type);
                await Match.create({
                    homeTeam: home._id,
                    awayTeam: away._id,
                    homeGoals: 0,
                    awayGoals: 0,
                    type,
                    scheduledFor: fecha,
                    lockedLineup: false,
                    comments: []
                });
            }
        }
    }
    // Después de la fase de grupos, programar eliminatorias (los 2 primeros de cada grupo)
    // Llamada automática tras la fase de grupos
    setTimeout(async () => {
        await scheduleNationalTeamKnockouts(season, type);
    }, 1000 * 60 * 60 * 24 * 7); // 7 días después (ajusta según la duración real de la fase de grupos)
}

// Puedes llamar a scheduleNationalTeamCompetitions(season) al crear la nueva temporada
// =====================
// ELECCIÓN DE JUGADORES PARA SELECCIÓN NACIONAL
// =====================

// Añadir jugadores a la selección nacional (solo seleccionador, solo durante la semana de selección)
app.post('/api/national-teams/add-players', auth, async (req, res) => {
    try {
        const { country, season, players } = req.body; // players: array de objetos {name, position, rating, club}
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
        const nationalTeam = await NationalTeam.findOne({ country, season });
        if (!nationalTeam) return res.status(404).json({ error: 'Selección nacional no encontrada' });
        if (nationalTeam.manager.toString() !== user._id.toString()) {
            return res.status(403).json({ error: 'Solo el seleccionador puede elegir jugadores' });
        }
        if (nationalTeam.locked) {
            return res.status(400).json({ error: 'La selección ya está cerrada' });
        }
        const now = new Date();
        if (now > nationalTeam.selectionOpenUntil) {
            nationalTeam.locked = true;
            await nationalTeam.save();
            return res.status(400).json({ error: 'El plazo para elegir jugadores ha finalizado' });
        }
        // Solo jugadores del país y máximo 18
        if (players.length > 18) return res.status(400).json({ error: 'Máximo 18 jugadores' });
        // Validar que todos los jugadores sean del país
        for (const p of players) {
            const club = await Team.findById(p.club);
            if (!club || club.country !== country) {
                return res.status(400).json({ error: `El jugador ${p.name} no pertenece a un club del país` });
            }
        }
        nationalTeam.players = players;
        await nationalTeam.save();
        res.json({ message: 'Jugadores seleccionados', nationalTeam });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Cerrar selección nacional manualmente (opcional, solo seleccionador)
app.post('/api/national-teams/lock', auth, async (req, res) => {
    try {
        const { country, season } = req.body;
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
        const nationalTeam = await NationalTeam.findOne({ country, season });
        if (!nationalTeam) return res.status(404).json({ error: 'Selección nacional no encontrada' });
        if (nationalTeam.manager.toString() !== user._id.toString()) {
            return res.status(403).json({ error: 'Solo el seleccionador puede cerrar la selección' });
        }
        nationalTeam.locked = true;
        await nationalTeam.save();
        res.json({ message: 'Selección nacional cerrada', nationalTeam });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// =====================
// POSTULACIÓN Y VOTACIÓN SELECCIONADOR NACIONAL
// =====================

// Postularse a seleccionador nacional
app.post('/api/national-candidacies', auth, async (req, res) => {
    try {
        const { country, season } = req.body;
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
        // Solo managers premium pueden postularse a cualquier país
        if (!user.premium && user.country !== country) {
            return res.status(403).json({ error: 'Solo managers premium pueden postularse a otros países' });
        }
        // No duplicar candidatura
        const exists = await NationalCandidacy.findOne({ country, season, user: user._id });
        if (exists) return res.status(400).json({ error: 'Ya estás postulado para esta selección y temporada' });
        const candidacy = new NationalCandidacy({ country, season, user: user._id, isPremium: !!user.premium });
        await candidacy.save();
        res.status(201).json({ message: 'Candidatura registrada', candidacy });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Listar candidaturas de un país y temporada
app.get('/api/national-candidacies', async (req, res) => {
    try {
        const { country, season } = req.query;
        const candidacies = await NationalCandidacy.find({ country, season }).populate('user', 'username premium');
        res.json(candidacies);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Votar a seleccionador nacional
app.post('/api/national-votes', auth, async (req, res) => {
    try {
        const { country, season, candidate } = req.body;
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
        // Solo managers del país pueden votar a su seleccionador
        if (user.country !== country) {
            return res.status(403).json({ error: 'Solo managers del país pueden votar a su seleccionador' });
        }
        // No duplicar voto
        const alreadyVoted = await NationalVote.findOne({ country, season, voter: user._id });
        if (alreadyVoted) return res.status(400).json({ error: 'Ya has votado para esta selección y temporada' });
        const vote = new NationalVote({ country, season, voter: user._id, candidate });
        await vote.save();
        res.status(201).json({ message: 'Voto registrado', vote });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Listar votos de un país y temporada
app.get('/api/national-votes', async (req, res) => {
    try {
        const { country, season } = req.query;
        const votes = await NationalVote.find({ country, season }).populate('voter', 'username').populate('candidate', 'username');
        res.json(votes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Recuento y asignación de seleccionador nacional
app.post('/api/national-teams/assign-manager', async (req, res) => {
    try {
        const { country, season } = req.body;
        // Contar votos por candidato
        const votes = await NationalVote.find({ country, season });
        const count = {};
        for (const v of votes) {
            count[v.candidate] = (count[v.candidate] || 0) + 1;
        }
        // Buscar el candidato más votado
        let winner = null;
        let maxVotes = 0;
        for (const [candidate, num] of Object.entries(count)) {
            if (num > maxVotes) {
                winner = candidate;
                maxVotes = num;
            }
        }
        if (!winner) return res.status(400).json({ error: 'No hay votos para esta selección' });
        // Crear o actualizar la selección nacional
        let nationalTeam = await NationalTeam.findOne({ country, season });
        if (!nationalTeam) {
            nationalTeam = new NationalTeam({ country, season, manager: winner, players: [], locked: false });
        } else {
            nationalTeam.manager = winner;
            nationalTeam.players = [];
            nationalTeam.locked = false;
        }
        // Dar una semana para elegir jugadores
        const now = new Date();
        nationalTeam.selectionOpenUntil = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        await nationalTeam.save();
        res.json({ message: 'Seleccionador asignado', nationalTeam });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// Automatizar el cierre de temporada: ascensos, descensos, premios, trofeos y semana de descanso
async function closeSeasonAndRebuildDivisions(season = 1, region = 'europa') {
    const Division = require('./models/Division');
    // const Team = require('./models/Team');
    // Procesar ascensos, descensos y promociones
    await processPromotionsAndRelegations(season, region);

    // Otorgar premios y trofeos a los clubes según clasificación
    const divisions = await Division.find({ season, country: region });
    for (const division of divisions) {
        for (const group of division.groups) {
            const standings = await getGroupStandings(group);
            if (standings.length > 0) {
                // 1º: Trofeo oro
                await Team.findByIdAndUpdate(standings[0].team, { $push: { trophies: { type: 'oro', season, division: division.name } } });
            }
            if (standings.length > 1) {
                // 2º: Trofeo plata
                await Team.findByIdAndUpdate(standings[1].team, { $push: { trophies: { type: 'plata', season, division: division.name } } });
            }
            if (standings.length > 2) {
                // 3º: Trofeo bronce
                await Team.findByIdAndUpdate(standings[2].team, { $push: { trophies: { type: 'bronce', season, division: division.name } } });
            }
            // Puedes añadir premios económicos o de otro tipo aquí
        }
    }

    // Semana de descanso: guardar la fecha de inicio de la próxima temporada una semana después
    const now = new Date();
    const nextSeasonStart = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // +7 días
    // Puedes guardar esta fecha en una colección de configuración global o en cada división

    // Crear nueva temporada (puedes incrementar el número de temporada y clonar la estructura)
    const nextSeason = season + 1;
    const oldDivisions = await Division.find({ season, country: region });
    // Mapear divisiones nuevas por nivel y nombre para fácil acceso
    const newDivisions = await Division.find({ season: nextSeason, country: region });
    const divMap = {};
    for (const d of newDivisions) {
        divMap[`${d.level}-${d.name}`] = d;
    }

    // Programar automáticamente competiciones de selecciones nacionales si corresponde
    await scheduleNationalTeamCompetitions(nextSeason);
    // Mover equipos según la lógica de ascensos/descensos/promociones
    for (const oldDiv of oldDivisions) {
        for (let gIdx = 0; gIdx < oldDiv.groups.length; gIdx++) {
            const group = oldDiv.groups[gIdx];
            const standings = await getGroupStandings(group);
            // Ejemplo para Division I
            if (oldDiv.level === 1) {
                // 1º-4º se mantienen, 5º-6º a promoción, 7º-8º descienden
                for (let i = 0; i < standings.length; i++) {
                    const teamId = standings[i].team;
                    if (i < 4) {
                        // Se mantiene en Division I
                        const newDiv = divMap[`1-${oldDiv.name}`];
                        newDiv.groups[gIdx].teams.push(teamId);
                        await newDiv.save();
                    } else if (i < 6) {
                        // Promoción (puedes guardar en una lista especial)
                        // Aquí solo ejemplo: se mantiene
                        const newDiv = divMap[`1-${oldDiv.name}`];
                        newDiv.groups[gIdx].teams.push(teamId);
                        await newDiv.save();
                    } else {
                        // Desciende a Division II (grupo 0 por defecto)
                        const newDiv = divMap[`2-Division II`];
                        newDiv.groups[0].teams.push(teamId);
                        await newDiv.save();
                    }
                }
            }
            // Ejemplo para Division II
            if (oldDiv.level === 2) {
                // 1º asciende, 2º promoción, 3º-4º se mantienen, 5º-6º promoción, 7º-8º descienden
                for (let i = 0; i < standings.length; i++) {
                    const teamId = standings[i].team;
                    if (i === 0) {
                        // Asciende a Division I
                        const newDiv = divMap[`1-Division I`];
                        newDiv.groups[0].teams.push(teamId);
                        await newDiv.save();
                    } else if (i === 1 || i === 4 || i === 5) {
                        // Promoción (puedes guardar en una lista especial)
                        const newDiv = divMap[`2-${oldDiv.name}`];
                        newDiv.groups[gIdx].teams.push(teamId);
                        await newDiv.save();
                    } else if (i === 2 || i === 3) {
                        // Se mantiene
                        const newDiv = divMap[`2-${oldDiv.name}`];
                        newDiv.groups[gIdx].teams.push(teamId);
                        await newDiv.save();
                    } else {
                        // Desciende a Division III (grupo 0 por defecto)
                        const newDiv = divMap[`3-Division III`];
                        newDiv.groups[0].teams.push(teamId);
                        await newDiv.save();
                    }
                }
            }
            // Ejemplo para Division III
            if (oldDiv.level === 3) {
                // 1º asciende, 2º promoción, 3º-4º se mantienen, 5º-6º promoción, 7º-8º descienden
                for (let i = 0; i < standings.length; i++) {
                    const teamId = standings[i].team;
                    if (i === 0) {
                        // Asciende a Division II
                        const newDiv = divMap[`2-Division II`];
                        newDiv.groups[0].teams.push(teamId);
                        await newDiv.save();
                    } else if (i === 1 || i === 4 || i === 5) {
                        // Promoción (puedes guardar en una lista especial)
                        const newDiv = divMap[`3-${oldDiv.name}`];
                        newDiv.groups[gIdx].teams.push(teamId);
                        await newDiv.save();
                    } else if (i === 2 || i === 3) {
                        // Se mantiene
                        const newDiv = divMap[`3-${oldDiv.name}`];
                        newDiv.groups[gIdx].teams.push(teamId);
                        await newDiv.save();
                    } else {
                        // Desciende a Division IV (grupo 0 por defecto)
                        const newDiv = divMap[`4-Division IV`];
                        newDiv.groups[0].teams.push(teamId);
                        await newDiv.save();
                    }
                }
            }
            // Ejemplo para Division IV (puedes personalizar)
            if (oldDiv.level === 4) {
                // 1º asciende, 2º promoción, 3º-6º se mantienen, 7º-8º se mantienen
                for (let i = 0; i < standings.length; i++) {
                    const teamId = standings[i].team;
                    if (i === 0) {
                        // Asciende a Division III
                        const newDiv = divMap[`3-Division III`];
                        newDiv.groups[0].teams.push(teamId);
                        await newDiv.save();
                    } else if (i === 1) {
                        // Promoción
                        const newDiv = divMap[`4-${oldDiv.name}`];
                        newDiv.groups[gIdx].teams.push(teamId);
                        await newDiv.save();
                    } else {
                        // Se mantiene
                        const newDiv = divMap[`4-${oldDiv.name}`];
                        newDiv.groups[gIdx].teams.push(teamId);
                        await newDiv.save();
                    }
                }
            }
        }
    }
}
// Procesar ascensos, descensos y promociones al finalizar la temporada
async function processPromotionsAndRelegations(season = 1, region = 'europa') {
    const Division = require('./models/Division');
    // Buscar divisiones ordenadas por nivel (de mayor a menor)
    const divisions = await Division.find({ season, country: region }).sort({ level: 1 });
    for (let i = 0; i < divisions.length; i++) {
        const division = divisions[i];
        for (const group of division.groups) {
            // Suponemos que tienes una función getGroupStandings(group) que devuelve los equipos ordenados por posición
            const standings = await getGroupStandings(group); // Debes implementar esta función según tus reglas
            // Lógica de ascensos/descensos/promociones según la división
            if (division.level === 1) {
                // Division I: 7º y 8º descienden a Division II, 5º y 6º a promoción
                // 1º, 2º, 3º y 4º se mantienen
                // Aquí deberías mover los equipos a la división/grupo correspondiente
            } else if (division.level === 2) {
                // Division II: 1º asciende, 2º a promoción, 7º y 8º descienden
            } else if (division.level === 3) {
                // Division III: 1º asciende, 2º a promoción, 7º y 8º descienden
            } else if (division.level === 4) {
                // Division IV: 1º asciende, 2º a promoción, 7º y 8º se mantienen (o lógica personalizada)
            }
            // Aquí debes actualizar los arrays de teams en los grupos/divisiones destino
        }
    }
    // Al finalizar, guarda los cambios en las divisiones y equipos
}

// Calcula la clasificación real de un grupo según partidos jugados
async function getGroupStandings(group) {
    const Match = require('./models/Match');
    // Inicializar tabla
    const table = {};
    for (const teamId of group.teams) {
        table[teamId.toString()] = {
            team: teamId,
            points: 0,
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            goalDiff: 0
        };
    }
    // Buscar partidos jugados de liga de este grupo
    const matches = await Match.find({
        type: 'liga',
        $or: [
            { homeTeam: { $in: group.teams } },
            { awayTeam: { $in: group.teams } }
        ]
    });
    for (const match of matches) {
        if (!match.homeTeam || !match.awayTeam) continue;
        const homeId = match.homeTeam.toString();
        const awayId = match.awayTeam.toString();
        // Solo contar partidos jugados (puedes añadir más lógica si lo deseas)
        if (typeof match.homeGoals === 'number' && typeof match.awayGoals === 'number') {
            table[homeId].played++;
            table[awayId].played++;
            table[homeId].goalsFor += match.homeGoals;
            table[homeId].goalsAgainst += match.awayGoals;
            table[awayId].goalsFor += match.awayGoals;
            table[awayId].goalsAgainst += match.homeGoals;
            table[homeId].goalDiff = table[homeId].goalsFor - table[homeId].goalsAgainst;
            table[awayId].goalDiff = table[awayId].goalsFor - table[awayId].goalsAgainst;
            if (match.homeGoals > match.awayGoals) {
                table[homeId].points += 3;
                table[homeId].won++;
                table[awayId].lost++;
            } else if (match.homeGoals < match.awayGoals) {
                table[awayId].points += 3;
                table[awayId].won++;
                table[homeId].lost++;
            } else {
                table[homeId].points += 1;
                table[awayId].points += 1;
                table[homeId].drawn++;
                table[awayId].drawn++;
            }
        }
    }
    // Ordenar por puntos, diferencia de goles, goles a favor
    const standings = Object.values(table).sort((a, b) =>
        b.points - a.points ||
        b.goalDiff - a.goalDiff ||
        b.goalsFor - a.goalsFor
    );
    return standings;
}
// =====================
// TORNEOS PERSONALIZADOS (solo managers premium)
// =====================

const tournamentSchema = new mongoose.Schema({
    name: String,
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    teams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }],
    status: { type: String, enum: ['pendiente', 'en juego', 'finalizado'], default: 'pendiente' },
    createdAt: { type: Date, default: Date.now },
});
const Tournament = mongoose.models.Tournament || mongoose.model('Tournament', tournamentSchema);

// Middleware para managers premium (genérico)
async function isPremium(req, res, next) {
    // const User = require('./models/User');
    const user = await User.findById(req.user.userId);
    if (!user || !user.premium) {
        return res.status(403).json({ error: 'Solo managers premium pueden acceder a esta función' });
    }
    next();
}

// Crear torneo personalizado (solo premium)
app.post('/api/tournaments', auth, async (req, res) => {
    try {
        // const User = require('./models/User');
        const user = await User.findById(req.user.userId);
        if (!user || !user.premium) {
            return res.status(403).json({ error: 'Esto es una opcion premium' });
        }
        const { name, teams } = req.body;
        const tournament = new Tournament({ name, creator: req.user.userId, teams });
        await tournament.save();
        res.status(201).json({ message: 'Torneo personalizado creado', tournament });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Listar torneos personalizados
app.get('/api/tournaments', auth, async (req, res) => {
    try {
        const tournaments = await Tournament.find().populate('creator', 'username').populate('teams', 'name');
        res.json(tournaments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// =====================
// PROGRAMACIÓN GLOBAL DE PARTIDOS AUTOMÁTICA
// =====================

// Ejemplo de función para obtener campeones de primera división (debería adaptarse a tu modelo real de ligas)
async function getChampionsCupTeams() {
    // const Team = require('./models/Team');
    // Aquí deberías filtrar por equipos campeones de 1º división de cada país
    // Por ahora, seleccionamos todos los equipos con un campo ficticio champion=true
    return await Team.find({ champion: true });
}

// Programar partidos de Champions Cup (solo campeones)
async function scheduleChampionsCup() {
    const Match = require('./models/Match');
    const teams = await getChampionsCupTeams();
    // Emparejar de dos en dos (puedes mejorar el sorteo según tus reglas)
    const shuffled = teams.sort(() => Math.random() - 0.5);
    for (let i = 0; i < shuffled.length - 1; i += 2) {
        const home = shuffled[i];
        const away = shuffled[i + 1];
        const fecha = getNextMatchDate('champions');
        const exists = await Match.findOne({
            $or: [
                { homeTeam: home._id, awayTeam: away._id, scheduledFor: fecha },
                { homeTeam: away._id, awayTeam: home._id, scheduledFor: fecha }
            ]
        });
        if (!exists) {
            const match = new Match({
                homeTeam: home._id,
                awayTeam: away._id,
                homeGoals: 0,
                awayGoals: 0,
                type: 'champions',
                scheduledFor: fecha,
                lockedLineup: false,
                comments: []
            });
            await match.save();
        }
    }
}

// Programar partidos de todas las competiciones automáticamente
// Devuelve el próximo lunes para torneos personalizados, considerando la ventana de 3 días desde el reto
function getNextMondayAfter(date) {
    const d = new Date(date);
    d.setDate(d.getDate() + 3); // Suma 3 días desde el reto
    const day = d.getDay();
    const daysUntilMonday = (1 - day + 7) % 7 || 7;
    d.setDate(d.getDate() + daysUntilMonday);
    d.setHours(12, 0, 0, 0);
    return d;
}

// Programar partidos de torneos personalizados (solo lunes, ventana de 3 días desde el reto)
async function scheduleCustomTournaments() {
    const Tournament = mongoose.models.Tournament || mongoose.model('Tournament');
    const Match = require('./models/Match');
    const tournaments = await Tournament.find({ status: 'pendiente' }).populate('teams');
    for (const t of tournaments) {
        // Si hay menos de 2 equipos, no se programa
        if (!t.teams || t.teams.length < 2) continue;
        // Emparejar de dos en dos
        const shuffled = t.teams.sort(() => Math.random() - 0.5);
        for (let i = 0; i < shuffled.length - 1; i += 2) {
            const home = shuffled[i];
            const away = shuffled[i + 1];
            // Usa la fecha de creación del torneo como referencia para la ventana de 3 días
            const fecha = getNextMondayAfter(t.createdAt);
            const exists = await Match.findOne({
                homeTeam: home._id, awayTeam: away._id, scheduledFor: fecha, type: 'torneo'
            });
            if (!exists) {
                const match = new Match({
                    homeTeam: home._id,
                    awayTeam: away._id,
                    homeGoals: 0,
                    awayGoals: 0,
                    type: 'torneo',
                    scheduledFor: fecha,
                    lockedLineup: false,
                    comments: []
                });
                await match.save();
            }
        }
        // Cambia el estado del torneo a "en juego" si ya tiene partidos programados
        t.status = 'en juego';
        await t.save();
    }
}

// Programar partidos de todas las competiciones automáticamente
async function scheduleAllCompetitions() {
    // Liga
    await scheduleLeagueRound('europa'); // Puedes iterar por regiones/ligas
    // Champions Cup
    await scheduleChampionsCup();
    // Torneos personalizados (lunes, ventana de 3 días)
    await scheduleCustomTournaments();
    // Aquí puedes añadir más: copa, worldcup, etc.
}

// Endpoint para lanzar la programación global (admin o cron job)
app.post('/api/schedule/all', async (req, res) => {
    try {
        await scheduleAllCompetitions();
        res.json({ message: 'Programación global de partidos completada' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// =====================
// EMPAREJAMIENTO Y JORNADAS DE LIGA
// =====================

// Empareja equipos por grupo/división y programa partidos para la próxima jornada
async function scheduleLeagueRound(region = 'europa', season = 1) {
    const Division = require('./models/Division');
    const Match = require('./models/Match');
    // Buscar todas las divisiones activas para la temporada y región
    const divisions = await Division.find({ season, country: region });
    for (const division of divisions) {
        for (const group of division.groups) {
            if (!group.teams || group.teams.length < 2) continue;
            // Mezclar aleatoriamente los equipos del grupo
            const shuffled = group.teams.sort(() => Math.random() - 0.5);
            for (let i = 0; i < shuffled.length - 1; i += 2) {
                const home = shuffled[i];
                const away = shuffled[i + 1];
                const fecha = getNextMatchDate('liga', region);
                // Verificar que no tengan ya partido programado para esa fecha
                const exists = await Match.findOne({
                    $or: [
                        { homeTeam: home, awayTeam: away, scheduledFor: fecha },
                        { homeTeam: away, awayTeam: home, scheduledFor: fecha }
                    ]
                });
                if (!exists) {
                    const match = new Match({
                        homeTeam: home,
                        awayTeam: away,
                        homeGoals: 0,
                        awayGoals: 0,
                        type: 'liga',
                        scheduledFor: fecha,
                        lockedLineup: false,
                        comments: []
                    });
                    await match.save();
                }
            }
            // Si hay un equipo impar, queda libre esa jornada
        }
    }
}

// Endpoint para lanzar la programación de la próxima jornada de liga (admin o automático)
app.post('/api/league/schedule-round', async (req, res) => {
    try {
        await scheduleLeagueRound(req.body.region || 'europa');
        res.json({ message: 'Jornada de liga programada' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// =====================
// UTILIDADES DE CALENDARIO Y PROGRAMACIÓN DE PARTIDOS
// =====================

// Días de la semana: 0=Domingo, 1=Lunes, ... 6=Sábado
const SCHEDULE = {
    liga: [2, 6], // Martes (2) y Sábado (6)
    amistoso: [3],   // Miércoles (3)
    copa: [3],   // Miércoles (3) (si sigue en copa, no amistoso)
    champions: [4], // Jueves (4)
    worldcup: [5],  // Viernes (5)
    torneo: [1],   // Lunes (1)
};

// Horarios por región (ejemplo, puedes ampliar)
const REGION_HOURS = {
    oceania: { day: 6, start: '10:00', end: '12:00' },
    asia: { day: 6, start: '12:30', end: '14:30' },
    europa: { day: 6, start: '16:00', end: '20:00' },
    sudamerica: { day: 0, start: '00:30', end: '02:30' },
    norteamerica: { day: 0, start: '03:00', end: '04:00' },
    africa: { day: 0, start: '15:00', end: '17:00' },
};

// Devuelve la próxima fecha para un tipo de partido
function getNextMatchDate(type, region) {
    const now = new Date();
    const days = SCHEDULE[type] || [];
    if (days.length === 0) return null;
    let nextDate = new Date(now);
    let found = false;
    for (let i = 1; i <= 7 && !found; i++) {
        nextDate.setDate(now.getDate() + i);
        if (days.includes(nextDate.getDay())) found = true;
    }
    // Si hay horario por región, ajusta la hora
    if (region && REGION_HOURS[region]) {
        const { start } = REGION_HOURS[region];
        const [h, m] = start.split(':');
        nextDate.setHours(Number(h), Number(m), 0, 0);
    } else {
        nextDate.setHours(12, 0, 0, 0); // Por defecto, mediodía
    }
    return nextDate;
}

// Ejemplo de uso para programar un partido de liga para un equipo europeo:
// const fecha = getNextMatchDate('liga', 'europa');

// =====================
// FIN UTILIDADES DE CALENDARIO
// =====================
// Utilidad: ¿Se puede cambiar la alineación?
function canEditLineup(match) {
    if (!match.scheduledFor) return true;
    const now = new Date();
    const lockTime = new Date(match.scheduledFor);
    lockTime.setHours(lockTime.getHours() - 2);
    return now < lockTime && !match.lockedLineup;
}

// Endpoint para actualizar alineación (solo si está permitido)
app.put('/api/matches/:id/lineup', auth, async (req, res) => {
    try {
        const match = await Match.findById(req.params.id);
        if (!match) return res.status(404).json({ error: 'Partido no encontrado' });
        if (!canEditLineup(match)) return res.status(400).json({ error: 'No se puede cambiar la alineación a menos de 2 horas del partido o ya está bloqueada.' });
        const { lineup, teamType } = req.body; // teamType: 'home' o 'away'
        if (teamType === 'home') {
            match.homeLineup = lineup;
        } else if (teamType === 'away') {
            match.awayLineup = lineup;
        } else {
            return res.status(400).json({ error: 'teamType debe ser "home" o "away"' });
        }
        await match.save();
        res.json({ message: 'Alineación actualizada', match });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Endpoint para bloquear alineación manualmente (opcional, para uso del sistema)
app.post('/api/matches/:id/lock-lineup', async (req, res) => {
    try {
        const match = await Match.findById(req.params.id);
        if (!match) return res.status(404).json({ error: 'Partido no encontrado' });
        match.lockedLineup = true;
        await match.save();
        res.json({ message: 'Alineación bloqueada', match });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


// const app = express();
app.use(cors());
app.use(express.json());

// (Eliminado: declaración duplicada)

// Modelos
// const User = require('./models/User');
// const Team = require('./models/Team');
// const NationalTeam = require('./models/NationalTeam');
const NationalCandidacy = require('./models/NationalCandidacy');
const NationalVote = require('./models/NationalVote');
// const auth = require('./middleware/auth');
// const Match = require('./models/Match');
const FriendlyMatch = require('./models/FriendlyMatch');
// Función para obtener el próximo miércoles
function getNextWednesday() {
    const now = new Date();
    const day = now.getDay();
    const daysUntilWednesday = (3 - day + 7) % 7 || 7;
    const nextWednesday = new Date(now);
    nextWednesday.setDate(now.getDate() + daysUntilWednesday);
    nextWednesday.setHours(12, 0, 0, 0); // Mediodía
    return nextWednesday;
}

// Solicitar partido amistoso
app.post('/api/friendlies/request', auth, async (req, res) => {
    try {
        const { opponentId, teamRequesterId, teamOpponentId } = req.body;
        // Verificar que el usuario no tenga un amistoso pendiente o aceptado para la próxima semana
        const nextWednesday = getNextWednesday();
        const alreadyRequested = await FriendlyMatch.findOne({
            $or: [
                { requester: req.user.userId },
                { opponent: req.user.userId }
            ],
            scheduledFor: nextWednesday,
            status: { $in: ['pendiente', 'aceptado'] }
        });
        if (alreadyRequested) {
            return res.status(400).json({ error: 'Ya tienes un amistoso pendiente o aceptado para el próximo miércoles' });
        }
        const friendly = new FriendlyMatch({
            requester: req.user.userId,
            opponent: opponentId,
            teamRequester: teamRequesterId,
            teamOpponent: teamOpponentId,
            scheduledFor: nextWednesday
        });
        await friendly.save();

        // Lógica de colección de banderas (solo premium)
        const requester = await User.findById(req.user.userId);
        const opponent = await User.findById(opponentId);
        if (requester && requester.premium && opponent && opponent.country) {
            if (!requester.flags.includes(opponent.country)) {
                requester.flags.push(opponent.country);
                await requester.save();
            }
        }

        res.status(201).json({ message: 'Solicitud de amistoso enviada', friendly });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Aceptar partido amistoso
app.post('/api/friendlies/accept/:id', auth, async (req, res) => {
    try {
        const friendly = await FriendlyMatch.findById(req.params.id);
        if (!friendly) return res.status(404).json({ error: 'Amistoso no encontrado' });
        if (friendly.opponent.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'No autorizado para aceptar este amistoso' });
        }
        if (friendly.status !== 'pendiente') {
            return res.status(400).json({ error: 'El amistoso ya fue aceptado o jugado' });
        }
        friendly.status = 'aceptado';
        await friendly.save();
        res.json({ message: 'Amistoso aceptado', friendly });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Listar amistosos del usuario
app.get('/api/friendlies', auth, async (req, res) => {
    try {
        const friendlies = await FriendlyMatch.find({
            $or: [
                { requester: req.user.userId },
                { opponent: req.user.userId }
            ]
        })
            .populate('requester', 'username')
            .populate('opponent', 'username')
            .populate('teamRequester', 'name')
            .populate('teamOpponent', 'name')
            .sort({ scheduledFor: -1 });
        res.json(friendlies);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Simulación simple de partido
function simulateMatch(homePlayers, awayPlayers) {
    const homeRating = homePlayers.reduce((sum, p) => sum + (p.rating || 50), 0) / (homePlayers.length || 1);
    const awayRating = awayPlayers.reduce((sum, p) => sum + (p.rating || 50), 0) / (awayPlayers.length || 1);
    // Probabilidad simple basada en rating
    const homeGoals = Math.max(0, Math.round((Math.random() + homeRating / (homeRating + awayRating)) * 3));
    const awayGoals = Math.max(0, Math.round((Math.random() + awayRating / (homeRating + awayRating)) * 3));
    return { homeGoals, awayGoals };
}

// Crear partido entre dos equipos (protegido)
app.post('/api/matches', auth, async (req, res) => {
    try {
        const { homeTeamId, awayTeamId } = req.body;
        if (homeTeamId === awayTeamId) return res.status(400).json({ error: 'No puedes enfrentar el mismo equipo' });
        const homeTeam = await Team.findById(homeTeamId);
        const awayTeam = await Team.findById(awayTeamId);
        if (!homeTeam || !awayTeam) return res.status(404).json({ error: 'Equipo no encontrado' });
        const { homeGoals, awayGoals } = simulateMatch(homeTeam.players, awayTeam.players);
        const match = new Match({ homeTeam: homeTeam._id, awayTeam: awayTeam._id, homeGoals, awayGoals });
        await match.save();
        res.status(201).json({ message: 'Partido jugado', match });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Listar partidos
app.get('/api/matches', async (req, res) => {
    try {
        const matches = await Match.find().populate('homeTeam', 'name').populate('awayTeam', 'name').sort({ playedAt: -1 });
        res.json(matches);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// (Eliminado: bloque duplicado de conexión y ruta raíz)

// Ruta para registrar usuario

// Registro seguro de usuario y asignación de equipo BOT
app.post('/api/users', async (req, res) => {
    try {
        const { username, email, password, country } = req.body;
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ error: 'Usuario o email ya existe' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, email, password: hashedPassword });
        await user.save();

        // Buscar el mejor equipo BOT disponible del país (1ª división primero, luego inferiores)
        const botTeam = await Team.findOne({ owner: null, country }).sort({ division: 1, group: 1 });
        if (botTeam) {
            botTeam.owner = user._id;
            await botTeam.save();
        }

        res.status(201).json({ message: 'Usuario registrado', user: { username, email, _id: user._id }, team: botTeam });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Login de usuario
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Usuario o contraseña incorrectos' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Usuario o contraseña incorrectos' });
        }
        const token = jwt.sign({ userId: user._id, username: user.username }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
        res.json({ token, user: { username: user.username, email: user.email, _id: user._id } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Ruta para listar usuarios
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find({}, '-password'); // No mostrar contraseñas
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Ruta para crear un equipo (protegida y programa primer partido de liga)
app.post('/api/teams', auth, async (req, res) => {
    try {
        const { name, players, region } = req.body;
        const owner = req.user.userId;
        const team = new Team({ name, owner, players });
        await team.save();

        // Programar primer partido de liga automáticamente
        // (En un sistema real, aquí buscarías un rival disponible en la misma liga)
        const Match = require('./models/Match');
        const fecha = getNextMatchDate('liga', region || 'europa');
        // Por ahora, el rival es null (debería emparejarse con otro equipo real)
        const match = new Match({
            homeTeam: team._id,
            awayTeam: team._id, // Placeholder, debe ser reemplazado por un rival real
            homeGoals: 0,
            awayGoals: 0,
            type: 'liga',
            scheduledFor: fecha,
            lockedLineup: false,
            comments: []
        });
        await match.save();

        res.status(201).json({ message: 'Equipo creado y primer partido de liga programado', team, match });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Ruta para listar equipos
app.get('/api/teams', async (req, res) => {
    try {
        const teams = await Team.find().populate('owner', 'username email');
        res.json(teams);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

server.listen(PORT, () => {
    console.log(`Servidor backend escuchando en puerto ${PORT}`);
});
