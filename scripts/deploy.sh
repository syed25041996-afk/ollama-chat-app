#!/bin/bash

# Ollama Local Connect Deployment Script
# This script can be used for manual deployment or as a reference for the GitHub Actions workflow

set -e

# Configuration
SERVER_HOST="${SERVER_HOST:-192.168.1.108}"
SERVER_USER="${SERVER_USER:-root}"
SERVER_PORT="${SERVER_PORT:-22}"
IMAGE_NAME="${IMAGE_NAME:-ollama-local-connect}"
CONTAINER_NAME="${CONTAINER_NAME:-ollama-gui}"

echo "🚀 Starting deployment to $SERVER_HOST..."

# Check if SSH key is available
if [ -z "$SSH_KEY" ]; then
    echo "⚠️  Warning: SSH_KEY environment variable not set"
    echo "Please set the SSH_KEY environment variable or use SSH agent forwarding"
fi

# Create deployment directory on server
echo "📁 Creating deployment directory..."
ssh -p "$SERVER_PORT" "$SERVER_USER@$SERVER_HOST" "mkdir -p /opt/$IMAGE_NAME"

# Copy docker-compose.yml to server
echo "📋 Copying docker-compose.yml to server..."
scp -P "$SERVER_PORT" docker-compose.yml "$SERVER_USER@$SERVER_HOST:/opt/$IMAGE_NAME/"

# Copy nginx configuration if needed
if [ -f "nginx.conf" ]; then
    echo "🔧 Copying nginx configuration..."
    scp -P "$SERVER_PORT" nginx.conf "$SERVER_USER@$SERVER_HOST:/opt/$IMAGE_NAME/"
fi

# SSH into server and deploy
echo "🐳 Deploying to server..."
ssh -p "$SERVER_PORT" "$SERVER_USER@$SERVER_HOST" << EOF
    cd /opt/$IMAGE_NAME
    
    # Pull the latest image from GitHub Container Registry
    echo "📥 Pulling latest image..."
    docker pull ghcr.io/$GITHUB_REPOSITORY:latest || docker pull ollama-local-connect:latest
    
    # Stop existing containers
    echo "🛑 Stopping existing containers..."
    docker-compose down || true
    
    # Update docker-compose.yml with new image if needed
    if [ -n "$GITHUB_REPOSITORY" ]; then
        sed -i "s|image: .*|image: ghcr.io/$GITHUB_REPOSITORY:latest|" docker-compose.yml
    fi
    
    # Start the application
    echo "🚀 Starting application..."
    docker-compose up -d
    
    # Wait for application to start
    echo "⏳ Waiting for application to start..."
    sleep 10
    
    # Check if deployment was successful
    echo "✅ Checking deployment status..."
    if curl -f http://localhost:8080/ > /dev/null 2>&1; then
        echo "✅ Deployment successful!"
        echo "🌐 Application available at: http://$SERVER_HOST:8080"
    else
        echo "❌ Deployment failed! Application not responding."
        docker-compose logs
        exit 1
    fi
    
    # Clean up old images
    echo "🧹 Cleaning up old images..."
    docker image prune -f
EOF

echo "🎉 Deployment completed successfully!"