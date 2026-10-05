import React, { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { Camera, X, AlertTriangle, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEmergency } from '../context/EmergencyContext';
import { parseEmergencyLinkQR } from '../utils/qrUtils';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPatientIdentified: (patientId: string) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onPatientIdentified,
}) => {
  const { user, hasPermission } = useAuth();
  const { getPatientById, getPatientByToken, logAuditAction } = useEmergency();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [accessDeniedMessage, setAccessDeniedMessage] = useState<string | null>(null);
  const [scanSuccessToken, setScanSuccessToken] = useState<string | null>(null);

  // Start Camera Stream
  useEffect(() => {
    if (!isOpen) return;

    setAccessDeniedMessage(null);
    setScanSuccessToken(null);
    setCameraError(null);

    let activeStream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('HTML5 MediaDevices API not supported on this browser context');
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
        });

        activeStream = stream;
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', 'true');
          await videoRef.current.play();
          setCameraActive(true);
          startDecodingFrames();
        }
      } catch (err: any) {
        console.warn('Camera stream error:', err);
        setCameraError(
          err.name === 'NotAllowedError'
            ? 'Camera access permission denied by browser settings.'
            : 'Live camera stream could not be initialized. You may use direct token testing below.'
        );
      }
    };

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const stopCamera = () => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Decode frames using Hidden HTML5 Canvas
  const startDecodingFrames = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const scanFrame = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code && code.data) {
          handleDetectedToken(code.data);
          return; // stop scanning after detection
        }
      }
      animFrameIdRef.current = requestAnimationFrame(scanFrame);
    };

    animFrameIdRef.current = requestAnimationFrame(scanFrame);
  };

  // Handle Token
  const handleDetectedToken = (rawToken: string) => {
    stopCamera();

    const parsed = parseEmergencyLinkQR(rawToken);
    const candidateId = parsed?.patientId || rawToken;

    // 1. Verify Authentication & RBAC Permissions
    const canView = hasPermission('VIEW_EMERGENCY_PROFILE') || hasPermission('VIEW_PATIENT');

    if (!canView) {
      const denialReason = `Role ${user?.role || 'GUEST'} is unauthorized to access emergency patient records`;
      setAccessDeniedMessage(
        "Access Denied: Your role does not have authorization to view this patient's emergency information."
      );

      // Audit Log Access Denied
      logAuditAction(
        'ACCESS_DENIED',
        'DENIED',
        candidateId,
        undefined,
        denialReason,
        `Attempted QR token scan: ${rawToken.substring(0, 20)}...`
      );
      return;
    }

    // 2. Find Patient
    const patient = getPatientById(candidateId) || getPatientByToken(candidateId);

    if (!patient) {
      setAccessDeniedMessage(`Patient identifier "${candidateId}" was not found in the emergency registry.`);
      logAuditAction(
        'SCAN_QR',
        'DENIED',
        candidateId,
        undefined,
        'Invalid or unlinked patient identifier token',
        `Scanned data: ${rawToken}`
      );
      return;
    }

    // 3. Success Flow
    setScanSuccessToken(patient.id);
    logAuditAction(
      'SCAN_QR',
      'SUCCESS',
      patient.id,
      patient.name,
      undefined,
      `Decoded safe token: ${patient.qrToken}`
    );

    setTimeout(() => {
      onPatientIdentified(patient.id);
      onClose();
    }, 900);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-scanner-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 id="qr-scanner-title" className="text-base font-bold text-slate-900">
                Patient QR Identification
              </h2>
              <p className="text-xs text-slate-500">
                HTML5 Video & Canvas Real-time Stream
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Close QR scanner"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Content Body */}
        <div className="p-6">
          {/* Access Denied Dialog Banner */}
          {accessDeniedMessage && (
            <div
              role="alert"
              className="mb-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 animate-in fade-in zoom-in-95 duration-200"
            >
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-sm text-rose-900">Access Denied</h3>
                  <p className="text-xs text-rose-700 mt-1 leading-relaxed">
                    {accessDeniedMessage}
                  </p>
                  <p className="text-[11px] text-rose-600 mt-2 font-mono">
                    Security violation recorded to immutable audit trail.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Success Banner */}
          {scanSuccessToken && (
            <div
              role="status"
              className="mb-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-3 animate-in fade-in"
            >
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <h3 className="font-bold text-sm text-emerald-900">Patient Verified</h3>
                <p className="text-xs text-emerald-700">
                  Patient token authenticated. Opening emergency medical profile...
                </p>
              </div>
            </div>
          )}

          {/* Viewfinder Video Frame Container */}
          <div className="relative aspect-square max-h-[300px] mx-auto bg-slate-950 rounded-xl overflow-hidden shadow-inner flex items-center justify-center">
            {/* Live Video Feed */}
            <video
              ref={videoRef}
              className={`w-full h-full object-cover ${cameraActive ? 'opacity-100' : 'opacity-0'}`}
              playsInline
              muted
            />

            {/* Hidden canvas for real-time frame buffer decoding */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Overlaid SVG Viewfinder Frame */}
            {cameraActive && !scanSuccessToken && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-56 h-56 border-2 border-dashed border-rose-400/80 rounded-2xl relative">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-rose-500 rounded-tl-lg"></div>
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-rose-500 rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-rose-500 rounded-bl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-rose-500 rounded-br-lg"></div>
                  {/* Scanning beam */}
                  <div className="absolute inset-x-2 h-0.5 bg-rose-500/80 shadow-[0_0_8px_#f43f5e] animate-pulse top-1/2 -translate-y-1/2"></div>
                </div>
              </div>
            )}

            {/* Camera Fallback State */}
            {!cameraActive && !scanSuccessToken && (
              <div className="text-center p-6 text-slate-300">
                <Camera className="w-12 h-12 mx-auto text-slate-600 mb-2 stroke-1" />
                <p className="text-xs text-slate-400 font-medium">
                  {cameraError || 'Activating camera viewport...'}
                </p>
              </div>
            )}
          </div>

          <p className="text-center text-xs text-slate-500 mt-3">
            Only safe, randomized identifiers are embedded in QR codes. No raw medical records are exposed.
          </p>

          {/* Quick Simulation Buttons for Testing & Sandbox Evaluation */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Quick Demo Patient Tokens (for sandboxes)
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDetectedToken('P1001')}
                className="p-2 text-left rounded-lg bg-slate-50 hover:bg-blue-50 hover:border-blue-200 border border-slate-200 transition-colors"
              >
                <div className="font-semibold text-xs text-slate-900">Eleanor Vance (P1001)</div>
                <div className="text-[11px] text-slate-500">O- · Critical Allergy: Penicillin</div>
              </button>
              <button
                type="button"
                onClick={() => handleDetectedToken('P1002')}
                className="p-2 text-left rounded-lg bg-slate-50 hover:bg-blue-50 hover:border-blue-200 border border-slate-200 transition-colors"
              >
                <div className="font-semibold text-xs text-slate-900">Marcus Chen (P1002)</div>
                <div className="text-[11px] text-slate-500">A+ · Cardiac / Latex Allergy</div>
              </button>
              <button
                type="button"
                onClick={() => handleDetectedToken('P1003')}
                className="p-2 text-left rounded-lg bg-slate-50 hover:bg-blue-50 hover:border-blue-200 border border-slate-200 transition-colors"
              >
                <div className="font-semibold text-xs text-slate-900">Sophia Rodriguez (P1003)</div>
                <div className="text-[11px] text-slate-500">B+ · Epilepsy / Sulfa Allergy</div>
              </button>
              <button
                type="button"
                onClick={() => handleDetectedToken('UNAUTHORIZED_TOKEN_TEST')}
                className="p-2 text-left rounded-lg bg-rose-50 hover:bg-rose-100/80 border border-rose-200 transition-colors"
              >
                <div className="font-semibold text-xs text-rose-800 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-rose-600" />
                  Test Access Denial
                </div>
                <div className="text-[11px] text-rose-600">Simulate unauthorized attempt</div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            type="button"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
        </footer>
      </div>
    </div>
  );
};
