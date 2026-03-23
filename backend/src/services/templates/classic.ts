import { ResumeData } from '../../types/resume';
import { renderSection } from './shared';

export function classicTemplate(r: ResumeData): string {
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
    padding: 28pt 38pt;
    line-height: 1.4;
  }

  .header { text-align: center; margin-bottom: 10pt; }
  .name {
    font-size: 24pt;
    font-weight: 700;
    letter-spacing: 3px;
    text-transform: uppercase;
    margin-bottom: 4pt;
  }
  .contact { font-size: 9.5pt; color: #333; }
  .contact span + span::before { content: ' · '; color: #999; }

  .section { margin-top: 13pt; }
  .section-title {
    display: flex;
    align-items: center;
    gap: 5pt;
    font-size: 10pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    margin-bottom: 5pt;
  }
  .section-title::before,
  .section-title::after { content: ''; flex: 1; height: 0.6px; background: #222; }

  .subheading { margin-top: 8pt; }
  .sh-row1, .sh-row2 { display: flex; justify-content: space-between; align-items: baseline; }
  .sh-org  { font-weight: 700; font-size: 11pt; }
  .sh-date { font-style: italic; font-size: 9.5pt; color: #444; flex-shrink: 0; padding-left: 6pt; }
  .sh-role     { font-style: italic; font-size: 10.5pt; color: #333; }
  .sh-location { font-style: italic; font-size: 9.5pt; color: #555; flex-shrink: 0; padding-left: 6pt; }

  .project { margin-top: 7pt; }
  .proj-name { font-size: 10.5pt; font-weight: 700; }
  .proj-tech { font-size: 9.5pt; color: #444; font-style: italic; flex-shrink: 0; padding-left: 6pt; }

  .bullets { list-style: none; margin: 4pt 0 0 0; padding: 0; }
  .bullets li {
    position: relative;
    padding-left: 12pt;
    font-size: 10pt;
    line-height: 1.45;
    margin-bottom: 2.5pt;
  }
  .bullets li::before {
    content: '◦';
    position: absolute;
    left: 2pt;
    font-size: 9pt;
    top: 0.5pt;
    color: #555;
  }

  .skills-block { margin-top: 4pt; }
  .skills-row { font-size: 10pt; line-height: 1.7; }
  .skills-label { font-weight: 700; }
</style>
</head>
<body>
  <div class="header">
    <div class="name">${r.name}</div>
    ${r.contact.length ? `<div class="contact">${r.contact.map(c => `<span>${c}</span>`).join('')}</div>` : ''}
  </div>
  ${r.sections.map(renderSection).join('')}
</body>
</html>`;
}
