import express from 'express';
import cors from 'cors';
import axios from 'axios';
import * as cheerio from 'cheerio';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Helper function to resolve relative URLs
const resolveUrl = (baseUrl, relativeUrl) => {
  if (!relativeUrl) return '';
  try {
    return new URL(relativeUrl, baseUrl).href;
  } catch (e) {
    return relativeUrl;
  }
};

app.post('/api/extract', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Basic URL validation
  try {
    new URL(url);
  } catch (e) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      },
      timeout: 10000, // 10 seconds timeout
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Extract tags
    const getMetaTag = (name) => {
      return (
        $(`meta[property="${name}"]`).attr('content') ||
        $(`meta[name="${name}"]`).attr('content') ||
        $(`meta[property="og:${name}"]`).attr('content') ||
        $(`meta[name="twitter:${name}"]`).attr('content') ||
        ''
      );
    };

    const title = getMetaTag('title') || $('title').text() || '';
    const description = getMetaTag('description') || '';
    let image = getMetaTag('image') || '';
    const site_name = getMetaTag('site_name') || '';

    // If no image, try to find a generic icon
    if (!image) {
      image = $('link[rel="icon"]').attr('href') || $('link[rel="shortcut icon"]').attr('href') || '';
    }

    // Resolve relative URLs to absolute
    const absoluteUrl = resolveUrl(url, getMetaTag('url') || url);
    const absoluteImage = resolveUrl(url, image);

    const og = {
      title: $(`meta[property="og:title"]`).attr('content') || '',
      description: $(`meta[property="og:description"]`).attr('content') || '',
      image: resolveUrl(url, $(`meta[property="og:image"]`).attr('content') || ''),
      url: resolveUrl(url, $(`meta[property="og:url"]`).attr('content') || ''),
      site_name: $(`meta[property="og:site_name"]`).attr('content') || '',
    };

    const twitter = {
      title: $(`meta[name="twitter:title"]`).attr('content') || '',
      description: $(`meta[name="twitter:description"]`).attr('content') || '',
      image: resolveUrl(url, $(`meta[name="twitter:image"]`).attr('content') || ''),
      card: $(`meta[name="twitter:card"]`).attr('content') || '',
    };

    // Auto-detect site name fallback
    let fallbackSiteName = site_name;
    if (!fallbackSiteName) {
      try {
        fallbackSiteName = new URL(absoluteUrl).hostname.replace('www.', '');
      } catch (e) {
        fallbackSiteName = '';
      }
    }

    const result = {
      title,
      description,
      image: absoluteImage,
      url: absoluteUrl,
      site_name: fallbackSiteName,
      og,
      twitter,
    };

    res.json(result);
  } catch (error) {
    console.error('Extraction Error:', error.message);
    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({ error: 'Request timeout. The server took too long to respond.' });
    }
    if (error.response) {
       return res.status(error.response.status).json({ error: `Failed to fetch URL: ${error.response.statusText}` });
    }
    res.status(500).json({ error: 'Failed to extract metadata from the provided URL.' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
