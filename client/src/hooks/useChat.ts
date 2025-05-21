import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryGemini, GeminiResponse } from "@/lib/gemini";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id?: number;
  chatId: number;
  content: string;
  isUser: boolean;
  createdAt?: string;
}

interface Chat {
  id: number;
  title: string;
  pdfId: number | null;
  createdAt: string;
}

export function useChat(chatId?: number) {
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch chat details if chatId is provided
  const { 
    data: chat,
    isLoading: isLoadingChat 
  } = useQuery<Chat>({
    queryKey: [chatId ? `/api/chats/${chatId}` : null],
    enabled: !!chatId,
  });

  // Fetch messages for the chat if chatId is provided
  const { 
    data: messages = [],
    isLoading: isLoadingMessages 
  } = useQuery<Message[]>({
    queryKey: [chatId ? `/api/chats/${chatId}/messages` : null],
    enabled: !!chatId,
  });

  // Create a new chat
  const createChatMutation = useMutation({
    mutationFn: async (title: string) => {
      const response = await apiRequest('POST', '/api/chats', {
        title,
        pdfId: null
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/chats'] });
      return data;
    }
  });

  // Add a message to the chat
  const sendMessageMutation = useMutation({
    mutationFn: async (message: { chatId: number, content: string, isUser: boolean }) => {
      const response = await apiRequest('POST', '/api/messages', message);
      return response.json();
    },
    onSuccess: (data) => {
      if (chatId) {
        queryClient.invalidateQueries({ queryKey: [`/api/chats/${chatId}/messages`] });
      }
      return data;
    }
  });

  // Function to send a message and get AI response
  const sendMessage = async (content: string, pdfContent: string): Promise<void> => {
    if (!content.trim() || !chatId) return;

    // Send user message
    try {
      await sendMessageMutation.mutateAsync({
        chatId,
        content,
        isUser: true
      });

      // Get AI response
      setIsLoadingResponse(true);
      const aiResponse: GeminiResponse = await queryGemini(pdfContent, content);

      // Save AI response
      await sendMessageMutation.mutateAsync({
        chatId,
        content: aiResponse.response,
        isUser: false
      });
    } catch (error) {
      console.error('Error in chat interaction:', error);
      toast({
        title: "Chat error",
        description: "Failed to process your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingResponse(false);
    }
  };

  // Create a new chat
  const createChat = async (title: string): Promise<number> => {
    try {
      const newChat = await createChatMutation.mutateAsync(title);
      return newChat.id;
    } catch (error) {
      console.error('Failed to create chat:', error);
      toast({
        title: "Chat creation failed",
        description: "Failed to create a new chat. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    chat,
    messages,
    isLoadingChat,
    isLoadingMessages,
    isLoadingResponse,
    sendMessage,
    createChat
  };
}
