import { useState, useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { v4 as uuidv4 } from 'uuid';
import { Camera, CameraOff, CheckCircle, XCircle, AlertTriangle, RotateCcw } from 'lucide-react';
import { getAttendeeById, addRecord, getAttendeeLastAction } from '../db';
import { AttendanceRecord } from '../types';

export default function QRScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{
    type: 'success' | 'error' | 'warning';
    message: string;
    detail?: string;
    record?: AttendanceRecord;
  } | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastScanRef = useRef<string>('');
  const lastScanTimeRef = useRef<number>(0);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        if (state === 2) {
          await scannerRef.current.stop();
        }
      } catch {
        // ignore
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  }, []);

  const handleScan = useCallback((decodedText: string) => {
    const now = Date.now();
    if (decodedText === lastScanRef.current && now - lastScanTimeRef.current < 3000) {
      return;
    }
    lastScanRef.current = decodedText;
    lastScanTimeRef.current = now;

    try {
      const data = JSON.parse(decodedText);
      const attendeeId = data.id;

      if (!attendeeId) {
        setScanResult({
          type: 'error',
          message: 'Invalid QR Code',
          detail: 'This QR code does not contain valid attendee data.',
        });
        return;
      }

      const attendee = getAttendeeById(attendeeId);
      if (!attendee) {
        setScanResult({
          type: 'warning',
          message: 'Attendee Not Found',
          detail: `No attendee registered with ID: ${attendeeId}`,
        });
        return;
      }

      const lastAction = getAttendeeLastAction(attendeeId);
      const actionType: 'check-in' | 'check-out' = 
        lastAction && lastAction.type === 'check-in' ? 'check-out' : 'check-in';

      const record: AttendanceRecord = {
        id: uuidv4(),
        attendeeId: attendee.id,
        attendeeName: attendee.name,
        attendeeEmail: attendee.email,
        attendeeDepartment: attendee.department,
        timestamp: new Date().toISOString(),
        type: actionType,
      };

      addRecord(record);

      setScanResult({
        type: 'success',
        message: `${actionType === 'check-in' ? 'Checked In' : 'Checked Out'} Successfully!`,
        detail: attendee.name,
        record,
      });
    } catch {
      setScanResult({
        type: 'error',
        message: 'Invalid QR Code',
        detail: 'Could not parse QR code data. Make sure to use a valid attendee QR code.',
      });
    }

    setTimeout(() => setScanResult(null), 4000);
  }, []);

  const startScanner = useCallback(async () => {
    setCameraError(null);
    setScanResult(null);

    try {
      if (scannerRef.current) {
        try {
          const state = scannerRef.current.getState();
          if (state === 2) {
            await scannerRef.current.stop();
          }
        } catch {
          // ignore
        }
      }

      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        handleScan,
        () => {}
      );

      setIsScanning(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setCameraError(
        message.includes('NotAllowedError') || message.includes('Permission')
          ? 'Camera access denied. Please allow camera permission and try again.'
          : message.includes('NotFoundError')
          ? 'No camera found on this device.'
          : `Camera error: ${message}`
      );
      setIsScanning(false);
    }
  }, [handleScan]);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        try {
          const state = scannerRef.current.getState();
          if (state === 2) {
            scannerRef.current.stop();
          }
        } catch {
          // ignore
        }
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">QR Scanner</h2>
        <p className="text-gray-500 dark:text-slate-400 text-sm">Scan attendee QR codes to record check-in/check-out</p>
      </div>

      {/* Scanner Area */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="relative">
          <div
            id="qr-reader"
            className={`w-full ${isScanning ? 'min-h-[350px]' : 'h-0 overflow-hidden'}`}
          />

          {!isScanning && !cameraError && (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 flex items-center justify-center mb-6">
                <Camera size={40} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Ready to Scan</h3>
              <p className="text-gray-500 dark:text-slate-400 text-sm text-center max-w-xs mb-6">
                Point your camera at an attendee's QR code to automatically record their attendance
              </p>
              <button
                onClick={startScanner}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 text-lg"
              >
                <Camera size={22} />
                Start Camera
              </button>
            </div>
          )}

          {cameraError && (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="w-20 h-20 rounded-full bg-red-50 dark:bg-red-950/50 flex items-center justify-center mb-4">
                <CameraOff size={36} className="text-red-500 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-2">Camera Error</h3>
              <p className="text-red-500 dark:text-red-400 text-sm text-center max-w-sm mb-4">{cameraError}</p>
              <button
                onClick={startScanner}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all"
              >
                <RotateCcw size={18} />
                Try Again
              </button>
            </div>
          )}
        </div>

        {isScanning && (
          <div className="p-4 border-t border-gray-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Camera Active</span>
              </div>
              <button
                onClick={stopScanner}
                className="bg-red-100 dark:bg-red-950/50 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all"
              >
                <CameraOff size={16} />
                Stop Camera
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Scan Result Toast */}
      {scanResult && (
        <div className={`rounded-2xl p-5 shadow-lg border-2 transition-all animate-bounce-in ${
          scanResult.type === 'success'
            ? 'bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-800'
            : scanResult.type === 'warning'
            ? 'bg-yellow-50 dark:bg-yellow-950/50 border-yellow-200 dark:border-yellow-800'
            : 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800'
        }`}>
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
              scanResult.type === 'success'
                ? 'bg-green-100 dark:bg-green-900/50'
                : scanResult.type === 'warning'
                ? 'bg-yellow-100 dark:bg-yellow-900/50'
                : 'bg-red-100 dark:bg-red-900/50'
            }`}>
              {scanResult.type === 'success' ? (
                <CheckCircle size={24} className="text-green-600 dark:text-green-400" />
              ) : scanResult.type === 'warning' ? (
                <AlertTriangle size={24} className="text-yellow-600 dark:text-yellow-400" />
              ) : (
                <XCircle size={24} className="text-red-600 dark:text-red-400" />
              )}
            </div>
            <div>
              <h3 className={`font-bold text-lg ${
                scanResult.type === 'success'
                  ? 'text-green-800 dark:text-green-300'
                  : scanResult.type === 'warning'
                  ? 'text-yellow-800 dark:text-yellow-300'
                  : 'text-red-800 dark:text-red-300'
              }`}>
                {scanResult.message}
              </h3>
              {scanResult.detail && (
                <p className={`text-sm mt-1 ${
                  scanResult.type === 'success'
                    ? 'text-green-600 dark:text-green-400'
                    : scanResult.type === 'warning'
                    ? 'text-yellow-600 dark:text-yellow-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {scanResult.detail}
                </p>
              )}
              {scanResult.record && (
                <div className="mt-2 flex gap-3 text-sm">
                  <span className={`px-2 py-0.5 rounded-full font-medium ${
                    scanResult.record.type === 'check-in'
                      ? 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200'
                      : 'bg-orange-200 dark:bg-orange-800 text-orange-800 dark:text-orange-200'
                  }`}>
                    {scanResult.record.type === 'check-in' ? '↓ Check In' : '↑ Check Out'}
                  </span>
                  <span className="text-gray-500 dark:text-slate-400">
                    {new Date(scanResult.record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Manual Entry */}
      <ManualEntry onScan={handleScan} />

      {/* Instructions */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800 rounded-2xl p-6 border border-transparent dark:border-slate-700 transition-colors">
        <h3 className="font-semibold text-gray-800 dark:text-white mb-3">📋 How it works</h3>
        <div className="space-y-2 text-sm text-gray-600 dark:text-slate-400">
          <p className="flex items-start gap-2">
            <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full w-5 h-5 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">1</span>
            Click "Start Camera" to activate the QR scanner
          </p>
          <p className="flex items-start gap-2">
            <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full w-5 h-5 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">2</span>
            Point the camera at an attendee's QR code
          </p>
          <p className="flex items-start gap-2">
            <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full w-5 h-5 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">3</span>
            The system auto-detects check-in or check-out
          </p>
          <p className="flex items-start gap-2">
            <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full w-5 h-5 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">4</span>
            Attendance is recorded instantly
          </p>
        </div>
      </div>
    </div>
  );
}

function ManualEntry({ onScan }: { onScan: (data: string) => void }) {
  const [showManual, setShowManual] = useState(false);
  const [manualId, setManualId] = useState('');

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualId.trim()) return;

    const data = JSON.stringify({ id: manualId.trim() });
    onScan(data);
    setManualId('');
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
      <button
        onClick={() => setShowManual(!showManual)}
        className="w-full flex items-center justify-between text-sm text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white"
      >
        <span className="font-medium">⌨️ Manual Entry (by Attendee ID)</span>
        <span className="text-xs">{showManual ? '▲' : '▼'}</span>
      </button>
      {showManual && (
        <form onSubmit={handleManualSubmit} className="mt-3 flex gap-2">
          <input
            type="text"
            value={manualId}
            onChange={e => setManualId(e.target.value)}
            placeholder="Enter attendee ID..."
            className="flex-1 px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
          />
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all"
          >
            Submit
          </button>
        </form>
      )}
    </div>
  );
}
