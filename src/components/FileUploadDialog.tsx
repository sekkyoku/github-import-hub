import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";

interface FileUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (files: FileList, fileName: string) => void;
}

export function FileUploadDialog({ open, onOpenChange, onUpload }: FileUploadDialogProps) {
  const [files, setFiles] = useState<FileList | null>(null);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      // Validate .xlsx files
      const file = selectedFiles[0];
      if (!file.name.endsWith('.xlsx')) {
        setError('Please upload a .xlsx file');
        setFiles(null);
        return;
      }
      setFiles(selectedFiles);
      setError("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!files || files.length === 0) {
      setError("Please select a file");
      return;
    }
    
    if (!fileName.trim()) {
      setError("Please enter a name for this file");
      return;
    }

    onUpload(files, fileName.trim());
    handleClose();
  };

  const handleClose = () => {
    setFiles(null);
    setFileName("");
    setError("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload File</DialogTitle>
          <DialogDescription>
            Upload your .xlsx file and provide a name for it
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="file">Upload your .xlsx file</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="file"
                  type="file"
                  accept=".xlsx"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
                <Upload className="h-5 w-5 text-muted-foreground" />
              </div>
              {files && files.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  Selected: {files[0].name}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fileName">Name of this file</Label>
              <Input
                id="fileName"
                type="text"
                placeholder="Enter file name"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                required
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button type="submit">Upload</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
