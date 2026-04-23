const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const OPENSKY_BASE_URL = 'https://opensky-network.org/api';

const IATA_TO_ICAO = {
  'JFK': 'KJFK', 'LAX': 'KLAX', 'ORD': 'KORD', 'ATL': 'KATL', 'DFW': 'KDFW',
  'DEN': 'KDEN', 'SFO': 'KSFO', 'SEA': 'KSEA', 'MIA': 'KMIA', 'BOS': 'KBOS',
  'EWR': 'KEWR', 'LGA': 'KLGA', 'LAS': 'KLAS', 'MCO': 'KMCO', 'PHX': 'KPHX',
  'IAH': 'KIAH', 'CLT': 'KCLT', 'MSP': 'KMSP', 'DTW': 'KDTW', 'PHL': 'KPHL',
  'LHR': 'EGLL', 'LGW': 'EGKK', 'MAN': 'EGCC', 'STN': 'EGSS', 'BHX': 'EGBB',
  'CDG': 'LFPG', 'ORY': 'LFPO', 'NCE': 'LFMN', 'LYS': 'LFLL', 'MRS': 'LFML',
  'FRA': 'EDDF', 'MUC': 'EDDM', 'DUS': 'EDDL', 'TXL': 'EDDT', 'HAM': 'EDDH',
  'AMS': 'EHAM', 'MAD': 'LEMD', 'BCN': 'LEBL', 'FCO': 'LIRF', 'MXP': 'LIMC',
  'ZRH': 'LSZH', 'VIE': 'LOWW', 'BRU': 'EBBR', 'CPH': 'EKCH', 'ARN': 'ESSA',
  'OSL': 'ENGM', 'HEL': 'EFHK', 'IST': 'LTBA', 'SAW': 'LTFJ', 'ATH': 'LGAV',
  'LIS': 'LPPT', 'DXB': 'OMDB', 'AUH': 'OMAA', 'DOH': 'OTBD', 'KWI': 'OKBK',
  'RUH': 'OERK', 'CAI': 'HECA', 'TLV': 'LLBG', 'DEL': 'VIDP', 'BOM': 'VABB',
  'BLR': 'VOBL', 'MAA': 'VOMM', 'HYD': 'VOHS', 'CCU': 'VECC', 'SIN': 'WSSS',
  'KUL': 'WMKK', 'BKK': 'VTBS', 'HKG': 'VHHH', 'PEK': 'ZBAA', 'PVG': 'ZSPD',
  'CAN': 'ZGGG', 'CTU': 'ZUUU', 'NRT': 'RJAA', 'HND': 'RJTT', 'KIX': 'RJBB',
  'ICN': 'RKSI', 'GMP': 'RKSS', 'CGK': 'WIII', 'MNL': 'RPLL', 'SYD': 'YSSY',
  'MEL': 'YMML', 'BNE': 'YBBN', 'PER': 'YPPH', 'ADL': 'YPAD', 'AKL': 'NZAA',
  'YYZ': 'CYYZ', 'YVR': 'CYVR', 'YUL': 'CYUL', 'YYC': 'CYYC', 'MEX': 'MMMX',
  'GRU': 'SBGR', 'GIG': 'SBGL', 'EZE': 'SAEZ', 'SCL': 'SCEL', 'BOG': 'SKBO',
  'LIM': 'SPJC', 'JNB': 'FAOR', 'CPT': 'FACT', 'NBO': 'HKJK', 'LOS': 'DNMM',
  'ADD': 'HAAB', 'CMN': 'GMMN', 'ACC': 'DGAA',
};

