import { readFileSync } from 'fs';
import { Script } from 'vm';

export function executeFunction(funcStr: string, args: string[]): void {
  try {
    // Create a new Function from the string
    const func = new Function('args', `return (${funcStr})(args)`);
    
    // Execute the function with the arguments
    const result = func(args);
    
    // If the result is not undefined, log it
    if (result !== undefined) {
      console.log(result);
    }
    
    // Exit the process
    process.exit(0);
  } catch (error) {
    console.error('Error executing function:', error);
    process.exit(1);
  }
}

export function generateShellCommand(func: string, args: string[] = []): string {
  try {
    // Validate the function syntax by creating a new Script
    new Script(`(${func})([])`);
    
    // If we get here, the syntax is valid
    const script = `const fs = require('fs');
global.fs = fs;
(async () => {
  try {
    const result = await (${func})(process.argv.slice(2));
    console.log(result);
  } catch (error) {
    console.error('Error executing function:', error);
    process.exit(1);
  }
})();`;
    
    // Escape single quotes in the script for shell
    const escapedScript = script.replace(/'/g, "'\\''");
    
    // Return the complete command with node -e
    return `node -e '${escapedScript}' ${args.map(arg => `"${arg.replace(/"/g, '\\"')}"`).join(' ')}`;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Invalid JavaScript syntax:', error.message);
    } else {
      console.error('Invalid JavaScript syntax: Unknown error');
    }
    process.exit(1);
  }
} 