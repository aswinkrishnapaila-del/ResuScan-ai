import io
import json
import re
import os
import logging
import requests
from typing import List, Dict, Any

from PyPDF2 import PdfReader
from docx import Document
from dotenv import load_dotenv
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions"

# Model priority list — ordered by JSON reliability
# openai/gpt-oss-120b is the most reliable for structured JSON output
MODEL_PRIORITY = [
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b",
    "groq/compound",
    "qwen/qwen3.6-27b",   # Last resort — emits <think> blocks
]

# ─── Skill Taxonomy ──────────────────────────────────────────────────────────
SKILL_TAXONOMY = [
    # Languages
    "Python", "JavaScript", "TypeScript", "Java", "C++", "C#", "Go", "Rust",
    "PHP", "Ruby", "SQL", "HTML", "CSS", "Bash", "PowerShell", "Kotlin", "Swift",
    # Frontend
    "React", "Next.js", "Vue", "Angular", "Tailwind CSS", "Redux", "GraphQL",
    "Bootstrap", "Webpack", "Vite", "Figma", "UI/UX", "SASS", "Framer Motion",
    # Backend & API
    "FastAPI", "Flask", "Django", "Node.js", "Express", "Spring Boot",
    "REST API", "Microservices", "gRPC", "WebSockets",
    # Databases
    "PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch", "Cassandra",
    "SQLite", "Firebase", "Supabase", "DynamoDB", "Prisma", "SQLAlchemy",
    # DevOps & Cloud
    "Docker", "Kubernetes", "CI/CD", "AWS", "Azure", "GCP", "Terraform",
    "Jenkins", "Git", "GitHub", "GitLab", "Linux", "Nginx", "Ansible", "Helm",
    # AI & ML
    "Machine Learning", "Deep Learning", "NLP", "TensorFlow", "PyTorch",
    "Scikit-Learn", "OpenCV", "Pandas", "NumPy", "LangChain", "Hugging Face",
    # Methodology & Soft
    "Agile", "Scrum", "Kanban", "TDD", "BDD", "SOLID", "Design Patterns",
    "System Design", "Data Structures", "Algorithms",
]

STRONG_ACTION_VERBS = [
    "Led", "Architected", "Optimized", "Engineered", "Developed", "Deployed",
    "Designed", "Automated", "Built", "Implemented", "Delivered", "Directed",
    "Created", "Spearheaded", "Accelerated", "Scaled", "Orchestrated",
    "Transformed", "Established", "Pioneered", "Revamped", "Streamlined",
    "Launched", "Reduced", "Increased", "Improved", "Managed", "Mentored",
]

WEAK_PASSIVE_PHRASES = [
    "responsible for", "helped with", "helped", "worked on", "assisted with",
    "assisted", "was part of", "handled", "involved in", "tasks included",
    "participated in", "contributed to", "tried to", "attempted to",
]

STANDARD_SECTIONS = ["experience", "education", "skills", "projects"]


