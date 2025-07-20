import OpenAI from 'openai';
import { businessConfig, OPENAI_CONFIG } from '../config/businessConfig';

// Initialize OpenAI client for OpenRouter
const openai = new OpenAI({
  apiKey: OPENAI_CONFIG.apiKey,
  baseURL: 'https://openrouter.ai/api/v1',
  dangerouslyAllowBrowser: true // Note: In production, use a backend proxy
});

export interface AIResponseOptions {
  language: string;
  context?: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export class OpenAIService {
  private static createSystemPrompt(language: string): string {
    const languageNames: { [key: string]: string } = {
      'en-US': 'English',
      'es-ES': 'Spanish',
      'fr-FR': 'French',
      'de-DE': 'German',
      'it-IT': 'Italian',
      'pt-BR': 'Portuguese',
      'ru-RU': 'Russian',
      'ja-JP': 'Japanese',
      'ko-KR': 'Korean',
      'zh-CN': 'Chinese',
      'hi-IN': 'Hindi',
      'ar-SA': 'Arabic'
    };

    const langName = languageNames[language] || 'English';
    
    return `You are an AI healthcare assistant for ${businessConfig.name}, a ${businessConfig.industry} system.

BUSINESS INFORMATION:
- Healthcare Provider: ${businessConfig.name}
- Industry: ${businessConfig.industry}
- Description: ${businessConfig.description}

HEALTHCARE SERVICES OFFERED:
${businessConfig.services.map(service => `- ${service}`).join('\n')}

CONTACT INFORMATION:
- Emergency/Support: ${businessConfig.contactInfo.phone}
- Email: ${businessConfig.contactInfo.email}
- Website: ${businessConfig.contactInfo.website}
- Address: ${businessConfig.contactInfo.address}

HEALTHCARE POLICIES:
- Return Policy: ${businessConfig.policies.returnPolicy}
- Warranty Policy: ${businessConfig.policies.warrantyPolicy}
- Shipping Policy: ${businessConfig.policies.shippingPolicy}

FREQUENTLY ASKED HEALTHCARE QUESTIONS:
${businessConfig.faq.map(qa => `Q: ${qa.question}\nA: ${qa.answer}`).join('\n\n')}

HEALTHCARE ASSISTANT INSTRUCTIONS:
1. Respond in ${langName} language only
2. Be professional, empathetic, and medically appropriate
3. Use the healthcare information provided to answer questions accurately
4. Keep responses concise but informative (2-4 sentences)
5. For medical emergencies, always advise calling 911 immediately
6. Maintain patient confidentiality and privacy
7. Use appropriate medical terminology while remaining accessible
8. If you don't have specific medical information, offer to connect them with a healthcare professional
9. Always prioritize patient safety and well-being
10. For appointment scheduling, ask for preferred date/time and urgency level
11. For prescription refills, ask for medication name and current dosage
12. For symptoms, ask relevant follow-up questions but don't provide medical diagnosis

IMPORTANT MEDICAL DISCLAIMERS:
- This AI assistant provides general information only
- For medical emergencies, call 911 immediately
- Always consult with healthcare professionals for medical advice
- This system is not a substitute for professional medical care

IMPORTANT: Always respond in ${langName} language, regardless of what language the patient uses.`;
  }

  static async generateResponse(
    userMessage: string, 
    options: AIResponseOptions
  ): Promise<string> {
    try {
      const systemPrompt = this.createSystemPrompt(options.language);
      
      const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
        { role: 'system', content: systemPrompt }
      ];

      // Add conversation history if provided
      if (options.conversationHistory) {
        messages.push(...options.conversationHistory);
      }

      // Add current user message
      messages.push({ role: 'user', content: userMessage });

      const response = await openai.chat.completions.create({
        model: OPENAI_CONFIG.model,
        messages,
        max_tokens: OPENAI_CONFIG.maxTokens,
        temperature: OPENAI_CONFIG.temperature,
      });

      const aiResponse = response.choices[0]?.message?.content;
      
      if (!aiResponse) {
        throw new Error('No response received from OpenAI');
      }

      return aiResponse.trim();
    } catch (error) {
      console.error('OpenAI API Error:', error);
      
      // Check for specific error types
      let errorMessage = 'AI service temporarily unavailable. Using fallback responses.';
      let isRateLimit = false;
      
      if (error && typeof error === 'object') {
        // Check for OpenAI rate limit error
        if ('status' in error && error.status === 429) {
          errorMessage = 'API rate limit exceeded. Using fallback responses. Please check your OpenAI billing.';
          isRateLimit = true;
        } else if ('status' in error && error.status === 401) {
          errorMessage = 'Invalid API key. Using fallback responses.';
        } else if ('status' in error && error.status === 403) {
          errorMessage = 'API access denied. Using fallback responses.';
        } else if ('message' in error && typeof error.message === 'string') {
          // Check for OpenAI error message patterns
          if (error.message.includes('rate limit') || error.message.includes('quota') || error.message.includes('429')) {
            errorMessage = 'API rate limit exceeded. Using fallback responses. Please check your OpenAI billing.';
            isRateLimit = true;
          } else if (error.message.includes('invalid api key') || error.message.includes('401')) {
            errorMessage = 'Invalid API key. Using fallback responses.';
          } else if (error.message.includes('access denied') || error.message.includes('403')) {
            errorMessage = 'API access denied. Using fallback responses.';
          }
        }
      }
      
      // Log the specific error for debugging
      if (isRateLimit) {
        console.warn('OpenAI Rate Limit Error - Using fallback responses. Please check billing and usage limits.');
      }
      
      return this.getFallbackResponse(userMessage, options.language);
    }
  }

