const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    players: [{
        name: String,
        position: String,
        rating: Number
    }]
});

module.exports = mongoose.model('Team', teamSchema);
