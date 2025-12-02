import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

interface FileIngestPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const FileIngestPasswordDialog = ({
  open,
  onOpenChange,
  onSuccess,
}: FileIngestPasswordDialogProps) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const correctPassword = import.meta.env.VITE_FILE_INGEST_PASSWORD || "streamvision2024";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === correctPassword) {
      setError("");
      setPassword("");
      onOpenChange(false);
      onSuccess();
    } else {
      setError("Incorrect password. Access denied.");
      setPassword("");
    }
  };

  const handleClose = () => {
    setPassword("");
    setError("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-streamvision-coral" />
            StreamVision Team Access
          </DialogTitle>
          <DialogDescription>
            Enter the password to ingest files into the system. This feature is restricted to authorized StreamVision team members only.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              className="w-full"
              autoFocus
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
          <DialogFooter className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-streamvision-coral hover:bg-streamvision-coral/90 text-white"
            >
              Submit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FileIngestPasswordDialog;
