import { useState } from "react";
import { ChevronDown, ChevronUp, FileText, Copy, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import DocumentPreviewModal from "./DocumentPreviewModal";

interface Source {
  id: string;
  title: string;
  snippet: string;
  file_path?: string;
}

interface SourcesDisplayProps {
  sources: Source[];
}

const SourcesDisplay = ({ sources }: SourcesDisplayProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [previewDocId, setPreviewDocId] = useState<string | null>(null);
  const { toast } = useToast();

  if (!sources || sources.length === 0) return null;

  const copyCitation = (source: Source) => {
    const citation = `${source.title}\n${source.snippet}`;
    navigator.clipboard.writeText(citation);
    toast({
      title: "Citation copied",
      description: "Source citation copied to clipboard",
    });
  };

  return (
    <>
      <div className="mt-4 border border-border rounded-lg overflow-hidden bg-muted/30">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <FileText className="h-4 w-4" />
            <span>Sources ({sources.length})</span>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>

        {isExpanded && (
          <div className="px-4 pb-4 space-y-3">
            {sources.map((source) => (
              <Card key={source.id} className="p-4 bg-card">
                <h4 className="font-medium text-sm text-foreground mb-2">{source.title}</h4>
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{source.snippet}</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPreviewDocId(source.id)}
                    className="text-xs"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Preview
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyCitation(source)}
                    className="text-xs"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <DocumentPreviewModal
        docId={previewDocId}
        isOpen={previewDocId !== null}
        onClose={() => setPreviewDocId(null)}
      />
    </>
  );
};

export default SourcesDisplay;
