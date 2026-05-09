from pydantic import BaseModel, validator
from typing import List, Optional

class ExperienceItem(BaseModel):
    role: Optional[str] = ""
    company: Optional[str] = ""
    dates: Optional[str] = ""
    bullets: Optional[List[str]] = []

class EducationItem(BaseModel):
    degree: Optional[str] = ""
    school: Optional[str] = ""
    startMonth: Optional[str] = ""
    startYear: Optional[str] = ""
    endMonth: Optional[str] = ""
    endYear: Optional[str] = ""
    city: Optional[str] = ""
    cgpa: Optional[str] = ""

class CertificationItem(BaseModel):
    name: Optional[str] = ""
    year: Optional[str] = ""

class AwardItem(BaseModel):
    name: Optional[str] = ""
    year: Optional[str] = ""

class LanguageItem(BaseModel):
    name: Optional[str] = ""
    level: Optional[str] = "Fluent"

class ProjectItem(BaseModel):
    name: Optional[str] = ""
    link: Optional[str] = ""
    tech_stack: Optional[str] = ""
    bullets: Optional[List[str]] = []

class PublicationItem(BaseModel):
    title: Optional[str] = ""
    link: Optional[str] = ""
    year: Optional[str] = ""

class ProfileItem(BaseModel):
    platform: Optional[str] = ""
    url: Optional[str] = ""

class CategorizedSkills(BaseModel):
    languages: Optional[List[str]] = []
    frontend: Optional[List[str]] = []
    backend: Optional[List[str]] = []
    ai_tools: Optional[List[str]] = []

class ResumeData(BaseModel):
    model_config = {"extra": "ignore"}
    
    name: Optional[str] = "Your Name"
    title: Optional[str] = "Professional Title"
    email: Optional[str] = ""
    phone: Optional[str] = ""
    location: Optional[str] = ""
    linkedin: Optional[str] = ""
    website: Optional[str] = ""
    github: Optional[str] = ""
    photo: Optional[str] = ""
    summary: Optional[str] = ""
    experience: Optional[List[ExperienceItem]] = []
    education: Optional[List[EducationItem]] = []
    skills: Optional[CategorizedSkills] = CategorizedSkills()
    certifications: Optional[List[CertificationItem]] = []
    awards: Optional[List[AwardItem]] = []
    languages: Optional[List[LanguageItem]] = []
    projects: Optional[List[ProjectItem]] = []
    publications: Optional[List[PublicationItem]] = []
    profiles: Optional[List[ProfileItem]] = []
