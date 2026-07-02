/** Proxy /api/* on Vercel to the Render backend (avoids CORS and cross-origin config). */

const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
  "host",
]);

function getBackendBase() {
  const raw = process.env.API_BASE_URL || process.env.RENDER_API_URL || "";
  return raw.trim().replace(/\/$/, "");
}

function buildTargetUrl(req, pathSegments) {
  const base = getBackendBase();
  const subpath = Array.isArray(pathSegments) ? pathSegments.join("/") : pathSegments || "";
  const queryIndex = req.url?.indexOf("?") ?? -1;
  const search = queryIndex >= 0 ? req.url.slice(queryIndex) : "";
  return `${base}/api/${subpath}${search}`;
}

function forwardHeaders(req) {
  const headers = {};
  for (const [key, value] of Object.entries(req.headers)) {
    if (HOP_BY_HOP.has(key.toLowerCase())) continue;
    if (value === undefined) continue;
    headers[key] = Array.isArray(value) ? value.join(", ") : value;
  }
  return headers;
}

module.exports = async (req, res) => {
  const base = getBackendBase();
  if (!base) {
    res.status(500).json({
      error: "API_BASE_URL is not configured on Vercel",
      hint:
        "Vercel → Project → Settings → Environment Variables → add API_BASE_URL = https://your-app.onrender.com, then Redeploy.",
    });
    return;
  }

  const target = buildTargetUrl(req, req.query.path);
  const method = req.method || "GET";

  const init = {
    method,
    headers: forwardHeaders(req),
  };

  if (!["GET", "HEAD"].includes(method)) {
    if (req.body !== undefined && req.body !== null && req.body !== "") {
      init.body = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
      if (!init.headers["content-type"] && !init.headers["Content-Type"]) {
        init.headers["Content-Type"] = "application/json";
      }
    }
  }

  try {
    const upstream = await fetch(target, init);
    res.status(upstream.status);
    upstream.headers.forEach((value, key) => {
      if (!HOP_BY_HOP.has(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });
    const buffer = Buffer.from(await upstream.arrayBuffer());
    res.send(buffer);
  } catch (error) {
    res.status(502).json({
      error: "Could not reach Render API",
      target,
      detail: error instanceof Error ? error.message : String(error),
    });
  }
};
