import React, { useState, useEffect } from 'react';
import { History, Trash2, Award, Calculator, Download, Calendar, ArrowRight, ExternalLink } from 'lucide-react';
import { fetchReports, deleteReport } from '../utils/api';

export default function ReportsHistory({ setActivePage }) {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // 'ALL', 'SGPA', 'CGPA'
  const [selectedReport, setSelectedReport] = useState(null);

  const loadAllReports = async () => {
    setIsLoading(true);
    try {
      const res = await fetchReports();
      setReports(res.reports || []);
    } catch (e) {
      console.warn('Failed to load from server, using localStorage:', e);
      try {
        const local = JSON.parse(localStorage.getItem('vtu_vidya_reports') || '[]');
        setReports(local);
      } catch (err) {
        setReports([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllReports();
  }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this report?')) return;
    try {
      await deleteReport(id);
    } catch (err) {
      console.warn('Failed to delete on server, updating local storage:', err);
    }
    const updated = reports.filter(r => r.id !== id);
    setReports(updated);
    try {
      localStorage.setItem('vtu_vidya_reports', JSON.stringify(updated));
    } catch (e) {}
    if (selectedReport?.id === id) {
      setSelectedReport(null);
    }
  };

  const filteredReports = reports.filter(r => {
    if (filter === 'ALL') return true;
    return r.type === filter;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 md:py-10 space-y-8">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold mb-2">
            <History className="w-3.5 h-3.5 text-emerald-600" />
            <span>VTU-Vidya • Local Archive</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Saved Calculation Reports
          </h1>
          <p className="text-xs text-slate-500">
            by neeraj&tarun • Persistent history of your semester scores & calculations.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold border border-slate-200 self-start sm:self-auto">
          {['ALL', 'SGPA', 'CGPA'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter === f
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {f === 'ALL' ? 'All Reports' : `${f} Only`}
            </button>
          ))}
        </div>
      </div>

      {/* Reports Grid */}
      {isLoading ? (
        <div className="text-center py-16 text-slate-400 text-sm">
          Loading saved calculations...
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 p-12 text-center bg-white space-y-3">
          <History className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">
            No saved reports yet
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Calculate your SGPA or CGPA, then click "Save Calculation" on the report card to store it here.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => setActivePage('sgpa')}
              className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700"
            >
              Go to SGPA Calculator
            </button>
            <button
              onClick={() => setActivePage('cgpa')}
              className="px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-slate-900"
            >
              Go to CGPA Calculator
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReports.map((item) => {
            const isSgpa = item.type === 'SGPA';
            return (
              <div
                key={item.id}
                onClick={() => setSelectedReport(item)}
                className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between space-y-3 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-bold ${
                      isSgpa
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-teal-50 text-teal-800 border border-teal-200'
                    }`}>
                      {isSgpa ? <Calculator className="w-3 h-3" /> : <Award className="w-3 h-3" />}
                      {item.type}
                    </span>

                    <button
                      onClick={(e) => handleDelete(item.id, e)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete Report"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                    {item.title || `${item.type} Report`}
                  </h3>

                  <p className="text-xs text-slate-500 mt-1">
                    {item.branch ? `${item.branch} • ` : ''}{item.scheme} Scheme
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 mr-1.5 font-medium">{item.type}:</span>
                    <span className="text-xl font-extrabold text-emerald-600 font-mono">
                      {typeof item.score === 'number' ? item.score.toFixed(2) : item.score}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div 
            className="relative bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {selectedReport.title}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedReport.scheme} Scheme {selectedReport.branch ? `• ${selectedReport.branch}` : ''}
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-emerald-600 font-mono">
                  {selectedReport.score}
                </span>
                <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  {selectedReport.type}
                </span>
              </div>
            </div>

            {/* Breakdown List */}
            {selectedReport.breakdown && (
              <div className="max-h-64 overflow-y-auto rounded-xl border border-slate-200 text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 sticky top-0">
                    <tr>
                      <th className="px-3 py-2">Item</th>
                      <th className="px-3 py-2 text-center">Credits</th>
                      <th className="px-3 py-2 text-center">Marks/SGPA</th>
                      <th className="px-3 py-2 text-center">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedReport.breakdown.map((b, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-3 py-2 font-medium text-slate-900">
                          {b.name || b.code || `Semester ${b.semester}`}
                        </td>
                        <td className="px-3 py-2 text-center font-mono text-slate-600">
                          {b.credits}
                        </td>
                        <td className="px-3 py-2 text-center font-mono font-bold text-slate-700">
                          {b.marks ?? b.sgpa}
                        </td>
                        <td className="px-3 py-2 text-center font-mono font-bold text-emerald-700">
                          {b.gradeCredits ?? b.weightedSgpa}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

