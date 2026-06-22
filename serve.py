#!/usr/bin/env python3
"""Static server for the ILAB clone.

The original site is plain static HTML/CSS/JS. The only wrinkle is that the
"start a project" contact overlay is loaded from `contact_form.php` (a file that
holds rendered HTML). A default static server would offer .php as a download, so
we map .php -> text/html here. Run:  python3 serve.py  then open http://localhost:8000
"""
import http.server
import os
import socketserver

PORT = 8000
os.chdir(os.path.dirname(os.path.abspath(__file__)))


class Handler(http.server.SimpleHTTPRequestHandler):
    def guess_type(self, path):
        if path.endswith(".php"):
            return "text/html"
        return super().guess_type(path)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


if __name__ == "__main__":
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("127.0.0.1", PORT), Handler) as httpd:
        print(f"ILAB clone serving at http://localhost:{PORT}")
        httpd.serve_forever()
