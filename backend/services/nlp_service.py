import io
import json
import re
import os
import logging
import itertools
from typing import List, Dict, Any

from PyPDF2 import PdfReader
from docx import Document
from google import genai
from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# SpaCy loader removed as it is not utilized in business logic.

# ── Dual Gemini API Key Pool with fallback ──────────────────────────────────
load_dotenv()

_API_KEYS = [
    k for k in [
        os.environ.get("GEMINI_API_KEY", "AIzaSyA4NgqknyOhY2cOleKfYXGDW_ScZFE5nyM"),
        os.environ.get("GEMINI_API_KEY_2", "AIzaSyBx8fGTiEZ2CQfqbZJeGOEISeCHHtJ9BBQ"),
    ] if k
]

_suspended_keys: set = set()
_key_cycle = itertools.cycle(_API_KEYS)
_clients: Dict[str, Any] = {}

PRIMARY_MODEL = "gemini-2.5-flash"
FALLBACK_MODEL = "gemini-2.0-flash"
MODEL = PRIMARY_MODEL


def _get_active_keys():
    return [k for k in _API_KEYS if k not in _suspended_keys]


def get_client() -> Any:
    """Returns a Gemini client, skipping suspended keys."""
    active = _get_active_keys()
    if not active:
        # All keys suspended — try anyway with last known key
        active = _API_KEYS
    key = active[hash(str(os.getpid())) % len(active)]
    if key not in _clients:
        _clients[key] = genai.Client(api_key=key)
        logger.info(f"Gemini client initialised with key ending ...{key[-6:]}")
    return _clients[key]


def _call_gemini(prompt: str) -> str:
    """Call Gemini with automatic key/model fallback on errors."""
    import time
    errors = []
    models_to_try = [PRIMARY_MODEL, FALLBACK_MODEL, "gemini-2.0-flash-lite"]
    keys_to_try = _get_active_keys() or _API_KEYS

    for model in models_to_try:
        for key in keys_to_try:
            if key in _suspended_keys:
                continue
            try:
                if key not in _clients:
                    _clients[key] = genai.Client(api_key=key)
                client = _clients[key]
                resp = client.models.generate_content(model=model, contents=prompt)
                return resp.text
            except Exception as e:
                err_str = str(e)
                if 'PERMISSION_DENIED' in err_str or 'CONSUMER_SUSPENDED' in err_str:
                    logger.warning(f"Key ...{key[-6:]} is suspended — marking as inactive.")
                    _suspended_keys.add(key)
                elif '429' in err_str or 'RESOURCE_EXHAUSTED' in err_str:
                    logger.warning(f"Key ...{key[-6:]} quota exceeded for {model}, trying next.")
                    # Wait briefly and try fallback model
                    time.sleep(1)
                else:
                    logger.error(f"Gemini error (key ...{key[-6:]}, model {model}): {e}")
                errors.append(str(e))

    raise RuntimeError(f"All Gemini API keys/models failed: {errors}")

# ── File Extraction ──────────────────────────────────────────────────────────
def extract_text_from_pdf(file_bytes: bytes) -> str:
    text = ""
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
        logger.warning(f"PyPDF2 failed: {e}, trying pypdf fallback...")
        # Try pypdf as fallback
        try:
            import pypdf
            reader2 = pypdf.PdfReader(io.BytesIO(file_bytes))
            for page in reader2.pages:
                try:
                    extracted = page.extract_text()
                    if extracted:
                        text += extracted + "\n"
                except Exception:
                    pass
        except ImportError:
            pass
        except Exception as e2:
            raise ValueError(f"Failed to open PDF: {e2}")

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
        for table in doc.tables:
            for row in table.rows:
                for cell in row.cells:
                    if cell.text.strip():
                        paragraphs.append(cell.text.strip())
        return "\n".join(paragraphs).strip()
    except Exception as e:
        raise ValueError(f"Failed to read DOCX: {str(e)}")


