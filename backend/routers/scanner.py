from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from typing import List, Optional
from pydantic import BaseModel

from services.nlp_service import (
    extract_text_from_pdf,
    extract_text_from_docx,
    scan_resume_with_ai,
    analyze_resume_with_gemini,
    analyze_jd_with_gemini,
    refine_summary_with_gemini,
    improve_text_with_gemini,
    generate_resume_suggestions_with_gemini,
    generate_job_suggestions_with_gemini,
)

router = APIRouter()


class JDRequest(BaseModel):
    job_description: str


class RefineRequest(BaseModel):
    summary: str


class ImproveTextRequest(BaseModel):
    text: str
    context: str = "bullet point"


class SuggestionsRequest(BaseModel):
    resume_data: dict


class JobSuggestionsRequest(BaseModel):
    profile_data: dict = {}


# ─── PRIMARY: Comprehensive AI Resume Scanner ─────────────────────────────────
@router.post("/scan")
async def scan_resume(
    file: UploadFile = File(...),
    job_description: Optional[str] = Form(""),
):
    """
    Deep AI-powered ATS resume scanner.
    Accepts a PDF or DOCX resume and returns:
      - ATS score & grade
      - Verdict
      - Strong skills found
      - Critical missing skills
      - Actionable improvement tips
      - Interview tips to stand out
      - Specific errors/weaknesses
    """
    if not file or not file.filename:
        raise HTTPException(status_code=400, detail="No resume file provided.")

    filename = file.filename
    file_bytes = await file.read()

    if not file_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    try:
        if filename.lower().endswith(".pdf"):
            resume_text = extract_text_from_pdf(file_bytes)
        elif filename.lower().endswith(".docx"):
            resume_text = extract_text_from_docx(file_bytes)
        else:
            raise HTTPException(
                status_code=400,
                detail="Unsupported file format. Please upload a PDF or DOCX file.",
            )
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File extraction error: {str(e)}")

    if not resume_text or len(resume_text.strip()) < 30:
        raise HTTPException(
            status_code=400,
            detail="Could not extract readable text from the resume. "
                   "Please ensure the file is not image-based or password-protected.",
        )

    result = scan_resume_with_ai(resume_text, filename)
    return result


# ─── LEGACY: Multi-resume ATS scan (used by existing Ranked Candidates UI) ───
@router.post("/analyze-resumes")
async def analyze_resumes(files: List[UploadFile] = File(...)):
    """
    Legacy multi-resume endpoint for the Ranked Candidates panel.
    Internally calls scan_resume_with_ai per file.
    """
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded.")

    results = []
    for file in files:
        filename = file.filename or "unknown"
        try:
            file_bytes = await file.read()
            if not file_bytes:
                results.append({"filename": filename, "error": "File is empty."})
                continue

            if filename.lower().endswith(".pdf"):
                resume_text = extract_text_from_pdf(file_bytes)
            elif filename.lower().endswith(".docx"):
                resume_text = extract_text_from_docx(file_bytes)
            else:
                results.append({"filename": filename, "error": "Unsupported format. Use PDF or DOCX."})
                continue

            if not resume_text or len(resume_text.strip()) < 30:
                results.append({"filename": filename, "error": "Could not extract readable text."})
                continue

            ai_result = scan_resume_with_ai(resume_text, filename)

            # Derive candidate name from filename
            name = filename.rsplit(".", 1)[0].replace("_", " ").replace("-", " ").title()
            name = name.replace("Resume", "").strip() or "Unknown Candidate"

            results.append({
                "id": filename,
                "filename": filename,
                "candidate_name": name,
                # ─ primary fields ─
                "ats_score": ai_result.get("ats_score", 0),
                "score": ai_result.get("ats_score", 0),   # legacy alias
                "grade": ai_result.get("grade", "N/A"),
                "verdict": ai_result.get("verdict", ""),
                "score_breakdown": {
                    "formatting": ai_result["score_breakdown"].get("formatting", 0),
                    "skills":     ai_result["score_breakdown"].get("skills", 0),
                    "experience": ai_result["score_breakdown"].get("impact", 0),
                    "education":  ai_result["score_breakdown"].get("education", 0),
                },
                "strong_skills":          ai_result.get("strong_skills", []),
                "critical_missing_skills": ai_result.get("critical_missing_skills", []),
                "improvements":           ai_result.get("improvements", []),
                "interview_tips":         ai_result.get("interview_tips", []),
                "errors":                 ai_result.get("errors", []),
                "reasoning":              ai_result.get("verdict", ""),
                "skills_found":           ai_result.get("parsed_skills", []),
                "improvements_needed":    ai_result.get("improvements", []),
                "experience":             ai_result.get("experience_years", 0),
                "parsed_text":            resume_text[:1200] + ("..." if len(resume_text) > 1200 else ""),
            })

        except ValueError as ve:
            results.append({
                "filename": filename,
                "candidate_name": filename.split(".")[0].replace("_", " ").title(),
                "score": 0, "ats_score": 0, "grade": "F",
                "score_breakdown": {"formatting": 0, "skills": 0, "experience": 0, "education": 0},
                "errors": [{"category": "extraction_error", "severity": "high", "message": str(ve)}],
                "reasoning": str(ve), "skills_found": [], "improvements_needed": [],
                "experience": 0, "parsed_text": "", "error": str(ve),
            })
        except Exception as e:
            results.append({"filename": filename, "error": f"Unexpected error: {str(e)}"})

    if not results:
        raise HTTPException(status_code=400, detail="No valid files were processed.")

    results.sort(key=lambda x: x.get("score", 0), reverse=True)
    return {"results": results}


# ─── AI Text Helpers ──────────────────────────────────────────────────────────
@router.post("/refine-summary")
async def refine_summary(request: RefineRequest):
    if not request.summary or len(request.summary.strip()) < 5:
        raise HTTPException(status_code=400, detail="Summary is too short to refine.")
    refined = refine_summary_with_gemini(request.summary)
    return {"refined_summary": refined}


@router.post("/improve-text")
async def improve_text(request: ImproveTextRequest):
    if not request.text or len(request.text.strip()) < 3:
        raise HTTPException(status_code=400, detail="Text is too short to improve.")
    improved = improve_text_with_gemini(request.text, request.context)
    return {"improved_text": improved}


@router.post("/resume-suggestions")
async def resume_suggestions(request: SuggestionsRequest):
    suggestions = generate_resume_suggestions_with_gemini(request.resume_data)
    return {"suggestions": suggestions}


@router.post("/job-suggestions")
async def job_suggestions(request: JobSuggestionsRequest):
    jobs = generate_job_suggestions_with_gemini(request.profile_data)
    return {"jobs": jobs}


# ─── JD Analyzer (legacy stub — hidden from new UI) ──────────────────────────
@router.post("/analyze-jd")
async def analyze_jd(request: JDRequest):
    """Kept for backward compatibility. Redirects users to ATS Scanner."""
    return analyze_jd_with_gemini(request.job_description)
