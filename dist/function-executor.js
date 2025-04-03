class FunctionExecutor {
    executeFunction(funcStr, args) {
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
        }
        catch (error) {
            console.error('Error executing function:', error);
            process.exit(1);
        }
    }
    generateShellCommand(func, args = []) {
        try {
            // Only validate basic syntax, not runtime dependencies
            new Function('args', `return (${func})(args)`);
            // If we get here, the syntax is valid
            const script = `(async () => {
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
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(`Invalid JavaScript syntax: ${error.message}`);
            }
            throw error;
        }
    }
}
export const functionExecutor = new FunctionExecutor();
