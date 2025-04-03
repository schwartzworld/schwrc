import { readFileSync, writeFileSync, existsSync } from 'fs';
import { homedir } from 'os';

export interface ZshrcEntry {
  type: 'alias' | 'function' | 'env';
  name: string;
  line: string;
}

export function listZshrcEntries(): ZshrcEntry[] {
  const zshrcPath = `${homedir()}/.zshrc`;
  if (!existsSync(zshrcPath)) {
    return [];
  }

  const content = readFileSync(zshrcPath, 'utf-8');
  const lines = content.split('\n');
  const entries: ZshrcEntry[] = [];

  lines.forEach(line => {
    line = line.trim();
    if (!line || line.startsWith('#')) return;

    // Match alias definitions
    const aliasMatch = line.match(/^alias\s+(\w+)=/);
    if (aliasMatch) {
      entries.push({
        type: 'alias',
        name: aliasMatch[1],
        line
      });
      return;
    }

    // Match function definitions (both styles)
    const functionMatch = line.match(/^(?:function\s+)?(\w+)\s*(?:\(\s*\))?\s*{/);
    if (functionMatch) {
      entries.push({
        type: 'function',
        name: functionMatch[1],
        line
      });
      return;
    }

    // Match environment variable exports
    const envMatch = line.match(/^export\s+(\w+)=/);
    if (envMatch) {
      entries.push({
        type: 'env',
        name: envMatch[1],
        line
      });
      return;
    }

    // Match environment variable assignments
    const envAssignMatch = line.match(/^(\w+)=/);
    if (envAssignMatch) {
      entries.push({
        type: 'env',
        name: envAssignMatch[1],
        line
      });
    }
  });

  return entries;
}

export function updateZshrc(alias: string, command: string): void {
  const zshrcPath = `${homedir()}/.zshrc`;
  
  // Escape any existing quotes in the command
  const escapedCommand = command.replace(/"/g, '\\"');
  const aliasLine = `alias ${alias}="${escapedCommand}"\n`;

  try {
    // Read existing .zshrc content
    let content = existsSync(zshrcPath) ? readFileSync(zshrcPath, 'utf-8') : '';
    
    // Add new alias if it doesn't exist
    if (!content.includes(`alias ${alias}=`)) {
      content += aliasLine;
      writeFileSync(zshrcPath, content);
      console.log(`Successfully added alias '${alias}' for command: ${command}`);
    } else {
      console.log(`Alias '${alias}' already exists in .zshrc`);
    }
  } catch (error) {
    console.error('Error updating .zshrc:', error);
    process.exit(1);
  }
}

export function deleteFromZshrc(name: string): void {
  const zshrcPath = `${homedir()}/.zshrc`;
  if (!existsSync(zshrcPath)) {
    console.log('No .zshrc file found');
    return;
  }

  const content = readFileSync(zshrcPath, 'utf-8');
  const lines = content.split('\n');
  const newLines: string[] = [];
  let found = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // Skip empty lines and comments
    if (!trimmedLine || trimmedLine.startsWith('#')) {
      newLines.push(line);
      continue;
    }

    // Check for alias definition
    if (trimmedLine.match(new RegExp(`^alias\\s+${name}=`))) {
      found = true;
      continue;
    }

    // Check for function definition (both styles)
    if (trimmedLine.match(new RegExp(`^(?:function\\s+)?${name}\\s*(?:\\\(\\s*\\\))?\\s*{`))) {
      found = true;
      // Skip the function body until we find the closing brace
      while (i < lines.length && !lines[i].trim().startsWith('}')) {
        i++;
      }
      continue;
    }

    // Check for environment variable exports and assignments
    if (trimmedLine.match(new RegExp(`^export\\s+${name}=`)) || 
        trimmedLine.match(new RegExp(`^${name}=`))) {
      found = true;
      continue;
    }

    newLines.push(line);
  }

  if (!found) {
    console.log(`No alias, function, or environment variable named '${name}' found in .zshrc`);
    return;
  }

  writeFileSync(zshrcPath, newLines.join('\n'));
  console.log(`Successfully deleted '${name}' from .zshrc`);
} 