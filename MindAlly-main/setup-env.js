const fs = require('fs');
const path = require('path');

// Generate a secure random secret
const generateSecret = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const envContent = `# Database
MONGODB_URI=mongodb://localhost:27017/mental-health-app

# NextAuth
NEXTAUTH_SECRET=${generateSecret()}
NEXTAUTH_URL=http://localhost:3000

# AI Services (Optional - for enhanced AI features)
OPENAI_API_KEY=your-openai-api-key-here
GOOGLE_AI_API_KEY=your-google-ai-api-key-here

# Crisis Detection (Optional - enabled by default)
CRISIS_DETECTION_ENABLED=true
CRISIS_LOG_RETENTION_DAYS=30

# Therapist Directory (Optional)
THERAPIST_VERIFICATION_ENABLED=true
`;

const envPath = path.join(__dirname, '.env.local');

console.log('🚀 Setting up Mind - Mental Health Companion App...\n');

if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env.local file with default configuration');
  console.log('🔑 Generated secure NEXTAUTH_SECRET automatically');
  console.log('📝 MongoDB URI set to localhost (update if using Atlas)');
} else {
  console.log('ℹ️  .env.local already exists, skipping creation');
}

console.log('\n🎯 Setup Complete! Here\'s what to do next:');
console.log('\n1. 📊 Set up your database:');
console.log('   • Option A: MongoDB Atlas (Free) - https://www.mongodb.com/atlas');
console.log('   • Option B: Local MongoDB - https://www.mongodb.com/try/download/community');
console.log('   • Update MONGODB_URI in .env.local if needed');

console.log('\n2. 🚀 Start the application:');
console.log('   npm run dev');

console.log('\n3. 🌐 Open your browser:');
console.log('   http://localhost:3000');

console.log('\n4. 🎭 Try the demo account:');
console.log('   Email: demo@mindapp.in');
console.log('   Password: demo123');

console.log('\n5. 📊 Set up demo data (optional):');
console.log('   npm run setup-demo');

console.log('\n✨ Features ready to use:');
console.log('   • Mood tracking and journaling');
console.log('   • Meditation and wellness tools');
console.log('   • AI chatbot with crisis detection');
console.log('   • Multilingual voice support');
console.log('   • Therapist directory');

console.log('\n🆘 Need help? Check the README.md or open an issue on GitHub');
console.log('\nBuilt with ❤️ for mental health awareness and support');
