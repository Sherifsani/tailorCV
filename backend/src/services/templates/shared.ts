import { ParsedEntry } from '../resume-parser.service';

// Shared entry renderer used by all three templates
// Injects CSS class names so each template can style them differently
export function renderEntries(entries: ParsedEntry[]): string {
  const out: string[] = [];
  let i = 0;

  while (i < entries.length) {
    const e = entries[i];

    if (e.type === 'subheading') {
      // Row 1: bold org + date (right)
      out.push(`
        <div class="entry-head">
          <span class="entry-org">${e.main}</span>
          <span class="entry-date">${e.meta ?? ''}</span>
        </div>`);

      // Row 2: the very next text line (if present and short) is treated as role/location
      const next = entries[i + 1];
      if (next && next.type === 'text' && next.main.length < 100) {
        const locMatch = extractLocation(next.main);
        out.push(`
        <div class="entry-subhead">
          <span class="entry-role">${locMatch.role}</span>
          <span class="entry-location">${locMatch.location}</span>
        </div>`);
        i += 2;
      } else {
        i++;
      }
      continue;
    }

    if (e.type === 'bullet') {
      const bullets: string[] = [];
      while (i < entries.length && entries[i].type === 'bullet') {
        bullets.push(`<li>${entries[i].main}</li>`);
        i++;
      }
      out.push(`<ul class="bullets">${bullets.join('')}</ul>`);
      continue;
    }

    // Plain text
    out.push(`<p class="text-line">${e.main}</p>`);
    i++;
  }

  return out.join('');
}

// Split "Software Engineer | New York, NY" into role + location
function extractLocation(line: string): { role: string; location: string } {
  const sep = /\s*[|,]\s*(?=[A-Z])/;
  const parts = line.split(sep);
  if (parts.length >= 2) {
    const last = parts[parts.length - 1].trim();
    // Looks like a location if short and doesn't start lowercase
    if (last.length < 40 && !/^[a-z]/.test(last)) {
      return { role: parts.slice(0, -1).join(', '), location: last };
    }
  }
  return { role: line, location: '' };
}
