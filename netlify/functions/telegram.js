// Netlify Serverless Function for Telegram Notifications
// Place this file in: netlify/functions/telegram.js

exports.handler = async (event, context) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    // Get environment variables
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;

    // Check if credentials are set
    if (!BOT_TOKEN || !CHANNEL_ID) {
        console.error('Telegram credentials not configured');
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Server configuration error' }),
        };
    }

    try {
        // Parse request body
        const { message, eventType, ...eventData } = JSON.parse(event.body);

        if (!message) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Message is required' }),
            };
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
            return {
                statusCode: 500,
                body: JSON.stringify({ 
                    error: 'Failed to send message',
                    details: data.description 
                }),
            };
        }

        // Success
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*', // Allow CORS
                'Access-Control-Allow-Headers': 'Content-Type',
            },
            body: JSON.stringify({ 
                success: true, 
                messageId: data.result.message_id 
            }),
        };

    } catch (error) {
        console.error('Server error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: 'Internal server error',
                message: error.message 
            }),
        };
    }
};

