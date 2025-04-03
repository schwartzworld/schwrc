#!/usr/bin/env node
import { Command } from 'commander';
import { aliasPath, deletePath, lambdaPath } from './routes.js';
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
        return aliasPath(options);
    }
    else if (options.delete !== undefined) {
        return deletePath(options);
    }
    else if (options.lambda !== undefined) {
        return lambdaPath(options);
    }
});
program.parse();
