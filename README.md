# Mind - Mental Health Companion App

A comprehensive mental health web application built with Next.js, TypeScript, and MongoDB. Features mood tracking, journaling, meditation tools, AI-powered crisis detection, and multilingual voice support.

## 🌟 Features

### Core Features
- **Mood Tracking**: Track daily mood with activities, notes, and tags
- **Journaling**: Rich text journaling with guided templates
- **Meditation & Wellness**: Breathing exercises, sleep tools, focus tools, and daily quotes
- **Goal Management**: Set and track personal goals with progress monitoring
- **AI Chatbot**: Intelligent companion with crisis detection and conversation memory
- **Therapist Directory**: Find and connect with verified mental health professionals
- **Crisis Support**: Immediate crisis detection with helpline connections

### 🎤 Voice Features
- **Multilingual TTS**: Natural speech synthesis in 100+ languages
- **Auto-Language Detection**: Automatically detects Hindi, Telugu, Tamil, and other languages
- **Voice Customization**: Adjustable speech rate, pitch, volume, and voice selection
- **Free & Local**: No API costs, works completely offline

## 🚀 Quick Start (5 minutes)

### Prerequisites
- **Node.js 18+** - [Download here](https://nodejs.org/)
- **MongoDB** - [MongoDB Atlas (Free)](https://www.mongodb.com/atlas) or [Local MongoDB](https://www.mongodb.com/try/download/community)
- **Git** - [Download here](https://git-scm.com/)

### Step 1: Clone and Install
```bash
# Clone the repository
git clone https://github.com/yourusername/mental-health-app.git
cd mental-health-app

# Install dependencies
npm install
```

### Step 2: Environment Setup
```bash
# Run the setup script (creates .env.local automatically)
node setup-env.js

# Or manually copy the example file
cp env.example .env.local
```

### Step 3: Configure Database

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
3. Keep the default in `.env.local`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/mental-health-app
   ```

### Step 4: Start the Application
```bash
# Start the development server
npm run dev

# Open your browser to http://localhost:3000
```

### Step 5: Set Up Demo Data (Optional)
```bash
# Run the demo data setup script
npm run setup-demo
```

## 🎯 Demo Account
For quick testing, use the demo account:
- **Email**: `demo@mindapp.in`
- **Password**: `demo123`

## 📁 Project Structure

```
mental-health-app/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── mood/              # Mood tracking page
│   ├── meditation/        # Meditation tools page
│   ├── goals/             # Goal management page
│   ├── journal/           # Journaling page
│   ├── therapists/        # Therapist directory
│   └── ai-chat/           # AI chatbot page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── Dashboard.tsx     # Main dashboard
│   ├── LandingPage.tsx   # Landing page
│   └── AIChatbot.tsx     # AI chatbot component
├── lib/                  # Utility libraries
│   ├── models/           # MongoDB models
│   ├── mongodb.ts        # Database connection
│   └── utils.ts          # Utility functions
├── types/                # TypeScript type definitions
├── setup-env.js          # Environment setup script
└── scripts/              # Setup and utility scripts
```

## 🔧 Configuration

### Environment Variables
The app works with minimal configuration. Here's what you need:

```env
# Database (Required)
MONGODB_URI=mongodb://localhost:27017/mental-health-app

# Authentication (Required - auto-generated)
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# AI Features (Optional)
OPENAI_API_KEY=your-openai-api-key-here
GOOGLE_AI_API_KEY=your-google-ai-api-key-here

# Crisis Detection (Optional - enabled by default)
CRISIS_DETECTION_ENABLED=true
CRISIS_LOG_RETENTION_DAYS=30

# Therapist Features (Optional)
THERAPIST_VERIFICATION_ENABLED=true
```

### Database Models
- **User**: User profiles and preferences
- **MoodEntry**: Daily mood tracking data
- **JournalEntry**: Journal entries and templates
- **Goal**: Personal goals and progress
- **Assessment**: Mental health assessment results
- **Therapist**: Therapist directory entries
- **Conversation**: AI conversation history
- **MeditationSession**: Meditation practice sessions

## 🛡️ Safety & Privacy

### Crisis Support
- **India**: AASRA (91-22-27546669), Vandrevala Foundation (1860 266 2345)
- **US**: Suicide & Crisis Lifeline (988)
- **UK**: Samaritans (116 123)

### Privacy Features
- End-to-end encryption for sensitive data
- User consent for data collection
- Crisis detection with privacy protection
- Secure authentication with JWT tokens

## 🚀 Deployment

### Vercel (Recommended)
1. **Connect Repository**
   - Go to [Vercel](https://vercel.com)
   - Import your GitHub repository
   - Select the project folder

2. **Set Environment Variables**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mental-health-app
   NEXTAUTH_SECRET=your-production-secret-key-here
   NEXTAUTH_URL=https://your-domain.vercel.app
   OPENAI_API_KEY=your-openai-api-key
   GOOGLE_AI_API_KEY=your-google-ai-api-key
   ```

3. **Deploy**
   - Click "Deploy" and wait for build to complete
   - Your app will be live at `https://your-domain.vercel.app`

### Other Platforms
- **Netlify**: Static export with API routes
- **Railway**: Full-stack deployment with database
- **DigitalOcean**: VPS deployment with Docker

## 🔧 Troubleshooting

### Common Issues

**Port already in use?**
```bash
# Kill process on port 3000
npx kill-port 3000
# or
lsof -ti:3000 | xargs kill -9
```

**MongoDB connection issues?**
- Check your connection string in `.env.local`
- Ensure MongoDB is running (if using local)
- Verify network access (if using Atlas)

**Dependencies issues?**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Build issues?**
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

**TypeScript errors?**
```bash
# Check for type errors
npx tsc --noEmit
```

### Getting Help
1. Check the [Issues](https://github.com/yourusername/mental-health-app/issues) page
2. Create a new issue with:
   - Your operating system
   - Node.js version
   - Error messages
   - Steps to reproduce

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Add tests for new features
- Update documentation for API changes
- Ensure accessibility compliance
- Test multilingual features

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This application is not a replacement for professional mental health care. If you're experiencing a mental health crisis, please contact emergency services or a mental health professional immediately.

## 🆘 Crisis Resources

### India - Mental Health Helplines
- **KIRAN Mental Health Helpline**: 1800-599-0019 (24/7, All Languages)
- **AASRA (Mumbai)**: 91-22-27546669 / 91-22-27546667 (English, Hindi, Marathi)
- **Vandrevala Foundation**: 1860 266 2345 / 9999 666 555 (English, Hindi, Gujarati)
- **Snehi (Delhi)**: 91-9582208181 (English, Hindi)
- **iCall (TISS)**: +91 9152987821 (English, Hindi, Marathi, Gujarati)
- **Sneha (Chennai)**: 044-24640050 (English, Tamil, Telugu)
- **Roshni (Hyderabad)**: 040-66202000 (English, Telugu, Hindi)
- **Lifeline Foundation (Kolkata)**: 033-24637401 (English, Bengali, Hindi)
- **Pratheeksha (Kochi)**: 0484-2540530 (English, Malayalam, Hindi)

### Emergency Services
- **National Emergency**: 112 (All Languages)
- **Police**: 100
- **Ambulance**: 108
- **Women Helpline**: 181

### International
- **Emergency Services**: 112 (India), 911 (US), 999 (UK)
- **Crisis Text Line**: Text HOME to 741741 (US)
- **International Association for Suicide Prevention**: https://www.iasp.info/resources/Crisis_Centres/

## 📞 Support

For technical support or questions about the application, please open an issue on GitHub or contact the development team.

---

Built with ❤️ for mental health awareness and support. Making mental health accessible to everyone, everywhere, in every language.
