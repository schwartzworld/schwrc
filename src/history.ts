import { readFileSync, existsSync } from 'fs';
import { homedir } from 'os';

export function getLastCommand(): string {
  try {
    // Use the default zsh history file location
    const histfile = `${homedir()}/.zsh_history`;
    
    if (!existsSync(histfile)) {
      throw new Error(`History file not found at ${histfile}`);
    }

    // Read the last line from the history file
    const history = readFileSync(histfile, 'utf-8').split('\n').filter(line => line.trim());
    if (history.length === 0) {
      throw new Error('No commands found in history');
    }

    // Get the last command (excluding the current command)
    const lastCommand = history[history.length - 2]?.trim();
    if (!lastCommand) {
      throw new Error('No previous command found in history');
    }

    // Remove the timestamp and command number from the history line
    // History format is typically: : 1234567890:0;command
    const commandMatch = lastCommand.match(/;[^;]+$/);
    if (!commandMatch) {
      throw new Error('Could not parse command from history');
    }
    
    const cleanCommand = commandMatch[0].substring(1); // Remove the semicolon
    console.log('Last command:', cleanCommand);
    return cleanCommand;
  } catch (error) {
    console.error('Error getting command history:', error);
    process.exit(1);
    return ''; // This line will never be reached due to process.exit(1)
  }
} 