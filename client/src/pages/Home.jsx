import React from 'react';
import { Calculator, Award, Percent, ArrowRight, CheckCircle2, BookOpen, Sparkles, Shield, Cpu } from 'lucide-react';

export default function Home({ setActivePage, onOpenGradingModal }) {
  const tools = [
    {
      id: 'sgpa',
      title: 'VTU SGPA Calculator',
      description: 'Here you can calculate your sgpa for any semester and branch with auto-loaded VTU subjects and credits.',
      badge: 'Subject-wise Calculation',
      gradient: 'from-emerald-500 to-teal-600',
      action: 'Calculate SGPA'
    },
    {
      id: 'cgpa',
      title: 'VTU CGPA Calculator',
      description: 'Here you can calculate your cgpa across all 8 semesters using official VTU credit weight matrices.',
      badge: 'Cumulative Multi-Semester',
      gradient: 'from-teal-600 to-cyan-600',
      action: 'Calculate CGPA'
    },
    {
      id: 'percentage',
      title: 'VTU Percentage Calculator',
      description: 'Here you can calculate your percentage from SGPA or CGPA using modern CBCS & classic VTU formulas.',
      badge: 'Bi-directional Converter',
      gradient: 'from-cyan-600 to-blue-600',
      action: 'Convert Percentage'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-10 space-y-10">
      
      {/* Hero Header matching target layout */}
      <header className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-10 text-center shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-100/40 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

        <div className="relative z-10 space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>VTU-Vidya • by neeraj&tarun</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 text-balance leading-tight">
            VTU SGPA, CGPA & Percentage Calculator
          </h1>
          
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-bold text-slate-600">
            <span className="bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">2025 Scheme</span>
            <span className="bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">2022 Scheme</span>
            <span className="bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">2021 Scheme</span>
            <span className="bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">2018 Scheme</span>
          </div>

          <p className="text-sm sm:text-base text-slate-600 font-normal text-balance max-w-2xl mx-auto">
            Latest, 100% accurate VTU SGPA, CGPA and Percentage Calculator built strictly according to official VTU (<span className="font-mono text-emerald-700">vtu.ac.in</span>) regulations. Pre-loaded with official course codes, credits, and instant report download.
          </p>
        </div>
      </header>

      {/* 3 Core Tools Grid - Inspired by Target App Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <article 
            key={tool.id}
            className="group rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all flex flex-col justify-between"
          >
            <div>
              <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200/80 mb-4">
                {tool.badge}
              </span>

              <h2 className="text-xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                {tool.title}
              </h2>

              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                {tool.description}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <button
                onClick={() => {
                  setActivePage(tool.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 text-sm font-bold shadow-md shadow-emerald-600/20 group-hover:translate-y-[-1px] transition-all"
              >
                <span>{tool.action}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </article>
        ))}
      </section>

      {/* Why Choose VTU-Vidya Section */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="max-w-3xl">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <Cpu className="w-5 h-5 text-emerald-600" />
            Why use VTU-Vidya by neeraj&tarun?
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            VTU follows the Choice Based Credit System (CBCS). Often, university grade cards don't immediately provide course credit breakdowns or detailed report cards. VTU-Vidya bridges this gap:
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 mb-2" />
            <h4 className="text-sm font-bold text-slate-900">Official VTU Formulas</h4>
            <p className="mt-1 text-xs text-slate-600">Calculations strictly match VTU Belagavi academic regulations.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <BookOpen className="w-5 h-5 text-emerald-600 mb-2" />
            <h4 className="text-sm font-bold text-slate-900">44+ Engineering Branches</h4>
            <p className="mt-1 text-xs text-slate-600">Pre-mapped course titles, codes, and credit allotments for all batches.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <Shield className="w-5 h-5 text-emerald-600 mb-2" />
            <h4 className="text-sm font-bold text-slate-900">Downloadable Reports</h4>
            <p className="mt-1 text-xs text-slate-600">Generate high-resolution PNG grade report sheets with a single click.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <Award className="w-5 h-5 text-emerald-600 mb-2" />
            <h4 className="text-sm font-bold text-slate-900">Saved History</h4>
            <p className="mt-1 text-xs text-slate-600">Store and track your semester marks securely in local workspace.</p>
          </div>
        </div>
      </section>

      {/* Formula & CBCS Reference */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
          <h3 className="text-base font-bold text-slate-900">
            How is VTU SGPA Calculated?
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            The Semester Grade Point Average (SGPA) is the weighted ratio of total grade points earned by a student across all registered subjects to the total credits assigned to those subjects:
          </p>
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center font-mono text-xs sm:text-sm text-emerald-900 font-semibold">
            SGPA = Σ (Course Credits × Grade Points) / Σ (Course Credits)
          </div>
          <p className="text-xs text-slate-500">
            Each subject marks are converted to a 10-point scale: 90-100 gives 10 (O), 80-89 gives 9 (A+), 70-79 gives 8 (A), down to below 40 which gives 0 (F).
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
          <h3 className="text-base font-bold text-slate-900">
            How is VTU CGPA & Percentage Calculated?
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            The Cumulative Grade Point Average (CGPA) is computed by weighting each semester's SGPA against that semester's total prescribed credits:
          </p>
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center font-mono text-xs sm:text-sm text-emerald-900 font-semibold">
            CGPA = Σ (Semester Credits × SGPA) / Σ (Semester Credits)
          </div>
          <div className="text-xs text-slate-600 space-y-1">
            <p><strong>• Modern CBCS Formula:</strong> Percentage = CGPA × 10</p>
            <p><strong>• Traditional VTU Formula:</strong> Percentage = (CGPA − 0.75) × 10</p>
          </div>
        </div>
      </section>

      {/* Quick Grading Chart Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-lg font-bold">Need to check grade cutoffs?</h4>
          <p className="text-xs text-emerald-100 mt-1">Review marks ranges, grade points (10 to 0), and pass status.</p>
        </div>
        <button
          onClick={onOpenGradingModal}
          className="whitespace-nowrap rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 px-5 py-2.5 text-xs font-bold transition-all shadow-sm"
        >
          View VTU Grading Scale
        </button>
      </div>

    </div>
  );
}

