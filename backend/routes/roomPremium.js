// Reto logo/tour: presidente reta a otra sala, 5 partidos entre líderes
// Añadimos restricción: una sala solo puede tener un reto pendiente a la vez
const pendingChallenges = new Set(); // En memoria, para demo. En producción, usar DB/campo en Room.
router.post('/:roomId/challenge/:targetRoomId', requirePremium, async (req, res) => {
    try {
        const { roomId, targetRoomId } = req.params;
        const Room = require('../models/Room');
        const Team = require('../models/Team');
        const Match = require('../models/Match');
        const User = require('../models/User');
        const room = await Room.findById(roomId);
        const targetRoom = await Room.findById(targetRoomId);
        if (!room || !targetRoom) return res.status(404).json({ error: 'Sala no encontrada.' });
        if (String(room.owner) !== req.user.userId) return res.status(403).json({ error: 'Solo el presidente puede retar.' });
        if (!room.logo || !targetRoom.logo) return res.status(400).json({ error: 'Ambas salas deben tener logo.' });
        if (room.logosWon.includes(targetRoom.logo)) return res.status(400).json({ error: 'Ya tienes el logo de esa sala.' });
        if (room.leaders.length !== 5 || targetRoom.leaders.length !== 5) return res.status(400).json({ error: 'Ambas salas deben tener 5 líderes.' });
        // Restricción: la sala retada no puede tener reto pendiente
        if (pendingChallenges.has(targetRoomId)) return res.status(400).json({ error: 'La sala retada ya tiene un reto pendiente.' });
        pendingChallenges.add(targetRoomId);
        // Obtener equipos de los líderes (asumimos que cada user tiene un equipo principal)
        const getMainTeam = async (userId) => await Team.findOne({ owner: userId });
        const roomTeams = await Promise.all(room.leaders.map(getMainTeam));
        const targetTeams = await Promise.all(targetRoom.leaders.map(getMainTeam));
        if (roomTeams.includes(null) || targetTeams.includes(null)) {
            pendingChallenges.delete(targetRoomId);
            return res.status(400).json({ error: 'Todos los líderes deben tener equipo.' });
        }
        // Emparejar aleatoriamente
        const shuffled = [...targetTeams];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        // Crear 5 partidos neutrales (tipo: 'logo_tour')
        const now = new Date();
        let wins = 0, losses = 0;
        for (let i = 0; i < 5; i++) {
            // Simulación simple: resultado aleatorio (puedes mejorar la lógica)
            const homeGoals = Math.floor(Math.random() * 5);
            const awayGoals = Math.floor(Math.random() * 5);
            if (homeGoals > awayGoals) wins++;
            else if (homeGoals < awayGoals) losses++;
            await Match.create({
                homeTeam: roomTeams[i]._id,
                awayTeam: shuffled[i]._id,
                homeGoals,
                awayGoals,
                type: 'logo_tour',
                scheduledFor: now,
                lockedLineup: true,
                comments: [],
                playedAt: now
            });
        }
        // Si la sala retadora gana más partidos, consigue el logo
        let result = 'empate';
        if (wins > losses) {
            room.logosWon.push(targetRoom.logo);
            await room.save();
            result = 'ganado';
        } else if (losses > wins) {
            result = 'perdido';
        }
        pendingChallenges.delete(targetRoomId);
        res.json({ result, wins, losses, logo: result === 'ganado' ? targetRoom.logo : null });
    } catch (err) {
        pendingChallenges.delete(req.params.targetRoomId);
        res.status(500).json({ error: err.message });
    }
});

