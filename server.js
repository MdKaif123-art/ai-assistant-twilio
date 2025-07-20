import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Check if dist folder exists, if not serve a simple API
const distPath = path.join(__dirname, 'dist');
if (existsSync(distPath)) {
  app.use(express.static(distPath));
}

// Simple Twilio webhook handlers (no TypeScript compilation needed)
app.post('/webhook/voice', async (req, res) => {
  try {
    console.log('📞 Incoming call webhook:', req.body);
    
    // Welcome message with female voice
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="en-US">Hello! I'm your AI assistant. I'm here to help you. Please speak after the beep.</Say>
  <Gather input="speech" timeout="10" speechTimeout="auto" action="/webhook/speech" method="POST" language="en-US" speechModel="phone_call" enhanced="true">
  </Gather>
</Response>`;
    
    res.set('Content-Type', 'text/xml');
    res.send(twiml);
  } catch (error) {
    console.error('Error handling voice webhook:', error);
    res.status(500).send('Error processing webhook');
  }
});

app.post('/webhook/speech', async (req, res) => {
  try {
    console.log('🎤 Speech input webhook:', req.body);
    
    const userSpeech = req.body.SpeechResult;
    const confidence = parseFloat(req.body.Confidence || '0');
    
    if (!userSpeech || confidence < 0.3) {
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="en-US">I didn't catch that. Could you please repeat?</Say>
  <Gather input="speech" timeout="10" speechTimeout="auto" action="/webhook/speech" method="POST" language="en-US" speechModel="phone_call" enhanced="true">
  </Gather>
</Response>`;
      
      res.set('Content-Type', 'text/xml');
      res.send(twiml);
      return;
    }

    // For now, send a simple response. You can integrate with OpenAI here
    const aiResponse = `Thank you for saying: ${userSpeech}. I'm your AI assistant and I'm here to help you. How can I assist you today?`;
    
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="en-US">${aiResponse}</Say>
  <Gather input="speech" timeout="10" speechTimeout="auto" action="/webhook/speech" method="POST" language="en-US" speechModel="phone_call" enhanced="true">
  </Gather>
</Response>`;
    
    res.set('Content-Type', 'text/xml');
    res.send(twiml);
  } catch (error) {
    console.error('Error handling speech webhook:', error);
    res.status(500).send('Error processing webhook');
  }
});

app.post('/webhook/status', (req, res) => {
  try {
    console.log('📞 Call status webhook:', req.body);
    
    if (req.body.CallStatus === 'completed') {
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="en-US">Thank you for calling. Have a great day!</Say>
</Response>`;
      
      res.set('Content-Type', 'text/xml');
      res.send(twiml);
    } else {
      res.status(200).send('OK');
    }
  } catch (error) {
    console.error('Error handling status webhook:', error);
    res.status(500).send('Error processing webhook');
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'AI Assistant Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint to wake up the service
app.get('/', (req, res) => {
  res.json({ 
    message: 'AI Assistant is running!',
    status: 'active',
    webhooks: {
      voice: '/webhook/voice',
      speech: '/webhook/speech',
      status: '/webhook/status'
    },
    phone: '(915) 233-4931'
  });
});

// Serve React app for all other routes (only if dist exists)
app.get('*', (req, res) => {
  if (existsSync(distPath)) {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  } else {
    res.json({ 
      message: 'AI Assistant API is running!',
      note: 'React app not built - API endpoints available',
      webhooks: {
        voice: '/webhook/voice',
        speech: '/webhook/speech',
        status: '/webhook/status'
      },
      phone: '(915) 233-4931'
    });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📞 Twilio webhooks available at:`);
  console.log(`   - Voice: http://localhost:${PORT}/webhook/voice`);
  console.log(`   - Speech: http://localhost:${PORT}/webhook/speech`);
  console.log(`   - Status: http://localhost:${PORT}/webhook/status`);
  console.log(`   - Health: http://localhost:${PORT}/health`);
  console.log('');
  console.log('🎯 Ready for Twilio integration!');
  console.log('📞 Phone Number: (915) 233-4931');
}); 