def _clean_json(text: str) -> str:
    text = text.strip()
    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    return text.strip()


# ── Resume Analyzer ──────────────────────────────────────────────────────────
def analyze_resume_with_gemini(resume_text: str) -> Dict[str, Any]:
    if not resume_text or len(resume_text.strip()) < 50:
        return _default_error_response("Resume text is too short or could not be extracted.")

    prompt = f"""You are an elite ATS expert and senior technical recruiter with 20+ years of experience at FAANG companies.

TASK: Perform a brutally honest, evidence-based audit of the resume below. Every single finding MUST directly quote or reference actual text from the resume — never make assumptions or generic statements.

RESUME TEXT:
---
{resume_text[:14000]}
---

AUDIT DIMENSIONS (check each one rigorously):
1. Contact & Identity: Full name, email, phone, LinkedIn URL, GitHub, location — quote what's missing
2. Professional Summary: Is there one? Does it have keywords? Quote it or note its absence
3. Work Experience Quality: Are bullets action-verb-first? Do they have numbers/metrics? Quote weak bullets
4. Skills Section: Are skills listed? Are they relevant to the apparent target role? List what you find
5. Education: Degree, institution, year — quote what's present or missing
6. ATS Keyword Density: Are industry-relevant keywords present? Name them
7. Length & Formatting: Appropriate for experience level?

SCORING (be strict — most resumes score 40-75, not 85+):
- Formatting & Readability (0-20): Contact completeness, section headers, consistency
- Skill Alignment (0-30): Relevance and depth of skills to apparent target role
- Impact & Metrics (0-30): Quantified achievements, strong action verbs (most people lose points here)
- Education & Credentials (0-20): Degree relevance, GPA if present, certifications

GRADE: A=90-100, B=75-89, C=55-74, D=40-54, F=0-39

Return ONLY this JSON (no markdown, no explanation):
{{
  "score": <integer 0-100>,
  "grade": "<A|B|C|D|F>",
  "score_breakdown": {{
    "formatting": <0-20>,
    "skills": <0-30>,
    "experience": <0-30>,
    "education": <0-20>
  }},
  "reasoning": "<2-3 blunt sentences referencing ACTUAL content — name the candidate's actual job titles, companies, or skills you found>",
  "errors": [
    {{
      "category": "<missing_section|weak_language|no_metrics|formatting|grammar|contact_info|too_short|cliches>",
      "severity": "<high|medium|low>",
      "message": "<Quote the specific text or absence — e.g., 'Bullet reads: responsible for managing team — replace with Led a team of X engineers to achieve Y result'>"
    }}
  ],
  "improvements_needed": [
    "<Actionable improvement with a before/after example where possible>",
    "<Second improvement>",
    "<Third improvement>"
  ],
  "skills_found": ["<every technical/soft skill explicitly mentioned in the resume>"],
  "experience": <total estimated years of work experience as integer>
}}"""

    try:
        raw = _call_gemini(prompt)
        data = json.loads(_clean_json(raw))
        required = ["score", "grade", "score_breakdown", "errors", "improvements_needed", "skills_found"]
        for key in required:
            if key not in data:
                raise ValueError(f"Missing key: {key}")
        data["experience"] = int(data.get("experience", 0) or 0)
        return data
    except Exception as e:
        logger.error(f"[Resume Analyzer] {e}")
        return _fallback_analysis(resume_text)


def _default_error_response(reason: str) -> Dict[str, Any]:
    return {
        "score": 0, "grade": "F",
        "score_breakdown": {"formatting": 0, "skills": 0, "experience": 0, "education": 0},
        "reasoning": reason,
        "errors": [{"category": "missing_section", "severity": "high", "message": reason}],
        "improvements_needed": ["Upload a clear PDF or Word document with selectable text."],
        "skills_found": [], "experience": 0
    }