// Endpoint para visualizar la vitrina de logos de una sala
router.get('/:roomId/trophy-cabinet', async (req, res) => {
    try {
        const Room = require('../models/Room');
        const room = await Room.findById(req.params.roomId);
        if (!room) return res.status(404).json({ error: 'Sala no encontrada.' });
        res.json({
            logo: room.logo,
            logosWon: room.logosWon,
            vipLogos: room.vipLogos
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const User = require('../models/User');

// Middleware para verificar premium
async function requirePremium(req, res, next) {
    const user = await User.findById(req.user.userId);
    if (!user || !user.premium) {
        return res.status(403).json({ error: 'Solo usuarios premium pueden realizar esta acción.' });
    }
    next();
}

// Crear sala premium: nombre, palabras clave para logos IA
router.post('/create', requirePremium, async (req, res) => {
    try {
        const { name, keywords } = req.body;
        if (!name || !keywords || !Array.isArray(keywords) || keywords.length === 0) {
            return res.status(400).json({ error: 'Nombre y palabras clave requeridos.' });
        }
        // Comprobar si el usuario ya es presidente de una sala
        const existing = await Room.findOne({ owner: req.user.userId });
        if (existing) return res.status(400).json({ error: 'Ya eres presidente de una sala.' });
        // Generar 10 logos IA (simulado: URLs de ejemplo)
        const logoOptions = keywords.slice(0, 3).map(k => k.toLowerCase());
        const logos = Array.from({ length: 10 }, (_, i) => `https://api.dummylogo.ai/${logoOptions.join('-')}-${i + 1}.png`);
        // Crear sala premium
        const room = new Room({
            name,
            owner: req.user.userId,
            isPremium: true,
            members: [req.user.userId],
            leaders: [],
            logoOptions: logos,
            logosWon: [],
            vipLogos: 0,
            points: 0
        });
        await room.save();
        res.json({ room });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Elegir logo definitivo para la sala
router.post('/:roomId/choose-logo', requirePremium, async (req, res) => {
    try {
        const { logo } = req.body;
        const room = await Room.findById(req.params.roomId);
        if (!room) return res.status(404).json({ error: 'Sala no encontrada.' });
        if (String(room.owner) !== req.user.userId) return res.status(403).json({ error: 'Solo el presidente puede elegir el logo.' });
        if (!room.logoOptions.includes(logo)) return res.status(400).json({ error: 'Logo no válido.' });
        room.logo = logo;
        room.logoOptions = [];
        await room.save();
        res.json({ success: true, logo });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Añadir/quitar miembros (solo presidente, máx 10)
router.post('/:roomId/add-member', requirePremium, async (req, res) => {
    try {
        const { userId } = req.body;
        const room = await Room.findById(req.params.roomId);
        if (!room) return res.status(404).json({ error: 'Sala no encontrada.' });
        if (String(room.owner) !== req.user.userId) return res.status(403).json({ error: 'Solo el presidente puede añadir miembros.' });
        if (room.members.length >= 10) return res.status(400).json({ error: 'La sala ya está completa.' });
        if (room.members.includes(userId)) return res.status(400).json({ error: 'Ya es miembro.' });
        room.members.push(userId);
        await room.save();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/:roomId/remove-member', requirePremium, async (req, res) => {
    try {
        const { userId } = req.body;
        const room = await Room.findById(req.params.roomId);
        if (!room) return res.status(404).json({ error: 'Sala no encontrada.' });
        if (String(room.owner) !== req.user.userId) return res.status(403).json({ error: 'Solo el presidente puede quitar miembros.' });
        room.members = room.members.filter(id => String(id) !== userId);
        // Si era líder, quitarlo de leaders
        room.leaders = room.leaders.filter(id => String(id) !== userId);
        await room.save();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Nombrar líderes (solo presidente, máx 5, solo 1 vez por temporada)
router.post('/:roomId/set-leaders', requirePremium, async (req, res) => {
    try {
        const { leaderIds } = req.body;
        const room = await Room.findById(req.params.roomId);
        if (!room) return res.status(404).json({ error: 'Sala no encontrada.' });
        if (String(room.owner) !== req.user.userId) return res.status(403).json({ error: 'Solo el presidente puede nombrar líderes.' });
        if (!Array.isArray(leaderIds) || leaderIds.length !== 5) return res.status(400).json({ error: 'Debes indicar 5 líderes.' });
        // Solo miembros pueden ser líderes
        for (const id of leaderIds) {
            if (!room.members.map(String).includes(String(id))) {
                return res.status(400).json({ error: 'Todos los líderes deben ser miembros de la sala.' });
            }
        }
        // TODO: Restringir a solo 1 vez por temporada (requiere campo extra)
        room.leaders = leaderIds;
        await room.save();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
