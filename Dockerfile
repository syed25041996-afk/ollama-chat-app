# -------- Build stage --------
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# -------- Runtime stage --------
FROM nginx:alpine

# Use your existing nginx config (safe)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# IMPORTANT:
# Copy build output into a SUBFOLDER, not root
COPY --from=build /app/dist /usr/share/nginx/html/ollama-ui

EXPOSE 80

CMD ["npm","run", "dev"]
