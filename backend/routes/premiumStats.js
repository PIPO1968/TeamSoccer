// Endpoint premium: estadísticas detalladas de equipo y jugadores
const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const User = require('../models/User');

// Estadísticas detalladas de un equipo (solo premium)
router.get('/team/:id/detailed-stats', async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user || !user.premium) {
            return res.status(403).json({ error: 'Esto es una opcion premium' });
        }
        const team = await Team.findById(req.params.id);
        if (!team) {
            return res.status(404).json({ error: 'Equipo no encontrado' });
        }
        // Ejemplo de estadísticas detalladas
        const stats = {
            mediaRating: team.players.reduce((a, p) => a + (p.rating || 0), 0) / (team.players.length || 1),
            maxRating: Math.max(...team.players.map(p => p.rating || 0)),
            minRating: Math.min(...team.players.map(p => p.rating || 0)),
            jugadores: team.players.map(p => ({ nombre: p.name, rating: p.rating, posicion: p.position }))
        };
        res.json({ stats });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
