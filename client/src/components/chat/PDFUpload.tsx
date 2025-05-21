import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { uploadPDF } from "@/lib/pdf";
import { useToast } from "@/hooks/use-toast";

interface PDFUploadProps {
  onFileUpload: (file: File, content: string) => void;
}

export function PDFUpload({ onFileUpload }: PDFUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf') {
        await processPDF(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF document.",
          variant: "destructive",
        });
      }
    }
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf') {
        await processPDF(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF document.",
          variant: "destructive",
        });
      }
    }
  };
  
  const processPDF = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) { // 10MB
      toast({
        title: "File too large",
        description: "Please upload a PDF smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    try {
      const content = await uploadPDF(file);
      onFileUpload(file, content);
    } catch (error) {
      console.error('PDF upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to process the PDF document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <div className="mb-8">
      <Card className="max-w-3xl mx-auto">
        <CardContent className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Upload a PDF Document
          </h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>Upload your PDF document to chat about its contents using the Gemini AI.</p>
          </div>
          <div className="mt-5">
            <div 
              className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${
                isDragging ? 'border-primary-300 bg-primary-50' : 'border-gray-300'
              } border-dashed rounded-md`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="space-y-1 text-center">
                {isUploading ? (
                  <div className="mx-auto h-12 w-12 text-gray-400 flex items-center justify-center">
                    <svg className="animate-spin h-8 w-8 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                ) : (
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none">
                    <span>Upload a file</span>
                    <input 
                      id="file-upload" 
                      name="file-upload" 
                      type="file" 
                      className="sr-only" 
                      accept=".pdf"
                      onChange={handleFileChange}
                      disabled={isUploading}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  PDF up to 10MB
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