def _fallback_analysis(resume_text: str) -> Dict[str, Any]:
    text_lower = resume_text.lower()
    word_count = len(resume_text.split())
    errors = []
    score = 60

    has_contact = bool(re.search(r'[\w.+-]+@[\w-]+\.\w+', resume_text))
    has_phone = bool(re.search(r'\+?\d[\d\s\-(). ]{7,}', resume_text))
    has_summary = any(kw in text_lower for kw in ['summary', 'objective', 'profile', 'about'])
    has_skills = 'skills' in text_lower
    has_education = any(kw in text_lower for kw in ['education', 'university', 'college', 'degree', 'bachelor', 'master'])
    has_experience = any(kw in text_lower for kw in ['experience', 'work', 'employment', 'position'])
    has_metrics = bool(re.search(r'\d+%|\$\d+|\d+\+\s*(years|clients|users|projects)', resume_text, re.IGNORECASE))
    weak_verbs = ['responsible for', 'helped', 'assisted', 'worked on', 'was part of']
    found_weak = [v for v in weak_verbs if v in text_lower]

    if not has_contact: errors.append({"category": "contact_info", "severity": "high", "message": "No email address detected."}); score -= 10
    if not has_phone: errors.append({"category": "contact_info", "severity": "medium", "message": "No phone number detected."}); score -= 5
    if not has_summary: errors.append({"category": "missing_section", "severity": "high", "message": "No Professional Summary section found."}); score -= 8
    if not has_skills: errors.append({"category": "missing_section", "severity": "high", "message": "No Skills section found."}); score -= 8
    if not has_education: errors.append({"category": "missing_section", "severity": "medium", "message": "Education section missing or not clearly labeled."}); score -= 5
    if not has_experience: errors.append({"category": "missing_section", "severity": "high", "message": "Work Experience section missing or not clearly labeled."}); score -= 10
    if not has_metrics: errors.append({"category": "no_metrics", "severity": "high", "message": "No quantifiable achievements found (e.g., 'increased sales by 30%')."}); score -= 8
    if found_weak: errors.append({"category": "weak_language", "severity": "medium", "message": f"Weak language: '{found_weak[0]}'. Use strong action verbs instead."}); score -= 5
    if word_count < 250: errors.append({"category": "too_short", "severity": "high", "message": f"Resume is ~{word_count} words — too brief. Aim for 400-600 words."}); score -= 10

    score = max(30, min(score, 90))
    skills = _extract_skills(resume_text)
    fmt = 15 if (has_contact and has_summary) else 8
    sk = min(30, len(skills) * 3)
    ex = 20 if has_metrics else 12
    edu = 15 if has_education else 5
    grade_score = fmt + sk + ex + edu
    grade = "A" if grade_score >= 90 else "B" if grade_score >= 75 else "C" if grade_score >= 55 else "D" if grade_score >= 40 else "F"
    exp_match = re.search(r'(\d+)\+?\s*(years|yrs)', resume_text, re.IGNORECASE)

    return {
        "score": score, "grade": grade,
        "score_breakdown": {"formatting": fmt, "skills": sk, "experience": ex, "education": edu},
        "reasoning": "Automated local analysis (AI unavailable). Review errors below for specific improvements.",
        "errors": errors,
        "improvements_needed": [
            "Add quantifiable achievements (numbers, %, dollar amounts) to every experience bullet.",
            "Include a strong professional summary at the top.",
            "Ensure all sections (Contact, Summary, Skills, Experience, Education) are clearly labeled.",
        ],
        "skills_found": skills[:10],
        "experience": int(exp_match.group(1)) if exp_match else 1
    }


