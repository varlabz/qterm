# qterm

A terminal application for interacting with various language models using Langchain.js.

## Features

- Support for multiple LLM providers: OpenAI, Anthropic, Google, Ollama, and more
- Interactive terminal mode for chat-like interactions
- Command-line mode for one-off queries
- Ability to load system prompts and context from files or strings

## Installation

```bash
# Clone the repository
git clone https://github.com/varlabz/qterm.git
cd qterm

# Install dependencies
npm install

# Build the application
npm run build
```

## Usage

### Basic usage

```bash
# Start interactive mode
npm start

# Use CLI mode with input
npm start -- -i "Your query here"

# Select a specific provider and model
npm start -- -p google -m gemini-2.0-flash
```

### Options

- `-p, --provider <value>`: Provider (e.g., google, openai, openrouter)
- `-m, --model <value>`: Model to use
- `-i, --input <value>`: Input text to process (string or file path)
- `-s, --system-prompt <value>`: System prompt (string or file path)
- `-L, --list-prompts`: List all available prompts from fabric and awesome directories
- `-P, --prompt <value>`: Show a specific prompt by name 

## Using Docker

### Pulling the Docker image

```bash
docker pull varlabz/qterm
```

### Running with Docker

```bash
# Interactive mode
docker run -it --rm -v $(pwd)/.key:/app/.key:ro varlabz/qterm

# CLI mode with input
docker run -it --rm -v $(pwd)/.key:/app/.key:ro varlabz/qterm -i "Your query here"

# With specific provider and model
docker run -it --rm -v $(pwd)/.key:/app/.key:ro varlabz/qterm -p google -m gemini-2.0-flash
```

### Building the Docker image locally (optional)

```bash
docker build -t qterm .
```

## License

MIT