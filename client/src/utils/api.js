// API helper for VTU-Vidya
const API_BASE = '/api';

export async function fetchSchemes() {
  const res = await fetch(`${API_BASE}/schemes`);
  if (!res.ok) throw new Error('Failed to fetch schemes');
  return res.json();
}

export async function fetchSemesters(scheme) {
  const res = await fetch(`${API_BASE}/schemes/${encodeURIComponent(scheme)}/semesters`);
  if (!res.ok) throw new Error('Failed to fetch semesters');
  return res.json();
}

export async function fetchBranches(scheme, semester) {
  const res = await fetch(`${API_BASE}/schemes/${encodeURIComponent(scheme)}/${encodeURIComponent(semester)}/branches`);
  if (!res.ok) throw new Error('Failed to fetch branches');
  return res.json();
}

export async function fetchSubjects(scheme, semester, branch) {
  const res = await fetch(`${API_BASE}/schemes/${encodeURIComponent(scheme)}/${encodeURIComponent(semester)}/${encodeURIComponent(branch)}/subjects`);
  if (!res.ok) throw new Error('Failed to fetch subjects');
  return res.json();
}

export async function calculateSGPA(payload) {
  const res = await fetch(`${API_BASE}/calculator/sgpa`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to calculate SGPA');
  return data;
}

export async function calculateCGPA(payload) {
  const res = await fetch(`${API_BASE}/calculator/cgpa`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to calculate CGPA');
  return data;
}

export async function calculatePercentage(payload) {
  const res = await fetch(`${API_BASE}/calculator/percentage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to calculate percentage');
  return data;
}

export async function fetchReports() {
  const res = await fetch(`${API_BASE}/reports`);
  if (!res.ok) throw new Error('Failed to fetch reports');
  return res.json();
}

export async function saveReport(report) {
  const res = await fetch(`${API_BASE}/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(report)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to save report');
  return data;
}

export async function deleteReport(id) {
  const res = await fetch(`${API_BASE}/reports/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete report');
  return res.json();
}

