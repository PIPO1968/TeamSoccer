const mongoose = require('mongoose');

const candidacySchema = new mongoose.Schema({
    country: { type: String, required: true },
    season: { type: Number, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isPremium: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('NationalCandidacy', candidacySchema);
