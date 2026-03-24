const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema");
const puppeteer = require("puppeteer-core");
const { buildPrompt } = require("./builderprompt");
const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

// const interviewReportSchema = z.object({
//     matchScore: z.number().describe("A score between 0 and 100 indicating how well the candidate's profile matches the job describe"),
//     technicalQuestions: z.array(z.object({
//         question: z.string().describe("The technical question can be asked in the interview"),
//         intention: z.string().describe("The intention of interviewer behind asking this question"),
//         answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
//     })).describe("Technical questions that can be asked in the interview along with their intention and how to answer them"),
//     behavioralQuestions: z.array(z.object({
//         question: z.string().describe("The technical question can be asked in the interview"),
//         intention: z.string().describe("The intention of interviewer behind asking this question"),
//         answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
//     })).describe("Behavioral questions that can be asked in the interview along with their intention and how to answer them"),
//     skillGaps: z.array(z.object({
//         skill: z.string().describe("The skill which the candidate is lacking"),
//         severity: z.enum(["low", "medium", "high"]).describe("The severity of this skill gap, i.e. how important is this skill for the job and how much it can impact the candidate's chances")
//     })).describe("List of skill gaps in the candidate's profile along with their severity"),
//     preparationPlan: z.array(z.object({
//         day: z.number().describe("The day number in the preparation plan, starting from 1"),
//         focus: z.string().describe("The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc."),
//         tasks: z.array(z.string()).describe("List of tasks to be done on this day to follow the preparation plan, e.g. read a specific book or article, solve a set of problems, watch a video etc.")
//     })).describe("A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively"),
//     title: z.string().describe("The title of the job for which the interview report is generated"),
// })

// async function generateInterviewReport({
//   resume,
//   selfDescription,
//   jobDescription,
// }) {
//   const prompt = buildPrompt(resume, selfDescription, jobDescription);

//   const response = await ai.models.generateContent({
//     model: "gemini-2.5-flash",
//     contents: prompt,
//   });

//   return JSON.parse(response.text);
// }

async function generateInterviewReport({
  resume,
  selfDescription,
  jobDescription,
}) {
  const prompt = buildPrompt(resume, selfDescription, jobDescription);

  let data;

  for (let i = 0; i < 2; i++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      let raw = response.text.trim();
      raw = raw.replace(/```json\s*|\s*```/g, "").trim();

      data = JSON.parse(raw);

      if (data.technicalQuestions?.length) break;

    } catch (err) {
      if (i === 1) throw new Error("AI failed after retry");
    }
  }

  if (
    !data.technicalQuestions?.length ||
    !data.behavioralQuestions?.length ||
    !data.preparationPlan?.length
  ) {
    throw new Error("AI returned incomplete data");
  }

  return data;
}


