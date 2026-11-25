import json
import os
import sys
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse

from functions import analyze_part, test_functions

FORCE = 500

# Front-end dev servers on this machine, on any port (Vite moves to 5174+ if 5173 is busy)
LOCAL_HOSTS = ("localhost", "127.0.0.1")


def allowed_origin(origin):
    """ Returns the origin if it's a local http dev server, otherwise None. """
    if not origin:
        return None
    parsed = urlparse(origin)
    if parsed.scheme == "http" and parsed.hostname in LOCAL_HOSTS:
        return origin
    return None


# Basic stdlib POST endpoint with set force. Can be changed above.
class ResultsHandler(BaseHTTPRequestHandler):
    def send_cors_headers(self):
        origin = allowed_origin(self.headers.get("Origin"))
        if origin:
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Vary", "Origin")

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_cors_headers()
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_POST(self):
        if self.path != "/analyze":
            self.send_error(404)
            return

        try:
            length = int(self.headers.get("Content-Length", "0"))
            data = json.loads(self.rfile.read(length))
            result = analyze_part(
                data["shape"],
                data["scale"],
                data["material"],
                data.get("force", FORCE),
            )
            status = 200 if "error" not in result else 400
        except (KeyError, TypeError, ValueError, json.JSONDecodeError) as error:
            result = {"error": f"Invalid request: {error}"}
            status = 400

        body = json.dumps(result).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_cors_headers()
        self.end_headers()
        self.wfile.write(body)


class ResultsServer(HTTPServer):
    # On Windows, address reuse lets a second server start on a port that's already
    # in use, so two backends could silently share port 8000. Turn it off there.
    allow_reuse_address = os.name != "nt"


if __name__ == "__main__":
    # "python main.py --test" runs the self-test instead of starting the server
    if "--test" in sys.argv:
        sys.exit(test_functions())

    try:
        server = ResultsServer(("127.0.0.1", 8000), ResultsHandler)
    except OSError:
        print("Port 8000 is already in use. Is the backend already running in another terminal?")
        sys.exit(1)

    print("Results API listening on http://127.0.0.1:8000")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        # Ctrl+C: stop quietly
        pass
    finally:
        server.server_close()

# DISCLAIMER: densities, yield/ultimate-strengths are averaged for simplicity (strengths measured in MPa)
#             data is sourced & averaged from matweb & amesweb : https://www.matweb.com/index.aspx, https://amesweb.info/Materials/Aluminum-Yield-Tensile-Strength.aspx
