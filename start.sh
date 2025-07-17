#!/bin/bash
set -e

# Use the PORT environment variable or default to 3000
PORT=${PORT:-3000}

echo "Starting FastAPI application on port $PORT"

# Start the application
exec uvicorn main:app --host 0.0.0.0 --port $PORT 