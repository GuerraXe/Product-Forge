import json
from http.server import BaseHTTPRequestHandler, HTTPServer

from functions import analyze_part

FORCE = 500

# Basic stdlib POST endpoint with set force. Can be changed above.
class ResultsHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "http://localhost:5173")
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
        self.send_header("Access-Control-Allow-Origin", "http://localhost:5173")
        self.end_headers()
        self.wfile.write(body)


if __name__ == "__main__":
    print("Results API listening on http://127.0.0.1:8000")
    HTTPServer(("127.0.0.1", 8000), ResultsHandler).serve_forever()
