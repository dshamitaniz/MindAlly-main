# MindAlly Demo Deployment Guide

Deploy only the demo version of MindAlly without MongoDB dependency.

## 🚀 Quick Deploy to Vercel

### Option 1: One-Click Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/mindally&env=GOOGLE_AI_API_KEY,NEXTAUTH_SECRET&envDescription=Required%20environment%20variables&envLink=https://github.com/yourusername/mindally/blob/main/DEMO_DEPLOYMENT.md)

### Option 2: Manual Deploy

1. **Fork/Clone Repository**
   ```bash
   git clone https://github.com/yourusername/mindally.git
   cd mindally
   ```

2. **Deploy to Vercel**
   ```bash
   npx vercel --prod
   ```

3. **Set Environment Variables in Vercel Dashboard:**
   ```env
   GOOGLE_AI_API_KEY=AIzaSyBKCqAE9Bbz8lgXrk9wm8hjHD8TU-h-1gA
   NEXTAUTH_SECRET=your-secure-random-string
   NEXTAUTH_URL=https://your-demo-domain.vercel.app
   DEMO_ONLY_MODE=true
   CRISIS_DETECTION_ENABLED=true
   ```

## 🎯 Demo Features

### ✅ What's Included:
- **AI Mental Health Assistant** with Google AI
- **Crisis Detection & Support** with Indian helplines
- **Multilingual Voice Support** (100+ languages)
- **Mood Tracking** with temporary storage
- **Journal Entries** with guided templates
- **Goal Management** system
- **Meditation Tools** and breathing exercises
- **Therapist Directory** (static data)

### ❌ What's Excluded:
- **MongoDB Database** - Uses temporary JSON storage
- **User Registration** - Demo account only
- **Data Persistence** - All data cleared on session end
- **Email Features** - Not needed for demo

## 🔧 Configuration

### Required Environment Variables:
```env
# Google AI API Key (Required)
GOOGLE_AI_API_KEY=your-google-ai-api-key

# NextAuth Configuration (Required)
NEXTAUTH_SECRET=your-secure-random-string
NEXTAUTH_URL=https://your-demo-domain.vercel.app

# Demo Mode Flag (Required)
DEMO_ONLY_MODE=true

# Crisis Detection (Optional)
CRISIS_DETECTION_ENABLED=true
```

### Demo Credentials:
- **Email**: `demo@mindally.com`
- **Password**: `demo123`

## 🌐 Demo URL Structure

### Main Demo Page:
- **URL**: `https://your-domain.vercel.app/demo`
- **Features**: Full MindAlly experience with temporary storage

### Direct Access:
- All routes redirect to `/demo` for demo-only deployment
- No registration or login required beyond demo credentials

## 📱 Mobile Responsive

The demo is fully responsive and works on:
- **Desktop** browsers
- **Mobile** devices (iOS/Android)
- **Tablet** devices
- **Progressive Web App** capabilities

## 🔒 Security & Privacy

### Demo Data Handling:
- **Temporary Storage**: All data stored in JSON files
- **Session-Based**: Data cleared when user leaves
- **No Database**: No persistent storage required
- **Privacy-First**: No user data collection

### Crisis Support:
- **Real-time Detection**: AI monitors for crisis language
- **Indian Helplines**: KIRAN, AASRA, Vandrevala Foundation
- **Immediate Response**: Crisis resources displayed instantly

## 🚀 Performance

### Optimizations:
- **Static Generation**: Fast loading times
- **Edge Functions**: Global distribution
- **Minimal Dependencies**: No database overhead
- **Efficient Caching**: Optimized for demo usage

### Expected Performance:
- **First Load**: < 2 seconds
- **Page Transitions**: < 500ms
- **AI Response**: 2-5 seconds (Google AI)
- **Voice Synthesis**: Instant (browser-based)

## 🛠️ Customization

### Branding:
- Update `app/demo/page.tsx` for custom branding
- Modify `components/DemoLogin.tsx` for custom login screen
- Change colors in `tailwind.config.js`

### Features:
- Enable/disable features in demo mode
- Customize crisis detection keywords
- Add custom mental health resources

## 📊 Analytics (Optional)

Add analytics to track demo usage:

```env
# Google Analytics (Optional)
NEXT_PUBLIC_GA_ID=your-ga-id

# Vercel Analytics (Optional)
VERCEL_ANALYTICS=true
```

## 🆘 Troubleshooting

### Common Issues:

**Build Fails:**
- Check Node.js version (18+)
- Verify environment variables are set
- Ensure Google AI API key is valid

**AI Chat Not Working:**
- Verify `GOOGLE_AI_API_KEY` is correct
- Check API quotas in Google Cloud Console
- Test API key with curl command

**Demo Login Issues:**
- Ensure demo credentials are correct
- Check browser console for errors
- Verify `/api/auth/demo` endpoint is working

### Support:
- Check [GitHub Issues](https://github.com/yourusername/mindally/issues)
- Review [AI Troubleshooting Guide](./AI_TROUBLESHOOTING.md)
- Contact support with deployment URL and error details

## 🎉 Success!

Your MindAlly demo should now be live at:
`https://your-domain.vercel.app/demo`

**Demo Credentials:**
- Email: `demo@mindally.com`
- Password: `demo123`

---

**Built with ❤️ for mental health awareness and accessibility**