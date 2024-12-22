const fs = require('fs');
const path = require('path');

// Ensure environment variables are loaded
require('dotenv').config();

// Create the environments directory if it doesn't exist
const envDir = path.join(__dirname, 'src', 'environments');
if (!fs.existsSync(envDir)) {
    fs.mkdirSync(envDir);
}

// Generate environment.prod.ts
const prodEnvironment = `export const environment = {
  production: true,
  SUPABASE_KEY: '${process.env.SUPABASE_KEY || ''}',
  SUPABASE_URL: '${process.env.SUPABASE_URL || ''}'
};`;

// Write the file
fs.writeFileSync(path.join(envDir, 'environment.prod.ts'), prodEnvironment);

console.log('Environment configuration generated');