  private static getFallbackResponse(userMessage: string, language: string): string {
    const message = userMessage.toLowerCase();
    
    // Healthcare-specific fallback responses
    const healthcareResponses: { [key: string]: { [key: string]: string[] } } = {
      'en-US': {
        greeting: [
          `Hello! Welcome to ${businessConfig.name}. I'm your healthcare assistant ready to help you with medical services, appointments, and health-related questions. How can I assist you today?`,
          `Good day! Thank you for contacting ${businessConfig.name}. I'm here to help you with your healthcare needs, from scheduling appointments to managing your health records. What can I help you with?`,
          `Welcome to ${businessConfig.name}! I'm your AI healthcare assistant. I can help you with appointments, prescriptions, medical records, and general health inquiries. How may I assist you?`
        ],
        appointment: [
          `I can help you schedule an appointment. What type of appointment do you need? We offer same-day appointments for urgent care and advance booking for routine checkups.`,
          `For appointment scheduling, I'll need to know your preferred date and time, and whether this is for urgent care or routine checkup. What works best for you?`,
          `Let me help you schedule an appointment. Do you need urgent care, routine checkup, or specialist consultation? I can check our available slots.`
        ],
        prescription: [
          `I can help you with prescription refills. Please provide the medication name and your current dosage. Most refills are processed within 24 hours.`,
          `For prescription refills, I'll need the medication name and dosage information. You can also check your prescription status through our patient portal.`,
          `Let me assist you with your prescription refill. What medication do you need refilled and what's your current dosage?`
        ],
        emergency: [
          `If this is a medical emergency, please call 911 immediately. For non-emergency medical concerns, I can help you determine if you need urgent care or routine appointment.`,
          `For medical emergencies, call 911 right away. Our AI system can provide guidance for non-emergency situations, but always seek immediate professional care for serious conditions.`,
          `Medical emergencies require immediate professional attention. Please call 911. For other health concerns, I can help you schedule appropriate care.`
        ],
        symptoms: [
          `I can help you understand your symptoms and guide you to appropriate care. However, I cannot provide medical diagnosis. For serious symptoms, please consult a healthcare professional.`,
          `While I can provide general information about symptoms, I cannot diagnose medical conditions. For persistent or severe symptoms, please schedule an appointment with a healthcare provider.`,
          `I'm here to help you understand your symptoms and guide you to the right care. For medical diagnosis and treatment, you'll need to consult with a healthcare professional.`
        ],
        records: [
          `Your medical records are securely stored and accessible through our patient portal. You can view test results, prescriptions, and appointment history 24/7.`,
          `Medical records are available through our secure patient portal. You can access test results, prescriptions, and appointment history anytime. For urgent access, contact our support team.`,
          `Your health records are safely stored in our secure system. Access them anytime through our patient portal for test results, prescriptions, and appointment history.`
        ],
        insurance: [
          `We accept most major insurance plans including Medicare, Medicaid, Blue Cross Blue Shield, Aetna, and Cigna. We also offer self-pay options and payment plans.`,
          `Our healthcare services are covered by most major insurance providers. We also offer flexible payment options for uninsured patients. Would you like to discuss your insurance coverage?`,
          `We work with most major insurance companies and offer various payment options. For specific insurance questions, I can connect you with our billing department.`
        ],
        help: [
          `I'm here to help you with all your healthcare needs. Could you please provide more details about what you're looking for or experiencing?`,
          `I'd be happy to assist you with your healthcare concerns. Can you tell me more about what you need help with?`,
          `I understand you need healthcare assistance. Could you please elaborate on your situation so I can provide the best support?`
        ],
        default: [
          `Thank you for contacting ${businessConfig.name}. We're committed to providing excellent healthcare services. How else can I assist you with your health needs?`,
          `I appreciate your inquiry. We're here to help with all your healthcare needs. Is there anything specific about our medical services you'd like to know?`,
          `That's a great question about healthcare. ${businessConfig.name} is dedicated to delivering quality medical care. What other information can I provide?`
        ]
      }
    };

    const responses = healthcareResponses[language] || healthcareResponses['en-US'];
    
    if (message.includes('hello') || message.includes('hi') || message.includes('hey') || message.includes('start')) {
      return responses.greeting[Math.floor(Math.random() * responses.greeting.length)];
    } else if (message.includes('appointment') || message.includes('schedule') || message.includes('book') || message.includes('visit')) {
      return responses.appointment[Math.floor(Math.random() * responses.appointment.length)];
    } else if (message.includes('prescription') || message.includes('medication') || message.includes('refill') || message.includes('medicine')) {
      return responses.prescription[Math.floor(Math.random() * responses.prescription.length)];
    } else if (message.includes('emergency') || message.includes('urgent') || message.includes('pain') || message.includes('severe')) {
      return responses.emergency[Math.floor(Math.random() * responses.emergency.length)];
    } else if (message.includes('symptom') || message.includes('feel') || message.includes('hurt') || message.includes('pain')) {
      return responses.symptoms[Math.floor(Math.random() * responses.symptoms.length)];
    } else if (message.includes('record') || message.includes('test') || message.includes('result') || message.includes('history')) {
      return responses.records[Math.floor(Math.random() * responses.records.length)];
    } else if (message.includes('insurance') || message.includes('bill') || message.includes('payment') || message.includes('cost')) {
      return responses.insurance[Math.floor(Math.random() * responses.insurance.length)];
    } else if (message.includes('help') || message.includes('support') || message.includes('assist')) {
      return responses.help[Math.floor(Math.random() * responses.help.length)];
    } else {
      return responses.default[Math.floor(Math.random() * responses.default.length)];
    }
  }

