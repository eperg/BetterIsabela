#!/usr/bin/env python3
"""
Local Development Server with Clean URL Support
Mimics Apache's mod_rewrite behavior for testing cPanel deployment locally
"""

import os
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, unquote


class CleanURLHandler(SimpleHTTPRequestHandler):
    """
    Custom HTTP handler that supports clean URLs (without .html extension)
    Mimics the .htaccess rewrite rules used in cPanel deployment
    """
    def _rewrite_clean_url(self):
        """Map an extensionless URL to its matching HTML file, when present."""
        parsed_path = urlparse(self.path)
        decoded_path = unquote(parsed_path.path)
        file_path = super().translate_path(decoded_path)

        if os.path.exists(file_path) or decoded_path.endswith('/'):
            return

        html_path = file_path + '.html'
        if os.path.isfile(html_path):
            self.path = parsed_path.path + '.html'
            if parsed_path.query:
                self.path += '?' + parsed_path.query

    def do_GET(self):
        self._rewrite_clean_url()
        return super().do_GET()

    def do_HEAD(self):
        self._rewrite_clean_url()
        return super().do_HEAD()

    def send_error(self, code, message=None, explain=None):
        """Use the site's error document while preserving the HTTP 404 status."""
        if code == 404 and os.path.isfile('404.html'):
            with open('404.html', 'rb') as error_page:
                content = error_page.read()
            self.send_response(code, message)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Content-Length', str(len(content)))
            self.end_headers()
            if self.command != 'HEAD':
                self.wfile.write(content)
            return
        return super().send_error(code, message, explain)

    def log_message(self, format, *args):
        # Custom logging with color for clean URL rewrites
        message = format % args
        if '.html' not in self.path and 'GET' in message:
            # This was a clean URL that got rewritten
            print(f"\033[0;32m{self.address_string()}\033[0m - {message}")
        else:
            print(f"{self.address_string()} - {message}")

def run_server(port=8888, directory='dist'):
    """Run the development server with clean URL support"""
    
    # Change to the specified directory
    if directory != '.':
        if not os.path.isdir(directory):
            print(f"Error: Directory '{directory}' not found")
            sys.exit(1)
        os.chdir(directory)
    
    server_address = ('', port)
    httpd = ThreadingHTTPServer(server_address, CleanURLHandler)
    
    print("=" * 60)
    print("Clean URL Development Server")
    print("=" * 60)
    print(f"Serving from: {os.getcwd()}")
    print(f"Server running at: http://localhost:{port}")
    print()
    print("Clean URLs supported:")
    print("  /services/certificates  →  serves certificates.html")
    print("  /legislative/resolution-framework  →  serves resolution-framework.html")
    print()
    print("Press Ctrl+C to stop")
    print("=" * 60)
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
        httpd.server_close()

if __name__ == '__main__':
    import argparse

    parser = argparse.ArgumentParser(description='Local server with clean URL support')
    parser.add_argument('-p', '--port', type=int, default=8888, help='Port number (default: 8888)')
    parser.add_argument('-d', '--directory', type=str, default='dist', help='Directory to serve (default: dist)')
    args = parser.parse_args()
    
    run_server(port=args.port, directory=args.directory)
