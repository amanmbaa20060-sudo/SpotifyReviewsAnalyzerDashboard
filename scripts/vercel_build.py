"""Vercel build step: validate proxy config and write dashboard/static/js/config.js."""

from __future__ import annotations

import os
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
CONFIG_PATH = PROJECT_ROOT / "dashboard" / "static" / "js" / "config.js"


def backend_url_configured() -> bool:
    return bool((os.getenv("API_BASE_URL") or os.getenv("RENDER_API_URL") or "").strip())


def main() -> None:
    # Frontend always calls same-origin /api; Vercel api/[...path].js proxies to Render.
    CONFIG_PATH.parent.mkdir(parents=True, exist_ok=True)
    CONFIG_PATH.write_text(
        "window.APP_CONFIG = {\n  apiBase: '/api',\n};\n",
        encoding="utf-8",
    )
    print(f"Wrote {CONFIG_PATH} with apiBase='/api' (Vercel proxy)")

    if os.getenv("VERCEL") and not backend_url_configured():
        print(
            "ERROR: API_BASE_URL is not set on Vercel. "
            "Add it under Settings → Environment Variables, then redeploy.",
            file=sys.stderr,
        )
        sys.exit(1)


if __name__ == "__main__":
    main()
