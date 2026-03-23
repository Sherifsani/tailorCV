import { ResumeData } from '../../types/resume';
import { renderSection } from './shared';

export function jakesTemplate(r: ResumeData): string {
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
    padding: 28pt 36pt;
    line-height: 1.35;
  }

  /* ── Header ── */
  .header { text-align: center; margin-bottom: 6pt; }
  .name {
    font-size: 22pt;
    font-weight: 700;
    font-variant: small-caps;
    letter-spacing: 1px;
    margin-bottom: 3pt;
  }
  .contact { font-size: 8.5pt; color: #000; }
  .contact span + span::before { content: ' | '; color: #555; }

  /* ── Section ── */
  .section { margin-top: 10pt; }
  .section-title {
    font-size: 11pt;
    font-weight: 700;
    font-variant: small-caps;
    border-bottom: 1pt solid #000;
    padding-bottom: 1pt;
    margin-bottom: 4pt;
  }
  .section-body { margin-top: 0; }

  /* ── Subheading — mirrors \resumeSubheading ── */
  .subheading { margin-top: 7pt; }
  .sh-row1, .sh-row2 {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }
  .sh-row1 { margin-bottom: 0; }
  .sh-row2 { margin-top: 0; }
  .sh-org  { font-weight: 700; font-size: 10.5pt; }
  .sh-date { font-size: 9.5pt; font-weight: 700; flex-shrink: 0; padding-left: 6pt; }
  .sh-role     { font-style: italic; font-size: 9.5pt; }
  .sh-location { font-style: italic; font-size: 9.5pt; flex-shrink: 0; padding-left: 6pt; }

  /* ── Project — mirrors \resumeProjectHeading ── */
  .project { margin-top: 6pt; }
  .proj-name { font-size: 10pt; font-weight: 700; }
  .proj-tech { font-size: 9.5pt; font-weight: 700; flex-shrink: 0; padding-left: 6pt; }

  /* ── Bullets — mirrors \resumeItem ── */
  .bullets {
    list-style: none;
    margin: 4pt 0 0 0;
    padding: 0;
  }
  .bullets li {
    position: relative;
    padding-left: 12pt;
    font-size: 9.5pt;
    line-height: 1.4;
    margin-bottom: 2pt;
  }
  .bullets li::before {
    content: '\u2022';
    position: absolute;
    left: 3pt;
    font-size: 7pt;
    top: 2pt;
  }

  /* ── Skills ── */
  .skills-block { margin-top: 4pt; }
  .skills-row { font-size: 9.5pt; line-height: 1.65; }
  .skills-label { font-weight: 700; }
  .skills-value { font-weight: 400; }
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
