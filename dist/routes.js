import { HistoryManager } from './history.js';
import { ZSHRC } from './zshrc.js';
import { promptForAlias, promptForFunction, promptForEntryToDelete } from './prompts.js';
import { generateShellCommand } from './function-executor.js';
export const aliasPath = async (options) => {
    const lastCommand = HistoryManager.lastCommand;
    const alias = typeof options.alias === 'string' ? options.alias : await promptForAlias();
    if (!alias) {
        console.log('No alias provided. Exiting...');
        process.exit(0);
    }
    ZSHRC.updateZshrc(alias, lastCommand);
};
export const deletePath = async (options) => {
    if (typeof options.delete === 'string') {
        // Delete specific entry
        ZSHRC.deleteFromZshrc(options.delete);
    }
    else {
        // Interactive deletion
        const entries = ZSHRC.listEntries();
        const nameToDelete = await promptForEntryToDelete(entries);
        if (nameToDelete) {
            ZSHRC.deleteFromZshrc(nameToDelete);
        }
    }
};
export const lambdaPath = async (options) => {
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
    try {
        // First validate the function by generating the command
        const command = generateShellCommand(func, lambdaArgs);
        // If we get here, the function is valid
        // Now prompt for alias before showing the command
        const alias = await promptForAlias();
        if (alias) {
            ZSHRC.updateZshrc(alias, command);
        }
        // Finally show the command
        process.stdout.write(command + '\n');
    }
    catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};
