
import { useRef, useState } from "react";
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
  GraduationCap,
  ListChecks,
} from "lucide-react";
import "./App.css";

const API_URL = "http://127.0.0.1:8000";

function getLearningRoadmap(missingSkills = []) {
  const skills = [...new Set(missingSkills)].slice(0, 6);

  if (!skills.length) {
    return [
      {
        title: "Review the target role",
        detail:
          "Compare the job requirements with your resume and verify that the detected matched skills reflect your real experience.",
      },
      {
        title: "Strengthen one core skill",
        detail:
          "Choose an important skill for the role and complete a small hands-on exercise or project using it.",
      },
      {
        title: "Practise and document",
        detail:
          "Solve a practical task, document what you learned, and save evidence of your work in your portfolio.",
      },
    ];
  }

  return [
    {
      title: "Week 1 · Learn the foundations",
      detail: `Start with ${skills.slice(0, 2).join(" and ")}. Learn the basic concepts and follow beginner examples.`,
    },
    {
      title: "Week 2 · Practise with small tasks",
      detail: `Complete short exercises using ${skills.slice(0, 3).join(", ")}. Focus on understanding each step.`,
    },
    {
      title: "Week 3 · Apply the skills",
      detail: `Create a small project or practical demonstration using ${skills.slice(0, 3).join(", ")}.`,
    },
    {
      title: "Week 4 · Review and show evidence",
      detail: `Test your work, document your results, and update your resume only with skills you can demonstrate.${
        skills.length > 3
          ? ` Then begin learning ${skills.slice(3).join(", ")}.`
          : ""
      }`,
    },
  ];
}

function getResumeActions(
  matchedSkills = [],
  missingSkills = [],
  backendSuggestions = []
) {
  const actions = [];

  if (matchedSkills.length) {
    actions.push({
      title: "Highlight relevant experience",
      detail: `If accurate, explain where you used ${matchedSkills
        .slice(0, 3)
        .join(", ")} in a project, internship, or coursework. Describe your contribution and the outcome.`,
    });
  }

  if (missingSkills.length) {
    actions.push({
      title: "Address skill gaps honestly",
      detail: `The job description mentions ${missingSkills
        .slice(0, 4)
        .join(", ")}. Add these skills only if you have relevant experience. Otherwise, practise them before listing them.`,
    });
  }

  actions.push({
    title: "Improve your project descriptions",
    detail:
      "Use this template and replace the brackets with true details: Built [project or feature] using [tools actually used] to [purpose]. Include a measured result only if you have evidence.",
  });

  const safeSuggestions = Array.isArray(backendSuggestions)
    ? backendSuggestions
    : [];

  safeSuggestions.slice(0, 2).forEach((suggestion) => {
    actions.push({
      title: "Analyzer suggestion",
      detail: String(suggestion),
    });
  });

  return actions.slice(0, 5);
}

