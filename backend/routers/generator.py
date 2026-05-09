from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse, Response
from models import ResumeData
from services.pdf_service import generate_pdf_from_data
import json

router = APIRouter()

@router.post("/generate-resume")
async def generate_resume(resume_data: ResumeData):
    """Generate a PDF resume from structured data."""
    try:
        # Convert Pydantic model to dictionary
        data_dict = resume_data.model_dump()
        
        # Generate PDF
        pdf_stream = generate_pdf_from_data(data_dict, "base_template.html")
        pdf_bytes = pdf_stream.read()
        
        if not pdf_bytes:
            raise HTTPException(status_code=500, detail="PDF generation produced empty output.")
        
        # Safe filename
        safe_name = (data_dict.get("name") or "resume").replace(" ", "_").lower()
        
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={safe_name}_resume.pdf",
                "Content-Length": str(len(pdf_bytes))
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"[Generate Resume Error] {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate PDF: {str(e)}")
