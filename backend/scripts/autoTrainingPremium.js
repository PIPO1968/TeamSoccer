// Script semanal de entrenamiento automático para premium
// Ejecutar este script una vez por semana (por ejemplo, con cron)

const mongoose = require('mongoose');
const User = require('../models/User');
const Team = require('../models/Team');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost/teamsoccer';

async function main() {
    await mongoose.connect(MONGO_URI);
    const premiumUsers = await User.find({ premium: true });
    for (const user of premiumUsers) {
        const teams = await Team.find({ owner: user._id });
        for (const team of teams) {
            // Si el equipo NO ha entrenado manualmente esta semana, aplicar entrenamiento por defecto
            // Suponemos que hay un campo team.lastTrainingWeek (número de semana ISO)
            const now = new Date();
            const currentWeek = getISOWeek(now);
            if (team.lastTrainingWeek !== currentWeek) {
                // Entrenamiento por defecto: simplemente marcar la semana como entrenada
                team.lastTrainingWeek = currentWeek;
                await team.save();
                console.log(`Auto-entrenamiento aplicado a equipo ${team.name} (usuario premium: ${user.username})`);
            }
        }
    }
    await mongoose.disconnect();
}

// Devuelve el número de semana ISO (1-53)
function getISOWeek(date) {
    const tmp = new Date(date.valueOf());
    const dayNr = (date.getDay() + 6) % 7;
    tmp.setDate(tmp.getDate() - dayNr + 3);
    const firstThursday = tmp.valueOf();
    tmp.setMonth(0, 1);
    if (tmp.getDay() !== 4) {
        tmp.setMonth(0, 1 + ((4 - tmp.getDay()) + 7) % 7);
    }
    return 1 + Math.ceil((firstThursday - tmp) / 604800000);
}

main().catch(err => { console.error(err); process.exit(1); });
