import React, { useState } from 'react';
import { QrCode, Scan, Keyboard, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

export default function QRCodeScanner({ eventId, participants = [], onCheckIn, onCheckOut, logs = [] }) {
  const [mode, setMode] = useState('simulate'); // 'simulate' or 'manual'
  const [manualId, setManualId] = useState('');
  const [scannerActive, setScannerActive] = useState(false);
  const [scannedResult, setScannedResult] = useState(null);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const triggerFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback({ type: '', message: '' }), 4000);
  };

  const handleSimulatedScan = async (volunteerId, volunteerName) => {
    setScannerActive(true);
    setScannedResult(null);
    
    // Simulate camera check delay
    setTimeout(async () => {
      setScannerActive(false);
      setScannedResult({ id: volunteerId, name: volunteerName });
      
      // Determine if check-in or check-out is needed based on logs
      const isAlreadyCheckedIn = logs.some(
        (log) => log.volunteer?._id === volunteerId && !log.checkOutTime
      );

      try {
        if (isAlreadyCheckedIn) {
          await onCheckOut(volunteerId);
          triggerFeedback('success', `Checked Out: ${volunteerName} hours recorded!`);
        } else {
          await onCheckIn(volunteerId);
          triggerFeedback('success', `Checked In: ${volunteerName} marked present!`);
        }
      } catch (err) {
        triggerFeedback('error', err.response?.data?.message || 'Transaction failed');
      }
    }, 1200);
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualId.trim()) return;

    // Look for matching participant name
    const match = participants.find(p => p._id === manualId.trim() || p.user?._id === manualId.trim());
    const volunteerName = match ? match.fullName : `Volunteer ID: ${manualId.substring(0, 8)}`;
    
    const isAlreadyCheckedIn = logs.some(
      (log) => (log.volunteer?._id === manualId || log.volunteer === manualId) && !log.checkOutTime
    );

    try {
      if (isAlreadyCheckedIn) {
        await onCheckOut(manualId);
        triggerFeedback('success', `Checked Out: ${volunteerName}!`);
      } else {
        await onCheckIn(manualId);
        triggerFeedback('success', `Checked In: ${volunteerName}!`);
      }
      setManualId('');
    } catch (err) {
      triggerFeedback('error', err.response?.data?.message || 'Submission failed');
    }
  };

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div className="bg-orange-100 p-2 rounded-xl text-orange-600">
            <QrCode className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">QR Attendance System</h3>
            <p className="text-xs text-slate-400">Scan volunteer badges or enter ID details</p>
          </div>
        </div>

        {/* Toggle Mode */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setMode('simulate')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
              mode === 'simulate' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Scan className="h-3.5 w-3.5" />
            Scanner Simulator
          </button>
          <button
            onClick={() => setMode('manual')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
              mode === 'manual' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Keyboard className="h-3.5 w-3.5" />
            Manual Input
          </button>
        </div>
      </div>

      {/* Dynamic Notifications */}
      {feedback.message && (
        <div
          className={`mb-4 flex items-center gap-2 p-3.5 rounded-xl border text-xs font-medium ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
              : 'bg-rose-50 border-rose-100 text-rose-800'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 flex-shrink-0" />
          ) : (
            <ShieldAlert className="h-4.5 w-4.5 text-rose-600 flex-shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Simulator Mode Panel */}
      {mode === 'simulate' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Simulated Scanner Viewfinder */}
          <div className="relative aspect-video rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center text-center overflow-hidden">
            {/* Viewfinder crosshairs */}
            <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-orange-500" />
            <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-orange-500" />
            <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-orange-500" />
            <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-orange-500" />

            {/* Laser line overlay */}
            {scannerActive && (
              <div className="absolute left-0 right-0 h-0.5 bg-orange-500/80 shadow-[0_0_10px_#f97316] top-1/2 animate-bounce" />
            )}

            {scannerActive ? (
              <div className="space-y-2 text-white">
                <Sparkles className="h-8 w-8 text-orange-500 animate-spin mx-auto" />
                <p className="text-xs font-medium text-slate-300">Accessing Camera Feed...</p>
                <p className="text-[10px] text-slate-500">Scanning details...</p>
              </div>
            ) : scannedResult ? (
              <div className="space-y-1.5 text-white p-4">
                <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
                <p className="text-xs font-semibold text-slate-200">Decoded Badge Successful</p>
                <p className="text-[10px] text-slate-400 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700">
                  {scannedResult.name}
                </p>
              </div>
            ) : (
              <div className="space-y-1 text-slate-500">
                <Scan className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-400">Scanner Standby</p>
                <p className="text-[10px] text-slate-500">Click a volunteer card on the right to simulate scanning</p>
              </div>
            )}
          </div>

          {/* Participant list triggers */}
          <div className="flex flex-col">
            <h4 className="font-semibold text-slate-700 text-xs mb-2.5">Registered Event Participants</h4>
            {participants.length === 0 ? (
              <div className="flex-1 border border-dashed border-slate-200 rounded-xl flex items-center justify-center p-6 text-center text-xs text-slate-400">
                No registered volunteers for this event
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto space-y-1.5 border border-slate-100 p-2 rounded-xl bg-slate-50/50">
                {participants.map((p) => {
                  const activeLog = logs.find(log => log.volunteer?._id === p._id && !log.checkOutTime);
                  return (
                    <div
                      key={p._id}
                      className="flex items-center justify-between bg-white border border-slate-100 p-2.5 rounded-lg shadow-sm"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-700 truncate">{p.fullName}</p>
                        <p className="text-[10px] text-slate-400 truncate">ID: {p._id.substring(16)}</p>
                      </div>
                      <button
                        onClick={() => handleSimulatedScan(p._id, p.fullName)}
                        disabled={scannerActive}
                        className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors shadow-sm ${
                          activeLog
                            ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {activeLog ? 'Scan Out' : 'Scan In'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Manual Input Panel */}
      {mode === 'manual' && (
        <form onSubmit={handleManualSubmit} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Enter Volunteer ID / User ID Code
            </label>
            <input
              type="text"
              value={manualId}
              onChange={(e) => setManualId(e.target.value)}
              placeholder="e.g. 660c15f9b4c05342a8a815a1"
              className="w-full text-xs bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-sm"
          >
            Submit Transaction
          </button>
        </form>
      )}
    </div>
  );
}
