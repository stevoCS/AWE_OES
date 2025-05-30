import os

# Server socket
bind = f"0.0.0.0:{os.getenv('PORT', 8000)}"
backlog = 2048

# Worker processes
workers = 1
worker_class = "uvicorn.workers.UvicornWorker"
worker_connections = 1000
timeout = 30
keepalive = 2

# Restart workers
max_requests = 1000
max_requests_jitter = 50

# Logging
accesslog = "-"
errorlog = "-"
loglevel = "info"
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s"'

# Process naming
proc_name = "awe_electronics_api"

# Server mechanics
daemon = False
pidfile = None
tmp_upload_dir = None
user = None
group = None

# SSL
keyfile = None
certfile = None 