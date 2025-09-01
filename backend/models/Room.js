const mongoose = require('mongoose');


const messageSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: String,
    createdAt: { type: Date, default: Date.now }
});

const roomSchema = new mongoose.Schema({
    name: { type: String, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // presidente
    createdAt: { type: Date, default: Date.now },
    isPremium: { type: Boolean, default: false },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // incluye presidente y líderes
    leaders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // máx 5
    logo: { type: String }, // url o base64 del logo elegido
    logoOptions: [{ type: String }], // 10 opciones generadas IA (solo al crear)
    logosWon: [{ type: String }], // logos de otras salas conseguidos (url/base64)
    vipLogos: { type: Number, default: 0 }, // cantidad de logos VIP Room Madness
    points: { type: Number, default: 0 }, // puntos globales de sala
    type: { type: String, default: 'amistoso' }, // amistoso, torneo, etc.
    settings: { type: Object, default: {} },
    messages: [messageSchema]
});

module.exports = mongoose.model('Room', roomSchema);
