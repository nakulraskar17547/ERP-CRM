# Docker Setup Guide for ERP-CRM

## Prerequisites

- Docker Desktop installed ([Download](https://www.docker.com/products/docker-desktop))
- Docker Compose (included with Docker Desktop)

## Quick Start

### 1. Setup Environment Variables

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` and add your actual values:
- `DATABASE_URL` - Your Supabase connection string
- `DIRECT_URL` - Your Supabase direct URL
- `JWT_SECRET` - Your JWT secret key
- `VITE_API_URL` - Backend API URL

### 2. Production Deployment

Build and start all services:
```bash
docker-compose up --build
```

Or run in detached mode (background):
```bash
docker-compose up -d
```

Access the application:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api
- **Health Check:** http://localhost:5000/health

### 3. Development with Hot Reload

For development with automatic code reloading:
```bash
docker-compose -f docker-compose.dev.yml up
```

Access the development servers:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5001/api

## Docker Commands

### View Running Containers
```bash
docker-compose ps
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Stop Services
```bash
docker-compose down
```

### Rebuild After Code Changes
```bash
docker-compose up --build
```

### Run Database Migrations
```bash
docker-compose exec backend npx prisma db push
```

### Access Container Shell
```bash
# Backend container
docker-compose exec backend sh

# Frontend container  
docker-compose exec frontend sh
```

### Clean Up Everything
```bash
# Stop and remove containers, networks
docker-compose down

# Also remove volumes
docker-compose down -v

# Remove all unused Docker resources
docker system prune -a
```

## Project Structure

```
erp-crm/
├── backend/
│   ├── Dockerfile              # Production build
│   ├── Dockerfile.dev          # Development with hot reload
│   ├── .dockerignore          # Files to exclude from Docker
│   └── ...
├── frontend/
│   ├── Dockerfile              # Production build with Nginx
│   ├── Dockerfile.dev          # Development with Vite
│   ├── nginx.conf             # Nginx configuration
│   ├── .dockerignore          # Files to exclude from Docker
│   └── ...
├── docker-compose.yml          # Production orchestration
├── docker-compose.dev.yml      # Development orchestration
├── .env                        # Environment variables (not committed)
└── .env.example               # Environment template
```

## Development Workflow

### 1. Start Development Environment
```bash
docker-compose -f docker-compose.dev.yml up
```

### 2. Make Code Changes
Edit files in `backend/src` or `frontend/src` - changes auto-reload!

### 3. Install New Dependencies

**Backend:**
```bash
cd backend
npm install <package-name>
docker-compose -f docker-compose.dev.yml restart backend-dev
```

**Frontend:**
```bash
cd frontend
npm install <package-name>
docker-compose -f docker-compose.dev.yml restart frontend-dev
```

### 4. Run Prisma Commands
```bash
# Generate Prisma Client
docker-compose exec backend-dev npx prisma generate

# Push schema changes
docker-compose exec backend-dev npx prisma db push

# Open Prisma Studio
docker-compose exec backend-dev npx prisma studio
```

## Production Deployment

### Build for Production
```bash
docker-compose build
```

### Deploy to Render

1. **Connect GitHub repo** to Render
2. **Select Docker deployment**
3. **Set Environment Variables** in Render dashboard
4. **Render auto-builds** from Dockerfile

### Deploy to Other Platforms

The Docker images work on any platform that supports Docker:
- AWS ECS
- Google Cloud Run
- Azure Container Instances
- DigitalOcean App Platform
- Fly.io
- Railway

## Troubleshooting

### Port Already in Use
```bash
# Check what's using the port
netstat -ano | findstr :5000  # Windows
lsof -i :5000                 # Mac/Linux

# Change ports in docker-compose.yml
ports:
  - "5001:5000"  # Map to different host port
```

### Container Won't Start
```bash
# View detailed logs
docker-compose logs backend

# Check container status
docker-compose ps

# Rebuild from scratch
docker-compose down
docker-compose build --no-cache
docker-compose up
```

### Database Connection Issues
```bash
# Verify environment variables
docker-compose exec backend env | grep DATABASE

# Test database connection
docker-compose exec backend npx prisma db push
```

### Permission Issues (Linux/Mac)
```bash
# Fix volume permissions
sudo chown -R $USER:$USER .
```

## Best Practices

1. **Always use `.env` for secrets** - Never commit credentials
2. **Use `.dockerignore`** - Exclude unnecessary files from builds
3. **Multi-stage builds** - Keep production images small
4. **Health checks** - Ensure services are ready before connecting
5. **Volume mounts for dev** - Enable hot reload during development
6. **Named volumes for data** - Persist important data

## Performance Tips

### Faster Builds
```bash
# Use BuildKit (faster builds)
DOCKER_BUILDKIT=1 docker-compose build

# Cache npm dependencies
# Already configured in Dockerfiles!
```

### Smaller Images
- Using `alpine` base images (smallest)
- Multi-stage builds to exclude dev dependencies
- `.dockerignore` to exclude unnecessary files

### Resource Limits
Add to docker-compose.yml if needed:
```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
```

## Differences from Non-Docker Setup

| Task | Without Docker | With Docker |
|------|----------------|-------------|
| Start dev | `npm run dev` (2 terminals) | `docker-compose -f docker-compose.dev.yml up` |
| Install deps | `npm install` | `npm install` + rebuild container |
| Run migrations | `npx prisma db push` | `docker-compose exec backend npx prisma db push` |
| View logs | Terminal output | `docker-compose logs -f` |
| Stop services | Ctrl+C | `docker-compose down` |

## Support

For issues or questions:
1. Check logs: `docker-compose logs -f`
2. Verify .env configuration
3. Ensure Docker Desktop is running
4. Try rebuilding: `docker-compose build --no-cache`

## Next Steps

✅ Services are Dockerized
✅ Development environment ready
✅ Production builds optimized
✅ Ready for any deployment platform

Deploy to Render with Docker for consistent environments from dev to production!
