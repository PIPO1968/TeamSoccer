const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    name: String, // Ej: 'Grupo A', 'Grupo 1', etc.
    teams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }]
});

const divisionSchema = new mongoose.Schema({
    name: String, // Ej: 'Division I', 'Division II', etc.
    level: Number, // 1=I, 2=II, 3=III, 4=IV
    groups: [groupSchema],
    season: Number, // Temporada
    country: String // Opcional, para multi-país
});

module.exports = mongoose.model('Division', divisionSchema);
