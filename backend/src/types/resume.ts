// Mirrors Jake's LaTeX macros exactly

export interface SubheadingItem {
  type: 'subheading';
  org: string;       // \textbf{#1} — bold left,  e.g. "Tech Company"
  date: string;      // \textbf{\small #2} — bold right, e.g. "May 2024 – Sep 2024"
  role: string;      // \textit{\small #3} — italic left, e.g. "ML Engineer Intern"
  location: string;  // \textit{\small #4} — italic right, e.g. "New York, NY"
  bullets: string[]; // \resumeItem — use **text** for bold within bullets
}

export interface ProjectItem {
  type: 'project';
  name: string;      // \textbf{Project Name} left
  tech: string;      // right side — tech stack or date range
  bullets: string[];
}

export interface SkillsItem {
  type: 'skills';
  rows: { label: string; value: string }[]; // \textbf{label}: value
}

export interface BulletsItem {
  type: 'bullets';
  bullets: string[];
}

export type EntryItem = SubheadingItem | ProjectItem | SkillsItem | BulletsItem;

export interface ResumeSection {
  title: string;    // \section{} — ALL CAPS
  items: EntryItem[];
}

export interface ResumeData {
  name: string;
  contact: string[]; // each element is one contact item
  sections: ResumeSection[];
}