function App() {
  const [resume, setResume] = useState(null);
  const [jdMode, setJdMode] = useState("text");
  const [jdFile, setJdFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const resumeInputRef = useRef(null);
  const jdInputRef = useRef(null);

  async function analyzeResume(event) {
    event.preventDefault();
    setError("");
    setResult(null);

    if (!resume) {
      setError("Please upload your resume PDF.");
      return;
    }

    if (resume.size > 5 * 1024 * 1024) {
      setError("Your resume must be 5 MB or smaller.");
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

    if (jdMode === "file") {
      const allowedTypes = [".pdf", ".txt"];
      const fileName = jdFile.name.toLowerCase();

      if (!allowedTypes.some((extension) => fileName.endsWith(extension))) {
        setError("The job description must be a PDF or TXT file.");
        return;
      }

      if (jdFile.size > 5 * 1024 * 1024) {
        setError("The job description file must be 5 MB or smaller.");
        return;
      }
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
        const message =
          typeof data.detail === "string"
            ? data.detail
            : "Analysis failed. Please check your files and try again.";

        throw new Error(message);
      }

      setResult(data);
      setTimeout(() => {
        document.getElementById("results")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
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

    if (resumeInputRef.current) {
      resumeInputRef.current.value = "";
    }

    if (jdInputRef.current) {
      jdInputRef.current.value = "";
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function selectFile(event, type) {
    const file = event.target.files?.[0] || null;
    setError("");
    setResult(null);

    if (!file) return;

    if (type === "resume") {
      if (!file.name.toLowerCase().endsWith(".pdf")) {
        setResume(null);
        event.target.value = "";
        setError("Please choose a resume in PDF format.");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setResume(null);
        event.target.value = "";
        setError("Your resume must be 5 MB or smaller.");
        return;
      }

      setResume(file);
    } else {
      const name = file.name.toLowerCase();

      if (!name.endsWith(".pdf") && !name.endsWith(".txt")) {
        setJdFile(null);
        event.target.value = "";
        setError("Please choose a PDF or TXT job description.");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setJdFile(null);
        event.target.value = "";
        setError("The job description file must be 5 MB or smaller.");
        return;
      }

      setJdFile(file);
    }
  }

  const matchedSkills = Array.isArray(result?.matched_skills)
    ? result.matched_skills
    : [];

  const missingSkills = Array.isArray(result?.missing_skills)
    ? result.missing_skills
    : [];

  const suggestions = Array.isArray(result?.suggestions)
    ? result.suggestions
    : [];

  const semanticScore = Math.max(
    0,
    Math.min(
      100,
      Number(
        result?.semantic_similarity_score ?? result?.match_score ?? 0
      ) || 0
    )
  );

  const skillScore =
    result?.skill_match_percentage == null
      ? null
      : Math.max(
          0,
          Math.min(100, Number(result.skill_match_percentage) || 0)
        );

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#home">
          <div className="brand-icon">
            <BrainCircuit size={25} />
          </div>
          <span>
            Skill<span className="brand-accent">Sync</span>
          </span>
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

            <h1>
              Make your next move <span>count.</span>
            </h1>

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

                <div
                  className="upload-box"
                  role="button"
                  tabIndex={0}
                  onClick={() => resumeInputRef.current?.click()}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      resumeInputRef.current?.click();
                    }
                  }}
                >
                  <input
                    ref={resumeInputRef}
                    id="resume-upload"
                    type="file"
                    hidden
                    accept=".pdf,application/pdf"
                    onChange={(event) => selectFile(event, "resume")}
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

                  <button
                    className="browse-button"
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      resumeInputRef.current?.click();
                    }}
                  >
                    {resume ? "Change" : "Browse"}
                  </button>
                </div>
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
                    className={
                      jdMode === "text"
                        ? "mode-button selected"
                        : "mode-button"
                    }
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
                    className={
                      jdMode === "file"
                        ? "mode-button selected"
                        : "mode-button"
                    }
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
                      placeholder={`Paste the job description here...

Example:
We are looking for a Python developer with knowledge of machine learning, SQL, and REST APIs...`}
                      rows={9}
                      maxLength={30000}
                    />

                    <div className="textarea-footer">
                      <span>
                        Include responsibilities and required skills.
                      </span>
                      <span>{jobDescription.length}/30000</span>
                    </div>
                  </div>
                ) : (
                  <div
                    className="upload-box jd-upload-box"
                    role="button"
                    tabIndex={0}
                    onClick={() => jdInputRef.current?.click()}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        jdInputRef.current?.click();
                      }
                    }}
                  >
                    <input
                      ref={jdInputRef}
                      id="jd-upload"
                      type="file"
                      hidden
                      accept=".pdf,.txt,application/pdf,text/plain"
                      onChange={(event) => selectFile(event, "jd")}
                    />

                    <div className="upload-icon">
                      <FileText size={22} />
                    </div>

                    <div className="upload-text">
                      <strong>
                        {jdFile
                          ? jdFile.name
                          : "Upload job description"}
                      </strong>
                      <span>
                        {jdFile
                          ? `${(jdFile.size / (1024 * 1024)).toFixed(2)} MB`
                          : "PDF or TXT · Maximum 5 MB"}
                      </span>
                    </div>

                    <button
                      className="browse-button"
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        jdInputRef.current?.click();
                      }}
                    >
                      {jdFile ? "Change" : "Browse"}
                    </button>
                  </div>
                )}
              </div>

              {error && (
                <div className="error-message" role="alert">
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              <button
                className="analyze-button"
                type="submit"
                disabled={loading}
              >
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
                  <p>
                    Use the configured model to estimate semantic text
                    similarity.
                  </p>
                </div>
              </div>

              <div className="process-connector" />

              <div className="process-step">
                <div className="process-icon green">
                  <Target size={20} />
                </div>
                <div>
                  <h3>Discover skill gaps</h3>
                  <p>
                    See detected skills and suggestions for improvement.
                  </p>
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
                projects and experience rather than adding skills you do not
                have.
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
                  Results for <strong>{result.filename || resume?.name}</strong>
                </p>
              </div>

              <button
                className="reset-button"
                onClick={resetForm}
                type="button"
              >
                <RotateCcw size={16} />
                New analysis
              </button>
            </div>

            <div className="result-overview">
              <div className="score-card">
                <div
                  className="score-ring"
                  style={{
                    "--score": `${Math.max(
                      0,
                      Math.min(100, Number(result.match_score) || 0)
                    )}%`,
                  }}
                >
                  <div className="score-inner">
                    <strong>
                      {Math.round(Number(result.match_score) || 0)}%
                    </strong>
                    <span>Overall match</span>
                  </div>
                </div>

                <div className="score-description">
                  <h3>Overall resume match</h3>
                  <p>
                    This score reflects the matching method configured in the
                    backend. It is not your probability of getting hired.
                  </p>
                </div>
              </div>

              <div className="mini-result-card">
                <div className="mini-result-icon green">
                  <CheckCircle2 size={21} />
                </div>
                <span>Matched skills</span>
                <strong>{matchedSkills.length}</strong>
              </div>

              <div className="mini-result-card">
                <div className="mini-result-icon red">
                  <XCircle size={21} />
                </div>
                <span>Missing skills</span>
                <strong>{missingSkills.length}</strong>
              </div>
            </div>

            <div className="panel score-breakdown-panel">
              <div className="skills-title purple-text">
                <BrainCircuit size={21} />
                <h3>AI Score Breakdown</h3>
              </div>

              <p className="skills-description">
                Understand the two measurements returned by your analyzer.
              </p>

              <div className="breakdown-item">
                <div className="breakdown-label">
                  <span>Semantic similarity</span>
                  <strong>{Math.round(semanticScore)}%</strong>
                </div>

                <div
                  className="breakdown-track"
                  role="progressbar"
                  aria-label="Semantic similarity"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={semanticScore}
                >
                  <div
                    className="breakdown-fill semantic-fill"
                    style={{ width: `${semanticScore}%` }}
                  />
                </div>

                <p>
                  Measures how closely the resume and job description relate
                  in meaning.
                </p>
              </div>

              <div className="breakdown-item">
                <div className="breakdown-label">
                  <span>Required-skill coverage</span>
                  <strong>
                    {skillScore === null
                      ? "N/A"
                      : `${Math.round(skillScore)}%`}
                  </strong>
                </div>

                <div
                  className="breakdown-track"
                  role="progressbar"
                  aria-label="Required-skill coverage"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={skillScore ?? 0}
                >
                  <div
                    className="breakdown-fill skills-fill"
                    style={{ width: `${skillScore ?? 0}%` }}
                  />
                </div>

                <p>
                  Measures the percentage of recognized job skills found in
                  your resume.
                </p>
              </div>

              <div className="breakdown-note">
                <Lightbulb size={17} />
                <span>
                  {skillScore === null
                    ? "No recognized required skills were detected, or the backend did not return a skill coverage score. Check the original job description."
                    : "Your backend may combine semantic similarity (60%) and skill coverage (40%). Check backend/main.py to confirm the configured formula."}
                </span>
              </div>
            </div>

            <div className="skills-grid">
              <div className="panel skills-panel">
                <div className="skills-heading">
                  <div className="skills-title green-text">
                    <CheckCircle2 size={20} />
                    <h3>Matched skills</h3>
                  </div>
                  <span className="skill-count">{matchedSkills.length}</span>
                </div>

                <p className="skills-description">
                  Skills detected in both your resume and the job description.
                </p>

                <div className="skill-tags">
                  {matchedSkills.length ? (
                    matchedSkills.map((skill) => (
                      <span className="skill-tag matched" key={skill}>
                        <CheckCircle2 size={13} />
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="empty-state">
                      No matching skills were detected by the current
                      dictionary.
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
                  <span className="skill-count">{missingSkills.length}</span>
                </div>

                <p className="skills-description">
                  Recognized job skills not detected in your resume.
                </p>

                <div className="skill-tags">
                  {missingSkills.length ? (
                    missingSkills.map((skill) => (
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

            {/* OPTION 2: PERSONALIZED LEARNING ROADMAP */}
            <div className="panel roadmap-panel">
              <div className="skills-title purple-text">
                <GraduationCap size={21} />
                <h3>Your personalized learning roadmap</h3>
              </div>

              <p className="skills-description">
                A practical starting plan based on the skills detected as
                missing for this job. Adjust it to your level and available
                time.
              </p>

              <div className="roadmap-list">
                {getLearningRoadmap(missingSkills).map((item, index) => (
                  <div
                    className="roadmap-item"
                    key={`${item.title}-${index}`}
                  >
                    <span className="roadmap-step">{index + 1}</span>
                    <div>
                      <h4>{item.title}</h4>
                      <p>{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>

              <p className="result-disclaimer">
                This roadmap is a suggested study plan based on detected
                skills, not a guarantee of job readiness.
              </p>
            </div>

            {/* OPTION 3: TARGETED RESUME IMPROVEMENTS */}
            <div className="panel resume-actions-panel">
              <div className="skills-title purple-text">
                <ListChecks size={21} />
                <h3>Resume improvements for this job</h3>
              </div>

              <p className="skills-description">
                Make relevant experience clearer without claiming skills or
                achievements you do not have.
              </p>

              <div className="resume-actions-list">
                {getResumeActions(
                  matchedSkills,
                  missingSkills,
                  suggestions
                ).map((item, index) => (
                  <div
                    className="resume-action-item"
                    key={`${item.title}-${index}`}
                  >
                    <div className="resume-action-number">{index + 1}</div>
                    <div>
                      <h4>{item.title}</h4>
                      <p>{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel suggestions-panel">
              <div className="skills-title purple-text">
                <Lightbulb size={21} />
                <h3>Suggestions to improve</h3>
              </div>

              <div className="suggestion-list">
                {suggestions.length ? (
                  suggestions.map((suggestion, index) => (
                    <div className="suggestion-item" key={index}>
                      <span className="suggestion-number">{index + 1}</span>
                      <p>{suggestion}</p>
                    </div>
                  ))
                ) : (
                  <p className="empty-state">
                    No additional suggestions were returned by the backend.
                  </p>
                )}
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
          <span>
            AI-powered resume matching · Built for smarter applications
          </span>
        </footer>
      </main>
    </div>
  );
}

export default App;
