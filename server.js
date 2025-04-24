const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const SERP_API_KEY = "b9eeb10096e14a45e111af9679f9bc7dba6259a6f77ea5dc0473eee09cbdbd0e";

const mockResponse = {
  shopping_results: [
    {
      title: "iPhone 15 Pro Max 256GB",
      price: "$1199",
      source: "Amazon",
      link: "https://www.amazon.in/"
    },
    {
      title: "iPhone 15 Pro Max 256GB",
      price: "$1149",
      source: "Flipkart",
      link: "https://www.flipkart.com/"
    },
    {
      title: "iPhone 15 Pro Max 256GB",
      price: "$1175",
      source: "Croma",
      link: "https://www.croma.com/"
    }
  ]
};

app.get('/api/search', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: 'Missing query' });

  console.log(`🔍 Searching SerpAPI for: ${query}`);

  try {
    const serpResponse = await axios.get('https://serpapi.com/search.json', {
      params: {
        q: query,
        engine: 'google_shopping',
        api_key: SERP_API_KEY,
      },
    });

    console.log("✅ SerpAPI response:", serpResponse.data);

    if (!serpResponse.data.shopping_results || serpResponse.data.shopping_results.length === 0) {
      console.log("ℹ️ No results from SerpAPI, using mock data.");
      return res.json(mockResponse);
    }

    res.json(serpResponse.data);
  } catch (error) {
    console.error('❌ SerpAPI Error:', error.response?.data || error.message);
    console.log("⚠️ Using mock data due to API failure.");
    res.json(mockResponse);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Proxy server running on port ${PORT}`));
