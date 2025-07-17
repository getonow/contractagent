#!/bin/bash

# Debug: Show all environment variables
echo "=== Environment Variables ==="
env | sort
echo "============================="

# Set default port if not provided
if [ -z "$PORT" ]; then
    echo "PORT not set, using default 3000"
    PORT=3000
fi

echo "Starting FastAPI application on port $PORT"

# Start the application
exec uvicorn main:app --host 0.0.0.0 --port $PORT 