  static async detectLanguage(text: string): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: OPENAI_CONFIG.model,
        messages: [
          {
            role: 'system',
            content: `You are a language detection expert. Analyze the given text and respond with ONLY the language code from this list:
            en-US (English), es-ES (Spanish), fr-FR (French), de-DE (German), it-IT (Italian), pt-BR (Portuguese), 
            ru-RU (Russian), ja-JP (Japanese), ko-KR (Korean), zh-CN (Chinese), hi-IN (Hindi), ar-SA (Arabic).
            
            Respond with ONLY the language code, nothing else.`
          },
          {
            role: 'user',
            content: text
          }
        ],
        max_tokens: 10,
        temperature: 0.1,
      });

      const detectedLang = response.choices[0]?.message?.content?.trim();
      
      // Validate the response
      const validLanguages = ['en-US', 'es-ES', 'fr-FR', 'de-DE', 'it-IT', 'pt-BR', 'ru-RU', 'ja-JP', 'ko-KR', 'zh-CN', 'hi-IN', 'ar-SA'];
      
      if (detectedLang && validLanguages.includes(detectedLang)) {
        return detectedLang;
      }
      
      return 'en-US'; // Default fallback
    } catch (error) {
      console.error('Language detection error:', error);
      return this.simpleLanguageDetection(text);
    }
  }

  private static simpleLanguageDetection(text: string): string {
    const languagePatterns = {
      'es-ES': /\b(hola|gracias|por favor|ayuda|problema|servicio|cliente)\b/i,
      'fr-FR': /\b(bonjour|merci|s'il vous plaît|aide|problème|service|client)\b/i,
      'de-DE': /\b(hallo|danke|bitte|hilfe|problem|service|kunde)\b/i,
      'it-IT': /\b(ciao|grazie|per favore|aiuto|problema|servizio|cliente)\b/i,
      'pt-BR': /\b(olá|obrigado|por favor|ajuda|problema|serviço|cliente)\b/i,
      'ru-RU': /\b(привет|спасибо|пожалуйста|помощь|проблема|сервис|клиент)\b/i,
      'ja-JP': /\b(こんにちは|ありがとう|お願い|助け|問題|サービス|顧客)\b/i,
      'ko-KR': /\b(안녕|감사|부탁|도움|문제|서비스|고객)\b/i,
      'zh-CN': /\b(你好|谢谢|请|帮助|问题|服务|客户)\b/i,
      'hi-IN': /\b(नमस्ते|धन्यवाद|कृपया|मदद|समस्या|सेवा|ग्राहक)\b/i,
      'ar-SA': /\b(مرحبا|شكرا|من فضلك|مساعدة|مشكلة|خدمة|عميل)\b/i
    };

    for (const [lang, pattern] of Object.entries(languagePatterns)) {
      if (pattern.test(text)) {
        return lang;
      }
    }
    
    return 'en-US'; // Default to English
  }
}