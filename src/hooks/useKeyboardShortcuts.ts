import { useEffect } from "react";

interface KeyboardShortcutsOptions {
  onHome?: () => void;
  onNewChat?: () => void;
  onFocusInput?: () => void;
  onToggleSidebar?: () => void;
}

export const useKeyboardShortcuts = ({
  onHome,
  onNewChat,
  onFocusInput,
  onToggleSidebar,
}: KeyboardShortcutsOptions) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        // Allow Ctrl/Cmd + K and Ctrl/Cmd + B even in inputs
        if ((e.metaKey || e.ctrlKey) && e.key === "k" && onFocusInput) {
          e.preventDefault();
          onFocusInput();
        }
        if ((e.metaKey || e.ctrlKey) && e.key === "b" && onToggleSidebar) {
          e.preventDefault();
          onToggleSidebar();
        }
        return;
      }

      // H → Go Home
      if (e.key === "h" && onHome) {
        e.preventDefault();
        onHome();
      }

      // Ctrl/Cmd + N → New Chat
      if ((e.metaKey || e.ctrlKey) && e.key === "n" && onNewChat) {
        e.preventDefault();
        onNewChat();
      }

      // Ctrl/Cmd + K → Focus input
      if ((e.metaKey || e.ctrlKey) && e.key === "k" && onFocusInput) {
        e.preventDefault();
        onFocusInput();
      }

      // Ctrl/Cmd + B → Toggle sidebar
      if ((e.metaKey || e.ctrlKey) && e.key === "b" && onToggleSidebar) {
        e.preventDefault();
        onToggleSidebar();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onHome, onNewChat, onFocusInput, onToggleSidebar]);
};
