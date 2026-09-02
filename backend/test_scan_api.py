import json
from services.nlp_service import scan_resume_against_jd

sample_resume = """
John Doe
Email: john.doe@example.com | Phone: +1-123-456-7890 | San Francisco, CA

PROFESSIONAL SUMMARY
Experienced Software Engineer with 4 years of expertise in building web applications using React, Python, FastAPI, and PostgreSQL. Worked on building scalable microservices and backend APIs.

EXPERIENCE
Software Engineer - Acme Corp (2021 - Present)
- Worked on developing REST APIs with Python, FastAPI, and PostgreSQL.
- Responsible for managing database schemas and query optimization.
- Helped with frontend feature development using React and Tailwind CSS.
- Assisted with team code reviews and documentation.

EDUCATION
B.S. in Computer Science - Tech University (2020)

SKILLS
React, Python, FastAPI, PostgreSQL, JavaScript, HTML, CSS, SQL, Git
"""

sample_jd = """
Senior Full Stack Engineer
Acme Corp is seeking a Senior Full Stack Engineer to lead cloud infrastructure and web development.

Key Requirements:
- Strong experience with React, Python, FastAPI, and PostgreSQL.
- Hands-on expertise with Docker, Kubernetes, CI/CD pipelines, and Redis caching.
- Proven track record of architecting scalable applications and driving team engineering standards.
- Strong knowledge of AWS cloud deployment and microservices architecture.
"""

result = scan_resume_against_jd(sample_resume, sample_jd, "john_doe_resume.pdf")

print("--- SCAN RESULT JSON ---")
print(json.dumps(result, indent=2))

# Verify required keys
assert "filename" in result, "Missing filename"
assert "match_score" in result, "Missing match_score"
assert "strong_skills" in result, "Missing strong_skills"
assert "critical_missing_skills" in result, "Missing critical_missing_skills"
assert "improvements" in result, "Missing improvements"
assert "summary_verdict" in result, "Missing summary_verdict"

print("\nSUCCESS: All JSON keys and structure validated successfully!")
