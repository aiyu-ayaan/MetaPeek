import express from 'express';
import cors from 'cors';
import axios from 'axios';
import * as cheerio from 'cheerio';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config({ path: new URL('../.env', import.meta.url) });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || '*';
const GA_MEASUREMENT_ID = process.env.GA_MEASUREMENT_ID || '';

app.use(cors({ origin: CLIENT_ORIGIN === '*' ? true : CLIENT_ORIGIN }));
app.use(express.json());

const extractionSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, index: true },
    normalizedUrl: { type: String, required: true, index: true },
    status: { type: String, enum: ['success', 'error'], required: true, index: true },
    result: { type: mongoose.Schema.Types.Mixed },
    error: { type: String },
    responseTimeMs: { type: Number, required: true },
    userAgent: { type: String },
  },
  { timestamps: true }
);

const Extraction = mongoose.model('Extraction', extractionSchema);

const connectDatabase = async () => {
  if (!MONGODB_URI) {
    console.warn('MONGODB_URI is not set. Extraction tracking is disabled.');
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('MongoDB connected for extraction tracking.');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
  }
};

const saveExtraction = async (payload) => {
  if (mongoose.connection.readyState !== 1) return;

  try {
    await Extraction.create(payload);
  } catch (error) {
    console.error('Failed to save extraction:', error.message);
  }
};

const normalizeUrl = (value) => {
  const parsedUrl = new URL(value);
  parsedUrl.hash = '';
  return parsedUrl.href;
};

const resolveUrl = (baseUrl, relativeUrl) => {
  if (!relativeUrl) return '';
  try {
    return new URL(relativeUrl, baseUrl).href;
  } catch (e) {
    return relativeUrl;
  }
};

const getCompletenessScore = (result) => {
  const checks = [
    result.title,
    result.description,
    result.image,
    result.og?.title,
    result.og?.description,
    result.og?.image,
    result.twitter?.title,
    result.twitter?.description,
    result.twitter?.image,
    result.twitter?.card,
  ];

  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
};

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disabled',
  });
});

app.get('/api/config', (_req, res) => {
  res.json({
    googleAnalyticsId: GA_MEASUREMENT_ID,
  });
});

app.get('/api/extractions/recent', async (_req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.json([]);
  }

  const records = await Extraction.find({ status: 'success' })
    .sort({ createdAt: -1 })
    .limit(8)
    .select('normalizedUrl result.title result.site_name responseTimeMs createdAt')
    .lean();

  res.json(records);
});

app.post('/api/extract', async (req, res) => {
  const { url } = req.body;
  const startedAt = Date.now();

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Basic URL validation
  let normalizedUrl;
  try {
    normalizedUrl = normalizeUrl(url);
  } catch (e) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  try {
    const response = await axios.get(normalizedUrl, {
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

    result.score = getCompletenessScore(result);
    result.extractedAt = new Date().toISOString();

    await saveExtraction({
      url,
      normalizedUrl,
      status: 'success',
      result,
      responseTimeMs: Date.now() - startedAt,
      userAgent: req.get('user-agent') || '',
    });

    res.json(result);
  } catch (error) {
    console.error('Extraction Error:', error.message);
    await saveExtraction({
      url,
      normalizedUrl,
      status: 'error',
      error: error.message,
      responseTimeMs: Date.now() - startedAt,
      userAgent: req.get('user-agent') || '',
    });

    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({ error: 'Request timeout. The server took too long to respond.' });
    }
    if (error.response) {
       return res.status(error.response.status).json({ error: `Failed to fetch URL: ${error.response.statusText}` });
    }
    res.status(500).json({ error: 'Failed to extract metadata from the provided URL.' });
  }
});

await connectDatabase();

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
