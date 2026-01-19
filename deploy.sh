echo "Starting deployment process..."
# Pull the latest changes from the repository
git pull origin main

# Bring down the existing Docker containers
echo "Stopping existing Docker containers..."
docker-compose down

# Build and start the Docker containers
echo "Building and starting Docker containers..."
docker-compose up --build -d

# Verfiy that the containers are running
echo "Verifying Docker containers..."
docker-compose ps