const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Path to data files
const SCHEMES_FILE = path.join(__dirname, 'data', 'vtu_schemes_data.json');
let REPORTS_FILE = path.join(__dirname, 'data', 'reports.json');

// Ensure reports file exists with read-only filesystem fallback (e.g. Lambda/Vercel)
try {
  if (!fs.existsSync(REPORTS_FILE)) {
    fs.writeFileSync(REPORTS_FILE, JSON.stringify([], null, 2));
  }
} catch (e) {
  REPORTS_FILE = path.join('/tmp', 'reports.json');
  if (!fs.existsSync(REPORTS_FILE)) {
    try { fs.writeFileSync(REPORTS_FILE, JSON.stringify([], null, 2)); } catch (_) {}
  }
}

// Load curriculum data
let schemesData = {};
try {
  schemesData = JSON.parse(fs.readFileSync(SCHEMES_FILE, 'utf8'));
  console.log(`[VTU Engine] Loaded ${Object.keys(schemesData).length} curriculum schemes successfully.`);
} catch (err) {
  console.error('[VTU Engine] Failed to load schemes database:', err);
}

// Helpers for VTU Grade & Formula
const getGradeInfo = (marks) => {
  const m = Number(marks);
  if (isNaN(m) || m < 0 || m > 100) return { point: 0, letter: 'F', status: 'Invalid' };
  if (m >= 90) return { point: 10, letter: 'O', status: 'Outstanding' };
  if (m >= 80) return { point: 9, letter: 'A+', status: 'Excellent' };
  if (m >= 70) return { point: 8, letter: 'A', status: 'Very Good' };
  if (m >= 60) return { point: 7, letter: 'B+', status: 'Good' };
  if (m >= 55) return { point: 6, letter: 'B', status: 'Above Average' };
  if (m >= 50) return { point: 5, letter: 'C', status: 'Average' };
  if (m >= 40) return { point: 4, letter: 'P', status: 'Pass' };
  return { point: 0, letter: 'F', status: 'Fail' };
};

const SCHEME_CREDITS_MATRIX = {
  '2018': [20, 20, 24, 24, 24, 24, 20, 18],
  '2021': [20, 20, 18, 22, 18, 22, 24, 16],
  '2022': [20, 20, 21, 19, 22, 18, 24, 16],
  '2025_CS': [20, 20, 21, 21, 22, 21, 20, 15],
  '2025_OTHER': [20, 20, 21, 22, 21, 21, 20, 15]
};

// ----------------- ROUTES -----------------

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'VTU Life Replica API Engine',
    schemesCount: Object.keys(schemesData).length,
    timestamp: new Date().toISOString()
  });
});

// 1. Get Schemes list
app.get('/api/schemes', (req, res) => {
  const schemes = Object.keys(schemesData).sort((a, b) => b.localeCompare(a));
  res.json({
    success: true,
    schemes,
    creditsMatrix: SCHEME_CREDITS_MATRIX
  });
});

// 2. Get Semesters for a scheme
app.get('/api/schemes/:scheme/semesters', (req, res) => {
  const { scheme } = req.params;
  const schemeObj = schemesData[scheme];
  if (!schemeObj) {
    return res.status(404).json({ success: false, error: `Scheme '${scheme}' not found` });
  }
  res.json({
    success: true,
    scheme,
    semesters: Object.keys(schemeObj)
  });
});

// 3. Get Branches for a scheme and semester
app.get('/api/schemes/:scheme/:semester/branches', (req, res) => {
  const { scheme, semester } = req.params;
  const semObj = schemesData[scheme]?.[semester];
  if (!semObj) {
    return res.status(404).json({ success: false, error: `Semester '${semester}' not found in scheme '${scheme}'` });
  }
  res.json({
    success: true,
    scheme,
    semester,
    branches: Object.keys(semObj)
  });
});

// 4. Get Subjects for a scheme, semester, and branch
app.get('/api/schemes/:scheme/:semester/:branch/subjects', (req, res) => {
  const { scheme, semester, branch } = req.params;
  const subjects = schemesData[scheme]?.[semester]?.[branch];
  if (!subjects) {
    return res.status(404).json({ success: false, error: `Subjects not found for ${scheme} / ${semester} / ${branch}` });
  }
  res.json({
    success: true,
    scheme,
    semester,
    branch,
    subjects
  });
});

// 5. Calculate SGPA
app.post('/api/calculator/sgpa', (req, res) => {
  const { scheme, semester, branch, subjects } = req.body;

  if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
    return res.status(400).json({ success: false, error: 'Subjects array is required with marks and credits.' });
  }

  let totalCredits = 0;
  let totalNumerator = 0;
  const breakdown = [];

  for (const sub of subjects) {
    const marks = Number(sub.marks);
    const credits = Number(sub.credits);

    if (isNaN(marks) || marks < 0 || marks > 100) {
      return res.status(400).json({
        success: false,
        error: `Invalid marks '${sub.marks}' for course '${sub.name}' (${sub.code}). Marks must be between 0 and 100.`
      });
    }

    const grade = getGradeInfo(marks);
    const gradeCredits = grade.point * credits;

    totalCredits += credits;
    totalNumerator += gradeCredits;

    breakdown.push({
      name: sub.name,
      code: sub.code,
      credits,
      marks,
      gradePoint: grade.point,
      letterGrade: grade.letter,
      status: grade.status,
      gradeCredits
    });
  }

  const rawSgpa = totalCredits > 0 ? totalNumerator / totalCredits : 0;
  const sgpa = Math.round(rawSgpa * 100) / 100;

  res.json({
    success: true,
    scheme,
    semester,
    branch,
    sgpa,
    totalCredits,
    totalNumerator,
    breakdown,
    calculatedAt: new Date().toISOString()
  });
});

