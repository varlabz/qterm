# CLAUDE.md - qterm Development Guide

## Commands
- `npm start` - Run the application
- `npm run build` - Compile TypeScript to JavaScript
- `npm run lint` - Run ESLint to check code quality
- `npm test` - Run tests (needs implementation)

## Running with Arguments
- `npm start -- -p google -m gemini-2.0-flash -s "Your system prompt"` - Run with specific provider and model
- `npm start -- -i "Your input"` - Run in CLI mode with input
- `npm start -- --help` - Show all available options

## Code Style Guidelines
- **Imports**: Group imports by source (core/external, langchain, local)
- **Formatting**: 2-space indentation, semicolons required
- **Types**: Use TypeScript types over interfaces, leverage generics where appropriate
- **Functions**: Prefer functions over classes, use arrow functions for lexical scoping
- **Variables**: Use `const` over `let` when variables won't be reassigned
- **Naming**:
  - kebab-case for filenames
  - camelCase for variables/functions
  - PascalCase for classes/types
  - ALL_CAPS for constants/enums
- **Error Handling**: Use custom error types and try/catch blocks
- **Documentation**: Use JSDoc comments for functions, classes, and complex types
- **Private Fields**: Use underscore prefix (_fieldName) for private class fields
- **Functional Style**: Use scope functions (let, also, run, apply) from @varlabz/scope-extensions-js
- **Async**: Use async/await over raw promises or callbacks

## Project Structure
- `src/index.ts` - Main entry point and utility functions
- `src/chat.ts` - LLM integration and ChatAgent implementation
- `src/cli.ts` - Command-line interface handling
- `src/terminal.ts` - Interactive terminal interface
- `src/types.ts` - TypeScript type definitions

## Best Practices
- Follow Single Responsibility Principle
- Write pure functions where possible
- Implement proper error handling
- Use dependency injection for testability