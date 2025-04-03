import * as readline from 'readline';
import { ZshrcEntry } from './zshrc.js';

export async function promptForAlias(): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question('Enter an alias name: ', (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

export async function promptForFunction(): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question('Enter a JavaScript lambda function: ', (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

export async function promptForEntryToDelete(entries: ZshrcEntry[]): Promise<string | null> {
  if (entries.length === 0) {
    console.log('No aliases, functions, or environment variables found in .zshrc');
    return null;
  }

  console.log('\nAvailable entries to delete:');
  entries.forEach((entry, index) => {
    const typeLabel = entry.type === 'env' ? 'env var' : entry.type;
    console.log(`${index + 1}. ${typeLabel}: ${entry.name}`);
  });

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise<string | null>((resolve) => {
    rl.question('\nEnter the number of the entry to delete (or press Enter to cancel): ', (answer) => {
      rl.close();
      const num = parseInt(answer.trim());
      if (isNaN(num) || num < 1 || num > entries.length) {
        resolve(null);
        return;
      }
      resolve(entries[num - 1].name);
    });
  });
} 