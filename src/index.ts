#!/usr/bin/env node

import { Command } from 'commander';
import { HistoryManager } from './history.js';
import { ZSHRC } from './zshrc.js';
import { promptForAlias, promptForFunction, promptForEntryToDelete } from './prompts.js';
import { generateShellCommand } from './function-executor.js';

interface Options {
  input?: string;
  alias?: string | boolean;
  delete?: string | boolean;
  lambda?: string | boolean;
  noYarn?: boolean;
}

const program = new Command();

program
  .name('schwrc')
  .description('A CLI tool for working with files')
  .version('1.0.0')
  .option('-a, --alias [name]', 'create an alias for the last command')
  .option('-d, --delete [name]', 'delete an alias or function from .zshrc')
  .option('-l, --lambda [func]', 'generate a shell command for a lambda function')
  .option('--no-yarn', 'suppress yarn output')
  .argument('[args...]', 'arguments to pass to the function')
  .action(async (args: string[], options: Options) => {
    if (options.alias !== undefined) {
      const lastCommand = HistoryManager.lastCommand;
      const alias = typeof options.alias === 'string' ? options.alias : await promptForAlias();
      if (!alias) {
        console.log('No alias provided. Exiting...');
        process.exit(0);
      }
      ZSHRC.updateZshrc(alias, lastCommand);
    } else if (options.delete !== undefined) {
      if (typeof options.delete === 'string') {
        // Delete specific entry
        ZSHRC.deleteFromZshrc(options.delete);
      } else {
        // Interactive deletion
        const entries = ZSHRC.listEntries();
        const nameToDelete = await promptForEntryToDelete(entries);
        if (nameToDelete) {
          ZSHRC.deleteFromZshrc(nameToDelete);
        }
      }
    } else if (options.lambda !== undefined) {
      let func: string;
      
      if (typeof options.lambda === 'string') {
        // Function was provided as an argument
        func = options.lambda;
      } else if (process.stdin.isTTY) {
        // Interactive mode
        func = await promptForFunction();
      } else {
        // Non-interactive mode but no function provided
        console.error('Error: Function argument required when piping output');
        process.exit(1);
      }

      if (!func) {
        console.log('No function provided. Exiting...');
        process.exit(0);
      }
      
      // Get all arguments after the -l flag
      const lambdaArgs = process.argv.slice(process.argv.indexOf('-l') + 1);
      const command = generateShellCommand(func, lambdaArgs);
      process.stdout.write(command + '\n');
      
      // Prompt for an alias
      const alias = await promptForAlias();
      if (alias) {
        ZSHRC.updateZshrc(alias, command);
      }
    }
  });

program.parse();