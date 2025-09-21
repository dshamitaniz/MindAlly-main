# Deployment Guide

This guide will help you deploy Mind to various platforms.

## 🚀 Vercel (Recommended)

### Step 1: Prepare Your Repository
1. Push your code to GitHub
2. Ensure all environment variables are documented in README.md

### Step 2: Deploy to Vercel
1. Go to [Vercel](https://vercel.com)
2. Sign in with your GitHub account
3. Click "New Project"
4. Import your repository
5. Configure environment variables (see below)
6. Click "Deploy"

### Step 3: Environment Variables
Set these in your Vercel dashboard:

```env
# Database (Required)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mental-health-app

# Authentication (Required)
NEXTAUTH_SECRET=your-production-secret-key-here
NEXTAUTH_URL=https://your-domain.vercel.app

# AI Features (Optional)
OPENAI_API_KEY=your-openai-api-key-here
GOOGLE_AI_API_KEY=your-google-ai-api-key-here

# Crisis Detection (Optional)
CRISIS_DETECTION_ENABLED=true
CRISIS_LOG_RETENTION_DAYS=30

# Therapist Features (Optional)
THERAPIST_VERIFICATION_ENABLED=true
```

### Step 4: Set Up Database
1. Create a MongoDB Atlas cluster
2. Create a database user
3. Get your connection string
4. Add it to your Vercel environment variables

## 🌐 Netlify

### Step 1: Build Configuration
Create `netlify.toml` in your project root:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

### Step 2: Deploy
1. Go to [Netlify](https://netlify.com)
2. Connect your GitHub repository
3. Set build command: `npm run build`
4. Set publish directory: `.next`
5. Add environment variables
6. Deploy

## 🚂 Railway

### Step 1: Deploy
1. Go to [Railway](https://railway.app)
2. Connect your GitHub repository
3. Add MongoDB service
4. Set environment variables
5. Deploy

### Step 2: Environment Variables
```env
MONGODB_URI=${{MONGODB_URI}}
NEXTAUTH_SECRET=your-production-secret
NEXTAUTH_URL=https://your-app.railway.app
```

## 🐳 Docker

### Step 1: Create Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### Step 2: Create docker-compose.yml
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/mental-health-app
      - NEXTAUTH_SECRET=your-secret-key
      - NEXTAUTH_URL=http://localhost:3000
    depends_on:
      - mongo
  
  mongo:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

### Step 3: Deploy
```bash
docker-compose up -d
```

## ☁️ DigitalOcean

### Step 1: Create Droplet
1. Create a new droplet (Ubuntu 20.04)
2. Choose size (1GB RAM minimum)
3. Add SSH key
4. Create droplet

### Step 2: Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Step 3: Deploy App
```bash
# Clone repository
git clone https://github.com/yourusername/mental-health-app.git
cd mental-health-app

# Install dependencies
npm install

# Build app
npm run build

# Start with PM2
pm2 start npm --name "mind-app" -- start
pm2 save
pm2 startup
```

## 🔧 Environment Variables

### Required
- `MONGODB_URI`: MongoDB connection string
- `NEXTAUTH_SECRET`: Secure random string for JWT
- `NEXTAUTH_URL`: Your app's URL

### Optional
- `OPENAI_API_KEY`: For enhanced AI responses
- `GOOGLE_AI_API_KEY`: For Google AI integration
- `CRISIS_DETECTION_ENABLED`: Enable crisis detection (default: true)
- `THERAPIST_VERIFICATION_ENABLED`: Enable therapist features (default: true)

## 🛡️ Security Checklist

- [ ] Use HTTPS in production
- [ ] Set secure NEXTAUTH_SECRET
- [ ] Use MongoDB Atlas with authentication
- [ ] Enable MongoDB IP whitelist
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy
- [ ] Test crisis detection in production
- [ ] Verify all environment variables

## 📊 Monitoring

### Vercel
- Built-in analytics and monitoring
- Function logs in dashboard
- Performance metrics

### Other Platforms
- Set up monitoring with services like:
  - Sentry for error tracking
  - LogRocket for session replay
  - New Relic for performance monitoring

## 🔄 CI/CD

### GitHub Actions
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 🆘 Troubleshooting

### Common Issues

**Build fails on Vercel?**
- Check Node.js version (18+)
- Verify all dependencies are in package.json
- Check for TypeScript errors

**Database connection issues?**
- Verify MongoDB URI format
- Check IP whitelist in Atlas
- Ensure database user has proper permissions

**Environment variables not working?**
- Check variable names (case-sensitive)
- Verify values are set correctly
- Restart the application after changes

### Getting Help
1. Check the [Issues](https://github.com/yourusername/mental-health-app/issues) page
2. Create a new issue with:
   - Platform you're deploying to
   - Error messages
   - Steps to reproduce
   - Environment details

---

**Happy Deploying! 🚀**

Built with ❤️ for mental health awareness and support
