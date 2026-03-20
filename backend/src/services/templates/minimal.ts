import { ParsedResume, ParsedSection } from '../resume-parser.service';
import { renderEntries } from './shared';

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
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300;1,9..40,400&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'DM Sans', Helvetica, Arial, sans-serif;
    font-size: 10pt;
    color: #111;
    background: #fff;
    padding: 28pt 38pt;
    line-height: 1.45;
  }
  .header {
    text-align: center;
    margin-bottom: 6pt;
    padding-bottom: 6pt;
    border-bottom: 1pt solid #ddd;
  }
  .name {
    font-size: 24pt;
    font-weight: 600;
    letter-spacing: -0.5px;
    line-height: 1.1;
    margin-bottom: 4pt;
  }
  .contact { font-size: 8.5pt; color: #555; font-weight: 300; }
  .contact span + span::before { content: '  —  '; color: #ccc; }

  .section { margin-top: 10pt; }
  .section-title {
    font-size: 7.5pt;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 2.5px;
    color: #888;
    border-bottom: 0.5pt solid #ddd;
    padding-bottom: 2pt;
    margin-bottom: 5pt;
  }
  .entry-head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-top: 7pt;
  }
  .entry-org { font-weight: 600; font-size: 10pt; }
  .entry-date { font-size: 9pt; color: #888; font-weight: 300; flex-shrink: 0; margin-left: 8pt; }
  .entry-subhead {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-top: 0;
  }
  .entry-role { font-size: 9.5pt; color: #444; font-weight: 300; }
  .entry-location { font-size: 9pt; color: #999; font-weight: 300; flex-shrink: 0; margin-left: 8pt; }
  .bullets { list-style: none; margin-top: 3pt; padding-left: 0; }
  .bullets li {
    position: relative;
    padding-left: 14pt;
    margin-bottom: 2.5pt;
    font-size: 9.5pt;
    font-weight: 300;
    line-height: 1.48;
    color: #222;
  }
  .bullets li::before {
    content: '–';
    position: absolute;
    left: 3pt;
    color: #bbb;
    font-weight: 400;
  }
  .text-line { font-size: 9.5pt; margin-top: 2pt; color: #333; font-weight: 300; line-height: 1.48; }
</style>
</head>
<body>
  <div class="header">
    <div class="name">${r.name}</div>
    ${r.contact.length ? `<div class="contact">${r.contact.map((c) => `<span>${c}</span>`).join('')}</div>` : ''}
  </div>
  ${r.sections.map(renderSection).join('')}
</body>
</html>`;
}
