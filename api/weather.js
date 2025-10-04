/**
 * Serverless Function: Weather API Proxy
 * 
 * This function proxies requests to OpenWeatherMap API
 * while keeping the API key secure on the server side.
 * 
 * Endpoint: /api/weather
 * Method: GET
 * Query Parameters:
 *   - q: City name (e.g., "London" or "London,UK")
 *   - lat: Latitude (optional, for coordinate-based search)
 *   - lon: Longitude (optional, for coordinate-based search)
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
        const { q, lat, lon } = req.query;

        // Validate input
        if (!q && (!lat || !lon)) {
            return res.status(400).json({ 
                error: 'Missing required parameters. Provide either "q" (city name) or "lat" and "lon" (coordinates).' 
            });
        }

        // Get API key from environment variable
        const apiKey = process.env.OPENWEATHER_API_KEY;
        
        if (!apiKey) {
            console.error('OPENWEATHER_API_KEY not configured');
            return res.status(500).json({ error: 'API key not configured' });
        }

        // Build API URL
        let apiUrl = 'https://api.openweathermap.org/data/2.5/weather?';
        
        if (q) {
            apiUrl += `q=${encodeURIComponent(q)}`;
        } else {
            apiUrl += `lat=${lat}&lon=${lon}`;
        }
        
        apiUrl += `&appid=${apiKey}&units=metric`;

        // Fetch data from OpenWeatherMap
        const response = await fetch(apiUrl);
        const data = await response.json();

        // Check if request was successful
        if (!response.ok) {
            return res.status(response.status).json(data);
        }

        // Return weather data
        return res.status(200).json(data);

    } catch (error) {
        console.error('Weather API Error:', error);
        return res.status(500).json({ 
            error: 'Failed to fetch weather data',
            message: error.message 
        });
    }
}
