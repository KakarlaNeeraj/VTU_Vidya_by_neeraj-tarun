import React from 'react';
import { GraduationCap, Heart, ExternalLink, ShieldCheck } from 'lucide-react';

export default function Footer({ setActivePage }) {
  return (
    <footer className="bg-slate-900 text-slate-400 mt-20 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                VTU-Vidya
              </span>
            </div>
            <p className="text-sm font-medium text-emerald-400">
              by neeraj&tarun
            </p>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              An accurate, zero-error academic companion built specifically for Visvesvaraya Technological University (VTU) engineering students. Calculate semester SGPA, cumulative CGPA, and percentages in strict accordance with VTU CBCS regulations.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-200 mb-3">
              Calculators
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button 
                  onClick={() => { setActivePage('sgpa'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-emerald-400 transition-colors"
                >
                  VTU SGPA Calculator
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setActivePage('cgpa'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-emerald-400 transition-colors"
                >
                  VTU CGPA Calculator
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setActivePage('percentage'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Percentage Converter
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setActivePage('history'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Saved Reports History
                </button>
              </li>
            </ul>
          </div>

          {/* Supported Schemes */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-200 mb-3">
              Supported Schemes
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>2025 Scheme (CBCS NEP 2.0)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>2022 Scheme (CBCS Stream System)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>2021 Scheme (CBCS 175 Credits)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>2018 Scheme (CBCS Standard)</span>
              </li>
            </ul>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-400/90">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>VTU vtu.ac.in Verified Formulas</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} VTU-Vidya • Crafted with dedication by neeraj&tarun.</p>
          <p className="text-slate-500">
            For academic planning and reference purposes only. All course curriculum names and codes are copyright of VTU, Belagavi.
          </p>
        </div>
      </div>
    </footer>
  );
}

