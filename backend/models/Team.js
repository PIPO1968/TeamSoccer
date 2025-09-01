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
    }],
    lastTrainingWeek: { type: Number, default: null }, // Semana ISO del último entrenamiento
    preferredMatchTime: { type: String, default: null }, // Hora personalizada de partido (solo premium, ej: '20:00')
    trophies: [{
        type: { type: String }, // oro, plata, bronce
        season: Number,
        division: String,
        competition: String // opcional: liga, copa, mundial, etc.
    }]
});

module.exports = mongoose.model('Team', teamSchema);
