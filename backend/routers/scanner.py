from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from typing import List
from pydantic import BaseModel
from services.nlp_service import (
    extract_text_from_pdf, 
    extract_text_from_docx, 
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

# ─── Analyze Job Description ───────────────────────────────────────────────
@router.post("/analyze-jd")
async def analyze_jd(request: JDRequest):
    if not request.job_description or len(request.job_description.strip()) < 10:
        raise HTTPException(status_code=400, detail="Job description is too short.")
    result = analyze_jd_with_gemini(request.job_description)
    return result

# ─── Analyze Resumes (ATS Scan) ────────────────────────────────────────────
@router.post("/analyze-resumes")
async def analyze_resumes(files: List[UploadFile] = File(...)):
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded.")

    results = []
    
    for file in files:
        filename = file.filename or "unknown"
        try:
            file_bytes = await file.read()
            
            if not file_bytes:
                results.append({
                    "filename": filename,
                    "error": "File is empty."
                })
                continue

            if filename.lower().endswith('.pdf'):
                resume_text = extract_text_from_pdf(file_bytes)
            elif filename.lower().endswith('.docx'):
                resume_text = extract_text_from_docx(file_bytes)
            else:
                results.append({
                    "filename": filename,
                    "error": "Unsupported file format. Please upload PDF or DOCX."
                })
                continue
            
            if not resume_text or len(resume_text.strip()) < 30:
                results.append({
                    "filename": filename,
                    "error": "Could not extract readable text from this file. It may be image-based or corrupted."
                })
                continue
            
            # Perform Gemini analysis
            match_data = analyze_resume_with_gemini(resume_text)
            
            # Guess candidate name from filename
            name = filename.split('.')[0].replace('_', ' ').replace('-', ' ').title()
            if "Resume" in name:
                name = name.replace("Resume", "").strip()
            if len(name) < 2:
                name = "Unknown Candidate"

            results.append({
                "id": filename,
                "filename": filename,
                "candidate_name": name,
                "score": match_data.get("score", 0),
                "grade": match_data.get("grade", "N/A"),
                "score_breakdown": match_data.get("score_breakdown", {}),
                "errors": match_data.get("errors", []),
                "reasoning": match_data.get("reasoning", "No detailed reasoning provided."),
                "skills_found": match_data.get("skills_found", []),
                "improvements_needed": match_data.get("improvements_needed", []),
                "experience": match_data.get("experience", 0),
                "parsed_text": resume_text[:1000] + ("..." if len(resume_text) > 1000 else "")
            })
            
        except ValueError as ve:
            # Known extraction errors — return as result with error message
            results.append({
                "filename": filename,
                "candidate_name": filename.split('.')[0].replace('_', ' ').title(),
                "score": 0,
                "grade": "F",
                "score_breakdown": {"formatting": 0, "skills": 0, "experience": 0, "education": 0},
                "errors": [{"category": "missing_section", "severity": "high", "message": str(ve)}],
                "reasoning": str(ve),
                "skills_found": [],
                "improvements_needed": ["Upload a PDF or DOCX file with selectable (non-scanned) text."],
                "experience": 0,
                "parsed_text": "",
                "error": str(ve)
            })
        except Exception as e:
            results.append({
                "filename": filename,
                "error": f"Unexpected error processing file: {str(e)}"
            })
    
    if not results:
        raise HTTPException(status_code=400, detail="No valid files were processed.")
    
    # Sort results by score descending, errors last
    results.sort(key=lambda x: x.get("score", 0), reverse=True)
    
    return {"results": results}

# ─── Refine Summary with AI ───────────────────────────────────────────────
@router.post("/refine-summary")
async def refine_summary(request: RefineRequest):
    if not request.summary or len(request.summary.strip()) < 5:
        raise HTTPException(status_code=400, detail="Summary is too short to refine.")
    refined = refine_summary_with_gemini(request.summary)
    print(f"[Refine] Result: {refined[:80]}...")
    return {"refined_summary": refined}

# ─── Improve Text with AI ───────────────────────────────────────────────
@router.post("/improve-text")
async def improve_text(request: ImproveTextRequest):
    if not request.text or len(request.text.strip()) < 3:
        raise HTTPException(status_code=400, detail="Text is too short to improve.")
    improved = improve_text_with_gemini(request.text, request.context)
    return {"improved_text": improved}

# ─── AI Resume Suggestions (for Builder) ─────────────────────────────────
@router.post("/resume-suggestions")
async def resume_suggestions(request: SuggestionsRequest):
    suggestions = generate_resume_suggestions_with_gemini(request.resume_data)
    print(f"[Suggestions] {suggestions}")
    return {"suggestions": suggestions}

# ─── AI Job Suggestions (for Job Matching) ───────────────────────────────
@router.post("/job-suggestions")
async def job_suggestions(request: JobSuggestionsRequest):
    jobs = generate_job_suggestions_with_gemini(request.profile_data)
    return {"jobs": jobs}
