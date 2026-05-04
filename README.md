# MetaPeek - Social Link Extractor

A full-stack web application that extracts metadata from any URL and previews how that link will appear when shared across social media platforms (X/Twitter, Facebook, LinkedIn, WhatsApp).

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [How It Works](#how-it-works)
  - [Data Flow Diagram](#data-flow-diagram)
  - [API Endpoints](#api-endpoints)
  - [Metadata Extraction Process](#metadata-extraction-process)
- [Database Schema](#database-schema)
- [Frontend Components](#frontend-components)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Development Mode](#development-mode)
  - [Docker Deployment](#docker-deployment)
- [Environment Variables](#environment-variables)
- [Production Build](#production-build)

---

## Features

- **URL Metadata Extraction** - Fetches and parses Open Graph, Twitter Card, and standard meta tags
- **Social Preview Cards** - Simulates how links appear on X/Twitter, Facebook, LinkedIn, and WhatsApp
- **JSON View** - Raw metadata output with copy-to-clipboard
- **Completeness Score** - Rates how complete the metadata is (0-100%)
- **Recent Scans History** - Stores last 8 successful extractions
- **Theme Support** - Auto/Light/Dark mode with system preference detection
- **MongoDB Logging** - Tracks all extraction requests for analytics

---

## Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              MetaPeek Architecture                                │
└─────────────────────────────────────────────────────────────────────────────────────┘

                                    ┌──────────────────┐
                                    │   User Browser   │
                                    └────────┬─────────┘
                                             │
                                             │ HTTP/HTTPS
                                             │
         ┌───────────────────────────────────┼───────────────────────────────────┐
         │                             Load Balancer / Nginx                     │
         │                        (Port 8080 in Docker, :5173 Dev)               │
         └───────────────────────────────┬─────────────────────────────────────┘
                                          │
                    ┌─────────────────────┴─────────────────────┐
                    │                                           │
                    ▼                                           ▼
          ┌─────────────────┐                       ┌─────────────────┐
          │   Frontend SPA   │                       │  Backend API    │
          │   (React/Vite)   │◄─────���─ axios ───────►│  (Express.js)   │
          │    Port 5173     │        HTTP/json      │   Port 5000     │
          └─────────────────┘                       └────────┬────────┘
                                                                 │
                                              ┌─────────────────┴─────────────────┐
                                              │                                   │
                                              ▼                                   ▼
                                    ┌─────────────────┐               ┌─────────────────┐
                                    │   MongoDB       │               │  Target URL     │
                                    │   (Database)    │               │  (External)     │
                                    │   Port 27017    │               │  (Any Website)  │
                                    └─────────────────┘               └─────────────────┘
```

### Component Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           Component Hierarchy                                     │
└─────────────────────────────────────────────────────┘

                              ┌─────────────────┐
                              │     App.tsx      │  ◄── Main State Manager
                              │   (Root)        │      - data, loading, error
                              └────────┬────────┘      - theme, viewMode
                                       │
            ┌────────────────────────────┼────────────────────────────┐
            │                            │                            │
            ▼                            ▼                            ▼
┌───────────────────┐        ┌───────────────────┐        ┌───────────────────┐
│   UrlInput.tsx    │        │ SocialPreview.tsx │        │  JsonViewer.tsx   │
│   - URL input     │        │ - X/Twitter card  │        │  - Raw JSON       │
│   - Validation    │        │ - Facebook card  │        │  - Copy button    │
│   - Submit btn    │        │ - LinkedIn card   │        │                   │
└───────────────────┘        │ - WhatsApp card   │        └───────────────────┘
                             └───────────────────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    ▼                  ▼                  ▼
          ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
          │ SkeletonLoader │  │  ThemeToggle   │  │ RecentScans    │
          │  (Loading UI)  ���  │ (Auto/Light/   │  │  (Sidebar)     │
          └─────────────────┘  │    Dark)       │  └─────────────────┘
                              └─────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|-------------|
| Frontend Framework | React 19 |
| Frontend Language | TypeScript |
| Frontend Build Tool | Vite 8 |
| Frontend Styling | Tailwind CSS 4 |
| Frontend Icons | Lucide React |
| Backend Framework | Express 5 |
| Backend Language | JavaScript (ES Modules) |
| HTML Parser | Cheerio |
| HTTP Client | Axios |
| Database | MongoDB (Mongoose ODM) |
| Web Server (Production) | Nginx 1.27 |
| Containerization | Docker + Docker Compose |
| Code Quality | ESLint, TypeScript |

---

## Project Structure

```
SocialLink Extractor/
│
├── .env                        # Environment variables (local dev)
├── .gitignore                  # Git ignore rules
├── docker-compose.yml          # Docker orchestration
├── package.json                # Root orchestrator scripts
├── README.md                   # This file
│
├── backend/
│   ├── .dockerignore           # Docker ignore
│   ├── Dockerfile              # Backend container (Node 22 Alpine)
│   ├── index.js                # Main Express server + all routes
│   ├── package.json            # Backend dependencies
│   └── node_modules/           # Backend dependencies
│
└── frontend/
    ├── .dockerignore           # Docker ignore
    ├── .gitignore
    ├── Dockerfile              # Multi-stage build
    ├── eslint.config.js         # ESLint configuration
    ├── index.html              # HTML entry point
    ├── nginx.conf              # Nginx production config
    ├── package.json            # Frontend dependencies
    ├── vite.config.ts          # Vite config
    │
    ├── public/
    │   ├── favicon.svg
    │   └── icons.svg
    │
    └── src/
        ├── App.css             # Legacy CSS
        ├── App.tsx             # Main React component
        ├── index.css           # Global styles + Tailwind
        ├── main.tsx            # React entry point
        │
        └── components/
            ├── JsonViewer.tsx      # JSON output viewer
            ├── SkeletonLoader.tsx   # Loading placeholder
            ├── SocialPreview.tsx     # Social platform previews
            ├── ThemeToggle.tsx       # Theme switcher
            └── UrlInput.tsx         # URL input form
```

---

## How It Works

### Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              Data Flow Diagram                                       │
└─────────────────────────────────────────────────────────────────────────────────────┘

    User                    Frontend                     Backend                    External
     │                         │                          │                           │
     │  1. Enter URL          │                          │                           │
     │──────────────────────►│                          │                           │
     │                         │                          │                           │
     │                         │  2. Validate URL        │                           │
     │                         │  (client-side check)    │                           │
     │                         │                          │                           │
     │                         │  3. POST /api/extract   │                           │
     │                         │  (axios)               │                           │
     │                         │────────────────────────►│                           │
     │                         │                          │                           │
     │                         │                          │  4. Fetch target URL    │
     │                         │                          │  (axios + User-Agent) │
     │                         │                          │───────────────────────►│
     │                         │                          │                           │
     │                         │                          │  5. HTML response     │
     │                         │                          │◄──────────────────────│
     │                         │                          │                           │
     │                         │                          │  6. Parse with        │
     │                         │                          │  Cheerio              │
     │                         │                          │                           │
     │                         │                          │  7. Extract metadata │
     │                         │                          │  - <title>           │
     │                         │                          │  - og:* tags         │
     │                         │                          │  - twitter:* tags    │
     │                         │                          │  - favicon           │
     │                         │                          │                           │
     │                         │                          │  8. Calculate        │
     │                         │                          │  completeness score  │
     │                         │                          │                           │
     │                         │                          │  9. Save to MongoDB  │
     │                         │                          │  (Extraction model)  │
     │                         │                          │                           │
     │                         │                          │  10. Return JSON     │
     │                         │                          │  result             │
     │                         │◄────────────────────────│                           │
     │                         │                          │                           │
     │  11. Display results   │                          │                           │
     │◄─────────────────────│                          │                           │
     │                         │                          │                           │
```

### Metadata Extraction Process

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                     Metadata Extraction Pipeline                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘

    Target HTML Page
          │
          ▼
    ┌─────────────────────────────────┐
    │  1. Fetch with Chrome User-Agent│
    │     - 10 second timeout         │
    │     - Follow redirects          │
    └────────────┬────────────────────┘
                 │
                 ▼
    ┌─────────────────────────────────┐
    │  2. Cheerio HTML Parser          │
    │     $ = cheerio.load(html)       │
    └────────────┬────────────────────┘
                 │
                 ▼
    ┌─────────────────────────────────┐
    │  3. Extract Meta Tags            │
    │                                │
    │  • <title>                     │
    │  • <meta name="description">    │
    │  • og:title                    │
    │  • og:description              │
    │  • og:image                    │
    │  • og:url                      │
    │  • og:site_name                │
    │  • twitter:title               │
    │  • twitter:description          │
    │  • twitter:image               │
    │  • twitter:card                │
    │  • favicon (link[rel="icon"])  │
    └────────────┬────────────────────┘
                 │
                 ▼
    ┌─────────────────────────────────┐
    │  4. Resolve Relative URLs        │
    │     Convert relative img src    │
    │     to absolute URLs            │
    └────────────┬────────────────────┘
                 │
                 ▼
    ┌─────────────────────────────────┐
    │  5. Calculate Completeness      │
    │     Score (0-100%)             │
    │                                │
    │  Checks:                      │
    │     ✓ title (10pt)            │
    │     ✓ description (10pt)      │
    │     ✓ image (20pt)            │
    │     ✓ og:* (20pt)             │
    │     ✓ twitter:* (20pt)        │
    │     ✓ twitter:card (10pt)      │
    │     ✓ favicon (10pt)           │
    └────────────┬────────────────────┘
                 │
                 ▼
    ┌─────────────────────────────────┐
    │  6. Return MetadataResult      │
    │     {                          │
    │       url,                     │
    │       title,                  │
    │       description,            │
    │       image,                 │
    │       siteName,              │
    │       favicon,                │
    │       og:,                    │
    │       twitter:,              │
    │       completenessScore      │
    │     }                        │
    └─────────────────────────────┘
```

### API Endpoints

| Method | Endpoint | Purpose | Request Body | Response |
|--------|----------|----------|---------------|----------|
| `GET` | `/api/health` | Health check | - | `{ status: "ok", database: "connected\|disabled" }` |
| `GET` | `/api/config` | Frontend config | - | `{ googleAnalyticsId: string }` |
| `GET` | `/api/extractions/recent` | Last 8 extractions | - | `Array<Extraction>` |
| `POST` | `/api/extract` | Extract metadata | `{ url: string }` | `MetadataResult` |

#### POST /api/extract Request

```json
{
  "url": "https://example.com/page"
}
```

#### POST /api/extract Response

```json
{
  "url": "https://example.com/page",
  "normalizedUrl": "https://example.com/page",
  "title": "Page Title",
  "description": "Page description text...",
  "image": "https://example.com/og-image.jpg",
  "siteName": "Example",
  "favicon": "https://example.com/favicon.ico",
  "og": {
    "title": "Open Graph Title",
    "description": "Open Graph Description",
    "image": "https://example.com/og-image.jpg",
    "url": "https://example.com/page",
    "siteName": "Example"
  },
  "twitter": {
    "title": "Twitter Card Title",
    "description": "Twitter Card Description",
    "image": "https://example.com/twitter-image.jpg",
    "card": "summary_large_image"
  },
  "completenessScore": 85,
  "responseTimeMs": 234
}
```

---

## Database Schema

### MongoDB Collection: `extractions`

```javascript
{
  // URL submitted by user
  url: String,           // "https://example.com/page"
  
  // URL without hash fragment (for deduplication)
  normalizedUrl: String, // "https://example.com/page"
  
  // Extraction status
  status: String,        // "success" | "error"
  
  // Extracted metadata (mixed type)
  result: Mixed,         // MetadataResult object
  
  // Error message (if status = "error")
  error: String,
  
  // Response time in milliseconds
  responseTimeMs: Number,
  
  // Client user agent
  userAgent: String,
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes

```javascript
url: 1           // For finding by URL
normalizedUrl: 1  // For deduplication
status: 1        // For filtering
```

---

## Frontend Components

| Component | File | Description |
|-----------|------|-------------|
| **App** | `App.tsx` | Root component, state management hub |
| **UrlInput** | `UrlInput.tsx` | URL input form with validation |
| **SocialPreview** | `SocialPreview.tsx` | Preview cards for 4 platforms |
| **JsonViewer** | `JsonViewer.tsx` | Raw JSON display with copy |
| **SkeletonLoader** | `SkeletonLoader.tsx` | Loading placeholder UI |
| **ThemeToggle** | `ThemeToggle.tsx` | Auto/Light/Dark theme switcher |
| **RecentScans** | (inline in App.tsx) | Last 8 extractions sidebar |

### Social Preview Platforms

The `SocialPreview.tsx` component renders link previews for:

1. **X (Twitter)** - Shows Twitter Card format with large image
2. **Facebook** - Shows Open Graph card with square image
3. **LinkedIn** - Shows professional card format
4. **WhatsApp** - Shows mobile link preview

---

## Getting Started

### Prerequisites

- Node.js 22+
- MongoDB (optional, for logging)
- Docker + Docker Compose (optional)

### Development Mode

**Run everything with a single command:**

```bash
# Install all dependencies
npm run install:all

# Start frontend + backend concurrently
npm run dev
```

**Or run individually:**

```bash
# Frontend only (http://localhost:5173)
npm run dev:frontend

# Backend only (http://localhost:5000)
npm run dev:backend
```

### Docker Deployment

```bash
# Build and start all services
npm run docker:up

# Stop all services
npm run docker:down
```

### Port Mapping

| Service | Dev Port | Docker Port |
|---------|----------|-------------|
| Frontend (Vite) | 5173 | 8080 (Nginx) |
| Backend (Express) | 5000 | 5000 |
| MongoDB | 27017 | 27017 |

---

## Environment Variables

### Local Development (.env)

```env
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/SocialLink
GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Docker (.env for docker-compose)

```env
PORT=5000
CLIENT_ORIGIN=http://localhost:8080
MONGODB_URI=mongodb://mongo:27017/SocialLink
MONGODB_USER=metapeek
MONGODB_PASSWORD=metapeek_password
GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

---

## Production Build

```bash
# Build frontend for production
npm run build

# Output: frontend/dist/
```

The production build is served via Nginx, which:
- Serves static files from `frontend/dist/`
- Proxies `/api/*` requests to the backend
- Provides SPA fallback (`index.html` for all routes)

---

## License
```
MIT License

Copyright (c) 2026 Ayaan

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

```