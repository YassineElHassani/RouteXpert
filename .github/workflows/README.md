# CI/CD Pipeline Documentation

## Overview
RouteXpert uses GitHub Actions for Continuous Integration and Continuous Deployment (CI/CD) pipelines for both frontend and backend applications.

## Workflows

### 1. Full Stack CI (`ci.yml`)
**Triggers:** Push and Pull Requests to `main` or `develop` branches

**Features:**
- Smart change detection (only runs tests for changed components)
- Backend testing with MongoDB service
- Frontend linting and building
- Docker Compose integration testing
- Parallel job execution for faster builds

**Jobs:**
- `changes`: Detects which parts of the codebase changed
- `backend-test`: Runs backend tests if backend code changed
- `frontend-build`: Builds and lints frontend if frontend code changed
- `docker-compose-test`: Integration test with full stack running in Docker

---

### 2. Backend CI/CD (`backend-ci.yml`)
**Triggers:** 
- Push to `main` or `develop` with changes in `backend/`
- Pull Requests with changes in `backend/`

**Pipeline Stages:**

#### Test Job
- Sets up Node.js 20
- Spins up MongoDB 7.0 service container
- Runs unit and integration tests
- Generates test coverage report
- Uploads coverage to Codecov

#### Lint Job
- Checks code formatting with Prettier (if configured)
- Runs in parallel with tests

#### Build Job
- Builds Docker image for backend
- Pushes to Docker Hub with tags:
  - `branch-name`
  - `branch-sha`
  - `latest` (for main branch only)
- Uses BuildKit cache for faster builds

#### Deploy Job (Commented)
- Template for production deployment via SSH
- Uncomment and configure when ready to deploy

---

### 3. Frontend CI/CD (`frontend-ci.yml`)
**Triggers:**
- Push to `main` or `develop` with changes in `frontend/`
- Pull Requests with changes in `frontend/`

**Pipeline Stages:**

#### Lint Job
- Runs ESLint on frontend code

#### Build Job
- Builds production-ready static files
- Uploads build artifacts for 7 days
- Configurable API URL via environment variable

#### Docker Job
- Builds Docker image with nginx
- Pushes to Docker Hub with tags
- Includes build-time configuration for API URL

#### Deploy Job (Commented)
- Template for production deployment

---

## GitHub Secrets Required

Add these secrets in your GitHub repository settings (`Settings > Secrets and variables > Actions`):

### Docker Hub (Required for image building)
```
DOCKER_USERNAME=<your-dockerhub-username>
DOCKER_PASSWORD=<your-dockerhub-password-or-token>
```

### Deployment (Optional, for when you enable deployment)
```
DEPLOY_HOST=<your-server-ip-or-domain>
DEPLOY_USER=<ssh-username>
DEPLOY_KEY=<ssh-private-key>
```

### Application Configuration (Optional)
```
VITE_API_URL=<production-api-url>  # e.g., https://api.routexpert.com
```

---

## Local Testing

### Test Backend Workflow Locally
```bash
cd backend
npm install
npm test
npm run test:coverage
```

### Test Frontend Workflow Locally
```bash
cd frontend
npm install
npm run lint
npm run build
```

### Test Docker Compose
```bash
# Create .env file first
docker-compose up --build
```

---

## Enabling Deployment

1. **Uncomment the deployment job** in the workflow files
2. **Add deployment secrets** to GitHub
3. **Update the deployment script** with your server paths:
   ```yaml
   script: |
     cd /path/to/your/app  # Change this
     docker-compose pull backend
     docker-compose up -d backend
   ```

4. **Alternative Deployment Methods:**
   - AWS ECS/Fargate
   - Google Cloud Run
   - Azure Container Instances
   - Kubernetes cluster
   - Heroku
   - DigitalOcean App Platform

---

## Branch Strategy

- **`main`**: Production branch - triggers deployment to production
- **`develop`**: Development branch - triggers build but not deployment
- **Feature branches**: Open PR to `develop` - triggers tests only

---

## Monitoring

### GitHub Actions Dashboard
- View workflow runs: `https://github.com/<username>/RouteXpert/actions`
- Check test results, build logs, and deployment status

### Docker Hub
- View images: `https://hub.docker.com/r/<username>/routexpert-backend`
- Check image tags and sizes

### Coverage Reports
- Codecov dashboard (if configured): `https://codecov.io/gh/<username>/RouteXpert`

---

## Troubleshooting

### Tests Failing in CI but Passing Locally
- Check MongoDB version matches (7.0)
- Verify environment variables in workflow
- Check Node.js version (should be 20)

### Docker Build Failing
- Verify Dockerfile exists and is valid
- Check for missing dependencies in package.json
- Ensure build context is correct

### Deployment Issues
- Verify SSH credentials are correct
- Check server has Docker and Docker Compose installed
- Ensure firewall allows connections on required ports

---

## Performance Optimization

Current optimizations in place:
- **Smart change detection** - Only runs affected jobs
- **Parallel job execution** - Tests and linting run simultaneously
- **Docker BuildKit cache** - Faster image builds
- **npm ci** instead of npm install - Faster, more reliable installs
- **Dependency caching** - Node modules cached between runs

---

## Next Steps

1. **Add more tests** to improve coverage
2. **Enable deployment** to staging environment
3. **Add E2E tests** with Playwright or Cypress
4. **Set up staging environment** for pre-production testing
5. **Configure automatic rollback** on deployment failure
6. **Add database migration** checks before deployment
7. **Implement blue-green deployment** for zero-downtime updates
