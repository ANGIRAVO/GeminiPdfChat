import { apiRequest } from "@/lib/queryClient";

export type PDF = {
  id: number;
  name: string;
  content: string;
  createdAt: string;
  userId: number;
};

// Function to upload and parse PDF
export async function uploadPDF(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        
        // Send the file to the server for parsing
        // Since we cannot use pdf-parse in the browser directly
        const formData = new FormData();
        formData.append('file', file);
        
        // We'll simulate parsing for now since we don't have a direct PDF parsing endpoint
        // In a real implementation, this would call an API endpoint to parse the PDF
        
        // Simulate PDF text extraction
        const pdfText = `This is the simulated text content from the PDF file: ${file.name}.
        In a real implementation, this would be the actual text extracted from the PDF document using a library like pdf-parse or pdfjs-dist on the server side.`;
        
        resolve(pdfText);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsArrayBuffer(file);
  });
}

// Function to save PDF to database
export async function savePDF(name: string, content: string): Promise<PDF> {
  const response = await apiRequest('POST', '/api/pdfs', {
    name,
    content
  });
  
  return response.json();
}

// Function to get all PDFs for current user
export async function getUserPDFs(): Promise<PDF[]> {
  const response = await apiRequest('GET', '/api/pdfs', undefined);
  return response.json();
}
