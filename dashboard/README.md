# Spotify App Review Analyzer — Dashboard (Phase 6)

Stakeholder dashboard UI based on the Google Stitch mockup (`assets/design-reference.png`).

## Run locally (with API)

From project root:

```bash
python -m spotify_app_review_analyzer.api.cli --port 8000
```

Open http://127.0.0.1:8000

The dashboard uses `/api` on the same origin when served by FastAPI.

## Deploy frontend on Vercel

The API runs on Render. Vercel serves the static `dashboard/` and proxies `/api/*` to Render via `api/[...path].js`.

1. Import the GitHub repo in [Vercel](https://vercel.com/new).
2. Leave **Root Directory** as the repo root (default).
3. Add an environment variable (required for the API proxy):

| Variable | Example | Required |
|----------|---------|----------|
| `API_BASE_URL` | `https://spotify-review-analyzer-api.onrender.com` | Yes |

No trailing slash. The frontend always calls same-origin `/api`; the Vercel serverless proxy forwards to Render.

4. Deploy, then verify:
   - `https://<your-vercel-app>.vercel.app/api/health-proxy` → `backend_configured: true`
   - `https://<your-vercel-app>.vercel.app/api/overview` → JSON with KPIs

5. If data is missing, **Redeploy** after saving env vars (build fails if `API_BASE_URL` is missing on Vercel).

## Structure

```
dashboard/
  index.html          # Main SPA shell
  assets/
    design-reference.png
  static/
    css/dashboard.css
    js/dashboard.js
```

## API (FastAPI)

| Endpoint | Description |
|----------|-------------|
| `GET /api/overview` | KPIs, ratings, sentiment |
| `GET /api/reviews` | Paginated reviews with filters |
| `GET /api/aggregates/sentiment` | Sentiment by source |
| `GET /api/aggregates/themes` | Top themes |
| `GET /api/aggregates/ratings` | Star rating distribution |
| `GET /api/research-questions` | RQ1–RQ6 with citations |
| `GET /api/word-cloud` | Theme word cloud data |
| `POST /api/agent/query` | Groq agent Q&A |
| `GET /api/export/csv` | CSV export |
| `GET /api/export/markdown` | RQ briefing markdown |

## Views

- **Overview** — KPIs, active RQ panel, citations, feedback, word cloud
- **Sentiment** — Source sentiment table + rating chart
- **Themes** — Full theme list + unmet needs
- **Research** — All six RQ cards
- **Agent Chat** — Ask grounded research questions
