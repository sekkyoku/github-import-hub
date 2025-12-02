import { useState, forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Mic, Volume2, Square } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  isListening?: boolean;
  onToggleMic?: () => void;
  isSpeechEnabled?: boolean;
  onToggleSpeech?: () => void;
  micSupported?: boolean;
  speechSupported?: boolean;
  onStopGenerating?: () => void;
}

const ChatInput = forwardRef<HTMLTextAreaElement, ChatInputProps>(({
  onSend, 
  isLoading,
  isListening = false,
  onToggleMic,
  isSpeechEnabled = false,
  onToggleSpeech,
  micSupported = false,
  speechSupported = false,
  onStopGenerating,
}, ref) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSend(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 items-end bg-white rounded-2xl border border-border p-3 shadow-sm">
      <Textarea
        ref={ref}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask about reports, CPMs, or campaigns..."
        className="min-h-[50px] max-h-[150px] resize-none bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
        disabled={isLoading}
      />

      <div className="flex gap-2 items-center">
        {micSupported && onToggleMic && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onToggleMic}
            className={cn(
              "h-10 w-10 shrink-0",
              isListening && "text-streamvision-coral animate-pulse"
            )}
            disabled={isLoading}
          >
            <Mic className="h-5 w-5" />
          </Button>
        )}

        {speechSupported && onToggleSpeech && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onToggleSpeech}
            className={cn(
              "h-10 w-10 shrink-0",
              isSpeechEnabled ? "text-streamvision-coral" : "text-muted-foreground"
            )}
            disabled={isLoading}
            title="Toggle Visionary's Voice"
          >
            <Volume2 className="h-5 w-5" />
          </Button>
        )}

        {isLoading ? (
          <Button 
            type="button"
            onClick={onStopGenerating}
            className="h-10 px-6 bg-streamvision-coral hover:bg-streamvision-coral/90 text-white transition-colors rounded-lg"
          >
            <Square className="h-5 w-5" fill="currentColor" />
          </Button>
        ) : (
          <Button 
            type="submit" 
            disabled={!message.trim()}
            className="h-10 px-6 bg-streamvision-coral hover:bg-streamvision-coral/90 text-white transition-colors rounded-lg"
          >
            <Send className="h-5 w-5" />
          </Button>
        )}
      </div>
    </form>
  );
});

ChatInput.displayName = "ChatInput";

export default ChatInput;
