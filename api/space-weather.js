/**
 * Serverless Function: Space Weather API Proxy
 * 
 * This function proxies requests to NASA DONKI API
 * while keeping the API key secure on the server side.
 * 
 * Endpoint: /api/space-weather
 * Method: GET
 * Query Parameters:
 *   - type: Event type (FLR, CME, GST, etc.)
 *   - startDate: Start date (YYYY-MM-DD format)
 *   - endDate: End date (YYYY-MM-DD format)
 */

export default async function handler(req, res) {
    // Enable CORS for GitHub Pages
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { type, startDate, endDate } = req.query;

        // Validate input
        if (!type || !startDate || !endDate) {
            return res.status(400).json({ 
                error: 'Missing required parameters: type, startDate, and endDate are required.' 
            });
        }

        // Validate event type
        const validTypes = ['FLR', 'CME', 'GST', 'IPS', 'MPC', 'RBE', 'SEP', 'HSS', 'WSA'];
        if (!validTypes.includes(type.toUpperCase())) {
            return res.status(400).json({ 
                error: `Invalid event type. Must be one of: ${validTypes.join(', ')}` 
            });
        }

        // Validate date format (basic check)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
            return res.status(400).json({ 
                error: 'Invalid date format. Use YYYY-MM-DD format.' 
            });
        }

        // Get API key from environment variable
        const apiKey = process.env.NASA_API_KEY;
        
        if (!apiKey) {
            console.error('NASA_API_KEY not configured');
            return res.status(500).json({ error: 'API key not configured' });
        }

        // Build NASA DONKI API URL
        const apiUrl = `https://api.nasa.gov/DONKI/${type.toUpperCase()}?startDate=${startDate}&endDate=${endDate}&api_key=${apiKey}`;

        // Fetch data from NASA DONKI
        const response = await fetch(apiUrl);
        
        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('Non-JSON response:', text);
            return res.status(500).json({ 
                error: 'Invalid response from NASA API',
                details: text.substring(0, 200)
            });
        }

        const data = await response.json();

        // Check if request was successful
        if (!response.ok) {
            return res.status(response.status).json(data);
        }

        // Return space weather data
        return res.status(200).json(data);

    } catch (error) {
        console.error('Space Weather API Error:', error);
        return res.status(500).json({ 
            error: 'Failed to fetch space weather data',
            message: error.message 
        });
    }
}
