#!/usr/bin/env python3
"""Приёмник снапшотов: POST /save?name=<block> — пишет тело в figma-snap/<block>.json"""
import os, sys
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'figma-snap')
os.makedirs(OUT, exist_ok=True)

class H(BaseHTTPRequestHandler):
    def log_message(self, *a): pass
    def _cors(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
    def do_OPTIONS(self):
        self.send_response(204); self._cors(); self.end_headers()
    def do_POST(self):
        q = parse_qs(urlparse(self.path).query)
        name = q.get('name', ['unnamed'])[0]
        name = ''.join(c for c in name if c.isalnum() or c in '-_')
        n = int(self.headers.get('Content-Length', 0))
        data = self.rfile.read(n)
        with open(os.path.join(OUT, name + '.json'), 'wb') as f:
            f.write(data)
        self.send_response(200); self._cors(); self.end_headers()
        self.wfile.write(b'ok')

HTTPServer(('127.0.0.1', 8932), H).serve_forever()
