"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Upload, ImageIcon, Loader2, Sparkles, X } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { Severity } from "@/lib/types";

interface ImageUploadProps {
  imageUrl: string;
  setImageUrl: (url: string) => void;
  onAiSuggestion: (severity: Severity | null) => void;
}

export default function ImageUpload({ imageUrl, setImageUrl, onAiSuggestion }: ImageUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const processFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;

      const reader = new FileReader();
      reader.onload = async (e) => {
        const url = e.target?.result as string;
        setImageUrl(url);

        // Trigger AI analysis
        setAnalyzing(true);
        try {
          const img = new Image();
          img.src = url;
          img.crossOrigin = "anonymous";
          await new Promise<void>((res) => {
            img.onload = () => res();
            img.onerror = () => res();
          });

          const { suggestSeverity } = await import("@/lib/ai-severity");
          const suggestion = await suggestSeverity(img);
          onAiSuggestion(suggestion);
        } catch {
          onAiSuggestion(null);
        } finally {
          setAnalyzing(false);
        }
      };
      reader.readAsDataURL(file);
    },
    [setImageUrl, onAiSuggestion]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Upload Photo</h2>
      <p className="text-muted-foreground text-sm mb-6">
        Take a photo or upload an image of the garbage hotspot.
      </p>

      {!imageUrl ? (
        <GlassCard
          hover={false}
          className={`p-10 text-center border-2 border-dashed transition-colors ${
            dragOver
              ? "border-brand/50 bg-brand/5"
              : "border-border/40 hover:border-brand/30"
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className="cursor-pointer"
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="font-semibold mb-1">Drop image here or click to upload</p>
            <p className="text-xs text-muted-foreground">JPG, PNG, WebP — max 10MB</p>
          </div>
        </GlassCard>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative"
        >
          <div className="relative rounded-2xl overflow-hidden border border-border/30">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={imageUrl}
              alt="Uploaded garbage hotspot"
              className="w-full h-64 object-cover"
            />
            <button
              onClick={() => {
                setImageUrl("");
                onAiSuggestion(null);
              }}
              className="absolute top-3 right-3 p-2 rounded-full glass text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {analyzing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center justify-center gap-2 p-3 rounded-xl glass border border-brand/20"
            >
              <Loader2 className="w-4 h-4 text-brand-light animate-spin" />
              <span className="text-sm text-brand-light">AI analyzing image for severity...</span>
              <Sparkles className="w-3 h-3 text-brand-light animate-glow-pulse" />
            </motion.div>
          )}

          {!analyzing && imageUrl && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 flex items-center justify-center gap-2 text-sm text-emerald-400"
            >
              <ImageIcon className="w-4 h-4" />
              Image uploaded successfully
            </motion.div>
          )}
        </motion.div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
