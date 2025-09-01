const mongoose = require('mongoose');

const roomMadnessMatchSchema = new mongoose.Schema({
    round: Number, // Ronda (1=octavos, 2=cuartos, etc.)
    homeRoom: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
    awayRoom: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
    homeTeamIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }], // equipos de la sala home
    awayTeamIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }], // equipos de la sala away
    homeGoals: Number,
    awayGoals: Number,
    winner: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
    playedAt: Date
});

const roomMadnessSchema = new mongoose.Schema({
    season: Number,
    startedAt: Date,
    finishedAt: Date,
    matches: [roomMadnessMatchSchema],
    currentRound: Number, // 1=octavos, 2=cuartos, etc.
    rooms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Room' }], // participantes
    winner: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' }
});

module.exports = mongoose.model('RoomMadness', roomMadnessSchema);
