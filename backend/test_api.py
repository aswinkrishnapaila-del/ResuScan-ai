import requests

BASE = 'http://localhost:8000/api'

# 1. Health check
r = requests.get('http://localhost:8000/')
status = r.json().get('status','')
print(f'[HEALTH] {status}')

# 2. Refine Summary
orig = 'i worked as developer on react and python projects and helped team fix bugs and write code'
r = requests.post(f'{BASE}/refine-summary', json={'summary': orig})
refined = r.json().get('refined_summary', '')
ok = bool(refined) and refined.strip() != orig.strip()
print(f'[REFINE SUMMARY] {"PASS" if ok else "FAIL"}')
print(f'  Result: {refined[:130]}')

# 3. Improve Text
orig2 = 'helped team with database stuff'
r = requests.post(f'{BASE}/improve-text', json={'text': orig2, 'context': 'bullet point'})
improved = r.json().get('improved_text', '')
ok = bool(improved) and improved.strip() != orig2.strip()
print(f'[IMPROVE TEXT] {"PASS" if ok else "FAIL"}')
print(f'  Result: {improved[:130]}')

# 4. JD Analyzer
jd = 'We are hiring a Senior React Developer with 5+ years. Must know TypeScript, Redux, Jest, AWS. CI/CD with GitHub Actions required. Docker and GraphQL are a plus.'
r = requests.post(f'{BASE}/analyze-jd', json={'job_description': jd})
d = r.json()
skills = d.get('key_skills_required', [])
role = d.get('role_title', '')
ok = bool(skills) and role not in ('', 'Role not detected')
print(f'[JD ANALYZER] {"PASS" if ok else "FAIL"}')
print(f'  Role: {role}')
print(f'  Skills: {skills}')
certs = d.get('certifications', [])
print(f'  Certs: {certs[:2]}')

# 5. Job Suggestions
payload = {
    "profile_data": {
        "skills": ["React", "TypeScript", "Node.js"],
        "title": "Frontend Developer"
    }
}
r = requests.post(f'{BASE}/job-suggestions', json=payload)
res_json = r.json()
jobs = res_json.get('jobs', [])
ok = isinstance(jobs, list) and len(jobs) > 0 and jobs[0].get('title')
print(f'[JOB SUGGESTIONS] {"PASS" if ok else "FAIL"}')
if ok:
    print(f'  Job 1: {jobs[0].get("title")} at {jobs[0].get("company")}')

print('\nAll tests done.')