// 6. Calculate CGPA
app.post('/api/calculator/cgpa', (req, res) => {
  const { scheme, branchGroup, semesterSgpas } = req.body;

  if (!scheme) {
    return res.status(400).json({ success: false, error: 'Scheme is required' });
  }

  if (!Array.isArray(semesterSgpas) || semesterSgpas.length === 0) {
    return res.status(400).json({ success: false, error: 'semesterSgpas array is required' });
  }

  let matrixKey = scheme;
  if (scheme === '2025') {
    matrixKey = branchGroup === 'cs' ? '2025_CS' : '2025_OTHER';
  }

  const creditWeights = SCHEME_CREDITS_MATRIX[matrixKey] || [20, 20, 20, 20, 20, 20, 20, 20];

  let totalCredits = 0;
  let totalWeightedNumerator = 0;
  const breakdown = [];

  semesterSgpas.forEach((item, index) => {
    const semIndex = item.semester ? item.semester - 1 : index;
    const sgpaVal = item.sgpa !== undefined && item.sgpa !== null && item.sgpa !== '' ? Number(item.sgpa) : null;

    if (sgpaVal !== null && !isNaN(sgpaVal) && sgpaVal >= 0 && sgpaVal <= 10) {
      const credits = creditWeights[semIndex] || 20;
      const weighted = credits * sgpaVal;
      totalCredits += credits;
      totalWeightedNumerator += weighted;

      breakdown.push({
        semester: semIndex + 1,
        name: `${semIndex + 1}${['st', 'nd', 'rd', 'th'][Math.min(semIndex, 3)]} Semester`,
        credits,
        sgpa: Number(sgpaVal.toFixed(2)),
        weightedSgpa: Number(weighted.toFixed(2))
      });
    }
  });

  if (totalCredits === 0) {
    return res.status(400).json({ success: false, error: 'Please enter at least one valid SGPA value between 0 and 10.' });
  }

  const rawCgpa = totalWeightedNumerator / totalCredits;
  const cgpa = Number(rawCgpa.toFixed(2));

  res.json({
    success: true,
    scheme,
    branchGroup: scheme === '2025' ? (branchGroup === 'cs' ? 'Computer Science family' : 'All other branches') : null,
    cgpa,
    totalCreditsEarned: totalCredits,
    breakdown,
    calculatedAt: new Date().toISOString()
  });
});

// 7. Calculate Percentage
app.post('/api/calculator/percentage', (req, res) => {
  const { type, value, formula } = req.body;
  const val = Number(value);

  if (isNaN(val)) {
    return res.status(400).json({ success: false, error: 'A valid numerical value is required.' });
  }

  let result = 0;
  let label = '';

  switch (type) {
    case 'sgpa_to_percentage':
      if (val < 0 || val > 10) return res.status(400).json({ success: false, error: 'SGPA must be between 0 and 10' });
      result = Number((val * 10).toFixed(2));
      label = `Your percentage is ${result}%`;
      break;

    case 'percentage_to_sgpa':
      if (val < 0 || val > 100) return res.status(400).json({ success: false, error: 'Percentage must be between 0 and 100' });
      result = Number((val / 10).toFixed(2));
      label = `Your SGPA is ${result}`;
      break;

    case 'cgpa_to_percentage':
      if (val < 0 || val > 10) return res.status(400).json({ success: false, error: 'CGPA must be between 0 and 10' });
      if (formula === 'classic') {
        result = Number(((val - 0.75) * 10).toFixed(2));
      } else {
        result = Number((val * 10).toFixed(2));
      }
      label = `Your percentage is ${result}%`;
      break;

    case 'percentage_to_cgpa':
      if (val < 0 || val > 100) return res.status(400).json({ success: false, error: 'Percentage must be between 0 and 100' });
      if (formula === 'classic') {
        result = Number(((val / 10) + 0.75).toFixed(2));
      } else {
        result = Number((val / 10).toFixed(2));
      }
      label = `Your CGPA is ${result}`;
      break;

    default:
      return res.status(400).json({ success: false, error: 'Unknown conversion type.' });
  }

  res.json({
    success: true,
    type,
    input: val,
    formula: formula || 'cbcs',
    result,
    label
  });
});

// 8. Saved Reports History API
app.get('/api/reports', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(REPORTS_FILE, 'utf8'));
    res.json({ success: true, count: data.length, reports: data });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Could not load reports' });
  }
});

app.post('/api/reports', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(REPORTS_FILE, 'utf8'));
    const newReport = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      ...req.body
    };
    data.unshift(newReport);
    fs.writeFileSync(REPORTS_FILE, JSON.stringify(data.slice(0, 50), null, 2));
    res.json({ success: true, report: newReport });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to save report' });
  }
});

app.delete('/api/reports/:id', (req, res) => {
  try {
    const { id } = req.params;
    let data = JSON.parse(fs.readFileSync(REPORTS_FILE, 'utf8'));
    data = data.filter(r => r.id !== id);
    fs.writeFileSync(REPORTS_FILE, JSON.stringify(data, null, 2));
    res.json({ success: true, message: 'Report removed' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete report' });
  }
});

// Serve Frontend Client if built
const CLIENT_DIST = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(CLIENT_DIST)) {
  console.log(`[VTU-Vidya] Serving production frontend from: ${CLIENT_DIST}`);
  app.use(express.static(CLIENT_DIST));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(CLIENT_DIST, 'index.html'));
    }
    next();
  });
}

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`🎓 VTU-Vidya by neeraj&tarun is running!`);
  console.log(`🌐 Local Web App: http://0.0.0.0:${PORT}`);
  console.log(`📡 API Base:      http://0.0.0.0:${PORT}/api`);
  console.log(`=======================================================`);
});

module.exports = app;



