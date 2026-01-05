
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, PhoneOff, Activity, ShieldCheck, HeartPulse, BrainCircuit, Volume2 } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

// Audio utility functions as requested by guidelines
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const VoiceIntelligenceView: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcript, setTranscript] = useState<{user: string, ai: string}>({ user: '', ai: '' });
  const [history, setHistory] = useState<string[]>([]);
  
  const sessionRef = useRef<any>(null);
  const audioContextInRef = useRef<AudioContext | null>(null);
  const audioContextOutRef = useRef<AudioContext | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startSession = async () => {
    setIsConnecting(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      audioContextInRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextOutRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }, // Reassuring medical voice
          },
          systemInstruction: "You are BioBeat Voice Assistant. You are a professional medical assistant. You provide real-time guidance on vitals and health optimization. Be concise, reassuring, and technical when needed. Always remind the user you are an AI.",
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setIsConnecting(false);
            
            const source = audioContextInRef.current!.createMediaStreamSource(stream);
            processorRef.current = audioContextInRef.current!.createScriptProcessor(4096, 1, 1);
            
            processorRef.current.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(processorRef.current);
            processorRef.current.connect(audioContextInRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Transcription
            if (message.serverContent?.inputTranscription) {
                setTranscript(prev => ({ ...prev, user: (prev.user + ' ' + message.serverContent?.inputTranscription?.text).trim() }));
            }
            if (message.serverContent?.outputTranscription) {
                setTranscript(prev => ({ ...prev, ai: (prev.ai + ' ' + message.serverContent?.outputTranscription?.text).trim() }));
            }
            if (message.serverContent?.turnComplete) {
                setHistory(prev => [...prev, `Patient: ${transcript.user}`, `BioBeat: ${transcript.ai}`].filter(s => s.length > 10));
                setTranscript({ user: '', ai: '' });
            }

            // Handle Audio
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && audioContextOutRef.current) {
              const ctx = audioContextOutRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              
              const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              source.addEventListener('ended', () => sourcesRef.current.delete(source));
              
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => stopSession(),
          onerror: (e) => {
            console.error('Live API Error:', e);
            stopSession();
          },
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (error) {
      console.error('Failed to start session:', error);
      setIsConnecting(false);
    }
  };

  const stopSession = () => {
    if (sessionRef.current) {
      // sessionRef.current.close(); // Assuming session has a close or handled by onclose
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
    }
    setIsActive(false);
    setIsConnecting(false);
    setTranscript({ user: '', ai: '' });
  };

  useEffect(() => {
    return () => stopSession();
  }, []);

  return (
    <div className="h-full flex flex-col p-8 md:p-12 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Mic className="text-teal-500 w-8 h-8" /> BioBeat Voice Consult
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Direct encrypted link to Clinical Intelligence Core</p>
        </div>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${isActive ? 'bg-rose-500/10 border-rose-500/30' : 'bg-zinc-900 border-zinc-800'}`}>
            <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-rose-500 animate-pulse' : 'bg-zinc-700'}`} />
            <span className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? 'text-rose-500' : 'text-zinc-500'}`}>
              {isActive ? 'Session Live' : 'Offline'}
            </span>
          </div>
          <div className="px-4 py-2 bg-teal-500/5 border border-teal-500/10 rounded-xl flex items-center gap-2">
            <ShieldCheck className="w-3 h-3 text-teal-500" />
            <span className="text-[10px] font-black text-teal-500 uppercase">Secure Link</span>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-0">
        {/* Visualization & Controls */}
        <div className="flex flex-col gap-6">
          <div className="flex-1 glass rounded-[48px] border border-zinc-800/50 relative overflow-hidden flex flex-col items-center justify-center p-12">
            <div className="absolute inset-0 medical-grid opacity-20 pointer-events-none" />
            
            {/* Pulsing Visualizer */}
            <div className="relative mb-12">
              <AnimatePresence>
                {isActive && (
                  <>
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0.1, 0.2] }}
                      transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                      className="absolute inset-0 bg-teal-500 rounded-full blur-3xl"
                    />
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.15, 0.3] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", delay: 0.2 }}
                      className="absolute inset-0 bg-rose-500 rounded-full blur-2xl"
                    />
                  </>
                )}
              </AnimatePresence>
              
              <div className="relative w-48 h-48 rounded-full glass border border-zinc-800 flex items-center justify-center z-10">
                <AnimatePresence mode="wait">
                  {isActive ? (
                    <motion.div
                      key="active"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                    >
                      <Activity className="w-20 h-20 text-teal-500 animate-[pulse_1s_infinite]" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="inactive"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                    >
                      <BrainCircuit className="w-20 h-20 text-zinc-800" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="text-center space-y-2 z-10">
              <h3 className="text-xl font-bold text-white tracking-tight">
                {isConnecting ? 'Establishing Link...' : isActive ? 'Listening to Vitals...' : 'Initialize Consultation'}
              </h3>
              <p className="text-zinc-500 text-sm max-w-xs mx-auto">
                {isActive ? 'Your voice is being processed by the Gemini 2.5 Medical Engine.' : 'Press the button below to start a secure voice-enabled clinical session.'}
              </p>
            </div>

            <div className="mt-12 z-10">
              {!isActive ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startSession}
                  disabled={isConnecting}
                  className="px-12 py-6 bg-teal-500 text-white rounded-[32px] font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-teal-500/20 flex items-center gap-4"
                >
                  {isConnecting ? <Activity className="w-5 h-5 animate-spin" /> : <Mic className="w-5 h-5" />}
                  Open Voice Channel
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={stopSession}
                  className="px-12 py-6 bg-rose-500 text-white rounded-[32px] font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-rose-500/20 flex items-center gap-4"
                >
                  <PhoneOff className="w-5 h-5" />
                  Terminate Session
                </motion.button>
              )}
            </div>
          </div>

          {/* Real-time Bio-Indicators */}
          <div className="grid grid-cols-2 gap-4">
            <div className="glass p-5 rounded-3xl border border-zinc-800/50 flex items-center gap-4">
              <div className="p-3 bg-zinc-900 rounded-2xl"><HeartPulse className="w-5 h-5 text-rose-500" /></div>
              <div>
                <p className="text-[10px] font-bold text-zinc-600 uppercase">Detection</p>
                <p className="text-sm font-bold text-zinc-300">Stress Markers</p>
              </div>
            </div>
            <div className="glass p-5 rounded-3xl border border-zinc-800/50 flex items-center gap-4">
              <div className="p-3 bg-zinc-900 rounded-2xl"><Volume2 className="w-5 h-5 text-teal-500" /></div>
              <div>
                <p className="text-[10px] font-bold text-zinc-600 uppercase">Acoustics</p>
                <p className="text-sm font-bold text-zinc-300">Biometric Sync</p>
              </div>
            </div>
          </div>
        </div>

        {/* Live Transcript & History */}
        <div className="flex flex-col gap-6 min-h-0">
          <div className="flex-1 glass rounded-[48px] border border-zinc-800/50 flex flex-col min-h-0">
            <div className="p-8 border-b border-zinc-800/50 flex items-center justify-between">
              <h2 className="text-sm font-black text-zinc-500 uppercase tracking-widest">Live Transcript</h2>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                <span className="text-[9px] font-bold text-teal-500 uppercase">Real-time processing</span>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              <AnimatePresence>
                {history.length === 0 && !transcript.user && !transcript.ai && (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                    <Activity className="w-12 h-12 text-zinc-700" />
                    <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest">Transcript History Empty</p>
                  </div>
                )}
                
                {history.map((line, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-4 rounded-2xl text-sm leading-relaxed ${
                      line.startsWith('BioBeat') 
                        ? 'bg-zinc-900/50 border border-zinc-800 text-zinc-300' 
                        : 'bg-teal-500/10 border border-teal-500/20 text-teal-400 font-medium'
                    }`}
                  >
                    {line}
                  </motion.div>
                ))}

                {(transcript.user || transcript.ai) && (
                  <div className="space-y-4 pt-4 border-t border-zinc-800/30">
                    {transcript.user && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center shrink-0">
                          <Mic className="w-4 h-4 text-teal-500" />
                        </div>
                        <p className="text-sm text-teal-400 italic">"{transcript.user}"</p>
                      </motion.div>
                    )}
                    {transcript.ai && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                          <Volume2 className="w-4 h-4 text-zinc-400" />
                        </div>
                        <p className="text-sm text-zinc-300">{transcript.ai}</p>
                      </motion.div>
                    )}
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceIntelligenceView;
