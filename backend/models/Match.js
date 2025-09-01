const mongoose = require('mongoose');


const lineupSchema = new mongoose.Schema({
    formation: String, // Ej: "4-4-2", "3-5-2", etc.
    tactics: String,   // Ej: "ofensiva", "defensiva", "posesión", etc.
    mode: String,      // Ej: "normal", "amistoso", "copa", "liga", etc.
    players: [{
        playerId: mongoose.Schema.Types.ObjectId,
        position: String
    }],
    createdAt: { type: Date, default: Date.now }
});

const matchSchema = new mongoose.Schema({
    homeTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    awayTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    homeLineup: lineupSchema,
    awayLineup: lineupSchema,
    homeGoals: { type: Number, required: true },
    awayGoals: { type: Number, required: true },
    type: { type: String, enum: ['liga', 'amistoso', 'copa', 'torneo', 'champions', 'worldcup'], default: 'liga' },
    scheduledFor: { type: Date, required: true },
    lockedLineup: { type: Boolean, default: false }, // true si ya no se puede cambiar
    comments: [String], // Comentarios en vivo
    playedAt: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Match', matchSchema);
