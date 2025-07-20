# AI Call Center with OpenAI Integration

A sophisticated AI-powered call center application that uses OpenAI's GPT models to provide intelligent, context-aware customer service responses based on your business information.

## Features

- 🤖 **OpenAI Integration**: Uses GPT-3.5-turbo for intelligent, context-aware responses
- 🗣️ **Real-time Speech Recognition**: Live voice-to-text conversion
- 🔊 **Text-to-Speech**: Natural voice responses in multiple languages
- 🌍 **Multi-language Support**: 12+ languages with automatic detection
- 💼 **Business Context**: AI trained with your specific business information
- 🎯 **Smart Responses**: Contextual conversations with conversation history
- 📱 **Modern UI**: Beautiful, responsive interface with real-time status indicators

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure OpenAI API

1. Get your OpenAI API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a `.env` file in the project root:

```env
VITE_OPENAI_API_KEY=your-openai-api-key-here
```

### 3. Customize Business Information

Edit `src/config/businessConfig.ts` to match your business:

```typescript
export const businessConfig: BusinessConfig = {
  name: "Your Company Name",
  industry: "Your Industry",
  description: "Your company description...",
  services: [
    "Service 1",
    "Service 2",
    // Add your services
  ],
  contactInfo: {
    phone: "+1-555-123-4567",
    email: "support@yourcompany.com",
    website: "www.yourcompany.com",
    address: "Your address"
  },
  policies: {
    returnPolicy: "Your return policy...",
    warrantyPolicy: "Your warranty policy...",
    shippingPolicy: "Your shipping policy..."
  },
  faq: [
    {
      question: "Common question 1?",
      answer: "Answer to question 1"
    },
    // Add more FAQs
  ]
};
```

### 4. Run the Application

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## How It Works

### AI Response Generation

The application uses OpenAI's GPT-3.5-turbo model with a comprehensive system prompt that includes:

- **Business Information**: Company details, services, policies
- **Contact Information**: Phone, email, website, address
- **FAQ Database**: Pre-defined Q&A pairs
- **Language Instructions**: Ensures responses in the detected language
- **Conversation Context**: Maintains conversation history for contextual responses

### Language Detection

The AI automatically detects the language of user input and responds in the same language, supporting:

- English (en-US)
- Spanish (es-ES)
- French (fr-FR)
- German (de-DE)
- Italian (it-IT)
- Portuguese (pt-BR)
- Russian (ru-RU)
- Japanese (ja-JP)
- Korean (ko-KR)
- Chinese (zh-CN)
- Hindi (hi-IN)
- Arabic (ar-SA)

### Conversation Flow

1. **Start Call**: AI greets the user with a welcome message
2. **Listen**: Speech recognition captures user input
3. **Process**: Language detection and AI response generation
4. **Respond**: Text-to-speech delivers the AI response
5. **Repeat**: Continuous conversation loop

## Configuration Options

### OpenAI Settings

Edit `src/config/businessConfig.ts` to modify OpenAI parameters:

```typescript
export const OPENAI_CONFIG = {
  apiKey: process.env.VITE_OPENAI_API_KEY,
  model: 'gpt-3.5-turbo', // or 'gpt-4' for better responses
  maxTokens: 500,         // Maximum response length
  temperature: 0.7        // Creativity level (0.0-1.0)
};
```

### Speech Recognition

The application automatically handles:
- Browser compatibility (WebkitSpeechRecognition fallback)
- Continuous listening with auto-restart
- Language switching based on detected language
- Error recovery and fallback mechanisms

## Security Considerations

⚠️ **Important**: This application runs OpenAI API calls directly in the browser. For production use, consider:

1. **Backend Proxy**: Create a server-side API to handle OpenAI calls
2. **Rate Limiting**: Implement request throttling
3. **API Key Security**: Never expose API keys in client-side code
4. **Data Privacy**: Consider data handling and privacy regulations

## Troubleshooting

### Common Issues

1. **OpenAI API Errors**
   - Check your API key is correct
   - Verify you have sufficient credits
   - Check API rate limits

2. **Speech Recognition Not Working**
   - Ensure microphone permissions are granted
   - Check browser compatibility (Chrome recommended)
   - Verify HTTPS connection (required for speech APIs)

3. **Language Detection Issues**
   - The system falls back to pattern matching if OpenAI fails
   - Check console for error messages

### Error Handling

The application includes comprehensive error handling:
- **API Failures**: Falls back to predefined responses
- **Speech Errors**: Auto-restart mechanisms
- **Network Issues**: Graceful degradation
- **Browser Compatibility**: Multiple fallback options

## Development

### Project Structure

```
src/
├── App.tsx                 # Main application component
├── config/
│   └── businessConfig.ts   # Business configuration
├── services/
│   └── openaiService.ts    # OpenAI API integration
└── types/
    └── speech.d.ts         # Speech API type definitions
```

### Adding New Features

1. **New Languages**: Add language codes to `supportedLanguages` array
2. **Business Info**: Update `businessConfig` object
3. **AI Behavior**: Modify system prompt in `openaiService.ts`
4. **UI Components**: Add new React components as needed

## License

This project is open source and available under the MIT License.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review browser console for error messages
3. Verify OpenAI API configuration
4. Ensure all dependencies are installed correctly 