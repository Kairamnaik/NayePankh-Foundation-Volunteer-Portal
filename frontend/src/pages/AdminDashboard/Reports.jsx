import React, { useState } from 'react';
import axios from 'axios';
import { FileSpreadsheet, FileText, Download, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function Reports() {
  const [downloading, setDownloading] = useState(''); // e.g. 'volunteers_csv', etc.
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleDownload = async (reportType, format) => {
    const loaderKey = `${reportType}_${format}`;
    setDownloading(loaderKey);
    setError('');
    setSuccess('');

    try {
      const mimeType = format === 'csv' ? 'text/csv' : 'application/pdf';
      const fileExt = format === 'csv' ? 'csv' : 'pdf';
      
      const response = await axios.get(`/reports/${reportType}/${format}`, {
        responseType: 'blob',
      });

      const fileBlob = new Blob([response.data], { type: mimeType });
      const downloadUrl = window.URL.createObjectURL(fileBlob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      // Formatted date string for file naming
      const dateStr = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `NayePankh_${reportType}_Report_${dateStr}.${fileExt}`);
      
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      
      setSuccess(`Successfully exported ${reportType} report as ${format.toUpperCase()}`);
      setTimeout(() => setSuccess(''), 4500);
    } catch (err) {
      console.error(err);
      setError(`Failed to export ${reportType} report. Please verify connection credentials.`);
    } finally {
      setDownloading('');
    }
  };

  const reportsList = [
    {
      type: 'volunteers',
      title: 'Volunteer Roster Report',
      desc: 'Contains complete details of all registered volunteers, emergency contact information, cumulative hours worked, and badge tiers.',
    },
    {
      type: 'events',
      title: 'Campaign Conducted Report',
      desc: 'Contains details of all scheduled events, categories, vacancy numbers, reward credits, locations, and current execution statuses.',
    },
    {
      type: 'attendance',
      title: 'Attendance Check-in Log',
      desc: 'Contains full records of daily check-ins and check-outs, specific hours credited per volunteer, and admin verification indicators.',
    },
  ];

  return (
    <div className="space-y-8 text-left">
      <div className="border-b border-slate-100 pb-5">
        <h1 className="text-2xl font-black text-slate-800">Export Reports</h1>
        <p className="text-xs text-slate-400">Generate and download official NGO records in CSV or PDF formats</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 text-rose-800 p-3.5 rounded-2xl text-xs font-semibold">
          <ShieldAlert className="h-4.5 w-4.5 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-800 p-3.5 rounded-2xl text-xs font-semibold">
          <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Reports Options list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportsList.map((rep) => (
          <div
            key={rep.type}
            className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between"
          >
            <div className="space-y-2">
              <h3 className="font-bold text-slate-800 text-sm">{rep.title}</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">{rep.desc}</p>
            </div>

            {/* Actions: CSV or PDF */}
            <div className="mt-8 pt-4 border-t border-slate-50 grid grid-cols-2 gap-3">
              {/* CSV button */}
              <button
                onClick={() => handleDownload(rep.type, 'csv')}
                disabled={!!downloading}
                className="flex items-center justify-center gap-1.5 bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs py-3 rounded-2xl hover:bg-slate-100 transition-all disabled:opacity-50"
              >
                <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                {downloading === `${rep.type}_csv` ? 'Exporting...' : 'Export CSV'}
              </button>

              {/* PDF button */}
              <button
                onClick={() => handleDownload(rep.type, 'pdf')}
                disabled={!!downloading}
                className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs py-3 rounded-2xl transition-all disabled:opacity-50"
              >
                <FileText className="h-4 w-4 text-orange-500" />
                {downloading === `${rep.type}_pdf` ? 'Exporting...' : 'Export PDF'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* SLA Note */}
      <div className="bg-amber-50/50 border border-amber-100/60 p-4 rounded-3xl text-[10px] text-amber-800 leading-relaxed max-w-xl">
        <strong>Important Data Note:</strong> All generated reports comply with the NayePankh Foundation standard auditing policies. Make sure you treat volunteer details in exported sheets with privacy and data protection standards.
      </div>
    </div>
  );
}
