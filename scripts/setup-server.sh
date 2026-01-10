#!/bin/bash

# Server Setup Script for Ollama Local Connect
# Run this script on your server to set up the environment

set -e

echo "🚀 Setting up server environment for Ollama Local Connect..."

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Please run this script as root"
    exit 1
fi

# Update system
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Install required packages
echo "🔧 Installing required packages..."
apt install -y \
    curl \
    wget \
    git \
    ufw \
    fail2ban \
    nginx

# Install Docker
echo "🐳 Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
systemctl enable docker
systemctl start docker
rm get-docker.sh

# Install Docker Compose
echo "📦 Installing Docker Compose..."
DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep '"tag_name"' | sed -E 's/.*"v([^"]+)".*/\1/')
curl -L "https://github.com/docker/compose/releases/download/v${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Create deployment user (optional)
if ! id "deploy" &>/dev/null; then
    echo "👤 Creating deployment user..."
    useradd -m -s /bin/bash deploy
    usermod -aG docker deploy
fi

# Create deployment directory
echo "📁 Creating deployment directory..."
mkdir -p /opt/ollama-local-connect
chown deploy:deploy /opt/ollama-local-connect

# Configure firewall
echo "🔥 Configuring firewall..."
ufw allow 22    # SSH
ufw allow 8080  # Application
ufw --force enable

# Configure fail2ban
echo "🛡️  Configuring fail2ban..."
systemctl enable fail2ban
systemctl start fail2ban

# Configure nginx (basic reverse proxy)
echo "🌐 Configuring nginx..."
cat > /etc/nginx/sites-available/ollama-local-connect << 'EOF'
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

# Enable nginx site
ln -sf /etc/nginx/sites-available/ollama-local-connect /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

# Create systemd service for automatic startup (optional)
echo "⚙️  Creating systemd service..."
cat > /etc/systemd/system/ollama-local-connect.service << 'EOF'
[Unit]
Description=Ollama Local Connect
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/ollama-local-connect
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable ollama-local-connect

echo "✅ Server setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Copy your application files to /opt/ollama-local-connect/"
echo "2. Run: sudo -u deploy docker-compose up -d"
echo "3. Access your application at: http://192.168.1.108:8080"
echo ""
echo "🔧 For deployment automation:"
echo "- Set up SSH keys for GitHub Actions"
echo "- Configure GitHub secrets"
echo "- Push to main branch to trigger deployment"