# ─── Groq API Client ─────────────────────────────────────────────────────────
def _call_groq(
    prompt: str,
    system_prompt: str = "You are an expert ATS resume reviewer and senior technical recruiter with 20+ years at FAANG. Be brutally honest, specific, and evidence-based.",
    expect_json: bool = False,
) -> str:
    """
    Call Groq API with automatic model fallback.
    - If expect_json=True, instructs the model to output only JSON and
      validates that the cleaned content is non-empty.
    - Skips models whose response is empty after stripping think-blocks.
    """
    if not GROQ_API_KEY:
        raise RuntimeError("GROQ_API_KEY is not configured.")

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }
    errors = []

    for model in MODEL_PRIORITY:
        # Build payload — disable thinking for qwen models to prevent empty JSON
        payload: dict = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.25,
            "max_tokens": 2048,
        }
        # Force JSON mode where the API supports it
        if expect_json:
            payload["response_format"] = {"type": "json_object"}
        # Disable extended thinking for qwen to prevent think-only responses
        if "qwen" in model:
            payload["chat_template_kwargs"] = {"thinking": False}

        try:
            res = requests.post(GROQ_ENDPOINT, headers=headers, json=payload, timeout=30)
            if res.status_code == 200:
                raw_content = res.json()["choices"][0]["message"]["content"]
                content = raw_content.strip() if raw_content else ""
                logger.info(f"[Groq] model={model} raw_len={len(content)}")

                # Validate — skip models that return only a think block and nothing else
                if expect_json:
                    cleaned = _clean_json(content)
                    if not cleaned or cleaned in ('{}', '[]', ''):
                        logger.warning(f"[Groq] model={model} returned empty JSON after cleaning, skipping")
                        errors.append(f"{model}: empty JSON after clean")
                        continue

                return content
            elif res.status_code == 400 and "response_format" in str(res.text):
                # Model doesn't support json_object — retry without it
                payload.pop("response_format", None)
                res2 = requests.post(GROQ_ENDPOINT, headers=headers, json=payload, timeout=30)
                if res2.status_code == 200:
                    content = (res2.json()["choices"][0]["message"]["content"] or "").strip()
                    logger.info(f"[Groq] model={model} (no json_mode) raw_len={len(content)}")
                    return content
                errors.append(f"{model}: HTTP {res2.status_code}")
            else:
                logger.warning(f"[Groq] HTTP {res.status_code} model={model}: {res.text[:200]}")
                errors.append(f"{model}: HTTP {res.status_code}")
        except Exception as e:
            logger.error(f"[Groq] Exception model={model}: {e}")
            errors.append(f"{model}: {str(e)}")

    raise RuntimeError(f"All Groq models failed: {errors}")


def _clean_json(text: str) -> str:
    """
    Robustly extract a JSON object from LLM output.
    Handles: <think> blocks, markdown fences, preamble text.
    Falls back to brace-matching extraction as a final safety net.
    """
    # 1. Strip <think>...</think> reasoning blocks (qwen, o1-style)
    text = re.sub(r'<think>.*?</think>', '', text, flags=re.DOTALL).strip()

    # 2. Strip markdown code fences
    text = re.sub(r'^```(?:json)?\s*', '', text, flags=re.MULTILINE)
    text = re.sub(r'\s*```$', '', text, flags=re.MULTILINE)
    text = text.strip()

    # 3. If the text starts with valid JSON, return it directly
    if text.startswith('{') or text.startswith('['):
        return text

    # 4. Brace-match extraction — find first { ... } at top level
    start = text.find('{')
    if start == -1:
        return text  # Nothing to extract; let json.loads raise the error

    depth = 0
    in_string = False
    escape = False
    for i, ch in enumerate(text[start:], start):
        if escape:
            escape = False
            continue
        if ch == '\\' and in_string:
            escape = True
            continue
        if ch == '"':
            in_string = not in_string
            continue
        if in_string:
            continue
        if ch == '{':
            depth += 1
        elif ch == '}':
            depth -= 1
            if depth == 0:
                return text[start:i + 1]

    # Fallback: return everything from first brace
    return text[start:]


