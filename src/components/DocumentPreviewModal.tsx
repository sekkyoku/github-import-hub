import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";

interface DocumentPreviewModalProps {
  docId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const DocumentPreviewModal = ({ docId, isOpen, onClose }: DocumentPreviewModalProps) => {
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (docId && isOpen) {
      setIsLoading(true);
      setError(null);
      
      api.getDocumentPreview(docId)
        .then((response) => {
          setContent(response.content);
        })
        .catch((err) => {
          setError(err.message);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [docId, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Document Preview</DialogTitle>
        </DialogHeader>
        
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <div className="text-destructive text-sm py-4">
            Failed to load preview: {error}
          </div>
        )}

        {!isLoading && !error && content && (
          <div className="prose prose-sm max-w-none py-4">
            <pre className="whitespace-pre-wrap text-sm">{content}</pre>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DocumentPreviewModal;
