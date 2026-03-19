import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

// Attempt to identify resume sections from plain text
function parseSections(text: string): { heading: string; body: string }[] {
  const sectionKeywords = /^(SUMMARY|OBJECTIVE|EXPERIENCE|EDUCATION|SKILLS|PROJECTS|CERTIFICATIONS|AWARDS|PUBLICATIONS|LANGUAGES|INTERESTS|REFERENCES|CONTACT|PROFILE|WORK EXPERIENCE|PROFESSIONAL EXPERIENCE|TECHNICAL SKILLS)[\s:]*$/im;

  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const sections: { heading: string; body: string }[] = [];

  let currentHeading = '';
  let currentBody: string[] = [];

  for (const line of lines) {
    if (sectionKeywords.test(line)) {
      if (currentHeading || currentBody.length) {
        sections.push({ heading: currentHeading, body: currentBody.join('\n') });
      }
      currentHeading = line.replace(/:$/, '').toUpperCase();
      currentBody = [];
    } else {
      currentBody.push(line);
    }
  }

  if (currentHeading || currentBody.length) {
    sections.push({ heading: currentHeading, body: currentBody.join('\n') });
  }

  return sections;
}

export function generateResumePdf(resumeText: string, candidateName?: string): Readable {
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 50, bottom: 50, left: 60, right: 60 },
    info: { Title: 'Tailored Resume', Author: candidateName ?? 'tailorCV' },
  });

  const primaryColor = '#1d4ed8'; // blue-700
  const textColor = '#1e293b';    // slate-800
  const mutedColor = '#64748b';   // slate-500
  const pageWidth = doc.page.width - 120; // account for margins

  const sections = parseSections(resumeText);

  // --- Header ---
  if (candidateName) {
    doc.fontSize(22).fillColor(primaryColor).font('Helvetica-Bold').text(candidateName, { align: 'center' });
    doc.moveDown(0.3);
  }

  doc.moveTo(60, doc.y).lineTo(doc.page.width - 60, doc.y).strokeColor('#e2e8f0').lineWidth(1).stroke();
  doc.moveDown(0.5);

  // --- Sections ---
  for (const section of sections) {
    // Section heading
    if (section.heading) {
      doc
        .fontSize(9)
        .fillColor(mutedColor)
        .font('Helvetica-Bold')
        .text(section.heading, { characterSpacing: 1.5 });

      doc.moveTo(60, doc.y).lineTo(doc.page.width - 60, doc.y).strokeColor('#e2e8f0').lineWidth(0.5).stroke();
      doc.moveDown(0.3);
    }

    // Section body
    if (section.body) {
      const lines = section.body.split('\n');
      for (const line of lines) {
        if (!line.trim()) {
          doc.moveDown(0.3);
          continue;
        }

        const isBullet = /^[-•*]\s/.test(line);
        const cleanLine = isBullet ? line.replace(/^[-•*]\s*/, '') : line;

        // Lines that look like job titles / dates (short, possibly with pipes or dashes)
        const isSubheading = !isBullet && line.length < 80 && /\d{4}|present|current/i.test(line);

        if (isSubheading) {
          doc.fontSize(10).fillColor(textColor).font('Helvetica-Bold').text(cleanLine, { width: pageWidth });
        } else if (isBullet) {
          doc
            .fontSize(9.5)
            .fillColor(textColor)
            .font('Helvetica')
            .text(`• ${cleanLine}`, { width: pageWidth, indent: 10 });
        } else {
          doc.fontSize(9.5).fillColor(textColor).font('Helvetica').text(cleanLine, { width: pageWidth });
        }
      }
    }

    doc.moveDown(0.6);
  }

  doc.end();
  return doc as unknown as Readable;
}
