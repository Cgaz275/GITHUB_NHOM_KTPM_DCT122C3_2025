# Contributing to EverShop

Thank you for contributing to EverShop! This guide explains how to contribute effectively while maintaining code quality and project structure.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Report issues professionally

## Before You Start

1. **Read the documentation**:
   - [SETUP.md](./SETUP.md) - Local environment setup
   - [WORKFLOW.md](./WORKFLOW.md) - Development workflow
   - [MODULES_DEPENDENCY_MAP.md](./MODULES_DEPENDENCY_MAP.md) - Architecture

2. **Check existing issues** - Don't duplicate work

3. **Check CI/CD status** - Ensure tests pass in main branch

## Development Process

### Step 1: Create Branch

```bash
# Update main
git checkout main
git pull origin main

# Create feature branch
git checkout -b modules/feature-name
```

**Branch naming conventions**:
- `modules/auth` - Authentication module
- `modules/catalog` - Product catalog
- `modules/checkout` - Checkout process
- `modules/cms` - Content management
- `modules/customer` - Customer management
- `modules/oms` - Order management system
- `feature/specific-task` - Cross-module features

### Step 2: Make Changes

```bash
# Make your changes
# Test locally: npm run dev
# Run tests: npm run test
# Check linting: npm run lint
```

### Step 3: Run Quality Checks

```bash
# Format code
npm run lint -- --fix

# Run tests
npm run test -- --coverage

# Build
npm run build

# No errors should occur
```

### Step 4: Commit Changes

Follow conventional commit format:

```
type(scope): short description

Longer explanation of what and why.

Fixes #123
```

**Types**:
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Code style (no logic changes)
- `refactor` - Code refactoring
- `test` - Adding/updating tests
- `chore` - Build/dependency changes

**Examples**:
```bash
git commit -m "feat(auth): add two-factor authentication

Implement TOTP-based 2FA for enhanced security:
- Add authenticator app support
- Send backup codes via email
- Add 2FA toggle in account settings

Closes #456"
```

### Step 5: Push and Create PR

```bash
git push origin modules/feature-name
```

Create Pull Request on GitHub:
- Clear title and description
- Link related issues
- Explain what changed and why
- Add relevant labels

### Step 6: Code Review

Address feedback from reviewers:
- Make requested changes
- Push new commits
- Don't force push (keeps history)
- Request re-review when ready

### Step 7: Merge to Main

Once approved:
1. Ensure branch is up to date: `git rebase main`
2. All CI/CD checks pass
3. Use "Squash and merge" for clean history

```bash
# After merge, delete branch
git branch -d modules/feature-name
git push origin --delete modules/feature-name
```

## Code Standards

### TypeScript

- Use TypeScript for new code
- Enable strict mode: `"strict": true` in tsconfig.json
- Type annotations required for public APIs
- Use interfaces for objects, types for unions

```typescript
// Good
interface User {
  id: string;
  name: string;
  email: string;
}

const getUser = (id: string): User => {
  // implementation
};

// Avoid
const getUser = (id) => {
  // implementation
};
```

### React Components

- Use functional components with hooks
- Props should be typed
- Keep components small and focused
- Use proper error boundaries

```typescript
// Good
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ label, onClick, disabled = false }) => {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
};

export default Button;
```

### CSS/Styling

- Use Tailwind CSS for styling
- Avoid inline styles
- Use semantic class names
- Mobile-first approach

```css
/* Good */
.product-card {
  @apply rounded-lg shadow-md p-4;
}

.product-card:hover {
  @apply shadow-lg;
}

@media (max-width: 640px) {
  .product-card {
    @apply p-2;
  }
}

/* Avoid */
<div style="padding: 16px; background-color: white;">
```

### Testing

- Write tests for new features
- Minimum 80% code coverage
- Test user behavior, not implementation
- Use descriptive test names

```typescript
// Good
describe('UserService', () => {
  it('should return a user by id', async () => {
    const user = await userService.getById('123');
    expect(user).toBeDefined();
    expect(user.id).toBe('123');
  });
});

// Avoid
describe('UserService', () => {
  it('works', () => {
    expect(true).toBe(true);
  });
});
```

