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
      ${s.title ? `<div class="section-title">${s.title}</div>` : ''}
      ${renderEntries(s.entries)}
    </div>`;
}

export function minimalTemplate(r: ParsedResume): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'DM Sans', Helvetica, Arial, sans-serif;
    font-size: 10pt;
    color: #111;
    background: #fff;
    padding: 32pt 44pt;
    line-height: 1.5;
  }
  .name {
    text-align: center;
    font-size: 24pt;
    font-weight: 300;
    letter-spacing: -0.5px;
    margin-bottom: 5pt;
  }
  .contact {
    text-align: center;
    font-size: 9pt;
    color: #666;
    margin-bottom: 14pt;
  }
  .contact span + span::before { content: '  —  '; color: #ccc; }
  .section { margin-top: 12pt; }
  .section-title {
    font-size: 7.5pt;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 2.5px;
    color: #888;
    border-bottom: 1px solid #e5e5e5;
    padding-bottom: 3pt;
    margin-bottom: 6pt;
  }
  .entry-head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-top: 7pt;
  }
  .entry-org { font-weight: 600; font-size: 10pt; color: #111; }
  .entry-date { font-size: 9pt; color: #888; font-weight: 300; }
  .entry-subhead {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-top: 1pt;
  }
  .entry-role { font-size: 9.5pt; color: #555; font-weight: 300; }
  .entry-location { font-size: 9pt; color: #999; font-weight: 300; }
  .bullets {
    list-style: none;
    margin-top: 4pt;
    padding-left: 10pt;
  }
  .bullets li {
    position: relative;
    font-size: 9.5pt;
    padding-left: 12pt;
    margin-bottom: 2.5pt;
    color: #333;
    line-height: 1.5;
    font-weight: 300;
  }
  .bullets li::before {
    content: '–';
    position: absolute;
    left: 0;
    color: #bbb;
    font-weight: 400;
  }
  .text-line { font-size: 9.5pt; margin-top: 2pt; color: #444; font-weight: 300; }
</style>
</head>
<body>
  <div class="name">${r.name}</div>
  ${r.contact.length ? `<div class="contact">${r.contact.map((c) => `<span>${c}</span>`).join('')}</div>` : ''}
  ${r.sections.map(renderSection).join('')}
</body>
</html>`;
}
