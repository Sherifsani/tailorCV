import { EntryItem, ResumeSection } from '../../types/resume';

// Convert **bold** markers → <strong>
export function bold(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

export function renderItem(item: EntryItem): string {
  switch (item.type) {
    case 'subheading':
      return `
        <div class="subheading">
          <div class="sh-row1">
            <span class="sh-org">${bold(item.org)}</span>
            <span class="sh-date">${bold(item.date)}</span>
          </div>
          ${(item.role || item.location) ? `
          <div class="sh-row2">
            <span class="sh-role">${bold(item.role)}</span>
            <span class="sh-location">${bold(item.location)}</span>
          </div>` : ''}
          ${item.bullets?.length ? `
          <ul class="bullets">
            ${item.bullets.map(b => `<li>${bold(b)}</li>`).join('')}
          </ul>` : ''}
        </div>`;

    case 'project':
      return `
        <div class="project">
          <div class="sh-row1">
            <span class="proj-name">${bold(item.name)}</span>
            <span class="proj-tech">${bold(item.tech)}</span>
          </div>
          ${item.bullets?.length ? `
          <ul class="bullets">
            ${item.bullets.map(b => `<li>${bold(b)}</li>`).join('')}
          </ul>` : ''}
        </div>`;

    case 'skills':
      return `
        <div class="skills-block">
          ${item.rows.map(r => `
            <div class="skills-row">
              <span class="skills-label">${r.label}:</span>
              <span class="skills-value">${r.value}</span>
            </div>`).join('')}
        </div>`;

    case 'bullets':
      return `
        <ul class="bullets">
          ${item.bullets.map(b => `<li>${bold(b)}</li>`).join('')}
        </ul>`;
  }
}

export function renderSection(section: ResumeSection): string {
  return `
    <div class="section">
      <div class="section-title">${section.title}</div>
      <div class="section-body">
        ${section.items.map(renderItem).join('')}
      </div>
    </div>`;
}
