import io
import json
import re
from typing import List, Dict, Any

from PyPDF2 import PdfReader
from docx import Document
from google import genai

# ──────────────────────────────────────────────
# Gemini client (new google-genai SDK)
# ──────────────────────────────────────────────
GEMINI_API_KEY = "AIzaSyBuA_30rs02oKHWE9UlZsIizuJM_oW68U4"
_client = None

def get_client():
    global _client
    if _client is None:
        _client = genai.Client(api_key=GEMINI_API_KEY)
    return _client

MODEL = "gemini-2.0-flash"

# ──────────────────────────────────────────────
# File Extraction
# ──────────────────────────────────────────────
def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract text from PDF bytes. Tries multiple strategies."""
    text = ""

    # Strategy: PyPDF2
    try:
        reader = PdfReader(io.BytesIO(file_bytes))
        for page in reader.pages:
            try:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
            except Exception:
                pass
    except Exception as e:
        raise ValueError(f"Failed to open PDF: {e}")

    # If no text was extracted (scanned/image PDF)
    if not text.strip():
        raise ValueError(
            "Could not extract text from this PDF. "
            "The file may be image-based or scanned. "
            "Please upload a PDF with selectable text, or a DOCX file."
        )

    return text.strip()


def extract_text_from_docx(file_bytes: bytes) -> str:
    try:
        doc = Document(io.BytesIO(file_bytes))
        paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
        # Also get text from tables
        for table in doc.tables:
            for row in table.rows:
                for cell in row.cells:
                    if cell.text.strip():
                        paragraphs.append(cell.text.strip())
        return "\n".join(paragraphs).strip()
    except Exception as e:
        raise ValueError(f"Failed to read DOCX: {str(e)}")

# ──────────────────────────────────────────────
# Helper: clean Gemini JSON responses
# ──────────────────────────────────────────────
def _clean_json(text: str) -> str:
    text = text.strip()
    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    return text.strip()

# ──────────────────────────────────────────────
# Resume Analyzer — Deep Error Audit
# ──────────────────────────────────────────────
def analyze_resume_with_gemini(resume_text: str) -> Dict[str, Any]:
    """
    Performs a deep error audit of the resume. Returns:
    - score (0-100) overall ATS score
    - grade (A/B/C/D/F)
    - score_breakdown: {formatting, skills, experience, education}
    - errors: list of {category, severity, message} objects
    - improvements_needed: list of actionable strings
    - skills_found: list of skill strings
    - experience: estimated years
    - reasoning: 2-3 sentence summary
    """
    if not resume_text or len(resume_text.strip()) < 50:
        return _default_error_response(
            "Resume text is too short or could not be extracted. "
            "Please ensure the file is not image-based or password-protected."
        )

    prompt = f"""You are an elite ATS (Applicant Tracking System) expert, senior recruiter at a top-tier tech company, and career strategist with 20+ years of experience.

Carefully READ the following resume text line by line and perform a RIGOROUS, EVIDENCE-BASED AUDIT. Every finding in your audit MUST quote or reference ACTUAL text from the resume — never make generic statements.

AUDIT DIMENSIONS:
1. **Contact & Identity**: Is full name, email, phone, LinkedIn, location present?
2. **Professional Summary/Objective**: Is there a compelling, keyword-rich summary?
3. **Work Experience Quality**: Are bullets action-verb-first? Do they include measurable results (%, $, numbers)?
4. **Skills Section**: Are skills relevant to the candidate's apparent target role? Are they current technologies?
5. **Education**: Is the degree, institution, year clearly stated?
6. **ATS Keyword Density**: Does the resume contain keywords a recruiter's ATS would search for given the role?
7. **Overall Length & Formatting**: Is it appropriately sized (1-2 pages)? Are sections clearly labeled?

SCORING (Strict 0-100 — be honest, most resumes score 40-75):
- **Formatting & Readability (0-20)**: Contact info, clear section headers, consistent formatting
- **Skill Alignment (0-30)**: Technical and soft skills relevant to their field  
- **Impact & Metrics (0-30)**: CRITICAL — quantified achievements, strong action verbs
- **Education & Credentials (0-20)**: Degree relevance, GPA if strong, certifications

