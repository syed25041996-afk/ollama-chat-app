# Deployment Guide

This guide explains how to deploy your Ollama Local Connect application to your server at 192.168.1.108.

## Prerequisites

### Server Requirements
- **Operating System**: Linux (Ubuntu 20.04+ recommended)
- **Docker**: Version 20.0+ installed
- **Docker Compose**: Version 2.0+ installed
- **SSH Access**: Root or sudo access to the server
- **Port 8080**: Open and available on the server

### GitHub Repository Setup
- GitHub repository with your application code
- GitHub Actions enabled for the repository

## Server Setup

### 1. Install Docker and Docker Compose

```bash
# Update package list
sudo apt update

# Install Docker
sudo apt install docker.io
sudo systemctl enable docker
sudo systemctl start docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

### 2. Configure Firewall (if needed)

```bash
# Allow port 8080
sudo ufw allow 8080

# If using SSH on non-standard port, allow that too
sudo ufw allow 22
```

### 3. Create Deployment Directory

```bash
ssh your-server-user@192.168.1.108
sudo mkdir -p /opt/ollama-local-connect
sudo chown $(whoami):$(whoami) /opt/ollama-local-connect
```

## GitHub Actions Setup

### 1. Create GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions, and add the following secrets:

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `SERVER_HOST` | Server IP address | `192.168.1.108` |
| `SERVER_USER` | SSH username | `root` or `ubuntu` |
| `SERVER_PORT` | SSH port (optional) | `22` |
| `SERVER_SSH_KEY` | Private SSH key for server access | Your private key |

### 2. Generate SSH Key Pair (if not already done)

```bash
# Generate SSH key pair
ssh-keygen -t rsa -b 4096 -C "ollama-deploy@yourdomain.com"

# Copy public key to server
ssh-copy-id -i ~/.ssh/id_rsa.pub your-server-user@192.168.1.108

# Test SSH connection
ssh your-server-user@192.168.1.108
```

### 3. Add Public Key to Server Authorized Keys

```bash
# On your server
echo "your-public-key-content" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

## Deployment Methods

### Method 1: GitHub Actions (Recommended)

The GitHub Actions workflow will automatically deploy your application when you push to the main/master branch.

```bash
# Push to trigger deployment
git add .
git commit -m "Deploy to production"
git push origin main
```

### Method 2: Manual Deployment

Use the provided deployment script for manual deployment:

```bash
# Make script executable
chmod +x scripts/deploy.sh

# Set environment variables
export SERVER_HOST=192.168.1.108
export SERVER_USER=root
export SERVER_PORT=22

# Run deployment script
./scripts/deploy.sh
```

### Method 3: Manual SSH Deployment

```bash
# SSH into server
ssh your-server-user@192.168.1.108

# Navigate to deployment directory
cd /opt/ollama-local-connect

# Copy docker-compose.yml from local machine
scp docker-compose.yml your-server-user@192.168.1.108:/opt/ollama-local-connect/

# Build and run
docker-compose up -d
```

## Monitoring and Maintenance

### Check Application Status

```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs -f

# Check application health
curl http://192.168.1.108:8080/
```

### Update Application

```bash
# Pull latest changes
git pull origin main

# Redeploy
git push origin main  # Triggers GitHub Actions
# OR
./scripts/deploy.sh   # Manual deployment
```

### Backup Configuration

```bash
# Backup docker-compose configuration
scp your-server-user@192.168.1.108:/opt/ollama-local-connect/docker-compose.yml .

# Backup any persistent data
scp -r your-server-user@192.168.1.108:/opt/ollama-local-connect/config .
```

## Troubleshooting

### Common Issues

1. **Permission Denied**
   ```bash
   # Fix permissions
   sudo chown -R $(whoami):$(whoami) /opt/ollama-local-connect
   ```

2. **Port Already in Use**
   ```bash
   # Check what's using port 8080
   sudo netstat -tlnp | grep 8080
   
   # Stop conflicting service
   sudo systemctl stop conflicting-service
   ```

3. **Docker Not Running**
   ```bash
   # Start Docker
   sudo systemctl start docker
   sudo systemctl enable docker
   ```

4. **GitHub Actions Failures**
   - Check GitHub Actions logs in repository
   - Verify SSH key permissions
   - Ensure server is accessible

### Debug Commands

```bash
# Check Docker daemon
sudo systemctl status docker

# Check Docker Compose
docker-compose version

# Test SSH connection
ssh -v your-server-user@192.168.1.108

# Check firewall
sudo ufw status
```

## Security Considerations

1. **Use SSH Keys**: Never use password authentication for automated deployments
2. **Limit SSH Access**: Restrict SSH access to specific IP addresses
3. **Use HTTPS**: Configure SSL/TLS for production (see nginx.conf)
4. **Regular Updates**: Keep Docker and the server updated
5. **Monitor Logs**: Regularly check application and system logs

## Production Recommendations

1. **Reverse Proxy**: Use nginx or similar for SSL termination
2. **Load Balancer**: For high availability setups
3. **Monitoring**: Set up monitoring and alerting
4. **Backups**: Regular backup of configuration and data
5. **SSL Certificates**: Use Let's Encrypt or similar for HTTPS

## Support

For issues related to:
- **Application**: Check application logs with `docker-compose logs`
- **Deployment**: Check GitHub Actions logs
- **Server**: Check system logs with `journalctl -u docker`
- **Network**: Check firewall and network connectivity

Your application should now be accessible at: http://192.168.1.108:8080