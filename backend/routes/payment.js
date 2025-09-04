const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Webhook Stripe
router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
        // Aquí deberías verificar la firma del evento con tu clave secreta de Stripe
        const event = JSON.parse(req.body);
        if (event.type === 'checkout.session.completed') {
            const email = event.data.object.customer_email;
            const months = event.data.object.metadata?.months || 1;
            const user = await User.findOne({ email });
            if (user) {
                const now = new Date();
                let base = user.premiumUntil && user.premiumUntil > now ? user.premiumUntil : now;
                user.premiumUntil = new Date(base.getTime() + months * 30 * 24 * 60 * 60 * 1000);
                user.premium = true;
                await user.save();
            }
        }
        res.status(200).send('ok');
    } catch (err) {
        res.status(400).send('Webhook error');
    }
});

// Webhook PayPal
router.post('/paypal', async (req, res) => {
    try {
        // Aquí deberías validar el evento con la API de PayPal
        const { email, months } = req.body;
        const user = await User.findOne({ email });
        if (user) {
            const now = new Date();
            let base = user.premiumUntil && user.premiumUntil > now ? user.premiumUntil : now;
            user.premiumUntil = new Date(base.getTime() + (months || 1) * 30 * 24 * 60 * 60 * 1000);
            user.premium = true;
            await user.save();
        }
        res.status(200).send('ok');
    } catch (err) {
        res.status(400).send('Webhook error');
    }
});

// Transferencia bancaria (manual)
router.post('/bank', async (req, res) => {
    try {
        // Aquí puedes guardar la solicitud y luego activarla manualmente tras comprobar el pago
        // Ejemplo: req.body = { email, months, nombre, ... }
        // Número de cuenta: PENDIENTE DE DEFINIR
        res.status(200).json({ message: 'Solicitud recibida. Se activará el premium tras comprobar la transferencia.' });
    } catch (err) {
        res.status(400).send('Error en la solicitud');
    }
});

module.exports = router;
