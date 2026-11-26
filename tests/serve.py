"""Static server for the browser tests: python tests/serve.py [port] (default 8765), from anywhere.
The stock `python -m http.server` keeps a listen backlog of 5, so on Windows it refuses some of the
~25 parallel requests the app makes on load (css, js modules, fonts) and a module fails to load."""
import functools, http.server, pathlib, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent


class Server(http.server.ThreadingHTTPServer):
    request_queue_size = 128


port = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(ROOT))
handler.log_message = lambda *a: None
print(f'serving {ROOT} on http://localhost:{port}')
Server(('localhost', port), handler).serve_forever()