GRADE SCALE: A (90-100), B (75-89), C (55-74), D (40-54), F (0-39)

ERROR TYPES — identify ALL that apply with SPECIFIC QUOTES from the resume:
- "missing_section": Missing Contact, Summary, Skills, Experience, or Education
- "weak_language": Passive/weak verbs — quote the ACTUAL weak phrase found
- "no_metrics": Bullets with no numbers/results — quote the ACTUAL bullet
- "formatting": Inconsistent dates, poor structure — be specific
- "grammar": Quote the actual grammatical error found
- "contact_info": Missing LinkedIn URL, GitHub, phone, etc.
- "too_short": If overall content is sparse for the role
- "cliches": Quote the actual cliché phrase found

Return a JSON object with EXACTLY these keys (no other text, no markdown wrapper):
{{
  "score": <integer 0-100>,
  "grade": "<A|B|C|D|F>",
  "score_breakdown": {{
    "formatting": <integer 0-20>,
    "skills": <integer 0-30>,
    "experience": <integer 0-30>,
    "education": <integer 0-20>
  }},
  "reasoning": "<2-3 sentences — blunt assessment referencing ACTUAL content from this specific resume>",
  "errors": [
    {{
      "category": "<type>",
      "severity": "<high|medium|low>",
      "message": "<Specific finding with QUOTE from resume and explanation of impact on ATS/recruiter>"
    }}
  ],
  "improvements_needed": [
    "<Specific, actionable improvement referencing actual resume content — not generic advice>",
    "<Second specific improvement>",
    "<Third specific improvement>"
  ],
  "skills_found": ["<every technical and soft skill explicitly mentioned in the resume>"],
  "experience": <total years of work experience as integer — estimate from dates>
}}

