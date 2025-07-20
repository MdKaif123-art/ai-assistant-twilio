# 🎯 Twilio AI Assistant Setup Guide

## 📞 Phone Number: (915) 233-4931

### 🚀 Step 1: Deploy Your App

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Build and Start Server:**
   ```bash
   npm run start
   ```

3. **Deploy to Cloud (Choose One):**
   
   **Option A: Heroku**
   ```bash
   heroku create your-ai-assistant
   git add .
   git commit -m "Add Twilio integration"
   git push heroku main
   ```
   
   **Option B: Railway**
   ```bash
   npm install -g @railway/cli
   railway login
   railway init
   railway up
   ```
   
   **Option C: Render**
   - Connect your GitHub repo
   - Set build command: `npm run build`
   - Set start command: `npm run server`

### 🔧 Step 2: Twilio Console Configuration

1. **Login to Twilio Console:**
   - Go to [console.twilio.com](https://console.twilio.com)
   - Sign in to your account

2. **Navigate to Phone Numbers:**
   - Go to **Phone Numbers** → **Manage** → **Active numbers**
   - Find your number: **(915) 233-4931**

3. **Configure Voice Settings:**

   **A CALL COMES IN:**
   - **Handler Type:** Webhook
   - **URL:** `https://your-app-url.com/webhook/voice`
   - **HTTP Method:** HTTP POST

   **PRIMARY HANDLER FAILS:**
   - **Handler Type:** Webhook
   - **URL:** `https://your-app-url.com/webhook/voice`
   - **HTTP Method:** HTTP POST

   **CALL STATUS CHANGES:**
   - **Handler Type:** Webhook
   - **URL:** `https://your-app-url.com/webhook/status`
   - **HTTP Method:** HTTP POST

### 🎤 Step 3: Speech Recognition Settings

In the **Voice Configuration** form:

1. **Speech Recognition:**
   - ✅ Enable Speech Recognition
   - **Language:** English (US)
   - **Speech Model:** `phone_call`
   - **Enhanced:** Yes

2. **Voice Settings:**
   - **Voice:** Alice (Female voice)
   - **Language:** English (US)

### 🔗 Step 4: Webhook URLs

Replace `your-app-url.com` with your actual deployed URL:

- **Incoming Call:** `https://your-app-url.com/webhook/voice`
- **Speech Input:** `https://your-app-url.com/webhook/speech`
- **Call Status:** `https://your-app-url.com/webhook/status`

### 🧪 Step 5: Test Your Setup

1. **Call (915) 233-4931**
2. **You should hear:** "Hello! I'm your AI assistant. I'm here to help you. Please speak after the beep."
3. **Speak your question**
4. **AI will respond in female voice**
5. **Conversation continues automatically**

### 🔍 Troubleshooting

**If calls don't work:**
1. Check your webhook URLs are accessible
2. Verify Twilio can reach your server
3. Check server logs for errors
4. Ensure API key is configured correctly

**If speech isn't recognized:**
1. Check microphone permissions
2. Speak clearly and slowly
3. Ensure good phone connection
4. Check Twilio speech settings

**If AI doesn't respond:**
1. Check OpenRouter API key
2. Verify internet connection
3. Check server logs for API errors

### 📊 Monitoring

- **Twilio Console:** Monitor call logs and webhook delivery
- **Server Logs:** Check for errors and API responses
- **Call Analytics:** Track call duration and success rates

### 🔐 Security Notes

- Keep your API keys secure
- Use HTTPS for all webhooks
- Monitor for unusual call patterns
- Set up rate limiting if needed

### 💰 Cost Considerations

- **Twilio:** ~$0.0075/minute for calls
- **OpenRouter:** ~$0.002/1K tokens
- **Hosting:** $5-20/month depending on platform

---

## 🎉 Your AI Assistant is Ready!

When someone calls **(915) 233-4931**, they'll get:
1. **Female voice greeting**
2. **Speech recognition**
3. **AI-powered responses**
4. **Continuous conversation**
5. **Professional call handling**

The AI will listen, process, and respond automatically until the caller hangs up! 🎤✨ 