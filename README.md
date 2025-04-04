# qterm

A terminal application for interacting with various language models using Langchain.js.

## Features

- Support for multiple LLM providers: OpenAI, Anthropic, Google, Ollama, and more
- Interactive terminal mode for chat-like interactions
- Command-line mode for one-off queries
- Ability to load system prompts and context from files or strings

## Installation

### Using npm

```bash
# Clone the repository
git clone https://github.com/varlabz/qterm.git
cd qterm

# Install dependencies
npm install

# Build the application
npm run build
```

### Using Docker

#### Pulling the Docker image

```bash
docker pull varlabz/qterm
```

#### Building the Docker image locally (optional)

```bash
docker build -t qterm .
```

## Usage

### Basic usage

```bash
# Start interactive mode
npm start

# Use CLI mode with input
npm start -- -i "Your query here"

# Read input from stdin
echo "Your query here" | npm start -- -i -

# Select a specific provider and model
npm start -- -p google -m gemini-2.0-flash

# Use a custom base URL for the provider
npm start -- -p openai -b https://your-custom-endpoint.com/v1

# Use an MCP configuration file
npm start -- -c ./mcp-config.json

# List available prompts
npm start -- -L

# Show a specific prompt
npm start -- -P "prompt-name"
```

### Command-line Options

- `-p, --provider <value>`: Provider (e.g., google, openai, openrouter)
- `-m, --model <value>`: Model to use
- `-b, --base-url <value>`: Base URL for the LLM provider
- `-i, --input <value>`: Input text to process (string, file path, or "-" to read from stdin)
- `-s, --system-prompt <value>`: System prompt (string or file path)
- `-c, --mcp-config <value>`: MCP config file path
- `-L, --list-prompts`: List all available prompts from fabric and awesome directories
- `-P, --prompt <value>`: Show a specific prompt by name

### Built-in Tools

qterm includes several built-in tools that extend the capabilities of language models:

#### YouTube Transcript Tool

Extracts transcripts from YouTube videos, allowing the language model to analyze or summarize video content.

```bash
# Example usage in a prompt
"Please summarize this YouTube video: https://www.youtube.com/watch?v=dQw4w9WgXcQ"
```

#### Time Tool

Gets the current time with optional timezone and formatting options.

```bash
# Example usage in a prompt
"What time is it now? And what time is it in Tokyo?"
```

Parameters:
- `format`: Locale format (e.g., 'en-US', 'ja-JP')
- `timezone`: Timezone (e.g., 'America/New_York', 'Asia/Tokyo')

#### Playwright Tool

Uses Playwright to interact with web pages and retrieve their HTML content, enabling the language model to analyze web content.

```bash
# Example usage in a prompt
"What is the current headline on example.com?"
```

Commands:
- `fetch`: Get web page content as HTML
- `list`: List open browser tabs

Note: The Playwright tool requires a Chrome instance running with remote debugging enabled on port 9222.

## Advanced Usage

### Running with Docker

```bash
# Interactive mode
docker run -it --rm -v $(pwd)/.key:/app/.key:ro varlabz/qterm

# CLI mode with input
docker run -i --rm -v $(pwd)/.key:/app/.key:ro varlabz/qterm -i "Your query here"

# Read input from stdin
echo "Your query here" | docker run -i --rm -v $(pwd)/.key:/app/.key:ro varlabz/qterm -i -

# With specific provider and model
docker run -it --rm -v $(pwd)/.key:/app/.key:ro varlabz/qterm -p google -m gemini-2.0-flash

# Use a custom base URL for the provider
docker run -it --rm -v $(pwd)/.key:/app/.key:ro varlabz/qterm -p openai -b https://your-custom-endpoint.com/v1

# Use an MCP configuration file (mounted from host)
docker run -it --rm -v $(pwd)/.key:/app/.key:ro -v $(pwd)/mcp-config.json:/app/mcp-config.json:ro varlabz/qterm -c /app/mcp-config.json

# List available prompts
docker run -i --rm -v $(pwd)/.key:/app/.key:ro varlabz/qterm -L

# Show a specific prompt
docker run -i --rm -v $(pwd)/.key:/app/.key:ro varlabz/qterm -P "prompt-name"
```

### Using Aliases

You can create shell aliases to make qterm easier to use in your daily workflow. Aliases allow you to run qterm with your preferred settings using shorter commands.

#### Creating Aliases

You can create aliases for both npm and Docker approaches.

##### Using npm (Local Installation)

Add these lines to your `~/.bashrc`, `~/.bash_profile` (Bash), or `~/.zshrc` (Zsh):

