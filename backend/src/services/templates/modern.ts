import { ParsedResume, ParsedEntry } from '../resume-parser.service';

function renderEntries(entries: ParsedEntry[]): string {
  return entries.map((e) => {
    if (e.type === 'bullet') {
      return `<div class="bullet"><span class="dot">▸</span>${e.main}</div>`;
    }
    if (e.type === 'subheading') {
      return `
        <div class="subheading-row">
          <span class="subheading-main">${e.main}</span>
          ${e.meta ? `<span class="subheading-meta">${e.meta}</span>` : ''}
        </div>`;
    }
    return `<div class="text-line">${e.main}</div>`;
  }).join('');
}

export function modernTemplate(r: ParsedResume): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Inter', Arial, sans-serif;
    font-size: 9.5pt;
    color: #1e293b;
    background: #fff;
    line-height: 1.5;
  }
  .header {
    background: #0f172a;
    color: #fff;
    padding: 28pt 40pt 22pt;
  }
  .name {
    font-size: 22pt;
    font-weight: 700;
    letter-spacing: -0.3px;
    margin-bottom: 6pt;
  }
  .contact {
    display: flex;
    flex-wrap: wrap;
    gap: 6pt 16pt;
    font-size: 8.5pt;
    color: #94a3b8;
  }
  .contact-item { display: flex; align-items: center; gap: 4pt; }
  .body { padding: 20pt 40pt 36pt; }
  .section { margin-top: 16pt; }
  .section-title {
    font-size: 8pt;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: #2563eb;
    margin-bottom: 6pt;
    padding-bottom: 3pt;
    border-bottom: 1.5px solid #dbeafe;
  }
  .subheading-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-top: 7pt;
    margin-bottom: 1pt;
  }
  .subheading-main { font-weight: 600; font-size: 9.5pt; color: #0f172a; }
  .subheading-meta {
    font-size: 8.5pt;
    color: #64748b;
    background: #f1f5f9;
    padding: 1px 6px;
    border-radius: 3px;
    white-space: nowrap;
  }
  .bullet { display: flex; gap: 6pt; padding-left: 4pt; margin-top: 2.5pt; font-size: 9pt; color: #334155; }
  .dot { color: #2563eb; flex-shrink: 0; margin-top: 1pt; }
  .text-line { margin-top: 2pt; font-size: 9pt; color: #334155; }
</style>
</head>
<body>
  <div class="header">
    <div class="name">${r.name}</div>
    ${r.contact.length ? `<div class="contact">${r.contact.map((c) => `<div class="contact-item">${c}</div>`).join('')}</div>` : ''}
  </div>
  <div class="body">
    ${r.sections.map((s) => `
      <div class="section">
        ${s.title ? `<div class="section-title">${s.title}</div>` : ''}
        ${renderEntries(s.entries)}
      </div>
    `).join('')}
  </div>
</body>
</html>`;
}
