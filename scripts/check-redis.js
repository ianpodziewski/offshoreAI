/**
 * Redis Configuration Check Script
 * 
 * This script helps diagnose and fix Redis configuration issues.
 * Run it with: node scripts/check-redis.js
 */

// Read environment variables from .env files
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.development.local' });

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Define Redis localhost URL for development
const REDIS_LOCAL_URL = 'redis://localhost:6379';

// Check if Redis is configured in environment variables
const isRedisConfigured = !!process.env.REDIS_URL;
console.log(`\n📋 Redis Configuration Check`);
console.log(`--------------------------`);
console.log(`REDIS_URL configured: ${isRedisConfigured ? 'Yes ✅' : 'No ❌'}`);

if (isRedisConfigured) {
  // If Redis is configured, display some info about the URL (safe for logging)
  const redisUrl = process.env.REDIS_URL;
  console.log(`REDIS_URL preview: ${redisUrl.substring(0, 15)}...`);
  
  // Try to check if it's a localhost configuration
  const isLocalhost = redisUrl.includes('localhost') || redisUrl.includes('127.0.0.1');
  console.log(`Using localhost Redis: ${isLocalhost ? 'Yes' : 'No'}`);
} else {
  console.log(`\n❌ No Redis configuration found in environment variables.`);
}

// Check for the existence of required API files
const apiFiles = [
  'app/api/loan-documents/index-docs/route.ts',
  'app/api/redis-status/route.ts'
];

console.log(`\n📋 API Routes Check`);
console.log(`------------------`);

apiFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  const exists = fs.existsSync(filePath);
  console.log(`${file}: ${exists ? 'Exists ✅' : 'Missing ❌'}`);
});

// Instructions for fixing the Redis configuration
console.log(`\n📋 Redis Setup Instructions`);
console.log(`------------------------`);
console.log(`To fix Redis configuration issues:`);
console.log(`1. Make sure Redis is installed on your machine or you have access to a Redis server`);
console.log(`2. Create or edit an .env.local file in the project root`);
console.log(`3. Add the following line to .env.local: REDIS_URL=redis://localhost:6379`);
console.log(`4. Restart your development server`);

// Offer to create/update environment file
console.log(`\n📋 Automatic Fix`);
console.log(`--------------`);

const envLocalPath = path.join(process.cwd(), '.env.local');
const envLocalExists = fs.existsSync(envLocalPath);

if (!isRedisConfigured) {
  const addRedisConfig = async () => {
    try {
      if (envLocalExists) {
        // Read existing .env.local content
        const content = fs.readFileSync(envLocalPath, 'utf8');
        
        // Check if REDIS_URL already exists but might be commented out
        if (content.includes('REDIS_URL=') && !content.includes('\nREDIS_URL=')) {
          // Replace the line
          const updatedContent = content.replace(/.*REDIS_URL=.*/, `REDIS_URL=${REDIS_LOCAL_URL}`);
          fs.writeFileSync(envLocalPath, updatedContent, 'utf8');
        } else {
          // Append to the file
          fs.appendFileSync(envLocalPath, `\nREDIS_URL=${REDIS_LOCAL_URL}\n`, 'utf8');
        }
      } else {
        // Create new .env.local file
        fs.writeFileSync(envLocalPath, `REDIS_URL=${REDIS_LOCAL_URL}\n`, 'utf8');
      }
      
      console.log(`✅ Updated .env.local with Redis configuration.`);
      console.log(`✅ REDIS_URL has been set to: ${REDIS_LOCAL_URL}`);
      console.log(`Please restart your development server for changes to take effect.`);
    } catch (error) {
      console.error(`❌ Error updating .env.local:`, error);
    }
  };
  
  // Ask user for confirmation (simulation - actual interaction would be in a real terminal)
  console.log(`Would you like to automatically add Redis configuration to .env.local?`);
  console.log(`1. Yes - Add Redis configuration using localhost (redis://localhost:6379)`);
  console.log(`2. No - I'll manually configure it later`);
  console.log(`\nTo automatically add the Redis configuration, run:`);
  console.log(`node scripts/check-redis.js --fix`);
  
  // Check if --fix flag was provided
  if (process.argv.includes('--fix')) {
    addRedisConfig();
  }
} else {
  console.log(`✅ Redis is already configured in your environment.`);
}

// Final instructions
console.log(`\n📋 Next Steps`);
console.log(`-----------`);
console.log(`1. Make sure Redis server is running on your machine`);
console.log(`2. Restart your Next.js development server`);
console.log(`3. Test the Redis connection by visiting: http://localhost:3000/api/redis-status`);
console.log(`4. Try generating documents from the loan page again`);
console.log(`\nFor more detailed Redis debugging, check the /api/redis-status endpoint response.`);
console.log(``); 