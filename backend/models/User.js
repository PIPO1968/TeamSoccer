const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    premium: { type: Boolean, default: false },
    premiumUntil: { type: Date },
    tscredits: { type: Number, default: 0 },
    flags: { type: [String], default: [] }, // Códigos de país de banderas conseguidas
    lastOnline: { type: Date, default: Date.now }, // Fecha/hora de última actividad
    isAdmin: { type: Boolean, default: false } // Permisos de administrador
});

module.exports = mongoose.model('User', userSchema);
