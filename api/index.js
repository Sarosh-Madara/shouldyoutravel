const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const AIRLABS_API_KEY = process.env.AIRLABS_API_KEY;
const AIRLABS_BASE_URL = 'https://airlabs.co/api/v9';

app.get('/api/airport-status', async (req, res) => {
  try {
    const { iataCode } = req.query;
    if (!iataCode) return res.status(400).json({ error: 'IATA code is required' });

    const response = await axios.get(`${AIRLABS_BASE_URL}/airports`, {
      params: { iata_code: iataCode.toUpperCase(), api_key: AIRLABS_API_KEY },
      timeout: 15000
    });

    const airports = response.data.response;
    if (airports && airports.length > 0) {
      const airport = airports[0];
      res.json({
        success: true,
        airport: {
          name: airport.name,
          iata: airport.iata_code,
          icao: airport.icao_code,
          city: airport.city,
          country: airport.country_code,
          status: 'operational'
        }
      });
    } else {
      res.json({ success: false, message: 'Airport not found' });
    }
  } catch (error) {
    console.error('Error fetching airport data:', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch airport data', message: error.message });
  }
});

app.get('/api/airlines', async (req, res) => {
  try {
    const { iataCode } = req.query;
    if (!iataCode) return res.status(400).json({ error: 'IATA code is required' });

    const response = await axios.get(`${AIRLABS_BASE_URL}/flights`, {
      params: { dep_iata: iataCode.toUpperCase(), api_key: AIRLABS_API_KEY },
      timeout: 15000
    });

    const flights = response.data.response || [];
    const airlines = [...new Set(
      flights
        .filter(f => f.airline_iata)
        .map(f => f.airline_iata)
    )].slice(0, 20);

    res.json({
      success: true,
      airlines,
      totalFlights: flights.length
    });
  } catch (error) {
    console.error('Error fetching airlines:', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch airline data', message: error.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running!' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});

module.exports = app;
