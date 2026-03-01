# Reqflow Security Hooks

This directory contains Git hooks managed by [Husky](https://github.com/typicode/husky) for security and code quality checks.

## Hooks

### pre-commit
Runs on every `git commit`:
- **lint-staged**: Runs ESLint on staged TypeScript/JavaScript files
- **Ruff**: Formats and lints Python files in SWARM/

### commit-msg
Runs after commit message is written:
- **gitleaks**: Scans commit message for accidentally included secrets

### pre-push
Runs on every `git push`:
- **npm audit**: Checks for vulnerable dependencies (high/critical)
- **TypeScript**: Runs type checking to catch errors before push

## Setup

Hooks are automatically installed when running:

```bash
npm install
# or
npm run prepare
```

## Bypassing Hooks (Emergency Only)

```bash
# Skip all hooks (NOT RECOMMENDED for normal use)
git commit --no-verify
git push --no-verify
```

## Additional Security: pre-commit Framework

For comprehensive secret detection, also install the Python pre-commit framework:

```bash
# Install pre-commit (requires Python)
pip install pre-commit

# Install the git hooks
pre-commit install

# Run manually on all files
pre-commit run --all-files
```

### Included Checks (via .pre-commit-config.yaml)

- **gitleaks**: Comprehensive secret detection
- **secretlint**: Additional secret scanning
- **detect-private-key**: Catches private key files
- **detect-aws-credentials**: AWS key detection
- **check-added-large-files**: Prevents large file commits (>500KB)
- **trailing-whitespace**: Code cleanliness
- **ruff**: Python linting and formatting

## Configuration Files

| File | Purpose |
|------|---------|
| `.pre-commit-config.yaml` | Pre-commit framework hooks |
| `.gitleaks.toml` | Custom secret detection rules |
| `.secretlintrc.json` | Secretlint configuration |
| `package.json` | lint-staged configuration |
