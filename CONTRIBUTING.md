# Contributing to Raybet

Thank you for your interest in contributing to Raybet! We welcome contributions from the community.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/janszotkowski/raybet.git`
3. Create a new branch: `git checkout -b feature/your-feature-name`
4. Install dependencies: `pnpm install`
5. Start the development server: `pnpm dev`

## Development Setup

### Prerequisites

- Node.js (LTS version recommended)
- pnpm 10.28.2 or higher
- Git

### Project Structure

- `/app` - Application routes and pages
- `/src` - Source code including components, services, and utilities
- `/public` - Static assets

## Making Changes

### Code Style

- Run `pnpm lint` to check for linting errors
- Run `pnpm lint:fix` to automatically fix linting issues
- Follow existing code patterns and conventions
- Use TypeScript types for all new code
- Write clear, descriptive commit messages

### Commit Messages

Follow the conventional commits specification:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Example: `feat: Add user profile page`

### Testing

- Test your changes thoroughly before submitting
- Ensure the application builds successfully: `pnpm build`
- Check for TypeScript errors
- Verify that existing functionality still works

## Submitting Changes

1. Commit your changes with clear, descriptive messages
2. Push your branch to your fork
3. Open a Pull Request against the `main` branch
4. Provide a clear description of the changes
5. Link any relevant issues

### Pull Request Guidelines

- Keep PRs focused on a single feature or fix
- Update documentation if needed
- Ensure your code passes linting checks
- Respond to review feedback promptly
- Be patient and respectful during the review process

## Internationalization

This project uses Inlang for internationalization:

- Add translations to the appropriate language files
- Use `pnpm machine-translate` for automated translations
- Follow existing patterns for string interpolation

## Bug Reports

When reporting bugs, please include:

- Clear description of the issue
- Steps to reproduce
- Expected behavior vs actual behavior
- Environment details (OS, browser, Node version)
- Screenshots if applicable

## Feature Requests

We welcome feature requests! Please:

- Check if the feature has already been requested
- Provide a clear use case
- Explain how it benefits users
- Be open to discussion and feedback

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## Questions?

Feel free to open an issue for questions or clarifications.

Thank you for contributing to Raybet!
