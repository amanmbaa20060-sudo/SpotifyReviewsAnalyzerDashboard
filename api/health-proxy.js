/** Quick check: GET /api/health-proxy — confirms Vercel proxy env is set (not the secret). */

module.exports = (req, res) => {
  const configured = Boolean(
    (process.env.API_BASE_URL || process.env.RENDER_API_URL || "").trim(),
  );
  res.status(200).json({
    proxy: "ok",
    backend_configured: configured,
    hint: configured
      ? "Proxy is configured. Try /api/overview on your Vercel domain."
      : "Set API_BASE_URL in Vercel Environment Variables and redeploy.",
  });
};
