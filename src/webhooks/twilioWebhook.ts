import { TwilioService, TwilioCallRequest } from '../services/twilioService';

export class TwilioWebhookHandler {
  static generateTwiML(response: any): string {
    let twiml = '<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n';
    
    if (response.Actions) {
      response.Actions.forEach((action: any) => {
        if (action.Say) {
          twiml += `  <Say voice="${action.Say.voice}" language="${action.Say.language}">${action.Say.text}</Say>\n`;
        } else if (action.Gather) {
          twiml += `  <Gather input="${action.Gather.input}" timeout="${action.Gather.timeout}" speechTimeout="${action.Gather.speechTimeout}" action="${action.Gather.action}" method="${action.Gather.method}" language="${action.Gather.language}" speechModel="${action.Gather.speechModel}" enhanced="${action.Gather.enhanced}">\n`;
          twiml += `  </Gather>\n`;
        }
      });
    }
    
    twiml += '</Response>';
    return twiml;
  }

  static async handleIncomingCall(request: TwilioCallRequest): Promise<string> {
    try {
      const response = await TwilioService.handleIncomingCall(request);
      return this.generateTwiML(response);
    } catch (error) {
      console.error('Error in incoming call webhook:', error);
      return this.generateTwiML({
        Message: "I'm sorry, I'm having technical difficulties. Please try again later."
      });
    }
  }

  static async handleSpeechInput(request: TwilioCallRequest): Promise<string> {
    try {
      const response = await TwilioService.handleSpeechInput(request);
      return this.generateTwiML(response);
    } catch (error) {
      console.error('Error in speech input webhook:', error);
      return this.generateTwiML({
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
      });
    }
  }

  static handleCallEnd(request: TwilioCallRequest): string {
    try {
      const response = TwilioService.handleCallEnd(request);
      return this.generateTwiML(response);
    } catch (error) {
      console.error('Error in call end webhook:', error);
      return this.generateTwiML({
        Message: "Thank you for calling. Have a great day!"
      });
    }
  }
} 