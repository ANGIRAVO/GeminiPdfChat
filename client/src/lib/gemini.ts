import { apiRequest } from "@/lib/queryClient";

export type GeminiResponse = {
  response: string;
};

export async function queryGemini(pdfContent: string, message: string): Promise<GeminiResponse> {
  const response = await apiRequest('POST', '/api/gemini', {
    pdfContent,
    message
  });
  
  return response.json();
}
