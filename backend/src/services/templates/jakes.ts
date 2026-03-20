import { ParsedResume, ParsedSection } from '../resume-parser.service';
import { renderEntries } from './shared';

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
<link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,wght@0,400;0,600;0,700;1,400;1,600&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Source Serif 4', Georgia, serif;
    font-size: 10.5pt;
    color: #000;
    background: #fff;
    padding: 24pt 32pt;
    line-height: 1.3;
  }
  .header { text-align: center; margin-bottom: 6pt; }
  .name {
    font-size: 26pt;
    font-weight: 700;
    line-height: 1.1;
    margin-bottom: 4pt;
  }
  .contact { font-size: 9pt; color: #000; }
  .contact span + span::before { content: ' | '; color: #555; }

  .section { margin-top: 8pt; }
  .section-title {
    font-size: 11pt;
    font-weight: 700;
    text-transform: uppercase;
    border-bottom: 1pt solid #000;
    padding-bottom: 1.5pt;
    margin-bottom: 4pt;
  }
  .entry-head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-top: 4pt;
  }
  .entry-org { font-weight: 700; font-size: 10.5pt; }
  .entry-date { font-size: 10pt; flex-shrink: 0; margin-left: 8pt; }
  .entry-subhead {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-top: 0;
  }
  .entry-role { font-style: italic; font-size: 10pt; }
  .entry-location { font-style: italic; font-size: 10pt; flex-shrink: 0; margin-left: 8pt; }
  .bullets { list-style: none; margin-top: 2pt; padding-left: 0; }
  .bullets li {
    position: relative;
    padding-left: 14pt;
    margin-bottom: 1.5pt;
    font-size: 10pt;
    line-height: 1.35;
  }
  .bullets li::before {
    content: '\u2022';
    position: absolute;
    left: 4pt;
    font-size: 9pt;
    line-height: 1.35;
  }
  .text-line { font-size: 10pt; margin-top: 1.5pt; line-height: 1.35; }
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
