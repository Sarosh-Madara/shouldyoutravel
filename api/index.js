const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

app.use(cors());
app.use(express.json());

const AVIATIONSTACK_API_KEY = process.env.AVIATIONSTACK_API_KEY;
const AVIATIONSTACK_BASE_URL = 'http://api.aviationstack.com/v1';

app.get('/api/airport-status', async (req, res) => {
  try {
    const { iataCode } = req.query;

    if (!iataCode) {
      return res.status(400).json({ error: 'IATA code is required' });
    }

    const response = await axios.get(`${AVIATIONSTACK_BASE_URL}/airports`, {
      params: {
        access_key: AVIATIONSTACK_API_KEY,
        search: iataCode
      }
    });

    if (response.data.data && response.data.data.length > 0) {
      const airport = response.data.data[0];
      res.json({
        success: true,
        airport: {
          name: airport.airport_name,
          iata: airport.iata_code,
          icao: airport.icao_code,
          city: airport.city_name,
          country: airport.country_name,
          status: 'operational'
        }
      });
    } else {
      res.json({
        success: false,
        message: 'Airport not found'
      });
    }
  } catch (error) {
    console.error('Error fetching airport data:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch airport data',
      message: error.message
    });
  }
});

app.get('/api/airlines', async (req, res) => {
  try {
    const { iataCode } = req.query;

    if (!iataCode) {
      return res.status(400).json({ error: 'IATA code is required' });
    }

    const response = await axios.get(`${AVIATIONSTACK_BASE_URL}/flights`, {
      params: {
        access_key: AVIATIONSTACK_API_KEY,
        dep_iata: iataCode,
        limit: 100
      }
    });

    if (response.data.data && response.data.data.length > 0) {
      const airlines = [...new Set(response.data.data.map(flight => flight.airline.name))];

      res.json({
        success: true,
        airlines: airlines.slice(0, 20),
        totalFlights: response.data.data.length
      });
    } else {
      res.json({
        success: true,
        airlines: [],
        totalFlights: 0,
        message: 'No flight data available for this airport'
      });
    }
  } catch (error) {
    console.error('Error fetching airlines:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch airline data',
      message: error.message
    });
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
