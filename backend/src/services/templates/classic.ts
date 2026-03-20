import { ParsedResume, ParsedSection } from '../resume-parser.service';
import { renderEntries } from './shared';

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
<link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: 11pt;
    color: #1a1a1a;
    background: #fff;
    padding: 26pt 36pt;
    line-height: 1.38;
  }
  .header { text-align: center; margin-bottom: 6pt; }
  .name {
    font-size: 25pt;
    font-weight: 700;
    letter-spacing: 3px;
    text-transform: uppercase;
    line-height: 1.1;
    margin-bottom: 5pt;
  }
  .contact { font-size: 9.5pt; color: #333; }
  .contact span + span::before { content: ' \B7 '; color: #888; }

  .section { margin-top: 10pt; }
  .section-title {
    display: flex;
    align-items: center;
    gap: 6pt;
    margin-bottom: 4pt;
  }
  .section-title::before,
  .section-title::after { content: ''; flex: 1; height: 0.5px; background: #333; }
  .section-title span {
    font-size: 9.5pt;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1.8px;
    white-space: nowrap;
  }
  .entry-head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-top: 5pt;
  }
  .entry-org { font-weight: 700; font-size: 11pt; }
  .entry-date { font-size: 10pt; font-style: italic; color: #444; flex-shrink: 0; margin-left: 8pt; }
  .entry-subhead {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-top: 0;
  }
  .entry-role { font-style: italic; font-size: 10.5pt; color: #333; }
  .entry-location { font-style: italic; font-size: 10pt; color: #555; flex-shrink: 0; margin-left: 8pt; }
  .bullets { list-style: none; margin-top: 2.5pt; padding-left: 0; }
  .bullets li {
    position: relative;
    padding-left: 14pt;
    margin-bottom: 2pt;
    font-size: 10.5pt;
    line-height: 1.4;
  }
  .bullets li::before {
    content: '◦';
    position: absolute;
    left: 3pt;
    font-size: 9pt;
    line-height: 1.6;
    color: #555;
  }
  .text-line { font-size: 10.5pt; margin-top: 2pt; line-height: 1.4; color: #222; }
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
