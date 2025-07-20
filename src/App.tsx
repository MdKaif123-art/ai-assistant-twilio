import React, { useState, useEffect, useRef } from 'react';
import { Mic, Phone, PhoneOff, MessageCircle, User, Bot } from 'lucide-react';
import { OpenAIService } from './services/openaiService';

interface Message {
  type: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

function App() {
  const [isCallActive, setIsCallActive] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [statusMessage, setStatusMessage] = useState('Ready to start');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const initializeSpeechRecognition = async () => {
      try {
        // Check browser support
        if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
          setStatusMessage('❌ Speech recognition not supported');
          return;
        }

        // Request microphone permission
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach(track => track.stop());
        } catch (error) {
          setStatusMessage('❌ Microphone permission denied');
          return;
        }

        // Initialize speech recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        
        // Improved configuration for better reliability
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';
        recognitionRef.current.maxAlternatives = 3; // Get multiple alternatives
        
        // Enhanced event handlers
        recognitionRef.current.onstart = () => {
          console.log('🎤 Listening...');
          setStatusMessage('🎤 Listening... Speak now');
        };

        recognitionRef.current.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          const confidence = event.results[0][0].confidence;
          console.log('🎤 Heard:', transcript, 'Confidence:', confidence);
          
          // Only process if confidence is reasonable
          if (confidence > 0.3) {
            // Send to API and get reply
            handleUserMessage(transcript);
          } else {
            setStatusMessage('🎤 Low confidence - please repeat');
            // Restart listening
            setTimeout(() => {
              if (isCallActive && !isProcessing) {
                try {
                  recognitionRef.current?.start();
                } catch (error) {
                  console.error('❌ Error restarting after low confidence:', error);
                }
              }
            }, 1000);
          }
        };

        recognitionRef.current.onerror = (event) => {
          console.error('Speech error:', event.error);
          
          if (event.error === 'no-speech') {
            setStatusMessage('🎤 No speech detected - Listening again...');
            // Restart if no speech detected
            if (isCallActive && !isProcessing) {
              setTimeout(() => {
                try {
                  recognitionRef.current?.start();
                } catch (error) {
                  console.error('❌ Error restarting after no-speech:', error);
                }
              }, 500);
            }
          } else if (event.error === 'audio-capture') {
            setStatusMessage('🎤 Microphone issue - please check permissions');
            // Try to restart after a longer delay
            if (isCallActive && !isProcessing) {
              setTimeout(() => {
                try {
                  recognitionRef.current?.start();
                } catch (error) {
                  console.error('❌ Error restarting after audio-capture:', error);
                }
              }, 2000);
            }
          } else {
            setStatusMessage(`❌ Speech error: ${event.error} - Restarting...`);
            // Restart on other errors
            if (isCallActive && !isProcessing) {
              setTimeout(() => {
                try {
                  recognitionRef.current?.start();
                } catch (error) {
                  console.error('❌ Error restarting after error:', error);
                }
              }, 1000);
            }
          }
        };

        recognitionRef.current.onend = () => {
          console.log('🎤 Speech recognition ended');
          
          // Always restart if call is active and not processing
          if (isCallActive && !isProcessing) {
            setStatusMessage('🔄 Reconnecting...');
            setTimeout(() => {
              if (isCallActive && !isProcessing) {
                try {
                  recognitionRef.current?.start();
                  console.log('✅ Speech recognition restarted');
                } catch (error) {
                  console.error('❌ Error restarting speech recognition:', error);
                  setStatusMessage('❌ Connection error - try speaking again');
                }
              }
            }, 200);
          }
        };