# ── Job Description Analyzer ─────────────────────────────────────────────────
def analyze_jd_with_gemini(jd_text: str) -> Dict[str, Any]:
    prompt = f"""You are a senior technical recruiter and career coach at a top-tier company.

TASK: Carefully READ the job description below word-by-word and extract precise, specific information. Do NOT give generic advice — every response must reference what the JD ACTUALLY SAYS.

JOB DESCRIPTION:
---
{jd_text[:6000]}
---

Extract and return ONLY this JSON (no markdown, no extra text):
{{
  "role_title": "<exact job title as stated in the JD — copy it verbatim>",
  "key_skills_required": [
    "<skill explicitly named in the JD>",
    "<another skill from the JD>",
    "<list every technology, tool, language, framework mentioned>"
  ],
  "experience_level": "<Junior|Mid-Level|Senior|Lead — based on years and responsibilities stated in JD>",
  "suggestions": [
    "<Specific actionable advice referencing THIS JD — e.g., 'The JD requires Kubernetes experience — add any K8s project to your resume'>",
    "<Another suggestion tied to a requirement IN this JD>",
    "<Third suggestion — e.g., 'JD emphasizes CI/CD — quantify any pipeline work you've done'>"
  ],
  "how_to_start": [
    "<Step 1 — specific to this role's requirements>",
    "<Step 2>",
    "<Step 3>",
    "<Step 4>"
  ],
  "skills_to_learn": [
    "<skill FROM the JD that a candidate might be missing>",
    "<another skill from JD>"
  ],
  "certifications": [
    {{"name": "<certification directly matching JD tech stack>", "url": "<real Coursera/AWS/Google/Microsoft certification URL>"}},
    {{"name": "<second cert matching JD requirements>", "url": "<real URL>"}}
  ],
  "similar_jobs": [
    {{"title": "<job title from this JD>", "company": "Various", "url": "https://www.linkedin.com/jobs/search/?keywords=<URL-encoded-title-from-JD>&location=India"}},
    {{"title": "<related role based on JD skills>", "company": "Various", "url": "https://www.naukri.com/<hyphenated-title>-jobs"}},
    {{"title": "<another related role>", "company": "Various", "url": "https://www.linkedin.com/jobs/search/?keywords=<URL-encoded-related-title>&location=India"}}
  ]
}}

RULES:
- key_skills_required: copy skill names VERBATIM from the JD — do not paraphrase
- certifications: must match the actual tech stack in THIS JD (e.g., if JD says AWS → AWS cert, if JD says Python → Python Institute cert)
- similar_jobs URLs: encode the actual role title from this JD in the URL
- Return ONLY the JSON. No preamble, no explanation."""

    try:
        raw = _call_gemini(prompt)
        data = json.loads(_clean_json(raw))
        return data
    except Exception as e:
        logger.error(f"[JD Analyzer] {e}")
        # Encode the JD title for URL use
        from urllib.parse import quote_plus
        safe_title = quote_plus("Software Engineer")
        return {
            "role_title": "Role not detected — AI temporarily unavailable",
            "key_skills_required": ["Check JD manually"],
            "experience_level": "Not specified",
            "suggestions": [
                "Tailor your resume summary to match the exact role keywords.",
                "Highlight projects demonstrating skills mentioned in the JD.",
                "Quantify your past impact with numbers and percentages.",
            ],
            "how_to_start": [
                "Identify the 5 core skills required in this JD.",
                "Build a small demo project using those skills.",
                "Add the project to GitHub and link it in your resume.",
                "Apply to at least 5 similar roles on LinkedIn immediately.",
            ],
            "skills_to_learn": ["Review JD requirements manually"],
            "certifications": [
                {"name": "Google IT Support Certificate", "url": "https://www.coursera.org/professional-certificates/google-it-support"},
                {"name": "AWS Cloud Practitioner", "url": "https://aws.amazon.com/certification/certified-cloud-practitioner/"},
            ],
            "similar_jobs": [
                {"title": "Software Engineer", "company": "Various", "url": f"https://www.linkedin.com/jobs/search/?keywords={safe_title}&location=India"},
                {"title": "Full Stack Developer", "company": "Various", "url": "https://www.naukri.com/full-stack-developer-jobs"},
                {"title": "Backend Developer", "company": "Various", "url": "https://www.linkedin.com/jobs/search/?keywords=Backend+Developer&location=India"},
            ]
        }


