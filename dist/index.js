#!/usr/bin/env node
import { Command } from 'commander';
import { getLastCommand } from './history.js';
import { updateZshrc, listZshrcEntries, deleteFromZshrc } from './zshrc.js';
import { promptForAlias, promptForFunction, promptForEntryToDelete } from './prompts.js';
import { generateShellCommand } from './function-executor.js';
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
    .action(async (args, options) => {
    if (options.alias !== undefined) {
        const lastCommand = getLastCommand();
        const alias = typeof options.alias === 'string' ? options.alias : await promptForAlias();
        if (!alias) {
            console.log('No alias provided. Exiting...');
            process.exit(0);
        }
        updateZshrc(alias, lastCommand);
    }
    else if (options.delete !== undefined) {
        if (typeof options.delete === 'string') {
            // Delete specific entry
            deleteFromZshrc(options.delete);
        }
        else {
            // Interactive deletion
            const entries = listZshrcEntries();
            const nameToDelete = await promptForEntryToDelete(entries);
            if (nameToDelete) {
                deleteFromZshrc(nameToDelete);
            }
        }
    }
    else if (options.lambda !== undefined) {
        let func;
        if (typeof options.lambda === 'string') {
            // Function was provided as an argument
            func = options.lambda;
        }
        else if (process.stdin.isTTY) {
            // Interactive mode
            func = await promptForFunction();
        }
        else {
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
            updateZshrc(alias, command);
        }
    }
});
program.parse();
