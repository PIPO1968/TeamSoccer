const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
    country: { type: String, required: true },
    season: { type: Number, required: true },
    voter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('NationalVote', voteSchema);
