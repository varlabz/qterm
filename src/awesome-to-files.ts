import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Reads a CSV file and creates files in the specified output directory
 * - Uses the 1st column as the filename
 * - Puts the 2nd column content into the file
 *
 * @param inputCsvPath Path to the input CSV file
 * @param outputDirPath Path to the output directory
 */
async function processPromptsCsv(inputCsvPath: string, outputDir: string): Promise<void> {
  try {
    const csvContent = await fs.readFile(inputCsvPath, 'utf-8');
    const lines = csvContent.split('\n');
    const dataLines = lines.slice(1);
    try {
      await fs.access(outputDir);
    } catch (error) {
      await fs.mkdir(outputDir, { recursive: true });
      console.log(`Created directory: ${outputDir}`);
    }
    
    for (const line of dataLines) {
      if (!line.trim()) continue; // Skip empty lines
      const fields = parseCSVLine(line);
      if (fields.length >= 2) {
        const [act, prompt] = fields;
        const safeFilename = act.replace(/[^a-zA-Z0-9]/g, '_').replace(/__+/g, '_').toLowerCase();
        const filename = `${safeFilename}.txt`;
        // Clean the prompt content (remove line numbers if present)
        // This regex matches line numbers at the beginning of the string
        // Format: "123 | " (number followed by space, pipe, space)
        const cleanedPrompt = prompt.replace(/^\s*\d+\s*\|\s*/, '');
        const filePath = path.join(outputDir, filename);
        await fs.writeFile(filePath, cleanedPrompt);
        console.log(`Created file: ${filename}`);
      }
    }
    
    console.log('Processing completed successfully');
  } catch (error) {
    console.error('Error processing CSV:', error);
  }
}

/**
 * Parse a CSV line handling quoted fields
 * @param line The CSV line to parse
 * @returns Array of fields
 */
function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let currentField = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        // Handle escaped quotes (two double quotes in a row)
        currentField += '"';
        i++; // Skip the next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      fields.push(currentField);
      currentField = '';
    } else {
      // Add character to current field
      currentField += char;
    }
  }
  
  // Add the last field
  fields.push(currentField);
  
  // Clean up each field - remove line numbers and extra whitespace
  return fields.map(field => {
    // Remove line numbers (e.g., "1 | Some text")
    return field.replace(/^\s*\d+\s*\|\s*/, '').trim();
  });
}

export function extractVariables(text: string) {
  const regex = /\${([^}]+)}/g;
  const variables = [];
  let match;

  while ((match = regex.exec(text)) !== null) {
    const [variable, defaultValue] = match[1].split(":").map((s) => s.trim());
    variables.push({ name: variable, default: defaultValue || "" });
  }

  return [...new Set(variables.map((v) => JSON.stringify(v)))].map((v) =>
    JSON.parse(v)
  ); // Remove duplicates
}

function updatePromptPreview(promptText: string) {
  const variables = extractVariables(promptText);
  if (variables.length === 0) {
    return promptText; // Return original text if no variables found
  }
  let previewText = promptText;
  variables.forEach(variable => {
    const pattern = new RegExp(`\\$\{${variable.name}[^}]*\}`, 'g');
    const replacement = variable.default || `<b>${variable.name}</b>`;
    previewText = previewText.replace(pattern, replacement);
  });
  return previewText;
}

/**
 * Parse command line arguments
 * @returns Object containing input and output paths
 */
function parseArgs(): { inputPath: string; outputPath: string } {
  // Default values
  let inputPath = 'prompts.csv';
  let outputPath = 'prompts';
  
  // Parse command line arguments
  const args = process.argv.slice(2);
  if (args.length >= 1) {
    inputPath = args[0];
  }
  if (args.length >= 2) {
    outputPath = args[1];
  }
  
  return { inputPath, outputPath };
}

// Parse command line arguments
const { inputPath, outputPath } = parseArgs();

// Run the function
processPromptsCsv(inputPath, outputPath)
  .then(() => console.log('Done'))
  .catch(err => console.error('Fatal error:', err));