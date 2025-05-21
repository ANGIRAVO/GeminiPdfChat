import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { truncateText } from "@/lib/utils";

interface PDFPreviewProps {
  file: File;
  onRemove: () => void;
}

export function PDFPreview({ file, onRemove }: PDFPreviewProps) {
  const fileName = file ? file.name : '';
  
  return (
    <div className="mb-8">
      <Card className="max-w-3xl mx-auto">
        <CardContent className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"></path>
              </svg>
              <span className="truncate max-w-[calc(100%-3rem)]" title={fileName}>
                {truncateText(fileName, 40)}
              </span>
            </h3>
            <Button 
              type="button" 
              variant="ghost" 
              size="icon"
              className="h-8 w-8 p-0"
              onClick={onRemove}
              aria-label="Remove PDF"
            >
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            <p>Your PDF has been processed and is ready for chat.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
