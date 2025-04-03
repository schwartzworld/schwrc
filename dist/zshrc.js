import { readFileSync, writeFileSync, existsSync } from 'fs';
import { homedir } from 'os';
class ZSHRCManager {
    zshrcPath = `${homedir()}/.zshrc`;
    get rawZshrc() {
        if (!existsSync(this.zshrcPath)) {
            return '';
        }
        return readFileSync(this.zshrcPath, 'utf-8');
    }
    get zshrc() {
        return this.rawZshrc.split('\n').map(line => line.trim()).filter(line => !line.startsWith('#'));
    }
    static getFunctions(lines) {
        const functions = [];
        lines.forEach(line => {
            const functionMatch = line.match(/^(?:function\s+)?(\w+)\s*(?:\(\s*\))?\s*{/);
            if (functionMatch) {
                functions.push({
                    type: 'function',
                    name: functionMatch[1],
                    line
                });
            }
        });
        return functions;
    }
    static getAliases(lines) {
        const aliases = [];
        lines.forEach(line => {
            const aliasMatch = line.match(/^alias\s+(\w+)=/);
            if (aliasMatch) {
                aliases.push({
                    type: 'alias',
                    name: aliasMatch[1],
                    line
                });
            }
        });
        return aliases;
    }
    static getEnvVars(lines) {
        const envVars = [];
        lines.forEach(line => {
            const envAssignMatch = line.match(/^(\w+)=/);
            if (envAssignMatch) {
                envVars.push({
                    type: 'env',
                    name: envAssignMatch[1],
                    line
                });
            }
        });
        return envVars;
    }
    static getEnvAssignments(lines) {
        const envAssignments = [];
        lines.forEach(line => {
            const envAssignMatch = line.match(/^(\w+)=/);
            if (envAssignMatch) {
                envAssignments.push({
                    type: 'env',
                    name: envAssignMatch[1],
                    line
                });
            }
        });
        return envAssignments;
    }
    listEntries() {
        const lines = this.zshrc;
        return [
            ...ZSHRCManager.getFunctions(lines),
            ...ZSHRCManager.getAliases(lines),
            ...ZSHRCManager.getEnvVars(lines),
            ...ZSHRCManager.getEnvAssignments(lines)
        ];
    }
    updateZshrc(alias, command) {
        // Escape any existing quotes in the command
        const escapedCommand = command.replace(/"/g, '\\"');
        const aliasLine = `alias ${alias}="${escapedCommand}"\n`;
        try {
            // Read existing .zshrc content
            let content = this.rawZshrc;
            // Add new alias if it doesn't exist
            if (!content.includes(`alias ${alias}=`)) {
                content += aliasLine;
                writeFileSync(this.zshrcPath, content);
                console.log(`Successfully added alias '${alias}' for command: ${command}`);
            }
            else {
                console.log(`Alias '${alias}' already exists in .zshrc`);
            }
        }
        catch (error) {
            console.error('Error updating .zshrc:', error);
            process.exit(1);
        }
    }
    deleteFromZshrc(name) {
        const content = this.rawZshrc;
        const lines = content.split('\n');
        let isInFunction = false;
        let isInQuotes = false;
        let found = false;
        const newLines = lines.filter((line, i) => {
            const trimmedLine = line.trim();
            // Skip empty lines and comments
            if (!trimmedLine || trimmedLine.startsWith('#')) {
                return true;
            }
            // Handle function body
            if (isInFunction) {
                if (trimmedLine.startsWith('}')) {
                    isInFunction = false;
                }
                return false;
            }
            // Handle multi-line quotes
            if (isInQuotes) {
                // Count quotes in this line (not escaped)
                const quoteCount = (trimmedLine.match(/(?<!\\)"/g) || []).length;
                if (quoteCount % 2 === 1) {
                    isInQuotes = false;
                }
                return false;
            }
            // Check for alias definition
            if (trimmedLine.match(new RegExp(`^alias\\s+${name}=`))) {
                found = true;
                // Count quotes in this line (not escaped)
                const quoteCount = (trimmedLine.match(/(?<!\\)"/g) || []).length;
                if (quoteCount % 2 === 1) {
                    isInQuotes = true;
                }
                return false;
            }
            // Check for function definition (both styles)
            if (trimmedLine.match(new RegExp(`^(?:function\\s+)?${name}\\s*(?:\\\(\\s*\\\))?\\s*{`))) {
                found = true;
                isInFunction = true;
                return false;
            }
            // Check for environment variable exports and assignments
            if (trimmedLine.match(new RegExp(`^export\\s+${name}=`)) ||
                trimmedLine.match(new RegExp(`^${name}=`))) {
                found = true;
                return false;
            }
            return true;
        });
        if (!found) {
            console.log(`No alias, function, or environment variable named '${name}' found in .zshrc`);
            return;
        }
        writeFileSync(this.zshrcPath, newLines.join('\n'));
        console.log(`Successfully deleted '${name}' from .zshrc`);
    }
}
export const ZSHRC = new ZSHRCManager();
