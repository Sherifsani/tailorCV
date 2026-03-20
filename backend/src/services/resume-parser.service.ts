export interface ParsedEntry {
  type: 'subheading' | 'bullet' | 'text';
  main: string;
  meta?: string;
}

export interface ParsedSection {
  title: string;
  entries: ParsedEntry[];
}

export interface ParsedResume {
  name: string;
  contact: string[];
  sections: ParsedSection[];
}

// Lines to ignore entirely
const META_HEADERS = new Set(['RESUME', 'CV', 'CURRICULUM VITAE', 'CURRICULUM-VITAE']);

// Only match exact known section keywords — no all-caps heuristic
const SECTION_TITLES = new Set([
  'SUMMARY', 'OBJECTIVE', 'PROFILE', 'ABOUT',
  'EXPERIENCE', 'WORK EXPERIENCE', 'PROFESSIONAL EXPERIENCE', 'EMPLOYMENT', 'WORK HISTORY',
  'EDUCATION', 'ACADEMIC BACKGROUND', 'ACADEMIC HISTORY',
  'SKILLS', 'TECHNICAL SKILLS', 'CORE COMPETENCIES', 'COMPETENCIES', 'KEY SKILLS',
  'PROJECTS', 'PERSONAL PROJECTS', 'PORTFOLIO', 'NOTABLE PROJECTS',
  'CERTIFICATIONS', 'CERTIFICATES', 'LICENSES', 'CERTIFICATIONS & LICENSES',
  'AWARDS', 'HONORS', 'ACHIEVEMENTS', 'HONORS & AWARDS',
  'PUBLICATIONS', 'RESEARCH',
  'LANGUAGES',
  'INTERESTS', 'HOBBIES', 'ACTIVITIES',
  'REFERENCES', 'VOLUNTEER', 'VOLUNTEERING', 'VOLUNTEER EXPERIENCE',
  'CONTACT', 'CONTACT INFORMATION',
]);

function isSectionTitle(line: string): boolean {
  const clean = line.replace(/:$/, '').trim().toUpperCase();
  return SECTION_TITLES.has(clean);
}

function isContactLine(line: string): boolean {
  return (
    /\S+@\S+\.\S+/.test(line) ||
    /\+?\d[\d\s\-().]{7,}/.test(line) ||
    /linkedin\.com|github\.com|gitlab\.com|portfolio|website/i.test(line) ||
    /^[\w\s]+,\s*[A-Z]{2}(\s+\d{5})?$/.test(line)
  );
}

// Only extract meta (date) if there's a clear date pattern on the right side
function extractDate(line: string): { main: string; meta: string } | null {
  // Match patterns like "Jan 2020 – Present", "2018 - 2022", "May 2021"
  const datePattern = /\s{2,}|\s*[|\u2013\u2014]\s*(?=\w)/;
  const parts = line.split(datePattern);

  if (parts.length < 2) return null;

  const last = parts[parts.length - 1].trim();
  const isDate = /(\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b.*\d{4}|\d{4}\s*[-\u2013]\s*(\d{4}|present|current|now)|\d{4}\s*[-\u2013]\s*present)/i.test(last);

  if (!isDate) return null;

  return {
    main: parts.slice(0, -1).join(' ').trim(),
    meta: last,
  };
}

export function parseResume(text: string, overrideName?: string): ParsedResume {
  const lines = text.split('\n').map((l) => l.trim());
  let name = '';
  const contact: string[] = [];
  const sections: ParsedSection[] = [];

  let headerDone = false;
  let currentSection: ParsedSection | null = null;

  for (const line of lines) {
    if (!line) continue;

    // Skip document meta headers
    if (META_HEADERS.has(line.toUpperCase())) continue;

    // Extract name — first short non-contact, non-section line
    if (!headerDone && !name && !isSectionTitle(line) && !isContactLine(line) && line.length < 60) {
      name = line;
      continue;
    }

    // Contact lines before first section
    if (!headerDone && !isSectionTitle(line)) {
      contact.push(line);
      continue;
    }

    // Section heading
    if (isSectionTitle(line)) {
      headerDone = true;
      currentSection = { title: line.replace(/:$/, '').trim().toUpperCase(), entries: [] };
      sections.push(currentSection);
      continue;
    }

    headerDone = true;
    if (!currentSection) {
      currentSection = { title: '', entries: [] };
      sections.push(currentSection);
    }

    // Bullet point
    if (/^[-•*▪◦]\s/.test(line)) {
      currentSection.entries.push({ type: 'bullet', main: line.replace(/^[-•*▪◦]\s*/, '') });
      continue;
    }

    // Subheading: ONLY if we can extract a clear date from the line
    const dated = extractDate(line);
    if (dated) {
      currentSection.entries.push({ type: 'subheading', main: dated.main, meta: dated.meta });
      continue;
    }

    // Everything else is plain text
    currentSection.entries.push({ type: 'text', main: line });
  }

  return { name: overrideName || name || 'Resume', contact, sections };
}
