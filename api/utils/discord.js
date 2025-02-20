const fetch = require('node-fetch');
require('dotenv').config();

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

if (!DISCORD_WEBHOOK_URL) {
    console.error('Discord webhook URL is not defined in environment variables!');
}

// Webhook istekleri arasında minimum bekleme süresi (ms)
const MIN_WEBHOOK_INTERVAL = 1000; 
let lastWebhookTime = 0;

const sendDiscordNotification = async (order, product) => {
    if (!DISCORD_WEBHOOK_URL) {
        console.error('Skipping Discord notification: Webhook URL is not configured');
        return;
    }

    try {
        // Rate limiting kontrolü
        const now = Date.now();
        const timeSinceLastWebhook = now - lastWebhookTime;
        if (timeSinceLastWebhook < MIN_WEBHOOK_INTERVAL) {
            await new Promise(resolve => setTimeout(resolve, MIN_WEBHOOK_INTERVAL - timeSinceLastWebhook));
        }

        const embed = {
            title: '🛍️ Yeni Sipariş Geldi!',
            color: 0xEC4899,
            fields: [
                {
                    name: '📦 Ürün Bilgileri',
                    value: `**${product.name}**\nFiyat: ${product.price}₺${product.discountPercentage > 0 ? ` (İndirimli)` : ''}\nGercek Fiyat: ${product.originalPrice}₺ ${product.discountPercentage > 0 ? `(İndirim Oranı: ${product.discountPercentage}%)` : ''}`
                },
                {
                    name: '👤 Müşteri Bilgileri',
                    value: `İsim: ${order.fullName}\nTelefon: ${order.phoneNumber}`
                }
            ],
            thumbnail: {
                url: product.imageUrl
            },
            timestamp: new Date().toISOString()
        };

        if (order.note) {
            embed.fields.push({
                name: '📝 Sipariş Notu',
                value: order.note
            });
        }

        const message = {
            content: '@everyone Yeni bir sipariş var!',
            embeds: [embed]
        };

        const response = await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Discord API Error: ${response.status} - ${errorText}`);
        }

        // Başarılı webhook zamanını kaydet
        lastWebhookTime = Date.now();

    } catch (error) {
        console.error('Discord notification error:', error);
        // Hata durumunda yeniden deneme mantığı eklenebilir
    }
};

module.exports = { sendDiscordNotification }; 