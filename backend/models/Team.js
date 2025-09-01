const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    country: { type: String },
    division: { type: Number }, // 1=I, 2=II, etc.
    group: { type: Number },
    createdAt: { type: Date, default: Date.now },
    players: [{
        name: String,
        position: String,
        rating: Number
    }]
});

module.exports = mongoose.model('Team', teamSchema);
