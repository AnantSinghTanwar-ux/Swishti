"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Camera, AlertTriangle, Check, ArrowLeft, ArrowRight } from "lucide-react";
import { useReportStore } from "@/lib/store";
import { Severity } from "@/lib/types";
import { duplicateThresholdMeters, findNearbyReports } from "@/lib/geo";
import LocationPicker from "@/components/report/LocationPicker";
import ImageUpload from "@/components/report/ImageUpload";
import SeverityPicker from "@/components/report/SeverityPicker";
import NearbyDuplicateWarning from "@/components/report/NearbyDuplicateWarning";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n";

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
};

export default function ReportPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [beforeImage, setBeforeImage] = useState<string>("");
  const [imageUploading, setImageUploading] = useState(false);
  const [severity, setSeverity] = useState<Severity | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<Severity | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const { user, addReport, reports } = useReportStore();
  const router = useRouter();
  const { t } = useTranslation();

  const nearbyMatches = useMemo(() => {
    if (!location) return [];
    const thresholdMeters = duplicateThresholdMeters(severity);
    return findNearbyReports({ reports, location, thresholdMeters, includeCleaned: false });
  }, [location, reports, severity]);

  const steps = [
    { label: t("pickLocation"), icon: MapPin },
    { label: t("uploadPhoto"), icon: Camera },
    { label: t("selectSeverity"), icon: AlertTriangle },
  ];

  const canProceed = useCallback(() => {
    if (currentStep === 0) return !!location;
    if (currentStep === 1) return !!beforeImage && !imageUploading;
    if (currentStep === 2) return !!severity;
    return false;
  }, [currentStep, location, beforeImage, severity, imageUploading]);

  const next = () => {
    if (!canProceed()) return;
    
    // Auth check before final submission
    if (currentStep === 2 && !user) {
      alert(t("pleaseLogin"));
      router.push("/login");
      return;
    }

    if (currentStep < 2) {
      setDirection(1);
      setCurrentStep((s) => s + 1);
    } else {
      // Submit
      addReport({
        lat: location!.lat,
        lng: location!.lng,
        beforeImage,
        severity: severity!,
      });
      setSubmitted(true);
    }
  };

  const prev = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((s) => s - 1);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white border-[3px] border-black shadow-[3px_3px_0px_#000] p-6 sm:p-10 text-center max-w-md w-full"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="w-20 h-20 bg-brutal-green border-[3px] border-black text-black flex items-center justify-center mx-auto mb-6 shadow-[3px_3px_0px_#000]"
          >
            <Check className="w-10 h-10" />
          </motion.div>
          <h2 className="text-2xl font-black mb-3 uppercase text-black">{t("reportSubmitted")}</h2>
          <p className="text-black font-medium mb-8 text-base border-2 border-dashed border-black p-3 bg-white">
            {t("reportSubmittedDesc")}
          </p>
          <div className="flex flex-col gap-4 justify-center">
            <motion.button
              onClick={() => router.push("/dashboard")}
              className="px-5 py-3 bg-brutal-cyan text-black brutal-button text-base font-black w-full"
            >
              {t("viewDashboard")}
            </motion.button>
            <motion.button
              onClick={() => {
                setSubmitted(false);
                setCurrentStep(0);
                setLocation(null);
                setBeforeImage("");
                setSeverity(null);
                setAiSuggestion(null);
              }}
              className="px-5 py-3 bg-white text-black brutal-button text-base font-black w-full border-[3px]"
            >
              {t("reportAnother")}
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)]">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-12">
          {steps.map((step, i) => {
            const Icon = step.icon;
            const isActive = i === currentStep;
            const isComplete = i < currentStep;
            return (
              <div key={i} className="flex items-center gap-2">
                <div
                  className={`flex items-center gap-2 px-4 py-2 border-[3px] border-black shadow-[3px_3px_0px_#000] transition-colors ${
                    isComplete
                      ? "bg-brutal-green text-black"
                      : isActive
                      ? "bg-brutal-cyan text-black"
                      : "bg-white text-neutral-400"
                  }`}
                >
                  {isComplete ? (
                    <Check className="w-4 h-4 font-bold" />
                  ) : (
                    <Icon className={`w-4 h-4 font-bold`} />
                  )}
                  <span
                    className={`text-xs font-black hidden sm:inline uppercase`}
                  >
                    {step.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`w-4 h-1.5 border-y-[3px] border-black ${
                      i < currentStep ? "bg-black" : "bg-transparent"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Nearby duplicate warning (non-blocking) */}
        {location && nearbyMatches.length > 0 && (
          <div className="mb-6">
            <NearbyDuplicateWarning matches={nearbyMatches} />
          </div>
        )}

        {/* Step Content */}
        <div className="relative overflow-hidden min-h-[400px]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: "easeInOut" }}
            >
              {currentStep === 0 && (
                <LocationPicker location={location} setLocation={setLocation} />
              )}
              {currentStep === 1 && (
                <ImageUpload
                  imageUrl={beforeImage}
                  setImageUrl={setBeforeImage}
                  onAiSuggestion={setAiSuggestion}
                  onUploadStateChange={setImageUploading}
                />
              )}
              {currentStep === 2 && (
                <SeverityPicker
                  severity={severity}
                  setSeverity={setSeverity}
                  aiSuggestion={aiSuggestion}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={prev}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-5 py-3 bg-white text-black brutal-button disabled:opacity-30 disabled:pointer-events-none text-base border-[3px]"
          >
            <ArrowLeft className="w-4 h-4 font-bold" />
            {t("back")}
          </button>
          <button
            onClick={next}
            disabled={!canProceed()}
            className="flex items-center gap-2 px-6 py-3 bg-brutal-green text-black brutal-button disabled:opacity-30 disabled:pointer-events-none text-base border-[3px]"
          >
            {currentStep === 2 ? t("submitReport") : t("continue")}
            {currentStep === 2 ? <Check className="w-4 h-4 font-bold" /> : <ArrowRight className="w-4 h-4 font-bold" />}
          </button>
        </div>
      </div>
    </div>
  );
}
