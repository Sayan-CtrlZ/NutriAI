# Gunicorn configuration file
import multiprocessing

# Bind to 0.0.0.0 to enable external access (required for Render/Docker)
bind = "0.0.0.0:10000"

# Workers: Formula is (2 x num_cores) + 1
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "gthread"  # Headers/Threads handling
threads = 2

# Timeouts (Gemini can be slow, so we increase default timeout)
timeout = 120
keepalive = 5

# Logging
accesslog = "-"
errorlog = "-"
loglevel = "info"
