"""PolicyLens Workbench — Flask host.

This Flask app does one job: serve the production React build (the `dist/`
folder) as static files. The application itself is unchanged — all policy
logic, evaluation, and audit-pack generation still run in the browser. Flask is
only the web server.

Usage:
    1. Build the front end (once, or after any UI change):
         npm install
         npm run build
    2. Run the server:
         pip install -r requirements.txt
         python server.py
    3. Open http://localhost:8000
"""
from __future__ import annotations

import os

from flask import Flask, send_from_directory

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DIST_DIR = os.path.join(BASE_DIR, "dist")

app = Flask(__name__, static_folder=None)


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve(path: str):
    """Serve a built asset if it exists, otherwise fall back to index.html.

    The app is a single-page app, so any unknown route returns index.html and
    the client handles it.
    """
    full_path = os.path.join(DIST_DIR, path)
    if path and os.path.isfile(full_path):
        return send_from_directory(DIST_DIR, path)
    return send_from_directory(DIST_DIR, "index.html")


if __name__ == "__main__":
    if not os.path.isdir(DIST_DIR):
        raise SystemExit(
            "dist/ not found. Build the front end first:\n"
            "    npm install && npm run build"
        )
    port = int(os.environ.get("PORT", "8000"))
    app.run(host="0.0.0.0", port=port, debug=False)
