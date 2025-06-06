#!/bin/bash

# Activate virtual environment
source venv/bin/activate

# Export production environment variables
export PORT=${PORT:-8000}
export DATABASE_URL=${DATABASE_URL:-"sqlite:///./sql_app.db"}
export ENVIRONMENT="production"

# Start Gunicorn with Uvicorn workers
exec gunicorn backend.app.main:app \
    --workers 4 \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:$PORT \
    --timeout 120 \
    --access-logfile - \
    --error-logfile - \
    --log-level info 