# ─── Text Extraction ─────────────────────────────────────────────────────────
def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract text from PDF with PyPDF2 and pypdf fallback, handles multi-column."""
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
        logger.warning(f"PyPDF2 failed: {e}. Trying pypdf fallback...")
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
        except Exception as e2:
            raise ValueError(f"Failed to extract text from PDF: {e2}")

    # Normalize whitespace — fixes multi-column broken words
    text = re.sub(r'[ \t]{2,}', ' ', text)
    text = re.sub(r'\n{3,}', '\n\n', text)

    if not text.strip() or len(text.strip()) < 30:
        raise ValueError(
            "Could not extract text from this PDF. "
            "It may be image-based or scanned. "
            "Please upload a PDF with selectable text, or a DOCX file."
        )
    return text.strip()


def extract_text_from_docx(file_bytes: bytes) -> str:
    """Extract text from DOCX — paragraphs + table cells."""
    try:
        doc = Document(io.BytesIO(file_bytes))
        parts = [p.text for p in doc.paragraphs if p.text.strip()]
        for table in doc.tables:
            for row in table.rows:
                for cell in row.cells:
                    if cell.text.strip():
                        parts.append(cell.text.strip())
        full_text = "\n".join(parts).strip()
        full_text = re.sub(r'[ \t]{2,}', ' ', full_text)
        full_text = re.sub(r'\n{3,}', '\n\n', full_text)
        if not full_text:
            raise ValueError("DOCX file appears to be empty.")
        return full_text
    except Exception as e:
        raise ValueError(f"Failed to read DOCX: {str(e)}")


# ─── Local Analysis Helpers ───────────────────────────────────────────────────
def _extract_skills_local(text: str) -> List[str]:
    """Extract skills from resume text using the taxonomy."""
    text_lower = text.lower()
    found = []
    for skill in SKILL_TAXONOMY:
        if skill.lower() in text_lower:
            found.append(skill)
    return found


def _check_sections(text: str) -> Dict[str, bool]:
    text_lower = text.lower()
    return {sec: (sec in text_lower) for sec in STANDARD_SECTIONS}


def _check_metrics(text: str) -> bool:
    """True if resume contains quantified achievements."""
    return bool(re.search(
        r'\d+\s*%|\$\s*\d+|\d+\s*x\b|\b\d+\+?\s*(users|clients|engineers|projects|million|k|m|billion|features|services|apis|servers|years)',
        text, re.IGNORECASE
    ))


def _find_weak_verbs(text: str) -> List[str]:
    text_lower = text.lower()
    return [p for p in WEAK_PASSIVE_PHRASES if p in text_lower]


def _ats_score_local(text: str) -> int:
    """Compute a local heuristic ATS score (0-100)."""
    score = 45
    sections = _check_sections(text)
    for present in sections.values():
        if present:
            score += 7

    has_email = bool(re.search(r'[\w.+-]+@[\w-]+\.\w+', text))
    has_phone = bool(re.search(r'\+?\d[\d\s\-(). ]{7,}', text))
    has_metrics = _check_metrics(text)
    weak_verbs = _find_weak_verbs(text)
    skills_count = len(_extract_skills_local(text))
    word_count = len(text.split())

    if has_email:   score += 5
    if has_phone:   score += 3
    if has_metrics: score += 12
    score += min(15, skills_count * 2)
    if weak_verbs:  score -= len(weak_verbs) * 2
    if word_count < 200: score -= 15
    elif word_count > 900: score -= 5

    return max(20, min(95, score))


# ─── Core AI Resume Scan ──────────────────────────────────────────────────────
def scan_resume_with_ai(resume_text: str, filename: str = "resume") -> Dict[str, Any]:
    """
    Master function: sends resume to Groq for deep AI analysis.
    Returns structured JSON with ATS score, skills, missing skills,
    improvements, interview tips, and verdict.
    """
    # Pre-compute local signals to augment the prompt
    local_skills = _extract_skills_local(resume_text)
    has_metrics  = _check_metrics(resume_text)
    weak_verbs   = _find_weak_verbs(resume_text)
    sections     = _check_sections(resume_text)
    local_score  = _ats_score_local(resume_text)

    prompt = f"""You are a brutally honest senior technical recruiter and ATS expert with 20+ years at Google, Meta, and Amazon.

Your task is to perform a DEEP, EVIDENCE-BASED audit of the resume below. Reference actual content — job titles, company names, project names, and exact bullet points. Never invent or hallucinate.

=== RESUME TEXT ===
{resume_text[:9000]}
=== END RESUME ===

Local pre-analysis signals (use these to calibrate your response):
- Skills detected: {', '.join(local_skills) if local_skills else 'None found'}
- Quantified metrics present: {has_metrics}
- Weak passive phrases found: {weak_verbs if weak_verbs else 'None'}
- Sections present: {[k for k, v in sections.items() if v]}
- Sections missing: {[k for k, v in sections.items() if not v]}
- Local ATS estimate: {local_score}/100

