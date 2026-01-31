# Security Policy

## Supported Versions

We currently support the following versions with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of Raybet seriously. If you discover a security vulnerability, please follow these steps:

1. **Do NOT** open a public issue
2. Email the details to the project maintainers
3. Include a detailed description of the vulnerability
4. Include steps to reproduce the issue
5. Include potential impact and suggested fixes if possible

### What to expect

- Acknowledgment of your report within 48 hours
- Regular updates on the progress of addressing the vulnerability
- Notification when the vulnerability is fixed
- Credit for your discovery (if desired) in the security advisory

### Disclosure Policy

- Please give us reasonable time to address the vulnerability before public disclosure
- We will work with you to ensure proper credit for your discovery
- We aim to release security patches as quickly as possible

## Security Best Practices

When using Raybet, please follow these security best practices:

- Keep your dependencies up to date
- Use environment variables for sensitive configuration
- Never commit credentials or API keys to the repository
- Use HTTPS in production environments
- Review and validate all user inputs
- Follow the principle of least privilege for database and API access

## Known Security Considerations

- This application uses Appwrite for backend services. Ensure your Appwrite instance is properly secured
- API keys and secrets should be stored in environment variables
- Regular security audits of dependencies are recommended

Thank you for helping keep Raybet and its users safe!
