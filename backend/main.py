
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sentence_transformers import SentenceTransformer
import fitz
import re

# ==================================================
# 1. CREATE FASTAPI APPLICATION
# ==================================================

app = FastAPI(
    title="SkillSync AI Resume Matcher",
    description="AI-powered resume and job description matching",
    version="1.0.0"
)

# ==================================================
# 2. CORS - CONNECT REACT FRONTEND
# ==================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================================================
# 3. LOAD AI MODEL
# ==================================================

print("Loading SkillSync AI model...")

model = SentenceTransformer("all-MiniLM-L6-v2")

print("SkillSync AI model loaded successfully!")


# ==================================================
# 4. SKILL DICTIONARY
# ==================================================

SKILLS = [
    "Python",
    "Java",
    "JavaScript",
    "TypeScript",
    "C",
    "C++",
    "C#",
    "SQL",
    "HTML",
    "CSS",
    "React",
    "Node.js",
    "FastAPI",
    "Flask",
    "Django",
    "Machine Learning",
    "Deep Learning",
    "Artificial Intelligence",
    "Data Analysis",
    "Data Science",
    "Pandas",
    "NumPy",
    "Scikit-learn",
    "TensorFlow",
    "PyTorch",
    "NLP",
    "Natural Language Processing",
    "Computer Vision",
    "AWS",
    "Azure",
    "Google Cloud",
    "Docker",
    "Kubernetes",
    "Git",
    "GitHub",
    "REST API",
    "MongoDB",
    "MySQL",
    "PostgreSQL",
    "SQLite",
    "Communication",
    "Problem Solving",
    "Data Structures",
    "Algorithms",
    "Power BI",
    "Excel",
    "Tableau",
    "Statistics",
    "Linux",
    "Agile",
    "Firebase",
    "Streamlit",
    "Selenium",
    "MLOps",
]


# ==================================================
# 5. EXTRACT TEXT FROM PDF
# ==================================================

def extract_pdf_text(pdf_bytes: bytes) -> str:
    try:
        with fitz.open(
            stream=pdf_bytes,
            filetype="pdf"
        ) as document:
            text = "\n".join(
                page.get_text() for page in document
            )

    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Unable to read the PDF. Please upload a valid PDF."
        )

    if not text.strip():
        raise HTTPException(
            status_code=400,
            detail=(
                "No selectable text was found in the PDF. "
                "Scanned PDFs may require OCR."
            )
        )

    return text


# ==================================================
# 6. READ JOB DESCRIPTION FILE
# Supports PDF and TXT
# ==================================================

async def read_job_description_file(
    jd_file: UploadFile
) -> str:

    filename = (jd_file.filename or "").lower()

    if not filename.endswith((".pdf", ".txt")):
        raise HTTPException(
            status_code=400,
            detail="Job description must be a PDF or TXT file."
        )

    file_bytes = await jd_file.read()

    if not file_bytes:
        raise HTTPException(
            status_code=400,
            detail="The job description file is empty."
        )

    if len(file_bytes) > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="Job description file must be smaller than 5 MB."
        )

    if filename.endswith(".pdf"):
        text = extract_pdf_text(file_bytes)
    else:
        try:
            text = file_bytes.decode("utf-8-sig")
        except UnicodeDecodeError:
            raise HTTPException(
                status_code=400,
                detail="Could not read TXT file. Please use UTF-8 text."
            )

    if not text.strip():
        raise HTTPException(
            status_code=400,
            detail="No text was found in the job description file."
        )

    return text.strip()


# ==================================================
# 7. DETECT SKILLS
# ==================================================

def extract_skills(text: str) -> list:
    found_skills = []

    for skill in SKILLS:
        pattern = (
            r"(?<!\w)"
            + re.escape(skill)
            + r"(?!\w)"
        )

        if re.search(pattern, text, re.IGNORECASE):
            found_skills.append(skill)

    return found_skills


# ==================================================
# 8. HOME ENDPOINT
# ==================================================

@app.get("/")
def home():
    return {
        "message": "Welcome to SkillSync AI Resume Matcher",
        "status": "running",
        "version": "1.0.0",
        "features": [
            "Resume PDF upload",
            "Job description PDF upload",
            "Job description TXT upload",
            "Job description text entry",
            "AI semantic similarity",
            "Skill gap analysis",
        ]
    }


