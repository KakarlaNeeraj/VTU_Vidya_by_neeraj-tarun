import React, { useState } from 'react';
import { Percent, ArrowRight, RefreshCw, Check, Sparkles, Info } from 'lucide-react';
import { calculatePercentage } from '../utils/api';

export default function PercentageCalculator() {
  // States for 4 conversions
  const [sgpaIn, setSgpaIn] = useState('');
  const [sgpaOut, setSgpaOut] = useState(null);

  const [pctIn1, setPctIn1] = useState('');
  const [sgpaOut1, setSgpaOut1] = useState(null);

  const [cgpaIn, setCgpaIn] = useState('');
  const [cgpaFormula, setCgpaFormula] = useState('cbcs'); // 'cbcs' or 'classic'
  const [cgpaOut, setCgpaOut] = useState(null);

  const [pctIn2, setPctIn2] = useState('');
  const [cgpaFormula2, setCgpaFormula2] = useState('cbcs');
  const [cgpaOut2, setCgpaOut2] = useState(null);

  // 1. SGPA to Percentage
  const handleSgpaToPct = async () => {
    const val = Number(sgpaIn);
    if (sgpaIn === '' || isNaN(val) || val < 0 || val > 10) {
      alert('Please enter an SGPA between 0.00 and 10.00');
      return;
    }
    try {
      const res = await calculatePercentage({ type: 'sgpa_to_percentage', value: val });
      setSgpaOut(res.label);
    } catch (e) {
      const resVal = Number((val * 10).toFixed(2));
      setSgpaOut(`Your percentage is ${resVal}%`);
    }
  };

  // 2. Percentage to SGPA
  const handlePctToSgpa = async () => {
    const val = Number(pctIn1);
    if (pctIn1 === '' || isNaN(val) || val < 0 || val > 100) {
      alert('Please enter a percentage between 0.00 and 100.00');
      return;
    }
    try {
      const res = await calculatePercentage({ type: 'percentage_to_sgpa', value: val });
      setSgpaOut1(res.label);
    } catch (e) {
      const resVal = Number((val / 10).toFixed(2));
      setSgpaOut1(`Your SGPA is ${resVal}`);
    }
  };

  // 3. CGPA to Percentage
  const handleCgpaToPct = async () => {
    const val = Number(cgpaIn);
    if (cgpaIn === '' || isNaN(val) || val < 0 || val > 10) {
      alert('Please enter a CGPA between 0.00 and 10.00');
      return;
    }
    try {
      const res = await calculatePercentage({
        type: 'cgpa_to_percentage',
        value: val,
        formula: cgpaFormula
      });
      setCgpaOut(res.label);
    } catch (e) {
      const resVal = cgpaFormula === 'classic'
        ? Number(((val - 0.75) * 10).toFixed(2))
        : Number((val * 10).toFixed(2));
      setCgpaOut(`Your percentage is ${resVal}%`);
    }
  };

  // 4. Percentage to CGPA
  const handlePctToCgpa = async () => {
    const val = Number(pctIn2);
    if (pctIn2 === '' || isNaN(val) || val < 0 || val > 100) {
      alert('Please enter a percentage between 0.00 and 100.00');
      return;
    }
    try {
      const res = await calculatePercentage({
        type: 'percentage_to_cgpa',
        value: val,
        formula: cgpaFormula2
      });
      setCgpaOut2(res.label);
    } catch (e) {
      const resVal = cgpaFormula2 === 'classic'
        ? Number(((val / 10) + 0.75).toFixed(2))
        : Number((val / 10).toFixed(2));
      setCgpaOut2(`Your CGPA is ${resVal}`);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 md:py-10 space-y-10">
      
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-semibold">
          <Percent className="w-3.5 h-3.5" />
          <span>VTU-Vidya • Percentage Conversion</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          VTU Percentage Calculator
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-lg mx-auto">
          by neeraj&tarun • Bi-directional conversion supporting both Modern VTU CBCS (10x) and Classic VTU ((CGPA-0.75)x10) formulas.
        </p>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: SGPA to Percentage */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full border border-slate-200">
              SGPA → %
            </span>
            <h2 className="text-lg font-bold text-slate-900 mt-2">
              SGPA to Percentage
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Formula: <code className="font-mono text-emerald-700 font-bold">Percentage = SGPA × 10</code>
            </p>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Enter your SGPA (0 - 10)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                placeholder="e.g. 8.75"
                value={sgpaIn}
                onChange={(e) => { setSgpaIn(e.target.value); setSgpaOut(null); }}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={handleSgpaToPct}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 text-sm font-bold shadow-md shadow-emerald-600/20 transition-all"
            >
              <span>Calculate Percentage</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {sgpaOut && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center font-bold text-emerald-800 text-sm animate-in fade-in duration-200">
                {sgpaOut}
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Percentage to SGPA */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full border border-slate-200">
              % → SGPA
            </span>
            <h2 className="text-lg font-bold text-slate-900 mt-2">
              Percentage to SGPA
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Formula: <code className="font-mono text-emerald-700 font-bold">SGPA = Percentage / 10</code>
            </p>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Enter your Percentage (0 - 100)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                placeholder="e.g. 87.5"
                value={pctIn1}
                onChange={(e) => { setPctIn1(e.target.value); setSgpaOut1(null); }}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={handlePctToSgpa}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 text-sm font-bold shadow-md shadow-emerald-600/20 transition-all"
            >
              <span>Calculate SGPA</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {sgpaOut1 && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center font-bold text-emerald-800 text-sm animate-in fade-in duration-200">
                {sgpaOut1}
              </div>
            )}
          </div>
        </div>

        {/* Card 3: CGPA to Percentage (With Formula Toggle) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full border border-slate-200">
                CGPA → %
              </span>
              {/* Formula Toggle */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => { setCgpaFormula('cbcs'); setCgpaOut(null); }}
                  className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
                    cgpaFormula === 'cbcs' ? 'bg-white shadow text-emerald-700' : 'text-slate-600'
                  }`}
                  title="2021, 2022, 2025 scheme standard"
                >
                  [CGPA × 10]
                </button>
                <button
                  type="button"
                  onClick={() => { setCgpaFormula('classic'); setCgpaOut(null); }}
                  className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
                    cgpaFormula === 'classic' ? 'bg-white shadow text-emerald-700' : 'text-slate-600'
                  }`}
                  title="2018 and older scheme"
                >
                  [(CGPA-0.75)×10]
                </button>
              </div>
            </div>

            <h2 className="text-lg font-bold text-slate-900 mt-2">
              CGPA to Percentage
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Active: <code className="font-mono text-emerald-700 font-bold">
                {cgpaFormula === 'cbcs' ? 'Percentage = CGPA × 10' : 'Percentage = [CGPA − 0.75] × 10'}
              </code>
            </p>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Enter your CGPA (0 - 10)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                placeholder="e.g. 9.15"
                value={cgpaIn}
                onChange={(e) => { setCgpaIn(e.target.value); setCgpaOut(null); }}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={handleCgpaToPct}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 text-sm font-bold shadow-md shadow-emerald-600/20 transition-all"
            >
              <span>Calculate Percentage</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {cgpaOut && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center font-bold text-emerald-800 text-sm animate-in fade-in duration-200">
                {cgpaOut}
              </div>
            )}
          </div>
        </div>

        {/* Card 4: Percentage to CGPA (With Formula Toggle) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full border border-slate-200">
                % → CGPA
              </span>
              {/* Formula Toggle */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => { setCgpaFormula2('cbcs'); setCgpaOut2(null); }}
                  className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
                    cgpaFormula2 === 'cbcs' ? 'bg-white shadow text-emerald-700' : 'text-slate-600'
                  }`}
                  title="2021, 2022, 2025 scheme standard"
                >
                  [Pct / 10]
                </button>
                <button
                  type="button"
                  onClick={() => { setCgpaFormula2('classic'); setCgpaOut2(null); }}
                  className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
                    cgpaFormula2 === 'classic' ? 'bg-white shadow text-emerald-700' : 'text-slate-600'
                  }`}
                  title="2018 and older scheme"
                >
                  [(Pct / 10) + 0.75]
                </button>
              </div>
            </div>

            <h2 className="text-lg font-bold text-slate-900 mt-2">
              Percentage to CGPA
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Active: <code className="font-mono text-emerald-700 font-bold">
                {cgpaFormula2 === 'cbcs' ? 'CGPA = Percentage / 10' : 'CGPA = [Percentage / 10] + 0.75'}
              </code>
            </p>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Enter your Percentage (0 - 100)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                placeholder="e.g. 84.0"
                value={pctIn2}
                onChange={(e) => { setPctIn2(e.target.value); setCgpaOut2(null); }}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={handlePctToCgpa}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 text-sm font-bold shadow-md shadow-emerald-600/20 transition-all"
            >
              <span>Calculate CGPA</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {cgpaOut2 && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center font-bold text-emerald-800 text-sm animate-in fade-in duration-200">
                {cgpaOut2}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Explanation Banner */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 sm:p-6 text-xs text-slate-600 space-y-2">
        <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Info className="w-4 h-4 text-emerald-600" />
          Which VTU percentage formula should I use?
        </h4>
        <p>
          • <strong>VTU 2021, 2022 & 2025 Schemes:</strong> VTU circulars mandate the direct linear conversion factor of <code className="font-mono text-emerald-700">10 × CGPA</code> for all transcripts and degree applications.
        </p>
        <p>
          • <strong>VTU 2018 & Earlier Schemes:</strong> Older CBCS regulations provided the formula <code className="font-mono text-emerald-700">[CGPA − 0.75] × 10</code>. Toggle between the two above based on your university batch and employer criteria.
        </p>
      </div>

    </div>
  );
}

