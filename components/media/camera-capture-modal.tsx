"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Camera,
  X,
  RefreshCw,
  SwitchCamera,
  AlertCircle,
  Upload,
  Check,
} from "lucide-react";

export interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File, previewUrl: string) => void;
  title?: string;
  description?: string;
}

export function CameraCaptureModal({
  isOpen,
  onClose,
  onCapture,
  title = "Ambil Foto Lembar Kerja",
  description = "Arahkan kamera ke lembar fisik secara tegak lurus dan pastikan pencahayaan cukup.",
}: CameraCaptureModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileFallbackRef = useRef<HTMLInputElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLoadingCamera, setIsLoadingCamera] = useState(false);

  // Stop camera tracks cleanly
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  // Check if device has multiple cameras (e.g., phone rear + front)
  useEffect(() => {
    if (!isOpen) return;

    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          const videoInputs = devices.filter((d) => d.kind === "videoinput");
          setHasMultipleCameras(videoInputs.length > 1);
        })
        .catch(() => {
          // Ignore
        });
    }
  }, [isOpen]);

  // Start camera stream
  const startCamera = async (mode: "environment" | "user") => {
    setIsLoadingCamera(true);
    setCameraError(null);
    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Perangkat atau peramban tidak mendukung akses kamera langsung.");
      }

      let newStream: MediaStream;
      try {
        // Try with requested facingMode and high resolution for crisp text reading
        newStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: mode },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });
      } catch (err) {
        // Fallback for laptops / desktop webcams where 'environment' is not available
        console.warn("Retrying with generic video constraints...", err);
        newStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        await videoRef.current.play();
      }
    } catch (err: any) {
      console.error("[Camera Error]", err);
      let errMsg = "Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan di peramban.";
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        errMsg = "Izin kamera ditolak. Silakan izinkan akses kamera di pengaturan peramban Anda.";
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        errMsg = "Tidak ada perangkat kamera yang terdeteksi di perangkat Anda.";
      }
      setCameraError(errMsg);
    } finally {
      setIsLoadingCamera(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      startCamera(facingMode);
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const toggleFacingMode = () => {
    const nextMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(nextMode);
  };

  const handleCaptureSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw the current video frame onto canvas
    ctx.drawImage(video, 0, 0, width, height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const file = new File([blob], `scan-potret-${timestamp}.jpg`, {
          type: "image/jpeg",
        });
        const previewUrl = URL.createObjectURL(file);

        stopCamera();
        onCapture(file, previewUrl);
        onClose();
      },
      "image/jpeg",
      0.92
    );
  };

  const handleFallbackFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      stopCamera();
      onCapture(file, previewUrl);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm p-3 sm:p-6 flex justify-center items-center">
      <div className="bg-[#251E2B] text-white w-full max-w-xl rounded-3xl sm:rounded-[36px] border border-[#5A4F65] shadow-2xl p-5 sm:p-7 relative my-auto flex flex-col space-y-4 animate-in fade-in zoom-in-95">
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-3 border-b border-white/15">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#51465B] text-[#FFD36D] flex items-center justify-center shrink-0 shadow-xs">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">{title}</h3>
              <p className="text-[11px] sm:text-xs text-gray-300 line-clamp-1">{description}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
            title="Tutup Kamera"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewfinder Video Screen */}
        <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-black rounded-2xl overflow-hidden border border-white/20 flex items-center justify-center">
          {cameraError ? (
            <div className="p-6 text-center space-y-3 max-w-sm">
              <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
              <p className="text-xs text-rose-200 font-medium leading-relaxed">{cameraError}</p>
              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => startCamera(facingMode)}
                  className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-colors inline-flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Coba Lagi</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileFallbackRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-[#51465B] text-[#FFD36D] text-xs font-bold transition-colors inline-flex items-center justify-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Pilih Berkas Foto Komputer / Galeri</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                className="w-full h-full object-cover"
              />

              {/* Viewfinder Target Framing Overlay */}
              <div className="absolute inset-4 sm:inset-6 pointer-events-none border-2 border-dashed border-[#FFD36D]/60 rounded-2xl flex flex-col justify-between p-3">
                <div className="flex justify-between items-start">
                  <span className="w-6 h-6 border-t-3 border-l-3 border-[#FFD36D]" />
                  <span className="text-[10px] font-bold text-white bg-black/50 px-2 py-0.5 rounded-full backdrop-blur-xs">
                    Posisikan Lembar Di Sini
                  </span>
                  <span className="w-6 h-6 border-t-3 border-r-3 border-[#FFD36D]" />
                </div>
                <div className="flex justify-between items-end">
                  <span className="w-6 h-6 border-b-3 border-l-3 border-[#FFD36D]" />
                  <span className="w-6 h-6 border-b-3 border-r-3 border-[#FFD36D]" />
                </div>
              </div>

              {isLoadingCamera && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-2xs flex items-center justify-center gap-2 text-xs font-bold text-white">
                  <RefreshCw className="w-5 h-5 animate-spin text-[#FFD36D]" />
                  <span>Menyiapkan kamera...</span>
                </div>
              )}
            </>
          )}

          {/* Hidden Canvas for Frame Capture */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Action Controls Bar */}
        <div className="flex items-center justify-between pt-1">
          {/* Switch Camera (if available or mobile) */}
          {hasMultipleCameras && !cameraError ? (
            <button
              type="button"
              onClick={toggleFacingMode}
              className="py-2.5 px-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-xs font-bold text-gray-200 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Ganti Kamera Depan/Belakang"
            >
              <SwitchCamera className="w-4 h-4 text-[#FFD36D]" />
              <span className="hidden sm:inline">
                {facingMode === "environment" ? "Kamera Belakang" : "Kamera Depan"}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => fileFallbackRef.current?.click()}
              className="py-2.5 px-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-xs font-bold text-gray-200 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Pilih Berkas"
            >
              <Upload className="w-4 h-4 text-[#FFD36D]" />
              <span className="hidden sm:inline">Pilih File</span>
            </button>
          )}

          {/* Big Shutter Button */}
          {!cameraError && (
            <button
              type="button"
              onClick={handleCaptureSnapshot}
              disabled={isLoadingCamera}
              className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#FFD36D] to-[#FDB040] hover:from-[#FFE085] hover:to-[#FFBD59] text-[#251E2B] flex items-center justify-center shadow-lg hover:shadow-xl transition-all cursor-pointer active:scale-90 mx-auto disabled:opacity-50"
              title="Ambil Foto"
            >
              <div className="w-12 h-12 rounded-full border-2 border-[#251E2B]/50 flex items-center justify-center">
                <Camera className="w-6 h-6 stroke-[2.4]" />
              </div>
            </button>
          )}

          {/* Upload Fallback Link */}
          <button
            type="button"
            onClick={() => fileFallbackRef.current?.click()}
            className="py-2.5 px-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-xs font-bold text-gray-200 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4 text-[#FFD36D]" />
            <span className="hidden sm:inline">Unggah Berkas</span>
          </button>
        </div>

        {/* Hidden Fallback Input */}
        <input
          ref={fileFallbackRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFallbackFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
}
