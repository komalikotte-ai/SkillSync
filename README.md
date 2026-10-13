\# SkillSync — AI Resume \& Job Matcher



SkillSync is a web application that analyzes a resume against a job description to help candidates understand their relevant skills, identify skill gaps, and improve their job application.



\## Features



\- \*\*Resume Upload:\*\* Upload a resume in PDF format.

\- \*\*Flexible Job Description Input:\*\* Paste a job description or upload a PDF/TXT file.

\- \*\*Skill Extraction:\*\* Identify relevant skills from resume and job description text.

\- \*\*Resume–Job Matching:\*\* Compare resume content with job requirements.

\- \*\*Skill Gap Analysis:\*\* Highlight matched and missing skills.

\- \*\*Improvement Suggestions:\*\* Provide recommendations to help candidates improve their resumes.

\- \*\*Semantic Similarity:\*\* Use a pretrained Sentence Transformer model to compare text meaning.



\## Technology Stack



\*\*Frontend\*\*

\- React

\- Vite

\- CSS

\- Lucide React



\*\*Backend\*\*

\- Python

\- FastAPI

\- Sentence Transformers

\- PyMuPDF



\## How It Works



1\. The user uploads a resume.

2\. The user provides a job description by pasting text or uploading a supported file.

3\. The backend extracts the text and identifies relevant skills.

4\. The application compares the resume against the job description.

5\. The dashboard displays the matching score, matched skills, missing skills, and improvement suggestions.



The matching score is an indicator of similarity, not a probability of getting hired.



\## Project Structure



```text

SkillSync/

├── backend/

│   └── main.py

├── frontend/

│   ├── public/

│   ├── src/

│   │   ├── App.jsx

│   │   ├── App.css

│   │   ├── index.css

│   │   └── main.jsx

│   ├── package.json

│   └── vite.config.js

└── README.md

```



\## Running Locally



\### 1. Clone the repository



```bash

git clone https://github.com/komalikotte-ai/SkillSync.git

cd SkillSync

```



\### 2. Start the backend



Open a terminal:



```bash

cd backend

python -m venv venv

```



Activate the environment on Windows PowerShell:



```powershell

.\\venv\\Scripts\\Activate.ps1

```



Install the backend dependencies listed in your project's dependency file, then start the API:



```bash

python -m uvicorn main:app --reload

```



The API documentation should be available at `http://127.0.0.1:8000/docs`.



\### 3. Start the frontend



Open a second terminal from the project root:



```bash

cd frontend

npm install

npm run dev

```



Open the local URL printed by Vite in the terminal.



\## Future Improvements



\- More detailed semantic matching and skill-gap analysis.

\- AI-assisted resume improvement recommendations.

\- Job-role recommendations.

\- Deployment with a publicly accessible demo.



\## Disclaimer



SkillSync is a career-support tool. Its results are informational and should not be treated as a guarantee of interview selection or employment.