Resume Text to Analyze:
---
{resume_text[:14000]}
---
Return ONLY the JSON object. No explanation, no markdown."""
    try:
        client = get_client()
        response = client.models.generate_content(
            model=MODEL,
            contents=prompt
        )
        data = json.loads(_clean_json(response.text))
        # Validate required keys
        required_keys = ["score", "grade", "score_breakdown", "errors", "improvements_needed", "skills_found"]
        for key in required_keys:
            if key not in data:
                raise ValueError(f"Missing key in Gemini response: {key}")
        # Ensure experience is an int
        if "experience" not in data:
            data["experience"] = 0
        if not isinstance(data["experience"], int):
            try:
                data["experience"] = int(data["experience"])
            except Exception:
                data["experience"] = 0
        return data
    except Exception as e:
        print(f"[Gemini Resume Error] {e}")
        return _fallback_analysis(resume_text)


def _fallback_analysis(resume_text: str) -> Dict[str, Any]:
    """Local NLP fallback when Gemini is unavailable."""
    text_lower = resume_text.lower()
    word_count = len(resume_text.split())

    errors = []
    score = 60

    has_contact = bool(re.search(r'[\w.+-]+@[\w-]+\.\w+', resume_text))
    has_phone = bool(re.search(r'\+?\d[\d\s\-().]{7,}', resume_text))
    has_summary = any(kw in text_lower for kw in ['summary', 'objective', 'profile', 'about'])
    has_skills = 'skills' in text_lower
    has_education = any(kw in text_lower for kw in ['education', 'university', 'college', 'degree', 'bachelor', 'master'])
    has_experience = any(kw in text_lower for kw in ['experience', 'work', 'employment', 'position'])
    has_metrics = bool(re.search(r'\d+%|\$\d+|\d+\+\s*(years|clients|users|projects)', resume_text, re.IGNORECASE))
    weak_verbs = ['responsible for', 'helped', 'assisted', 'worked on', 'was part of', 'contributed to']
    found_weak = [v for v in weak_verbs if v in text_lower]

    if not has_contact:
        errors.append({"category": "contact_info", "severity": "high", "message": "No email address detected in the resume."})
        score -= 10
    if not has_phone:
        errors.append({"category": "contact_info", "severity": "medium", "message": "No phone number detected."})
        score -= 5
    if not has_summary:
        errors.append({"category": "missing_section", "severity": "high", "message": "No Professional Summary or Objective section found."})
        score -= 8
    if not has_skills:
        errors.append({"category": "missing_section", "severity": "high", "message": "No dedicated Skills section found."})
        score -= 8
    if not has_education:
        errors.append({"category": "missing_section", "severity": "medium", "message": "Education section is missing or not clearly labeled."})
        score -= 5
    if not has_experience:
        errors.append({"category": "missing_section", "severity": "high", "message": "Work Experience section is missing or not clearly labeled."})
        score -= 10
    if not has_metrics:
        errors.append({"category": "no_metrics", "severity": "high", "message": "No quantifiable achievements found (e.g., 'increased sales by 30%', 'managed 5-person team')."})
        score -= 8
    if found_weak:
        errors.append({"category": "weak_language", "severity": "medium", "message": f"Weak language detected: '{found_weak[0]}'. Replace with strong action verbs."})
        score -= 5
    if word_count < 250:
        errors.append({"category": "too_short", "severity": "high", "message": f"Resume is only ~{word_count} words — too brief for a competitive application. Aim for 400-600 words."})
        score -= 10

    score = max(30, min(score, 90))
    skills = _extract_skills_simple(resume_text)
    exp_match = re.search(r'(\d+)\+?\s*(years|yrs)', resume_text, re.IGNORECASE)

    fmt = 15 if (has_contact and has_summary) else 8
    sk = min(30, len(skills) * 3)
    ex = 20 if has_metrics else 12
    edu = 15 if has_education else 5

    grade_score = fmt + sk + ex + edu
    if grade_score >= 90: grade = "A"
    elif grade_score >= 75: grade = "B"
    elif grade_score >= 55: grade = "C"
    elif grade_score >= 40: grade = "D"
    else: grade = "F"

    return {
        "score": score,
        "grade": grade,
        "score_breakdown": {"formatting": fmt, "skills": sk, "experience": ex, "education": edu},
        "reasoning": "Automated analysis applied (AI quota exceeded). Resume has been evaluated using local NLP heuristics. Review the errors below for specific improvements.",
        "errors": errors,
        "improvements_needed": [
            "Add quantifiable achievements with numbers and percentages to every experience bullet.",
            "Include a strong professional summary at the top of the resume.",
            "Ensure all standard sections (Contact, Summary, Skills, Experience, Education) are clearly labeled.",
        ],
        "skills_found": skills[:10],
        "experience": int(exp_match.group(1)) if exp_match else 1
    }


def _default_error_response(reason: str) -> Dict[str, Any]:
    return {
        "score": 0,
        "grade": "F",
        "score_breakdown": {"formatting": 0, "skills": 0, "experience": 0, "education": 0},
        "reasoning": reason,
        "errors": [{"category": "missing_section", "severity": "high", "message": reason}],
        "improvements_needed": ["Upload a clear PDF or Word document with selectable text."],
        "skills_found": [],
        "experience": 0
    }

# ──────────────────────────────────────────────
# Job Description Analyzer
# ──────────────────────────────────────────────
def analyze_jd_with_gemini(jd_text: str) -> Dict[str, Any]:
    prompt = f"""You are a senior technical recruiter and career coach.

Carefully READ the following job description and extract:
1. The EXACT job title and company (if mentioned)
2. The PRIMARY required skills and technologies specifically named in this JD
3. The experience level (junior/mid/senior) based on years and responsibilities described
4. What a strong candidate profile would look like for THIS SPECIFIC role

Based on what you extract, return a JSON object tailored SPECIFICALLY to this job description.
Do NOT give generic advice — every suggestion must reference what the JD actually says.

