import "./styles/share-center.css";
import "./styles/offline-report.css";
import "./styles/analytics-live.css";
import "./styles/report-pipeline.css";
import "./styles/report-flow.css";
import OfflineBanner from "./components/OfflineBanner";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <><OfflineBanner /><App /></>
    </BrowserRouter>
  </React.StrictMode>
);





import { startAutoSync } from "./services/reportAutoSync.js";
startAutoSync();