```bash
# Basic qterm alias
alias qt='npm start --prefix /path/to/qterm'

# qterm with specific provider and model
alias qtg='npm start --prefix /path/to/qterm -- -p google -m gemini-2.0-flash'
alias qto='npm start --prefix /path/to/qterm -- -p openai -m gpt-4o'

# qterm with custom base URL
alias qtc='npm start --prefix /path/to/qterm -- -p openai -b https://your-custom-endpoint.com/v1'

# qterm with MCP configuration
alias qtm='npm start --prefix /path/to/qterm -- -c /path/to/mcp-config.json'
```

##### Using Docker

Add these lines to your shell configuration file:

```bash
# Basic qterm alias with Docker
alias qtd='docker run -i --rm -v $(pwd)/.key:/app/.key:ro varlabz/qterm'

# qterm with specific provider and model
alias qtdg='docker run -i --rm -v $(pwd)/.key:/app/.key:ro varlabz/qterm -p google -m gemini-2.0-flash'
alias qtdo='docker run -i --rm -v $(pwd)/.key:/app/.key:ro varlabz/qterm -p openai -m gpt-4o'

# qterm with custom base URL
alias qtdc='docker run -i --rm -v $(pwd)/.key:/app/.key:ro varlabz/qterm -p openai -b https://your-custom-endpoint.com/v1'

# qterm with MCP configuration
alias qtdm='docker run -i --rm -v $(pwd)/.key:/app/.key:ro -v $(pwd)/mcp-config.json:/app/mcp-config.json:ro varlabz/qterm -c /app/mcp-config.json'
```

After adding the aliases, reload your shell configuration:

```bash
# For Bash
source ~/.bashrc  # or source ~/.bash_profile

# For Zsh
source ~/.zshrc
```

#### Using the Aliases

Once set up, you can use qterm with simple commands:

```bash
# Start interactive mode (npm version)
qt

# Start interactive mode (Docker version)
qtd

# Use with input (npm version)
qt -i "Your query here"

# Read input from stdin (npm version)
echo "Your query here" | qt -i -

# Use with input (Docker version)
qtd -i "Your query here"

# Read input from stdin (Docker version)
echo "Your query here" | qtd -i -

# Use Google's Gemini model (Docker version)
qtdg -i "Tell me about quantum computing"

# Use OpenAI with custom base URL (npm version)
qtc -i "What's the weather like today?"

# Use with MCP configuration (npm version)
qtm -i "Use the MCP tools to analyze this data"

# Use OpenAI with custom base URL (Docker version)
qtdc -i "What's the weather like today?"

# Use with MCP configuration (Docker version)
qtdm -i "Use the MCP tools to analyze this data"

# Use with access to local files (Docker version)
qtdl -i "Analyze the file in /workspace/myfile.txt"
```

## Prompt Libraries Integration

qterm integrates with two popular prompt libraries to provide a wide range of pre-built prompts for various use cases:

### Fabric

[Fabric](https://github.com/danielmiessler/fabric) is a collection of prompts designed to solve specific problems using AI. Created by Daniel Miessler, Fabric provides a structured approach to prompt engineering with prompts organized by use case.

Fabric prompts are stored as Markdown files in the `fabric/` directory and can be accessed using the `-P` option.

### Awesome ChatGPT Prompts

[Awesome ChatGPT Prompts](https://github.com/f/awesome-chatgpt-prompts) is a curated list of prompt examples for ChatGPT and other language models. It contains a wide variety of prompts for different roles and tasks.

Awesome ChatGPT Prompts are stored as text files in the `awesome/` directory after being processed from the original CSV format.

### Using Prompt Libraries

You can use prompts from these libraries in several ways:

#### Listing Available Prompts

To see all available prompts from both libraries:

```bash
# Using npm
npm start -- -L

# Using Docker
docker run -i --rm -v $(pwd)/.key:/app/.key:ro varlabz/qterm -L
```

This will display a list of all prompts available in the `fabric/`, `awesome/`, and `user/` directories.

#### Viewing a Specific Prompt

To view the content of a specific prompt:

```bash
# Using npm
npm start -- -P "prompt-name"

# Using Docker
docker run -i --rm -v $(pwd)/.key:/app/.key:ro varlabz/qterm -P "prompt-name"
```

Replace `prompt-name` with the name of the prompt you want to view. You can use the name with or without the file extension.

#### Using a Prompt as a System Prompt

To use a prompt from the libraries as a system prompt:

```bash
# Using npm
npm start -- -s "fabric/prompt-name.md"

# Using Docker
docker run -it --rm -v $(pwd)/.key:/app/.key:ro varlabz/qterm -s "awesome/prompt-name.txt"
```

### Adding Custom Prompts

You can add your own custom prompts to the `user/` directory. Create Markdown files with your prompts, and they will be automatically included when listing available prompts.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

The MIT License is a permissive license that allows for reuse with few restrictions. It permits use, modification, distribution, private use, and commercial use while providing no warranty or liability.