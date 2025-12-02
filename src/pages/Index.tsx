import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import HomeView from "@/components/HomeView";
import SessionSidebar from "@/components/SessionSidebar";
import FileIngestPasswordDialog from "@/components/FileIngestPasswordDialog";
import { FileUploadDialog } from "@/components/FileUploadDialog";
import { api } from "@/lib/api";
import { sendQueryToN8N } from "@/lib/n8n";
import { useToast } from "@/hooks/use-toast";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { useSessionManager, ChatMessage as ChatMessageType } from "@/hooks/useSessionManager";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import streamvisionLogo from "@/assets/streamvision-logo.png";
import { Settings, Upload, Sparkles, Home, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const SIDEBAR_STORAGE_KEY = "visionary_sidebar_expanded";

const Index = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState<string>("es-ES");
  const [homeDialogOpen, setHomeDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [fileUploadDialogOpen, setFileUploadDialogOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState<boolean>(() => {
    const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    return saved !== "false";
  });
  const [editingMessageIndex, setEditingMessageIndex] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { toast } = useToast();

  const {
    currentSessionId,
    setCurrentSessionId,
    createSession,
    addMessage,
    deleteSession,
    renameSession,
    duplicateSession,
    goHome,
    newChat,
    getCurrentSession,
    getSortedSessions,
  } = useSessionManager();

  // Speech hooks
  const { speak, isEnabled: isSpeechEnabled, toggleEnabled: toggleSpeech, isSupported: speechSupported } = useSpeechSynthesis();
  const { 
    isListening, 
    toggleListening,
    isSupported: micSupported 
  } = useSpeechRecognition({
    onResult: (transcript) => {
      handleSendMessage(transcript);
    },
    language,
  });

  const handleHomeClick = () => {
    const currentSession = getCurrentSession();
    if (currentSession && currentSession.messages.length > 0) {
      setHomeDialogOpen(true);
    } else {
      goHome();
    }
  };

  const handleHomeConfirm = () => {
    setHomeDialogOpen(false);
    goHome();
  };

  const handleSelectSession = (id: string) => {
    setCurrentSessionId(id);
    navigate(`/chat/${id}`);
  };

  const handleStopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  };

  const handleStartChat = async (initialPrompt?: string) => {
    const id = crypto.randomUUID();
    createSession(id, initialPrompt);
    
    if (initialPrompt) {
      // Send the message directly with the new session ID
      const userMessage: ChatMessageType = {
        role: "user",
        content: initialPrompt,
        timestamp: new Date(),
      };

      addMessage(id, userMessage);
      setIsLoading(true);
      abortControllerRef.current = new AbortController();

      try {
        const answer = await sendQueryToN8N(
          initialPrompt, 
          [{ role: "user", content: initialPrompt, timestamp: userMessage.timestamp }],
          abortControllerRef.current.signal
        );
        
        const assistantMessage: ChatMessageType = {
          role: "assistant",
          content: answer,
          timestamp: new Date(),
        };

        addMessage(id, assistantMessage);

        if (isSpeechEnabled && answer) {
          speak(answer, language);
        }
      } catch (error) {
        console.error("Error sending message:", error);
        if (error instanceof Error && error.message !== 'Request cancelled') {
          toast({
            title: "Error",
            description: error.message || "Failed to send message. Please check your n8n webhook configuration.",
            variant: "destructive",
          });
        }
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    } else {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!currentSessionId) {
      handleStartChat(content);
      return;
    }

    const userMessage: ChatMessageType = {
      role: "user",
      content,
      timestamp: new Date(),
    };

    addMessage(currentSessionId, userMessage);
    setIsLoading(true);
    abortControllerRef.current = new AbortController();

    try {
      const currentSession = getCurrentSession();
      const conversationHistory = currentSession?.messages.map(m => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp,
      })) || [];

      const answer = await sendQueryToN8N(content, conversationHistory, abortControllerRef.current.signal);
      
      const assistantMessage: ChatMessageType = {
        role: "assistant",
        content: answer,
        timestamp: new Date(),
      };

      addMessage(currentSessionId, assistantMessage);

      // Speak the response if speech is enabled
      if (isSpeechEnabled && answer) {
        speak(answer, language);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      if (error instanceof Error && error.message !== 'Request cancelled') {
        toast({
          title: "Error",
          description: error.message || "Failed to send message. Please check your n8n webhook configuration.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleEditMessage = (index: number, content: string) => {
    setEditingMessageIndex(index);
    setEditingContent(content);
  };

  const handleSaveEdit = () => {
    if (editingMessageIndex === null || !currentSessionId) return;

    const currentSession = getCurrentSession();
    if (!currentSession) return;

    // Remove all messages after the edited one
    const updatedMessages = currentSession.messages.slice(0, editingMessageIndex);
    
    // Update the edited message
    updatedMessages[editingMessageIndex] = {
      ...updatedMessages[editingMessageIndex],
      content: editingContent,
    };

    // Update session with truncated messages
    const sessions = getSortedSessions();
    const sessionToUpdate = sessions.find(s => s.id === currentSessionId);
    if (sessionToUpdate) {
      sessionToUpdate.messages = updatedMessages;
      localStorage.setItem('visionary_sessions', JSON.stringify(sessions));
    }

    // Resend the edited message
    setEditingMessageIndex(null);
    setEditingContent("");
    handleSendMessage(editingContent);
  };

  const handleCancelEdit = () => {
    setEditingMessageIndex(null);
    setEditingContent("");
  };

  const handleKeywordClick = (keyword: string) => {
    handleSendMessage(keyword);
  };

  const handleIngestFilesClick = () => {
    setPasswordDialogOpen(true);
  };

  const handlePasswordSuccess = () => {
    setFileUploadDialogOpen(true);
  };

  const handleFileUpload = async (files: FileList, fileName: string) => {
    if (!files || files.length === 0) return;

    const uploadUrl = import.meta.env.VITE_N8N_UPLOAD_URL;
    
    if (!uploadUrl) {
      toast({
        title: "Configuration Error",
        description: "Upload URL is not configured",
        variant: "destructive",
      });
      return;
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      
      // Add explicit upload flag for n8n condition node routing (TRUE branch)
      formData.append("uploadOrQuery", "true");
      formData.append("fileName", fileName);
      
      // Add the file with the key "file" to match n8n's Binary Parameter Name
      formData.append("file", file, file.name);

      try {
        const response = await fetch(uploadUrl, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Upload failed with status ${response.status}`);
        }

        // Try to parse response as JSON
        const result = await response.json().catch(() => ({ ok: true }));
        
        toast({
          title: "✅ File uploaded",
          description: `${fileName} (${file.name}) uploaded successfully`,
        });
      } catch (error) {
        console.error("Upload error:", error);
        toast({
          title: "❌ Upload failed",
          description: `Failed to upload ${fileName}. Please try again.`,
          variant: "destructive",
        });
      }
    }
  };


  // Sync session ID from URL
  useEffect(() => {
    if (sessionId && sessionId !== currentSessionId) {
      setCurrentSessionId(sessionId);
    }
  }, [sessionId, currentSessionId, setCurrentSessionId]);

  // Get current session and messages
  const currentSession = getCurrentSession();
  const messages = currentSession?.messages || [];

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Toggle sidebar
  const toggleSidebar = () => {
    const newExpanded = !sidebarExpanded;
    setSidebarExpanded(newExpanded);
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(newExpanded));
  };

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onHome: handleHomeClick,
    onNewChat: newChat,
    onFocusInput: () => inputRef.current?.focus(),
    onToggleSidebar: toggleSidebar,
  });

  return (
    <>
      <div className="flex min-h-screen bg-white w-full">
        {/* Mobile Menu Toggle */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden fixed top-4 left-4 z-50 hover:bg-streamvision-light hover:text-streamvision-coral"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[280px]">
            <SessionSidebar
              sessions={getSortedSessions()}
              currentSessionId={currentSessionId}
              onSelectSession={(id) => {
                handleSelectSession(id);
                setMobileMenuOpen(false);
              }}
              onNewChat={() => {
                newChat();
                setMobileMenuOpen(false);
              }}
              onRename={renameSession}
              onDelete={deleteSession}
              onDuplicate={duplicateSession}
              expanded={true}
              onToggleExpand={() => {}}
            />
          </SheetContent>
        </Sheet>

        {/* Desktop Layout with Collapsible Sidebar */}
        <div className="hidden md:flex w-full h-screen">
          {/* Sidebar */}
          <div 
            className={`flex-shrink-0 h-full transition-all duration-200 ease-in-out ${
              sidebarExpanded ? "w-[300px]" : "w-[72px]"
            }`}
          >
            <SessionSidebar
              sessions={getSortedSessions()}
              currentSessionId={currentSessionId}
              onSelectSession={handleSelectSession}
              onNewChat={newChat}
              onRename={renameSession}
              onDelete={deleteSession}
              onDuplicate={duplicateSession}
              expanded={sidebarExpanded}
              onToggleExpand={toggleSidebar}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col h-full min-w-0 border-l border-border">
              {/* Header */}
              <header className="flex-shrink-0 bg-white border-b border-border z-10">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={streamvisionLogo} alt="StreamVision Media" className="h-10 object-contain" />
                    <div className="h-8 w-px bg-border" />
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-streamvision-coral" />
                      <span className="font-semibold text-lg text-streamvision-navy">Visionary</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleHomeClick}
                      className="gap-2 hover:bg-streamvision-light hover:text-streamvision-coral"
                    >
                      <Home className="h-4 w-4" />
                      <span className="hidden sm:inline">Home</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleIngestFilesClick}
                      className="gap-2 hover:bg-streamvision-light hover:text-streamvision-coral"
                    >
                      <Upload className="h-4 w-4" />
                      <span className="hidden sm:inline">Ingest Files</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate("/settings")}
                      className="hover:bg-streamvision-light hover:text-streamvision-coral"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </header>

              {/* Main Area */}
              {!currentSessionId ? (
                <HomeView onStartChat={handleStartChat} />
              ) : (
                <div className="flex-1 flex flex-col h-full overflow-hidden">
                  {/* Messages Area with ScrollArea */}
                  <ScrollArea className="flex-1 px-6">
                    <div className="container mx-auto max-w-4xl py-6 space-y-6">
                      {messages.length === 0 ? (
                        <div className="flex items-center justify-center h-[50vh] text-center">
                          <p className="text-muted-foreground text-lg">
                            Start typing to begin your conversation with Visionary
                          </p>
                        </div>
                      ) : (
                        <>
                          {messages.map((message, index) => (
                            <ChatMessage 
                              key={index} 
                              {...message}
                              onKeywordClick={handleKeywordClick}
                              onEdit={message.role === "user" ? () => handleEditMessage(index, message.content) : undefined}
                              isEditing={editingMessageIndex === index}
                              editingContent={editingContent}
                              onEditContentChange={setEditingContent}
                              onSaveEdit={handleSaveEdit}
                              onCancelEdit={handleCancelEdit}
                            />
                          ))}
                          {isLoading && (
                            <div className="flex gap-2 items-center pl-2">
                              <span className="text-sm text-muted-foreground">✨ Visionary is typing</span>
                              <div className="flex gap-1">
                                <div className="w-2 h-2 bg-streamvision-coral rounded-full animate-bounce [animation-delay:-0.3s]" />
                                <div className="w-2 h-2 bg-streamvision-coral rounded-full animate-bounce [animation-delay:-0.15s]" />
                                <div className="w-2 h-2 bg-streamvision-coral rounded-full animate-bounce" />
                              </div>
                            </div>
                          )}
                          <div ref={messagesEndRef} />
                        </>
                      )}
                    </div>
                  </ScrollArea>

                  {/* Fixed Input Area */}
                  <div className="flex-shrink-0 border-t border-border bg-white px-6 py-4">
                    <div className="container mx-auto max-w-4xl">
                      <ChatInput 
                        ref={inputRef}
                        onSend={handleSendMessage} 
                        isLoading={isLoading}
                        isListening={isListening}
                        onToggleMic={toggleListening}
                        isSpeechEnabled={isSpeechEnabled}
                        onToggleSpeech={toggleSpeech}
                        micSupported={micSupported}
                        speechSupported={speechSupported}
                        onStopGenerating={handleStopGenerating}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

        {/* Mobile Content (no sidebar, shown below sheet) */}
        <div className="flex-1 flex flex-col min-w-0 md:hidden w-full h-screen overflow-hidden">
          {/* Header */}
          <header className="flex-shrink-0 bg-white border-b border-border z-10">
            <div className="container mx-auto px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3 pl-12">
                <img src={streamvisionLogo} alt="StreamVision Media" className="h-10 object-contain" />
                <div className="h-8 w-px bg-border" />
                <div className="flex items-center gap-2 text-streamvision-coral">
                  <Sparkles className="h-5 w-5" />
                  <span className="font-semibold text-lg">Visionary</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate("/settings")}
                  className="hover:bg-streamvision-light hover:text-streamvision-coral"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </header>

          {/* Main Area */}
          {!currentSessionId ? (
            <HomeView onStartChat={handleStartChat} />
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Messages Area with ScrollArea */}
              <ScrollArea className="flex-1 px-6">
                <div className="container mx-auto max-w-4xl py-6 space-y-6">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-[50vh] text-center">
                      <p className="text-muted-foreground text-lg">
                        Start typing to begin your conversation with Visionary
                      </p>
                    </div>
                  ) : (
                    <>
                      {messages.map((message, index) => (
                        <ChatMessage 
                          key={index} 
                          {...message}
                          onKeywordClick={handleKeywordClick}
                          onEdit={message.role === "user" ? () => handleEditMessage(index, message.content) : undefined}
                          isEditing={editingMessageIndex === index}
                          editingContent={editingContent}
                          onEditContentChange={setEditingContent}
                          onSaveEdit={handleSaveEdit}
                          onCancelEdit={handleCancelEdit}
                        />
                      ))}
                      {isLoading && (
                        <div className="flex gap-2 items-center pl-2">
                          <span className="text-sm text-muted-foreground">✨ Visionary is typing</span>
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-streamvision-coral rounded-full animate-bounce [animation-delay:-0.3s]" />
                            <div className="w-2 h-2 bg-streamvision-coral rounded-full animate-bounce [animation-delay:-0.15s]" />
                            <div className="w-2 h-2 bg-streamvision-coral rounded-full animate-bounce" />
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>
              </ScrollArea>

              {/* Fixed Input Area */}
              <div className="flex-shrink-0 border-t border-border bg-white px-6 py-4">
                <div className="container mx-auto max-w-4xl">
                  <ChatInput 
                    ref={inputRef}
                    onSend={handleSendMessage} 
                    isLoading={isLoading}
                    isListening={isListening}
                    onToggleMic={toggleListening}
                    isSpeechEnabled={isSpeechEnabled}
                    onToggleSpeech={toggleSpeech}
                    micSupported={micSupported}
                    speechSupported={speechSupported}
                    onStopGenerating={handleStopGenerating}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* File Ingest Password Dialog */}
      <FileIngestPasswordDialog
        open={passwordDialogOpen}
        onOpenChange={setPasswordDialogOpen}
        onSuccess={handlePasswordSuccess}
      />

      {/* File Upload Dialog */}
      <FileUploadDialog
        open={fileUploadDialogOpen}
        onOpenChange={setFileUploadDialogOpen}
        onUpload={handleFileUpload}
      />

      {/* Home Confirmation Dialog */}
      <AlertDialog open={homeDialogOpen} onOpenChange={setHomeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Return to Home?</AlertDialogTitle>
            <AlertDialogDescription>
              You'll leave this chat view. Your conversation is saved in the sidebar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleHomeConfirm}>
              Return Home
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Index;
