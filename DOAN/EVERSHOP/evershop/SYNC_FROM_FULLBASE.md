# Syncing Modules from FullBase

This guide explains how to sync modules and updates from the FullBase/evershop-dev repository to DOAN/EVERSHOP/evershop.

## Understanding the Structure

### Two Repositories

#### FullBase/evershop-dev (Source of Truth)
- Contains **complete, working source code**
- All modules fully implemented
- Latest features and fixes
- Reference implementation
- **DO NOT deploy from here**

#### DOAN/EVERSHOP/evershop (Standardized Deployment)
- Clean, standardized setup
- Gradual module integration
- CI/CD and NX managed
- Production deployment target
- **Deploy from here**

### Workflow

```
FullBase/evershop-dev                DOAN/EVERSHOP/evershop
    (Complete source)                     (Deployment)
         ↓                                    ↓
    Copy modules                        Integrate modules
    Pull updates                        Setup CI/CD
    Reference impl.                     Deploy to Vercel
```

---

## How to Sync a Module

### Step 1: Identify What to Copy

For each module, you need:

```
Module Structure:
├── packages/evershop/src/modules/<module-name>/
│   ├── api/                    # GraphQL/REST API
│   ├── controllers/            # Business logic
│   ├── models/                 # Database models
│   ├── services/               # Services
│   ├── migrations/             # Database migrations
│   ├── config.ts               # Module config
│   └── index.ts                # Module exports
├── extensions/<module-name>/    # Extensions (if any)
└── themes/<theme-name>/        # Theme files (if any)
```

### Step 2: Copy Module Files

```bash
# 1. Navigate to FullBase
cd DOAN/EVERSHOP/FullBase/evershop-dev

# 2. Find the module
ls -la packages/evershop/src/modules/
# Shows: auth, catalog, checkout, cms, customer, oms, etc.

# 3. Copy to main evershop folder
# Example: copying auth module

cp -r packages/evershop/src/modules/auth/ \
      ../../../evershop/packages/evershop/src/modules/

# Copy extensions if present
cp -r extensions/auth/ ../../../evershop/extensions/ 2>/dev/null || true

# Copy theme files if present
cp -r themes/auth/ ../../../evershop/themes/ 2>/dev/null || true
```

### Step 3: Update Dependencies

```bash
# Navigate to main folder
cd DOAN/EVERSHOP/evershop

# Install any new dependencies
npm install

# Compile the code
npm run compile
npm run compile:db
```

### Step 4: Apply Database Migrations

```bash
# Run migrations for new module
npm run setup

# Or run specific module migrations
npm run setup -- --module=auth
```

### Step 5: Test Module

```bash
# Run tests
npm run test

# Lint code
npm run lint

# Build
npm run build

# Start dev server
npm run dev

# Test module functionality
# Open http://localhost:3000
```

### Step 6: Create Pull Request

```bash
# Create feature branch
git checkout -b modules/auth

# Stage changes
git add .

# Commit
git commit -m "feat(auth): integrate auth module from FullBase

- Copied auth module implementation
- Added API endpoints
- Setup database migrations
- All tests passing"

# Push
git push origin modules/auth

# Create PR on GitHub
# - Title: "feat(auth): integrate authentication module"
# - Description: List what was added
# - Link to any related discussions
```

---

## Syncing Updates

### When FullBase is Updated

Use Git to track changes:

```bash
# 1. Check what changed in FullBase
cd DOAN/EVERSHOP/FullBase/evershop-dev
git log --oneline -10

# 2. Check current version in main repo
cd DOAN/EVERSHOP/evershop
git log --oneline -10

# 3. Compare versions
git log --oneline ../FullBase/evershop-dev/main..main

# 4. Identify relevant changes
# Changes only for modules you use
```

### Sync Specific Changes

```bash
# Get the commit hash from FullBase
cd DOAN/EVERSHOP/FullBase/evershop-dev
git log --oneline | grep "your change"
# Example: commit abc123 "fix(auth): improve security"

# Apply to main repo
cd DOAN/EVERSHOP/evershop
git cherry-pick abc123

# If conflicts, resolve and continue
git add .
git cherry-pick --continue
```

### Sync Entire Module Update

```bash
# If a module had significant updates

# 1. Identify all changes to the module
cd DOAN/EVERSHOP/FullBase/evershop-dev
git log --oneline -- packages/evershop/src/modules/auth/

# 2. Get range of commits
# Example: commits from abc123 to def456

# 3. Cherry-pick range
cd DOAN/EVERSHOP/evershop
git cherry-pick abc123..def456

# 4. Resolve conflicts if needed
# 5. Test thoroughly
npm run test
npm run build

# 6. Create PR with update
git push origin modules/auth-update
# Create PR on GitHub
```

---

## Module Dependencies

### Check Module Dependencies

```bash
# View NX graph to see dependencies
npm run nx -- graph

# Filter to specific module
npm run nx -- graph --exclude='*' --include='evershop'

# Generate dependency map
npm run nx -- list -- --with-target=build
```

### Common Module Dependencies

