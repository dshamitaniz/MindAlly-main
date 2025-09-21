#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Mind - Mental Health Companion App');
console.log('=====================================\n');

// Check if Node.js version is compatible
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion < 18) {
  console.error('❌ Node.js 18+ is required. Current version:', nodeVersion);
  console.error('Please update Node.js: https://nodejs.org/');
  process.exit(1);
}

console.log('✅ Node.js version:', nodeVersion);

// Check if package.json exists
if (!fs.existsSync('package.json')) {
  console.error('❌ package.json not found. Please run this script from the project root.');
  process.exit(1);
}

console.log('✅ Project structure found');

// Install dependencies
console.log('\n📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// Run environment setup
console.log('\n🔧 Setting up environment...');
try {
  execSync('node setup-env.js', { stdio: 'inherit' });
  console.log('✅ Environment configured');
} catch (error) {
  console.error('❌ Failed to setup environment:', error.message);
  process.exit(1);
}

// Check if .env.local was created
if (!fs.existsSync('.env.local')) {
  console.error('❌ .env.local file not created. Please run: node setup-env.js');
  process.exit(1);
}

console.log('\n🎉 Installation Complete!');
console.log('\n📋 Next steps:');
console.log('1. Set up your database (MongoDB Atlas or local)');
console.log('2. Update MONGODB_URI in .env.local if needed');
console.log('3. Run: npm run dev');
console.log('4. Open: http://localhost:3000');
console.log('5. Try demo account: demo@mindapp.in / demo123');

console.log('\n🆘 Need help? Check README.md or GETTING_STARTED.md');
console.log('\nBuilt with ❤️ for mental health awareness and support');
