import React, { useState, useRef } from 'react';
import { Award, Download, Save, RefreshCw, CheckCircle2, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import html2canvas from 'html2canvas';
import { calculateCGPA, saveReport } from '../utils/api';

const SEMESTER_NAMES = [
  "1st Semester", "2nd Semester", "3rd Semester", "4th Semester",
  "5th Semester", "6th Semester", "7th Semester", "8th Semester"
];

const SCHEME_CREDITS = {
  "2018": [20, 20, 24, 24, 24, 24, 20, 18],
  "2021": [20, 20, 18, 22, 18, 22, 24, 16],
  "2022": [20, 20, 21, 19, 22, 18, 24, 16],
  "2025_CS": [20, 20, 21, 21, 22, 21, 20, 15],
  "2025_OTHER": [20, 20, 21, 22, 21, 21, 20, 15]
};

export default function CGPACalculator({ onSavedReportAlert }) {
  const [selectedScheme, setSelectedScheme] = useState('2025');
  const [branchGroup, setBranchGroup] = useState('cs'); // 'cs' or 'other'
  const [sgpaInputs, setSgpaInputs] = useState(Array(8).fill(''));
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const reportRef = useRef(null);

  // Determine active credit weights
  const activeWeights = selectedScheme === '2025'
    ? (branchGroup === 'cs' ? SCHEME_CREDITS['2025_CS'] : SCHEME_CREDITS['2025_OTHER'])
    : (SCHEME_CREDITS[selectedScheme] || [20, 20, 20, 20, 20, 20, 20, 20]);

  const handleInputChange = (idx, val) => {
    const updated = [...sgpaInputs];
    updated[idx] = val;
    setSgpaInputs(updated);
  };

  const handleQuickFill = (val = 8.5) => {
    const sample = [8.2, 8.4, 8.6, 8.8, 9.0, 8.7, '', ''];
    setSgpaInputs(sample.map(s => s ? s.toString() : ''));
  };

  const handleReset = () => {
    setSgpaInputs(Array(8).fill(''));
    setResult(null);
    setSaveSuccess(false);
  };

  const handleCalculate = async () => {
    // Validate inputs
    const validPairs = [];
    for (let i = 0; i < 8; i++) {
      const valStr = sgpaInputs[i];
      if (valStr !== '' && valStr !== undefined) {
        const num = Number(valStr);
        if (isNaN(num) || num < 0 || num > 10) {
          alert(`SGPA for ${SEMESTER_NAMES[i]} must be between 0.00 and 10.00`);
          return;
        }
        validPairs.push({ semester: i + 1, sgpa: num });
      }
    }

    if (validPairs.length === 0) {
      alert('Please enter at least one semester SGPA value.');
      return;
    }

    setIsCalculating(true);
    try {
      let resData;
      try {
        resData = await calculateCGPA({
          scheme: selectedScheme,
          branchGroup: branchGroup,
          semesterSgpas: validPairs
        });
      } catch (backendErr) {
        // Fallback local computation
        let totalCredits = 0;
        let totalWeighted = 0;
        const breakdown = validPairs.map(p => {
          const semIdx = p.semester - 1;
          const credits = activeWeights[semIdx];
          const w = credits * p.sgpa;
          totalCredits += credits;
          totalWeighted += w;
          return {
            semester: p.semester,
            name: SEMESTER_NAMES[semIdx],
            credits,
            sgpa: Number(p.sgpa.toFixed(2)),
            weightedSgpa: Number(w.toFixed(2))
          };
        });
        const cgpa = Number((totalWeighted / totalCredits).toFixed(2));
        resData = {
          success: true,
          scheme: selectedScheme,
          branchGroup: selectedScheme === '2025' ? (branchGroup === 'cs' ? 'Computer Science family' : 'All other branches') : null,
          cgpa,
          totalCreditsEarned: totalCredits,
          breakdown,
          calculatedAt: new Date().toISOString()
        };
      }

      setResult(resData);
      setSaveSuccess(false);

      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.7 }
      });

      setTimeout(() => {
        reportRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);

    } catch (err) {
      alert(`Calculation error: ${err.message}`);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleDownload = async () => {
    if (!reportRef.current) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `VTU_CGPA_Report_${selectedScheme}_VTU_Vidya.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      alert('Unable to generate report image.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;
    setIsSaving(true);
    try {
      await saveReport({
        type: 'CGPA',
        title: `Cumulative CGPA (${selectedScheme} Scheme)`,
        scheme: selectedScheme,
        branchGroup: result.branchGroup,
        score: result.cgpa,
        totalCredits: result.totalCreditsEarned,
        breakdown: result.breakdown
      });
      setSaveSuccess(true);
      if (onSavedReportAlert) onSavedReportAlert();
    } catch (err) {
      // Local storage fallback
      const local = JSON.parse(localStorage.getItem('vtu_vidya_reports') || '[]');
      local.unshift({
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        type: 'CGPA',
        title: `Cumulative CGPA (${selectedScheme} Scheme)`,
        scheme: selectedScheme,
        score: result.cgpa,
        totalCredits: result.totalCreditsEarned,
        breakdown: result.breakdown
      });
      localStorage.setItem('vtu_vidya_reports', JSON.stringify(local.slice(0, 50)));
      setSaveSuccess(true);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 md:py-10 space-y-8">
      
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
          <Award className="w-3.5 h-3.5" />
          <span>VTU-Vidya • CGPA Engine</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          VTU CGPA Calculator
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-lg mx-auto">
          by neeraj&tarun • Automatically applies scheme credit weights per semester to determine your true cumulative CGPA.
        </p>
      </div>

      {/* Scheme & Branch Group Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-sm space-y-5">
        <div>
          <label className="block text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">
            1. Choose Scheme
          </label>
          <div className="flex flex-wrap gap-2.5">
            {['2025', '2022', '2021', '2018'].map((sch) => (
              <button
                key={sch}
                type="button"
                onClick={() => { setSelectedScheme(sch); setResult(null); }}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  selectedScheme === sch
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                }`}
              >
                {sch} Scheme
              </button>
            ))}
          </div>
        </div>

        {/* 2025 Scheme Branch Group Toggle */}
        {selectedScheme === '2025' && (
          <div className="pt-3 border-t border-slate-100">
            <label className="block text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">
              Branch Stream Group (2025 Scheme)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label 
                className={`cursor-pointer rounded-xl border p-3.5 flex flex-col justify-between transition-all ${
                  branchGroup === 'cs'
                    ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-slate-900">Computer Science family</span>
                  <input
                    type="radio"
                    name="branchGroup"
                    checked={branchGroup === 'cs'}
                    onChange={() => setBranchGroup('cs')}
                    className="accent-emerald-600"
                  />
                </div>
                <p className="text-xs text-slate-500">
                  CSE, ISE, AI & ML, AI & DS, Cyber Security, IoT, CSBS, Computer Engg
                </p>
              </label>

              <label 
                className={`cursor-pointer rounded-xl border p-3.5 flex flex-col justify-between transition-all ${
                  branchGroup === 'other'
                    ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-slate-900">All other branches</span>
                  <input
                    type="radio"
                    name="branchGroup"
                    checked={branchGroup === 'other'}
                    onChange={() => setBranchGroup('other')}
                    className="accent-emerald-600"
                  />
                </div>
                <p className="text-xs text-slate-500">
                  ECE, EEE, Mechanical, Civil, Aerospace, Chemical, and others
                </p>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Semester Inputs Form */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Enter Semester SGPA (0.00 - 10.00)
            </h2>
            <p className="text-xs text-slate-500">
              Leave future/uncompleted semesters blank.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill(8.5)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
            >
              Fill Sample SGPAs
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        {/* 8 Semester Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {SEMESTER_NAMES.map((name, idx) => {
            const creditWeight = activeWeights[idx];
            return (
              <div 
                key={idx}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2 hover:border-emerald-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">{name}</span>
                  <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-emerald-700">
                    {creditWeight} cr
                  </span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  placeholder="e.g. 8.65"
                  value={sgpaInputs[idx]}
                  onChange={(e) => handleInputChange(idx, e.target.value)}
                  className="w-full px-3 py-2 text-sm font-semibold text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-center"
                />
              </div>
            );
          })}
        </div>

        {/* Calculate Button */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={handleCalculate}
            disabled={isCalculating}
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-base font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/40 transform hover:-translate-y-0.5 transition-all disabled:opacity-50"
          >
            <Award className="w-5 h-5" />
            <span>{isCalculating ? 'Computing Weighted CGPA...' : 'Calculate CGPA'}</span>
          </button>
        </div>
      </div>

      {/* CGPA Report Card */}
      {result && (
        <div className="space-y-4 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div
            ref={reportRef}
            className="rounded-3xl border-2 border-slate-200 bg-white p-6 sm:p-8 shadow-xl relative overflow-hidden"
          >
            {/* Watermark */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.03]">
              <div className="text-center font-black text-9xl tracking-tighter text-slate-900">
                VTU
              </div>
            </div>

            {/* Header */}
            <div className="relative z-10 border-b-2 border-slate-200 pb-5 mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black tracking-tight text-slate-900">
                      VTU-Vidya
                    </span>
                    <span className="text-xs font-bold uppercase tracking-widest bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-300">
                      CGPA Report
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-emerald-700">by neeraj&tarun • Official Weighted Academic Evaluation</p>
                </div>
                <div className="text-left sm:text-right text-xs text-slate-500">
                  <p className="font-semibold text-slate-700">{result.scheme} Scheme {result.branchGroup ? `(${result.branchGroup})` : ''}</p>
                  <p className="font-mono text-[11px] text-slate-400">
                    Generated: {new Date(result.calculatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Big Score Displays */}
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-center">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Credits Evaluated
                </span>
                <p className="mt-1 text-3xl font-extrabold text-emerald-900 font-mono">
                  {result.totalCreditsEarned}
                </p>
              </div>

              <div className="rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white p-4 text-center shadow-md">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">
                  Cumulative CGPA
                </span>
                <p className="mt-1 text-4xl font-black tracking-tight font-mono">
                  {result.cgpa.toFixed(2)}
                </p>
              </div>

              <div className="rounded-2xl bg-cyan-50 border border-cyan-200 p-4 text-center">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-800">
                  Equivalent Percentage
                </span>
                <p className="mt-1 text-3xl font-extrabold text-cyan-900 font-mono">
                  {(result.cgpa * 10).toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Breakdown Table */}
            <div className="relative z-10 overflow-x-auto rounded-xl border border-slate-200 mb-6">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-100/80 text-slate-800 font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2.5">Semester</th>
                    <th className="px-4 py-2.5 text-center">Prescribed Credits</th>
                    <th className="px-4 py-2.5 text-center">SGPA Secured</th>
                    <th className="px-4 py-2.5 text-center">Weighted Credit Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {result.breakdown.map((row) => (
                    <tr key={row.semester} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-2.5 font-bold text-slate-900">
                        {row.name}
                      </td>
                      <td className="px-4 py-2.5 text-center font-mono font-semibold text-slate-700">
                        {row.credits}
                      </td>
                      <td className="px-4 py-2.5 text-center font-mono font-bold text-emerald-700">
                        {row.sgpa.toFixed(2)}
                      </td>
                      <td className="px-4 py-2.5 text-center font-mono font-bold text-slate-800">
                        {row.weightedSgpa.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="relative z-10 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
              <p>Formula: CGPA = Σ (Semester Credits × SGPA) / Σ Credits = <strong>{result.cgpa.toFixed(2)}</strong></p>
              <p className="font-semibold text-slate-500">VTU-Vidya by neeraj&tarun</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? 'Generating...' : 'Download CGPA Report (.PNG)'}</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || saveSuccess}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                saveSuccess
                  ? 'bg-slate-100 text-emerald-700 border border-emerald-300'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-sm'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>{saveSuccess ? 'Saved in Reports!' : isSaving ? 'Saving...' : 'Save Calculation'}</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

