import React from "react";
import { Routes,
  Route,
  NavLink,
  useLocation,
  useNavigate
} from "react-router-dom";

import "./styles.css";

import ReportIssue from "./pages/ReportIssue";
import PhotoEvidence from "./pages/PhotoEvidence";
import Analysis from "./pages/Analysis";
import CivicReport from "./pages/CivicReport";
import ExploreIssues from "./pages/ExploreIssues";
import Analytics from "./pages/Analytics";
import History from "./pages/History";

function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();

  const links = [
    { path: "/", label: "Home", icon: "Ã¢Å’â€š" },
    { path: "/report", label: "Report", icon: "Ã¯Â¼â€¹" },
    { path: "/explore", label: "Explore", icon: "Ã¢Å’-" },
    { path: "/analytics", label: "Analytics", icon: "Ã¢-Â«" },
    { path: "/history", label: "History", icon: "Ã¢-Â£" }
  ];

  return (
    <>
      <header className="topbar">
        <button
          className="brand"
          onClick={() => navigate("/")}
        >
          <span className="brand-mark">
            Ã¢Å“Â¦
          </span>

          <span>
            <strong>CityPulse</strong>
            <small>AI</small>
          </span>
        </button>

        <nav className="desktop-nav">
          {links.map(link => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === "/"}
              className={({ isActive }) =>
                isActive ? "active" : ""
              }
            >
              <span>{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <button
          className="report-top-button"
          onClick={() =>
            navigate("/report")
          }
        >
          Report Issue
        </button>
      </header>

      <nav className="mobile-nav">
        {links.map(link => (
          <NavLink
            key={link.path}
            to={link.path}
            end={link.path === "/"}
          >
            <span>{link.icon}</span>
            <small>{link.label}</small>
          </NavLink>
        ))}
      </nav>

      <div className="citypulse-route-status">
        <span className="status-dot" />
        <span>
          {location.pathname === "/"
            ? "CityPulse ready"
            : "Civic intelligence active"}
        </span>
      </div>
    </>
  );
}

function Home() {
  const navigate = useNavigate();

  return (
    <main className="home-page">
      <section className="hero-section">
        <div className="hero-copy">
          <span className="eyebrow">
            AI-POWERED CIVIC INTELLIGENCE
          </span>

          <h1>
            Make your city
            <br />
            <em>better, together.</em>
          </h1>

          <p>
            Capture civic problems with your camera,
            let AI analyze the evidence, and create
            a structured report ready for action.
          </p>

          <div className="hero-actions">
            <button
              className="btn primary large"
              onClick={() =>
                navigate("/report")
              }
            >
              Report an Issue Ã¢â€ â€™
            </button>

            <button
              className="btn secondary large"
              onClick={() =>
                navigate("/explore")
              }
            >
              Explore City
            </button>
          </div>
        </div>

        <div className="hero-visual">
          <div className="city-orbit">
            <div className="orbit-center">
              <span>Ã¢Å“Â¦</span>
              <strong>AI</strong>
            </div>

            <div className="orbit-node node-one">
              Ã°Å¸â€œÂ·
            </div>

            <div className="orbit-node node-two">
              Ã¢Å’-
            </div>

            <div className="orbit-node node-three">
              Ã¢Å“â€œ
            </div>
          </div>
        </div>
      </section>

      <section className="feature-strip">
        <div>
          <span>01</span>
          <strong>Capture</strong>
          <p>
            Camera or gallery evidence.
          </p>
        </div>

        <div>
          <span>02</span>
          <strong>Analyze</strong>
          <p>
            Gemini AI understands the issue.
          </p>
        </div>

        <div>
          <span>03</span>
          <strong>Report</strong>
          <p>
            Generate a civic-ready report.
          </p>
        </div>

        <div>
          <span>04</span>
          <strong>Track</strong>
          <p>
            Follow issues and city trends.
          </p>
        </div>
      </section>
    </main>
  );
}

function NotFound() {
  const navigate = useNavigate();

  return (
    <main className="page-shell">
      <section className="empty-state large-empty">
        <div>404</div>
        <h1>Page not found</h1>
        <p>
          The CityPulse route does not exist.
        </p>

        <button
          className="btn primary"
          onClick={() => navigate("/")}
        >
          Back Home
        </button>
      </section>
    </main>
  );
}

function App() {
  return (
    <><Navigation />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/report"
          element={<ReportIssue />}
        />
        <Route
          path="/photo"
          element={<PhotoEvidence />}
        />
        <Route
          path="/analysis"
          element={<Analysis />}
        />
        <Route
          path="/civic-report"
          element={<CivicReport />}
        />
        <Route
          path="/explore"
          element={<ExploreIssues />}
        />
        <Route
          path="/analytics"
          element={<Analytics />}
        />
        <Route
          path="/history"
          element={<History />}
        />
        <Route
          path="*"
          element={<NotFound />}
        />
      </Routes>
    </> 
  );
}

export default App;
