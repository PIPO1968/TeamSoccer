const mongoose = require('mongoose');
const Transfer = require('../models/Transfer');

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomSkills(total) {
    // Reparte el total entre 5 habilidades
    let skills = [0, 0, 0, 0, 0];
    let remaining = total;
    for (let i = 0; i < 4; i++) {
        skills[i] = randomInt(50, remaining - (50 * (4 - i)));
        remaining -= skills[i];
    }
    skills[4] = remaining;
    // Baraja las habilidades
    for (let i = skills.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [skills[i], skills[j]] = [skills[j], skills[i]];
    }
    return {
        pace: skills[0],
        shooting: skills[1],
        passing: skills[2],
        defense: skills[3],
        physical: skills[4]
    };
}

function calculatePlayerPrice(rating, age) {
    // Ejemplo simple: precio base + bonus por rating y penalización por edad
    let base = 100000;
    let price = base + rating * 1000 - age * 500;
    return Math.max(price, 50000);
}

async function createDailyTransfers() {
    for (let i = 0; i < 5; i++) {
        const rating = randomInt(600, 700);
        const age = randomInt(18, 32);
        const skills = generateRandomSkills(rating);
        const name = `Jugador Mercado ${Date.now()}_${i}`;
        const position = ['POR', 'DEF', 'MED', 'DEL'][randomInt(0, 3)];
        const price = calculatePlayerPrice(rating, age);
        await Transfer.create({
            player: { name, position, age, rating, skills },
            price,
            currentBid: null,
            currentBidder: null,
            bids: [],
            status: 'open',
            listedAt: new Date(),
            expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000), // 72 horas
            lastBidAt: null
        });
    }
    console.log('Jugadores aleatorios añadidos al mercado de transferencias');
}

if (require.main === module) {
    mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/teamsoccer', { useNewUrlParser: true, useUnifiedTopology: true })
        .then(async () => {
            await createDailyTransfers();
            process.exit(0);
        });
}

module.exports = createDailyTransfers;
