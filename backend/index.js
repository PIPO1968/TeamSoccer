// Automatizar el cierre de temporada: ascensos, descensos, premios, trofeos y semana de descanso
async function closeSeasonAndRebuildDivisions(season = 1, region = 'europa') {
    const Division = require('./models/Division');
    const Team = require('./models/Team');
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

// Middleware para managers premium
async function isPremium(req, res, next) {
    const User = require('./models/User');
    const user = await User.findById(req.user.userId);
    if (!user || !user.premium) {
        return res.status(403).json({ error: 'Solo managers premium pueden crear torneos personalizados' });
    }
    next();
}

// Crear torneo personalizado (solo premium)
app.post('/api/tournaments', auth, isPremium, async (req, res) => {
    try {
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
    const Team = require('./models/Team');
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
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/teamsoccer';

// Modelos
const User = require('./models/User');
const Team = require('./models/Team');
const auth = require('./middleware/auth');
const Match = require('./models/Match');
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

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB conectado'))
    .catch((err) => console.error('Error conectando a MongoDB:', err));

app.get('/', (req, res) => {
    res.send('API TeamSoccer funcionando');
});

// Ruta para registrar usuario

// Registro seguro de usuario
app.post('/api/users', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ error: 'Usuario o email ya existe' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, email, password: hashedPassword });
        await user.save();
        res.status(201).json({ message: 'Usuario registrado', user: { username, email, _id: user._id } });
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

app.listen(PORT, () => {
    console.log(`Servidor backend escuchando en puerto ${PORT}`);
});