{{
  "role_title": "<extracted job title from the JD>",
  "key_skills_required": ["<skill mentioned in JD>", "<skill mentioned in JD>", "..."],
  "experience_level": "<Junior|Mid-Level|Senior|Lead based on JD>",
  "suggestions": [
    "<Actionable improvement specific to THIS role — e.g., if JD requires Kubernetes, say 'Add Kubernetes experience to your resume'",
    "..."
  ],
  "how_to_start": [
    "<Step 1 — specific to THIS job's requirements>",
    "<Step 2>",
    "<Step 3>",
    "<Step 4>"
  ],
  "skills_to_learn": ["<skill from JD you might be missing>", "..."],
  "certifications": [
    {{"name": "<certification that directly aligns with THIS JD's tech stack>", "url": "<real Coursera/AWS/Google URL>"}},
    {{"name": "<second relevant cert>", "url": "<real URL>"}}
  ],
  "similar_jobs": [
    {{"title": "<job title based on THIS JD role>", "company": "Various", "url": "https://www.linkedin.com/jobs/search/?keywords=<URL encoded title>&location=India"}},
    {{"title": "<Naukri search for similar role>", "company": "Various", "url": "https://www.naukri.com/<relevant-slug>-jobs"}},
    {{"title": "<related role>", "company": "Various", "url": "https://www.linkedin.com/jobs/search/?keywords=<related URL encoded title>"}}
  ]
}}

Rules:
- Read the JD carefully and base ALL output on what it ACTUALLY says
- suggestions must reference actual technologies/skills FROM this JD  
- certifications must match the tech stack in the JD (e.g., if JD says AWS → AWS cert)
- similar_jobs must use the actual job title from the JD in the search URL
- Return ONLY the JSON object. No markdown, no extra text.

Job Description:
---
{jd_text[:6000]}
---
Return ONLY the JSON object."""
    try:
        client = get_client()
        response = client.models.generate_content(model=MODEL, contents=prompt)
        data = json.loads(_clean_json(response.text))
        return data
    except Exception as e:
        print(f"[Gemini JD Error] {e}")
        return {
            "suggestions": [
                "Tailor your resume summary to match the exact role.",
                "Highlight projects that demonstrate skills mentioned in the JD.",
                "Quantify your past impact with numbers and percentages.",
            ],
            "how_to_start": [
                "Identify the 5 core skills required in this JD.",
                "Build a small demo project using those skills.",
                "Add the project to GitHub and link it in your resume.",
                "Apply to at least 5 similar roles on LinkedIn immediately.",
            ],
            "certifications": [
                {"name": "Google IT Support Certificate", "url": "https://www.coursera.org/professional-certificates/google-it-support"},
                {"name": "AWS Cloud Practitioner Essentials", "url": "https://aws.amazon.com/training/learn-about/cloud-practitioner/"},
            ],
            "similar_jobs": [
                {"title": "Software Engineer Intern", "company": "Various", "url": "https://www.linkedin.com/jobs/search/?keywords=Software+Engineer+Intern&location=India"},
                {"title": "Full Stack Developer", "company": "Various", "url": "https://www.linkedin.com/jobs/search/?keywords=Full+Stack+Developer&location=India"},
                {"title": "Backend Developer", "company": "Various", "url": "https://www.linkedin.com/jobs/search/?keywords=Backend+Developer&location=India"},
            ]
        }

# ──────────────────────────────────────────────
# Simple skills extractor (fallback, no spaCy)
# ──────────────────────────────────────────────
def _extract_skills_simple(text: str) -> List[str]:
    common_skills = [
        'Python', 'Java', 'JavaScript', 'TypeScript', 'React', 'Node.js',
        'HTML', 'CSS', 'SQL', 'NoSQL', 'MongoDB', 'PostgreSQL',
        'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Git',
        'FastAPI', 'Flask', 'Django', 'Spring Boot',
        'Machine Learning', 'Deep Learning', 'NLP', 'TensorFlow', 'PyTorch',
        'Figma', 'UI/UX', 'Tailwind CSS', 'GraphQL', 'REST API', 'C++', 'C#',
        'Next.js', 'Vue.js', 'Angular', 'Redis', 'Elasticsearch', 'Kafka',
        'Linux', 'Bash', 'PowerShell', 'Terraform', 'CI/CD', 'Jenkins',
    ]
    text_lower = text.lower()
    return [s for s in common_skills if s.lower() in text_lower]

# ──────────────────────────────────────────────
# Builder AI Features
# ──────────────────────────────────────────────
def refine_summary_with_gemini(summary_text: str) -> str:
    if not summary_text or len(summary_text.strip()) < 5:
        return "Please provide a brief summary to refine."

    prompt = f"""You are a world-class career coach and professional resume writer with 20+ years experience at top companies.