# ==================================================
# 9. HEALTH CHECK
# ==================================================

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "application": "SkillSync",
        "model": "all-MiniLM-L6-v2"
    }


# ==================================================
# 10. ANALYZE RESUME
# Accepts:
#   - Resume PDF (required)
#   - Job description text OR PDF/TXT file
# ==================================================

@app.post("/analyze")
async def analyze_resume(
    resume: UploadFile = File(...),
    job_description: str = Form(""),
    jd_file: UploadFile | None = File(None)
):

    # --------------------------------------------------
    # A. VALIDATE RESUME
    # --------------------------------------------------

    if (
        not resume.filename
        or not resume.filename.lower().endswith(".pdf")
    ):
        raise HTTPException(
            status_code=400,
            detail="Please upload your resume as a PDF file."
        )

    resume_bytes = await resume.read()

    if not resume_bytes:
        raise HTTPException(
            status_code=400,
            detail="The resume file is empty."
        )

    if len(resume_bytes) > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="Resume must be smaller than 5 MB."
        )

    if not resume_bytes.startswith(b"%PDF-"):
        raise HTTPException(
            status_code=400,
            detail="The uploaded resume is not a valid PDF."
        )

    resume_text = extract_pdf_text(resume_bytes)

    # Limit text processed by the model
    resume_text = resume_text[:50000]

    # --------------------------------------------------
    # B. GET JOB DESCRIPTION
    # Accept a file OR text
    # --------------------------------------------------

    if jd_file is not None and jd_file.filename:

        job_text = await read_job_description_file(jd_file)
        jd_source = "file"

    elif job_description.strip():

        job_text = job_description.strip()
        jd_source = "text"

    else:
        raise HTTPException(
            status_code=400,
            detail=(
                "Please upload a job description PDF/TXT "
                "or enter the job description text."
            )
        )

    if len(job_text) > 30000:
        raise HTTPException(
            status_code=400,
            detail="Job description must be under 30,000 characters."
        )

    # --------------------------------------------------
    # C. AI SEMANTIC SIMILARITY
    # --------------------------------------------------

    try:
        embeddings = model.encode(
            [resume_text, job_text],
            normalize_embeddings=True
        )

        similarity = float(
            embeddings[0] @ embeddings[1]
        )

        match_score = round(
            max(0, min(100, similarity * 100)),
            1
        )

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="AI analysis failed. Please try again."
        )

    # --------------------------------------------------
    # D. MATCH AND FIND MISSING SKILLS
    # --------------------------------------------------

    resume_skills = extract_skills(resume_text)
    required_skills = extract_skills(job_text)

    matched_skills = [
        skill
        for skill in required_skills
        if skill in resume_skills
    ]

    missing_skills = [
        skill
        for skill in required_skills
        if skill not in resume_skills
    ]

    # --------------------------------------------------
    # E. GENERATE SUGGESTIONS
    # --------------------------------------------------

    suggestions = []

    if missing_skills:
        suggestions.append(
            "Review these skills from the job description: "
            + ", ".join(missing_skills)
            + ". If you have these skills, highlight them "
              "with relevant projects or experience."
        )

    if not resume_skills:
        suggestions.append(
            "Consider adding a clearly labelled skills "
            "section to your resume."
        )

    if not required_skills:
        suggestions.append(
            "No skills from the built-in dictionary were "
            "detected in the job description. Review its "
            "requirements manually."
        )

    if len(resume_text.split()) < 100:
        suggestions.append(
            "The resume contains relatively little extractable "
            "text. Check that education, skills, projects, "
            "and experience are included."
        )

    if not suggestions:
        suggestions.append(
            "Your detected skills align with the listed "
            "requirements. Tailor your project descriptions "
            "to demonstrate relevant experience."
        )

    # --------------------------------------------------
    # F. RETURN RESULTS TO FRONTEND
    # --------------------------------------------------

    return {
        "filename": resume.filename,
        "job_description_source": jd_source,
        "match_score": match_score,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "resume_skills": resume_skills,
        "required_skills": required_skills,
        "suggestions": suggestions,
        "resume_characters_analyzed": len(resume_text),
        "note": (
            "The match score estimates semantic text similarity. "
            "It is not a hiring probability or a guarantee "
            "of job suitability."
        )
    }