Produce ONLY a valid JSON object with this exact structure — no markdown, no preamble, no explanation outside JSON:
{{
  "ats_score": <integer 0-100, strict — most resumes score 45-78, not 85+>,
  "grade": "<A|B|C|D|F>",
  "verdict": "<1 blunt sentence summarising the resume — name the actual candidate role/field>",
  "score_breakdown": {{
    "formatting": <0-20>,
    "skills": <0-30>,
    "impact": <0-30>,
    "education": <0-20>
  }},
  "strong_skills": ["<skill actually found in resume>", "..."],
  "critical_missing_skills": ["<important tech/tool absent from resume but expected for this role>", "..."],
  "improvements": [
    "<specific actionable improvement with before/after example quoting ACTUAL resume text>",
    "<second improvement>",
    "<third improvement>",
    "<fourth improvement>"
  ],
  "interview_tips": [
    "<specific tip for standing out in interview for this candidate's background — NOT generic>",
    "<second tip — reference a project or skill from the resume>",
    "<third tip — behavioural/technical prep tailored to their role>",
    "<fourth tip — how to answer 'why should we hire you' for this specific profile>"
  ],
  "errors": [
    {{
      "category": "<missing_section|weak_language|no_metrics|formatting|contact_info|too_short|cliches>",
      "severity": "<high|medium|low>",
      "message": "<quote the ACTUAL problematic text or name the exact missing thing>"
    }}
  ],
  "experience_years": <integer estimate of total work experience>,
  "parsed_skills": ["<every skill/technology you actually found in the resume>"]
}}

