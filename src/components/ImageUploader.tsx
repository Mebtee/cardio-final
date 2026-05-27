
import { useState, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, FileImage, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  isLoading: boolean;
}

const ImageUploader = ({ onImageUpload, isLoading }: ImageUploaderProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        handleFile(file);
      }
    },
    [onImageUpload]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      handleFile(file);
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPEG or PNG)",
        variant: "destructive",
      });
      return;
    }

    // Create image preview for image files
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    // Pass file to parent component
    onImageUpload(file);
  };

  const clearImage = () => {
    setPreviewImage(null);
  };

  return (
    <Card className="medical-card w-full">
      <CardContent className="p-8">
        {!previewImage ? (
          <div
            className={cn(
              "border-3 border-dashed rounded-xl h-72 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group",
              dragActive
                ? "border-primary bg-gradient-to-br from-primary/10 to-secondary/10 scale-[1.02]"
                : "border-border hover:border-primary/60 hover:bg-gradient-to-br hover:from-primary/5 hover:to-secondary/5 hover:scale-[1.01]"
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById("file-upload")?.click()}
          >
            <input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept="image/*"
              disabled={isLoading}
            />
            <div className="relative mb-4">
              <div className="p-4 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 group-hover:from-primary/20 group-hover:to-secondary/20 transition-all duration-300">
                <Upload className="h-12 w-12 text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>
              <FileImage className="h-6 w-6 text-secondary absolute -bottom-1 -right-1 bg-background rounded-full p-1" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-xl font-semibold medical-heading text-primary">Upload X-ray Image</p>
              <p className="text-sm text-muted-foreground">
                Drag and drop your medical image or click to browse
              </p>
              <div className="flex items-center justify-center gap-2 mt-4">
                <Shield className="h-4 w-4 text-secondary" />
                <p className="text-xs text-muted-foreground font-medium">
                  Supports: JPEG, PNG • HIPAA Compliant
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative group">
            <div className="h-72 overflow-hidden rounded-xl bg-gradient-to-br from-muted/30 to-accent/20 flex items-center justify-center border border-border/50">
              <img
                src={previewImage}
                alt="X-ray preview"
                className="object-contain max-h-full max-w-full rounded-lg shadow-sm"
              />
            </div>
            {!isLoading && (
              <Button
                variant="secondary"
                size="icon"
                className="absolute top-3 right-3 h-10 w-10 bg-background/90 hover:bg-background shadow-lg border border-border/50 opacity-0 group-hover:opacity-100 transition-all duration-200"
                onClick={clearImage}
              >
                <X className="h-5 w-5" />
              </Button>
            )}
            <div className="absolute bottom-3 left-3 bg-background/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-border/50">
              <div className="flex items-center gap-2">
                <FileImage className="h-4 w-4 text-secondary" />
                <span className="text-sm font-medium text-foreground">X-ray Image Ready</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ImageUploader;
