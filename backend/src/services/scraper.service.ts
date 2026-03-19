import axios, { AxiosError } from 'axios';
import * as cheerio from 'cheerio';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Cache-Control': 'no-cache',
};

export interface ScrapeResult {
  success: boolean;
  text: string;
  title?: string;
  company?: string;
  reason?: string;
}

export async function scrapeJobDescription(url: string): Promise<ScrapeResult> {
  const urlLower = url.toLowerCase();

  // LinkedIn blocks all server-side scrapers — fail fast with a clear message
  if (urlLower.includes('linkedin.com')) {
    return {
      success: false,
      text: '',
      reason: 'LinkedIn blocks scraping. Please copy the job description text and use "Paste Text" instead.',
    };
  }

  let html: string;
  try {
    const response = await axios.get(url, {
      headers: HEADERS,
      timeout: 15000,
      maxRedirects: 5,
    });
    html = response.data as string;
  } catch (err) {
    const axiosErr = err as AxiosError;
    const status = axiosErr.response?.status;
    console.error(`[scraper] fetch failed for ${url}:`, axiosErr.message);

    if (status === 403 || status === 429) {
      return { success: false, text: '', reason: 'This site blocked the request. Please paste the job description manually.' };
    }
    if (status === 404) {
      return { success: false, text: '', reason: 'Job posting not found (404). The listing may have been removed.' };
    }
    return { success: false, text: '', reason: `Could not reach the URL (${axiosErr.code ?? axiosErr.message}). Try pasting the text manually.` };
  }

  const $ = cheerio.load(html);
  $('script, style, nav, footer, header, [role="navigation"], .cookie-banner, #cookie-banner').remove();

  let text = '';
  let title: string | undefined;
  let company: string | undefined;

  if (urlLower.includes('indeed.com')) {
    text = $('#jobDescriptionText').text() || $('.jobsearch-jobDescriptionText').text();
    title = $('h1[data-testid="jobsearch-JobInfoHeader-title"]').text().trim() || undefined;
    company = $('[data-testid="inlineHeader-companyName"]').text().trim() || undefined;
  } else if (urlLower.includes('greenhouse.io') || urlLower.includes('boards.greenhouse.io')) {
    text = $('#content').text() || $('.job__description').text();
    title = $('h1.app-title').text().trim() || $('h1').first().text().trim() || undefined;
  } else if (urlLower.includes('lever.co')) {
    text = $('.section-wrapper').text() || $('.posting-description').text();
    title = $('h2').first().text().trim() || undefined;
    company = $('a.main-header-logo').attr('alt') || undefined;
  } else if (urlLower.includes('workday.com') || urlLower.includes('myworkdayjobs.com')) {
    text = $('[data-automation-id="jobPostingDescription"]').text() || $('[class*="job-description"]').text();
    title = $('[data-automation-id="jobPostingHeader"]').text().trim() || undefined;
  } else {
    // Generic fallback — try common job description containers then body
    text = (
      $('[class*="job-description"]').text() ||
      $('[class*="jobDescription"]').text() ||
      $('[id*="job-description"]').text() ||
      $('main').text() ||
      $('article').text() ||
      $('body').text()
    );
    title = $('h1').first().text().trim() || undefined;
  }

  text = text.replace(/\s+/g, ' ').trim();

  if (text.length < 100) {
    return {
      success: false,
      text: '',
      reason: 'Could not extract job description from this page. Please paste the text manually.',
    };
  }

  return {
    success: true,
    text: text.slice(0, 8000),
    title: title?.slice(0, 200),
    company: company?.slice(0, 200),
  };
}
