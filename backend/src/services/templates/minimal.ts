import { ResumeData } from '../../types/resume';
import { renderSection } from './shared';

export function minimalTemplate(r: ResumeData): string {
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
    padding: 30pt 42pt;
    line-height: 1.5;
  }

  .header {
    text-align: center;
    margin-bottom: 10pt;
    padding-bottom: 10pt;
    border-bottom: 0.5pt solid #ddd;
  }
  .name {
    font-size: 22pt;
    font-weight: 600;
    letter-spacing: -0.5px;
    line-height: 1.1;
    margin-bottom: 4pt;
  }
  .contact { font-size: 8.5pt; color: #555; font-weight: 300; }
  .contact span + span::before { content: '  —  '; color: #ccc; }

  .section { margin-top: 13pt; }
  .section-title {
    font-size: 7.5pt;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 2.5px;
    color: #888;
    border-bottom: 0.5pt solid #ddd;
    padding-bottom: 2pt;
    margin-bottom: 4pt;
  }

  .subheading { margin-top: 9pt; }
  .sh-row1, .sh-row2 { display: flex; justify-content: space-between; align-items: baseline; }
  .sh-org  { font-weight: 600; font-size: 10pt; }
  .sh-date { font-size: 9pt; color: #888; font-weight: 300; flex-shrink: 0; padding-left: 8pt; }
  .sh-role     { font-size: 9.5pt; color: #444; font-weight: 300; }
  .sh-location { font-size: 9pt; color: #999; font-weight: 300; flex-shrink: 0; padding-left: 8pt; }

  .project { margin-top: 7pt; }
  .proj-name { font-size: 10pt; font-weight: 600; }
  .proj-tech { font-size: 9pt; color: #777; font-weight: 300; flex-shrink: 0; padding-left: 8pt; }

  .bullets { list-style: none; margin: 5pt 0 0 0; padding: 0; }
  .bullets li {
    position: relative;
    padding-left: 14pt;
    margin-bottom: 3.5pt;
    font-size: 9.5pt;
    font-weight: 300;
    line-height: 1.55;
    color: #222;
  }
  .bullets li::before {
    content: '–';
    position: absolute;
    left: 3pt;
    color: #bbb;
    font-weight: 400;
  }

  .skills-block { margin-top: 4pt; }
  .skills-row { font-size: 9.5pt; line-height: 1.7; font-weight: 300; }
  .skills-label { font-weight: 600; color: #333; }
  .skills-value { color: #444; }
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
