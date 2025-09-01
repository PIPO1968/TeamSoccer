const mongoose = require('mongoose');

const friendlyMatchSchema = new mongoose.Schema({
    requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    opponent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    teamRequester: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    teamOpponent: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    status: { type: String, enum: ['pendiente', 'aceptado', 'jugado'], default: 'pendiente' },
    scheduledFor: { type: Date, required: true },
    result: {
        requesterGoals: Number,
        opponentGoals: Number
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FriendlyMatch', friendlyMatchSchema);