Task: Rewrite the professional summary below to make it polished, powerful, ATS-optimized, and impactful for recruiters.

RULES:
1. Fix ALL spelling and grammar mistakes.
2. Start with a strong action/descriptor word or professional title.
3. Use active voice and strong power verbs throughout.
4. Make it 3-5 sentences — detailed and compelling, not vague.
5. Keep ALL facts, numbers, technologies, and specifics from the original — do NOT invent anything new.
6. Make it sound like it was written by a senior professional.
7. Return ONLY the rewritten summary as plain text. No quotes, no markdown, no labels, no explanations.

Original summary to rewrite:
{summary_text}

Rewritten professional summary:"""
    try:
        client = get_client()
        response = client.models.generate_content(
            model=MODEL,
            contents=prompt
        )
        result = response.text.strip()
        # Clean up any accidental quotes or labels
        if result.startswith('"') and result.endswith('"'):
            result = result[1:-1]
        if result.lower().startswith("rewritten"):
            result = result.split("\n", 1)[-1].strip()
        print(f"[Refine Summary] Input: {summary_text[:80]}... | Output: {result[:80]}...")
        return result
    except Exception as e:
        print(f"[Gemini Refine Error] {type(e).__name__}: {e}")
        return summary_text

def improve_text_with_gemini(text: str, context: str) -> str:
    if not text or len(text.strip()) < 3:
        return text

    prompt = f"""You are an expert resume writer and career coach at a top recruitment firm.

Task: Improve this resume {context} to be highly impactful, professional, and ATS-optimized.

RULES:
1. Start with a strong action verb (Led, Built, Developed, Engineered, Optimized, etc.)
2. Add measurable impact wherever possible (e.g. 'reduced load time by 40%' instead of 'improved performance')
3. Use industry-standard professional terminology for the apparent field
4. Keep the EXACT same meaning and any numbers/metrics from the original
5. Make it 1 powerful sentence (for bullet points) or improve the text naturally
6. Return ONLY the improved text. No quotes, no labels, no explanation.

Original text:
{text}

Improved version:"""
    try:
        client = get_client()
        response = client.models.generate_content(model=MODEL, contents=prompt)
        result = response.text.strip().strip('"').strip()
        # Remove any accidental labels
        if result.lower().startswith("improved"):
            result = result.split("\n", 1)[-1].strip()
        print(f"[Improve Text] Input: {text[:60]}... | Output: {result[:60]}...")
        return result
    except Exception as e:
        print(f"[Gemini Improve Error] {type(e).__name__}: {e}")
        return text

def generate_resume_suggestions_with_gemini(resume_data: dict) -> List[str]:
    # Remove non-essential keys before sending
    clean_data = {k: v for k, v in resume_data.items() if k not in ('skillInput', 'photo')}
    
    prompt = f"""You are an expert career coach reviewing a user's resume in progress.
Analyze the provided JSON representation of the resume and provide exactly 3-4 specific, actionable suggestions for improvement.
Focus on missing sections, brevity, lack of metrics in experience, or missing skills for their stated title.
Return ONLY a JSON array of strings. Do not use markdown blocks, just the raw array like ["suggestion 1", "suggestion 2"].

Resume Data:
{json.dumps(clean_data, indent=2)[:5000]}
"""
    try:
        client = get_client()
        response = client.models.generate_content(model=MODEL, contents=prompt)
        text = _clean_json(response.text)
        result = json.loads(text)
        if isinstance(result, list):
            return result
        raise ValueError("Response is not a list")
    except Exception as e:
        print(f"[Gemini Suggestions Error] {e}")
        return [
            "Consider quantifying your achievements with numbers or percentages.",
            "Make sure your skills list matches the keywords in your target job descriptions.",
            "A strong professional summary can greatly improve your chances.",
            "Add certifications or online courses to strengthen your profile."
        ]


# ──────────────────────────────────────────────
# Job Suggestion AI Feature
# ──────────────────────────────────────────────
def generate_job_suggestions_with_gemini(profile_data: dict) -> List[Dict[str, Any]]:
    """Generate personalized job suggestions based on scanned resume skills or user profile."""
    skills = profile_data.get("skills", [])
    title = profile_data.get("title", "")
    summary = profile_data.get("summary", "")
    # Also accept scanned_skills from resume scanner
    scanned_skills = profile_data.get("scanned_skills", [])
    if scanned_skills:
        skills = scanned_skills
    
    if not skills and not title and not summary:
        return _default_job_suggestions()

    skills_str = ', '.join(skills[:25]) if skills else 'Not specified'

    prompt = f"""You are an expert career advisor and job market analyst with deep knowledge of the Indian and global tech job market.

