function buildPrompt(resume, selfDescription, jobDescription) {
  return `
You are an expert technical recruiter and career coach...

You are an expert technical recruiter and career coach. Analyze the candidate's resume and self-description against the job description provided.

Your task is to return a SINGLE valid JSON object — no markdown, no explanation, no code fences. Just raw JSON.

The JSON must follow this exact schema:

{
  "title": "<job title extracted or inferred from the job description> - "title" is REQUIRED and must NOT be empty
- Extract the title from the job description (e.g., "Full Stack Developer")
- If not explicitly mentioned, infer a realistic job title",
  "matchScore": <integer 0–100 representing how well the candidate matches the job>,
  "technicalQuestions": [
    {
      "question": "<interview question tailored to the JD and candidate's background>",
      "intention": "<what this question is meant to evaluate>",
      "answer": "<ideal answer the interviewer expects>"
    }
    // Provide 8 to 10 technical questions
  ],
  "behavioralQuestions": [
    {
      "question": "<behavioral interview question>",
      "intention": "<what this question is meant to evaluate>",
      "answer": "<ideal answer>"
    }
    // Provide 7 to 9 behavioral questions
  ],
  "skillGaps": [
    {
      "skill": "<skill name missing or weak based on JD vs resume>",
      "severity": "<'low' | 'medium' | 'high'>"
    }
    // List all identified skill gaps
  ],
  "preparationPlan": [
    {
      "day": <day number starting from 1>,
      "focus": "<the main topic for the day>",
      "tasks": [
        "<specific actionable task>",
        "<specific actionable task>",
        "<specific actionable task>"
      ]
    }
    // Provide a 7-day plan
  ]
}

--- JOB DESCRIPTION ---
${jobDescription}

--- CANDIDATE SELF DESCRIPTION ---
${selfDescription}

--- CANDIDATE RESUME ---
${resume}

Return only the JSON object. Do not include any other text.
`.trim();
}

module.exports = { buildPrompt };