const mongoose = require('mongoose');
const Team = require('../models/Team');

// Lista de equipos BOT por país, división y grupo
const botTeamsData = [
    // Ejemplo: puedes ampliar esta lista con todos los equipos BOT que quieras
    { name: 'Bot FC España 1', country: 'España', division: 1, group: 0 },
    { name: 'Bot FC España 2', country: 'España', division: 1, group: 0 },
    { name: 'Bot FC España 3', country: 'España', division: 1, group: 0 },
    { name: 'Bot FC Francia 1', country: 'Francia', division: 1, group: 0 },
    { name: 'Bot FC Francia 2', country: 'Francia', division: 1, group: 0 },
    { name: 'Bot FC Italia 1', country: 'Italia', division: 1, group: 0 },
    { name: 'Bot FC Italia 2', country: 'Italia', division: 1, group: 0 },
    // ...añade más equipos y países según tu estructura
];

async function createBotTeams() {
    for (const bot of botTeamsData) {
        // Comprobar si ya existe
        const exists = await Team.findOne({ name: bot.name });
        if (!exists) {
            await Team.create({
                name: bot.name,
                country: bot.country,
                division: bot.division,
                group: bot.group,
                owner: null, // Sin dueño
                players: Array.from({ length: 18 }, (_, i) => ({
                    name: `Jugador ${i + 1}`,
                    position: 'Indefinido',
                    rating: 50
                }))
            });
        }
    }
    console.log('Equipos BOT generados');
}

if (require.main === module) {
    mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/teamsoccer', { useNewUrlParser: true, useUnifiedTopology: true })
        .then(async () => {
            await createBotTeams();
            process.exit(0);
        });
}

module.exports = createBotTeams;
