# Docker Deployment Guide

This guide explains how to deploy your Ollama Local Connect application using Docker.

## Quick Start

### 1. Build and Run with Docker Compose (Recommended)

```bash
# Build and start the production container
docker-compose up -d

# View logs
docker-compose logs -f ollama-gui

# Stop the container
docker-compose down
```

### 2. Build and Run with Docker

```bash
# Build the production image
docker build -t ollama-gui:latest .

# Run the container
docker run -d -p 8080:8080 --name ollama-gui ollama-gui:latest

# View logs
docker logs ollama-gui

# Stop the container
docker stop ollama-gui
```

## Development Mode

### Using Docker Compose

```bash
# Start development container with hot reload
docker-compose --profile dev up -d

# View logs
docker-compose logs -f ollama-gui-dev

# Stop development container
docker-compose --profile dev down
```

### Using Docker

```bash
# Build development image
docker build -t ollama-gui:dev --target dev .

# Run development container
docker run -d -p 8081:8081 -v $(pwd):/app --name ollama-gui-dev ollama-gui:dev

# View logs
docker logs ollama-gui-dev

# Stop development container
docker stop ollama-gui-dev
```

## Configuration

### Environment Variables

- `NODE_ENV`: Set to `production` or `development`
- `PORT`: Port number (default: 8080 for production, 8081 for development)

### Ports

- **Production**: Port 8080
- **Development**: Port 8081

### Volumes

- **Config**: Optional persistent configuration storage

## Accessing the Application

- **Production**: http://localhost:8080
- **Development**: http://localhost:8081

## Health Checks

The production container includes health checks that verify the application is running correctly. You can check the health status with:

```bash
docker inspect --format='{{json .State.Health}}' ollama-gui
```

## Building for Production

The Dockerfile uses a multi-stage build process:

1. **Base Stage**: Node.js Alpine base image
2. **Deps Stage**: Installs only production dependencies
3. **Runner Stage**: Creates the final production image with minimal size

This approach ensures:
- Smaller image size
- Faster builds
- Better security (no build tools in final image)
- Optimized for production deployment

## Troubleshooting

### Common Issues

1. **Port already in use**: Change the port mapping in docker-compose.yml
2. **Build fails**: Ensure you have Docker installed and running
3. **Application not accessible**: Check firewall settings and port mappings

### Debug Commands

```bash
# Check container status
docker ps

# Check container logs
docker logs <container-name>

# Enter container shell
docker exec -it <container-name> /bin/sh

# View container health
docker inspect <container-name>
```

## Production Deployment

For production deployment, consider:

1. **Reverse Proxy**: Use Nginx or Traefik for SSL termination
2. **Load Balancer**: For high availability setups
3. **Persistent Storage**: Mount volumes for configuration persistence
4. **Monitoring**: Add health checks and monitoring
5. **Security**: Use secrets for sensitive configuration

## Docker Compose Profiles

- **Default**: Production container only
- **dev**: Development container with hot reload

Use `--profile dev` to include development services.