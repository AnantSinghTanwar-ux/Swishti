"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Camera, Check } from "lucide-react";
import { useReportStore } from "@/lib/store";
import { useTranslation } from "@/lib/i18n";
import { uploadImageToStorage } from "@/lib/storage";

export default function ProofModal() {
  const { proofModalReportId, closeProofModal, reports, submitProof } = useReportStore();
  const { t } = useTranslation();
  const [afterPreviewUrl, setAfterPreviewUrl] = useState("");
  const [afterFile, setAfterFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const report = reports.find((r) => r.id === proofModalReportId);

  if (!proofModalReportId || !report) return null;

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setAfterFile(file);
    setAfterPreviewUrl(url);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleSubmit = async () => {
    if (!afterFile) return;
    setSubmitting(true);
    try {
      const downloadUrl = await uploadImageToStorage({
        file: afterFile,
        folder: `reports/${report.id}/after`,
      });

      const result = await submitProof(report.id, downloadUrl);
      if (result.success) {
        setAfterFile(null);
        setAfterPreviewUrl("");
        closeProofModal();
      } else {
        alert(result.error || "Failed to submit proof");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4"
        onClick={closeProofModal}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white border-[3px] border-black shadow-[6px_6px_0px_#000] w-full max-w-lg max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b-[3px] border-black bg-brutal-green">
            <h2 className="text-lg font-black uppercase text-black">{t("proofTitle")}</h2>
            <button
              onClick={closeProofModal}
              className="p-1 border-[2px] border-black bg-white hover:bg-black hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5">
            <p className="text-xs font-bold text-black mb-5 bg-brutal-cyan inline-block px-2 py-1 border-[3px] border-black">
              {t("proofDesc")}
            </p>

            {/* Before / After Grid */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              {/* Before Image */}
              <div>
                <p className="text-[10px] font-black text-black uppercase mb-2 bg-brutal-yellow inline-block px-2 py-0.5 border-2 border-black">
                  {t("beforeLabel")}
                </p>
                <div className="border-[3px] border-black bg-neutral-100 h-36 overflow-hidden shadow-[3px_3px_0px_#000]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={report.beforeImage}
                    alt="Before"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* After Image */}
              <div>
                <p className="text-[10px] font-black text-black uppercase mb-2 bg-brutal-green inline-block px-2 py-0.5 border-2 border-black">
                  {t("afterLabel")}
                </p>
                {afterPreviewUrl ? (
                  <div className="border-[3px] border-black bg-neutral-100 h-36 overflow-hidden shadow-[3px_3px_0px_#000] relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={afterPreviewUrl}
                      alt="After"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => {
                        setAfterFile(null);
                        setAfterPreviewUrl("");
                      }}
                      className="absolute top-1 right-1 p-1 bg-brutal-red border-2 border-black text-black hover:bg-black hover:text-white transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div
                    className={`border-[3px] border-dashed border-black h-36 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                      dragOver ? "bg-brutal-yellow" : "bg-white hover:bg-neutral-50"
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                  >
                    <Camera className="w-8 h-8 text-black mb-2" />
                    <p className="text-[10px] font-black text-black uppercase">{t("chooseFile")}</p>
                  </div>
                )}
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={closeProofModal}
                className="flex-1 px-4 py-2.5 bg-white text-black brutal-button text-sm border-[3px]"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleSubmit}
                disabled={!afterFile || submitting}
                className="flex-1 px-4 py-2.5 bg-brutal-green text-black brutal-button text-sm border-[3px] disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t("submitting")}
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    {t("submitProof")}
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
