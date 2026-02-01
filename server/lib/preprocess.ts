
import { parse } from 'date-fns';

export interface ProcessedInternship {
  stipend_min: string | null; // stored as numeric in DB
  stipend_max: string | null;
  stipend_type: string;
  stipend_period: string;
  duration_months: string | null;
  apply_by_dt: Date | null;
  posted_dt: Date | null;
  start_dt: Date | null;
  start_immediate: boolean;
  is_remote: boolean;
  city: string;
  is_multi_city: boolean;
  skills_tokens: string[];
  text_blob: string;
}

export function preprocessInternship(row: any): ProcessedInternship {
  const stipendText = (row.stipend || '').toLowerCase().trim();
  const durationText = (row.duration || '').toLowerCase().trim();
  const locationText = (row.location || '').toLowerCase().trim();
  const skillsText = (row.skills || '').toLowerCase().trim();

  // 3.2 Stipend Parsing
  let stipend_min: number | null = null;
  let stipend_max: number | null = null;
  let stipend_type = 'unknown';
  let stipend_period = 'unknown';

  if (stipendText.includes('unpaid')) {
    stipend_min = 0;
    stipend_max = 0;
    stipend_type = 'unpaid';
  } else if (stipendText.includes('performance')) {
    stipend_type = 'performance_based';
  } else {
    // Extract numbers
    const numbers = stipendText.match(/[\d,]+/g)?.map((s: string) => parseInt(s.replace(/,/g, ''))) || [];
    if (numbers.length > 0) {
      stipend_min = Math.min(...numbers);
      stipend_max = Math.max(...numbers);
      stipend_type = numbers.length > 1 ? 'range' : 'fixed';
    }
  }

  if (stipendText.includes('month')) stipend_period = 'month';
  else if (stipendText.includes('week')) stipend_period = 'week';
  else if (stipendText.includes('lump sum')) stipend_period = 'lump_sum';

  // 3.3 Duration Parsing
  let duration_months: number | null = null;
  const durationNum = parseFloat(durationText.match(/[\d.]+/)?.[0] || '0');
  
  if (durationText.includes('week')) {
    duration_months = durationNum / 4.345;
  } else if (durationText.includes('day')) {
    duration_months = durationNum / 30;
  } else if (durationText.includes('month')) {
    duration_months = durationNum;
  }

  // 3.4 Date Parsing
  // Helper to parse loose dates - trying ISO first then falling back
  const parseDate = (d: string): Date | null => {
    if (!d) return null;
    const date = new Date(d);
    return isNaN(date.getTime()) ? null : date;
  };

  const apply_by_dt = parseDate(row.apply_by_date);
  const posted_dt = parseDate(row.date_time);
  const start_dt = parseDate(row.start_date);
  const start_immediate = (row.start_date || '').toLowerCase().includes('immediate');

  // 3.5 Location
  const is_remote = locationText.includes('work from home') || locationText.includes('wfh') || locationText.includes('remote');
  const is_multi_city = locationText.includes(',') || locationText.includes('/') || locationText.includes('multiple');
  let city = 'Unknown';
  if (is_remote) city = 'Remote';
  else if (is_multi_city) city = 'Multiple';
  else if (locationText && locationText !== 'null') city = locationText.split('(')[0].trim(); // Remove (India) etc

  // 3.6 Skills & Text Blob
  const skills_tokens = skillsText.split(/[,|;]/).map((s: string) => s.trim()).filter((s: string) => s.length > 0);
  
  const text_blob = [
    row.profile,
    row.skills,
    row.perks,
    row.education,
    row.offer,
    row.company
  ].filter(Boolean).join(' ').toLowerCase();

  return {
    stipend_min: stipend_min?.toString() || null,
    stipend_max: stipend_max?.toString() || null,
    stipend_type,
    stipend_period,
    duration_months: duration_months?.toFixed(2) || null,
    apply_by_dt,
    posted_dt,
    start_dt,
    start_immediate,
    is_remote,
    city,
    is_multi_city,
    skills_tokens,
    text_blob
  };
}
