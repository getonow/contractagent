FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create entrypoint script directly in Dockerfile to avoid line ending issues
RUN echo '#!/bin/bash' > /app/start.sh && \
    echo 'echo "=== Environment Variables ==="' >> /app/start.sh && \
    echo 'env | sort' >> /app/start.sh && \
    echo 'echo "============================="' >> /app/start.sh && \
    echo 'if [ -z "$PORT" ]; then' >> /app/start.sh && \
    echo '    echo "PORT not set, using default 3000"' >> /app/start.sh && \
    echo '    PORT=3000' >> /app/start.sh && \
    echo 'fi' >> /app/start.sh && \
    echo 'echo "Starting FastAPI application on port $PORT"' >> /app/start.sh && \
    echo 'exec uvicorn main:app --host 0.0.0.0 --port $PORT' >> /app/start.sh && \
    chmod +x /app/start.sh

# Expose port
EXPOSE 3000

# Use the entrypoint script
ENTRYPOINT ["/app/start.sh"] 