# ── Skills Extractor ─────────────────────────────────────────────────────────
def _extract_skills(text: str) -> List[str]:
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
    found = set()
    text_lower = text.lower()
    for s in common_skills:
        if s.lower() in text_lower:
            found.add(s)
    return list(found)


# ── Refine Summary ────────────────────────────────────────────────────────────
def refine_summary_with_gemini(summary_text: str) -> str:
    if not summary_text or len(summary_text.strip()) < 5:
        return summary_text

    prompt = f"""You are a world-class resume writer and career coach. Your task is to COMPLETELY REWRITE the professional summary below.

STRICT RULES — follow every one:
1. Fix ALL spelling and grammar errors.
2. Start with a strong descriptor or professional title (e.g., "Results-driven Software Engineer..." or "Innovative Data Scientist...").
3. Use ACTIVE voice and STRONG action verbs throughout (Led, Built, Architected, Delivered, Engineered).
4. Write 3-5 powerful, detailed sentences — not vague platitudes.
5. PRESERVE every fact, number, technology name, and specific detail from the original.
6. Make it sound like a senior professional wrote it.
7. The rewritten version MUST be meaningfully different from the original.
8. Return ONLY the rewritten summary as plain text. No quotes, no labels, no markdown, no preamble.

Original summary:
{summary_text}

Rewritten professional summary:"""

    try:
        result = _call_gemini(prompt).strip().strip('"').strip()
        if result.lower().startswith("rewritten"):
            result = result.split("\n", 1)[-1].strip()
        if result == summary_text.strip():
            # Force retry with a new call
            result = _call_gemini(prompt + " (rewrite must differ from original)").strip().strip('"').strip()
        logger.info(f"[Refine] Input len={len(summary_text)}, Output len={len(result)}")
        return result
    except Exception as e:
        logger.error(f"[Refine Summary] {e}")
        return summary_text


# ── Improve Text ──────────────────────────────────────────────────────────────
def improve_text_with_gemini(text: str, context: str = "bullet point") -> str:
    if not text or len(text.strip()) < 3:
        return text

    prompt = f"""You are an expert resume writer at a top recruitment firm.

TASK: Rewrite this resume {context} to be highly impactful, professional, and ATS-optimized.

STRICT RULES:
1. MUST start with a strong action verb: Led, Built, Developed, Engineered, Designed, Optimised, Delivered, Launched, Architected, Reduced, Increased, Automated.
2. Add measurable impact wherever plausible — if the original has numbers, keep them; if not, frame with impact direction (e.g., "significantly reduced" or "improving performance by X").
3. Keep the EXACT same meaning — do not invent new facts.
4. Output exactly 1 powerful sentence (for bullets) or improve naturally for other contexts.
5. Return ONLY the improved text. No quotes, no labels, no explanation, no markdown.

Original text:
{text}

Improved version:"""

    try:
        result = _call_gemini(prompt).strip().strip('"').strip()
        if result.lower().startswith("improved"):
            result = result.split("\n", 1)[-1].strip()
        logger.info(f"[Improve] Input: {text[:60]} | Output: {result[:60]}")
        return result
    except Exception as e:
        logger.error(f"[Improve Text] {e}")
        return text


# ── Resume Suggestions ────────────────────────────────────────────────────────
def generate_resume_suggestions_with_gemini(resume_data: dict) -> List[str]:
    clean_data = {k: v for k, v in resume_data.items() if k not in ('skillInput', 'photo')}
    prompt = f"""You are an expert career coach reviewing a resume in progress.
Analyze the JSON below and give exactly 3-4 specific, actionable suggestions.
Focus on: missing sections, lack of metrics, missing skills for the stated title, brevity.
Return ONLY a raw JSON array of strings like ["suggestion 1", "suggestion 2"].

Resume data:
{json.dumps(clean_data, indent=2)[:5000]}"""

    try:
        raw = _call_gemini(prompt)
        result = json.loads(_clean_json(raw))
        if isinstance(result, list):
            return result
        raise ValueError("Not a list")
    except Exception as e:
        logger.error(f"[Suggestions] {e}")
        return [
            "Consider quantifying your achievements with numbers or percentages.",
            "Make sure your skills list matches the keywords in your target job descriptions.",
            "A strong professional summary can greatly improve your chances.",
            "Add certifications or online courses to strengthen your profile.",
        ]


