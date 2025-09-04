const express = require('express');
const router = express.Router();
const Competition = require('../models/Competition');
const Room = require('../models/Room');
const authenticateToken = require('../middleware/auth');


// Listar todas las competiciones (global)
router.get('/', async (req, res) => {
    try {
        const competitions = await Competition.find();
        res.json(competitions);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener competiciones' });
    }
});

// Listar competiciones de una sala
router.get('/room/:roomId', async (req, res) => {
    try {
        const competitions = await Competition.find({ room: req.params.roomId });
        res.json(competitions);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener competiciones' });
    }
});

// Crear competición en una sala
router.post('/room/:roomId', authenticateToken, async (req, res) => {
    try {
        const { name, description } = req.body;
        const comp = new Competition({
            room: req.params.roomId,
            name,
            description,
            createdBy: req.user.id
        });
        await comp.save();
        res.status(201).json(comp);
    } catch (err) {
        res.status(400).json({ error: 'Error al crear competición' });
    }
});

module.exports = router;
