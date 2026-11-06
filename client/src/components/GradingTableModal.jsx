import React from 'react';
import { X, Award, Info } from 'lucide-react';

export default function GradingTableModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const gradingData = [
    { range: '90 - 100', grade: 'O', point: 10, meaning: 'Outstanding', badge: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    { range: '80 - 89',  grade: 'A+', point: 9,  meaning: 'Excellent',   badge: 'bg-teal-100 text-teal-800 border-teal-300' },
    { range: '70 - 79',  grade: 'A',  point: 8,  meaning: 'Very Good',   badge: 'bg-cyan-100 text-cyan-800 border-cyan-300' },
    { range: '60 - 69',  grade: 'B+', point: 7,  meaning: 'Good',        badge: 'bg-blue-100 text-blue-800 border-blue-300' },
    { range: '55 - 59',  grade: 'B',  point: 6,  meaning: 'Above Avg',   badge: 'bg-amber-100 text-amber-800 border-amber-300' },
    { range: '50 - 54',  grade: 'C',  point: 5,  meaning: 'Average',     badge: 'bg-orange-100 text-orange-800 border-orange-300' },
    { range: '40 - 49',  grade: 'P',  point: 4,  meaning: 'Pass',        badge: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
    { range: '00 - 39',  grade: 'F',  point: 0,  meaning: 'Fail',        badge: 'bg-red-100 text-red-800 border-red-300' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="relative bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                VTU CBCS 10-Point Scale
              </h3>
              <p className="text-xs text-slate-500">Official Evaluation Matrix</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 shadow-sm">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-3.5 py-2.5">Marks Range</th>
                <th className="px-3.5 py-2.5">Letter Grade</th>
                <th className="px-3.5 py-2.5">Grade Points</th>
                <th className="px-3.5 py-2.5">Performance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {gradingData.map((row) => (
                <tr key={row.grade} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-3.5 py-2 font-mono font-medium text-slate-900">
                    {row.range}
                  </td>
                  <td className="px-3.5 py-2">
                    <span className={`inline-block px-2 py-0.5 rounded font-bold text-xs border ${row.badge}`}>
                      {row.grade}
                    </span>
                  </td>
                  <td className="px-3.5 py-2 font-bold text-slate-800">
                    {row.point}
                  </td>
                  <td className="px-3.5 py-2 text-slate-600">
                    {row.meaning}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 flex items-start gap-2">
          <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p>
            According to VTU CBCS regulations, a student securing less than 40 marks in an academic course is awarded Grade 'F' (0 grade points) and must reappear for semester examinations.
          </p>
        </div>

        <div className="mt-5 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-white bg-slate-800 rounded-xl hover:bg-slate-900 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

