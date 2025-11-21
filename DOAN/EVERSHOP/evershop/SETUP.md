# EverShop Setup Guide

Complete step-by-step guide to set up the EverShop project locally.

## Prerequisites

### Required
- **Node.js** 20.x or 22.x ([Download](https://nodejs.org/))
- **npm** 9.x or higher
- **Git** 2.30+ ([Download](https://git-scm.com/))
- **PostgreSQL** 16 ([Download](https://www.postgresql.org/download/) or use Docker)

### Recommended
- **Git GUI** (GitHub Desktop, GitKraken, or SourceTree)
- **Code Editor** (VSCode with extensions: ESLint, Prettier)
- **Docker** for database management

## Installation Steps

### 1. Clone Repository

```bash
# Clone the repository
git clone https://github.com/Cgaz275/NHOM_KTPM_DCT122C3_2025.git

# Navigate to project
cd DOAN/EVERSHOP/evershop
```

### 2. Install Dependencies

```bash
# Install npm v9 globally
npm install -g npm@9

# Install project dependencies
npm install

# Verify installation
npm --version  # Should be v9.x
node --version # Should be v20.x or v22.x
```

### 3. Configure Database

#### Option A: Using Docker (Recommended)

```bash
# Start PostgreSQL container
docker-compose up -d

# Verify container is running
docker ps | grep postgres

# Connection details:
# Host: localhost
# Port: 5432
# User: postgres
# Password: postgres
# Database: evershop
```

#### Option B: Using Local PostgreSQL

```bash
# Create database
psql -U postgres -c "CREATE DATABASE evershop;"

# Create .env file with your credentials
touch .env
```

Add to `.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=evershop
```

### 4. Setup EverShop

```bash
# Compile TypeScript
npm run compile
npm run compile:db

# Initialize database and install
npm run setup

# Follow prompts:
# - Select admin email
# - Set admin password
# - Configure shop settings
```

### 5. Start Development Server

```bash
# Development mode with auto-reload
npm run dev

# Server will run on http://localhost:3000
# Open http://localhost:3000 in browser

# Stop with Ctrl+C
```

## Verification

Check that everything works:

```bash
# In project directory

# 1. Verify Node/npm versions
node --version   # v20.x or v22.x
npm --version    # v9.x

# 2. Verify database connection
npm run setup    # Should not error

# 3. Run quick test
npm run test -- --testNamePattern="sample" --maxWorkers=1

# 4. Build the project
npm run build
```

## Environment Configuration

### Create `.env` File

```bash
cp .env.example .env  # If template exists
# OR
touch .env            # Create new file
```

### Required Environment Variables

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5433
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=evershop

# Application
NODE_ENV=development
APP_URL=http://localhost:3000
APP_NAME=EverShop

# Security
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_secure_password

# Optional Services
REDIS_URL=redis://localhost:6379
ELASTICSEARCH_URL=http://localhost:9200
```

### Production Configuration

For Vercel deployment, add environment variables in Vercel dashboard:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Settings → Environment Variables
4. Add variables:
   - `DB_HOST`
   - `DB_PORT`
   - `DB_USER`
   - `DB_PASSWORD`
   - `DB_NAME`
   - `NODE_ENV=production`

## Common Commands

### Development

```bash
# Start dev server
npm run dev

# Development with debug info
npm run start:debug

# Build for production
npm run build

# Run production build
npm start

# Watch for changes and rebuild
npm run compile -- --watch
```

### Code Quality

```bash
# Check code style
npm run lint

# Fix code style issues automatically
npm run lint -- --fix

# Run all tests
npm run test

# Run tests in watch mode
npm run test -- --watch

# Run tests with coverage report
npm run test -- --coverage
```

### NX Commands

```bash
# View project dependency graph
npm run nx -- graph

# Build affected packages
npm run nx -- affected:build

# Test affected packages
npm run nx -- affected:test

# Lint affected packages
npm run nx -- affected:lint

# List all projects
npm run nx -- list
```

### Workspace Management

```bash
# Create a new package
npm run nx -- generate @nx/node:library --name my-lib

# Create a React component
npm run nx -- generate @nx/react:component --project=evershop --name MyComponent

# Reset NX cache
npm run nx -- reset
```

## Project Structure

```
DOAN/EVERSHOP/evershop/
├── packages/
│   ├── evershop/              # Main application
│   │   ├── src/
│   │   │   ├── modules/       # Feature modules
│   │   │   ├── bin/          # CLI scripts
│   │   │   └── ...
│   │   ├── dist/             # Compiled output
│   │   └── project.json
│   ├── postgres-query-builder/
│   └── create-evershop-app/
├── extensions/                # Feature extensions
├── themes/                    # UI themes
├── public/                    # Static files
├── config/                    # Configuration files
├── .github/
│   └── workflows/             # CI/CD pipelines
├── .env                       # Local environment variables
├── package.json              # Root package config
├── nx.json                   # NX workspace config
├── vercel.json              # Vercel deployment config
└── WORKFLOW.md              # Development workflow guide
```

## Troubleshooting

### Issue: Cannot find module errors

**Solution**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install

# Or using npm ci for reproducible installs
npm ci
```

### Issue: Port 3000 already in use

**Solution**:
```bash
# Find process using port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows

# Or use different port
PORT=3001 npm run dev
```

### Issue: Database connection error

**Solution**:
```bash
# Check if PostgreSQL is running
psql -h localhost -U postgres -c "\l"

# If Docker: restart container
docker-compose restart database

# Check connection in .env
# Verify DB_HOST, DB_USER, DB_PASSWORD values
```

### Issue: Jest cache errors

**Solution**:
```bash
npm run test -- --clearCache
npm run test
```

### Issue: NX graph not loading

**Solution**:
```bash
# Reset NX cache
npm run nx -- reset

# Regenerate graph
npm run nx -- graph
```

## IDE Setup

### VSCode Extensions (Recommended)

Install these extensions for best development experience:

1. **ESLint** (dbaeumer.vscode-eslint)
   - Lint code as you type
   
2. **Prettier** (esbenp.prettier-vscode)
   - Auto-format code on save

3. **TypeScript Vue Plugin** (Vue.volar)
   - If using Vue components

4. **NX Console** (nrwl.nx-console)
   - GUI for NX commands

5. **GraphQL** (GraphQL.vscode-graphql)
   - GraphQL syntax highlighting

### VSCode Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ]
}
```

## Git Configuration

### Set Up Git User

```bash
git config user.name "Your Name"
git config user.email "your.email@example.com"

# Set globally
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Create SSH Key (Optional but recommended)

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your.email@example.com"

# Add to GitHub: https://github.com/settings/keys
```

## Next Steps

1. ✅ Read [WORKFLOW.md](./WORKFLOW.md) for development workflow
2. ✅ Create a feature branch: `git checkout -b modules/my-feature`
3. ✅ Make changes and commit
4. ✅ Push and create a Pull Request
5. ✅ Wait for CI/CD checks to pass
6. ✅ Get code review and merge

## Getting Help

- Check [WORKFLOW.md](./WORKFLOW.md) for process documentation
- Search GitHub Issues for similar problems
- Ask team members in discussions
- Review error logs carefully

---

**Happy coding! 🚀**
