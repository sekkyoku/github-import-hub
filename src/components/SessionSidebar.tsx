import { useState } from "react";
import { Plus, MessageSquare, MoreVertical, Pencil, Trash2, Copy, PanelLeftClose, PanelLeft } from "lucide-react";
import { Session } from "@/hooks/useSessionManager";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SessionSidebarProps {
  sessions: Session[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onRename: (id: string, newTitle: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  expanded: boolean;
  onToggleExpand: () => void;
}

const SessionSidebar = ({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  onRename,
  onDelete,
  onDuplicate,
  expanded,
  onToggleExpand,
}: SessionSidebarProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [renamingSessionId, setRenamingSessionId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const handleDeleteClick = (id: string) => {
    setSessionToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (sessionToDelete) {
      onDelete(sessionToDelete);
      setSessionToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  const handleRenameClick = (id: string, currentTitle: string) => {
    setRenamingSessionId(id);
    setRenameValue(currentTitle);
  };

  const handleRenameSubmit = (id: string) => {
    if (renameValue.trim()) {
      onRename(id, renameValue.trim());
    }
    setRenamingSessionId(null);
    setRenameValue("");
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = diff / (1000 * 60 * 60);
    const days = diff / (1000 * 60 * 60 * 24);

    if (hours < 24) {
      return "Today";
    } else if (days < 7) {
      return `${Math.floor(days)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <>
      <TooltipProvider delayDuration={300}>
        <div className="w-full bg-sidebar border-r border-sidebar-border flex flex-col h-full">
          {/* Toggle Button */}
          <div className="p-3 border-b border-sidebar-border flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleExpand}
              className="hover:bg-sidebar-accent"
              aria-pressed={expanded}
              aria-label="Toggle sidebar"
            >
              {expanded ? (
                <PanelLeftClose className="h-5 w-5 text-foreground" />
              ) : (
                <PanelLeft className="h-5 w-5 text-foreground" />
              )}
            </Button>
            {expanded && (
              <span className="text-xs text-muted-foreground font-medium">Ctrl+B</span>
            )}
          </div>

          {/* New Chat Button */}
          <div className="p-3 border-b border-sidebar-border">
            {expanded ? (
              <Button
                onClick={onNewChat}
                className="w-full bg-streamvision-coral hover:bg-streamvision-coral/90 text-white gap-2"
              >
                <Plus className="h-4 w-4" />
                New Chat
              </Button>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={onNewChat}
                    size="icon"
                    className="w-full bg-streamvision-coral hover:bg-streamvision-coral/90 text-white"
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>New Chat</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Sessions List */}
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {sessions.length === 0 ? (
                <div className="text-center text-muted-foreground text-sm py-8 px-4">
                  {expanded ? "No conversations yet" : ""}
                </div>
              ) : (
                sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`group relative rounded-lg transition-colors ${
                      currentSessionId === session.id
                        ? "bg-white shadow-sm border-l-2 border-streamvision-coral"
                        : "hover:bg-white/50"
                    }`}
                  >
                    {expanded ? (
                      // Expanded View
                      <button
                        onClick={() => onSelectSession(session.id)}
                        className="w-full text-left px-3 py-3 pr-10"
                      >
                        <div className="flex items-start gap-2 min-w-0">
                          <MessageSquare className="h-4 w-4 mt-0.5 text-streamvision-coral flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            {renamingSessionId === session.id ? (
                              <Input
                                value={renameValue}
                                onChange={(e) => setRenameValue(e.target.value)}
                                onBlur={() => handleRenameSubmit(session.id)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    handleRenameSubmit(session.id);
                                  } else if (e.key === "Escape") {
                                    setRenamingSessionId(null);
                                    setRenameValue("");
                                  }
                                }}
                                autoFocus
                                className="h-6 px-1 py-0 text-sm"
                                onClick={(e) => e.stopPropagation()}
                              />
                            ) : (
                              <>
                                <div className="text-sm font-medium text-foreground line-clamp-2 leading-snug">
                                  {session.title}
                                </div>
                                <div className="text-xs text-muted-foreground mt-0.5">
                                  {formatTimestamp(session.updatedAt)}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </button>
                    ) : (
                      // Collapsed View
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => onSelectSession(session.id)}
                            className="w-full flex items-center justify-center py-3 px-2"
                          >
                            <MessageSquare 
                              className={`h-5 w-5 ${
                                currentSessionId === session.id
                                  ? "text-streamvision-coral"
                                  : "text-muted-foreground"
                              }`}
                            />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-[250px]">
                          <div>
                            <p className="font-medium line-clamp-2">{session.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatTimestamp(session.updatedAt)}
                            </p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    )}

                    {/* Context Menu - Always visible in expanded, tooltip-triggered in collapsed */}
                    {expanded && (
                      <div className="absolute right-2 top-3 z-50">
                        <DropdownMenu modal={false}>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-sidebar-accent"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="z-[100]">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRenameClick(session.id, session.title);
                              }}
                            >
                              <Pencil className="h-4 w-4 mr-2" />
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                onDuplicate(session.id);
                              }}
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(session.id);
                              }}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </TooltipProvider>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              This conversation will be permanently deleted. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SessionSidebar;
