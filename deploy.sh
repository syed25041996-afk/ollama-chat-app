#!/bin/bash

set -e

echo "🚀 Starting deployment of Ollama application..."

# Navigate to the project directory (assuming script is run from project root)
cd "$(dirname "$0")"

# Pull latest changes from the repository
echo "📥 Pulling latest changes from Git repository..."
git pull

# Stop and remove existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Pull latest base images
echo "📥 Pulling latest base images..."
docker-compose pull

# Build custom images
echo "🔨 Building application images..."
docker-compose build --no-cache

# Start services in detached mode
echo "▶️  Starting services..."
docker-compose up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if services are running
echo "🔍 Checking service status..."
docker-compose ps

# Optional: Run health checks
echo "🏥 Running health checks..."
# Check API health
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ API is healthy"
else
    echo "❌ API health check failed"
    exit 1
fi

# Check frontend (basic check)
if curl -f http://localhost:4200 > /dev/null 2>&1; then
    echo "✅ Frontend is accessible"
else
    echo "❌ Frontend check failed"
fi