Based on this candidate's skills from their resume, generate 6 highly relevant job opportunities tailored to their exact skill set.

Candidate Skills from Resume: {skills_str}
Target Title/Role: {title if title else 'Not specified'}

Return a JSON array of exactly 6 job objects. For EACH job use EXACTLY these keys:
[
  {{
    "id": <number 1-6>,
    "title": "<specific job title matching their skills>",
    "company": "<realistic tech company name or 'Various Companies'>",
    "location": "<City, India or Remote>",
    "type": "<Full-time|Part-time|Contract|Internship>",
    "salary": "<realistic Indian salary range like '8-15 LPA' or 'Competitive'>",
    "tags": ["<one of their actual skills>", "<another skill>", "<third skill>"],
    "linkedinUrl": "https://www.linkedin.com/jobs/search/?keywords=<URL+encoded+job+title>&location=India",
    "naukriUrl": "https://www.naukri.com/<hyphenated-job-title>-jobs"
  }}
]

Rules:
- Make titles HIGHLY SPECIFIC to their skill set (e.g., if they have React + Node.js → 'Full Stack React/Node.js Developer')
- Tags must be from their ACTUAL skills list above
- Use REAL LinkedIn search URL format with proper URL encoding
- Use REAL Naukri URL format (e.g., for 'React Developer' → 'https://www.naukri.com/react-developer-jobs')
- Return ONLY the JSON array. No extra text, no markdown.
"""
    try:
        client = get_client()
        response = client.models.generate_content(model=MODEL, contents=prompt)
        data = json.loads(_clean_json(response.text))
        if isinstance(data, list) and len(data) > 0:
            return data
        raise ValueError("Invalid response format")
    except Exception as e:
        print(f"[Gemini Job Suggestions Error] {e}")
        return _default_job_suggestions(skills, title)



def _default_job_suggestions(skills=None, title="") -> List[Dict[str, Any]]:
    """Fallback job suggestions."""
    skill_tag = skills[0] if skills else "Software"
    return [
        {
            "id": 1,
            "title": f"{skill_tag} Developer",
            "company": "TechCorp Solutions",
            "location": "Remote",
            "type": "Full-time",
            "salary": "$80k - $120k",
            "match": 85,
            "tags": skills[:3] if skills else ["JavaScript", "React", "Node.js"],
            "searchUrl": f"https://www.linkedin.com/jobs/search/?keywords={'+'.join((skill_tag + ' Developer').split())}&location=Remote"
        },
        {
            "id": 2,
            "title": "Full Stack Engineer",
            "company": "Innovation Labs",
            "location": "San Francisco, CA",
            "type": "Full-time",
            "salary": "$100k - $140k",
            "match": 78,
            "tags": skills[:3] if skills else ["Python", "React", "AWS"],
            "searchUrl": "https://www.linkedin.com/jobs/search/?keywords=Full+Stack+Engineer"
        },
        {
            "id": 3,
            "title": "Software Engineer Intern",
            "company": "Various",
            "location": "Remote",
            "type": "Internship",
            "salary": "Competitive Stipend",
            "match": 72,
            "tags": ["Problem Solving", "Teamwork", "Learning"],
            "searchUrl": "https://www.linkedin.com/jobs/search/?keywords=Software+Engineer+Internship"
        },
        {
            "id": 4,
            "title": "Junior Developer",
            "company": "StartupX",
            "location": "Hybrid",
            "type": "Full-time",
            "salary": "$60k - $85k",
            "match": 68,
            "tags": skills[:2] if skills else ["JavaScript", "Git"],
            "searchUrl": "https://www.linkedin.com/jobs/search/?keywords=Junior+Developer"
        }
    ]
