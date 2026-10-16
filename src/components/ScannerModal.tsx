import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Upload, X, RefreshCw, AlertCircle, Sparkles, Image as ImageIcon, CheckCircle, Zap } from 'lucide-react';
import { SAMPLE_FOODS, SampleFoodItem } from '../data/sampleFoods';

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalyzeImage: (base64Data: string, mimeType: string) => Promise<void>;
  onSelectSample: (sample: SampleFoodItem) => void;
  isAnalyzing: boolean;
}

export const ScannerModal: React.FC<ScannerModalProps> = ({
  isOpen,
  onClose,
  onAnalyzeImage,
  onSelectSample,
  isAnalyzing,
}) => {
  const [mode, setMode] = useState<'camera' | 'upload'>('upload');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [scanStepIndex, setScanStepIndex] = useState(0);
  const [fileError, setFileError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const scanSteps = [
    'Scanning package typography & logos...',
    'Extracting Nutrition Facts panel & serving sizes...',
    'Deconstructing ingredient list & E-numbers...',
    'Checking NOVA ultra-processed thresholds...',
    'Cross-referencing food additives safety database...',
    'Synthesizing final health score & recommendations...'
  ];

  // Cycling scan step messages during analysis
  useEffect(() => {
    let interval: any;
    if (isAnalyzing) {
      interval = setInterval(() => {
        setScanStepIndex((prev) => (prev + 1) % scanSteps.length);
      }, 1400);
    } else {
      setScanStepIndex(0);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  // Handle camera start
  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError(
        'Unable to access camera. Please allow camera permissions in your browser or switch to Photo Upload.'
      );
    }
  }, [facingMode]);

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Manage camera lifecycle
  useEffect(() => {
    if (isOpen && mode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, mode, startCamera, stopCamera]);

  // Capture snapshot from camera
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setPreviewImage(dataUrl);
    setMimeType('image/jpeg');
    stopCamera();
  };

  // Handle file chosen via input or drop
  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setFileError('Please select a valid image file (JPEG, PNG, WEBP).');
      return;
    }
    setFileError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreviewImage(result);
      setMimeType(file.type || 'image/jpeg');
    };
    reader.readAsDataURL(file);
  };

  // Drag & drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Clipboard paste listener (Cmd+V / Ctrl+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!isOpen) return;
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) handleFile(file);
          break;
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen]);

  // Start analysis on selected preview image
  const triggerAnalysis = async () => {
    if (!previewImage) return;
    await onAnalyzeImage(previewImage, mimeType);
  };

  // Retake or pick another image
  const resetImage = () => {
    setPreviewImage(null);
    if (mode === 'camera') {
      startCamera();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Scan Packaged Food</h2>
              <p className="text-xs text-slate-400">
                Front label, Nutrition Facts panel, or Ingredients
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isAnalyzing}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs (only if no preview image yet) */}
        {!previewImage && !isAnalyzing && (
          <div className="flex border-b border-slate-800 bg-slate-900/50 p-1.5 mx-5 mt-4 rounded-xl border">
            <button
              onClick={() => {
                setMode('upload');
                stopCamera();
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition ${
                mode === 'upload'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              Upload / Drop Image
            </button>
            <button
              onClick={() => {
                setMode('camera');
                startCamera();
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition ${
                mode === 'camera'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              Live Camera
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1">
          {/* STATE 1: Analyzing Active */}
          {isAnalyzing && (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
              <div className="relative w-48 h-48 rounded-2xl overflow-hidden border-2 border-emerald-500/50 shadow-xl shadow-emerald-500/10 mb-6 bg-slate-950">
                {previewImage && (
                  <img
                    src={previewImage}
                    alt="Scanning target"
                    className="w-full h-full object-cover opacity-60"
                  />
                )}
                {/* Laser scan line animation */}
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#34d399] animate-[bounce_2s_infinite]" />
                <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none" />
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-slate-900/90 text-[10px] font-mono text-emerald-400 border border-emerald-500/30">
                  SCANNING
                </div>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                LabelLens Neural Vision Active
              </div>

              <h3 className="text-base font-bold text-white mb-1">
                Decoding Food Package & Nutrition
              </h3>
              <p className="text-xs text-slate-300 max-w-sm h-8 font-medium">
                {scanSteps[scanStepIndex]}
              </p>

              <div className="w-full max-w-xs bg-slate-800 h-1.5 rounded-full overflow-hidden mt-4">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full w-full animate-pulse" />
              </div>
            </div>
          )}

          {/* STATE 2: Preview Ready to Analyze */}
          {!isAnalyzing && previewImage && (
            <div className="flex flex-col items-center">
              <div className="relative max-h-72 w-full max-w-md rounded-xl overflow-hidden border border-slate-700 bg-slate-950 flex items-center justify-center">
                <img
                  src={previewImage}
                  alt="Food to scan"
                  className="max-h-72 w-auto object-contain"
                />
                <button
                  onClick={resetImage}
                  className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-sm text-xs text-slate-300 hover:text-white border border-slate-700 hover:border-slate-500 flex items-center gap-1.5 transition"
                >
                  <RefreshCw className="w-3 h-3" />
                  Retake
                </button>
              </div>

              <div className="mt-4 p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 w-full max-w-md text-xs text-slate-300 flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">Image captured!</span>
                  <p className="text-slate-400 mt-0.5">
                    Click "Analyze Package" to detect the brand, nutrition facts, additives, NOVA score, and allergens.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full max-w-md mt-5">
                <button
                  onClick={resetImage}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold transition"
                >
                  Choose Different Photo
                </button>
                <button
                  onClick={triggerAnalysis}
                  className="flex-[1.5] py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4 fill-slate-950" />
                  Analyze Package Now
                </button>
              </div>
            </div>
          )}

          {/* STATE 3: Mode is Upload */}
          {!isAnalyzing && !previewImage && mode === 'upload' && (
            <div>
              {fileError && (
                <div className="mb-3 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{fileError}</span>
                </div>
              )}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 flex flex-col items-center justify-center cursor-pointer transition text-center ${
                  dragActive
                    ? 'border-emerald-400 bg-emerald-500/10'
                    : 'border-slate-700 hover:border-slate-500 bg-slate-800/30 hover:bg-slate-800/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFile(e.target.files[0]);
                    }
                  }}
                />
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                  <Upload className="w-7 h-7 stroke-[2]" />
                </div>
                <p className="text-sm font-bold text-white mb-1">
                  Click to browse or drop food photo here
                </p>
                <p className="text-xs text-slate-400 max-w-sm mb-3">
                  Supports JPEG, PNG, WEBP. You can also paste an image from your clipboard (Ctrl + V).
                </p>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-[11px] font-medium text-slate-300 border border-slate-700">
                  <ImageIcon className="w-3 h-3 text-emerald-400" />
                  Box front, ingredients list, or nutrition table
                </span>
              </div>

              {/* Sample Packaged Foods Quick Select */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Or Try Instant Preset Examples
                  </span>
                  <span className="text-[11px] text-slate-500">1-click demo</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SAMPLE_FOODS.map((sample) => (
                    <button
                      key={sample.id}
                      onClick={() => {
                        onSelectSample(sample);
                        onClose();
                      }}
                      className="group p-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 hover:border-emerald-500/40 text-left transition flex flex-col"
                    >
                      <div className="w-full h-16 rounded-lg overflow-hidden bg-slate-900 mb-2 relative">
                        <img
                          src={sample.imageUrl}
                          alt={sample.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                        <span
                          className={`absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            sample.data.healthScore >= 80
                              ? 'bg-emerald-500 text-slate-950'
                              : sample.data.healthScore >= 50
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-rose-500 text-white'
                          }`}
                        >
                          {sample.data.healthScore}/100
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-white truncate">
                        {sample.name}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate">
                        {sample.brand}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STATE 4: Mode is Camera */}
          {!isAnalyzing && !previewImage && mode === 'camera' && (
            <div className="flex flex-col items-center">
              {cameraError ? (
                <div className="p-6 text-center max-w-md">
                  <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-3">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">Camera Inaccessible</h4>
                  <p className="text-xs text-slate-400 mb-4">{cameraError}</p>
                  <button
                    onClick={() => {
                      setMode('upload');
                      stopCamera();
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-emerald-400 border border-slate-700 transition"
                  >
                    Switch to Photo Upload
                  </button>
                </div>
              ) : (
                <div className="w-full flex flex-col items-center">
                  <div className="relative w-full max-w-md h-72 sm:h-80 bg-black rounded-2xl overflow-hidden border border-slate-700 flex items-center justify-center">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />

                    {/* Viewfinder Target Guidelines */}
                    <div className="absolute inset-8 border border-white/30 rounded-xl pointer-events-none flex flex-col justify-between p-2">
                      <div className="flex justify-between">
                        <div className="w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
                        <div className="w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
                      </div>
                      <div className="text-center">
                        <span className="px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-sm text-[11px] font-medium text-emerald-300 border border-emerald-500/30">
                          Align nutrition facts or food package here
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <div className="w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
                        <div className="w-4 h-4 border-b-2 border-r-2 border-emerald-400" />
                      </div>
                    </div>

                    {/* Switch camera button */}
                    <button
                      onClick={() =>
                        setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))
                      }
                      className="absolute top-3 right-3 p-2 rounded-xl bg-slate-900/80 backdrop-blur-sm text-slate-300 hover:text-white border border-slate-700 hover:border-slate-500 transition"
                      title="Flip camera"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Shutter Button */}
                  <div className="mt-5 flex items-center justify-center">
                    <button
                      onClick={capturePhoto}
                      className="group relative w-16 h-16 rounded-full border-4 border-emerald-500/50 flex items-center justify-center hover:border-emerald-400 transition active:scale-95 shadow-lg shadow-emerald-500/20"
                      title="Take snapshot"
                    >
                      <div className="w-12 h-12 rounded-full bg-emerald-400 group-hover:bg-emerald-300 transition" />
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-2 font-medium">
                    Tap to snap photo for analysis
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Hidden Canvas for Frame Capture */}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      </div>
    </div>
  );
};