# ── Job Suggestions ───────────────────────────────────────────────────────────
def generate_job_suggestions_with_gemini(profile_data: dict) -> List[Dict[str, Any]]:
    skills = profile_data.get("skills", [])
    title = profile_data.get("title", "")
    scanned_skills = profile_data.get("scanned_skills", [])
    if scanned_skills:
        skills = scanned_skills

    if not skills and not title:
        return _default_job_suggestions()

    skills_str = ', '.join(skills[:25]) if skills else 'Not specified'

    prompt = f"""You are a career advisor with deep knowledge of the Indian and global tech job market.

Generate 6 highly relevant job opportunities for a candidate with these skills: {skills_str}
Target role: {title or 'Not specified'}

Return ONLY a JSON array of exactly 6 job objects:
[
  {{
    "id": <1-6>,
    "title": "<specific job title matching their skills>",
    "company": "<realistic tech company name or 'Various Companies'>",
    "location": "<City, India or Remote>",
    "type": "<Full-time|Part-time|Contract|Internship>",
    "salary": "<realistic Indian salary like '8-15 LPA'>",
    "tags": ["<actual skill from list>", "<another skill>", "<third skill>"],
    "linkedinUrl": "https://www.linkedin.com/jobs/search/?keywords=<URL+encoded+title>&location=India",
    "naukriUrl": "https://www.naukri.com/<hyphenated-job-title>-jobs"
  }}
]
Rules: titles must be SPECIFIC to the skill set. Tags must be from the actual skills. Return ONLY the JSON array."""

    try:
        raw = _call_gemini(prompt)
        data = json.loads(_clean_json(raw))
        if isinstance(data, list) and len(data) > 0:
            return data
        raise ValueError("Invalid format")
    except Exception as e:
        logger.error(f"[Job Suggestions] {e}")
        return _default_job_suggestions(skills, title)


def _default_job_suggestions(skills=None, title="") -> List[Dict[str, Any]]:
    s1 = skills[0] if skills else "Software"
    s2 = skills[1] if skills and len(skills) > 1 else "React"
    s3 = skills[2] if skills and len(skills) > 2 else "Python"
    return [
        {"id": 1, "title": f"{s1} Developer", "company": "TechCorp Solutions", "location": "Remote, India", "type": "Full-time", "salary": "8-15 LPA", "tags": [s1, s2, s3], "linkedinUrl": f"https://www.linkedin.com/jobs/search/?keywords={s1}+Developer&location=India", "naukriUrl": f"https://www.naukri.com/{s1.lower()}-developer-jobs"},
        {"id": 2, "title": "Full Stack Engineer", "company": "Innovation Labs", "location": "Bangalore, India", "type": "Full-time", "salary": "12-22 LPA", "tags": [s2, s3, "Node.js"], "linkedinUrl": "https://www.linkedin.com/jobs/search/?keywords=Full+Stack+Engineer&location=India", "naukriUrl": "https://www.naukri.com/full-stack-developer-jobs"},
        {"id": 3, "title": "Software Engineer", "company": "Various", "location": "Hybrid, India", "type": "Full-time", "salary": "6-12 LPA", "tags": [s1, s2, s3], "linkedinUrl": "https://www.linkedin.com/jobs/search/?keywords=Software+Engineer&location=India", "naukriUrl": "https://www.naukri.com/software-engineer-jobs"},
    ]
