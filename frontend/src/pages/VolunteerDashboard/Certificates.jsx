import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Award, Download, AlertTriangle, RefreshCw, FileText, CheckCircle2 } from 'lucide-react';

export default function Certificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [error, setError] = useState('');

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/certificates/my-certificates');
      setCertificates(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch certificate records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const triggerDownload = async (certId, eventTitle) => {
    setDownloadingId(certId);
    setError('');
    try {
      const response = await axios.get(`/certificates/${certId}/download`, {
        responseType: 'blob',
      });
      
      const fileBlob = new Blob([response.data], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(fileBlob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      // Clean filename
      const cleanTitle = eventTitle.replace(/\s+/g, '_');
      link.setAttribute('download', `Certificate_${cleanTitle}.pdf`);
      
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error(err);
      setError('Certificate download failed. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 text-orange-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left">
      <div className="flex justify-between items-center border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-800">My Certificates</h1>
          <p className="text-xs text-slate-400">Download certificates of appreciation for completed events</p>
        </div>
        <button
          onClick={fetchCertificates}
          className="flex items-center gap-1.5 border border-slate-200 text-slate-600 font-semibold text-xs px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-all"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 text-rose-800 p-3.5 rounded-2xl text-xs font-semibold">
          <AlertTriangle className="h-4.5 w-4.5 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {certificates.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-3">
          <Award className="h-12 w-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700 text-sm">No Certificates Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            Certificates are automatically generated when you attend and check out of an event. Go log some hours!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((cert) => {
            const issueStr = new Date(cert.issueDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });
            const eventTitle = cert.event?.title || 'Completed Campaign';

            return (
              <div
                key={cert._id}
                className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-orange-50 p-3 rounded-2xl text-orange-600 flex-shrink-0">
                    <Award className="h-6 w-6" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <h3 className="font-bold text-slate-800 text-sm truncate">{eventTitle}</h3>
                    <p className="text-[10px] text-slate-400">Issued: {issueStr}</p>
                    <p className="text-[9px] text-slate-400 font-mono">Code: {cert.certificateCode}</p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Verified Award
                  </div>
                  <button
                    onClick={() => triggerDownload(cert._id, eventTitle)}
                    disabled={downloadingId === cert._id}
                    className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-[10px] px-4 py-2 rounded-xl transition-all disabled:opacity-50 shadow-sm"
                  >
                    {downloadingId === cert._id ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Download className="h-3.5 w-3.5" />
                    )}
                    Download PDF
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
