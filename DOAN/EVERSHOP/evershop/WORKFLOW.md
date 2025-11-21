# EverShop Development & Deployment Workflow

This document outlines the standardized CI/CD and development process for the EverShop project using NX workspace management and Vercel deployment.

---

## Table of Contents

1. [Repository Structure](#repository-structure)
2. [Branch Strategy](#branch-strategy)
3. [Development Workflow](#development-workflow)
4. [Testing Requirements](#testing-requirements)
5. [Merge & Review Process](#merge--review-process)
6. [Deployment Pipeline](#deployment-pipeline)
7. [NX Graph & Dependency Management](#nx-graph--dependency-management)
8. [Environment Setup](#environment-setup)

---

## Repository Structure

```
DOAN/EVERSHOP/
├── evershop/                          # Main deployment folder (this project)
│   ├── packages/
│   │   ├── evershop/                 # Core application
│   │   ├── postgres-query-builder/   # Database utilities
│   │   └── create-evershop-app/      # CLI tool
│   ├── extensions/                    # Feature extensions
│   ├── themes/                        # UI themes
│   ├── .github/workflows/             # CI/CD pipelines
│   ├── nx.json                        # NX workspace config
│   ├── vercel.json                    # Vercel deployment config
│   └── package.json                   # Root dependencies
│
└── FullBase/evershop-dev/            # Source of truth (reference)
    └── [Complete source with all modules]
```

### Key Folders

- **DOAN/EVERSHOP/evershop**: Main deployment target (this folder)
  - Gradually sync modules from FullBase
  - All deployments originate from here
  - Controlled via NX workspace

- **FullBase/evershop-dev**: Source repository
  - Contains all completed modules
  - Use as reference for pulling updates
  - Don't deploy directly from here

---

## Branch Strategy

### Branch Types

#### 1. **main** (Production)
- Stable, tested, production-ready code
- Protected branch - requires PR reviews and passing tests
- Auto-deploys to Vercel production on push
- Created from: feature/bugfix branches only

#### 2. **modules/<module-name>** (Feature Branches)
- Development branches for specific features
- Examples: `modules/auth`, `modules/catalog`, `modules/checkout`, `modules/cms`, `modules/customer`, `modules/oms`
- Each branch can have multiple developers
- Never deploy directly to production from these branches
- Must pass all tests before merging to main

#### 3. **feature/** (Personal Development)
- Optional short-lived branches for specific tasks
- Branch from `modules/<module-name>` if working on a module
- Branch from `main` for cross-module features
- Delete after merging back

### Branch Protection Rules

The `main` branch is protected with:
- ✅ Require pull request reviews (minimum 1 approval)
- ✅ Require status checks to pass before merging
  - All tests must pass
  - Linting must pass
  - Build must succeed
- ✅ Require branches to be up to date before merging
- ✅ Require linear history (no merge commits)

---

## Development Workflow

### Step 1: Create a Feature Branch

```bash
# Update main
git checkout main
git pull origin main

# Create a module or feature branch
git checkout -b modules/my-module    # for new modules
# or
git checkout -b feature/my-feature   # for specific tasks
```

### Step 2: Make Changes

```bash
# Edit files in your module
# Example structure:
# packages/evershop/src/modules/my-module/
# extensions/my-module/
# themes/my-theme/

# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat(my-module): describe your changes

- Detailed explanation of what changed
- Why the change was made
- Any breaking changes or migrations needed"
```

### Step 3: Push & Create Pull Request

```bash
# Push your branch
git push origin modules/my-module

# Create PR on GitHub
# - Write clear description
# - Link related issues
# - Add appropriate labels
```

### Step 4: Code Review

- At least 1 team member must review the code
- Reviewers check for:
  - Code quality and style
  - Test coverage
  - Performance impact
  - Documentation completeness
- Address feedback and push updates
- Once approved, proceed to merge

---

## Testing Requirements

All tests must pass before a branch can merge to main.

### Test Types

#### 1. **Unit Tests**
```bash
npm run test
```
- Test individual functions and components
- Minimum 80% code coverage required
- Run on every push via CI/CD

#### 2. **Linting**
```bash
npm run lint
```
- Checks code style and standards
- Must pass without errors
- Warnings are non-blocking
- Auto-fixes some issues: `npm run lint -- --fix`

#### 3. **Build Verification**
```bash
npm run build
```
- Ensures code compiles without errors
- Checks TypeScript types
- Verifies production build succeeds
- Required before production deployment

#### 4. **Integration Tests** (Optional)
```bash
npm run test:e2e
```
- Test feature workflows end-to-end
- Database integration tests
- API endpoint validation

### CI/CD Pipeline

The `.github/workflows/ci.yml` automatically runs:

```
On PR to main or push to modules/*:
  ├── Lint (non-blocking warning)
  ├── Unit Tests (required)
  ├── Build (required)
  └── Deploy to Vercel Preview (for PRs)

On merge to main:
  └── Deploy to Vercel Production
```

### Checking Test Results

In GitHub:
1. Open your Pull Request
2. Scroll to "Checks" section
3. Click details to see logs
4. Fix failing tests and push new commits

---

## Merge & Review Process

### Prerequisites for Merging to Main

- ✅ All CI/CD checks pass (green checkmarks)
- ✅ At least 1 approval from team
- ✅ Branch is up to date with main
- ✅ No conflicts with main

### How to Merge

#### Option A: Using GitHub UI (Recommended)
1. Open Pull Request
2. Click "Squash and merge" button
3. Write clear commit message
4. Confirm merge

#### Option B: Using Command Line
```bash
# Update main
git checkout main
git pull origin main

# Merge feature branch
git merge --squash modules/my-module
git commit -m "feat: my feature description"

# Push to main
git push origin main

# Delete feature branch
git branch -d modules/my-module
git push origin --delete modules/my-module
```

### After Merging

1. **Automatic Actions**:
   - CI/CD runs tests again on main
   - If all pass → Auto-deploys to Vercel production
   - Branch is deleted from remote

2. **Cleanup**:
   ```bash
   git checkout main
   git pull origin main
   git branch -D modules/my-module  # Delete local copy
   ```

---

## Deployment Pipeline

### Architecture

```
Feature Branch
    ↓
Create Pull Request
    ↓
Run Tests & Lint & Build
    ↓
✅ All Pass?
    ├─ YES → Deploy Preview to Vercel
    │         (accessible via preview URL)
    │         ↓
    │    Team Reviews
    │         ↓
    │    Approve & Merge
    │         ↓
    └─ NO  → Fail CI/CD
             (Block merge, fix issues)
                ↓
            Push fixes to branch
                ↓
            Re-run tests

Main Branch (Production)
    ↓
Run Tests & Lint & Build (final check)
    ↓
✅ All Pass?
    ├─ YES ��� Auto Deploy to Vercel Production
    │         (live on website)
    │
    └─ NO  → Rollback & Alert
             (don't deploy broken code)
```

### Deployment Stages

#### 1. **Preview Deployment** (Pull Requests)
- Triggered on every PR
- Deployed to temporary Vercel environment
- URL available in PR comments
- Useful for testing before merging
- **NOT accessible to production users**

#### 2. **Production Deployment** (Main Branch)
- Triggered only on `main` branch push
- Requires all tests to pass
- Deployed to live Vercel environment
- **Accessible to all users**
- Cannot be rolled back automatically

### Vercel Configuration

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "packages/evershop/dist",
  "framework": "other",
  "env": { "NODE_ENV": "production" }
}
```

**Environment Variables Needed in Vercel**:
```
DB_HOST=<database-host>
DB_PORT=5433
DB_USER=<database-user>
DB_PASSWORD=<database-password>
DB_NAME=<database-name>
NODE_ENV=production
API_URL=<your-api-endpoint>
```

---

## NX Graph & Dependency Management

### What is NX?

NX is a build system that:
- Tracks dependencies between packages
- Caches build/test results (faster builds)
- Ensures consistent builds across environments
- Visualizes project architecture

### View NX Graph

```bash
# Start NX graph visualization
npm run nx -- graph

# Browser opens: http://localhost:4211
```

**NX Graph shows**:
- All packages and their relationships
- Dependency flow
- Impact analysis (what breaks if you change X?)

### NX Build Workflow

```bash
# Build only affected packages
npm run nx -- affected:build

# Run tests on affected packages
npm run nx -- affected:test

# Lint affected packages
npm run nx -- affected:lint

# Run specific package
npm run nx -- run evershop:build
npm run nx -- run postgres-query-builder:test
```

### Package Structure in NX

```
packages/
├── evershop/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── catalog/
│   │   │   └── ...
│   │   └── ...
│   └── project.json          # Package config
├── postgres-query-builder/
│   ├── src/
│   └── project.json
└── create-evershop-app/
    ├── src/
    └── project.json
```

Each package has a `project.json`:
```json
{
  "name": "evershop",
  "sourceRoot": "packages/evershop/src",
  "projectType": "application",
  "targets": {
    "build": { ... },
    "test": { ... },
    "lint": { ... }
  }
}
```

---

## Environment Setup

### Local Development

#### Prerequisites
- Node.js 20+ (use NVM for management)
- npm 9+
- Git
- PostgreSQL 16 (or use Docker)

#### Setup Steps

```bash
# 1. Clone the repository
git clone https://github.com/Cgaz275/NHOM_KTPM_DCT122C3_2025.git
cd DOAN/EVERSHOP/evershop

# 2. Install dependencies
npm install

# 3. Compile source code
npm run compile
npm run compile:db

# 4. Setup database
npm run setup
# Follow prompts to configure database

# 5. Start development server
npm run dev
# Server runs on http://localhost:3000
```

#### Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm start               # Run production build
npm run start:debug     # Debug production build

# Code Quality
npm run lint            # Check code style
npm run lint -- --fix   # Auto-fix code style
npm run test            # Run unit tests
npm test -- --watch     # Watch mode for tests

# NX Commands
npm run nx -- graph     # View dependency graph
npm run nx -- affected:build   # Build changed packages
```

### Database Configuration

Create `.env` file in project root:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=evershop

# App
NODE_ENV=development
DEBUG=true
APP_URL=http://localhost:3000

# Optional
REDIS_URL=redis://localhost:6379
ELASTICSEARCH_URL=http://localhost:9200
```

### Docker Setup (Optional)

```bash
# Start PostgreSQL in Docker
docker-compose up -d

# Check database connection
psql -h localhost -U postgres -d evershop
```

---

## Troubleshooting

### Build Fails Locally but Passes in CI

```bash
# Clear cache and rebuild
npm run compile -- --clean
npm run build
```

### Tests Fail Locally

```bash
# Clear Jest cache
npm run test -- --clearCache

# Run with verbose output
npm run test -- --verbose
```

### NX Graph Not Showing

```bash
# Regenerate project references
npm run nx -- reset

# Restart graph viewer
npm run nx -- graph
```

### Merge Conflicts

```bash
# Resolve conflicts in editor
git status  # See conflicted files

# After fixing conflicts
git add .
git commit -m "resolve merge conflicts"
git push origin feature/my-feature
```

---

## Git Commit Message Format

Follow conventional commits for clear history:

```
type(scope): subject

body

footer
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
**Scope**: `auth`, `catalog`, `checkout`, `cms`, `customer`, `oms`, `core`

**Examples**:
```
feat(auth): add two-factor authentication

- Implement TOTP support
- Add verification email flow
- Add recovery codes

Closes #123
```

```
fix(catalog): prevent duplicate product imports

Search queries now deduplicate results before processing.

Fixes #456
```

---

## Release Process

### Creating a Release

1. **Merge all features** to `main` branch
2. **All tests pass** in main
3. **Create release notes**
   ```bash
   git log --oneline main..prev-version
   ```
4. **Deploy to production** (automatic on merge to main)
5. **Tag the release**
   ```bash
   git tag -a v2.2.0 -m "Release version 2.2.0"
   git push origin v2.2.0
   ```

### Rollback Process

If production deployment has critical issues:

```bash
# Revert problematic commit
git revert <commit-hash>
git push origin main

# This triggers CI/CD to deploy the previous working version
```

---

## Contact & Support

- **Team Lead**: Châu Gia Anh (3122411002)
- **Git Issues**: Post bugs/features to GitHub Issues
- **Code Review**: Request reviews from team members
- **Documentation**: Update this guide as processes change

---

## Checklist: Before Merging to Main

- [ ] All tests pass (`npm run test`)
- [ ] Linting passes (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] Code reviewed and approved
- [ ] Branch is up to date with main
- [ ] No merge conflicts
- [ ] Documentation updated if needed
- [ ] Commit messages are clear and descriptive
- [ ] Related issues are linked in PR

---

**Last Updated**: 2025
**Version**: 1.0
