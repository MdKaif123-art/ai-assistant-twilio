import { OpenAIService } from './openaiService';

export interface TwilioCallRequest {
  CallSid: string;
  From: string;
  To: string;
  CallStatus: string;
  SpeechResult?: string;
  Confidence?: string;
}

export interface TwilioResponse {
  Message: string;
  Actions?: any[];
}

export class TwilioService {
  private static readonly MAX_CONVERSATION_LENGTH = 10; // Prevent infinite loops
  
  static async handleIncomingCall(request: TwilioCallRequest): Promise<TwilioResponse> {
    try {
      console.log('📞 Incoming call from:', request.From);
      
      // Welcome message
      const welcomeMessage = "Hello! I'm your AI assistant. I'm here to help you. Please speak after the beep.";
      
      return {
        Message: welcomeMessage,
        Actions: [
          {
            Say: {
              text: welcomeMessage,
              voice: 'alice', // Female voice
              language: 'en-US'
            }
          },
          {
            Gather: {
              input: 'speech',
              timeout: 10,
              speechTimeout: 'auto',
              action: '/webhook/speech',
              method: 'POST',
              language: 'en-US',
              speechModel: 'phone_call',
              enhanced: true
            }
          }
        ]
      };
    } catch (error) {
      console.error('Error handling incoming call:', error);
      return {
        Message: "I'm sorry, I'm having technical difficulties. Please try again later."
      };
    }
  }

  static async handleSpeechInput(request: TwilioCallRequest): Promise<TwilioResponse> {
    try {
      const userSpeech = request.SpeechResult;
      const confidence = parseFloat(request.Confidence || '0');
      
      console.log('🎤 User said:', userSpeech, 'Confidence:', confidence);
      
      if (!userSpeech || confidence < 0.3) {
        return {
          Message: "I didn't catch that. Could you please repeat?",
          Actions: [
            {
              Say: {
                text: "I didn't catch that. Could you please repeat?",
                voice: 'alice',
                language: 'en-US'
              }
            },
            {
              Gather: {
                input: 'speech',
                timeout: 10,
                speechTimeout: 'auto',
                action: '/webhook/speech',
                method: 'POST',
                language: 'en-US',
                speechModel: 'phone_call',
                enhanced: true
              }
            }
          ]
        };
      }

      // Get AI response
      const aiResponse = await OpenAIService.generateResponse(userSpeech, {
        language: 'en-US',
        conversationHistory: [] // Twilio doesn't maintain conversation state, so we start fresh each time
      });

      console.log('🤖 AI response:', aiResponse);

      return {
        Message: aiResponse,
        Actions: [
          {
            Say: {
              text: aiResponse,
              voice: 'alice',
              language: 'en-US'
            }
          },
          {
            Gather: {
              input: 'speech',
              timeout: 10,
              speechTimeout: 'auto',
              action: '/webhook/speech',
              method: 'POST',
              language: 'en-US',
              speechModel: 'phone_call',
              enhanced: true
            }
          }
        ]
      };
    } catch (error) {
      console.error('Error handling speech input:', error);
      return {
        Message: "I'm sorry, I'm having trouble processing your request. Please try again.",
        Actions: [
          {
            Say: {
              text: "I'm sorry, I'm having trouble processing your request. Please try again.",
              voice: 'alice',
              language: 'en-US'
            }
          },
          {
            Gather: {
              input: 'speech',
              timeout: 10,
              speechTimeout: 'auto',
              action: '/webhook/speech',
              method: 'POST',
              language: 'en-US',
              speechModel: 'phone_call',
              enhanced: true
            }
          }
        ]
      };
    }
  }

  static handleCallEnd(request: TwilioCallRequest): TwilioResponse {
    console.log('📞 Call ended:', request.CallSid);
    return {
      Message: "Thank you for calling. Have a great day!"
    };
  }
} 