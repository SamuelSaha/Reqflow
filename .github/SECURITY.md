# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security vulnerability in Reqflow, please report it responsibly.

### How to Report

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report them via:

1. **GitHub Security Advisories** (preferred): Use the [Security Advisories](https://github.com/samuelsaha/reqflow/security/advisories) feature
2. **Email**: Send details to security@reqflow.com

### What to Include

Please include the following information:

- Type of vulnerability (e.g., XSS, SQL injection, authentication bypass)
- Full paths of source file(s) related to the vulnerability
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the vulnerability

### Response Timeline

- **Initial Response**: Within 48 hours
- **Triage & Assessment**: Within 7 days
- **Fix Development**: Depends on severity (critical: 24-72 hours, high: 7 days, medium: 30 days)
- **Disclosure**: After fix is released and users have had time to update (typically 30 days)

### Security Best Practices

When deploying Reqflow:

1. **Environment Variables**: Never commit secrets. Use secure environment variable management
2. **HTTPS**: Always use HTTPS in production
3. **Database**: Use SSL connections to PostgreSQL
4. **Updates**: Keep dependencies up to date
5. **Access Control**: Review and limit user roles appropriately

### Security Features

Reqflow implements the following security measures:

- Row-Level Security (RLS) for tenant isolation at the database level
- Field-level encryption for sensitive data (OAuth tokens, API keys)
- CSRF protection on all mutations
- Rate limiting to prevent abuse
- Input sanitization and validation
- Audit logging for all security events
- Secret detection in pre-commit hooks

### Security Scan Results

We run automated security scans on every push:

- **npm audit**: Dependency vulnerability scanning
- **Gitleaks**: Secret detection
- **CodeQL**: Static analysis
- **Semgrep**: SAST scanning
- **Dependabot**: Automated dependency updates

---

*Last updated: February 2026*
