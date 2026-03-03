"use client";

import { useState, useCallback } from "react";
import { Upload, X, FileText, Image as ImageIcon, FileSpreadsheet, Loader2 } from "lucide-react";
import { Button } from "./button";
import { Card } from "./card";
import { trpc } from "@/lib/api/react";
import { toast } from "sonner";
import type { FileMetadata } from "@/lib/storage/r2";
import { logger } from "@/lib/monitoring/logger";

interface FileUploadProps {
  entityType: "request" | "contract" | "invoice";
  entityId?: string;
  existingFiles?: FileMetadata[];
  onFilesChange?: (files: FileMetadata[]) => void;
  maxFiles?: number;
}

export function FileUpload({
  entityType,
  entityId,
  existingFiles = [],
  onFilesChange,
  maxFiles = 5,
}: FileUploadProps) {
  const [files, setFiles] = useState<FileMetadata[]>(existingFiles);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const generateUploadUrl = trpc.files.generateUploadUrl.useMutation();
  const deleteFile = trpc.files.deleteFile.useMutation();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const validateFile = (file: File): string | null => {
    // Check file type
    const allowedTypes = ["application/pdf", "image/png", "image/jpeg", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
    if (!allowedTypes.includes(file.type)) {
      return `Invalid file type: ${file.name}. Only PDF, PNG, JPG, and XLSX files are allowed.`;
    }

    // Check file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return `File too large: ${file.name}. Maximum size is 10MB.`;
    }

    // Check max files
    if (files.length >= maxFiles) {
      return `Maximum ${maxFiles} files allowed.`;
    }

    return null;
  };

  const uploadFile = async (file: File) => {
    // Generate presigned upload URL
    const result = await generateUploadUrl.mutateAsync({
      filename: file.name,
      contentType: file.type,
      size: file.size,
      entityType,
      entityId,
    });

    // Upload directly to R2
    const uploadResponse = await fetch(result.uploadUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });

    if (!uploadResponse.ok) {
      throw new Error("Upload to R2 failed");
    }

    // Return file metadata
    return {
      id: result.fileId,
      name: result.filename,
      key: result.key,
      size: result.size,
      type: result.contentType,
      uploadedAt: new Date(),
      uploadedBy: "current-user", // Will be set by backend
    } as FileMetadata;
  };

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const filesToUpload = Array.from(fileList);

    // Validate all files first
    for (const file of filesToUpload) {
      const error = validateFile(file);
      if (error) {
        toast.error(error);
        return;
      }
    }

    setUploading(true);

    try {
      const uploadedFiles: FileMetadata[] = [];

      // Upload files sequentially
      for (const file of filesToUpload) {
        try {
          const metadata = await uploadFile(file);
          uploadedFiles.push(metadata);
          toast.success(`Uploaded ${file.name}`);
        } catch (error) {
          toast.error(`Failed to upload ${file.name}`);
          logger.error("File upload failed", error as Error, { fileName: file.name });
        }
      }

      const newFiles = [...files, ...uploadedFiles];
      setFiles(newFiles);
      onFilesChange?.(newFiles);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files) {
        handleFiles(e.dataTransfer.files);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [files]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleRemove = async (file: FileMetadata) => {
    if (!entityId) {
      // Remove locally if entity doesn't exist yet
      const newFiles = files.filter((f) => f.id !== file.id);
      setFiles(newFiles);
      onFilesChange?.(newFiles);
      return;
    }

    try {
      await deleteFile.mutateAsync({
        key: file.key,
        fileId: file.id,
        entityType,
        entityId,
      });

      const newFiles = files.filter((f) => f.id !== file.id);
      setFiles(newFiles);
      onFilesChange?.(newFiles);
      toast.success(`Deleted ${file.name}`);
    } catch (error) {
      logger.error("File deletion failed", error as Error, { fileName: file.name, fileId: file.id });
      toast.error(`Failed to delete ${file.name}`);
    }
  };

  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) return <FileText className="h-8 w-8 text-red-500" />;
    if (type.includes("image")) return <ImageIcon className="h-8 w-8 text-blue-500" />;
    if (type.includes("spreadsheet") || type.includes("excel"))
      return <FileSpreadsheet className="h-8 w-8 text-green-500" />;
    return <FileText className="h-8 w-8 text-slate-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? "border-blue-500 bg-blue-50"
            : "border-slate-200 hover:border-slate-300"
        }`}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          onChange={handleChange}
          multiple
          accept=".pdf,.png,.jpg,.jpeg,.xlsx,.xls"
          disabled={uploading || files.length >= maxFiles}
        />

        <label
          htmlFor="file-upload"
          className={`cursor-pointer ${uploading || files.length >= maxFiles ? "cursor-not-allowed opacity-50" : ""}`}
        >
          <div className="flex flex-col items-center">
            {uploading ? (
              <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
            ) : (
              <Upload className="h-12 w-12 text-slate-400 mb-4" />
            )}
            <p className="text-sm font-medium text-slate-900 mb-1">
              {uploading ? "Uploading..." : "Drop files here or click to browse"}
            </p>
            <p className="text-xs text-slate-500">
              PDF, PNG, JPG, XLSX up to 10MB ({maxFiles - files.length} remaining)
            </p>
          </div>
        </label>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => (
            <Card key={file.id} className="p-4">
              <div className="flex items-center gap-4">
                {getFileIcon(file.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatFileSize(file.size)} •{" "}
                    {new Date(file.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemove(file)}
                  disabled={deleteFile.isPending}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
