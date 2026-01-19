import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Menu, 
  Settings, 
  MessageSquare, 
  Bot, 
  Image as ImageIcon, 
  FileText, 
  Video, 
  X, 
  Send, 
  Loader2,
  RefreshCw,
  Cpu
} from 'lucide-react';
import { OllamaService } from './services/ollamaService';
import { extractVideoFrames, fileToBase64, readFileContent } from './utils/mediaProcessing';
import { ChatMessage, Model, Attachment } from './types';
import ReactMarkdown from 'react-markdown';

// --- Components ---

const Sidebar = ({ 
  isOpen, 
  toggle, 
  models, 
  selectedModel, 
  onSelectModel, 
  systemPrompt, 
  setSystemPrompt,
  refreshModels,
  isLoadingModels
}: {
  isOpen: boolean;
  toggle: () => void;
  models: Model[];
  selectedModel: string;
  onSelectModel: (m: string) => void;
  systemPrompt: string;
  setSystemPrompt: (s: string) => void;
  refreshModels: () => void;
  isLoadingModels: boolean;
}) => {
  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-surface border-r border-border transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 flex flex-col`}>
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center space-x-2 text-primary font-bold text-xl">
          <Bot size={24} />
          <span>Ollama UI</span>
        </div>
        <button onClick={toggle} className="md:hidden text-muted hover:text-white">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Model Selection */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm font-medium text-muted">
            <span>Model</span>
            <button onClick={refreshModels} className="hover:text-primary transition-colors" title="Refresh Models">
              <RefreshCw size={14} className={isLoadingModels ? 'animate-spin' : ''} />
            </button>
          </div>
          {models.length === 0 ? (
            <div className="text-sm text-red-400 border border-red-900/50 bg-red-900/10 p-2 rounded">
              No models found. ensure Ollama is running.
            </div>
          ) : (
            <div className="grid gap-2">
              {models.map((model) => (
                <button
                  key={model.name}
                  onClick={() => onSelectModel(model.name)}
                  className={`flex items-center space-x-2 w-full p-2 rounded text-left text-sm transition-colors ${selectedModel === model.name ? 'bg-primary/20 text-primary border border-primary/50' : 'hover:bg-secondary text-gray-300'}`}
                >
                  <Cpu size={16} />
                  <span className="truncate" title={model.name}>{model.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* System Prompt */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted flex items-center gap-2">
            <Settings size={14} /> System Prompt
          </label>
          <textarea
            className="w-full bg-background border border-border rounded-lg p-3 text-xs text-gray-300 focus:outline-none focus:border-primary resize-none h-32"
            placeholder="You are a helpful assistant..."
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
          />
        </div>
      </div>

      <div className="p-4 border-t border-border text-xs text-muted">
        <p>Ensure Ollama is running at localhost:11434 with CORS enabled.</p>
      </div>
    </div>
  );
};

const ChatArea = ({
  messages,
  isGenerating,
  messagesEndRef
}: {
  messages: ChatMessage[];
  isGenerating: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth">
      {messages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-muted space-y-4 opacity-50">
          <Bot size={64} />
          <p className="text-lg">Select a model and start chatting</p>
        </div>
      ) : (
        messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] md:max-w-[70%] space-y-2 ${msg.role === 'user' ? 'items-end flex flex-col' : 'items-start flex flex-col'}`}>
              
              <div className={`p-4 rounded-2xl shadow-sm ${msg.role === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-surface border border-border text-gray-200 rounded-bl-none'}`}>
                
                {/* Images/Attachments Grid */}
                {msg.images && msg.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                    {msg.images.map((img, i) => (
                      <div key={i} className="relative group rounded overflow-hidden aspect-video bg-black/50 border border-white/10">
                         <img src={`data:image/jpeg;base64,${img}`} alt="attachment" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Text Content */}
                <div className="prose prose-invert prose-sm max-w-none break-words">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
              
              <span className="text-[10px] text-muted opacity-50 uppercase tracking-wider">{msg.role}</span>
            </div>
          </div>
        ))
      )}
      {isGenerating && (
         <div className="flex justify-start">
           <div className="bg-surface border border-border p-4 rounded-2xl rounded-bl-none flex items-center space-x-2">
             <Loader2 size={16} className="animate-spin text-primary" />
             <span className="text-xs text-muted">Thinking...</span>
           </div>
         </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [input, setInput] = useState('');
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState('You are a helpful AI assistant.');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  // Fetch Models
  const fetchModels = useCallback(async () => {
    setIsLoadingModels(true);
    try {
      const availableModels = await OllamaService.getTags();
      setModels(availableModels);
      if (availableModels.length > 0 && !selectedModel) {
        setSelectedModel(availableModels[0].name);
      }
    } catch (error) {
      console.error("Failed to fetch models", error);
    } finally {
      setIsLoadingModels(false);
    }
  }, [selectedModel]);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  // Handle Input Submit
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!input.trim() && attachments.length === 0) || !selectedModel || isGenerating) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      images: attachments.map(a => a.base64)
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setAttachments([]);
    setIsGenerating(true);

    try {
      // Build context from history
      const history = messages.map(m => ({
        role: m.role,
        content: m.content,
        images: m.images
      }));

      // Add system prompt if exists (as first message usually, or handled by API wrapper)
      const fullMessages = [
        { role: 'system', content: systemPrompt },
        ...history,
        userMessage
      ];

      // Stream response
      let botContent = '';
      await OllamaService.chatStream(
        selectedModel,
        fullMessages,
        (chunk) => {
          botContent += chunk;
          setMessages(prev => {
            const last = prev[prev.length - 1];
            if (last.role === 'assistant') {
              return [...prev.slice(0, -1), { ...last, content: botContent }];
            } else {
              return [...prev, { role: 'assistant', content: botContent }];
            }
          });
        }
      );
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: '**Error:** Failed to communicate with Ollama. Make sure it is running and CORS is allowed.' }]);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files: File[] = Array.from(e.target.files);
    
    for (const file of files) {
      try {
        if (file.type.startsWith('image/')) {
          const base64 = await fileToBase64(file);
          setAttachments(prev => [...prev, { type: 'image', base64, name: file.name }]);
        } else if (file.type.startsWith('video/')) {
          // Extract frames
          const frames = await extractVideoFrames(file, 5); // Extract 5 frames
          frames.forEach((frame, idx) => {
             setAttachments(prev => [...prev, { type: 'image', base64: frame, name: `${file.name}-frame-${idx}` }]);
          });
        } else if (file.type === 'text/plain' || file.name.endsWith('.md') || file.name.endsWith('.txt')) {
            // Text Document "RAG" (Simplified: Paste content into prompt)
            const text = await readFileContent(file);
            setInput(prev => prev + `\n\n--- Content of ${file.name} ---\n${text}\n---\n`);
        } else {
           // Fallback for unknown types (treat as text if possible or alert)
           alert(`File type ${file.type} not fully supported yet.`);
        }
      } catch (err) {
        console.error("File processing failed", err);
      }
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex h-screen bg-background text-gray-100 font-sans overflow-hidden">
      <Sidebar 
        isOpen={isSidebarOpen} 
        toggle={() => setIsSidebarOpen(false)}
        models={models}
        selectedModel={selectedModel}
        onSelectModel={setSelectedModel}
        systemPrompt={systemPrompt}
        setSystemPrompt={setSystemPrompt}
        refreshModels={fetchModels}
        isLoadingModels={isLoadingModels}
      />

      <div className="flex-1 flex flex-col h-full relative w-full">
        {/* Mobile Header */}
        <div className="md:hidden p-4 border-b border-border flex items-center justify-between bg-surface/50 backdrop-blur">
          <button onClick={() => setIsSidebarOpen(true)} className="text-gray-300">
            <Menu size={24} />
          </button>
          <span className="font-semibold text-sm truncate max-w-[200px]">{selectedModel || 'Select Model'}</span>
          <div className="w-6" /> {/* Spacer */}
        </div>

        {/* Chat Area */}
        <ChatArea 
          messages={messages} 
          isGenerating={isGenerating} 
          messagesEndRef={messagesEndRef} 
        />

        {/* Input Area */}
        <div className="p-4 bg-background border-t border-border">
          <div className="max-w-4xl mx-auto w-full flex flex-col gap-3">
            
            {/* Attachments Preview */}
            {attachments.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {attachments.map((att, i) => (
                  <div key={i} className="relative flex-shrink-0 group">
                    <div className="w-16 h-16 rounded-lg border border-border overflow-hidden bg-secondary relative">
                        <img src={`data:image/jpeg;base64,${att.base64}`} className="w-full h-full object-cover" alt="preview" />
                    </div>
                    <button 
                      onClick={() => removeAttachment(i)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Input Bar */}
            <form onSubmit={handleSubmit} className="flex gap-2 items-end bg-surface p-2 rounded-xl border border-border focus-within:border-primary/50 transition-colors shadow-lg">
              <input 
                type="file" 
                multiple 
                ref={fileInputRef}
                className="hidden" 
                onChange={handleFileUpload}
                accept="image/*,video/*,.txt,.md"
              />
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-muted hover:text-primary transition-colors hover:bg-white/5 rounded-lg"
                title="Upload Image, Video, or Text File"
              >
                <ImageIcon size={20} />
              </button>
              
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                placeholder="Message Ollama..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm max-h-32 min-h-[44px] py-3 resize-none"
                rows={1}
              />
              
              <button 
                type="submit" 
                disabled={(!input.trim() && attachments.length === 0) || isGenerating}
                className={`p-2 rounded-lg transition-all ${(!input.trim() && attachments.length === 0) || isGenerating ? 'bg-secondary text-muted cursor-not-allowed' : 'bg-primary text-white hover:bg-blue-600 shadow-md hover:shadow-blue-500/20'}`}
              >
                {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
              </button>
            </form>
            <div className="text-[10px] text-center text-muted">
              Supports Images, Video (Frame Extraction), & .txt/.md files.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}