STRICT RULES:
- ats_score: deduct heavily for missing metrics, weak verbs, no quantified impact
- strong_skills: only list skills you can SEE in the resume text
- critical_missing_skills: list 4-6 skills typically expected for this type of role that are NOT in the resume
- improvements: be specific, quote real text, give concrete before/after examples
- interview_tips: tailored to THIS candidate — mention their actual projects, companies, or tech stack
- errors: only real errors found — do not fabricate
- Return ONLY valid JSON. No other text."""

    try:
        raw = _call_groq(prompt, expect_json=True)
        cleaned = _clean_json(raw)
        data = json.loads(cleaned)

        # Validate and sanitize required keys
        score = int(data.get("ats_score", local_score))
        grade_val = data.get("grade", "C")
        if grade_val not in ["A", "B", "C", "D", "F"]:
            grade_val = "A" if score >= 90 else "B" if score >= 75 else "C" if score >= 55 else "D" if score >= 40 else "F"

        return {
            "filename": filename,
            "ats_score": score,
            "grade": grade_val,
            "verdict": str(data.get("verdict", "Resume analyzed successfully.")),
            "score_breakdown": {
                "formatting": int(data.get("score_breakdown", {}).get("formatting", 12)),
                "skills":     int(data.get("score_breakdown", {}).get("skills", 15)),
                "impact":     int(data.get("score_breakdown", {}).get("impact", 14)),
                "education":  int(data.get("score_breakdown", {}).get("education", 12)),
            },
            "strong_skills":          list(data.get("strong_skills", local_skills[:8])),
            "critical_missing_skills": list(data.get("critical_missing_skills", [])),
            "improvements":           list(data.get("improvements", [])),
            "interview_tips":         list(data.get("interview_tips", [])),
            "errors":                 list(data.get("errors", [])),
            "experience_years":       int(data.get("experience_years", 0) or 0),
            "parsed_skills":          list(data.get("parsed_skills", local_skills)),
            "parsed_text":            resume_text[:1500],
        }

    except Exception as e:
        logger.error(f"[scan_resume_with_ai] AI call failed: {e}. Using local fallback.")
        return _local_fallback_scan(resume_text, filename, local_skills, local_score,
                                     has_metrics, weak_verbs, sections)


def _local_fallback_scan(resume_text, filename, skills, score, has_metrics, weak_verbs, sections) -> Dict[str, Any]:
    """High-quality local fallback when AI is unavailable."""
    errors = []
    improvements = []
    interview_tips = []

    has_email = bool(re.search(r'[\w.+-]+@[\w-]+\.\w+', resume_text))
    has_phone = bool(re.search(r'\+?\d[\d\s\-(). ]{7,}', resume_text))
    word_count = len(resume_text.split())

    if not has_email:
        errors.append({"category": "contact_info", "severity": "high", "message": "No email address found in the resume."})
    if not has_phone:
        errors.append({"category": "contact_info", "severity": "medium", "message": "No phone number detected."})
    for sec in STANDARD_SECTIONS:
        if not sections.get(sec):
            errors.append({"category": "missing_section", "severity": "high", "message": f"No '{sec.title()}' section found."})
    if not has_metrics:
        errors.append({"category": "no_metrics", "severity": "high", "message": "No quantified achievements found (e.g., 'reduced load time by 40%')."})
    if weak_verbs:
        errors.append({"category": "weak_language", "severity": "medium", "message": f"Passive language detected: '{weak_verbs[0]}'. Replace with strong action verbs."})
    if word_count < 250:
        errors.append({"category": "too_short", "severity": "high", "message": f"Resume is only ~{word_count} words. Aim for 400-700 words."})

    improvements = [
        "Start every bullet point with a strong action verb like 'Led', 'Engineered', or 'Deployed'.",
        "Add quantified results to each bullet: e.g., 'Reduced API response time by 35% through caching layer.'",
        "Include a concise Professional Summary at the top that names your target role and top 3 skills.",
        "Add a dedicated Skills section listing all your technical tools, languages, and frameworks.",
    ]
    interview_tips = [
        "Prepare a 2-minute STAR story for each project on your resume with measurable outcomes.",
        "Research the company's tech stack in advance and map your skills to their specific tools.",
        "When asked 'Tell me about yourself', lead with your strongest skill + a concrete achievement number.",
        "Prepare questions to ask the interviewer about team structure, tech debt, and growth opportunities.",
    ]

    missing_skills = [s for s in ["Docker", "Kubernetes", "CI/CD", "Redis", "Terraform", "GraphQL"] if s.lower() not in resume_text.lower()][:5]
    grade = "A" if score >= 90 else "B" if score >= 75 else "C" if score >= 55 else "D" if score >= 40 else "F"

    return {
        "filename": filename,
        "ats_score": score,
        "grade": grade,
        "verdict": "Local analysis complete (AI temporarily unavailable). Review the audit findings below.",
        "score_breakdown": {
            "formatting": 15 if (has_email and sections.get("skills")) else 8,
            "skills": min(30, len(skills) * 4),
            "impact": 20 if has_metrics else 8,
            "education": 15 if sections.get("education") else 5,
        },
        "strong_skills": skills[:10],
        "critical_missing_skills": missing_skills,
        "improvements": improvements,
        "interview_tips": interview_tips,
        "errors": errors,
        "experience_years": 0,
        "parsed_skills": skills,
        "parsed_text": resume_text[:1500],
    }


# ─── Backward-Compat: /api/analyze-resumes ───────────────────────────────────
def analyze_resume_with_gemini(resume_text: str) -> Dict[str, Any]:
    """
    Adapter for the existing /api/analyze-resumes endpoint.
    Calls scan_resume_with_ai and maps to the legacy response shape.
    """
    result = scan_resume_with_ai(resume_text)
    score = result["ats_score"]
    grade = result["grade"]
    errors = result.get("errors", [])

    # Map improvements to legacy 'improvements_needed'
    improvements_needed = result.get("improvements", [])
    if result.get("interview_tips"):
        improvements_needed += result["interview_tips"]

    return {
        "score": score,
        "grade": grade,
        "score_breakdown": {
            "formatting": result["score_breakdown"].get("formatting", 12),
            "skills":     result["score_breakdown"].get("skills", 15),
            "experience": result["score_breakdown"].get("impact", 14),
            "education":  result["score_breakdown"].get("education", 12),
        },
        "reasoning": result.get("verdict", ""),
        "errors": errors,
        "improvements_needed": improvements_needed,
        "skills_found": result.get("parsed_skills", []),
        "experience": result.get("experience_years", 0),
    }


# ─── Refine Summary ───────────────────────────────────────────────────────────
def refine_summary_with_gemini(summary_text: str) -> str:
    prompt = f"""Rewrite this professional resume summary to be powerful, active-voiced, and senior-level.
Keep ALL facts and numbers. Start with a strong descriptor. Return ONLY the rewritten text, no labels.

Original:
{summary_text}

Rewritten:"""
    try:
        result = _call_groq(prompt).strip().strip('"')
        if result.lower().startswith("rewritten"):
            result = result.split("\n", 1)[-1].strip()
        return result if result else summary_text
    except Exception as e:
        logger.error(f"[refine_summary] {e}")
        return summary_text


# ─── Improve Text ─────────────────────────────────────────────────────────────
def improve_text_with_gemini(text: str, context: str = "bullet point") -> str:
    prompt = f"""Rewrite this resume {context} to start with a strong action verb and sound highly impactful.
