
import http.server
import socketserver
import os

PORT = 3040
DIRECTORY = "dist"

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        # Check if file exists, if not serve index.html
        path = self.translate_path(self.path)
        if not os.path.exists(path) or os.path.isdir(path):
             # Check if it maps to a real file, otherwise index.html
             if not os.path.exists(path + "index.html"):
                 self.path = "/index.html"
        
        return http.server.SimpleHTTPRequestHandler.do_GET(self)

print(f"Serving SPA on http://localhost:{PORT}")
with socketserver.TCPServer(("", PORT), Handler) as httpd:
    httpd.serve_forever()