const AIRLINE_ICAO_TO_NAME = {
  'AAL': 'American Airlines', 'UAL': 'United Airlines', 'DAL': 'Delta Air Lines',
  'SWA': 'Southwest Airlines', 'ASA': 'Alaska Airlines', 'JBU': 'JetBlue Airways',
  'NKS': 'Spirit Airlines', 'FFT': 'Frontier Airlines', 'HAL': 'Hawaiian Airlines',
  'BAW': 'British Airways', 'AFR': 'Air France', 'DLH': 'Lufthansa',
  'KLM': 'KLM Royal Dutch Airlines', 'UAE': 'Emirates', 'QTR': 'Qatar Airways',
  'ETD': 'Etihad Airways', 'SIA': 'Singapore Airlines', 'CPA': 'Cathay Pacific',
  'QFA': 'Qantas', 'ANA': 'All Nippon Airways', 'JAL': 'Japan Airlines',
  'KAL': 'Korean Air', 'AAR': 'Asiana Airlines', 'MAS': 'Malaysia Airlines',
  'THA': 'Thai Airways', 'GIA': 'Garuda Indonesia', 'PAL': 'Philippine Airlines',
  'IBE': 'Iberia', 'VLG': 'Vueling', 'RYR': 'Ryanair', 'EZY': 'easyJet',
  'WZZ': 'Wizz Air', 'AZA': 'ITA Airways', 'THY': 'Turkish Airlines',
  'AEE': 'Aegean Airlines', 'TAP': 'TAP Air Portugal', 'SAS': 'Scandinavian Airlines',
  'FIN': 'Finnair', 'MSR': 'EgyptAir', 'ETH': 'Ethiopian Airlines',
  'KQA': 'Kenya Airways', 'SVA': 'Saudia', 'GFA': 'Gulf Air',
  'RAM': 'Royal Air Maroc', 'AIC': 'Air India', 'IGO': 'IndiGo',
  'SXR': 'Air India Express', 'GOW': 'Go First', 'SEJ': 'SpiceJet',
  'CSN': 'China Southern', 'CCA': 'Air China', 'CES': 'China Eastern',
  'HXA': 'Hainan Airlines', 'AMX': 'Aeromexico', 'AVA': 'Avianca',
  'LAM': 'LATAM Airlines', 'LAN': 'LATAM Airlines', 'ARG': 'Aerolineas Argentinas',
};

app.get('/api/airport-status', async (req, res) => {
  try {
    const { iataCode } = req.query;
    if (!iataCode) return res.status(400).json({ error: 'IATA code is required' });

    const icaoCode = IATA_TO_ICAO[iataCode.toUpperCase()];
    if (!icaoCode) {
      return res.json({ success: false, message: `Airport ${iataCode} not supported` });
    }

    const end = Math.floor(Date.now() / 1000);
    const begin = end - 7200;

    const response = await axios.get(`${OPENSKY_BASE_URL}/flights/departure`, {
      params: { airport: icaoCode, begin, end },
      timeout: 15000
    });

    const flights = response.data || [];
    res.json({
      success: true,
      airport: {
        iata: iataCode.toUpperCase(),
        icao: icaoCode,
        status: flights.length > 0 ? 'operational' : 'limited activity',
        recentDepartures: flights.length
      }
    });
  } catch (error) {
    console.error('Error fetching airport data:', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch airport data', message: error.message });
  }
});

app.get('/api/airlines', async (req, res) => {
  try {
    const { iataCode } = req.query;
    if (!iataCode) return res.status(400).json({ error: 'IATA code is required' });

    const icaoCode = IATA_TO_ICAO[iataCode.toUpperCase()];
    if (!icaoCode) {
      return res.json({ success: false, message: `Airport ${iataCode} not supported` });
    }

    const end = Math.floor(Date.now() / 1000);
    const begin = end - 7200;

    const response = await axios.get(`${OPENSKY_BASE_URL}/flights/departure`, {
      params: { airport: icaoCode, begin, end },
      timeout: 15000
    });

    const flights = response.data || [];
    const airlineCodes = [...new Set(
      flights
        .filter(f => f.callsign && f.callsign.trim().length >= 3)
        .map(f => f.callsign.trim().substring(0, 3).toUpperCase())
    )];

    const airlines = airlineCodes
      .map(code => AIRLINE_ICAO_TO_NAME[code] || code)
      .slice(0, 20);

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
