// Vercel Serverless Function for Telegram Notifications
// Deploy this to Vercel, Netlify, or Cloudflare Workers

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Get environment variables
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;

    // Check if credentials are set
    if (!BOT_TOKEN || !CHANNEL_ID) {
        console.error('Telegram credentials not configured');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    try {
        // Get data from request
        const { message, eventType, ...eventData } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Send message to Telegram channel
        const telegramApiUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
        
        const response = await fetch(telegramApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: CHANNEL_ID,
                text: message,
                parse_mode: 'HTML', // Optional: allows HTML formatting
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Telegram API error:', data);
            return res.status(500).json({ 
                error: 'Failed to send message',
                details: data.description 
            });
        }

        // Success
        return res.status(200).json({ 
            success: true, 
            messageId: data.result.message_id 
        });

    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
}

