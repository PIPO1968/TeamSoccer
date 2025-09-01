const mongoose = require('mongoose');

const transferSchema = new mongoose.Schema({
    player: {
        name: String,
        position: String,
        age: Number,
        rating: Number, // Suma de habilidades
        skills: {
            pace: Number,
            shooting: Number,
            passing: Number,
            defense: Number,
            physical: Number,
            // ...puedes añadir más habilidades si lo deseas
        },
        fromClub: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    },
    price: Number, // Precio de salida
    currentBid: Number, // Puja actual
    currentBidder: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    bids: [{
        team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
        amount: Number,
        time: Date
    }],
    status: { type: String, enum: ['open', 'closed', 'sold'], default: 'open' },
    listedAt: { type: Date, default: Date.now },
    expiresAt: Date,
    lastBidAt: Date
});

module.exports = mongoose.model('Transfer', transferSchema);
