import { ParsedResume, ParsedSection, ParsedEntry } from '../resume-parser.service';

function renderEntries(entries: ParsedEntry[]): string {
  const out: string[] = [];
  let i = 0;

  while (i < entries.length) {
    const e = entries[i];

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
      ${s.title ? `<div class="section-title"><span>${s.title}</span></div>` : ''}
      ${renderEntries(s.entries)}
    </div>`;
}

export function classicTemplate(r: ParsedResume): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: 11pt;
    color: #1a1a1a;
    background: #fff;
    padding: 30pt 40pt;
    line-height: 1.4;
  }
  .name {
    text-align: center;
    font-size: 23pt;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    margin-bottom: 5pt;
  }
  .contact {
    text-align: center;
    font-size: 9.5pt;
    color: #333;
    margin-bottom: 12pt;
  }
  .contact span + span::before { content: ' · '; color: #aaa; }
  .section { margin-top: 10pt; }
  .section-title {
    display: flex;
    align-items: center;
    gap: 6pt;
    margin-bottom: 5pt;
  }
  .section-title span {
    font-size: 10pt;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1.8px;
    white-space: nowrap;
    color: #1a1a1a;
  }
  .section-title::before,
  .section-title::after {
    content: '';
    flex: 1;
    height: 0.5px;
    background: #1a1a1a;
  }
  .entry-head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-top: 6pt;
  }
  .entry-org { font-weight: 700; font-size: 10.5pt; }
  .entry-date { font-size: 9.5pt; color: #444; font-style: italic; }
  .entry-subhead {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-top: 1pt;
  }
  .entry-role { font-style: italic; font-size: 10pt; color: #333; }
  .entry-location { font-style: italic; font-size: 9.5pt; color: #555; }
  .bullets {
    list-style: none;
    margin-top: 3pt;
    padding-left: 12pt;
  }
  .bullets li {
    position: relative;
    font-size: 10pt;
    padding-left: 10pt;
    margin-bottom: 2pt;
    line-height: 1.45;
  }
  .bullets li::before {
    content: '◦';
    position: absolute;
    left: 0;
    font-size: 9pt;
    top: 0.5pt;
    color: #555;
  }
  .text-line { font-size: 10pt; margin-top: 2pt; color: #222; }
</style>
</head>
<body>
  <div class="name">${r.name}</div>
  ${r.contact.length ? `<div class="contact">${r.contact.map((c) => `<span>${c}</span>`).join('')}</div>` : ''}
  ${r.sections.map(renderSection).join('')}
</body>
</html>`;
}
