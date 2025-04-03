import * as readline from 'node:readline/promises';
import { ZshrcEntry } from './zshrc.js';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

class PromptManager {
  async promptForAlias(): Promise<string> {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const answer = await rl.question('Enter an alias name: ');
    rl.close();
    return answer.trim();
  }

  async promptForFunction(): Promise<string> {
    // Create a temporary file
    const tempFile = path.join(os.tmpdir(), `function_${Date.now()}.js`);
    fs.writeFileSync(tempFile, '');  // Start with empty file

    // Get the default editor from environment or use nano as fallback
    const editor = process.env.EDITOR || 'nano';

    try {
      // Open the editor and wait for it to complete
      await new Promise<void>((resolve, reject) => {
        const child = spawn(editor, [tempFile], {
          stdio: 'inherit',
          shell: true
        });

        child.on('error', (error) => {
          reject(error);
        });

        child.on('exit', (code) => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`Editor exited with code ${code}`));
          }
        });
      });
      
      // Read the file content
      const content = fs.readFileSync(tempFile, 'utf8');
      
      // Clean up the temporary file
      fs.unlinkSync(tempFile);
      
      // Just trim the content, no need to filter comments anymore
      return content.trim();
    } catch (error) {
      // Clean up the temporary file in case of error
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
      throw error;
    }
  }

  async promptForEntryToDelete(entries: ZshrcEntry[]): Promise<string | null> {
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

    const answer = await rl.question('\nEnter the number of the entry to delete (or press Enter to cancel): ');
    rl.close();
    
    const num = parseInt(answer.trim());
    if (isNaN(num) || num < 1 || num > entries.length) {
      return null;
    }
    return entries[num - 1].name;
  }
}

export const promptManager = new PromptManager(); 