```
auth (no dependencies)
  ↓
customer (depends: auth)
  ↓
catalog (depends: auth)
  ↓
checkout (depends: auth, customer, catalog)
  ↓
oms (depends: auth, customer, checkout)
```

**Import order**:
1. Core modules (no dependencies)
2. Customer/User modules
3. Content modules (catalog)
4. Transaction modules (checkout, orders)

---

## Handling Conflicts

### If Sync Conflicts Occur

```bash
# 1. See conflicted files
git status

# 2. Open conflicts in editor
# Look for <<<<<<, ======, >>>>>>

# 3. Resolve by choosing:
# - Accept ours (current)
# - Accept theirs (FullBase)
# - Combine both

# 4. Stage resolved files
git add .

# 5. Complete cherry-pick
git cherry-pick --continue

# 6. Or abort if too complex
git cherry-pick --abort
```

### Manual Integration

If automated sync fails:

```bash
# 1. Manually copy changed files
cp -r DOAN/EVERSHOP/FullBase/evershop-dev/packages/evershop/src/modules/auth/ \
      DOAN/EVERSHOP/evershop/packages/evershop/src/modules/

# 2. Run tests
npm run test

# 3. Fix any issues
npm run lint -- --fix

# 4. Commit
git commit -m "sync(auth): update from FullBase"
```

---

## Version Control

### Track FullBase Version

Create a file to track which version of FullBase you're synced to:

```bash
# Create .fullbase-sync file
echo "Last synced from FullBase on: $(date)" > .fullbase-sync
echo "FullBase commit: $(cd ../FullBase/evershop-dev && git rev-parse HEAD)" >> .fullbase-sync

# Add to git
git add .fullbase-sync
git commit -m "chore: update FullBase sync marker"
```

### Version Comparison

```bash
# Compare package versions
diff <(cd ../FullBase/evershop-dev && npm list) <(npm list)

# Compare specific module versions
cd ../FullBase/evershop-dev && npm list | grep auth
cd ../../../evershop && npm list | grep auth
```

---

## Best Practices

### ✅ DO

- **Sync regularly** - Don't let FullBase drift too far
- **Test after sync** - Always run full test suite
- **Review changes** - Understand what you're syncing
- **Document updates** - Note which version synced
- **Create PRs** - Let team review before merging
- **Migrate database** - Run migrations for new features

### ❌ DON'T

- **Don't force push** - Preserves history for debugging
- **Don't skip tests** - Could break production
- **Don't merge untested code** - CI/CD should catch it
- **Don't bypass PR reviews** - Quality control matters
- **Don't sync unrelated changes** - Stay focused on modules

---

## Sync Workflow Summary

```
1. Identify module in FullBase
   ↓
2. Copy module files
   ↓
3. Install dependencies
   ↓
4. Run tests
   ↓
5. Create feature branch
   ↓
6. Commit and push
   ↓
7. Create pull request
   ↓
8. Code review and CI/CD
   ↓
9. Merge to main
   ↓
10. Deploy to Vercel
```

---

## Troubleshooting Sync Issues

### Build Fails After Sync

```bash
# 1. Clear cache
npm run nx -- reset
rm -rf node_modules
npm install

# 2. Recompile
npm run compile
npm run compile:db

# 3. Check for missing files
npm run build

# 4. Review sync changes
git diff
```

### Tests Fail After Sync

```bash
# 1. Check which tests fail
npm run test

# 2. Review test output
npm run test -- --verbose

# 3. Check for breaking changes in FullBase
# Review CHANGELOG.md in FullBase

# 4. Fix tests according to new API
```

### Conflicts During Sync

```bash
# 1. See conflicted files
git status

# 2. Review conflicts carefully
git diff

# 3. Compare with FullBase
diff -r DOAN/EVERSHOP/FullBase/evershop-dev/packages/evershop/src/modules/auth/ \
       DOAN/EVERSHOP/evershop/packages/evershop/src/modules/auth/

# 4. Resolve intelligently
# Don't just accept one side

# 5. Test thoroughly
npm run test
```

---

## Getting Help

- **FullBase Issues**: Check DOAN/EVERSHOP/FullBase/evershop-dev/README.md
- **Sync Questions**: Review MODULES_DEPENDENCY_MAP.md
- **Merge Conflicts**: Contact team lead
- **Breaking Changes**: Check CHANGELOG.md

---

## Example: Syncing Auth Module

Complete example of syncing the auth module:

```bash
# 1. Check what needs syncing
cd DOAN/EVERSHOP/FullBase/evershop-dev
ls -la packages/evershop/src/modules/auth/

# 2. Navigate to main folder
cd DOAN/EVERSHOP/evershop

# 3. Copy auth module
cp -r ../FullBase/evershop-dev/packages/evershop/src/modules/auth/ \
      packages/evershop/src/modules/

# 4. Install and test
npm install
npm run compile

# 5. Run tests
npm run test -- auth

# 6. If all pass, create branch
git checkout -b modules/auth

# 7. Commit
git add .
git commit -m "feat(auth): sync authentication module from FullBase"

# 8. Push and create PR
git push origin modules/auth

# 9. Wait for CI/CD (should pass)
# 10. Merge once approved
```

---

**Last Updated**: 2025
**Version**: 1.0
