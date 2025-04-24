const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const SERP_API_KEY = "b9eeb10096e14a45e111af9679f9bc7dba6259a6f77ea5dc0473eee09cbdbd0e";

app.get('/api/search', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: 'Missing query' });

  try {
    const serpResponse = await axios.get('https://serpapi.com/search.json', {
      params: {
        q: query,
        engine: 'google_shopping',
        api_key: SERP_API_KEY,
      },
    });
    res.json(serpResponse.data);
  } catch (error) {
    console.error('SerpAPI Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch from SerpAPI' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Proxy server running on port ${PORT}`));
