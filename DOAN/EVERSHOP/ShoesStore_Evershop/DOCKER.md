# Docker Setup & Management

Complete guide for running EverShop with Docker locally and in CI/CD pipeline.

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Quick Start](#quick-start)
4. [Docker Compose Services](#docker-compose-services)
5. [Common Commands](#common-commands)
6. [Dockerfile Explanation](#dockerfile-explanation)
7. [Environment Variables](#environment-variables)
8. [Network & Port Configuration](#network--port-configuration)
9. [Troubleshooting](#troubleshooting)
10. [Production Deployment](#production-deployment)

---

## Overview

### Why Docker?

Docker provides:
- **Consistency**: Same environment locally and in production
- **Isolation**: No conflicts with system dependencies
- **Scalability**: Easy to scale and deploy multiple instances
- **CI/CD Integration**: Automated testing and deployment
- **Team Collaboration**: Standardized development environment

### Architecture

```
┌─────────────────────────────────────┐
│      Docker Container               │
├─────────────────────────────────────┤
│  EverShop Application (Node.js)     │
│  - Port: 3000                       │
│  - Node: v20 Alpine                 │
└──────────────┬──────────────────────┘
               │
        ┌──────┴──────┬────────────┐
        │             │            │
     PostgreSQL     Redis      Network
    (Port 5432)   (Port 6379)  (evershop-network)
```

---

## Prerequisites

### Required

- **Docker**: 20.10+ ([Download](https://www.docker.com/products/docker-desktop))
- **Docker Compose**: 2.0+ (comes with Docker Desktop)
- **Git**: For cloning repository

### Optional

- **Docker Registry**: For pushing images (GitHub Container Registry, Docker Hub)
- **Make**: For simplified commands (macOS/Linux only)

### Verify Installation

```bash
docker --version
docker-compose --version
docker ps
```

Expected output:
```
Docker version 24.0.0, build ...
Docker Compose version 2.20.0, build ...
```

---

## Quick Start

### 1. Start Services (One Command)

```bash
# From DOAN/EVERSHOP/ShoesStore_Evershop directory
docker-compose up -d

# Wait for startup (usually 10-15 seconds)
docker-compose logs -f app
```

### 2. Verify Services Running

```bash
docker-compose ps

# Expected output:
# NAME             STATUS
# evershop-app     Up (healthy)
# evershop-db      Up (healthy)
# evershop-redis   Up (healthy)
```

### 3. Access Application

- **Web App**: http://localhost:3000
- **Database**: localhost:5432 (PostgreSQL)
- **Cache**: localhost:6379 (Redis)

### 4. Stop Services

```bash
docker-compose down

# Or with volume cleanup
docker-compose down -v
```

---

## Docker Compose Services

### Service: app (EverShop Application)

```yaml
service: app
image: Built from Dockerfile
port: 3000:3000
command: npm run dev
volumes: 
  - Current directory mounted for hot reload
environment:
  DB_HOST: database
  DB_USER: postgres
  DB_PASSWORD: postgres
  DB_NAME: evershop
  NODE_ENV: development
```

**Features**:
- ✅ Hot reload (file changes reflected immediately)
- ✅ Node modules preserved with volume
- ✅ Health check enabled
- ✅ Depends on PostgreSQL startup

### Service: database (PostgreSQL)

```yaml
service: database
image: postgres:16-alpine
port: 5432:5432
volumes: postgres-data (persistent)
environment:
  POSTGRES_USER: postgres
  POSTGRES_PASSWORD: postgres
  POSTGRES_DB: evershop
healthcheck: Checks every 10 seconds
```

**Features**:
- ✅ Alpine image (lightweight, ~85MB)
- ✅ Persistent data storage
- ✅ Health check enabled
- ✅ Automatic startup on container restart

### Service: redis (Cache/Session Store)

```yaml
service: redis
image: redis:7-alpine
port: 6379:6379
command: redis-server
healthcheck: Checks every 10 seconds
```

**Features**:
- ✅ Session caching
- ✅ Optional but recommended
- ✅ Lightweight (~10MB)

---

## Common Commands

### Start & Stop

```bash
# Start all services in background
docker-compose up -d

# Start with logging output
docker-compose up

# Stop services (keep volumes)
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop and remove everything (including data!)
docker-compose down -v
```

### View Logs

```bash
# View all service logs
docker-compose logs

# View app logs continuously
docker-compose logs -f app

# View specific service
docker-compose logs -f database

# Last 100 lines
docker-compose logs --tail=100 app

# Follow specific service in real-time
docker-compose logs -f app | grep "error"
```

### Service Management

```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart app

# Rebuild image
docker-compose build

# Build and start
docker-compose up -d --build

# Pull latest base images
docker-compose pull

# Check service status
docker-compose ps
```

### Database Operations

```bash
# Connect to PostgreSQL
docker-compose exec database psql -U postgres -d evershop

# List all databases
docker-compose exec database psql -U postgres -l

# Backup database
docker-compose exec database pg_dump -U postgres evershop > backup.sql

# Restore database
docker-compose exec database psql -U postgres evershop < backup.sql

# View PostgreSQL logs
docker-compose logs -f database
```

### Execute Commands in Container

```bash
# Run command in app container
docker-compose exec app npm run lint

# Run tests
docker-compose exec app npm run test

# Access app shell
docker-compose exec app sh

# Install additional package
docker-compose exec app npm install package-name
```

### Resource Management

```bash
# Check container resource usage
docker stats

# View image size
docker images evershop

# Remove unused images
docker image prune

# Remove all Docker data
docker system prune -a
```

---

## Dockerfile Explanation

### Multi-Stage Build

Our Dockerfile uses two stages for optimization:

#### Stage 1: Builder (Compile & Build)
```dockerfile
FROM node:20-alpine AS builder
# Install dependencies
# Copy source code
# Compile TypeScript
# Build application
# Result: ~500MB intermediate image
```

#### Stage 2: Production (Lightweight Runtime)
```dockerfile
FROM node:20-alpine
# Copy compiled files from builder (only what's needed)
# Install dumb-init for signal handling
# Create non-root user for security
# Set health check
# Result: ~150MB final image
```

### Key Features

1. **Non-Root User**: Runs as `nodejs` user (not `root`) for security
2. **Health Check**: Endpoint check every 30 seconds
3. **Dumb-Init**: Proper signal handling for graceful shutdown
4. **Multi-Stage**: Reduces final image size by ~70%
5. **Alpine Base**: Lightweight base image (40MB vs 900MB for standard)

### Build Command

```dockerfile
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "run", "start"]
```

Executes: `dumb-init npm run start`

This ensures:
- Process signals (SIGTERM, SIGINT) handled properly
- Graceful shutdown on container stop
- Child processes cleaned up

---

## Environment Variables

### Load from .env

Create `.env` file from `.env.example`:

```bash
cp .env.example .env
# Edit values as needed
```

### Docker Compose Usage

```yaml
# Load from .env automatically
environment:
  DB_HOST: database
  DB_USER: ${DB_USER:-postgres}  # Use .env value or default to "postgres"
  DB_PASSWORD: ${DB_PASSWORD:-postgres}
```

### Override at Runtime

```bash
# Via command line
docker-compose up -e NODE_ENV=production

# Via env file
docker-compose --env-file .env.production up

# Via export
export NODE_ENV=production
docker-compose up
```

### Important Variables for Docker

| Variable | Default | Purpose |
|----------|---------|---------|
| `DB_HOST` | `localhost` | Database hostname (use service name in Compose) |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_USER` | `postgres` | PostgreSQL user |
| `DB_PASSWORD` | `postgres` | PostgreSQL password |
| `DB_NAME` | `evershop` | Database name |
| `NODE_ENV` | `development` | Environment mode |
| `PORT` | `3000` | Application port |
| `REDIS_URL` | `redis://localhost:6379` | Redis connection |

**⚠️ Important**: Never commit `.env` with real credentials to Git!

---

## Network & Port Configuration

### Port Mapping

```
Host Port → Container Port
3000      → 3000  (Application)
5432      → 5432  (PostgreSQL)
6379      → 6379  (Redis)
```

### Custom Port Mapping

Edit `docker-compose.yml`:

```yaml
services:
  app:
    ports:
      - "8000:3000"  # Change: http://localhost:8000
  database:
    ports:
      - "5433:5432"  # PostgreSQL on 5433 instead of 5432
```

### Docker Network

Services communicate via Docker network `evershop-network`:

```bash
# From app container, connect to database:
Host: database (not localhost or 127.0.0.1)
Port: 5432 (internal port, not mapped)

# From host machine:
Host: localhost
Port: 5432 (mapped port)
```

---

## Troubleshooting

### Port Already in Use

**Problem**: `Error: Bind for 0.0.0.0:3000 failed: port is already allocated`

**Solution**:

```bash
# Find process using port 3000
lsof -i :3000          # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Option 1: Stop other process
kill -9 <PID>

# Option 2: Use different port
docker-compose up -e PORT=3001

# Option 3: Edit docker-compose.yml
# Change: ports: ["3001:3000"]
```

### Container Crashes Immediately

**Problem**: Container exits with error code 1

**Solution**:

```bash
# Check logs
docker-compose logs app

# Rebuild image
docker-compose build --no-cache

# Check environment variables
cat .env

# Rebuild and start
docker-compose up --build
```

### Database Connection Error

**Problem**: `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Solution**:

```bash
# Check database is running
docker-compose ps database

# Check database logs
docker-compose logs database

# Verify correct host (not localhost, use 'database')
# In app container, connect to: database:5432

# Wait for database startup
docker-compose up database
# Wait for "database_1 ... ready to accept connections"
# Then start app
```

### Volume Permission Error

**Problem**: `Error: EACCES: permission denied`

**Solution**:

```bash
# Check file permissions
ls -la

# Fix ownership
sudo chown -R $USER:$USER .

# Or recreate volume
docker-compose down -v
docker-compose up -d
```

### Disk Space Issues

**Problem**: `Error: No space left on device`

**Solution**:

```bash
# Check Docker disk usage
docker system df

# Clean up unused resources
docker system prune

# Remove all images and volumes
docker system prune -a --volumes

# Check system disk
df -h
```

### Hot Reload Not Working

**Problem**: File changes not reflected in container

**Solution**:

```bash
# Verify volume mount
docker-compose config | grep -A5 volumes

# Restart container
docker-compose restart app

# Check file permissions
ls -la packages/

# For Windows/WSL2, use proper paths
# Use unix-style paths in docker-compose.yml
```

---

## Production Deployment

### Build Docker Image

```bash
# Build image locally
docker build -t evershop:latest .

# Build with tag
docker build -t evershop:1.0.0 .

# Build with registry tag
docker build -t ghcr.io/username/evershop:latest .
```

### Push to Registry

#### GitHub Container Registry

```bash
# Login
echo $GITHUB_TOKEN | docker login ghcr.io -u username --password-stdin

# Tag image
docker tag evershop:latest ghcr.io/username/evershop:latest

# Push
docker push ghcr.io/username/evershop:latest
```

#### Docker Hub

```bash
# Login
docker login

# Tag image
docker tag evershop:latest username/evershop:latest

# Push
docker push username/evershop:latest
```

### Run in Production

```bash
# Pull image
docker pull ghcr.io/username/evershop:latest

# Run container
docker run -d \
  -p 80:3000 \
  -e DB_HOST=<your-db-host> \
  -e DB_PASSWORD=<secure-password> \
  -e NODE_ENV=production \
  --name evershop \
  ghcr.io/username/evershop:latest
```

### Docker Compose for Production

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  app:
    image: ghcr.io/username/evershop:latest
    restart: always
    environment:
      DB_HOST: ${DB_HOST}
      DB_PASSWORD: ${DB_PASSWORD}
      NODE_ENV: production
    ports:
      - "3000:3000"
    depends_on:
      - database

  database:
    image: postgres:16-alpine
    restart: always
    volumes:
      - postgres-prod:/var/lib/postgresql/data
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}
```

Run:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Monitoring & Logs

```bash
# View container logs
docker logs evershop

# Follow logs real-time
docker logs -f evershop

# View resource usage
docker stats evershop

# Health check status
docker inspect evershop --format='{{.State.Health}}'
```

---

## Best Practices

### Security

- ✅ Use non-root user (already configured)
- ✅ Never hardcode secrets in Dockerfile
- ✅ Use secrets from environment variables or secrets manager
- ✅ Scan image for vulnerabilities: `docker scan evershop`
- ✅ Keep base images updated: `docker pull node:20-alpine`

### Performance

- ✅ Use Alpine images (smaller, faster)
- ✅ Multi-stage builds (reduces final size)
- ✅ Layer caching optimization
- ✅ Health checks for monitoring
- ✅ Resource limits in production

### Development

- ✅ Use volume mounts for hot reload
- ✅ Keep node_modules in volume to avoid conflicts
- ✅ Use `.dockerignore` to exclude unnecessary files
- ✅ Rebuild only when package.json changes

---

## Useful Resources

- **Docker Docs**: https://docs.docker.com/
- **Docker Compose**: https://docs.docker.com/compose/
- **Node.js Docker**: https://github.com/nodejs/docker-node
- **PostgreSQL Docker**: https://hub.docker.com/_/postgres
- **Docker Best Practices**: https://docs.docker.com/develop/dev-best-practices/

---

## Getting Help

### Common Issues

- **Port Issues**: See [Port Already in Use](#port-already-in-use)
- **Database Connection**: See [Database Connection Error](#database-connection-error)
- **File Permissions**: See [Volume Permission Error](#volume-permission-error)
- **Space Issues**: See [Disk Space Issues](#disk-space-issues)

### Community Resources

- GitHub Issues: Post questions in repository issues
- Docker Community: https://community.docker.com/
- Stack Overflow: Tag questions with `docker` and `docker-compose`

---

**Last Updated**: 2025
**Version**: 1.0