        console.log('✅ Speech recognition ready');
        
      } catch (error) {
        console.error('Speech recognition error:', error);
      }
    };

    initializeSpeechRecognition();

    // Initialize speech synthesis with better setup
    synthRef.current = window.speechSynthesis;
    
    // Load voices when they become available
    if (synthRef.current) {
      const loadVoices = () => {
        const voices = synthRef.current?.getVoices() || [];
        console.log('🔊 Available voices:', voices.map(v => `${v.name} (${v.lang})`));
      };
      
      // Load voices immediately if available
      loadVoices();
      
      // Also listen for voices to load
      synthRef.current.onvoiceschanged = loadVoices;
    }

    return () => {
      recognitionRef.current?.stop();
      synthRef.current?.cancel();
    };
  }, [isCallActive, isProcessing]);

  const handleUserMessage = async (text: string) => {
    if (!text || text.trim().length === 0 || isProcessing) return;
    
    console.log('🤖 Processing:', text);
    setIsProcessing(true);
    setStatusMessage('🤖 AI is thinking...');
    
    try {
      // Add user message
      const userMessage: Message = {
        type: 'user',
        text: text,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);
      
      // Get AI response
      const aiResponse = await OpenAIService.generateResponse(text, {
        language: 'en-US',
        conversationHistory: messages.slice(-6).map(msg => ({
          role: msg.type === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.text
        }))
      });
      
      // Add AI message
      const aiMessage: Message = {
        type: 'ai',
        text: aiResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      
      setStatusMessage('✅ AI replied - Speaking response...');
      
      // Speak the AI response
      speakText(aiResponse);
      
    } catch (error) {
      console.error('Error processing message:', error);
      setStatusMessage('❌ Error processing message');
      
      // Add fallback response
      const fallbackMessage: Message = {
        type: 'ai',
        text: "I'm sorry, I'm having trouble processing your request right now. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, fallbackMessage]);
      
      // Speak the fallback response
      speakText("I'm sorry, I'm having trouble processing your request right now. Please try again.");
    } finally {
      setIsProcessing(false);
      // Don't set status message here as it will be set by speakText function
    }
  };

  const startCall = () => {
    console.log('📞 Starting call...');
    setIsCallActive(true);
    setMessages([]);
    setStatusMessage('📞 Call started - Listening...');
    
    // Start listening immediately
    setTimeout(() => {
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
    }, 500);
  };

  const endCall = () => {
    setIsCallActive(false);
    setStatusMessage('📞 Call ended');
    recognitionRef.current?.stop();
  };

  const testVoice = () => {
    const testText = "Hello! This is a test of the female voice. Can you hear me clearly?";
    console.log('🧪 Testing voice synthesis...');
    speakText(testText);
  };

  const speakText = (text: string) => {
    if (synthRef.current) {
      setIsSpeaking(true);
      setStatusMessage('🔊 AI is speaking...');
      
      // Cancel any ongoing speech
      synthRef.current.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Better speech settings for clarity
      utterance.rate = 0.9; // Slightly slower for better clarity
      utterance.pitch = 1.1; // Slightly higher pitch for female voice
      utterance.volume = 1.0; // Maximum volume
      utterance.lang = 'en-US';
      
      // Get available voices and select the best female voice
      const voices = synthRef.current.getVoices();
      
      // If voices are not loaded yet, wait for them
      if (voices.length === 0) {
        console.log('🔊 Waiting for voices to load...');
        synthRef.current.onvoiceschanged = () => {
          const availableVoices = synthRef.current?.getVoices() || [];
          console.log('🔊 Voices loaded:', availableVoices.length);
          selectBestFemaleVoice(utterance, availableVoices);
          // Start speaking after voice is selected
          try {
            synthRef.current?.speak(utterance);
          } catch (error) {
            console.error('❌ Error starting speech after voice load:', error);
            setIsSpeaking(false);
            setStatusMessage('❌ Speech error - Listening...');
          }
        };
        return; // Don't speak yet, wait for voices
      } else {
        selectBestFemaleVoice(utterance, voices);
      }
      
      utterance.onstart = () => {
        console.log('🔊 Speech started');
        setStatusMessage('🔊 AI is speaking...');
      };
      
      utterance.onend = () => {
        console.log('🔊 Speech ended');
        setIsSpeaking(false);
        setStatusMessage('🎤 Listening... Speak now');
        
        // Start listening again after AI finishes speaking
        if (isCallActive) {
          setTimeout(() => {
            if (isCallActive && !isProcessing) {
              try {
                recognitionRef.current?.start();
              } catch (error) {
                setStatusMessage('❌ Error restarting - try speaking again');
              }
            }
          }, 500);
        }
      };
      
      utterance.onerror = (event) => {
        console.error('🔊 Speech error:', event.error);
        setIsSpeaking(false);
        setStatusMessage('🎤 Listening... Speak now');
        
        // Start listening even if speech fails
        if (isCallActive) {
          setTimeout(() => {
            if (isCallActive && !isProcessing) {
              try {
                recognitionRef.current?.start();
              } catch (error) {
                setStatusMessage('❌ Error restarting - try speaking again');
              }
            }
          }, 500);
        }
      };
      
      try {
        synthRef.current.speak(utterance);
        console.log('🔊 Speech queued successfully');
      } catch (error) {
        console.error('❌ Error starting speech:', error);
        setIsSpeaking(false);
        setStatusMessage('❌ Speech error - Listening...');
      }
    } else {
      console.error('❌ Speech synthesis not available');
      setStatusMessage('❌ Speech not available - Listening...');
    }
  };

  const selectBestFemaleVoice = (utterance: SpeechSynthesisUtterance, voices: SpeechSynthesisVoice[]) => {
    console.log('🔊 Selecting voice from', voices.length, 'available voices');
    
    // Priority list for female voices
    const femaleVoiceNames = [
      'Samantha',           // Apple's female voice
      'Victoria',           // Google's female voice
      'Sarah',              // Common female voice
      'Emma',               // Another female voice
      'Google UK English Female',
      'Microsoft Zira',     // Windows female voice
      'Microsoft Eva',      // Windows female voice
      'Hazel',              // Another female voice
      'Female'              // Any voice with "Female" in name
    ];
    
    // Find the best available female voice
    let selectedVoice = null;
    
    for (const voiceName of femaleVoiceNames) {
      selectedVoice = voices.find(voice => 
        voice.lang.includes('en') && 
        voice.name.includes(voiceName)
      );
      if (selectedVoice) {
        console.log('🔊 Found preferred female voice:', selectedVoice.name);
        break;
      }
    }
    
    // If no specific female voice found, find any English female voice
    if (!selectedVoice) {
      selectedVoice = voices.find(voice => 
        voice.lang.includes('en') && 
        (voice.name.toLowerCase().includes('female') || 
         voice.name.toLowerCase().includes('woman') ||
         voice.name.toLowerCase().includes('girl'))
      );
      if (selectedVoice) {
        console.log('🔊 Found generic female voice:', selectedVoice.name);
      }
    }
    
    // Fallback to any English voice
    if (!selectedVoice) {
      selectedVoice = voices.find(voice => voice.lang.includes('en'));
      if (selectedVoice) {
        console.log('🔊 Using fallback English voice:', selectedVoice.name);
      }
    }
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      console.log('🔊 Voice selected:', selectedVoice.name, 'Language:', selectedVoice.lang);
    } else {
      console.warn('⚠️ No suitable voice found, using default');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">AI Speech Assistant</h1>
                <p className="text-green-200 text-sm">Speak and get AI responses</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isCallActive ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`}></div>
              <span className="text-white text-sm">{statusMessage}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Controls */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                <Phone className="w-5 h-5 mr-2" />
                Controls
              </h2>
              
              <div className="space-y-4">
                {!isCallActive ? (
                  <div className="space-y-3">
                    <button
                      onClick={startCall}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                    >
                      <Phone className="w-5 h-5" />
                      <span>Start AI Conversation</span>
                    </button>
                    
                    <button
                      onClick={testVoice}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                    >
                      <Bot className="w-4 h-4" />
                      <span>Test Female Voice</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <button
                      onClick={endCall}
                      className="w-full bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                    >
                      <PhoneOff className="w-5 h-5" />
                      <span>End Conversation</span>
                    </button>
                    
                    <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3">
                      <div className="flex items-center justify-center space-x-2">
                        <Mic className="w-4 h-4 text-green-400 animate-pulse" />
                        <span className="text-green-200 text-sm font-medium">Listening - Speak Now</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Status */}
                <div className="space-y-3 pt-4 border-t border-white/20">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-200">Status:</span>
                    <span className={`font-semibold ${isCallActive ? 'text-green-400' : 'text-gray-400'}`}>
                      {isCallActive ? 'Listening' : 'Stopped'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-200">Processing:</span>
                    <span className={`font-semibold ${isProcessing ? 'text-yellow-400' : 'text-gray-400'}`}>
                      {isProcessing ? 'AI Thinking' : 'Ready'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-200">Speaking:</span>
                    <span className={`font-semibold ${isSpeaking ? 'text-cyan-400' : 'text-gray-400'}`}>
                      {isSpeaking ? 'AI Speaking' : 'Silent'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-200">Messages:</span>
                    <span className="font-semibold text-cyan-400">
                      {messages.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 h-[600px] flex flex-col">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <MessageCircle className="w-5 h-5 mr-2" />
                AI Conversation
              </h2>
              
              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {messages.length === 0 ? (
                  <div className="text-center text-green-200 py-20">
                    <Bot className="w-16 h-16 mx-auto mb-4 text-green-400" />
                    <p className="text-lg font-medium">Ready for AI Conversation</p>
                    <p className="text-sm mt-2">Click "Start AI Conversation" and speak to chat with AI</p>
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                        message.type === 'user'
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                          : 'bg-white/20 text-white border border-white/30'
                      }`}>
                        <div className="flex items-center mb-1">
                          {message.type === 'user' ? (
                            <User className="w-4 h-4 mr-2" />
                          ) : (
                            <Bot className="w-4 h-4 mr-2" />
                          )}
                          <span className="text-xs opacity-75">
                            {message.type === 'user' ? 'You' : 'AI Assistant'}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed">{message.text}</p>
                        <p className="text-xs opacity-60 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Status Bar */}
              <div className="border-t border-white/20 pt-4">
                <div className="flex items-center justify-between text-sm text-blue-200">
                  <span>Status:</span>
                  <span className="font-medium text-white">{statusMessage}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;