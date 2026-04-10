"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Upload, ImageIcon, Loader2, Sparkles, X } from "lucide-react";
import { Severity } from "@/lib/types";
import { useTranslation } from "@/lib/i18n";
import { useReportStore } from "@/lib/store";

interface ImageUploadProps {
  imageUrl: string;
  setImageUrl: (url: string) => void;
  onAiSuggestion: (severity: Severity | null) => void;
  onUploadStateChange?: (uploading: boolean) => void;
}

export default function ImageUpload({ imageUrl, setImageUrl, onAiSuggestion, onUploadStateChange }: ImageUploadProps) {
  const reports = useReportStore((state) => state.reports);
  const [dragOver, setDragOver] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const { t } = useTranslation();

  const processFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      setUploadError("");

      const reader = new FileReader();
      reader.onload = async (e) => {
        const previewUrl = e.target?.result as string;

        // Trigger AI analysis
        setAnalyzing(true);
        try {
          const img = new Image();
          img.src = previewUrl;
          img.crossOrigin = "anonymous";
          await new Promise<void>((res) => {
            img.onload = () => res();
            img.onerror = () => res();
          });

          const { suggestSeverity, screenImageForDuplicateOrCopiedContent } = await import("@/lib/ai-severity");
          const duplicateCheck = await screenImageForDuplicateOrCopiedContent(
            img,
            reports.map((report) => report.beforeImage).filter(Boolean)
          );

          if (duplicateCheck.blocked) {
            setImageUrl("");
            onAiSuggestion(null);
            setUploadError(duplicateCheck.reason || "This image looks too similar to an existing report.");
            return;
          }

          const suggestion = await suggestSeverity(img);
          onAiSuggestion(suggestion);

          // Show preview only after the image passes AI screening.
          setImageUrl(previewUrl);
        } catch {
          onAiSuggestion(null);
          setImageUrl("");
          setUploadError("This image could not be analyzed. Please try a different photo.");
        } finally {
          setAnalyzing(false);
        }

        // Keep the local preview as the final image in the dummy-data version.
        setUploading(false);
        onUploadStateChange?.(false);
      };
      reader.readAsDataURL(file);
    },
    [reports, setImageUrl, onAiSuggestion, onUploadStateChange]
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
    <div className="bg-white border-[3px] border-black p-5 sm:p-8 shadow-[3px_3px_0px_#000]">
      <h2 className="text-2xl font-black mb-2 uppercase text-black">{t("uploadPhoto")}</h2>
      <p className="text-black font-bold text-xs mb-6 bg-brutal-cyan inline-block px-2 py-1 border-[3px] border-black">
        {t("uploadPhotoDesc")}
      </p>

      {!imageUrl ? (
        <div
          className={`p-6 sm:p-8 text-center border-[3px] border-dashed transition-colors shadow-[3px_3px_0px_#000] cursor-pointer ${
            dragOver
              ? "border-black bg-brutal-yellow"
              : "border-black bg-white hover:bg-neutral-100"
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
          >
            <Upload className={`w-10 h-10 mx-auto mb-3 ${dragOver ? "text-black" : "text-black"}`} />
            <p className="font-black text-lg mb-1 text-black uppercase">{t("dropImageHere")}</p>
            <p className="text-xs font-bold text-black uppercase">{t("imageFormat")}</p>
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative"
        >
          <div className="relative border-[3px] border-black bg-white shadow-[3px_3px_0px_#000]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={imageUrl}
              alt="Uploaded garbage hotspot"
              className="w-full h-48 sm:h-56 object-cover border-b-[3px] border-black"
            />
            <button
              onClick={() => {
                setImageUrl("");
                onAiSuggestion(null);
                setUploadError("");
                setUploading(false);
                onUploadStateChange?.(false);
              }}
              className="absolute top-2 right-2 p-1.5 bg-brutal-red border-[2px] border-black text-black hover:bg-black hover:text-white cursor-pointer transition-colors"
            >
              <X className="w-4 h-4 font-bold" />
            </button>
          </div>

          {analyzing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center justify-center gap-2 p-3 bg-brutal-yellow border-[3px] border-black shadow-[3px_3px_0px_#000]"
            >
              <Loader2 className="w-5 h-5 text-black animate-spin" />
              <span className="text-sm font-black text-black uppercase">{t("aiAnalyzing")}</span>
              <Sparkles className="w-4 h-4 text-black" />
            </motion.div>
          )}

          {uploading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center justify-center gap-2 p-3 bg-white border-[3px] border-black shadow-[3px_3px_0px_#000]"
            >
              <Loader2 className="w-5 h-5 text-black animate-spin" />
              <span className="text-sm font-black text-black uppercase">{t("uploading")}</span>
            </motion.div>
          )}

          {uploadError && !uploading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center justify-center gap-2 text-sm font-black text-black bg-brutal-red p-2 border-[3px] border-black shadow-[3px_3px_0px_#000]"
            >
              {uploadError}
            </motion.div>
          )}

          {!analyzing && !uploading && imageUrl && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 flex items-center justify-center gap-2 text-sm font-black text-black bg-brutal-green p-2 border-[3px] border-black shadow-[3px_3px_0px_#000]"
            >
              <ImageIcon className="w-4 h-4" />
              {t("imageUploaded")}
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
