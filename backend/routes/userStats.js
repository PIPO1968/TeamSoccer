const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Devuelve el número de managers activos (usuarios registrados)
router.get('/active', async (req, res) => {
    try {
        const count = await User.countDocuments();
        res.json({ activeManagers: count });
    } catch (err) {
        res.status(500).json({ error: 'Error al contar managers activos' });
    }
});

// Devuelve el número de managers online (usuarios con sesión iniciada en los últimos 5 minutos)
router.get('/online', async (req, res) => {
    try {
        // Suponemos que hay un campo lastOnline en el modelo User (si no, habría que añadirlo y actualizarlo en cada request autenticada)
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const count = await User.countDocuments({ lastOnline: { $gte: fiveMinutesAgo } });
        res.json({ onlineManagers: count });
    } catch (err) {
        res.status(500).json({ error: 'Error al contar managers online' });
    }
});

module.exports = router;
