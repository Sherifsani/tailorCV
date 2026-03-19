import { ParsedResume, ParsedSection, ParsedEntry } from '../resume-parser.service';

function renderEntries(entries: ParsedEntry[]): string {
  const out: string[] = [];
  let i = 0;

  while (i < entries.length) {
    const e = entries[i];

    // Pair: subheading + optional next subheading = two-line entry header
    if (e.type === 'subheading') {
      const next = entries[i + 1];
      const hasSubRow = next && next.type === 'subheading';

      out.push(`
        <div class="entry-head">
          <span class="entry-org">${e.main}</span>
          <span class="entry-date">${e.meta ?? ''}</span>
        </div>`);

      if (hasSubRow) {
        out.push(`
        <div class="entry-subhead">
          <span class="entry-role">${next.main}</span>
          <span class="entry-location">${next.meta ?? ''}</span>
        </div>`);
        i += 2;
      } else {
        i++;
      }
      continue;
    }

    if (e.type === 'bullet') {
      // Collect consecutive bullets into a list
      const bullets: string[] = [];
      while (i < entries.length && entries[i].type === 'bullet') {
        bullets.push(`<li>${entries[i].main}</li>`);
        i++;
      }
      out.push(`<ul class="bullets">${bullets.join('')}</ul>`);
      continue;
    }

    out.push(`<p class="text-line">${e.main}</p>`);
    i++;
  }

  return out.join('');
}

function renderSection(s: ParsedSection): string {
  return `
    <div class="section">
      ${s.title ? `<div class="section-title">${s.title}</div>` : ''}
      ${renderEntries(s.entries)}
    </div>`;
}

export function jakesTemplate(r: ParsedResume): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700;900&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Lato', Arial, sans-serif;
    font-size: 10pt;
    color: #000;
    background: #fff;
    padding: 28pt 36pt;
    line-height: 1.35;
  }
  .name {
    text-align: center;
    font-size: 22pt;
    font-weight: 900;
    letter-spacing: 0.5px;
    margin-bottom: 4pt;
  }
  .contact {
    text-align: center;
    font-size: 9pt;
    color: #000;
    margin-bottom: 10pt;
  }
  .contact span + span::before { content: ' | '; color: #555; }
  .section { margin-top: 8pt; }
  .section-title {
    font-size: 10.5pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    border-bottom: 1.2px solid #000;
    padding-bottom: 1.5pt;
    margin-bottom: 4pt;
  }
  .entry-head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-top: 5pt;
  }
  .entry-org { font-weight: 700; font-size: 10pt; }
  .entry-date { font-size: 9.5pt; font-weight: 400; }
  .entry-subhead {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-top: 1pt;
  }
  .entry-role { font-style: italic; font-size: 9.5pt; }
  .entry-location { font-style: italic; font-size: 9.5pt; }
  .bullets {
    list-style: none;
    margin-top: 3pt;
    padding-left: 10pt;
  }
  .bullets li {
    position: relative;
    font-size: 9.5pt;
    padding-left: 10pt;
    margin-bottom: 1.5pt;
    line-height: 1.4;
  }
  .bullets li::before {
    content: '•';
    position: absolute;
    left: 0;
    font-size: 8pt;
    top: 1pt;
  }
  .text-line { font-size: 9.5pt; margin-top: 2pt; }
</style>
</head>
<body>
  <div class="name">${r.name}</div>
  ${r.contact.length ? `<div class="contact">${r.contact.map((c) => `<span>${c}</span>`).join('')}</div>` : ''}
  ${r.sections.map(renderSection).join('')}
</body>
</html>`;
}
