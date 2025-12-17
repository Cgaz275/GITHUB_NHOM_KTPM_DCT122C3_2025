# CI/CD Pipeline with Docker Integration

Comprehensive guide to the GitHub Actions CI/CD pipeline integrated with Docker containerization.

---

## Table of Contents

1. [Overview](#overview)
2. [Workflow Architecture](#workflow-architecture)
3. [Pipeline Stages](#pipeline-stages)
4. [Configuration Files](#configuration-files)
5. [GitHub Secrets Setup](#github-secrets-setup)
6. [Workflow Triggers](#workflow-triggers)
7. [Docker Image Build & Push](#docker-image-build--push)
8. [Monitoring & Debugging](#monitoring--debugging)
9. [Troubleshooting](#troubleshooting)
10. [Best Practices](#best-practices)

---

## Overview

### CI/CD with Docker

Our pipeline automates:

1. **Code Quality** - Linting checks (ESLint, Prettier)
2. **Testing** - Unit tests with coverage reporting
3. **Building** - Compile TypeScript and build application
4. **Containerization** - Build and push Docker images
5. **Notification** - Post status to GitHub Pull Requests
s
### Benefits

- ✅ **Automated Testing**: Every push runs tests automatically
- ✅ **Docker Containerization**: Built image ready for deployment
- ✅ **Quick Feedback**: Tests run in parallel (faster results)
- ✅ **GitHub Container Registry**: Free private Docker registry
- ✅ **Production Ready**: Same image used everywhere (local → staging → production)

---


## Workflow Architecture

### Full Pipeline Flow

```
┌───────────────────────────────────────────────────────s──┐
│           GitHub Push / Pull Request                     │
└──────────────────┬──────────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ↓                     ↓
   LINT JOB             TEST JOB
   (Parallel)           (Parallel)
   - ESLint              - Unit Tests
   - Format             - Coverage
   - Code Style         - Database
        │                     │
        └──────────┬──────────┘
                   ↓
            BUILD JOB
            (Sequential)
            - TypeScript Compile
            - Database Compile
            - Production Build
                   │
    Is Main Push? ──┤
         │          │
        YES        NO
         │          │
         ↓          ↓
   DOCKER BUILD  SKIP DOCKER
   & PUSH        (PR Only)
   - Build image
   - Push to Registry
         │
         ↓
    NOTIFY
    - Comment on PR
    - Show results
```

### Job Dependencies

```
lint ──┐
       ├─→ build ──→ docker-build ──→ notify
test ──┘
```

**Execution Order**:
1. `lint` and `test` run in parallel (concurrent)
2. `build` waits for both `lint` and `test` to complete
3. `docker-build` waits for `build` to complete (only on main/modules push)
4. `notify` runs last (always, shows final status)

---

## Pipeline Stages

### Stage 1: Lint Code

**Trigger**: Every push and every PR

**Actions**:
- Checkout code
- Setup Node.js 20
- Install dependencies
- Run `npm run lint`

**Success Criteria**:
- ✅ No ESLint errors

**Failure Impact**:
- ❌ Blocks merge to main (required check)
- PR shows red ✗ in checks section

**Fix**:
```bash
npm run lint -- --fix
git add .
git commit -m "style: fix linting errors"
git push origin branch-name
```

### Stage 2: Run Tests

**Trigger**: Every push and every PR

**Services**:
- PostgreSQL 16 (test database)
- Health check before running tests

**Actions**:
- Checkout code
- Setup Node.js 20
- Install dependencies
- Run `npm run test -- --coverage`
- Upload coverage to Codecov

**Test Database Setup**:
```
DATABASE: evershop_test
HOST: localhost
PORT: 5432
USER: postgres
PASSWORD: postgres
```

**Success Criteria**:
- ✅ All tests pass
- ✅ Coverage reports generated

**Failure Impact**:
- ❌ Blocks merge to main
- PR shows red ✗

**Debug Failing Tests**:
```bash
# Locally reproduce with test environment
DB_HOST=localhost DB_NAME=evershop_test npm run test
```

### Stage 3: Build Application

**Trigger**: Every push and every PR

**Actions**:
- Checkout code
- Setup Node.js 20
- Install dependencies
- Run `npm run compile` (TypeScript)
- Run `npm run compile:db` (Database)
- Run `npm run build` (Production)

**Build Artifacts**:
- `packages/evershop/dist/` - Compiled application
- `packages/*/dist/` - All package outputs

**Success Criteria**:
- ✅ TypeScript compilation succeeds
- ✅ Build output directory exists
- ✅ No build errors

**Failure Impact**:
- ❌ Blocks merge to main
- Blocks Docker image build

**Debug Build Issues**:
```bash
npm run compile -- --clean
npm run build -- --verbose
ls -la packages/evershop/dist
```

### Stage 4: Build & Push Docker Image

**Trigger**: Only on push (not PR) to `main` or `modules/*` branches

**Actions**:
1. Setup Docker Buildx (multi-platform support)
2. Login to GitHub Container Registry
3. Extract metadata (tags, labels)
4. Build Docker image
5. Push to `ghcr.io/your-org/your-repo`

**Image Tags**:

- `latest` - Latest production image (main branch only)
- `main-sha` - By main branch commit
- `modules/feature-sha` - By feature branch commit
- `v1.2.3` - By semantic version tag
- `branch-name` - By branch name

**Example Tags**:
```
ghcr.io/cgaz275/evershop:latest
ghcr.io/cgaz275/evershop:main-abc123
ghcr.io/cgaz275/evershop:modules/auth-def456
ghcr.io/cgaz275/evershop:v2.1.0
```

**Registry Details**:
- **Registry**: GitHub Container Registry (`ghcr.io`)
- **Image Name**: `github.repository` (auto-detected)
- **Access**: Private by default (organization only)
- **Cost**: Free for private repos

**Dependencies**:
- Requires: `lint` ✅, `test` ✅, `build` ✅
- Skipped if any previous job fails
- Skipped for PR (preview deployment not needed)

### Stage 5: Notify Status

**Trigger**: Always (after all jobs complete)

**Actions**:
- Check all job statuses
- Fail overall if lint/test/build failed
- Comment on PR with results

**PR Comment Example**:
```
## CI/CD Status
✅ Lint
✅ Tests
✅ Build
⏭️ Docker Build (on merge)
```

---

## Configuration Files

### `.github/workflows/ci.yml`

Main workflow file that defines all jobs.

**Location**: `.github/workflows/ci.yml`

**Key Sections**:

```yaml
name: CI Pipeline

on:                          # Triggers
  push:
    branches:
      - main
      - 'modules/**'
  pull_request:
    branches:
      - main
      - 'modules/**'

env:                         # Global environment variables
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

permissions:                 # Required permissions
  contents: read
  packages: write

concurrency:                 # Cancel old runs
  group: ${{ github.workflow }}-${{ github.ref }}

jobs:
  lint:
  test:
  build:
  docker-build:
  notify:
```

### `Dockerfile`

Defines Docker image structure.

**Features**:
- Multi-stage build (smaller image size)
- Node 20 Alpine (lightweight)
- Non-root user (security)
- Health check (monitoring)
- Proper signal handling (dumb-init)

**Stages**:
1. **Builder**: Compile and build (~500MB)
2. **Production**: Final lightweight runtime (~150MB)

### `docker-compose.yml`

Local development with all services.

**Services**:
- `app` - EverShop (Node.js)
- `database` - PostgreSQL 16
- `redis` - Redis 7

**Features**:
- Volume mounts for hot reload
- Health checks
- Network isolation
- Persistent storage

---

## GitHub Secrets Setup

### Required Secrets

**GitHub Container Registry** automatically available:
- `GITHUB_TOKEN` - Auto-provided by GitHub Actions
- `github.actor` - Username (auto-provided)

**No additional secrets required** for GitHub Container Registry!

### Optional Secrets (for other registries)

If using Docker Hub or other registries, add:

```
DOCKER_USERNAME      # DockerHub username
DOCKER_TOKEN         # DockerHub access token
AWS_REGISTRY_URL     # AWS ECR URL
AWS_ACCESS_KEY_ID    # AWS credentials
AWS_SECRET_ACCESS_KEY
```

### Set Secrets in GitHub

1. Go to Repository Settings
2. Click "Secrets and Variables" → "Actions"
3. Click "New repository secret"
4. Add name and value
5. Secrets available to all workflows

**Example**:
```
Name: DOCKER_USERNAME
Value: your-docker-username
```

---

## Workflow Triggers

### On Push to Main

```
Push to main branch
         │
         ↓
1. Lint ──┐
2. Test   ├─→ Build ──→ Docker Build & Push
3. Lint   │
         ↓
4. Notify
```

**Docker image pushed to**:
```
ghcr.io/cgaz275/your-repo:latest
ghcr.io/cgaz275/your-repo:main-<commit-sha>
```

### On Pull Request

```
Create/Update Pull Request
         │
         ↓
1. Lint ──┐
2. Test   ├─→ Build
3. Lint   │
         ↓
4. Notify (comment on PR)
```

**Docker image build skipped** (not needed for preview)

### On Push to modules/* Branch

```
Push to modules/auth, modules/catalog, etc.
         │
         ↓
Same as main push
- Lint, Test, Build
- Docker Build & Push (branch-specific tags)
```

### Manual Trigger (Optional)

Add to enable manual workflow dispatch:

```yaml
on:
  workflow_dispatch:  # Manual trigger button
    inputs:
      environment:
        description: 'Environment to deploy'
        required: true
        default: 'staging'
```

Then use "Actions" tab → "Run workflow"

---

## Docker Image Build & Push

### How It Works

**Step 1: Buildx Setup**
```bash
docker buildx create --use
```
Enables multi-platform Docker builds.

**Step 2: Registry Login**
```bash
docker login ghcr.io \
  -u ${{ github.actor }} \
  -p ${{ secrets.GITHUB_TOKEN }}
```
Authenticates with GitHub Container Registry.

**Step 3: Extract Metadata**
```yaml
tags: |
  type=ref,event=branch              # Branch name
  type=semver,pattern={{version}}    # v1.2.3
  type=semver,pattern={{major}}.{{minor}}  # v1.2
  type=sha,prefix={{branch}}-        # main-abc123
  type=raw,value=latest,enable={{is_default_branch}}
```

**Step 4: Build & Push**
```bash
docker buildx build \
  --context ./DOAN/EVERSHOP/ShoesStore_Evershop \
  --push \
  --tags ghcr.io/org/repo:latest
```

Builds image and pushes directly to registry.

### Image Size Optimization

**Dockerfile uses**:
- Multi-stage build (separates build from runtime)
- Alpine base image (40MB vs 900MB)
- Only runtime dependencies (excludes dev tools)
- Result: ~150MB final image (was ~500MB)

**Size Breakdown**:
```
alpine:3.18         40MB   (base)
node:20-alpine      170MB  (node)
runtime deps        20MB   (npm modules)
─────────────────────────
Total               ~150MB (vs 500MB without optimization)
```

### Push Results

After push completes:

1. **View in Registry**:
   - Go to GitHub Packages
   - Select your repository
   - View image and tags

2. **Pull Image**:
   ```bash
   docker pull ghcr.io/cgaz275/your-repo:latest
   ```

3. **Run Locally**:
   ```bash
   docker run -e DB_HOST=localhost -p 3000:3000 \
     ghcr.io/cgaz275/your-repo:latest
   ```

---

## Monitoring & Debugging

### View Workflow Results

#### In GitHub UI

1. Go to Repository
2. Click "Actions" tab
3. Click workflow name (CI Pipeline)
4. Click run number
5. View job details and logs

#### Job Status

**✅ Green**: Job passed
**❌ Red**: Job failed
**⏭️ Skipped**: Skipped (dependency failed)
**⏳ In Progress**: Currently running

### View Job Logs

1. Click job name (e.g., "Lint Code")
2. Expand steps with ▶️
3. View output and errors

**Example Log Output**:
```
Run npm run lint
eslint packages/ --max-warnings 0
  ✓ No linting errors found

✅ Success
```

### Debugging Failed Jobs

#### Lint Failed

Check what linting errors exist:
```bash
npm run lint
```

Fix and push:
```bash
npm run lint -- --fix
git add .
git commit -m "style: fix linting"
git push
```

#### Tests Failed

Run tests locally to debug:
```bash
# With test database
docker-compose up -d database
npm run test -- --watch
```

#### Build Failed

Check build logs:
```bash
npm run build -- --verbose
ls -la packages/evershop/dist
```

#### Docker Build Failed

Check Dockerfile:
```bash
docker build -f Dockerfile -t test .
docker run -it test sh  # Interactive shell for debugging
```

### Real-Time Log Monitoring

```bash
# Watch workflow progress
gh run watch <run-id>

# View live logs
gh run view <run-id> --log
```

Install GitHub CLI: https://cli.github.com/

---

## Troubleshooting

### Lint Fails in CI but Passes Locally

**Cause**: Different Node versions or ESLint config

**Solution**:
```bash
# Use same Node version as CI
nvm install 20
nvm use 20

# Clear ESLint cache
npm run lint -- --no-cache

# Check ESLint config
cat .eslintrc.json
```

### Tests Pass Locally but Fail in CI

**Cause**: Test database differences or timing issues

**Solution**:
```bash
# Use CI database config locally
DB_HOST=localhost \
DB_NAME=evershop_test \
npm run test

# Or use Docker
docker-compose up -d database
npm run test
```

### Docker Build Takes Too Long

**Cause**: Large dependencies or missing cache

**Solution**:
```yaml
# Check cache in ci.yml:
cache-from: type=gha
cache-to: type=gha,mode=max
```

Cache is stored in GitHub Actions Cache API (free, 5GB)

### Permission Denied Pushing to Registry

**Cause**: `GITHUB_TOKEN` permissions or login failed

**Solution**:
1. Check permissions in ci.yml: `packages: write` ✓
2. Check token is valid (auto-provided)
3. Check branch can push (not protected)

### Docker Image Not Pushed

**Cause**: Docker build job skipped (for PRs)

**Note**: Docker build intentionally skipped for PRs.

Only builds for:
- Push to `main`
- Push to `modules/*`

PRs don't need Docker push.

### Workflow Not Running

**Cause**: Branch doesn't match trigger

**Check**:
```yaml
on:
  push:
    branches:
      - main              # ✓ Triggers here
      - 'modules/**'      # ✓ Triggers here
  pull_request:
    branches:
      - main              # ✓ Triggers on PRs to main
```

**Solution**: Push to allowed branches

---

## Best Practices

### Code Quality

- ✅ **Run locally first**: `npm run lint && npm run test`
- ✅ **Keep tests fast**: < 5 minutes (for quick feedback)
- ✅ **High coverage**: Aim for > 80% code coverage
- ✅ **Type safety**: Fix TypeScript errors, don't ignore

### Commit & Push

- ✅ **Meaningful commits**: `feat(module): description`
- ✅ **Small PRs**: Easier to review and debug
- ✅ **Link issues**: Reference #123 in PR description
- ✅ **Write tests**: Include test cases in commits

### Docker Image

- ✅ **Tag semantically**: `v1.2.3` for releases
- ✅ **Keep small**: Monitor image size
- ✅ **Update dependencies**: Keep base images current
- ✅ **Security scan**: `docker scan image`

### Monitoring

- ✅ **Check workflow status**: Regular PR checks
- ✅ **Review logs**: Debug failures early
- ✅ **Set notifications**: GitHub notifications on failure
- ✅ **Track metrics**: Time, success rate, flakiness

### Optimization

- ✅ **Parallel jobs**: lint + test run together
- ✅ **Cache dependencies**: npm cache in Actions
- ✅ **Reuse Docker layers**: Buildx layer caching
- ✅ **Fail fast**: Lint before tests, tests before build

---

## Integration with Other Services

### Vercel Deployment

Vercel auto-deploys from main branch.

**Flow**:
```
Main Branch
    │
    ├─→ CI/CD Pipeline (GitHub Actions)
    │   ├─ Lint, Test, Build
    │   └─ Docker Push to ghcr.io
    │
    └─→ Vercel Deployment (auto-triggered)
        └─ Deploy to production
```

**Docker image** not used by Vercel (alternative to docker)

### Docker Deployment

To deploy Docker image instead of Vercel:

```bash
# Pull latest image
docker pull ghcr.io/cgaz275/your-repo:latest

# Run with environment
docker run -d \
  -e DB_HOST=your-db \
  -e NODE_ENV=production \
  -p 80:3000 \
  ghcr.io/cgaz275/your-repo:latest
```

### Local Development

Use `docker-compose.yml` for local development:

```bash
docker-compose up -d
npm run dev
```

Docker services (PostgreSQL, Redis) run alongside local code.

---

## Performance Metrics

### Build Time

Target times (adjust based on your setup):

- Lint: 30-60 seconds
- Test: 1-3 minutes
- Build: 1-2 minutes
- Docker: 2-4 minutes
- **Total**: 5-10 minutes

### Optimization Tips

1. **Cache dependencies**: GitHub Actions caches npm
2. **Parallel jobs**: lint + test run together
3. **Skip unnecessary jobs**: Docker skip for PRs
4. **Lightweight base**: Alpine images vs Ubuntu
5. **Monitor trends**: View performance over time

---

## Resources

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Docker Docs](https://docs.docker.com/)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [Actions Best Practices](https://docs.github.com/en/actions/guides)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

---

## Support & Issues

### Debugging Workflows

1. View logs in GitHub Actions
2. Run commands locally to reproduce
3. Check environment variables
4. Review recent changes to ci.yml

### Common Issues

See [Troubleshooting](#troubleshooting) section above

### Get Help

- GitHub Issues: Post in repository
- GitHub Discussions: Ask community questions
- Stack Overflow: Tag with `github-actions`, `docker`

---

**Last Updated**: 2025
**Version**: 1.0
**Status**: Production-Ready ✅
