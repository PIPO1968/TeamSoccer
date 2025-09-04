const express = require('express');
const router = express.Router();
const Room = require('../models/Room');

// Estadísticas de una sala
router.get('/:roomId/statistics', async (req, res) => {
    try {
        const room = await Room.findById(req.params.roomId).populate('members', 'username');
        if (!room) return res.status(404).json({ error: 'Sala no encontrada' });
        const stats = {
            totalMessages: room.messages.length,
            totalMembers: room.members.length,
            points: room.points,
            leaders: room.leaders.length,
            createdAt: room.createdAt,
            isPremium: room.isPremium
        };
        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener estadísticas de la sala' });
    }
});

module.exports = router;
