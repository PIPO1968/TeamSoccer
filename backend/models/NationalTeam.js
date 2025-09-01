const mongoose = require('mongoose');

const nationalTeamSchema = new mongoose.Schema({
    country: { type: String, required: true },
    season: { type: Number, required: true },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    players: [{
        name: String,
        position: String,
        rating: Number,
        club: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' }
    }],
    selectionOpenUntil: Date, // Fecha límite para elegir jugadores
    locked: { type: Boolean, default: false }
});

module.exports = mongoose.model('NationalTeam', nationalTeamSchema);
