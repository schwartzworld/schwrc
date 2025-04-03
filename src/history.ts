import { readFileSync, existsSync } from 'fs';
import { homedir } from 'os';

class _HistoryManager {
  historyFile = `${homedir()}/.zsh_history`;

  get history(): string[] {
    if (!existsSync(this.historyFile)) {
      throw new Error(`History file not found at ${this.historyFile}`);
    }
    const data = readFileSync(this.historyFile, 'utf-8').split('\n').filter(line => line.trim());
    if (data.length === 0) {
      throw new Error('No commands found in history');
    }
    return data;
  }

  get lastCommand(): string {
    try {
      const h = this.history;
      // Get the last command (excluding the current command)
      const lastCommand = h[h.length - 2]?.trim();
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
}

export const HistoryManager = new _HistoryManager();