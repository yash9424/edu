"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Upload, File, X, CheckCircle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  onFilesChange: (files: File[]) => void
  acceptedFileTypes?: string[]
  maxFileSize?: number
  maxFiles?: number
  multiple?: boolean
  className?: string
}

interface UploadedFile {
  file: File
  progress: number
  status: "uploading" | "success" | "error"
  id: string
}

export function FileUpload({
  onFilesChange,
  acceptedFileTypes = [".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx"],
  maxFileSize = 5 * 1024 * 1024, // 5MB
  maxFiles = 5,
  multiple = true,
  className,
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = acceptedFiles.slice(0, maxFiles - uploadedFiles.length).map((file) => ({
        file,
        progress: 0,
        status: "uploading" as const,
        id: Math.random().toString(36).substr(2, 9),
      }))

      setUploadedFiles((prev) => [...prev, ...newFiles])

      // Simulate upload progress
      newFiles.forEach((uploadFile) => {
        const interval = setInterval(() => {
          setUploadedFiles((prev) =>
            prev.map((f) => {
              if (f.id === uploadFile.id) {
                const newProgress = Math.min(f.progress + 10, 100)
                return {
                  ...f,
                  progress: newProgress,
                  status: newProgress === 100 ? "success" : "uploading",
                }
              }
              return f
            }),
          )
        }, 200)

        setTimeout(() => clearInterval(interval), 2000)
      })

      onFilesChange([...uploadedFiles.map((f) => f.file), ...acceptedFiles])
    },
    [uploadedFiles, maxFiles, onFilesChange],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.reduce(
      (acc, type) => {
        acc[type] = []
        return acc
      },
      {} as Record<string, string[]>,
    ),
    maxSize: maxFileSize,
    multiple,
  })

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id))
    onFilesChange(uploadedFiles.filter((f) => f.id !== id).map((f) => f.file))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className={cn("space-y-4", className)}>
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
              isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50",
            )}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            {isDragActive ? (
              <p className="text-lg font-medium">Drop the files here...</p>
            ) : (
              <div>
                <p className="text-lg font-medium mb-2">Drag & drop files here, or click to select</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Supports: {acceptedFileTypes.join(", ")} (Max {formatFileSize(maxFileSize)} each)
                </p>
                <Button type="button" variant="outline">
                  Choose Files
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {uploadedFiles.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-4">Uploaded Files ({uploadedFiles.length})</h4>
            <div className="space-y-3">
              {uploadedFiles.map((uploadFile) => (
                <div key={uploadFile.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <File className="h-8 w-8 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-balance">{uploadFile.file.name}</p>
                    <p className="text-sm text-muted-foreground">{formatFileSize(uploadFile.file.size)}</p>
                    {uploadFile.status === "uploading" && <Progress value={uploadFile.progress} className="mt-2 h-2" />}
                  </div>
                  <div className="flex items-center gap-2">
                    {uploadFile.status === "success" && <CheckCircle className="h-5 w-5 text-primary" />}
                    {uploadFile.status === "error" && <AlertCircle className="h-5 w-5 text-destructive" />}
                    <Button variant="ghost" size="sm" onClick={() => removeFile(uploadFile.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
