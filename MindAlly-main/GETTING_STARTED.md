# Getting Started with Mind

Welcome to Mind - your mental health companion app! This guide will help you get up and running in just a few minutes.

## 🚀 Quick Start (5 minutes)

### 1. Clone and Install
```bash
git clone https://github.com/yourusername/mental-health-app.git
cd mental-health-app
npm install
```

### 2. Set Up Environment
```bash
npm run setup
```
This automatically creates your `.env.local` file with secure defaults.

### 3. Choose Your Database

#### Option A: MongoDB Atlas (Recommended - Free)
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster (free tier)
4. Create a database user
5. Get your connection string
6. Update `.env.local`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mental-health-app
   ```

#### Option B: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Keep the default in `.env.local` (already set)

### 4. Start the App
```bash
npm run dev
```

### 5. Open Your Browser
Navigate to [http://localhost:3000](http://localhost:3000)

### 6. Try the Demo
- **Email**: `demo@mindapp.in`
- **Password**: `demo123`

### 7. Set Up Demo Data (Optional)
```bash
npm run setup-demo
```

## 🎯 What You Get

### Core Features
- **Mood Tracking**: Track daily mood with activities and notes
- **Journaling**: Rich text journaling with guided templates
- **Meditation**: Breathing exercises, sleep tools, and focus tools
- **Goal Management**: Set and track personal goals
- **AI Chatbot**: Intelligent companion with crisis detection
- **Therapist Directory**: Find mental health professionals

### Voice Features
- **Multilingual Support**: Hindi, Telugu, Tamil, English, and 100+ languages
- **Auto-Detection**: Automatically detects language from text
- **Voice Customization**: Adjust speech rate, pitch, and volume
- **Free & Local**: No API costs, works offline

## 🔧 Configuration

### Required Environment Variables
```env
MONGODB_URI=mongodb://localhost:27017/mental-health-app
NEXTAUTH_SECRET=auto-generated-secure-key
NEXTAUTH_URL=http://localhost:3000
```

### Optional Environment Variables
```env
# AI Features (for enhanced responses)
OPENAI_API_KEY=your-openai-api-key-here
GOOGLE_AI_API_KEY=your-google-ai-api-key-here

# Crisis Detection (enabled by default)
CRISIS_DETECTION_ENABLED=true
CRISIS_LOG_RETENTION_DAYS=30

# Therapist Features
THERAPIST_VERIFICATION_ENABLED=true
```

## 🛠️ Troubleshooting

### Common Issues

**Port 3000 already in use?**
```bash
npx kill-port 3000
```

**MongoDB connection issues?**
- Check your connection string in `.env.local`
- Ensure MongoDB is running (if using local)
- Verify network access (if using Atlas)

**Dependencies issues?**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Build issues?**
```bash
rm -rf .next
npm run dev
```

### Getting Help
1. Check the [Issues](https://github.com/yourusername/mental-health-app/issues) page
2. Create a new issue with:
   - Your operating system
   - Node.js version
   - Error messages
   - Steps to reproduce

## 🚀 Deployment

### Vercel (Recommended)
1. Go to [Vercel](https://vercel.com)
2. Import your GitHub repository
3. Set environment variables
4. Deploy!

### Other Platforms
- **Netlify**: Static export with API routes
- **Railway**: Full-stack deployment with database
- **DigitalOcean**: VPS deployment with Docker

## 📚 Next Steps

1. **Explore the Features**: Try mood tracking, journaling, and meditation
2. **Customize Settings**: Adjust voice settings and preferences
3. **Add AI Keys**: Get enhanced AI responses with API keys
4. **Deploy**: Share your app with others
5. **Contribute**: Help improve the app for everyone

## 🆘 Crisis Resources

If you or someone you know is in crisis:
- **India**: KIRAN (1800-599-0019), AASRA (91-22-27546669)
- **US**: Suicide & Crisis Lifeline (988)
- **UK**: Samaritans (116 123)
- **Emergency**: 112 (India), 911 (US), 999 (UK)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

---

**Built with ❤️ for mental health awareness and support**

Making mental health accessible to everyone, everywhere, in every language.
