import { useState, useEffect, useRef } from "react";
import { PDFUpload } from "./PDFUpload";
import { PDFPreview } from "./PDFPreview";
import { queryGemini } from "@/lib/gemini";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { getInitials } from "@/lib/utils";
import { User } from "@/lib/supabase";

interface Message {
  id?: number;
  content: string;
  isUser: boolean;
  createdAt?: string;
}

interface ChatAreaProps {
  user: User | null;
}

export function ChatArea({ user }: ChatAreaProps) {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfContent, setPdfContent] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [chatId, setChatId] = useState<number | null>(null);
  const [inputMessage, setInputMessage] = useState<string>("");
  
  const chatMessagesRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Scroll to bottom of chat messages when messages change
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [messages]);

  // Create a new chat when a PDF is uploaded
  const createChatMutation = useMutation({
    mutationFn: async (title: string) => {
      const response = await apiRequest('POST', '/api/chats', {
        title,
        pdfId: null // We'll update this when we have PDF support
      });
      return response.json();
    },
    onSuccess: (data) => {
      setChatId(data.id);
      queryClient.invalidateQueries({ queryKey: ['/api/chats'] });
      toast({
        title: "Chat created",
        description: "Your new chat has been created.",
      });
    },
    onError: (error) => {
      console.error('Failed to create chat:', error);
      toast({
        title: "Chat creation failed",
        description: "Failed to create a new chat. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Add a message to the chat
  const sendMessageMutation = useMutation({
    mutationFn: async (message: { chatId: number, content: string, isUser: boolean }) => {
      const response = await apiRequest('POST', '/api/messages', message);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/chats/${chatId}/messages`] });
    },
    onError: (error) => {
      console.error('Failed to send message:', error);
      toast({
        title: "Message failed",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleFileUpload = (file: File, content: string) => {
    setPdfFile(file);
    setPdfContent(content);
    
    // Create a new chat with the PDF filename as the title
    if (file && !chatId) {
      createChatMutation.mutate(file.name);
    }
  };

  const handleRemovePdf = () => {
    setPdfFile(null);
    setPdfContent("");
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    if (!pdfFile) {
      toast({
        title: "No PDF uploaded",
        description: "Please upload a PDF document first to start chatting.",
        variant: "destructive",
      });
      return;
    }
    
    const userMessage: Message = {
      content: inputMessage,
      isUser: true,
      createdAt: new Date().toISOString()
    };
    
    // Add user message to UI
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    
    // Save user message to database if we have a chat ID
    if (chatId) {
      sendMessageMutation.mutate({
        chatId,
        content: inputMessage,
        isUser: true
      });
    }
    
    // Show loading indicator
    setIsLoading(true);
    
    try {
      // Query Gemini API
      const response = await queryGemini(pdfContent, inputMessage);
      
      // Add AI response to UI
      const aiMessage: Message = {
        content: response.response,
        isUser: false,
        createdAt: new Date().toISOString()
      };
      
      setMessages((prev) => [...prev, aiMessage]);
      
      // Save AI message to database if we have a chat ID
      if (chatId) {
        sendMessageMutation.mutate({
          chatId,
          content: response.response,
          isUser: false
        });
      }
    } catch (error) {
      console.error('Failed to get AI response:', error);
      toast({
        title: "AI response failed",
        description: "Failed to get a response from the AI. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatSubmit = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
      <div className="chat-container py-6 px-4 sm:px-6 lg:px-8 flex flex-col">
        
        {/* PDF Upload Section */}
        {!pdfFile && (
          <PDFUpload onFileUpload={handleFileUpload} />
        )}
        
        {/* PDF Preview Section */}
        {pdfFile && (
          <PDFPreview file={pdfFile} onRemove={handleRemovePdf} />
        )}
        
        {/* Chat Messages Area */}
        <div ref={chatMessagesRef} className="chat-messages flex-1 overflow-y-auto space-y-6 pb-6">
          {/* Welcome Message */}
          {messages.length === 0 && (
            <div className="max-w-3xl mx-auto">
              <div className="flex items-end">
                <div className="flex flex-col space-y-2 text-sm max-w-lg mx-2 order-2 items-start">
                  <div className="px-4 py-3 rounded-lg inline-block bg-primary-100 text-gray-800">
                    <p>👋 Hello! I'm your PDF chat assistant powered by Gemini AI. Upload a PDF document and I'll help you understand its contents.</p>
                  </div>
                </div>
                <svg className="w-6 h-6 text-primary-600 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 3H3V9H9V3Z" fill="currentColor" />
                  <path d="M21 3H15V9H21V3Z" fill="currentColor" />
                  <path d="M21 15H15V21H21V15Z" fill="currentColor" />
                  <path d="M9 15H3V21H9V15Z" fill="currentColor" />
                  <path d="M12 3L12 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          )}
          
          {/* Chat Messages */}
          {messages.map((message, index) => (
            <div key={index} className="max-w-3xl mx-auto">
              {message.isUser ? (
                <div className="flex items-end justify-end">
                  <div className="flex flex-col space-y-2 text-sm max-w-lg mx-2 order-1 items-end">
                    <div className="px-4 py-3 rounded-lg inline-block bg-primary-600 text-white">
                      <p>{message.content}</p>
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-full order-2 bg-primary-200 flex items-center justify-center">
                    <span className="text-xs font-semibold text-primary-700">
                      {user ? getInitials(user.name) : 'U'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-end">
                  <div className="flex flex-col space-y-2 text-sm max-w-lg mx-2 order-2 items-start">
                    <div className="px-4 py-3 rounded-lg inline-block bg-gray-100 text-gray-800">
                      <p>{message.content}</p>
                    </div>
                  </div>
                  <svg className="w-6 h-6 text-primary-600 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 3H3V9H9V3Z" fill="currentColor" />
                    <path d="M21 3H15V9H21V3Z" fill="currentColor" />
                    <path d="M21 15H15V21H21V15Z" fill="currentColor" />
                    <path d="M9 15H3V21H9V15Z" fill="currentColor" />
                    <path d="M12 3L12 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
              )}
            </div>
          ))}
          
          {/* Loading Indicator */}
          {isLoading && (
            <div className="max-w-3xl mx-auto">
              <div className="flex items-end">
                <div className="flex flex-col space-y-2 text-sm max-w-lg mx-2 order-2 items-start">
                  <div className="px-4 py-3 rounded-lg inline-block bg-gray-100 text-gray-800">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                    </div>
                  </div>
                </div>
                <svg className="w-6 h-6 text-primary-600 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 3H3V9H9V3Z" fill="currentColor" />
                  <path d="M21 3H15V9H21V3Z" fill="currentColor" />
                  <path d="M21 15H15V21H21V15Z" fill="currentColor" />
                  <path d="M9 15H3V21H9V15Z" fill="currentColor" />
                  <path d="M12 3L12 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          )}
        </div>
        
        {/* Chat Input Area */}
        <div className="mt-auto max-w-3xl mx-auto w-full">
          <div className="flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2">
            <textarea
              rows={1}
              className="block w-full resize-none border-0 bg-transparent p-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
              placeholder="Ask a question about your PDF..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleChatSubmit}
            ></textarea>
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-primary-500 hover:bg-primary-50"
              onClick={sendMessage}
            >
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          <p className="mt-2 text-xs text-center text-gray-500">
            Powered by Gemini AI. Your conversations are stored to improve the service.
          </p>
        </div>
      </div>
    </div>
  );
}
