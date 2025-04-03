# Schwrc CLI

A command-line tool for creating and managing shell aliases and lambda functions.

## Installation

```bash
# Install globally
yarn global add schwrc

# Or install from local directory
yarn global add file:.
```

## Usage

### Basic Commands

```bash
# Create an alias for the last command
schwrc -a [name]

# Delete an alias or function from .zshrc
schwrc -d [name]

# Generate a shell command for a lambda function
schwrc -l [func] [args...]
```

### Creating Aliases

The `-a` or `--alias` flag allows you to create an alias for the last command in your shell history:

```bash
# Create an alias interactively
schwrc -a

# Create an alias with a specific name
schwrc -a myalias
```

### Deleting Aliases and Functions

The `-d` or `--delete` flag lets you remove aliases or functions from your `.zshrc` file:

```bash
# Delete an entry interactively
schwrc -d

# Delete a specific entry
schwrc -d myalias
```

### Lambda Functions

The `-l` or `--lambda` flag generates a shell command from a JavaScript lambda function:

```bash
# Create a lambda function interactively
schwrc -l

# Create a lambda function with arguments
schwrc -l "(args) => args.join(' ')" hello world
```

The generated command will be displayed and you'll be prompted to create an alias for it.

#### Lambda Function Examples

1. Join arguments with spaces:
```bash
schwrc -l "(args) => args.join(' ')" hello world
# Output: hello world
```

2. Convert arguments to uppercase:
```bash
schwrc -l "(args) => args.map(arg => arg.toUpperCase()).join(' ')" hello world
# Output: HELLO WORLD
```

3. Count arguments:
```bash
schwrc -l "(args) => args.length" hello world
# Output: 2
```

4. Read a file (using fs module):
```bash
schwrc -l "async (args) => { const content = await fs.promises.readFile(args[0], 'utf-8'); return content; }" file.txt
```

### Suppressing Yarn Output

Use the `--no-yarn` flag to suppress yarn output:

```bash
schwrc --no-yarn -l "(args) => args.join(' ')" hello world
```

## How It Works

1. **Alias Creation**: The tool reads your shell history to get the last command and creates an alias in your `.zshrc` file.

2. **Lambda Functions**: The tool generates a Node.js command that executes your lambda function with the provided arguments. The generated command can be aliased for future use. The `fs` module is available globally in lambda functions.

3. **Interactive Mode**: When no arguments are provided for interactive options (like `-a` or `-l`), the tool will prompt you for input.

## Requirements

- Node.js 14 or higher
- Yarn or npm
- Zsh shell

## Development

```bash
# Install dependencies
yarn install

# Build the project
yarn build

# Run tests
yarn test
```

## License

MIT 