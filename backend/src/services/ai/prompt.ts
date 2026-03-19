export function buildPrompt(resumeText: string, jdText: string): string {
  const safeResume = resumeText.slice(0, 12000);
  const safeJD = jdText.slice(0, 8000);

  return `You are an expert resume coach and ATS optimization specialist.

Given the resume and job description below, respond with ONLY a raw JSON object (no markdown, no code fences, no explanation) matching this exact schema:

{
  "fitScore": <integer 0-100>,
  "strengths": ["<string>", ...],
  "gaps": ["<string>", ...],
  "tailoredResume": "<full resume text optimized for this job and ATS>",
  "coverLetter": "<professional 3-paragraph cover letter>",
  "reasoning": "<2-3 sentence explanation of the fit score>"
}

Rules:
- fitScore: 0-100 integer representing how well the candidate fits the role AFTER tailoring
- strengths: 3-5 specific matching points between the resume and JD
- gaps: 3-5 skills or experiences the JD requires that are missing or weak in the resume
- tailoredResume: rewrite the resume to maximize ATS keyword matching for this specific job, preserve all facts
- coverLetter: address the specific company and role, highlight top 3 matching strengths
- reasoning: explain the fit score briefly

RESUME:
---
${safeResume}
---

JOB DESCRIPTION:
---
${safeJD}
---`;
}