Keep the same meaning. Return ONLY the improved text, no explanation.

Original:
{text}

Improved:"""
    try:
        result = _call_groq(prompt).strip().strip('"')
        if result.lower().startswith("improved"):
            result = result.split("\n", 1)[-1].strip()
        return result if result else text
    except Exception as e:
        logger.error(f"[improve_text] {e}")
        return text


# ─── Resume Suggestions ───────────────────────────────────────────────────────
def generate_resume_suggestions_with_gemini(resume_data: dict) -> List[str]:
    clean_data = {k: v for k, v in resume_data.items() if k not in ("skillInput", "photo")}
    prompt = f"""Analyze this resume data and give exactly 4 specific, actionable improvements.
Return ONLY a raw JSON array of strings.

Resume data:
{json.dumps(clean_data, indent=2)[:4000]}"""
    try:
        raw = _call_groq(prompt)
        result = json.loads(_clean_json(raw))
        if isinstance(result, list):
            return result[:4]
        raise ValueError("Not a list")
    except Exception as e:
        logger.error(f"[resume_suggestions] {e}")
        return [
            "Quantify your achievements with numbers or percentages.",
            "Ensure your skills list matches target job description keywords.",
            "Add a strong professional summary naming your role and top 3 skills.",
            "Use action verbs like 'Led', 'Built', 'Scaled' at the start of every bullet.",
        ]


# ─── Job Suggestions ─────────────────────────────────────────────────────────
def generate_job_suggestions_with_gemini(profile_data: dict) -> List[Dict[str, Any]]:
    skills = profile_data.get("skills", ["Python", "React", "FastAPI"])
    title = profile_data.get("title", "")
    skills_str = ", ".join(skills[:15])

    prompt = f"""Generate 4 realistic tech job opportunities for a candidate with skills: {skills_str}
Target role: {title or 'Software Engineer'}

Return ONLY a JSON array of 4 job objects with keys:
id, title, company, location, type, salary, tags, linkedinUrl, naukriUrl"""
    try:
        raw = _call_groq(prompt)
        data = json.loads(_clean_json(raw))
        if isinstance(data, list) and data:
            return data
        raise ValueError("Invalid format")
    except Exception as e:
        logger.error(f"[job_suggestions] {e}")
        s = skills[:3] if skills else ["Python", "React", "Node.js"]
        return [
            {"id": 1, "title": "Full Stack Engineer", "company": "Tech Corp", "location": "Remote, India",
             "type": "Full-time", "salary": "12-22 LPA", "tags": s,
             "linkedinUrl": "https://www.linkedin.com/jobs/search/?keywords=Full+Stack+Engineer&location=India",
             "naukriUrl": "https://www.naukri.com/full-stack-developer-jobs"},
            {"id": 2, "title": "Backend Developer", "company": "Startup Labs", "location": "Bangalore, India",
             "type": "Full-time", "salary": "10-18 LPA", "tags": s,
             "linkedinUrl": "https://www.linkedin.com/jobs/search/?keywords=Backend+Developer&location=India",
             "naukriUrl": "https://www.naukri.com/backend-developer-jobs"},
        ]


# ─── JD Analyzer (legacy stub — kept for any existing callers) ───────────────
def analyze_jd_with_gemini(jd_text: str) -> Dict[str, Any]:
    """Kept for backward compatibility. Returns minimal data."""
    from urllib.parse import quote_plus
    return {
        "role_title": "See ATS Scanner results",
        "key_skills_required": [],
        "experience_level": "Not specified",
        "suggestions": ["Use the ATS Resume Scanner for comprehensive analysis."],
        "how_to_start": ["Upload your resume to the ATS Scanner above."],
        "skills_to_learn": [],
        "certifications": [],
        "similar_jobs": [
            {"title": "Software Engineer", "company": "Various", "url": f"https://www.linkedin.com/jobs/search/?keywords={quote_plus('Software Engineer')}&location=India"},
        ],
    }
