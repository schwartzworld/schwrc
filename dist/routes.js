import { HistoryManager } from './history.js';
import { ZSHRC } from './zshrc.js';
import { promptManager } from './prompts.js';
import { functionExecutor } from './function-executor.js';
export const aliasPath = async (options) => {
    const lastCommand = HistoryManager.lastCommand;
    const alias = typeof options.alias === 'string' ? options.alias : await promptManager.promptForAlias();
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
        const nameToDelete = await promptManager.promptForEntryToDelete(entries);
        if (nameToDelete) {
            ZSHRC.deleteFromZshrc(nameToDelete);
        }
    }
};
export const lambdaPath = async (options) => {
    let func;
    const lambdaArgs = options.input ? options.input.split(' ') : [];
    if (typeof options.lambda === 'string') {
        // Non-interactive mode with function provided
        func = options.lambda;
    }
    else if (process.stdin.isTTY) {
        // Interactive mode
        func = await promptManager.promptForFunction();
    }
    else {
        // Non-interactive mode but no function provided
        console.error('Error: No function provided in non-interactive mode');
        process.exit(1);
        return; // TypeScript needs this
    }
    try {
        // First validate the function by generating the command
        const command = functionExecutor.generateShellCommand(func, lambdaArgs);
        // If we get here, the function is valid
        // Now prompt for alias before showing the command
        const alias = await promptManager.promptForAlias();
        if (alias) {
            ZSHRC.updateZshrc(alias, command);
        }
        console.log('Function validated and alias created successfully!');
    }
    catch (error) {
        console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
    }
};
