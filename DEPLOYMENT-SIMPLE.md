# Simple Deployment Guide

This guide explains how to deploy your Ollama Local Connect application to server 192.168.1.108 using the simple GitHub Actions workflow.

## Prerequisites

### Server Setup
1. **Install Docker and Docker Compose**:
   ```bash
   # On Ubuntu/Debian
   sudo apt update
   sudo apt install docker.io docker-compose
   sudo systemctl enable docker
   sudo systemctl start docker
   ```

2. **Create deployment directory**:
   ```bash
   ssh your-user@192.168.1.108
   sudo mkdir -p /opt/ollama-local-connect
   sudo chown $(whoami):$(whoami) /opt/ollama-local-connect
   ```

3. **Copy application files**:
   ```bash
   # From your local machine
   scp -r . your-user@192.168.1.108:/opt/ollama-local-connect/
   ```

4. **Set up initial deployment**:
   ```bash
   ssh your-user@192.168.1.108
   cd /opt/ollama-local-connect
   docker-compose up -d
   ```

## GitHub Actions Setup

### 1. Create GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions, and add:

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `SERVER_USER` | SSH username for server | `root` or `deploy` |
| `SERVER_SSH_KEY` | Private SSH key for server access | Your private key content |

### 2. Configure SSH Access

1. **Generate SSH key pair** (if not already done):
   ```bash
   ssh-keygen -t rsa -b 4096 -C "deploy@yourdomain.com"
   ```

2. **Add public key to server**:
   ```bash
   ssh-copy-id -i ~/.ssh/id_rsa.pub your-user@192.168.1.108
   ```

3. **Test SSH connection**:
   ```bash
   ssh your-user@192.168.1.108
   ```

## Deployment Process

### Automatic Deployment

1. **Push to main/master branch**:
   ```bash
   git add .
   git commit -m "Update application"
   git push origin main
   ```

2. **GitHub Actions will automatically**:
   - Checkout your code
   - SSH to your server
   - Pull latest changes
   - Rebuild and restart containers
   - Clean up old images

### Manual Deployment

If you prefer manual deployment:

```bash
# SSH to server
ssh your-user@192.168.1.108

# Navigate to app directory
cd /opt/ollama-local-connect

# Pull latest changes
git pull origin main

# Restart application
docker-compose down
docker-compose up -d --build

# Clean up
docker image prune -f
```

## Monitoring

### Check Application Status

```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs -f

# Test application
curl http://192.168.1.108:8080/
```

### Check GitHub Actions

1. Go to your GitHub repository
2. Click on "Actions" tab
3. View workflow runs and logs

## Troubleshooting

### Common Issues

1. **SSH Connection Failed**
   - Verify SSH key is correctly added to GitHub secrets
   - Check server SSH service is running
   - Ensure firewall allows SSH connections

2. **Docker Compose Failed**
   - Check Docker and Docker Compose are installed
   - Verify docker-compose.yml syntax
   - Check if ports are available

3. **Application Not Accessible**
   - Verify port 8080 is open on server
   - Check firewall settings
   - Ensure application is running: `docker-compose ps`

### Debug Commands

```bash
# Check SSH connection
ssh -v your-user@192.168.1.108

# Check Docker status
sudo systemctl status docker

# Check Docker Compose
docker-compose version

# View GitHub Actions logs
# Go to GitHub → Actions → Workflow Runs → View Logs
```

## Security Notes

- Use SSH keys instead of passwords
- Restrict SSH access to specific IP addresses if possible
- Regularly update server and Docker
- Monitor GitHub Actions logs for security issues

## Access URLs

- **Application**: http://192.168.1.108:8080
- **GitHub Actions**: Your repository → Actions

Your application is now ready for simple, automated deployment! 🚀