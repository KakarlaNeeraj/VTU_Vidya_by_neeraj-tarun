import React, { useState, useEffect, useRef } from 'react';
import { Calculator, Download, Save, RefreshCw, Award, CheckCircle2, AlertCircle, ArrowDown, Plus, Trash2, Sliders } from 'lucide-react';
import confetti from 'canvas-confetti';
import html2canvas from 'html2canvas';
import localSchemesData from '../data/vtu_schemes_data.json';
import { calculateSGPA, saveReport } from '../utils/api';

const GRADE_OPTIONS = [
  { letter: 'O', point: 10, label: 'O (10 pts) • 90-100%' },
  { letter: 'A+', point: 9, label: 'A+ (9 pts) • 80-89%' },
  { letter: 'A', point: 8, label: 'A (8 pts) • 70-79%' },
  { letter: 'B+', point: 7, label: 'B+ (7 pts) • 60-69%' },
  { letter: 'B', point: 6, label: 'B (6 pts) • 55-59%' },
  { letter: 'C', point: 5, label: 'C (5 pts) • 50-54%' },
  { letter: 'P', point: 4, label: 'P (4 pts) • 40-49%' },
  { letter: 'F', point: 0, label: 'F (0 pts) • Fail' },
];

export default function SGPACalculator({ onSavedReportAlert }) {
  // State
  const [schemes, setSchemes] = useState(['2025', '2022', '2021', '2018']);
  const [selectedScheme, setSelectedScheme] = useState('2025');
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  
  // Input mode: 'marks' (0-100) or 'grades' (letter selection)
  const [inputMode, setInputMode] = useState('marks');

  const [subjects, setSubjects] = useState([]);
  const [marks, setMarks] = useState({});
  const [selectedGrades, setSelectedGrades] = useState({});

  // Custom Course Form Modal / State
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [customCourse, setCustomCourse] = useState({ name: '', code: '', credits: 3 });

  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const reportRef = useRef(null);
  const formRef = useRef(null);

  // Grade helper from numerical marks
  const getGradePreview = (m) => {
    const val = Number(m);
    if (m === undefined || m === '' || isNaN(val)) return null;
    if (val < 0 || val > 100) return { grade: 'Invalid', color: 'text-red-600 bg-red-50' };
    if (val >= 90) return { grade: 'O (10)', point: 10, letter: 'O', color: 'text-emerald-700 bg-emerald-100 font-bold' };
    if (val >= 80) return { grade: 'A+ (9)', point: 9, letter: 'A+', color: 'text-teal-700 bg-teal-100 font-bold' };
    if (val >= 70) return { grade: 'A (8)', point: 8, letter: 'A', color: 'text-cyan-700 bg-cyan-100 font-bold' };
    if (val >= 60) return { grade: 'B+ (7)', point: 7, letter: 'B+', color: 'text-blue-700 bg-blue-100' };
    if (val >= 55) return { grade: 'B (6)', point: 6, letter: 'B', color: 'text-amber-700 bg-amber-100' };
    if (val >= 50) return { grade: 'C (5)', point: 5, letter: 'C', color: 'text-orange-700 bg-orange-100' };
    if (val >= 40) return { grade: 'P (4)', point: 4, letter: 'P', color: 'text-yellow-700 bg-yellow-100' };
    return { grade: 'F (0)', point: 0, letter: 'F', color: 'text-red-700 bg-red-100 font-bold' };
  };

  // 1. Update Semesters when Scheme changes
  useEffect(() => {
    if (selectedScheme && localSchemesData[selectedScheme]) {
      const sems = Object.keys(localSchemesData[selectedScheme]);
      setSemesters(sems);
      setSelectedSemester(sems[0] || '');
      setSelectedBranch('');
      setSubjects([]);
      setMarks({});
      setSelectedGrades({});
      setResult(null);
    }
  }, [selectedScheme]);

  // 2. Update Branches when Semester changes
  useEffect(() => {
    if (selectedScheme && selectedSemester && localSchemesData[selectedScheme]?.[selectedSemester]) {
      const bList = Object.keys(localSchemesData[selectedScheme][selectedSemester]);
      setBranches(bList);
      setSelectedBranch(bList[0] || '');
      setMarks({});
      setSelectedGrades({});
      setResult(null);
    }
  }, [selectedScheme, selectedSemester]);

  // 3. Update Subjects when Branch changes
  useEffect(() => {
    if (selectedScheme && selectedSemester && selectedBranch) {
      const subs = localSchemesData[selectedScheme]?.[selectedSemester]?.[selectedBranch] || [];
      setSubjects(subs);
      
      const initialMarks = {};
      const initialGrades = {};
      subs.forEach((_, idx) => {
        initialMarks[idx] = '';
        initialGrades[idx] = 'O';
      });
      setMarks(initialMarks);
      setSelectedGrades(initialGrades);
      setResult(null);
      setSaveSuccess(false);
    }
  }, [selectedScheme, selectedSemester, selectedBranch]);

  // Marks input handler
  const handleMarkChange = (idx, value) => {
    setMarks(prev => ({ ...prev, [idx]: value }));
  };

  const handleGradeChange = (idx, letter) => {
    setSelectedGrades(prev => ({ ...prev, [idx]: letter }));
  };

  // Quick fill sample marks / grades
  const handleQuickFill = (score = 85) => {
    if (inputMode === 'marks') {
      const updated = {};
      subjects.forEach((_, idx) => {
        const varied = Math.min(100, Math.max(45, score + (idx % 3 === 0 ? 6 : (idx % 2 === 0 ? -5 : 3))));
        updated[idx] = varied.toString();
      });
      setMarks(updated);
    } else {
      const updatedGrades = {};
      const gradePalette = ['O', 'A+', 'A', 'A+', 'O', 'B+'];
      subjects.forEach((_, idx) => {
        updatedGrades[idx] = gradePalette[idx % gradePalette.length];
      });
      setSelectedGrades(updatedGrades);
    }
  };

  const handleResetMarks = () => {
    const resetM = {};
    const resetG = {};
    subjects.forEach((_, idx) => {
      resetM[idx] = '';
      resetG[idx] = 'O';
    });
    setMarks(resetM);
    setSelectedGrades(resetG);
    setResult(null);
    setSaveSuccess(false);
  };

  // Add custom elective/course
  const handleAddCustomCourse = (e) => {
    e.preventDefault();
    if (!customCourse.name.trim()) {
      alert('Course title is required');
      return;
    }
    const newSub = {
      name: customCourse.name.trim(),
      code: customCourse.code.trim() || `ELEC${subjects.length + 1}`,
      credits: Number(customCourse.credits) || 3
    };
    const newIdx = subjects.length;
    setSubjects(prev => [...prev, newSub]);
    setMarks(prev => ({ ...prev, [newIdx]: '' }));
    setSelectedGrades(prev => ({ ...prev, [newIdx]: 'O' }));
    setCustomCourse({ name: '', code: '', credits: 3 });
    setShowAddCourse(false);
  };

  // Remove a course
  const handleRemoveCourse = (indexToRemove) => {
    const updatedSubjects = subjects.filter((_, idx) => idx !== indexToRemove);
    setSubjects(updatedSubjects);

    // Re-index marks and grades
    const updatedMarks = {};
    const updatedGrades = {};
    updatedSubjects.forEach((_, newIdx) => {
      const oldIdx = newIdx >= indexToRemove ? newIdx + 1 : newIdx;
      updatedMarks[newIdx] = marks[oldIdx] ?? '';
      updatedGrades[newIdx] = selectedGrades[oldIdx] ?? 'O';
    });
    setMarks(updatedMarks);
    setSelectedGrades(updatedGrades);
    setResult(null);
  };

  // Calculate SGPA
  const handleCalculate = async (e) => {
    if (e) e.preventDefault();

    if (!subjects.length) {
      alert('Please select a scheme, semester, and branch first.');
      return;
    }

    // Build payload according to active inputMode
    const payloadSubjects = [];

    if (inputMode === 'marks') {
      for (let i = 0; i < subjects.length; i++) {
        const sub = subjects[i];
        const mStr = marks[i];
        const val = Number(mStr);
        if (mStr === '' || mStr === undefined || isNaN(val) || val < 0 || val > 100) {
          alert(`Please enter valid marks (0-100) for: ${sub.name} (${sub.code})`);
          return;
        }
        payloadSubjects.push({
          name: sub.name,
          code: sub.code,
          credits: sub.credits,
          marks: val
        });
      }
    } else {
      // Direct Letter Grade Mode
      for (let i = 0; i < subjects.length; i++) {
        const sub = subjects[i];
        const letter = selectedGrades[i] || 'O';
        const opt = GRADE_OPTIONS.find(g => g.letter === letter) || GRADE_OPTIONS[0];
        // representative mark for grade
        const representativeMark = opt.point === 10 ? 95 : opt.point === 9 ? 85 : opt.point === 8 ? 75 : opt.point === 7 ? 65 : opt.point === 6 ? 57 : opt.point === 5 ? 52 : opt.point === 4 ? 45 : 30;
        payloadSubjects.push({
          name: sub.name,
          code: sub.code,
          credits: sub.credits,
          marks: representativeMark,
          forcedGrade: opt
        });
      }
    }

    setIsCalculating(true);
    try {
      let resData;
      
      // Calculate breakdown
      let totalCredits = 0;
      let totalNumerator = 0;
      const breakdown = payloadSubjects.map(s => {
        let gp = 0;
        let letter = 'F';
        let status = 'Fail';

        if (s.forcedGrade) {
          gp = s.forcedGrade.point;
          letter = s.forcedGrade.letter;
          status = gp >= 4 ? 'Pass' : 'Fail';
        } else {
          const m = s.marks;
          if (m >= 90) { gp = 10; letter = 'O'; status = 'Outstanding'; }
          else if (m >= 80) { gp = 9; letter = 'A+'; status = 'Excellent'; }
          else if (m >= 70) { gp = 8; letter = 'A'; status = 'Very Good'; }
          else if (m >= 60) { gp = 7; letter = 'B+'; status = 'Good'; }
          else if (m >= 55) { gp = 6; letter = 'B'; status = 'Above Average'; }
          else if (m >= 50) { gp = 5; letter = 'C'; status = 'Average'; }
          else if (m >= 40) { gp = 4; letter = 'P'; status = 'Pass'; }
        }

        const gc = gp * s.credits;
        totalCredits += s.credits;
        totalNumerator += gc;

        return {
          name: s.name,
          code: s.code,
          credits: s.credits,
          marks: s.marks,
          gradePoint: gp,
          letterGrade: letter,
          status,
          gradeCredits: gc
        };
      });

      const sgpa = totalCredits > 0 ? Math.round((totalNumerator / totalCredits) * 100) / 100 : 0;

      resData = {
        success: true,
        scheme: selectedScheme,
        semester: selectedSemester,
        branch: selectedBranch,
        inputMode,
        sgpa,
        totalCredits,
        totalNumerator,
        breakdown,
        calculatedAt: new Date().toISOString()
      };

      setResult(resData);
      setSaveSuccess(false);

      // Celebration confetti
      confetti({
        particleCount: 90,
        spread: 65,
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

  // Download Report as PNG Image
  const handleDownloadReport = async () => {
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
      link.download = `${selectedSemester}_${selectedScheme}_SGPA_Report_VTU_Vidya.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Download error:', err);
      alert('Unable to generate report image in this browser. Please take a screenshot or try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Save Report to Database
  const handleSaveReport = async () => {
    if (!result) return;
    setIsSaving(true);
    try {
      await saveReport({
        type: 'SGPA',
        title: `${selectedSemester} SGPA (${selectedScheme} Scheme)`,
        scheme: selectedScheme,
        semester: selectedSemester,
        branch: selectedBranch,
        score: result.sgpa,
        totalCredits: result.totalCredits,
        totalNumerator: result.totalNumerator,
        breakdown: result.breakdown
      });
      setSaveSuccess(true);
      if (onSavedReportAlert) onSavedReportAlert();
    } catch (err) {
      const local = JSON.parse(localStorage.getItem('vtu_vidya_reports') || '[]');
      local.unshift({
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        type: 'SGPA',
        title: `${selectedSemester} SGPA (${selectedScheme} Scheme)`,
        scheme: selectedScheme,
        semester: selectedSemester,
        branch: selectedBranch,
        score: result.sgpa,
        totalCredits: result.totalCredits,
        breakdown: result.breakdown
      });
      localStorage.setItem('vtu_vidya_reports', JSON.stringify(local.slice(0, 50)));
      setSaveSuccess(true);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 md:py-10 space-y-8">
      
      {/* Title Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          <Calculator className="w-3.5 h-3.5" />
          <span>VTU-Vidya • SGPA Engine</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          VTU SGPA Calculator
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-xl mx-auto">
          by neeraj&tarun • Select your scheme, cycle/semester & branch. Course codes and credits are auto-populated.
        </p>
      </div>

      {/* Configuration Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-sm space-y-6">
        
        {/* 1. Scheme Selector */}
        <div>
          <label className="block text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">
            1. Select Scheme
          </label>
          <div className="flex flex-wrap gap-2.5">
            {schemes.map((s) => {
              const isSelected = selectedScheme === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSelectedScheme(s)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                  }`}
                >
                  {s} Scheme
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Semester Selector */}
        <div>
          <label className="block text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">
            2. Select Semester or Cycle
          </label>
          <div className="flex flex-wrap gap-2">
            {semesters.map((sem) => {
              const isSelected = selectedSemester === sem;
              return (
                <button
                  key={sem}
                  type="button"
                  onClick={() => setSelectedSemester(sem)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  {sem}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Branch Selector */}
        <div>
          <label className="block text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">
            3. Select Branch / Stream ({branches.length} available)
          </label>
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="w-full sm:max-w-md px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
          >
            {branches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* Subject Evaluation Card */}
      {subjects.length > 0 && (
        <div ref={formRef} className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-sm space-y-6">
          
          {/* Header & Mode Switcher */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Course Evaluation ({subjects.length} Subjects)
              </h2>
              <p className="text-xs text-slate-500">
                {selectedBranch} • {selectedSemester} ({selectedScheme} Scheme)
              </p>
            </div>

            {/* Input Mode Switcher (Marks vs Direct Letter Grade) */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setInputMode('marks')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    inputMode === 'marks'
                      ? 'bg-white text-emerald-800 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Enter Marks (0-100)
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('grades')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    inputMode === 'grades'
                      ? 'bg-white text-emerald-800 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Choose Letter Grades (O, A+...)
                </button>
              </div>

              {/* Quick Actions */}
              <button
                type="button"
                onClick={() => handleQuickFill(85)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
              >
                Sample Fill
              </button>
              <button
                type="button"
                onClick={handleResetMarks}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset
              </button>
            </div>
          </div>

          {/* Subjects Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-3 py-3 w-10 text-center">#</th>
                  <th className="px-4 py-3">Subject Name & Code</th>
                  <th className="px-4 py-3 text-center w-24">Credits</th>
                  <th className="px-4 py-3 text-center w-48">
                    {inputMode === 'marks' ? 'Marks (0 - 100)' : 'Letter Grade'}
                  </th>
                  <th className="px-4 py-3 text-center w-32">Grade Points</th>
                  <th className="px-3 py-3 w-12 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subjects.map((sub, idx) => {
                  const m = marks[idx];
                  const preview = getGradePreview(m);
                  const selectedG = selectedGrades[idx] || 'O';
                  const gradeOpt = GRADE_OPTIONS.find(g => g.letter === selectedG) || GRADE_OPTIONS[0];

                  return (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-3 py-3 font-mono text-slate-400 font-medium text-center">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{sub.name}</div>
                        <div className="font-mono text-xs text-emerald-700 mt-0.5">{sub.code}</div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-md font-mono font-bold text-xs bg-slate-100 text-slate-700 border border-slate-200">
                          {sub.credits} cr
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {inputMode === 'marks' ? (
                          <input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="e.g. 84"
                            value={marks[idx] ?? ''}
                            onChange={(e) => handleMarkChange(idx, e.target.value)}
                            className="w-28 mx-auto px-3 py-1.5 text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-center"
                          />
                        ) : (
                          <select
                            value={selectedG}
                            onChange={(e) => handleGradeChange(idx, e.target.value)}
                            className="w-36 mx-auto px-2.5 py-1.5 text-xs font-bold text-slate-800 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-center"
                          >
                            {GRADE_OPTIONS.map(g => (
                              <option key={g.letter} value={g.letter}>
                                {g.letter} ({g.point} pts)
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {inputMode === 'marks' ? (
                          preview ? (
                            <span className={`inline-block px-2.5 py-1 rounded-md text-xs border ${preview.color}`}>
                              {preview.grade}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400 italic">—</span>
                          )
                        ) : (
                          <span className="inline-block px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 border border-emerald-200 text-emerald-800">
                            {gradeOpt.point} pts ({gradeOpt.letter})
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveCourse(idx)}
                          className="p-1.5 text-slate-300 hover:text-red-500 rounded-lg transition-colors"
                          title="Remove this course"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Add Custom Elective / Course Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            {!showAddCourse ? (
              <button
                type="button"
                onClick={() => setShowAddCourse(true)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-2 rounded-xl border border-emerald-200 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Elective / Custom Course</span>
              </button>
            ) : (
              <div className="w-full p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-3">
                <span className="text-xs font-bold text-emerald-900 block">Add Custom Elective / Course</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Course Title (e.g. Cloud Computing)"
                    value={customCourse.name}
                    onChange={(e) => setCustomCourse(p => ({ ...p, name: e.target.value }))}
                    className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Code (e.g. 21CS721)"
                    value={customCourse.code}
                    onChange={(e) => setCustomCourse(p => ({ ...p, code: e.target.value }))}
                    className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                  />
                  <div className="flex items-center gap-2">
                    <select
                      value={customCourse.credits}
                      onChange={(e) => setCustomCourse(p => ({ ...p, credits: Number(e.target.value) }))}
                      className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                    >
                      {[1, 2, 3, 4, 5, 6].map(c => (
                        <option key={c} value={c}>{c} Credits</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={handleAddCustomCourse}
                      className="px-3 py-1.5 text-xs font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddCourse(false)}
                      className="px-3 py-1.5 text-xs text-slate-600 bg-slate-200 rounded-lg hover:bg-slate-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="text-xs text-slate-500 font-medium">
              Total Prescribed Credits: <strong className="text-slate-800">{subjects.reduce((sum, s) => sum + s.credits, 0)}</strong>
            </div>
          </div>

          {/* Calculate Button */}
          <div className="pt-4 text-center">
            <button
              type="button"
              onClick={handleCalculate}
              disabled={isCalculating}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-base font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/40 transform hover:-translate-y-0.5 transition-all disabled:opacity-50"
            >
              <Calculator className="w-5 h-5" />
              <span>{isCalculating ? 'Computing Official SGPA...' : 'Calculate SGPA'}</span>
            </button>
          </div>

        </div>
      )}

      {/* Generated Report Card Section */}
      {result && (
        <div className="space-y-4 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Official SGPA Grade Sheet
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              Ready for Download & Save
            </span>
          </div>

          {/* Downloadable / Printable Report Card */}
          <div
            ref={reportRef}
            className="rounded-3xl border-2 border-slate-200 bg-white p-6 sm:p-8 shadow-xl relative overflow-hidden"
          >
            {/* Background Watermark */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.03]">
              <div className="text-center font-black text-9xl tracking-tighter text-slate-900">
                VTU
              </div>
            </div>

            {/* Header Banner */}
            <div className="relative z-10 border-b-2 border-slate-200 pb-5 mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black tracking-tight text-slate-900">
                      VTU-Vidya
                    </span>
                    <span className="text-xs font-bold uppercase tracking-widest bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-300">
                      Grade Card
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-emerald-700">by neeraj&tarun • VTU Belagavi CBCS Evaluation</p>
                </div>
                <div className="text-left sm:text-right text-xs text-slate-500 space-y-0.5">
                  <p className="font-semibold text-slate-700">{result.branch}</p>
                  <p>{result.semester} • {result.scheme} Scheme</p>
                  <p className="font-mono text-[11px] text-slate-400">
                    Generated: {new Date(result.calculatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Score Highlight Cards */}
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-center">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Total Credits Registered
                </span>
                <p className="mt-1 text-3xl font-extrabold text-emerald-900 font-mono">
                  {result.totalCredits}
                </p>
              </div>

              <div className="rounded-2xl bg-teal-50 border border-teal-200 p-4 text-center">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                  Total Grade Points Earned
                </span>
                <p className="mt-1 text-3xl font-extrabold text-teal-900 font-mono">
                  {result.totalNumerator}
                </p>
              </div>

              <div className="rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white p-4 text-center shadow-md">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">
                  Semester SGPA
                </span>
                <p className="mt-1 text-4xl font-black tracking-tight font-mono">
                  {result.sgpa.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Detailed Table */}
            <div className="relative z-10 overflow-x-auto rounded-xl border border-slate-200 mb-6">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-100/80 text-slate-800 font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2.5">Code</th>
                    <th className="px-3 py-2.5">Course Name</th>
                    <th className="px-3 py-2.5 text-center">Credits (C)</th>
                    <th className="px-3 py-2.5 text-center">Marks</th>
                    <th className="px-3 py-2.5 text-center">Grade (G)</th>
                    <th className="px-3 py-2.5 text-center">Credits × Grade (C×G)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {result.breakdown.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-3 py-2 font-mono font-bold text-emerald-700">
                        {row.code}
                      </td>
                      <td className="px-3 py-2 font-medium text-slate-900">
                        {row.name}
                      </td>
                      <td className="px-3 py-2 text-center font-mono font-semibold">
                        {row.credits}
                      </td>
                      <td className="px-3 py-2 text-center font-mono">
                        {row.marks}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className="inline-block px-2 py-0.5 font-bold rounded text-xs bg-slate-100 text-slate-800 border border-slate-200">
                          {row.letterGrade} ({row.gradePoint})
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center font-mono font-bold text-slate-900">
                        {row.gradeCredits}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 border-t-2 border-slate-200 font-bold text-slate-900 text-xs sm:text-sm">
                  <tr>
                    <td colSpan="2" className="px-3 py-2.5 text-right uppercase tracking-wider text-xs text-slate-500">
                      Total
                    </td>
                    <td className="px-3 py-2.5 text-center font-mono text-emerald-700">
                      Σ C = {result.totalCredits}
                    </td>
                    <td className="px-3 py-2.5 text-center text-slate-400">—</td>
                    <td className="px-3 py-2.5 text-center text-slate-400">—</td>
                    <td className="px-3 py-2.5 text-center font-mono text-emerald-700">
                      Σ (C×G) = {result.totalNumerator}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Footer formula note on report card */}
            <div className="relative z-10 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
              <p>Formula: SGPA = Σ (Ci × Gi) / Σ Ci = {result.totalNumerator} / {result.totalCredits} = <strong>{result.sgpa}</strong></p>
              <p className="font-semibold text-slate-500">VTU-Vidya by neeraj&tarun • vtu.ac.in formula</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleDownloadReport}
              disabled={isDownloading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? 'Generating Image...' : 'Download Report (.PNG)'}</span>
            </button>

            <button
              type="button"
              onClick={handleSaveReport}
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