### Comments and Documentation

- Write self-documenting code
- Comment WHY, not WHAT
- Document complex algorithms
- Update README when adding features

```typescript
// Good - Explains why
// We use a Set here instead of array for O(1) lookup performance
const userIds = new Set(response.data.map(u => u.id));

// Avoid - Restates obvious code
// Get the user id from response
const userId = response.data.user.id;
```

## Testing Requirements

### Running Tests

```bash
# Run all tests
npm run test

# Run specific test file
npm run test -- UserService.test.ts

# Run with coverage
npm run test -- --coverage

# Watch mode
npm run test -- --watch
```

### Test Coverage Goals

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

### What to Test

✅ **Do test**:
- Core business logic
- API endpoints
- Utility functions
- Data transformations
- Error cases

❌ **Don't test**:
- Framework code
- Third-party libraries
- Simple getters/setters
- UI implementation details

## Linting and Formatting

### Auto-fix Code Issues

```bash
# Fix linting issues
npm run lint -- --fix

# This automatically:
- Sorts imports
- Adds/removes semicolons
- Fixes spacing
- Corrects indentation
```

### Manual Review

```bash
# Check without fixing
npm run lint
```

All code must pass linting before merge.

## Performance Considerations

- Minimize bundle size
- Use lazy loading for routes
- Optimize images and assets
- Profile before optimizing
- Use NX caching effectively

```bash
# Check bundle size
npm run build

# View detailed analysis
npm run nx -- run evershop:analyze
```

## Documentation

When adding features, update:

1. **Code comments** - Complex logic only
2. **README.md** - New features/setup
3. **API documentation** - New endpoints
4. **Type definitions** - Clear interfaces
5. **Module documentation** - How to use

```typescript
/**
 * Calculate total price including tax
 * 
 * @param basePrice - Price before tax
 * @param taxRate - Tax percentage (0-100)
 * @returns Total price including tax
 * 
 * @example
 * const total = calculateTotal(100, 10); // 110
 */
const calculateTotal = (basePrice: number, taxRate: number): number => {
  return basePrice * (1 + taxRate / 100);
};
```

## Security

- Never commit secrets or credentials
- Use environment variables for sensitive data
- Validate all user input
- Use parameterized queries for databases
- Keep dependencies updated
- Run security audits: `npm audit`

```bash
# Check for vulnerable dependencies
npm audit

# Fix automatically when possible
npm audit fix
```

## Performance Checklist

Before submitting PR:

- [ ] Code review checklist
  - [ ] No console.logs or debug code
  - [ ] No commented-out code
  - [ ] Proper error handling
  - [ ] Type safety (no `any`)
  - [ ] No unused imports/variables

- [ ] Performance checklist
  - [ ] No unnecessary re-renders
  - [ ] Proper memoization where needed
  - [ ] Database queries optimized
  - [ ] No memory leaks

- [ ] Security checklist
  - [ ] No secrets in code
  - [ ] Input validation present
  - [ ] SQL injection prevention
  - [ ] XSS prevention

- [ ] Testing checklist
  - [ ] Unit tests added
  - [ ] Coverage > 80%
  - [ ] Edge cases tested
  - [ ] All tests passing

## CI/CD Pipeline

All PRs must pass:

✅ **Linting** - ESLint
✅ **Tests** - Jest with coverage
✅ **Build** - TypeScript compilation
✅ **Code Review** - At least 1 approval

Merge to main triggers:
✅ **Production tests**
✅ **Production build**
✅ **Vercel deployment**

## Helpful Resources

- [EverShop Docs](https://evershop.io/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev/)
- [NX Documentation](https://nx.dev/)
- [Conventional Commits](https://www.conventionalcommits.org/)

## Questions?

- Open an issue for discussions
- Ask on GitHub Discussions
- Contact team lead
- Check existing documentation

---

Thank you for contributing to EverShop! 🚀
