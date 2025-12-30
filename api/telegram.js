// Vercel Serverless Function for Telegram Notifications
// Deploy this to Vercel, Netlify, or Cloudflare Workers

export default async function handler(req, res) {
    // Set CORS headers for all responses
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    // Get environment variables
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;

    // Check if credentials are set
    if (!BOT_TOKEN || !CHANNEL_ID) {
        console.error('Telegram credentials not configured');
        res.status(500).json({ error: 'Server configuration error' });
        return;
    }

    try {
        // Get data from request
        const { message, eventType, ...eventData } = req.body;

        if (!message) {
            res.status(400).json({ error: 'Message is required' });
            return;
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
            console.error('Bot Token exists:', !!BOT_TOKEN);
            console.error('Channel ID:', CHANNEL_ID);
            
            // More detailed error message
            let errorMessage = data.description || 'Unknown error';
            if (data.error_code === 400) {
                errorMessage = 'Bad Request - Check Channel ID format';
            } else if (data.error_code === 401) {
                errorMessage = 'Unauthorized - Check Bot Token';
            } else if (data.error_code === 403) {
                errorMessage = 'Forbidden - Bot not in channel or no permission';
            } else if (data.error_code === 404) {
                errorMessage = 'Not Found - Invalid Channel ID or bot not added to channel';
            }
            
            res.status(500).json({ 
                error: 'Failed to send message',
                details: errorMessage,
                errorCode: data.error_code,
                fullError: data
            });
            return;
        }

        // Success
        res.status(200).json({ 
            success: true, 
            messageId: data.result.message_id 
        });
        return;

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
        return;
    }
}

