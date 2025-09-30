const mongoose = require('mongoose');

const nationalTeamApplicationSchema = new mongoose.Schema({
    country: { type: String },
    season: { type: Number },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('NationalTeamApplication', nationalTeamApplicationSchema);
