"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { markAttachmentsUploaded } from "@/lib/actions/orders";

interface ExistingAttachment {
  id: string;
  name: string;
  size: number;
  url: string;
}

export function OrderUploadClient({
  orderId,
  existingAttachments,
  alreadyUploaded,
}: {
  orderId: string;
  existingAttachments: ExistingAttachment[];
  alreadyUploaded: boolean;
}) {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [marking, setMarking] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFiles(list: FileList | null) {
    if (!list) return;
    const arr = Array.from(list);
    setFiles((prev) => [...prev, ...arr]);
  }

  function removeFile(idx: number) {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  async function upload() {
    if (files.length === 0) {
      toast.error("Please select at least one file to upload");
      return;
    }
    setUploading(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.set("file", file);
        formData.set("orderId", orderId);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (!res.ok) throw new Error("Upload failed");
      }
      setFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await markAttachmentsUploaded(orderId);
      toast.success("Files uploaded successfully");
      router.refresh();
    } catch (err) {
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  async function skipUploads() {
    setMarking(true);
    try {
      await markAttachmentsUploaded(orderId);
      toast.success("Marked as uploaded");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setMarking(false);
    }
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  return (
    <div className="mt-5">
      {existingAttachments.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Uploaded files</p>
          <ul className="space-y-2">
            {existingAttachments.map((a) => (
              <li
                key={a.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50"
              >
                <FileText className="h-4 w-4 text-slate-500 shrink-0" />
                <a href={a.url} target="_blank" rel="noopener" className="text-sm text-slate-900 hover:underline truncate flex-1">
                  {a.name}
                </a>
                <span className="text-xs text-slate-500">{formatSize(a.size)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div
        onDragOver={(e) => { e.preventDefault(); }}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-slate-400 transition-colors"
      >
        <Upload className="h-8 w-8 mx-auto text-slate-400" />
        <p className="mt-3 text-sm text-slate-700">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-slate-900 font-semibold underline"
          >
            Click to upload
          </button>{" "}
          or drag and drop
        </p>
        <p className="mt-1 text-xs text-slate-500">PDF, DOC, DOCX, images, spreadsheets up to 200MB each</p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {files.length > 0 && (
        <ul className="mt-4 space-y-2">
          {files.map((f, i) => (
            <li
              key={i}
              className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-white"
            >
              <FileText className="h-4 w-4 text-slate-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-slate-900 truncate">{f.name}</div>
                <div className="text-xs text-slate-500">{formatSize(f.size)}</div>
              </div>
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="h-7 w-7 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        {files.length > 0 && (
          <Button onClick={upload} disabled={uploading}>
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Upload {files.length} file{files.length === 1 ? "" : "s"}
              </>
            )}
          </Button>
        )}
        {!alreadyUploaded && files.length === 0 && (
          <Button variant="outline" onClick={skipUploads} disabled={marking}>
            {marking ? "Saving..." : "Mark as uploaded"}
          </Button>
        )}
      </div>
    </div>
  );
}
