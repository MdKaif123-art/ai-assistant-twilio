# 🚀 DEPLOY TO RENDER (FREE)

## Step 1: Prepare Your Code

Your code is ready! You have:
- ✅ React app built
- ✅ Server configured
- ✅ Twilio webhooks ready
- ✅ render.yaml configuration

## Step 2: Deploy to Render

1. **Go to:** https://render.com
2. **Sign up/Login** with your GitHub account
3. **Click "New +" → "Web Service"**
4. **Connect your GitHub repository**
5. **Configure the service:**

   **Basic Settings:**
   - **Name:** `ai-assistant`
   - **Environment:** `Node`
   - **Region:** Choose closest to you
   - **Branch:** `main` (or your default branch)

   **Build & Deploy:**
   - **Build Command:** `npm run build`
   - **Start Command:** `npm run server`
   - **Plan:** `Free`

6. **Click "Create Web Service"**

## Step 3: Get Your URL

- Render will give you a URL like: `https://ai-assistant-xxxx.onrender.com`
- Save this URL for Twilio configuration

## Step 4: Configure Twilio

1. **Go to:** https://console.twilio.com
2. **Navigate to:** Phone Numbers → Manage → Active numbers
3. **Click on:** (915) 233-4931
4. **Configure Voice Settings:**

   **A CALL COMES IN:**
   - Handler Type: `Webhook`
   - URL: `https://ai-assistant-xxxx.onrender.com/webhook/voice`
   - HTTP Method: `HTTP POST`

   **PRIMARY HANDLER FAILS:**
   - Handler Type: `Webhook`
   - URL: `https://ai-assistant-xxxx.onrender.com/webhook/voice`
   - HTTP Method: `HTTP POST`

   **CALL STATUS CHANGES:**
   - Handler Type: `Webhook`
   - URL: `https://ai-assistant-xxxx.onrender.com/webhook/status`
   - HTTP Method: `HTTP POST`

## Step 5: Test Your Deployment

1. **Test Health Check:**
   - Visit: `https://ai-assistant-xxxx.onrender.com/health`
   - Should show: `{"status":"OK","message":"AI Assistant Server is running"}`

2. **Test Webhook:**
   ```bash
   curl -X POST https://ai-assistant-xxxx.onrender.com/webhook/voice \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "CallSid=test123&From=+1234567890&To=+19152334931"
   ```

3. **Call Your Number:**
   - **Dial:** (915) 233-4931
   - **You should hear:** "Hello! I'm your AI assistant. I'm here to help you. Please speak after the beep."

## 🎉 SUCCESS!

Your AI Assistant is now:
- ✅ Live on the internet
- ✅ Ready to handle phone calls
- ✅ Using female voice responses
- ✅ Continuous conversation enabled

**Call (915) 233-4931 to test!** 🎤✨ 