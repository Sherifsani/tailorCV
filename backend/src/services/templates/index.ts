import { ParsedResume } from '../resume-parser.service';
import { classicTemplate } from './classic';
import { jakesTemplate } from './jakes';
import { minimalTemplate } from './minimal';

export type TemplateId = 'classic' | 'jakes' | 'minimal';

export function renderTemplate(id: TemplateId, data: ParsedResume): string {
  switch (id) {
    case 'classic': return classicTemplate(data);
    case 'jakes':   return jakesTemplate(data);
    case 'minimal': return minimalTemplate(data);
    default:        return jakesTemplate(data);
  }
}
