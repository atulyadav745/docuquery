#!/bin/bash

echo "Testing production deployment..."

# Activate virtual environment if it exists
if [ -d "../venv" ]; then
    source ../venv/bin/activate
fi

# Install production dependencies
echo "Installing production dependencies..."
pip install -r requirements.txt

# Run database migrations
echo "Running database migrations..."
alembic upgrade head

# Test the application using gunicorn
echo "Starting server with gunicorn..."
gunicorn -c gunicorn_config.py app.main:app 