export interface ParsedEntry {
  type: 'subheading' | 'bullet' | 'text';
  main: string;
  meta?: string; // date range, company, location — extracted from right side
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

const SECTION_TITLES = new Set([
  'SUMMARY', 'OBJECTIVE', 'PROFILE', 'ABOUT',
  'EXPERIENCE', 'WORK EXPERIENCE', 'PROFESSIONAL EXPERIENCE', 'EMPLOYMENT',
  'EDUCATION', 'ACADEMIC BACKGROUND',
  'SKILLS', 'TECHNICAL SKILLS', 'CORE COMPETENCIES', 'COMPETENCIES',
  'PROJECTS', 'PERSONAL PROJECTS', 'PORTFOLIO',
  'CERTIFICATIONS', 'CERTIFICATES', 'LICENSES',
  'AWARDS', 'HONORS', 'ACHIEVEMENTS',
  'PUBLICATIONS', 'RESEARCH',
  'LANGUAGES',
  'INTERESTS', 'HOBBIES',
  'REFERENCES', 'VOLUNTEER', 'VOLUNTEERING',
  'CONTACT', 'CONTACT INFORMATION',
]);

function isSectionTitle(line: string): boolean {
  const clean = line.replace(/:$/, '').trim().toUpperCase();
  if (SECTION_TITLES.has(clean)) return true;
  // All-caps short line with no numbers
  if (clean === line.toUpperCase() && clean.length < 40 && !/\d/.test(clean) && clean.length > 3) return true;
  return false;
}

function isContactLine(line: string): boolean {
  return (
    /\S+@\S+\.\S+/.test(line) ||           // email
    /\+?\d[\d\s\-().]{7,}/.test(line) ||   // phone
    /linkedin\.com|github\.com|gitlab\.com|portfolio|website/i.test(line) ||
    /^[\w\s,]+,\s*[A-Z]{2}/.test(line)     // City, ST
  );
}

function splitMeta(line: string): { main: string; meta?: string } {
  // "Software Engineer | Acme Corp | Jan 2022 – Present"
  // "B.S. Computer Science | MIT | 2018 – 2022"
  const parts = line.split(/\s{2,}|\s*\|\s*|\s*—\s*|\s*[-–]\s*(?=\d{4}|Present|Current)/i);
  if (parts.length >= 2) {
    const last = parts[parts.length - 1].trim();
    const isDate = /\d{4}|present|current|now/i.test(last);
    if (isDate) {
      return { main: parts.slice(0, -1).join(' | '), meta: last };
    }
  }
  return { main: line };
}

export function parseResume(text: string): ParsedResume {
  const lines = text.split('\n').map((l) => l.trim());
  let name = '';
  const contact: string[] = [];
  const sections: ParsedSection[] = [];

  let headerDone = false;
  let currentSection: ParsedSection | null = null;

  for (const line of lines) {
    if (!line) continue;

    // --- Name: first meaningful non-contact line ---
    if (!headerDone && !name && !isSectionTitle(line) && !isContactLine(line) && line.length < 60) {
      name = line;
      continue;
    }

    // --- Contact lines before first section ---
    if (!headerDone && !isSectionTitle(line)) {
      if (isContactLine(line) || (name && !currentSection)) {
        contact.push(line);
        continue;
      }
    }

    // --- Section heading ---
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

    // --- Bullet ---
    if (/^[-•*▪]\s/.test(line)) {
      currentSection.entries.push({ type: 'bullet', main: line.replace(/^[-•*▪]\s*/, '') });
      continue;
    }

    // --- Subheading (bold-like lines: job titles, degree names) ---
    const { main, meta } = splitMeta(line);
    const looksLikeSubheading =
      line.length < 100 &&
      !/^[a-z]/.test(line) && // doesn't start lowercase
      (meta !== undefined || /\b(engineer|developer|manager|director|analyst|designer|intern|lead|senior|junior|head|vp|cto|ceo|founder|consultant|architect|scientist|researcher|assistant|associate|specialist)/i.test(line));

    if (looksLikeSubheading) {
      currentSection.entries.push({ type: 'subheading', main, meta });
    } else {
      currentSection.entries.push({ type: 'text', main: line });
    }
  }

  return { name: name || 'Resume', contact, sections };
}
