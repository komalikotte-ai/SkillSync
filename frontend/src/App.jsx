
import { useState } from "react";
import {
  FileText,
  Upload,
  BrainCircuit,
  Target,
  CheckCircle2,
  XCircle,
  Lightbulb,
  LoaderCircle,
  Sparkles,
  BriefcaseBusiness,
  ArrowRight,
  RotateCcw,
  FileCheck2,
  AlertCircle,
} from "lucide-react";
import "./App.css";

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [resume, setResume] = useState(null);
  const [jdMode, setJdMode] = useState("text");
  const [jdFile, setJdFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function analyzeResume(event) {
    event.preventDefault();
    setError("");
    setResult(null);

    if (!resume) {
      setError("Please upload your resume PDF.");
      return;
    }

    if (jdMode === "text" && !jobDescription.trim()) {
      setError("Please enter the job description.");
      return;
    }

    if (jdMode === "file" && !jdFile) {
      setError("Please upload a job description PDF or TXT file.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", resume);

    if (jdMode === "text") {
      formData.append("job_description", jobDescription);
    } else {
      formData.append("jd_file", jdFile);
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/analyze`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Analysis failed. Please try again.");
      }

      setResult(data);
    } catch (err) {
      setError(
        err.message ||
          "Unable to connect to the backend. Check that FastAPI is running."
      );
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setResume(null);
    setJdFile(null);
    setJobDescription("");
    setJdMode("text");
    setResult(null);
    setError("");

    const resumeInput = document.getElementById("resume-upload");
    const jdInput = document.getElementById("jd-upload");

    if (resumeInput) resumeInput.value = "";
    if (jdInput) jdInput.value = "";
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#home">
          <div className="brand-icon">
            <BrainCircuit size={25} />
          </div>
          <span>Skill<span className="brand-accent">Sync</span></span>
        </a>

        <div className="workspace-label">WORKSPACE</div>

        <a className="nav-item active" href="#analyzer">
          <Target size={18} />
          Resume Analyzer
        </a>

        <a className="nav-item" href="#results">
          <FileCheck2 size={18} />
          Match Results
        </a>

        <div className="sidebar-bottom">
          <div className="sidebar-help-icon">
            <Sparkles size={20} />
          </div>
          <h3>Your next opportunity starts here.</h3>
          <p>Discover how well your skills match your target role.</p>
        </div>

        <div className="sidebar-footer">
          <span className="status-dot" />
          AI engine interface
        </div>
      </aside>

      <main className="main-content" id="home">
        <header className="topbar">
          <div>
            <div className="breadcrumb">Workspace / Resume Analyzer</div>
            <h2>Resume Analyzer</h2>
          </div>

          <div className="topbar-pill">
            <span className="status-dot" />
            AI matching
          </div>
        </header>

        <section className="welcome-section">
          <div className="welcome-copy">
            <div className="eyebrow">
              <Sparkles size={15} />
              SMARTER CAREER MATCHING
            </div>

            <h1>Make your next move <span>count.</span></h1>

            <p>
              Compare your resume with a job description, uncover skill gaps,
              and get actionable suggestions to improve your application.
            </p>
          </div>

          <div className="welcome-art">
            <div className="art-orbit orbit-one" />
            <div className="art-orbit orbit-two" />
            <div className="art-icon">
              <BrainCircuit size={48} strokeWidth={1.5} />
            </div>
            <div className="floating-chip chip-one">
              <CheckCircle2 size={15} /> Skills
            </div>
            <div className="floating-chip chip-two">
              <Target size={15} /> Match
            </div>
          </div>
        </section>

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon purple">
              <FileText size={20} />
            </div>
            <div>
              <p className="stat-label">Resume format</p>
              <h3>PDF</h3>
              <span>Up to 5 MB</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon blue">
              <BrainCircuit size={20} />
            </div>
            <div>
              <p className="stat-label">Matching engine</p>
              <h3>Semantic AI</h3>
              <span>Text similarity analysis</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">
              <BriefcaseBusiness size={20} />
            </div>
            <div>
              <p className="stat-label">Analysis includes</p>
              <h3>Skill gaps</h3>
              <span>Matched and missing skills</span>
            </div>
          </div>
        </section>

        <section className="analyzer-layout" id="analyzer">
          <div className="panel input-panel">
            <div className="panel-heading">
              <div>
                <span className="section-number">01</span>
                <h2>Upload your documents</h2>
              </div>
              <span className="required-label">Required inputs</span>
            </div>

            <p className="panel-description">
              Add your resume and the job description you want to target.
            </p>

            <form onSubmit={analyzeResume}>
              <div className="field-block">
                <label htmlFor="resume-upload">
                  Your resume <span>*</span>
                </label>

                <label className="upload-box" htmlFor="resume-upload">
                  <input
                    id="resume-upload"
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={(event) => {
                      setResume(event.target.files?.[0] || null);
                      setResult(null);
                      setError("");
                    }}
                  />

                  <div className="upload-icon">
                    <Upload size={22} />
                  </div>

                  <div className="upload-text">
                    <strong>
                      {resume ? resume.name : "Click to upload your resume"}
                    </strong>
                    <span>
                      {resume
                        ? `${(resume.size / (1024 * 1024)).toFixed(2)} MB`
                        : "PDF format · Maximum 5 MB"}
                    </span>
                  </div>

                  <span className="browse-button">
                    {resume ? "Change" : "Browse"}
                  </span>
                </label>
              </div>

              <div className="field-block">
                <div className="label-row">
                  <label>
                    Job description <span>*</span>
                  </label>
                  <span className="optional-hint">Choose one method</span>
                </div>

                <div className="mode-switch">
                  <button
                    type="button"
                    className={jdMode === "text" ? "mode-button selected" : "mode-button"}
                    onClick={() => {
                      setJdMode("text");
                      setError("");
                      setResult(null);
                    }}
                  >
                    <FileText size={16} />
                    Enter text
                  </button>

                  <button
                    type="button"
                    className={jdMode === "file" ? "mode-button selected" : "mode-button"}
                    onClick={() => {
                      setJdMode("file");
                      setError("");
                      setResult(null);
                    }}
                  >
                    <Upload size={16} />
                    Upload file
                  </button>
                </div>

                {jdMode === "text" ? (
                  <div className="textarea-wrapper">
                    <textarea
                      value={jobDescription}
                      onChange={(event) => {
                        setJobDescription(event.target.value);
                        setResult(null);
                        setError("");
                      }}
                      placeholder="Paste the job description here...

Example:
We are looking for a Python developer with knowledge of machine learning, SQL, and REST APIs..."
                      rows={9}
                      maxLength={30000}
                    />
                    <div className="textarea-footer">
                      <span>Include responsibilities and required skills.</span>
                      <span>{jobDescription.length}/30000</span>
                    </div>
                  </div>
                ) : (
                  <label className="upload-box jd-upload-box" htmlFor="jd-upload">
                    <input
                      id="jd-upload"
                      type="file"
                      accept=".pdf,.txt,application/pdf,text/plain"
                      onChange={(event) => {
                        setJdFile(event.target.files?.[0] || null);
                        setResult(null);
                        setError("");
                      }}
                    />

                    <div className="upload-icon">
                      <FileText size={22} />
                    </div>

                    <div className="upload-text">
                      <strong>
                        {jdFile ? jdFile.name : "Upload job description"}
                      </strong>
                      <span>
                        {jdFile
                          ? `${(jdFile.size / (1024 * 1024)).toFixed(2)} MB`
                          : "PDF or TXT · Maximum 5 MB"}
                      </span>
                    </div>

                    <span className="browse-button">
                      {jdFile ? "Change" : "Browse"}
                    </span>
                  </label>
                )}
              </div>

              {error && (
                <div className="error-message" role="alert">
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              <button className="analyze-button" type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <LoaderCircle className="spin" size={19} />
                    Analyzing documents...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Analyze my resume
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <p className="privacy-note">
                <CheckCircle2 size={14} />
                Your documents are processed by your local backend.
              </p>
            </form>
          </div>

          <aside className="panel process-panel">
            <div className="panel-heading">
              <div>
                <span className="section-number">02</span>
                <h2>How it works</h2>
              </div>
            </div>

            <p className="panel-description">
              Three steps to understand your resume's relevance.
            </p>

            <div className="process-list">
              <div className="process-step">
                <div className="process-icon purple">
                  <FileText size={20} />
                </div>
                <div>
                  <h3>Read your resume</h3>
                  <p>Extract readable text from your PDF document.</p>
                </div>
              </div>

              <div className="process-connector" />

              <div className="process-step">
                <div className="process-icon blue">
                  <BrainCircuit size={20} />
                </div>
                <div>
                  <h3>Compare with the role</h3>
                  <p>Use an AI model to estimate semantic text similarity.</p>
                </div>
              </div>

              <div className="process-connector" />

              <div className="process-step">
                <div className="process-icon green">
                  <Target size={20} />
                </div>
                <div>
                  <h3>Discover skill gaps</h3>
                  <p>See detected skills and suggestions for improvement.</p>
                </div>
              </div>
            </div>

            <div className="tip-card">
              <div className="tip-heading">
                <Lightbulb size={19} />
                <strong>Pro tip</strong>
              </div>
              <p>
                Tailor your resume to the specific role. Highlight relevant
                projects and experience rather than adding skills you don't have.
              </p>
            </div>
          </aside>
        </section>

        {result && (
          <section className="results-section" id="results">
            <div className="results-heading">
              <div>
                <div className="eyebrow">
                  <Sparkles size={15} />
                  ANALYSIS COMPLETE
                </div>
                <h2>Your resume analysis</h2>
                <p>
                  Results for <strong>{result.filename}</strong>
                </p>
              </div>

              <button className="reset-button" onClick={resetForm} type="button">
                <RotateCcw size={16} />
                New analysis
              </button>
            </div>

            <div className="result-overview">
              <div className="score-card">
                <div className="score-ring" style={{ "--score": `${result.match_score}%` }}>
                  <div className="score-inner">
                    <strong>{result.match_score}%</strong>
                    <span>Similarity</span>
                  </div>
                </div>
                <div className="score-description">
                  <h3>Resume and job similarity</h3>
                  <p>
                    This score estimates semantic text similarity. It is not
                    your probability of getting hired.
                  </p>
                </div>
              </div>

              <div className="mini-result-card">
                <div className="mini-result-icon green">
                  <CheckCircle2 size={21} />
                </div>
                <span>Matched skills</span>
                <strong>{result.matched_skills.length}</strong>
              </div>

              <div className="mini-result-card">
                <div className="mini-result-icon red">
                  <XCircle size={21} />
                </div>
                <span>Missing skills</span>
                <strong>{result.missing_skills.length}</strong>
              </div>
            </div>

            <div className="skills-grid">
              <div className="panel skills-panel">
                <div className="skills-heading">
                  <div className="skills-title green-text">
                    <CheckCircle2 size={20} />
                    <h3>Matched skills</h3>
                  </div>
                  <span className="skill-count">
                    {result.matched_skills.length}
                  </span>
                </div>

                <p className="skills-description">
                  Skills detected in both your resume and the job description.
                </p>

                <div className="skill-tags">
                  {result.matched_skills.length ? (
                    result.matched_skills.map((skill) => (
                      <span className="skill-tag matched" key={skill}>
                        <CheckCircle2 size={13} />
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="empty-state">
                      No matching skills were detected by the current dictionary.
                    </p>
                  )}
                </div>
              </div>

              <div className="panel skills-panel">
                <div className="skills-heading">
                  <div className="skills-title red-text">
                    <XCircle size={20} />
                    <h3>Missing skills</h3>
                  </div>
                  <span className="skill-count">
                    {result.missing_skills.length}
                  </span>
                </div>

                <p className="skills-description">
                  Listed job skills not detected in your resume.
                </p>

                <div className="skill-tags">
                  {result.missing_skills.length ? (
                    result.missing_skills.map((skill) => (
                      <span className="skill-tag missing" key={skill}>
                        <XCircle size={13} />
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="empty-state">
                      No missing skills were detected from the recognized list.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="panel suggestions-panel">
              <div className="skills-title purple-text">
                <Lightbulb size={21} />
                <h3>Suggestions to improve</h3>
              </div>

              <div className="suggestion-list">
                {result.suggestions.map((suggestion, index) => (
                  <div className="suggestion-item" key={index}>
                    <span className="suggestion-number">{index + 1}</span>
                    <p>{suggestion}</p>
                  </div>
                ))}
              </div>

              <p className="result-disclaimer">
                Skill detection relies on a built-in dictionary. Review the
                original job description and verify each suggestion yourself.
              </p>
            </div>
          </section>
        )}

        <footer className="page-footer">
          <a className="footer-brand" href="#home">
            <BrainCircuit size={18} />
            SkillSync
          </a>
          <span>AI-powered resume matching · Built for smarter applications</span>
        </footer>
      </main>
    </div>
  );
}

export default App;
