import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Check, X } from "lucide-react";
import SourcesDisplay from "./SourcesDisplay";
import KeywordChips from "./KeywordChips";

interface Source {
  id: string;
  title: string;
  snippet: string;
  file_path?: string;
}

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
  sources?: Source[];
  matchedKeywords?: string[];
  router?: string;
  onKeywordClick?: (keyword: string) => void;
  onEdit?: () => void;
  isEditing?: boolean;
  editingContent?: string;
  onEditContentChange?: (content: string) => void;
  onSaveEdit?: () => void;
  onCancelEdit?: () => void;
}

const ChatMessage = ({ 
  role, 
  content, 
  timestamp, 
  sources,
  matchedKeywords,
  router,
  onKeywordClick,
  onEdit,
  isEditing,
  editingContent,
  onEditContentChange,
  onSaveEdit,
  onCancelEdit
}: ChatMessageProps) => {
  const isUser = role === "user";

  return (
    <div className={cn(
      "flex w-full gap-4 animate-in fade-in-50 slide-in-from-bottom-2 duration-300",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "min-w-0 max-w-[85%] rounded-2xl px-6 py-4 relative group",
        isUser 
          ? "bg-white border border-border text-foreground shadow-md" 
          : "bg-streamvision-coral text-white shadow-md"
      )}>
        {isEditing && isUser ? (
          <div className="space-y-3">
            <Textarea
              value={editingContent}
              onChange={(e) => onEditContentChange?.(e.target.value)}
              className="min-h-[100px] resize-none border-border focus-visible:ring-streamvision-coral"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={onCancelEdit}
                className="gap-1"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={onSaveEdit}
                className="gap-1 bg-streamvision-coral hover:bg-streamvision-coral/90 text-white"
              >
                <Check className="h-4 w-4" />
                Save & Submit
              </Button>
            </div>
          </div>
        ) : (
          <>
            {isUser && onEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onEdit}
                className="absolute -bottom-8 right-0 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 hover:bg-streamvision-light hover:text-streamvision-coral"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            )}
            <div className={cn(
              "text-base leading-relaxed prose prose-base max-w-none break-words",
              isUser 
                ? "[&_*]:!text-black" 
                : "[&_*]:!text-white [&_strong]:!text-white [&_a]:!text-white [&_a]:underline"
            )}>
              <ReactMarkdown 
                remarkPlugins={[remarkMath]} 
                rehypePlugins={[rehypeKatex]}
              >
                {content}
              </ReactMarkdown>
            </div>
          </>
        )}

        {router && (
          <div className="mt-3">
            <p className="text-xs italic opacity-70">
              Matched via {router}
            </p>
          </div>
        )}

        {matchedKeywords && matchedKeywords.length > 0 && onKeywordClick && (
          <KeywordChips keywords={matchedKeywords} onKeywordClick={onKeywordClick} />
        )}

        {sources && sources.length > 0 && (
          <SourcesDisplay sources={sources} />
        )}

        {timestamp && (
          <p className={cn("text-xs mt-3 opacity-70", isUser ? "text-black" : "text-white")}>
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