async function generatePdfFromHtml(htmlContent) {
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
  });

  const page = await browser.newPage();

  await page.setContent(htmlContent, { waitUntil: "networkidle0" });
  await page.emulateMediaType("screen");

  const pdfBuffer = await page.pdf({
    format: "A4",
    margin: {
      top: "20mm",
      bottom: "20mm",
      left: "15mm",
      right: "15mm",
    },
  });

  await browser.close();

  return pdfBuffer;
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {
  const prompt = `
You are an expert resume writer with 15+ years of experience helping candidates land jobs at top tech companies like Google, Meta, and Amazon.

Your task is to generate a SINGLE JSON object:
{ "html": "<COMPLETE HTML RESUME>" }

========================
STRICT OUTPUT RULES
========================
- Output ONLY the JSON object — no markdown, no backticks, no explanation
- The "html" field must contain a COMPLETE HTML document (starting with <!DOCTYPE html>)
- All CSS must be inline or inside a <style> tag within <head>
- NO external stylesheets, NO Google Fonts CDN links, NO JavaScript
- Use only web-safe fonts: Arial, Georgia, 'Times New Roman', Helvetica

========================
PDF RENDERING RULES
========================
These rules ensure the HTML renders perfectly when converted to PDF via Puppeteer:
- Set page width to exactly 794px (A4 width at 96dpi)
- Use @page { margin: 0; } and body margin of 36px 48px
- Avoid flexbox for multi-column layouts — use CSS tables or floats instead
- Never use vh, vw units — use px, pt, or % only
- Avoid position: fixed or position: sticky
- Use page-break-inside: avoid on section blocks
- Font size: body 11px, headings 14–18px, subheadings 12px
- Line height: 1.4–1.6 for readability
- Total rendered height should not exceed 1123px per page (A4 height)

========================
DESIGN RULES
========================
- Clean, minimal, professional layout — NOT a creative/graphic resume
- Use ONE accent color (deep blue #1a3c5e or dark teal #0f4c5c) for:
  - Section headings underlines or left borders
  - Candidate name
  - Hyperlinks (if any)
- Everything else in black (#1a1a1a) or dark gray (#444)
- White background only
- Subtle dividers between sections (1px solid #e0e0e0)
- No icons, no profile photos, no colored backgrounds on sections
- Consistent spacing: 12px between sections, 6px between items

========================
RESUME STRUCTURE (in this exact order)
========================
1. HEADER
   - Full name (large, bold, accent color)
   - Job title being applied for (smaller, gray)
   - Contact line: email | phone | LinkedIn | GitHub | location (all on one line)

2. PROFESSIONAL SUMMARY (3–4 lines)
   - Tailored specifically to the job description
   - Written in first-person-implied tone (no "I")
   - Highlight years of experience, core strengths, and one key achievement

3. SKILLS
   - Grouped by category (e.g. Languages, Frameworks, Tools, Cloud)
   - Display as inline tags or comma-separated — NOT bullet points
   - Only include skills relevant to the job description

4. WORK EXPERIENCE (reverse chronological)
   - Company | Role | Duration | Location (remote/onsite)
   - 3–5 bullet points per role
   - Each bullet: starts with a strong action verb, includes a metric or outcome
   - Example: "Reduced API response time by 40% by implementing Redis caching"
   - Tailor bullets to match keywords in the job description

5. PROJECTS (if relevant)
   - Project name | Tech stack used
   - 2–3 lines: what it does, your role, measurable impact

6. EDUCATION
   - Degree | Institution | Year | GPA (only if above 3.5/8.5+)

7. CERTIFICATIONS (if any found in resume)
   - Name | Issuer | Year

========================
WRITING TONE RULES
========================
- Sound like a real human wrote this — confident, specific, not generic
- AVOID AI-sounding phrases like:
  "Leveraged cutting-edge technologies"
  "Passionate about innovation"  
  "Proven track record of success"
  "Results-driven professional"
- USE specific, concrete language:
  "Built and deployed...", "Cut load time from 4s to 800ms", "Led a team of 5 engineers"
- Match the seniority level implied by the resume (junior/mid/senior)

========================
ATS OPTIMIZATION RULES
========================
- Include exact keywords from the job description naturally in the content
- Use standard section heading names: "Work Experience" not "My Journey"
- No tables for main content (ATS cannot parse table cells reliably)
- No text inside images or SVGs
- All text must be selectable plain HTML text
- Avoid headers/footers for critical info — ATS often skips them

========================
LENGTH RULES
========================
- Target 1 page for <3 years experience, 2 pages for 3+ years
- Cut older than 8–10 years of experience unless highly relevant
- Remove filler — every line must add value
- If content would overflow 2 pages, prioritize: Summary > Skills > Recent Experience > Projects > Education

========================
INPUT DATA
========================
Resume (existing content to rewrite and enhance):
${resume}

Self Description (candidate's own words about themselves):
${selfDescription}

Job Description (target role to tailor resume for):
${jobDescription}

========================
FINAL CHECKLIST BEFORE OUTPUT
========================
- [ ] Output is ONLY a JSON object, nothing else
- [ ] HTML is complete and valid
- [ ] All CSS is inline or in <style> tag
- [ ] No external resources
- [ ] Resume is tailored to the job description
- [ ] No AI-sounding filler phrases
- [ ] ATS-friendly structure
- [ ] Fits within 1–2 PDF pages

OUTPUT NOW.
`;

  let html;

  for (let i = 0; i < 2; i++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      let raw = response.text.trim();
      raw = raw.replace(/```json\s*|\s*```/g, "").trim();

      const data = JSON.parse(raw);

      if (data.html && data.html.includes("<html")) {
        html = data.html;
        break;
      }

    } catch (err) {
      if (i === 1) throw new Error("AI failed to generate resume HTML");
    }
  }

  if (!html) {
    throw new Error("Invalid HTML from AI");
  }

  const pdfBuffer = await generatePdfFromHtml(html);

  return pdfBuffer;
}


module.exports = {generateInterviewReport,generateResumePdf };
