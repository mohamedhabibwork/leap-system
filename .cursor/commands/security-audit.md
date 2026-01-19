# Security Audit

Perform comprehensive security audit checklist for both backend and frontend code.

## Backend Security Checklist

1. **Input Validation**
   - [ ] All DTOs use class-validator decorators
   - [ ] Validate all user inputs
   - [ ] Sanitize user-generated content
   - [ ] Validate file uploads (type, size)
   - [ ] Use whitelist validation (not blacklist)

2. **Authentication & Authorization**
   - [ ] All protected routes use guards
   - [ ] JWT tokens are properly validated
   - [ ] Roles and permissions are checked
   - [ ] Password hashing uses bcrypt with proper salt rounds
   - [ ] Session management is secure

3. **SQL Injection Prevention**
   - [ ] Use parameterized queries (Drizzle ORM handles this)
   - [ ] No raw SQL with user input
   - [ ] Use ORM query builders

4. **XSS Prevention**
   - [ ] Sanitize HTML output
   - [ ] Use Content Security Policy headers
   - [ ] Escape user input in templates

5. **CSRF Protection**
   - [ ] CSRF tokens for state-changing operations
   - [ ] SameSite cookie attributes
   - [ ] Verify origin headers

6. **Rate Limiting**
   - [ ] Implement rate limiting on API endpoints
   - [ ] Different limits for authenticated vs anonymous
   - [ ] Protect sensitive endpoints (login, registration)

7. **Error Handling**
   - [ ] Don't expose sensitive information in errors
   - [ ] Use generic error messages for users
   - [ ] Log detailed errors server-side only

8. **Secrets Management**
   - [ ] No hardcoded secrets
   - [ ] Use environment variables
   - [ ] Secrets stored securely (not in code)
   - [ ] Rotate secrets regularly

9. **Dependencies**
   - [ ] Keep dependencies up to date
   - [ ] Check for known vulnerabilities (npm audit)
   - [ ] Use trusted packages only

10. **Headers & CORS**
    - [ ] Use Helmet for security headers
    - [ ] Configure CORS properly (not `*`)
    - [ ] Set secure cookie flags
    - [ ] Use HTTPS in production

## Frontend Security Checklist

1. **Input Validation**
   - [ ] Client-side validation (UX)
   - [ ] Server-side validation (security)
   - [ ] Sanitize user input before display
   - [ ] Validate file uploads

2. **XSS Prevention**
   - [ ] Use React's built-in XSS protection
   - [ ] Sanitize HTML if using dangerouslySetInnerHTML
   - [ ] Use Content Security Policy

3. **Authentication**
   - [ ] Store tokens securely (httpOnly cookies preferred)
   - [ ] Don't store sensitive data in localStorage
   - [ ] Implement token refresh mechanism
   - [ ] Clear tokens on logout

4. **API Security**
   - [ ] Use HTTPS for all API calls
   - [ ] Validate API responses
   - [ ] Handle errors securely
   - [ ] Don't expose API keys in client code

5. **Dependencies**
   - [ ] Keep dependencies up to date
   - [ ] Check for vulnerabilities
   - [ ] Use trusted packages

6. **Content Security**
   - [ ] Validate external content
   - [ ] Use iframe sandbox attributes
   - [ ] Validate URLs before redirecting

## Common Vulnerabilities to Check

- [ ] SQL Injection
- [ ] XSS (Cross-Site Scripting)
- [ ] CSRF (Cross-Site Request Forgery)
- [ ] Authentication bypass
- [ ] Authorization flaws
- [ ] Insecure direct object references
- [ ] Security misconfiguration
- [ ] Sensitive data exposure
- [ ] Insufficient logging
- [ ] Broken access control

## Tools to Use

- `npm audit` - Check for vulnerable dependencies
- ESLint security plugins
- OWASP ZAP for penetration testing
- Snyk for dependency scanning

## Action Items

After audit, create issues for:
1. Critical vulnerabilities (fix immediately)
2. High-risk issues (fix in current sprint)
3. Medium-risk issues (fix in next sprint)
4. Low-risk issues (document and plan)
