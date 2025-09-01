// Endpoint premium: Multi/Match Viewer para ver varios partidos en directo
const express = require('express');
const router = express.Router();
const Match = require('../models/Match');
const User = require('../models/User');

// Ver varios partidos en directo (solo premium)
router.post('/viewer', async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user || !user.premium) {
            return res.status(403).json({ error: 'Esto es una opcion premium' });
        }
        const { matchIds } = req.body; // Array de IDs de partidos
        if (!Array.isArray(matchIds) || matchIds.length === 0) {
            return res.status(400).json({ error: 'Debes indicar al menos un partido' });
        }
        const matches = await Match.find({ _id: { $in: matchIds } });
        res.json({ matches });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
